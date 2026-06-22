import { WebSocketServer, WebSocket } from 'ws';
import { eventBus } from '../lib/events/EventBus';
import { AgentEvent } from '../lib/events/AgentEvents';
import { agentController } from '../lib/agent/AgentController';
import { logger } from '../lib/logger/WinstonLogger';

let wss: WebSocketServer | null = null;

export function initWebSocketServer() {
  if (wss) return wss;

  logger.info('Initializing WebSocket Server on port 3001...');
  wss = new WebSocketServer({ port: 3001 });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    logger.info('WebSocket client connected.');
    clients.add(ws);

    // Sync initial state
    ws.send(JSON.stringify({
      event: 'sync',
      data: {
        state: agentController.getState(),
        memory: agentController.getMemory()
      }
    }));

    ws.on('close', () => {
      logger.info('WebSocket client disconnected.');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      logger.error('WebSocket client connection error', err);
    });
  });

  const broadcast = (event: string, data: any) => {
    const payload = JSON.stringify({ event, data });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  };

  // Connect Agent Events to WebSockets
  eventBus.on(AgentEvent.STATE_CHANGED, (data) => broadcast('state_changed', data));
  eventBus.on(AgentEvent.STEP_STARTED, (data) => broadcast('step_started', data));
  eventBus.on(AgentEvent.STEP_COMPLETED, (data) => broadcast('step_completed', data));
  eventBus.on(AgentEvent.LOG_ADDED, (data) => broadcast('log_added', data));
  eventBus.on(AgentEvent.ERROR, (data) => broadcast('error', data));
  eventBus.on(AgentEvent.SESSION_CREATED, (data) => broadcast('session_created', data));
  eventBus.on(AgentEvent.SESSION_FINISHED, (data) => broadcast('session_finished', data));

  logger.success('WebSocket Server running on ws://localhost:3001');
  return wss;
}
