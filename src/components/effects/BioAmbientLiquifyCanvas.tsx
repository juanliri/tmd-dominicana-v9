import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
  hue: number;
  mass: number;
  pulseSpeed: number;
  pulseVal: number;
}

interface BioAmbientLiquifyCanvasProps {
  theme?: 'industrial-dark' | 'amber-carbon' | 'caribbean-steel' | 'high-contrast';
  className?: string;
}

export const BioAmbientLiquifyCanvas: React.FC<BioAmbientLiquifyCanvasProps> = ({
  theme = 'industrial-dark',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Pointer state with smooth spring interpolation
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      radius: 160,
    };

    const updateDimensions = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      pointer.targetX = clientX;
      pointer.targetY = clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    const getBaseColors = () => {
      if (theme === 'caribbean-steel') {
        return {
          hue: 202,
          rgbPrimary: '14, 165, 233',
          rgbSecondary: '56, 189, 248',
          glowHex: '#38bdf8'
        };
      }
      if (theme === 'high-contrast') {
        return {
          hue: 50,
          rgbPrimary: '250, 204, 21',
          rgbSecondary: '234, 179, 8',
          glowHex: '#facc15'
        };
      }
      // Industrial Dark (Gold & Diesel Amber)
      return {
        hue: 38,
        rgbPrimary: '245, 158, 11',
        rgbSecondary: '217, 119, 6',
        glowHex: '#f59e0b'
      };
    };

    const colors = getBaseColors();

    // Responsive particle count (balanced for 60-120fps)
    const particleCount = Math.min(55, Math.max(28, Math.floor(width / 22)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        radius: Math.random() * 2.4 + 1.0,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.6 - 0.25,
        alpha: Math.random() * 0.45 + 0.2,
        targetAlpha: Math.random() * 0.7 + 0.25,
        hue: colors.hue + (Math.random() * 16 - 8),
        mass: Math.random() * 1.6 + 0.7,
        pulseSpeed: Math.random() * 0.04 + 0.015,
        pulseVal: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameIdRef.current) {
        render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isTabVisible) {
        animationFrameIdRef.current = null;
        return;
      }

      time += 0.006;

      // Pointer spring easing
      if (pointer.active) {
        pointer.x += (pointer.targetX - pointer.x) * 0.16;
        pointer.y += (pointer.targetY - pointer.y) * 0.16;
      } else {
        pointer.x += (-1000 - pointer.x) * 0.1;
        pointer.y += (-1000 - pointer.y) * 0.1;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Dark Industrial Hex/Grid Texture in Canvas
      ctx.save();
      const gridSize = 48;
      ctx.strokeStyle = `rgba(${colors.rgbPrimary}, 0.022)`;
      ctx.lineWidth = 1;
      const xOffset = (time * 8) % gridSize;
      const yOffset = (time * 6) % gridSize;

      ctx.beginPath();
      for (let x = -gridSize + xOffset; x < width + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = -gridSize + yOffset; y < height + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Dynamic Liquify Ambient Gradient Orbs (Floating background illumination)
      // Top Glowing Orb
      const orb1X = width * 0.5 + Math.sin(time * 0.65) * (width * 0.25);
      const orb1Y = height * 0.15 + Math.cos(time * 0.5) * 60;
      const rad1 = Math.max(width * 0.45, 300);
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, rad1);
      grad1.addColorStop(0, `rgba(${colors.rgbPrimary}, 0.16)`);
      grad1.addColorStop(0.5, `rgba(${colors.rgbPrimary}, 0.04)`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-left Glowing Orb
      const orb2X = width * 0.3 + Math.cos(time * 0.45) * (width * 0.2);
      const orb2Y = height * 0.6 + Math.sin(time * 0.7) * 90;
      const rad2 = Math.max(width * 0.4, 260);
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, rad2);
      grad2.addColorStop(0, `rgba(${colors.rgbSecondary}, 0.12)`);
      grad2.addColorStop(0.55, `rgba(${colors.rgbSecondary}, 0.03)`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Interactive Pointer Light Glow
      if (pointer.x > 0 && pointer.y > 0) {
        const pGrad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, pointer.radius * 1.6);
        pGrad.addColorStop(0, `rgba(${colors.rgbPrimary}, 0.15)`);
        pGrad.addColorStop(0.5, `rgba(${colors.rgbPrimary}, 0.035)`);
        pGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = pGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Constellation Connections between nearby particles
      const connectionDistance = 90;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * 0.18 * Math.min(particles[i].alpha, particles[j].alpha);
            ctx.strokeStyle = `rgba(${colors.rgbPrimary}, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Interactive Particles Physics & Rendering
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Standard ambient upward drift
        p.x += p.vx;
        p.y += p.vy;

        p.pulseVal += p.pulseSpeed;
        const radiusMultiplier = 1 + Math.sin(p.pulseVal) * 0.2;

        // Pointer Reaction: Smooth magnetic repulsion / fluid swirl
        if (pointer.x > 0 && pointer.y > 0) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < pointer.radius) {
            const force = (1 - dist / pointer.radius) * 4.2;
            const angle = Math.atan2(dy, dx);
            
            p.x += Math.cos(angle) * force * (1.3 / p.mass);
            p.y += Math.sin(angle) * force * (1.3 / p.mass);

            // Connect line to pointer
            const pLineAlpha = (1 - dist / pointer.radius) * 0.35;
            ctx.strokeStyle = `rgba(${colors.rgbPrimary}, ${pLineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();

            // Temporarily brighten particle near pointer
            p.alpha = Math.min(1, p.alpha + 0.05);
          }
        }

        // Viewport wrapping
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Soft alpha pulse
        p.alpha += (p.targetAlpha - p.alpha) * 0.025;
        if (Math.abs(p.targetAlpha - p.alpha) < 0.03) {
          p.targetAlpha = Math.random() * 0.7 + 0.2;
        }

        // Render glowing particle
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius * radiusMultiplier), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 62%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.85)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-10 w-full h-full ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
};
