'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { ShinyButton } from '@/components/ui/ShinyButton';
import { BorderBeamButton } from '@/components/ui/BorderBeamButton';
import { TerminalLogs } from '@/components/ui/TerminalLogs';
import { Activity, Globe, Play, Square, Eye } from 'lucide-react';
import { AgentState } from '@/lib/types/agent';

export default function Dashboard() {
  const {
    state,
    logs,
    goal,
    url,
    screenshots,
    sessionId,
    currentAction,
    setGoal,
    setUrl,
    connectWebSocket,
    disconnectWebSocket,
    startAgent,
    stopAgent,
    clearLogs
  } = useAgentStore();

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  const getStatusBadgeClass = (s: AgentState) => {
    switch (s) {
      case AgentState.IDLE:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case AgentState.COMPLETED:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case AgentState.FAILED:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20 animate-pulse';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Agent Dashboard
          </h2>
          <p className="text-zinc-500 mt-1">Control and inspect the active web automation agent.</p>
        </div>

        <div className="flex items-center gap-3">
          {state !== AgentState.IDLE && state !== AgentState.COMPLETED && state !== AgentState.FAILED ? (
            <ShinyButton onClick={stopAgent} className="hover:border-red-500/50 hover:shadow-red-500/10 hover:text-red-400">
              <Square className="h-4 w-4 inline mr-2 text-red-405" />
              Stop Agent
            </ShinyButton>
          ) : (
            <BorderBeamButton onClick={startAgent}>
              <Play className="h-4 w-4 inline mr-2 text-violet-400" />
              Start Agent
            </BorderBeamButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400 uppercase">
            <Globe className="h-4 w-4 text-violet-500" />
            <span>Agent Mission Settings</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="goal" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Objective Goal
              </label>
              <textarea
                id="goal"
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 outline-none focus:border-violet-500/50 transition"
                placeholder="Describe what the agent should do..."
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Target Website URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 outline-none focus:border-violet-500/50 transition"
                placeholder="Enter URL to navigate to..."
              />
            </div>
          </div>
        </GlassCard>

        <GlowingCard className="space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400 uppercase">
              <Activity className="h-4 w-4 text-violet-500" />
              <span>Agent Status</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">State</span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusBadgeClass(state)}`}>
                  {state}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Target URL</span>
                <span className="text-sm font-medium text-zinc-300 break-all select-all">
                  {url || 'None'}
                </span>
              </div>

              {currentAction && (
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Active Tool Action</span>
                  <span className="text-sm font-mono text-zinc-300">
                    {currentAction}
                  </span>
                </div>
              )}
            </div>
          </div>

          {sessionId && (
            <div className="pt-4 border-t border-zinc-900 text-xs text-zinc-600 flex justify-between items-center">
              <span>Session: {sessionId.slice(0, 8)}...</span>
              <Link href="/execution" className="text-violet-500 hover:text-violet-400 flex items-center gap-1 font-semibold">
                <Eye className="h-3.5 w-3.5" /> View Execution
              </Link>
            </div>
          )}
        </GlowingCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <TerminalLogs logs={logs} onClear={clearLogs} />
        </div>

        <GlassCard className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wider text-zinc-400 uppercase mb-4">
            <Globe className="h-4 w-4 text-violet-500" />
            <span>Latest Screenshot</span>
          </div>

          <div className="flex-1 flex items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden relative min-h-[220px]">
            {screenshots.length > 0 ? (
              <img
                src={screenshots[screenshots.length - 1]}
                alt="Latest browser view"
                className="absolute inset-0 w-full h-full object-cover object-top hover:scale-105 transition duration-500"
              />
            ) : (
              <span className="text-zinc-600 text-xs text-center px-4">
                Screenshots will load here once the agent begins navigation.
              </span>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
