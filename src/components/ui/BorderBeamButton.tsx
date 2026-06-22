'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BorderBeamButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const BorderBeamButton: React.FC<BorderBeamButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl p-[1px] ${className}`}
      {...props}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_60%,#A855F7_80%,#7C3AED_100%)] pointer-events-none"
      />
      <div className="relative rounded-[11px] bg-zinc-950 px-6 py-3 font-semibold text-zinc-200 transition duration-300 hover:text-white">
        {children}
      </div>
    </motion.button>
  );
};
