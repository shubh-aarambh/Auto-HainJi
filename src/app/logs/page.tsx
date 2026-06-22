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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
          Winston Logs Terminal
        </h2>
        <p className="text-zinc-500 mt-1">Full terminal output logs streamed live from the agent backend process.</p>
      </div>

      <div className="shadow-2xl">
        <TerminalLogs logs={logs} onClear={clearLogs} />
      </div>
    </div>
  );
}
