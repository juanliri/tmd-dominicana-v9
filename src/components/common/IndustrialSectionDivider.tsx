import React from 'react';

interface IndustrialSectionDividerProps {
  className?: string;
  badge?: string;
  variant?: 'subtle' | 'accent' | 'compact';
}

export const IndustrialSectionDivider: React.FC<IndustrialSectionDividerProps> = ({
  className = '',
  badge,
  variant = 'subtle'
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center my-2 sm:my-3 py-1 w-full select-none ${className}`}
      role="separator"
      aria-orientation="horizontal"
    >
      {/* Background Subtle Industrial Gradient Track */}
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className={`w-full h-px tmd-industrial-divider ${
          variant === 'accent' ? 'opacity-100' : 'opacity-85'
        }`} />
      </div>

      {/* Center Detail Element */}
      {badge ? (
        <div className="relative z-10 px-3 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-950 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{badge}</span>
        </div>
      ) : (
        <div className="relative z-10 flex items-center gap-1.5 px-3 bg-slate-50 dark:bg-zinc-950 text-amber-500/60">
          <span className="w-1 h-1 rounded-full bg-amber-500/30" />
          <span className="w-1.5 h-1.5 rotate-45 border border-amber-500/50 bg-amber-500/20" />
          <span className="w-1 h-1 rounded-full bg-amber-500/30" />
        </div>
      )}
    </div>
  );
};
