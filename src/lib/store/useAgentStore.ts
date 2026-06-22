import { create } from 'zustand';
import { AgentState } from '../types/agent';

interface LogLine {
  level: string;
  message: string;
  timestamp: string;
}

interface AgentStore {
  state: AgentState;
  logs: LogLine[];
  sessionId: string | null;
  goal: string;
  url: string;
  screenshots: string[];
  steps: any[];
  currentAction: string;
  socket: WebSocket | null;
  pollingIntervalId: any;
  startPolling: (sid: string) => void;
  stopPolling: () => void;

  setGoal: (goal: string) => void;
  setUrl: (url: string) => void;
  clearLogs: () => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  startAgent: () => Promise<void>;
  stopAgent: () => Promise<void>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  state: AgentState.IDLE,
  logs: [],
  sessionId: null,
  goal: 'Open website and fill Name: John Doe, Description: Testing the updated automation agent.',
  url: 'https://ui.shadcn.com/docs/forms/react-hook-form',
  screenshots: [],
  steps: [],
  currentAction: '',
  socket: null,
  pollingIntervalId: null,

  setGoal: (goal) => set({ goal }),
  setUrl: (url) => set({ url }),
  clearLogs: () => set({ logs: [] }),

  startPolling: (sid) => {
    get().stopPolling();
    const interval = setInterval(async () => {
      try {
        const sessionRes = await fetch(`/api/session/${sid}`);
        const sessionData = await sessionRes.json();
        if (sessionRes.ok && sessionData.success) {
          const sess = sessionData.session;
          const completedSteps = sess.steps || [];
          const sessionState = sess.status as AgentState;
          const screenshots = completedSteps.map((s: any) => s.screenshot).filter(Boolean);
          
          set({
            state: sessionState,
            steps: completedSteps,
            screenshots: screenshots,
            currentAction: completedSteps[completedSteps.length - 1]?.action || ''
          });

          if (sessionState === AgentState.COMPLETED || sessionState === AgentState.FAILED) {
            get().stopPolling();
          }
        }

        const logsRes = await fetch('/api/logs');
        const logsData = await logsRes.json();
        if (logsRes.ok && logsData.logs) {
          const lines = logsData.logs.trim().split('\n').map((line: string) => {
            const match = line.match(/^\[(.*?)\]\s+\[(.*?)\]:\s+(.*)$/);
            if (match) {
              return {
                timestamp: match[1],
                level: match[2],
                message: match[3]
              };
            }
            return {
              timestamp: '',
              level: 'INFO',
              message: line
            };
          });
          set({ logs: lines });
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 1500);

    set({ pollingIntervalId: interval });
  },

  stopPolling: () => {
    const interval = get().pollingIntervalId;
    if (interval) {
      clearInterval(interval);
      set({ pollingIntervalId: null });
    }
  },

  connectWebSocket: () => {
    if (get().socket) return;

    const ws = new WebSocket('ws://localhost:4001');

    ws.onopen = () => {
      console.log('Connected to AutoPilot agent WebSocket gateway.');
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const { event: evType, data } = payload;

      switch (evType) {
        case 'sync':
          set({
            state: data.state,
            screenshots: data.memory?.screenshots || [],
            steps: data.memory?.completedSteps || [],
            sessionId: data.memory?.sessionId || null
          });
          if (data.memory?.sessionId && 
              data.state !== AgentState.IDLE && 
              data.state !== AgentState.COMPLETED && 
              data.state !== AgentState.FAILED) {
            get().startPolling(data.memory.sessionId);
          }
          break;
        case 'state_changed':
          set({ state: data.newState });
          break;
        case 'step_started':
          set({ currentAction: data.action });
          break;
        case 'step_completed':
          set((prev) => ({
            steps: [...prev.steps, data],
            screenshots: data.screenshot ? [...prev.screenshots, data.screenshot] : prev.screenshots
          }));
          break;
        case 'log_added':
          set((prev) => ({ logs: [...prev.logs, data] }));
          break;
        case 'session_created':
          set({
            sessionId: data.sessionId,
            steps: [],
            screenshots: [],
            state: AgentState.STARTING
          });
          get().startPolling(data.sessionId);
          break;
        case 'session_finished':
          set({ state: data.status, currentAction: '' });
          get().stopPolling();
          break;
      }
    };

    ws.onclose = () => {
      console.log('Agent WebSocket closed.');
      set({ socket: null });
      setTimeout(() => get().connectWebSocket(), 3000);
    };

    set({ socket: ws });
  },

  disconnectWebSocket: () => {
    get().stopPolling();
    const ws = get().socket;
    if (ws) {
      ws.close();
      set({ socket: null });
    }
  },

  startAgent: async () => {
    const { goal, url } = get();
    try {
      set({ logs: [], steps: [], screenshots: [], state: AgentState.STARTING });
      const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set({ sessionId: data.sessionId });
      get().startPolling(data.sessionId);
    } catch (err: any) {
      set((prev) => ({
        state: AgentState.FAILED,
        logs: [
          ...prev.logs,
          { level: 'ERROR', message: `Start failed: ${err.message}`, timestamp: new Date().toLocaleTimeString() }
        ]
      }));
    }
  },

  stopAgent: async () => {
    try {
      await fetch('/api/stop', { method: 'POST' });
      set({ state: AgentState.FAILED, currentAction: '' });
      get().stopPolling();
    } catch (err) {
      console.error(err);
    }
  }
}));
