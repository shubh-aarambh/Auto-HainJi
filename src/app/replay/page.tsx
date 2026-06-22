'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Play, Info } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full max-w-full mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0 px-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
            Replay Studio
          </h2>
          <p className="text-zinc-400 mt-1">Timeline-based execution analysis and telemetry.</p>
        </div>

        <button 
          onClick={fetchHistory}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Top Half: Viewer and Details */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-4">
        
        {/* Left: Video Player */}
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
          <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Playback Monitor</span>
            </div>
            {selectedStep && selectedSession && (
              <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300 font-mono tracking-widest uppercase">
                Frame {selectedSession.steps.indexOf(selectedStep) + 1} / {selectedSession.steps.length}
              </span>
            )}
          </div>
          <div className="flex-1 relative bg-[#050505] flex items-center justify-center">
            {selectedStep?.screenshot ? (
              <img
                src={selectedStep.screenshot}
                alt={`Screenshot for step ${selectedStep.action}`}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest">No visual data for frame</p>
            )}
          </div>
        </div>

        {/* Right: Telemetry Details */}
        <div className="w-full md:w-80 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl shrink-0">
          <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3 shrink-0 flex items-center gap-3">
            <Info className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">Frame Telemetry</span>
          </div>
          <div className="p-5 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
            {selectedSession ? (
              <>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Active Sequence</span>
                  <p className="text-sm text-zinc-200 font-medium">{selectedSession.goal}</p>
                </div>
                
                {selectedStep && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Node Data</span>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 space-y-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Action</span>
                        <p className="font-mono text-zinc-200 text-xs mt-1 font-bold">{selectedStep.action}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Status</span>
                        <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${selectedStep.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {selectedStep.status}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Duration</span>
                          <p className="font-mono text-zinc-300 text-xs mt-1">{selectedStep.duration}ms</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Retries</span>
                          <p className="font-mono text-zinc-300 text-xs mt-1">{selectedStep.retries}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-zinc-600 text-xs text-center mt-10">Select a sequence to view telemetry.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Half: Timeline Editor */}
      <div className="h-64 shrink-0 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
        <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 shrink-0 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sequences (Runs)</span>
        </div>
        
        {/* Sessions Track */}
        <div className="flex-1 border-b border-zinc-800 overflow-x-auto flex items-center px-4 gap-3 scrollbar-thin">
          {sessions.length === 0 ? (
            <p className="text-zinc-600 text-xs">No sequences recorded.</p>
          ) : (
            sessions.map(sess => {
              const isSelected = selectedSession?.id === sess.id;
              return (
                <div 
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  className={`shrink-0 w-64 h-20 rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-zinc-800 border-zinc-600 shadow-md' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-bold text-zinc-400">#{sess.id.slice(0, 6)}</span>
                    <div className={`h-2 w-2 rounded-full ${sess.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                  <p className="text-xs text-zinc-200 font-medium truncate">{sess.goal}</p>
                  <span className="text-[10px] text-zinc-500 font-medium">{sess.steps?.length || 0} nodes</span>
                </div>
              );
            })
          )}
        </div>

        <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 shrink-0 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Nodes (Timeline)</span>
        </div>

        {/* Steps Track */}
        <div className="flex-1 overflow-x-auto flex items-center px-4 gap-2 scrollbar-thin bg-[#0a0a0a]">
          {!selectedSession ? (
            <p className="text-zinc-600 text-xs">Select a sequence to view nodes.</p>
          ) : selectedSession.steps?.length === 0 ? (
            <p className="text-zinc-600 text-xs">No nodes in this sequence.</p>
          ) : (
            selectedSession.steps.map((step, idx) => {
              const isSelectedStep = selectedStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={`shrink-0 w-40 h-16 rounded-lg border p-2 cursor-pointer transition-all flex flex-col justify-between ${isSelectedStep ? 'bg-zinc-200 border-white text-zinc-900 shadow-lg' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelectedStep ? 'text-zinc-500' : 'text-zinc-500'}`}>N-{idx + 1}</span>
                    {step.status === 'SUCCESS' ? <CheckCircle2 className={`w-3 h-3 ${isSelectedStep ? 'text-emerald-600' : 'text-emerald-500'}`} /> : <XCircle className={`w-3 h-3 ${isSelectedStep ? 'text-red-600' : 'text-red-500'}`} />}
                  </div>
                  <p className={`text-[10px] font-bold uppercase truncate ${isSelectedStep ? 'text-black' : 'text-zinc-200'}`}>{step.action}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
