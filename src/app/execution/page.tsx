'use client';

import React, { useEffect } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { AgentState } from '@/lib/types/agent';

export default function ExecutionPage() {
  const {
    state,
    steps,
    screenshots,
    currentAction,
    connectWebSocket,
    disconnectWebSocket
  } = useAgentStore();

  useEffect(() => {
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [connectWebSocket, disconnectWebSocket]);

  const workflowNodes = [
    { key: 'open_browser', name: 'Open browser session' },
    { key: 'navigate_to_url', name: 'Navigate to target URL' },
    { key: 'send_keys_name', name: 'Identify & fill Name field' },
    { key: 'send_keys_description', name: 'Identify & fill Description field' },
    { key: 'click_on_screen_submit', name: 'Submit form' }
  ];

  const getNodeStatus = (nodeKey: string) => {
    const isCompleted = steps.some(
      (s) =>
        (nodeKey === 'open_browser' && s.id?.startsWith('step_1_')) ||
        (nodeKey === 'navigate_to_url' && s.id?.startsWith('step_2_')) ||
        (nodeKey === 'send_keys_name' && s.id?.startsWith('step_3_')) ||
        (nodeKey === 'send_keys_description' && s.id?.startsWith('step_4_')) ||
        (nodeKey === 'click_on_screen_submit' && s.id?.startsWith('step_5_'))
    );

    const isFailed = steps.some(
      (s) =>
        s.status === 'FAILED' &&
        ((nodeKey === 'open_browser' && s.id?.startsWith('step_1_')) ||
          (nodeKey === 'navigate_to_url' && s.id?.startsWith('step_2_')) ||
          (nodeKey === 'send_keys_name' && s.id?.startsWith('step_3_')) ||
          (nodeKey === 'send_keys_description' && s.id?.startsWith('step_4_')) ||
          (nodeKey === 'click_on_screen_submit' && s.id?.startsWith('step_5_')))
    );

    if (isCompleted) return 'success';
    if (isFailed) return 'error';

    const isActiveAction =
      (nodeKey === 'open_browser' && currentAction === 'open_browser') ||
      (nodeKey === 'navigate_to_url' && currentAction === 'navigate_to_url') ||
      (nodeKey === 'send_keys_name' && currentAction === 'send_keys' && steps.length === 2) ||
      (nodeKey === 'send_keys_description' && currentAction === 'send_keys' && steps.length === 3) ||
      (nodeKey === 'click_on_screen_submit' && currentAction === 'click_on_screen' && steps.length === 4);

    if (isActiveAction || (nodeKey === 'open_browser' && state === AgentState.STARTING)) {
      return 'running';
    }

    return 'pending';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
          Live Agent Run
        </h2>
        <p className="text-zinc-500 mt-1">Track the live agent operations and browser views node-by-node.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5">
          <GlassCard className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <span className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Workflow Trace
              </span>
              <span className="text-xs text-zinc-500 font-medium font-mono uppercase bg-zinc-900/50 px-2.5 py-1 rounded-full border border-zinc-800">
                {state}
              </span>
            </div>

            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[31px] top-4 bottom-4 w-px bg-zinc-800" />

              {workflowNodes.map((node, index) => {
                const status = getNodeStatus(node.key);
                return (
                  <div key={index} className="relative flex items-center gap-4">
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-955 border border-zinc-800 shadow-md">
                      {status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      )}
                      {status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {status === 'running' && (
                        <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                      )}
                      {status === 'pending' && (
                        <div className="h-2 w-2 rounded-full bg-zinc-700" />
                      )}
                    </div>

                    <div>
                      <p className={`text-sm font-medium ${status === 'running' ? 'text-violet-400 font-semibold' : status === 'pending' ? 'text-zinc-500' : 'text-zinc-300'}`}>
                        {node.name}
                      </p>
                      {status === 'running' && (
                        <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest animate-pulse">
                          running...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="md:col-span-7 h-full">
          <GlowingCard className="h-full flex flex-col justify-between min-h-[420px] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Active Browser Screen View
              </span>
              <span className="text-xs text-zinc-500">
                {screenshots.length} screenshot(s)
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden relative w-full h-[320px]">
              {screenshots.length > 0 ? (
                <img
                  src={screenshots[screenshots.length - 1]}
                  alt="Active Browser Frame"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="text-center px-4 space-y-2">
                  <Loader2 className="h-8 w-8 text-zinc-700 animate-spin mx-auto" />
                  <p className="text-zinc-650 text-xs">
                    Waiting for browser session navigation to render screenshots...
                  </p>
                </div>
              )}
            </div>
          </GlowingCard>
        </div>
      </div>
    </div>
  );
}
