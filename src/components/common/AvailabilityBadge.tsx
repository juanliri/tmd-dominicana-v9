import React from 'react';
import { Anchor, CheckCircle2, Clock, Factory, MapPin } from 'lucide-react';

export type AvailabilityStatus = 'immediate' | 'transit' | 'factory_order';

interface AvailabilityBadgeProps {
  status?: AvailabilityStatus;
  leadTimeDays?: number;
  className?: string;
  variant?: 'pill' | 'card-compact' | 'detailed';
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  status = 'immediate',
  leadTimeDays,
  className = '',
  variant = 'pill'
}) => {
  // Config semafórica oficial TMD (Task #13)
  const config = {
    immediate: {
      label: 'STOCK INMEDIATO KM 22',
      shortLabel: 'KM 22 INMEDIATO',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/90',
      border: 'border-emerald-500/40',
      dotBg: 'bg-emerald-400',
      icon: CheckCircle2,
      subtext: 'Listo para despacho en lowboy en < 24h'
    },
    transit: {
      label: 'EN TRÁNSITO (CAUCEDO/HAINA)',
      shortLabel: 'EN TRÁNSITO MARÍTIMO',
      color: 'text-amber-400',
      bg: 'bg-amber-950/90',
      border: 'border-amber-500/40',
      dotBg: 'bg-amber-400',
      icon: Anchor,
      subtext: `Llegada a puerto en ${leadTimeDays || 7} días hábiles`
    },
    factory_order: {
      label: 'PEDIDO DE FÁBRICA OEM',
      shortLabel: 'PEDIDO FÁBRICA',
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/90',
      border: 'border-cyan-500/40',
      dotBg: 'bg-cyan-400',
      icon: Factory,
      subtext: `Fabricación directa CIF en ${leadTimeDays || 35} días`
    }
  }[status];

  const Icon = config.icon;

  if (variant === 'card-compact') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] ${config.bg} ${config.color} border ${config.border} text-[9px] font-black uppercase font-mono shadow-xs backdrop-blur-md ${className}`}>
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotBg} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotBg}`} />
        </span>
        <span className="truncate max-w-[130px]">{config.shortLabel}</span>
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`p-2.5 rounded-[3px] ${config.bg} border ${config.border} font-mono flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-[2px] bg-zinc-950/80 border ${config.border} flex items-center justify-center ${config.color} shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                {config.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-300 font-sans mt-0.5">
              {config.subtext}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase text-zinc-400 bg-zinc-900/90 px-2 py-1 rounded-[2px] border border-zinc-800 shrink-0">
          {status === 'immediate' ? 'DESPACHO HOY' : status === 'transit' ? 'EN MAR' : 'A MEDIDA'}
        </span>
      </div>
    );
  }

  // Default: pill
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] ${config.bg} ${config.color} border ${config.border} text-[10px] font-black uppercase font-mono shadow-xs backdrop-blur-md ${className}`}>
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotBg} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotBg}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};
