'use client';

import React, { useEffect } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { TerminalLogs } from '@/components/ui/TerminalLogs';

export default function LogsPage() {
  const { logs, connectWebSocket, disconnectWebSocket, clearLogs } = useAgentStore();

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
          Winston Logs Terminal
        </h2>
        <p className="text-zinc-400 mt-1">Full terminal output logs streamed live from the agent backend process.</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <TerminalLogs logs={logs} onClear={clearLogs} className="flex-1 min-h-0 border border-zinc-800 max-h-[calc(100vh-250px)]" />
      </div>
    </div>
  );
}

