import React from 'react';

export interface TmdCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'machined' | 'glass' | 'danger';
  hoverEffect?: boolean;
  chamferCorners?: boolean;
}

const variantStyles = {
  default: 'bg-zinc-950/90 border-zinc-800/80 text-zinc-100',
  accent: 'bg-zinc-950 border-amber-500/30 text-zinc-100 shadow-[0_0_25px_rgba(245,158,11,0.08)]',
  machined: 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-700/80 text-zinc-100 shadow-xl',
  glass: 'bg-zinc-950/70 backdrop-blur-xl border-white/[0.08] text-zinc-100',
  danger: 'bg-zinc-950 border-rose-600/40 text-zinc-100 shadow-[0_0_20px_rgba(225,29,72,0.12)]'
};

export const TmdCard: React.FC<TmdCardProps> = ({
  variant = 'default',
  hoverEffect = true,
  chamferCorners = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        relative rounded-[6px] border font-mono transition-all duration-200 overflow-hidden
        ${variantStyles[variant]}
        ${hoverEffect ? 'hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5' : ''}
        ${chamferCorners ? 'before:absolute before:top-0 before:right-0 before:w-3 before:h-3 before:bg-zinc-800 before:[clip-path:polygon(0_0,100%_0,100%_100%)]' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top indicator line for machined look */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export interface TmdCardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const TmdCardHeader: React.FC<TmdCardHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`p-4 sm:p-5 border-b border-zinc-800/80 flex items-start justify-between gap-3 ${className}`}
      {...props}
    >
      {children || (
        <>
          <div className="space-y-1 min-w-0 flex-1">
            {badge && <div className="mb-1.5">{badge}</div>}
            {title && (
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-zinc-400 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </>
      )}
    </div>
  );
};

export const TmdCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const TmdCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`p-3.5 sm:p-4 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
