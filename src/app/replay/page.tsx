'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowingCard } from '@/components/ui/GlowingCard';
import { CheckCircle2, XCircle, Calendar, ArrowRight, RefreshCw } from 'lucide-react';

interface Step {
  id: string;
  action: string;
  status: string;
  screenshot: string | null;
  duration: number;
  retries: number;
  timestamp: string;
}

interface Session {
  id: string;
  goal: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  steps: Step[];
}

export default function ReplayPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) {
        setSessions(data.history || []);
        if (data.history?.length > 0 && !selectedSession) {
          setSelectedSession(data.history[0]);
          if (data.history[0].steps?.length > 0) {
            setSelectedStep(data.history[0].steps[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    if (session.steps && session.steps.length > 0) {
      setSelectedStep(session.steps[0]);
    } else {
      setSelectedStep(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Replay History
          </h2>
          <p className="text-zinc-500 mt-1">Review past execution runs, step-by-step screenshots, and metrics.</p>
        </div>

        <button 
          onClick={fetchHistory}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Previous Runs</span>
          {sessions.length === 0 ? (
            <div className="text-center py-10 border border-zinc-900 rounded-2xl text-zinc-650 text-sm">
              No sessions found in database.
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = selectedSession?.id === sess.id;
              const date = new Date(sess.startedAt).toLocaleDateString();
              const time = new Date(sess.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all hover:bg-zinc-900/40 ${isSelected ? 'bg-zinc-900/60 border-zinc-750 shadow-lg' : 'bg-zinc-950/20 border-zinc-900'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 font-mono">
                      #{sess.id.slice(0, 8)}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusClass(sess.status)}`}>
                      {sess.status}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-zinc-200 line-clamp-1 mb-3">
                    {sess.goal}
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {date} at {time}
                    </span>
                    <span>{sess.steps?.length || 0} steps</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedSession ? (
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <GlassCard className="space-y-6">
              <div className="border-b border-zinc-900 pb-4">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                  Active Run Goal
                </span>
                <p className="text-sm font-medium text-zinc-300">
                  {selectedSession.goal}
                </p>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                  Execution steps
                </span>

                {selectedSession.steps?.length === 0 ? (
                  <div className="text-center py-6 text-zinc-650 text-xs">
                    No steps saved for this run.
                  </div>
                ) : (
                  selectedSession.steps.map((step, idx) => {
                    const isSelectedStep = selectedStep?.id === step.id;
                    const durationSec = (step.duration / 1000).toFixed(1);
                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStep(step)}
                        className={`cursor-pointer flex items-center justify-between rounded-xl border p-3 transition ${isSelectedStep ? 'bg-zinc-900/60 border-zinc-700' : 'bg-zinc-950/40 border-zinc-900 hover:bg-zinc-900/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          {step.status === 'SUCCESS' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          <div className="text-xs">
                            <p className="font-semibold text-zinc-200 uppercase tracking-wider">
                              {step.action}
                            </p>
                            <p className="text-zinc-500">Duration: {durationSec}s</p>
                          </div>
                        </div>

                        <ArrowRight className={`h-4 w-4 transition ${isSelectedStep ? 'translate-x-1 text-violet-500' : 'text-zinc-600'}`} />
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>

            <GlowingCard className="space-y-4">
              <div className="border-b border-zinc-905 pb-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Replay Screenshot Frame
                </span>
                {selectedStep && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    Step {selectedSession.steps.indexOf(selectedStep) + 1}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden relative aspect-video w-full flex items-center justify-center min-h-[220px]">
                {selectedStep?.screenshot ? (
                  <img
                    src={selectedStep.screenshot}
                    alt={`Screenshot for step ${selectedStep.action}`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center px-4">
                    <p className="text-zinc-650 text-xs">
                      No screenshot captured for this action step.
                    </p>
                  </div>
                )}
              </div>

              {selectedStep && (
                <div className="space-y-2 text-xs border-t border-zinc-905 pt-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-semibold">Action:</span>
                    <span className="font-mono text-zinc-300 uppercase">{selectedStep.action}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-semibold">Execution Status:</span>
                    <span className={`font-semibold ${selectedStep.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedStep.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-semibold">Duration:</span>
                    <span className="text-zinc-300 font-mono">{selectedStep.duration} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-semibold">Retry count:</span>
                    <span className="text-zinc-300 font-mono">{selectedStep.retries}</span>
                  </div>
                </div>
              )}
            </GlowingCard>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center border border-zinc-900 rounded-2xl h-[400px] text-zinc-600">
            <span>Select a historical session to replay.</span>
          </div>
        )}
      </div>
    </div>
  );
}
