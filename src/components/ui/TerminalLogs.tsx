'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal, Copy, Trash } from 'lucide-react';

interface LogLine {
  level: string;
  message: string;
  timestamp: string;
}

interface TerminalLogsProps {
  logs: LogLine[];
  onClear?: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'SUCCESS':
        return 'text-emerald-400';
      case 'WARNING':
        return 'text-amber-400';
      case 'ERROR':
        return 'text-red-400 font-bold';
      default:
        return 'text-zinc-300';
    }
  };

  const copyToClipboard = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-[400px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 font-mono shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/40 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <Terminal className="h-4 w-4 text-violet-500" />
          <span>Real-time Winston Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={copyToClipboard}
            className="rounded-lg p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition"
            title="Copy Logs"
          >
            <Copy className="h-4 w-4" />
          </button>
          {onClear && (
            <button 
              onClick={onClear}
              className="rounded-lg p-1.5 hover:bg-zinc-850 text-zinc-400 hover:text-red-400 transition"
              title="Clear Terminal"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm leading-relaxed scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <span>No log output. Start the agent session to stream logs...</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 hover:bg-zinc-900/40 px-1 py-0.5 rounded transition">
              <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`shrink-0 select-none ${getLevelColor(log.level)}`}>[{log.level}]</span>
              <span className="text-zinc-200 break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
