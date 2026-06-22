import { Page } from 'playwright';
import { BrowserManager } from '../browser/BrowserManager';
import { AgentStateMachine, AgentState } from './AgentStateMachine';
import { AgentMemoryManager } from './AgentMemory';
import { ExecutionEngine } from './ExecutionEngine';
import { SessionManager } from '../session/SessionManager';
import { logger } from '../logger/WinstonLogger';
import { eventBus } from '../events/EventBus';
import { AgentEvent } from '../events/AgentEvents';

export class AgentController {
  private browserManager: BrowserManager | null = null;
  private stateMachine = new AgentStateMachine();
  private memoryManager: AgentMemoryManager | null = null;
  private executionEngine = new ExecutionEngine();
  private currentSessionId: string | null = null;

  async start(goal: string, url: string): Promise<string> {
    const currentState = this.stateMachine.getState();
    if (currentState !== AgentState.IDLE && 
        currentState !== AgentState.COMPLETED && 
        currentState !== AgentState.FAILED) {
      throw new Error(`Agent is already active (Current State: ${currentState})`);
    }

    this.stateMachine.transitionTo(AgentState.STARTING);
    this.browserManager = new BrowserManager();

    const dbSession = await SessionManager.createSession(goal);
    this.currentSessionId = dbSession.id;

    this.memoryManager = new AgentMemoryManager(dbSession.id);
    this.memoryManager.updateUrl(url);
    this.memoryManager.updateState(AgentState.STARTING);

    eventBus.emit(AgentEvent.SESSION_CREATED, { sessionId: this.currentSessionId, goal, url });

    const parseGoalValue = (goalText: string, keyword: string, defaultValue: string): string => {
      const regexes = [
        new RegExp(`${keyword}\\s*:\\s*([^,\\.\\n]+)`, 'i'),
        new RegExp(`${keyword}\\s+is\\s+([^,\\.\\n]+)`, 'i'),
        new RegExp(`fill\\s+${keyword}\\s+with\\s+([^,\\.\\n]+)`, 'i')
      ];
      for (const rx of regexes) {
        const match = goalText.match(rx);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return defaultValue;
    };

    const compileActionQueue = (goalText: string, targetUrl: string) => {
      const queue: any[] = [
        { action: 'open_browser', args: { headless: false } },
        { action: 'navigate_to_url', args: { url: targetUrl } }
      ];

      const goalLower = goalText.toLowerCase();

      // 1. Search Goal: "Search for funny cat videos"
      const searchMatch = goalText.match(/(?:search|find)\s+(?:for\s+)?([^,\.\n]+)/i);
      if (searchMatch && searchMatch[1]) {
        const queryVal = searchMatch[1].trim();
        queue.push(
          { action: 'send_keys', args: { targetLabel: 'search', text: queryVal } },
          { action: 'click_on_screen', args: { targetLabel: 'search' } }
        );
        return queue;
      }

      // 2. Form Goal: "fill Name: Aditya..."
      if (goalLower.includes('fill') || goalLower.includes('form') || goalLower.includes('name') || goalLower.includes('description') || goalLower.includes('input') || goalLower.includes('login')) {
        const nameText = parseGoalValue(goalText, 'name', 'AutoPilot Agent');
        const descText = parseGoalValue(goalText, 'description', 'AutoPilot AI website automation agent completes this task seamlessly.');
        queue.push(
          { action: 'send_keys', args: { targetLabel: 'name', text: nameText } },
          { action: 'send_keys', args: { targetLabel: 'description', text: descText } },
          { action: 'click_on_screen', args: { targetLabel: 'submit' } }
        );
        return queue;
      }

      // 3. Simple Nav Goal (Default)
      return queue;
    };

    const actionQueue = compileActionQueue(goal, url);
    this.memoryManager.setActionQueue(actionQueue);

    // Run execution loop asynchronously in background
    this.runAgentLoop().catch(err => {
      logger.error('Unhandled agent loop error', err);
    });

    return dbSession.id;
  }

  private async runAgentLoop() {
    if (!this.currentSessionId || !this.memoryManager || !this.browserManager) return;
    const sessionId = this.currentSessionId;

    try {
      await this.executionEngine.run(
        sessionId,
        this.memoryManager,
        this.stateMachine,
        (headless) => this.browserManager!.launch(headless),
        () => this.browserManager!.close(),
        async () => {
          if (!this.browserManager) return null;
          try {
            return await this.browserManager.getPage();
          } catch (_) {
            return null;
          }
        }
      );

      const finalState = this.stateMachine.getState();
      logger.success(`Agent execution loop ended with status: ${finalState}`);
      await SessionManager.finishSession(sessionId, finalState);
      eventBus.emit(AgentEvent.SESSION_FINISHED, { sessionId, status: finalState });

    } catch (error: any) {
      logger.error('Fatal execution engine crash', error);
      this.stateMachine.transitionTo(AgentState.FAILED);
      await SessionManager.finishSession(sessionId, AgentState.FAILED);
      eventBus.emit(AgentEvent.SESSION_FINISHED, { sessionId, status: AgentState.FAILED });
    } finally {
      if (this.browserManager) {
        await this.browserManager.close();
        this.browserManager = null;
      }
      // Re-enable starting a new run by resetting machine state
    }
  }

  async stop(): Promise<void> {
    if (this.stateMachine.getState() === AgentState.IDLE || 
        this.stateMachine.getState() === AgentState.COMPLETED || 
        this.stateMachine.getState() === AgentState.FAILED) {
      return;
    }

    logger.warn('Manual stop triggered. Aborting agent run.');
    this.stateMachine.transitionTo(AgentState.FAILED);
    if (this.currentSessionId) {
      await SessionManager.finishSession(this.currentSessionId, AgentState.FAILED);
      eventBus.emit(AgentEvent.SESSION_FINISHED, { sessionId: this.currentSessionId, status: AgentState.FAILED });
    }
    if (this.browserManager) {
      await this.browserManager.close();
      this.browserManager = null;
    }
  }

  getState(): AgentState {
    return this.stateMachine.getState();
  }

  getMemory() {
    return this.memoryManager ? this.memoryManager.getMemory() : null;
  }
  
  resetStateMachine() {
    this.stateMachine.reset();
  }
}

export const agentController = new AgentController();
