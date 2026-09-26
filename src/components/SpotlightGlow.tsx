import React, { useEffect, useRef } from 'react';

export const SpotlightGlow: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: -1000, y: -1000, active: false });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only run on desktop/devices with fine pointer (no touch battery drain)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      targetPos.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updateGlow = () => {
      if (spotlightRef.current && targetPos.current.active) {
        // Smooth lerp follow
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.12);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.12);

        const x = Math.round(currentPos.current.x);
        const y = Math.round(currentPos.current.y);

        spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.05), transparent 70%)`;
        spotlightRef.current.style.opacity = '1';
      } else if (spotlightRef.current) {
        spotlightRef.current.style.opacity = '0';
      }

      animFrameId.current = requestAnimationFrame(updateGlow);
    };

    animFrameId.current = requestAnimationFrame(updateGlow);

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
      style={{ willChange: 'background' }}
      aria-hidden="true"
    />
  );
};
