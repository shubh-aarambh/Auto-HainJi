'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AuroraButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const AuroraButton: React.FC<AuroraButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-zinc-950" />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute -inset-[30%] opacity-55 blur-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 pointer-events-none"
      />
      <div className="absolute inset-0 rounded-xl border border-white/10" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
