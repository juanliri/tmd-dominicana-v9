import React, { useEffect, useRef } from 'react';

export const SpotlightGlow: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: -1000, y: -1000, active: false });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const animFrameId = useRef<number | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    // Only run on desktop/devices with fine pointer (no touch battery drain)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateGlow = () => {
      if (!targetPos.current.active) {
        if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
        isRunning.current = false;
        animFrameId.current = null;
        return;
      }

      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.15);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.15);

      const x = Math.round(currentPos.current.x);
      const y = Math.round(currentPos.current.y);

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.05), transparent 70%)`;
        spotlightRef.current.style.opacity = '1';
      }

      // Check if settled
      const dist = Math.abs(currentPos.current.x - targetPos.current.x) + Math.abs(currentPos.current.y - targetPos.current.y);
      if (dist > 0.5) {
        animFrameId.current = requestAnimationFrame(updateGlow);
      } else {
        isRunning.current = false;
        animFrameId.current = null;
      }
    };

    const startLoop = () => {
      if (!isRunning.current) {
        isRunning.current = true;
        animFrameId.current = requestAnimationFrame(updateGlow);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
      startLoop();
    };

    const handleMouseLeave = () => {
      targetPos.current.active = false;
      startLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed inset-0 pointer-events-none z-1 transition-opacity duration-300 hidden dark:block"
      style={{ willChange: 'background', opacity: 0 }}
      aria-hidden="true"
    />
  );
};
