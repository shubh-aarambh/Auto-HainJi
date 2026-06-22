'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Play, Terminal, History, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Terminal Logs', href: '/logs', icon: Terminal },
    { name: 'Replay Viewer', href: '/replay', icon: History }
  ];

  return (
    <motion.nav 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 shadow-xl"
    >
      <div className="flex items-center gap-4 pr-6 border-r border-zinc-800">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <Cpu className="h-6 w-6 animate-pulse" />
        </div>
        <span className="font-black text-lg tracking-[0.1em] text-white hidden md:block">Auto-HainJi</span>
      </div>

      <div className="flex items-center gap-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} title={item.name}>
              <motion.div 
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center justify-center h-12 w-12 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-zinc-800 text-zinc-100' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator-bottom"
                    className="absolute -bottom-3 h-1 w-5 rounded-full bg-zinc-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                )}
                <item.icon className="h-6 w-6" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="pl-6 border-l border-zinc-800">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="relative flex h-2 w-2 mb-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            Port 4001
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
