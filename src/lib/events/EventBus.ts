import { EventEmitter } from 'events';

class AgentEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
  }
}

export const eventBus = new AgentEventBus();
