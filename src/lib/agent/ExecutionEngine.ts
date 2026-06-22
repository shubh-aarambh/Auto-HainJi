import { Page } from 'playwright';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ToolContext } from '../tools/Tool';
import { AgentMemoryManager, AgentStep } from './AgentMemory';
import { AgentStateMachine, AgentState } from './AgentStateMachine';
import { DomDetector } from '../vision/domDetector';
import { SelectorRanker } from '../vision/selectorRanker';
import { eventBus } from '../events/EventBus';
import { AgentEvent } from '../events/AgentEvents';
import { logger } from '../logger/WinstonLogger';
import { SessionManager } from '../session/SessionManager';
import { ExponentialBackoffRetryPolicy } from '../retry/RetryPolicy';
import { Planner } from '../planner/Planner';
import { OpenAIPlanner } from '../planner/OpenAIPlanner';
import { GeminiPlanner } from '../planner/GeminiPlanner';
import { GroqPlanner } from '../planner/GroqPlanner';

export class ExecutionEngine {
  private toolRegistry = new ToolRegistry();
  private retryPolicy = new ExponentialBackoffRetryPolicy(3, 1000);
  private planner: Planner;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.planner = new GroqPlanner();
    } else if (process.env.GEMINI_API_KEY) {
      this.planner = new GeminiPlanner();
    } else {
      this.planner = new OpenAIPlanner();
    }
  }

  async run(
    sessionId: string,
    memoryManager: AgentMemoryManager,
    stateMachine: AgentStateMachine,
    launchBrowserFn: (headless: boolean) => Promise<Page>,
    closeBrowserFn: () => Promise<void>,
    getPageFn: () => Promise<Page | null>
  ): Promise<void> {
    const memory = memoryManager.getMemory();
    stateMachine.transitionTo(AgentState.EXECUTING);
    let stepIndex = 1;

    while (memory.actionQueue.length > 0 && stateMachine.getState() === AgentState.EXECUTING) {
      const currentActionObj = memory.actionQueue.shift()!;
      const { action, args } = currentActionObj;

      logger.info(`Starting execution of step ${stepIndex}: "${action}"`);
      eventBus.emit(AgentEvent.STEP_STARTED, { action, args, timestamp: new Date() });

      const startTime = Date.now();
      let stepResult: any = null;
      let finalScreenshot: string | undefined = undefined;

      const executeSingleOperation = async () => {
        let page: Page | null = null;
        try { page = await getPageFn(); } catch (_) {}

        const toolContext: ToolContext = {
          page,
          launchBrowser: launchBrowserFn,
          closeBrowser: closeBrowserFn,
          sessionId
        };

        if (args.targetLabel && page) {
          logger.info(`Action specifies targetLabel "${args.targetLabel}". Scanning DOM...`);
          stateMachine.transitionTo(AgentState.ANALYZING);
          const domElements = await DomDetector.scanPage(page);
          const matchedEl = SelectorRanker.findBestMatch(domElements, args.targetLabel, action);
          
          stateMachine.transitionTo(AgentState.EXECUTING);
          if (!matchedEl) {
            throw new Error(`Could not find interactive element matching label: "${args.targetLabel}"`);
          }

          args.selector = matchedEl.id ? `#${matchedEl.id}` : matchedEl.xpath;
          logger.info(`Resolved targetLabel "${args.targetLabel}" to selector: "${args.selector}"`);
        }

        const res = await this.toolRegistry.execute(action, args, toolContext);
        if (!res.success) {
          throw new Error(res.message);
        }

        const pageAfter = await getPageFn();
        if (pageAfter) {
          // If this is the final action, wait for AJAX/navigation to load and render the results
          if (memory.actionQueue.length === 0) {
            logger.info('Final step executed. Waiting 3 seconds for page updates to settle before capturing final screenshot...');
            await pageAfter.waitForTimeout(3000);
          }
          const screenshotRes = await this.toolRegistry.execute('take_screenshot', {
            name: `${action}_step_${stepIndex}_${Date.now()}`
          }, toolContext);
          if (screenshotRes.success && screenshotRes.screenshotPath) {
            finalScreenshot = screenshotRes.screenshotPath;
            memoryManager.addScreenshot(finalScreenshot);
          }
        }

        return res;
      };

      try {
        stepResult = await this.retryPolicy.execute(
          executeSingleOperation,
          (attempt) => {
            stateMachine.transitionTo(AgentState.RETRYING);
            memoryManager.incrementRetries();
          }
        );

        memoryManager.resetRetries();
        stateMachine.transitionTo(AgentState.EXECUTING);

        const duration = Date.now() - startTime;
        const completedStep: AgentStep = {
          id: `step_${stepIndex}_${Date.now()}`,
          timestamp: new Date(),
          action,
          status: 'SUCCESS',
          screenshot: finalScreenshot,
          duration,
          retries: memory.retries
        };

        memoryManager.addCompletedStep(completedStep);
        logger.success(`Step ${stepIndex} completed successfully: ${stepResult.message}`);
        eventBus.emit(AgentEvent.STEP_COMPLETED, completedStep);

        await SessionManager.saveStep({
          sessionId,
          action,
          status: 'SUCCESS',
          duration,
          retries: completedStep.retries,
          screenshot: finalScreenshot
        });

      } catch (error: any) {
        const duration = Date.now() - startTime;
        logger.error(`Step ${stepIndex} failed permanently: ${error.message || error}`);

        const failedStep: AgentStep = {
          id: `step_${stepIndex}_${Date.now()}`,
          timestamp: new Date(),
          action,
          status: 'FAILED',
          screenshot: finalScreenshot,
          duration,
          retries: 3
        };

        memoryManager.addFailedStep(failedStep);
        eventBus.emit(AgentEvent.ERROR, { error, step: failedStep });

        await SessionManager.saveStep({
          sessionId,
          action,
          status: 'FAILED',
          duration,
          retries: 3,
          screenshot: finalScreenshot
        });

        logger.info('Action failed. Querying AI Planner for recovery path...');
        stateMachine.transitionTo(AgentState.ANALYZING);

        const page = await getPageFn();
        if (page) {
          const domElements = await DomDetector.scanPage(page);
          const recoveryActions = await this.planner.recover(memory.sessionId, memory, domElements, finalScreenshot);
          
          if (recoveryActions && recoveryActions.length > 0) {
            logger.info(`AI Planner proposed ${recoveryActions.length} recovery actions: ${JSON.stringify(recoveryActions)}`);
            const mapped = recoveryActions.map(act => ({ action: act.action, args: act.args }));
            memory.actionQueue.unshift(...mapped);
            stateMachine.transitionTo(AgentState.EXECUTING);
          } else {
            logger.error('AI Planner failed to propose any recovery actions. Terminating session.');
            stateMachine.transitionTo(AgentState.FAILED);
            return;
          }
        } else {
          logger.error('No page context available for AI recovery planning. Terminating session.');
          stateMachine.transitionTo(AgentState.FAILED);
          return;
        }
      }

      stepIndex++;
    }

    if (stateMachine.getState() === AgentState.EXECUTING) {
      stateMachine.transitionTo(AgentState.COMPLETED);
    }
  }
}
