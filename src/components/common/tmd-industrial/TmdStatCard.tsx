import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { TmdCard } from './TmdCard';

export interface TmdStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  highlightColor?: 'amber' | 'emerald' | 'cyan' | 'rose' | 'zinc';
  className?: string;
}

const colorStyles = {
  amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  rose: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  zinc: 'text-zinc-200 border-zinc-700/50 bg-zinc-900/40'
};

export const TmdStatCard: React.FC<TmdStatCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'amber',
  className = ''
}) => {
  return (
    <TmdCard className={`p-4 sm:p-5 font-mono ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-bold text-zinc-400 uppercase">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 pt-0.5">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-[4px] border shrink-0 ${colorStyles[highlightColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center gap-1.5 text-xs">
          {trend.direction === 'up' && (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          {trend.direction === 'down' && (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className={`font-bold ${trend.direction === 'up' ? 'text-emerald-400' : trend.direction === 'down' ? 'text-rose-400' : 'text-zinc-400'}`}>
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-zinc-500 text-[11px]">{trend.label}</span>
          )}
        </div>
      )}
    </TmdCard>
  );
};
