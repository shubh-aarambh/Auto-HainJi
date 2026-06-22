'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl border border-violet-500/30 bg-zinc-900 px-6 py-3 font-medium text-zinc-100 transition-all duration-300 hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        initial={{ left: '-100%' }}
        whileHover={{ left: '100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute top-0 h-full w-[50%] skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        style={{ left: '-100%' }}
      />
    </motion.button>
  );
};
