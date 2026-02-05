'use client';

import { useEffect, useState } from 'react';

export default function FloatingParticles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 animate-pulse rounded-full bg-blue-400 opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}
