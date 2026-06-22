import { AgentState } from './AgentStateMachine';

export interface AgentStep {
  id: string;
  timestamp: Date;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING';
  screenshot?: string;
  duration: number;
  retries: number;
}

export interface AgentMemory {
  sessionId: string;
  currentUrl: string;
  currentState: AgentState;
  retries: number;
  actionQueue: Array<{ action: string; args: any }>;
  screenshots: string[];
  completedSteps: AgentStep[];
  failedSteps: AgentStep[];
  context: Record<string, any>;
}

export class AgentMemoryManager {
  private memory: AgentMemory;

  constructor(sessionId: string) {
    this.memory = {
      sessionId,
      currentUrl: '',
      currentState: AgentState.IDLE,
      retries: 0,
      actionQueue: [],
      screenshots: [],
      completedSteps: [],
      failedSteps: [],
      context: {}
    };
  }

  getMemory(): AgentMemory {
    return this.memory;
  }

  updateUrl(url: string) {
    this.memory.currentUrl = url;
  }

  updateState(state: AgentState) {
    this.memory.currentState = state;
  }

  incrementRetries() {
    this.memory.retries++;
  }

  resetRetries() {
    this.memory.retries = 0;
  }

  setActionQueue(queue: Array<{ action: string; args: any }>) {
    this.memory.actionQueue = queue;
  }

  addScreenshot(screenshotPath: string) {
    if (!this.memory.screenshots.includes(screenshotPath)) {
      this.memory.screenshots.push(screenshotPath);
    }
  }

  addCompletedStep(step: AgentStep) {
    this.memory.completedSteps.push(step);
  }

  addFailedStep(step: AgentStep) {
    this.memory.failedSteps.push(step);
  }

  setContextValue(key: string, value: any) {
    this.memory.context[key] = value;
  }

  getContextValue<T>(key: string): T | undefined {
    return this.memory.context[key] as T;
  }
}
