'use client';

import React from 'react';

interface DragonBallIconProps {
  stars?: number;
  className?: string;
}

export default function DragonBallIcon({ stars = 4, className = "w-8 h-8" }: DragonBallIconProps) {
  const safeStars = Math.max(1, Math.min(7, stars));
  
  const starPositions: Record<number, {x: number, y: number}[]> = {
    1: [{x: 50, y: 50}],
    2: [{x: 35, y: 50}, {x: 65, y: 50}],
    3: [{x: 50, y: 35}, {x: 35, y: 60}, {x: 65, y: 60}],
    4: [{x: 35, y: 35}, {x: 65, y: 35}, {x: 35, y: 65}, {x: 65, y: 65}],
    5: [{x: 50, y: 30}, {x: 25, y: 50}, {x: 75, y: 50}, {x: 35, y: 70}, {x: 65, y: 70}],
    6: [{x: 35, y: 30}, {x: 65, y: 30}, {x: 20, y: 50}, {x: 80, y: 50}, {x: 35, y: 70}, {x: 65, y: 70}],
    7: [{x: 50, y: 25}, {x: 25, y: 40}, {x: 75, y: 40}, {x: 20, y: 60}, {x: 80, y: 60}, {x: 40, y: 75}, {x: 60, y: 75}],
  };

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="db-grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="30%" stopColor="#ff9800" />
          <stop offset="80%" stopColor="#e65100" />
          <stop offset="100%" stopColor="#b71c1c" />
        </radialGradient>
        <linearGradient id="db-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="db-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Base Sphere */}
      <circle cx="50" cy="50" r="48" fill="url(#db-grad)" stroke="#880e4f" strokeWidth="1.5" />
      
      {/* Stars */}
      <g fill="#d50000" filter="url(#db-glow)">
        {starPositions[safeStars].map((pos, i) => (
          <polygon 
            key={i} 
            points="0,-7 1.6,-2.2 6.7,-2.2 2.5,0.9 4.1,5.7 0,2.6 -4.1,5.7 -2.5,0.9 -6.7,-2.2 -1.6,-2.2" 
            transform={`translate(${pos.x}, ${pos.y})`} 
          />
        ))}
      </g>
      
      {/* Glossy Highlights */}
      <ellipse cx="50" cy="22" rx="32" ry="12" fill="url(#db-highlight)" opacity="0.8" />
      <path d="M 20 75 Q 50 95 80 75 Q 50 85 20 75 Z" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}
