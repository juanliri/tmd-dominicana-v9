import React from 'react';
import { LucideIcon } from 'lucide-react';

export type TmdBadgeVariant = 
  | 'amber'     // Commercial Highlight / Gold
  | 'emerald'   // In Stock / DGII / Approved
  | 'rose'      // SOS 24/7 / Urgent / Critical
  | 'cyan'      // Telematics / LiveLink™ IoT
  | 'zinc'      // Default / Neutral Spec
  | 'purple';   // VIP / Platinum Pro

export interface TmdBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TmdBadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  icon?: LucideIcon;
}

const variantStyles: Record<TmdBadgeVariant, string> = {
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  zinc: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
};

const dotColors: Record<TmdBadgeVariant, string> = {
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-400',
  zinc: 'bg-zinc-400',
  purple: 'bg-purple-400'
};

const sizeStyles = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1 rounded-[2px]',
  sm: 'text-[11px] px-2 py-0.5 gap-1.5 rounded-[3px]',
  md: 'text-xs px-2.5 py-1 gap-1.5 rounded-[4px]'
};

export const TmdBadge: React.FC<TmdBadgeProps> = ({
  variant = 'amber',
  size = 'sm',
  dot = false,
  pulse = false,
  icon: Icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-mono font-bold uppercase tracking-wider border select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}

      {Icon && <Icon className="w-3 h-3 shrink-0" />}

      {children}
    </span>
  );
};
