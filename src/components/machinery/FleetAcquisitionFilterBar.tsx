import React from 'react';
import { Sparkles, ShieldCheck, Key, Layers, Zap } from 'lucide-react';

export type FleetConditionFilter = 'all' | 'new' | 'cpo' | 'rental';

interface FleetAcquisitionFilterBarProps {
  activeCondition: FleetConditionFilter;
  onChangeCondition: (condition: FleetConditionFilter) => void;
  totalCounts: {
    all: number;
    new: number;
    cpo: number;
    rental: number;
  };
}

export const FleetAcquisitionFilterBar = React.memo<FleetAcquisitionFilterBarProps>(({
  activeCondition,
  onChangeCondition,
  totalCounts
}) => {
  const tabs = [
    {
      id: 'all' as FleetConditionFilter,
      label: 'TODA LA FLOTA',
      badge: `${totalCounts.all} EQUIPOS`,
      icon: Layers,
      highlight: null
    },
    {
      id: 'new' as FleetConditionFilter,
      label: 'NUEVA 2026 (0 HORAS)',
      badge: 'GARANTÍA 3 AÑOS / 5K HRS',
      icon: Sparkles,
      highlight: 'amber'
    },
    {
      id: 'cpo' as FleetConditionFilter,
      label: 'SEMINUEVOS CPO',
      badge: 'INSPECCIÓN 120 PTS',
      icon: ShieldCheck,
      highlight: 'white'
    },
    {
      id: 'rental' as FleetConditionFilter,
      label: 'RENTA & LEASING',
      badge: 'KM 22 LISTO',
      icon: Key,
      highlight: 'amber'
    }
  ];

  return (
    <div className="mb-4 bg-gradient-to-r from-[#14141c] via-[#0c0c12] to-[#06060a] p-1.5 sm:p-2 rounded-xl border border-white/[0.08] shadow-xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeCondition === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeCondition(tab.id)}
              className={`p-2.5 sm:p-3 rounded-lg text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer select-none border ${
                isActive
                  ? 'bg-[#181826] text-white border-[#d99b26]/80 shadow-md ring-1 ring-[#d99b26]/30'
                  : 'bg-[#08080d]/60 text-zinc-300 hover:text-white hover:bg-[#12121c] border-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive ? 'text-[#e0a22a]' : 'text-zinc-400'
                  }`} />
                  <span className="text-xs font-black font-display tracking-wider uppercase line-clamp-1">
                    {tab.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`font-bold tracking-wider ${
                  isActive ? 'text-[#e0a22a]' : 'text-zinc-500'
                }`}>
                  {tab.badge}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e0a22a] animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

FleetAcquisitionFilterBar.displayName = 'FleetAcquisitionFilterBar';
