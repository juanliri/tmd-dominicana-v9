import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive particle count (35 to 50 on desktop, 20 on mobile)
    const isMobile = width < 768;
    const particleCount = isMobile ? 22 : 45;
    const particles: Particle[] = [];

    // Industrial Gold & Amber Color Palette
    const palette = [
      '#f59e0b', // Amber 500
      '#d97706', // Amber 600
      '#fbbf24', // Amber 400
      '#fcd34d', // Soft Gold
      '#ffffff', // Translucent Titanium White
    ];

    const createParticle = (customX?: number, customY?: number): Particle => {
      const baseRadius = Math.random() * 1.5 + 0.6; // 0.6px to 2.1px
      const baseAlpha = Math.random() * 0.3 + 0.15; // 0.15 to 0.45
      return {
        x: customX ?? Math.random() * width,
        y: customY ?? Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // Slow horizontal drift
        vy: -Math.random() * 0.45 - 0.1, // Subtle upward/buoyant movement (quarry dust)
        radius: baseRadius,
        baseRadius,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    let isVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();
    const SPOTLIGHT_RADIUS = 120; // 120px mouse interaction radius

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Delta time normalization
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Brownian pulsation
        p.pulsePhase += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.1;

        // Base velocity drift
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Screen wrap-around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse Spotlight Acceleration
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < SPOTLIGHT_RADIUS) {
            const force = (1 - dist / SPOTLIGHT_RADIUS) * 0.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            p.alpha = Math.min(0.85, p.alpha + 0.3);
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fill();

        // Constellation mesh lines within mouse proximity
        if (mouse.active) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Connect nearby particles if near mouse
            if (dist < 90) {
              const mouseDist1 = Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2);
              const mouseDist2 = Math.sqrt((mouse.x - p2.x) ** 2 + (mouse.y - p2.y) ** 2);

              if (mouseDist1 < SPOTLIGHT_RADIUS + 40 || mouseDist2 < SPOTLIGHT_RADIUS + 40) {
                const lineAlpha = (1 - dist / 90) * 0.12;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = lineAlpha;
                ctx.stroke();
              }
            }
          }

          // Line to cursor
          const distToCursor = Math.sqrt((mouse.x - p.x) ** 2 + (mouse.y - p.y) ** 2);
          if (distToCursor < SPOTLIGHT_RADIUS) {
            const lineAlpha = (1 - distToCursor / SPOTLIGHT_RADIUS) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = lineAlpha;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      id="tmd-ambient-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};
