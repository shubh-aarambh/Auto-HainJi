import { eventBus } from '../events/EventBus';
import { AgentEvent } from '../events/AgentEvents';
import { logger } from '../logger/WinstonLogger';
import { AgentState } from '../types/agent';

export { AgentState };

export class AgentStateMachine {
  private currentState: AgentState = AgentState.IDLE;

  getState(): AgentState {
    return this.currentState;
  }

  transitionTo(newState: AgentState) {
    if (this.currentState === newState) return;
    const oldState = this.currentState;
    this.currentState = newState;
    logger.info(`State transition: ${oldState} -> ${newState}`);
    eventBus.emit(AgentEvent.STATE_CHANGED, { oldState, newState });
  }

  reset() {
    this.currentState = AgentState.IDLE;
  }
}
