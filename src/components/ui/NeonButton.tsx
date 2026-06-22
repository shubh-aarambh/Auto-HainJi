'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl bg-violet-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] border border-violet-400/20 ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
