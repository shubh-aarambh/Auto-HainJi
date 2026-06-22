'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Play, Terminal, History, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Live Run', href: '/execution', icon: Play },
    { name: 'Terminal Logs', href: '/logs', icon: Terminal },
    { name: 'Replay Viewer', href: '/replay', icon: History }
  ];

  return (
    <aside className="relative flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
          <Activity className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold tracking-wider text-zinc-100">AutoPilot AI</h1>
          <span className="text-xs text-zinc-500">v3.0.0 Agent</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <div className={`relative flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors hover:text-zinc-200 ${isActive ? 'text-white bg-zinc-900/60 border border-zinc-800' : 'text-zinc-400 hover:bg-zinc-900/30'}`}>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 h-3/5 w-1 rounded-r-full bg-violet-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-5 w-5 ${isActive ? 'text-violet-500' : 'text-zinc-500'}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-900 pt-4">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-900/40 p-3 border border-zinc-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <div className="text-xs">
            <p className="font-medium text-zinc-300">System Gateway</p>
            <p className="text-zinc-500">Listening on port 3001</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
