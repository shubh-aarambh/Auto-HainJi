'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ children, className = '', ...props }) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [count, setCount] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { x, y, id: count }]);
    setCount((prev) => prev + 1);

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 active:scale-95 ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: '20px',
              height: '20px',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};
