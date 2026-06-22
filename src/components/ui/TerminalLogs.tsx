'use client';

import React, { useEffect, useRef } from 'react';
import { Activity, Copy, Trash } from 'lucide-react';

interface LogLine {
  level: string;
  message: string;
  timestamp: string;
}

interface TerminalLogsProps {
  logs: LogLine[];
  onClear?: () => void;
  className?: string;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear, className = '' }) => {
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
        return 'text-rose-400';
      default:
        return 'text-zinc-400';
    }
  };

  const copyToClipboard = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`flex flex-col w-full rounded-3xl border border-zinc-800 bg-[#050505] font-mono shadow-2xl overflow-hidden ${className}`}>
      {/* Sleek Telemetry Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#0a0a0a] px-5 py-3 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-zinc-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Live Telemetry</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
          >
            <Copy className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Copy</span>
          </button>
          {onClear && (
            <button 
              onClick={onClear}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition"
            >
              <Trash className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Purge</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-2 text-[12px] leading-relaxed scrollbar-thin relative z-0">
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <span className="animate-pulse uppercase tracking-widest text-[10px] font-bold">Awaiting telemetry stream...</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-4 hover:bg-zinc-900/80 px-3 py-1.5 rounded-lg transition group border-l-2 border-transparent hover:border-zinc-700">
              <span className="text-zinc-600 shrink-0 select-none font-bold">{log.timestamp}</span>
              <span className={`shrink-0 select-none font-bold uppercase tracking-wider text-[10px] mt-0.5 w-16 ${getLevelColor(log.level)}`}>{log.level}</span>
              <span className="text-zinc-300 break-words group-hover:text-zinc-100 transition flex-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

