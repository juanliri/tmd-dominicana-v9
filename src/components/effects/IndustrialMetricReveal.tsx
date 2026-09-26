import React, { useEffect, useState, useRef } from 'react';

interface IndustrialMetricRevealProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  sublabel?: string;
  duration?: number;
}

export const IndustrialMetricReveal: React.FC<IndustrialMetricRevealProps> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  label,
  sublabel,
  duration = 1500
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = easeProgress * value;
            
            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const formattedNumber = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.floor(displayValue).toLocaleString();

  return (
    <div ref={containerRef} className="flex flex-col font-mono">
      <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-baseline gap-0.5 font-display">
        {prefix && <span className="text-base text-zinc-400">{prefix}</span>}
        <span>{formattedNumber}</span>
        {suffix && <span className="text-sm font-bold text-amber-300 ml-0.5">{suffix}</span>}
      </div>
      <span className="text-xs font-bold text-white uppercase tracking-wider mt-1">{label}</span>
      {sublabel && <span className="text-[10px] text-zinc-400 font-normal">{sublabel}</span>}
    </div>
  );
};
