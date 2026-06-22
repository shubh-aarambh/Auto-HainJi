'use client';

import React, { useState } from 'react';

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  className = '',
  glowColor = 'rgba(124, 58, 237, 0.12)',
  ...props
}) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-2xl transition-all duration-300 ${className}`}
      {...props}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition duration-300 rounded-2xl"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
