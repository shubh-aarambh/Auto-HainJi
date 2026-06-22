'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Monitor, Terminal, History, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { name: 'Go to Dashboard', icon: Monitor, action: () => router.push('/') },
    { name: 'View Live Logs', icon: Terminal, action: () => router.push('/logs') },
    { name: 'Open Replay History', icon: History, action: () => router.push('/replay') },
    { name: 'Trigger Agent Run', icon: Play, action: () => {
      fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: 'Open site and fill Name and Description.', url: 'https://ui.shadcn.com/docs/forms/react-hook-form' })
      });
      router.push('/execution');
    }},
    { name: 'Emergency Stop Agent', icon: Square, action: () => fetch('/api/stop', { method: 'POST' }) }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 border-b border-zinc-900 px-4 py-3.5">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {filteredCommands.length === 0 ? (
                  <div className="py-6 text-center text-sm text-zinc-655">
                    No commands found for "{query}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <cmd.icon className="h-4 w-4 text-violet-500" />
                      <span className="flex-1 font-medium">{cmd.name}</span>
                      <kbd className="text-[10px] text-zinc-650 font-mono">ENTER</kbd>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-40 hidden md:block">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 backdrop-blur transition hover:border-zinc-700"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search commands</span>
          <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[9px]">Ctrl+K</kbd>
        </button>
      </div>
    </>
  );
};
