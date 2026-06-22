'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  animate = true, 
  ...props 
}) => {
  const Component = animate ? (motion.div as any) : 'div';
  
  return (
    <Component
      initial={animate ? { opacity: 0, y: 15 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={animate ? { duration: 0.5, ease: 'easeOut' } : undefined}
      className={`relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-6 backdrop-blur-xl shadow-xl shadow-black/40 ${className}`}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
      {children}
    </Component>
  );
};
