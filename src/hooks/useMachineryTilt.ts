import { useState, useRef, useCallback, MouseEvent } from 'react';

export interface MachineryTiltState {
  rotationX: number;
  rotationY: number;
  glareX: number;
  glareY: number;
  opacity: number;
  transformStyle: {
    transform: string;
    transition: string;
  };
}

export interface UseMachineryTiltOptions {
  maxTilt?: number; // Maximum tilt angle in degrees (default: 4)
  perspective?: number; // CSS perspective distance in px (default: 1000)
  easing?: string; // CSS transition easing
  speed?: number; // Transition speed in ms during reset
}

/**
 * Custom hook to calculate mouse-relative 3D transform offsets (rotationX, rotationY, and specular sheen)
 * for heavy machinery showroom cards and interactive fleet elements.
 */
export function useMachineryTilt<T extends HTMLElement = HTMLDivElement>(
  options: UseMachineryTiltOptions = {}
) {
  const {
    maxTilt = 4,
    perspective = 1000,
    easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
    speed = 250
  } = options;

  const elementRef = useRef<T | null>(null);

  const [tiltState, setTiltState] = useState<MachineryTiltState>({
    rotationX: 0,
    rotationY: 0,
    glareX: 50,
    glareY: 50,
    opacity: 0,
    transformStyle: {
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
      transition: `transform ${speed}ms ${easing}`
    }
  });

  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      const el = elementRef.current;
      if (!el) return;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      rafIdRef.current = requestAnimationFrame(() => {
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate normalized tilt (-maxTilt to +maxTilt)
        const rotationX = ((y - centerY) / centerY) * -maxTilt;
        const rotationY = ((x - centerX) / centerX) * maxTilt;

        // Specular sheen coordinates (0% to 100%)
        const glareX = Math.round((x / rect.width) * 100);
        const glareY = Math.round((y / rect.height) * 100);

        setTiltState({
          rotationX,
          rotationY,
          glareX,
          glareY,
          opacity: 0.18,
          transformStyle: {
            transform: `perspective(${perspective}px) rotateX(${rotationX.toFixed(2)}deg) rotateY(${rotationY.toFixed(2)}deg)`,
            transition: 'transform 0.08s ease-out'
          }
        });
      });
    },
    [maxTilt, perspective]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    setTiltState({
      rotationX: 0,
      rotationY: 0,
      glareX: 50,
      glareY: 50,
      opacity: 0,
      transformStyle: {
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
        transition: `transform ${speed}ms ${easing}`
      }
    });
  }, [perspective, speed, easing]);

  return {
    ref: elementRef,
    tiltState,
    rotationX: tiltState.rotationX,
    rotationY: tiltState.rotationY,
    glareX: tiltState.glareX,
    glareY: tiltState.glareY,
    opacity: tiltState.opacity,
    transformStyle: tiltState.transformStyle,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  };
}
