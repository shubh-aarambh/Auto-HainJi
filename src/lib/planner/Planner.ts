import { AgentMemory } from '../agent/AgentMemory';
import { InteractiveElement } from '../vision/domDetector';

export interface ActionProposal {
  action: string;
  args: Record<string, any>;
  reason: string;
}

export interface Planner {
  recover(
    goal: string,
    memory: AgentMemory,
    domElements: InteractiveElement[],
    screenshotPath?: string
  ): Promise<ActionProposal[]>;
}
