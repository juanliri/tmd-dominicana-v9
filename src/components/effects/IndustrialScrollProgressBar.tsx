import React, { useEffect, useRef } from 'react';

export const IndustrialScrollProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0 && barRef.current && containerRef.current) {
          const currentProgress = (window.scrollY / totalHeight) * 100;
          const clamped = Math.min(100, Math.max(0, currentProgress));
          barRef.current.style.width = `${clamped}%`;
          containerRef.current.style.opacity = clamped > 0.5 ? '1' : '0';
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-zinc-950/80 pointer-events-none transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      <div 
        ref={barRef}
        className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] will-change-[width]"
        style={{ width: '0%' }}
      />
    </div>
  );
};
