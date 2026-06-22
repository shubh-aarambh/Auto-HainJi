'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { TerminalLogs } from '@/components/ui/TerminalLogs';
import { Play, Square, Crosshair, Link as LinkIcon, Activity, ImageIcon } from 'lucide-react';
import { AgentState } from '@/lib/types/agent';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const {
    state, logs, goal, url, screenshots, sessionId, currentAction,
    setGoal, setUrl, connectWebSocket, disconnectWebSocket,
    startAgent, stopAgent, clearLogs
  } = useAgentStore();

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  const isRunning = state !== AgentState.IDLE && state !== AgentState.COMPLETED && state !== AgentState.FAILED;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
            Command Center
          </h2>
          <p className="text-slate-400 font-medium tracking-wide mt-1">
            System initialization complete. Awaiting directives.
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Activity className={`h-5 w-5 ${isRunning ? 'text-zinc-300 animate-pulse' : 'text-zinc-600'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {state}
          </span>
        </div>
      </div>

      {/* Main Terminal Window (Hero) */}
      <div className="flex-1 relative z-10 flex flex-col min-h-0 max-h-[60vh] lg:max-h-[500px]">
        <TerminalLogs logs={logs} onClear={clearLogs} className="border border-zinc-800 flex-1 min-h-0" />
        
        {/* Floating Screenshot Preview inside Terminal area */}
        <AnimatePresence>
          {screenshots.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute bottom-6 right-6 w-72 aspect-video rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950"
            >
              <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Live View
                </span>
                {currentAction && (
                  <span className="text-[10px] text-zinc-400 mt-2 font-mono text-center px-4">
                    {currentAction}
                  </span>
                )}
              </div>
              <img 
                src={screenshots[screenshots.length - 1]} 
                alt="Agent view" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Deck (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Inputs */}
        <div className="col-span-1 lg:col-span-9 flex flex-col md:flex-row gap-4 p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex-1 flex items-center gap-3 bg-zinc-950 rounded-2xl px-4 py-3 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
            <Crosshair className="h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter objective..."
              className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 font-medium"
            />
          </div>
          
          <div className="flex-1 flex items-center gap-3 bg-zinc-950 rounded-2xl px-4 py-3 border border-zinc-800 focus-within:border-zinc-600 transition-colors">
            <LinkIcon className="h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Target URL (e.g. https://google.com)"
              className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-600 font-medium"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="col-span-1 lg:col-span-3">
          {isRunning ? (
            <button 
              onClick={stopAgent}
              className="w-full h-full min-h-[64px] rounded-3xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
            >
              <Square className="h-5 w-5 fill-current" /> Terminate
            </button>
          ) : (
            <button 
              onClick={startAgent}
              className="w-full h-full min-h-[64px] rounded-3xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm bg-zinc-100 text-zinc-900 hover:bg-white hover:scale-[1.02] transition-all active:scale-95"
            >
              <Play className="h-5 w-5 fill-current" /> Execute
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

