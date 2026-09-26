import React from 'react';
import { useMachineryTilt, UseMachineryTiltOptions } from '../../hooks/useMachineryTilt';

interface IndustrialTiltCardProps extends UseMachineryTiltOptions {
  children: React.ReactNode;
  className?: string;
}

export const IndustrialTiltCard: React.FC<IndustrialTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 4,
  perspective = 1000,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
  speed = 250
}) => {
  const {
    ref,
    glareX,
    glareY,
    opacity,
    transformStyle,
    onMouseMove,
    onMouseLeave
  } = useMachineryTilt<HTMLDivElement>({
    maxTilt,
    perspective,
    easing,
    speed
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`machinery-3d-tilt relative preserve-3d will-change-transform ${className}`}
      style={transformStyle}
    >
      {/* Specular Amber / Gold Glare Layer */}
      <div 
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(251, 191, 36, 0.35), transparent 65%)`
        }}
      />
      <div className="machinery-3d-tilt-inner w-full h-full">
        {children}
      </div>
    </div>
  );
};

