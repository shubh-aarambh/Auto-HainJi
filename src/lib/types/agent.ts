export enum AgentState {
  IDLE = 'IDLE',
  STARTING = 'STARTING',
  BROWSER_OPEN = 'BROWSER_OPEN',
  NAVIGATING = 'NAVIGATING',
  ANALYZING = 'ANALYZING',
  EXECUTING = 'EXECUTING',
  RETRYING = 'RETRYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

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

export interface ActionProposal {
  action: string;
  args: Record<string, any>;
  reason: string;
}
