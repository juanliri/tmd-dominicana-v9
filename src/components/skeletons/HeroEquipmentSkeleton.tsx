import React from 'react';

/** Task #5: Shimmer Skeletons Especificos de Silueta Industrial
 *  Reemplaza spinners genericos con esqueletos animados que imitan
 *  la silueta exacta de excavadoras y tarjetas de maquinaria pesada.
 */

export const HeroEquipmentCardSkeleton: React.FC = () => (
  <div className="skeleton-shimmer relative bg-zinc-900 rounded-[7px] border border-zinc-800/80 overflow-hidden flex flex-col h-full">
    <div className="relative bg-zinc-800/60 w-full" style={{ aspectRatio: '4/3' }}>
      <div className="absolute top-3 left-3 flex gap-1.5">
        <div className="h-5 w-14 rounded-[3px] bg-zinc-700/80" />
        <div className="h-5 w-20 rounded-[3px] bg-amber-500/10 border border-amber-500/20" />
      </div>
      <div className="absolute top-3 right-3 h-5 w-24 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20" />
      <div className="absolute bottom-3 left-3 h-5 w-32 rounded-[3px] bg-zinc-900/70" />
      <svg className="absolute inset-0 w-full h-full text-amber-400 opacity-[0.04]" viewBox="0 0 320 240" fill="currentColor" aria-hidden="true">
        <rect x="80" y="80" width="110" height="70" rx="6" />
        <rect x="50" y="145" width="170" height="28" rx="14" />
        <path d="M175 90 L240 40 L255 50 L185 105 Z" />
        <path d="M240 40 L290 70 L278 82 L228 52 Z" />
        <path d="M278 82 L305 100 L295 118 L268 98 Z" />
      </svg>
    </div>
    <div className="p-4 flex-1 flex flex-col gap-3">
      <div className="space-y-1.5">
        <div className="h-5 w-5/6 rounded-[3px] bg-zinc-800" />
        <div className="h-3.5 w-2/3 rounded-[3px] bg-zinc-800/70" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-800/50 rounded-[5px] p-2 space-y-1">
            <div className="h-2.5 w-10 rounded bg-zinc-700" />
            <div className="h-4 w-14 rounded-[2px] bg-zinc-600/80" />
          </div>
        ))}
      </div>
      <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-2.5 w-16 rounded bg-zinc-800" />
          <div className="h-6 w-28 rounded-[3px] bg-zinc-700/90" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-9 w-9 rounded-[5px] bg-zinc-800" />
          <div className="h-9 w-28 rounded-[5px] bg-amber-500/15 border border-amber-500/20" />
        </div>
      </div>
    </div>
  </div>
);

export const PatioPanelSkeleton: React.FC = () => (
  <div className="skeleton-shimmer bg-zinc-900 rounded-[10px] border border-zinc-800/80 overflow-hidden">
    <div className="flex gap-1 p-2 border-b border-zinc-800/60">
      {([80, 110, 64, 72] as number[]).map((w, i) => (
        <div
          key={i}
          className={i === 0
            ? 'h-7 rounded-[5px] bg-amber-500/20 border border-amber-500/30'
            : 'h-7 rounded-[5px] bg-zinc-800/60'}
          style={{ width: w }}
        />
      ))}
    </div>
    <div className="relative bg-zinc-800/50 text-amber-400" style={{ aspectRatio: '16/10' }}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 400 250" fill="currentColor" aria-hidden="true">
        <rect x="100" y="100" width="140" height="80" rx="6" />
        <rect x="60" y="170" width="220" height="32" rx="16" />
        <path d="M220 115 L300 50 L318 64 L234 130 Z" />
        <path d="M300 50 L360 88 L346 104 L284 68 Z" />
        <path d="M346 104 L375 126 L361 148 L330 124 Z" />
      </svg>
    </div>
    <div className="p-4 space-y-3">
      <div className="space-y-1.5">
        <div className="h-5 w-4/5 rounded-[3px] bg-zinc-800" />
        <div className="h-3 w-1/2 rounded-[3px] bg-zinc-800/60" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-800/50 rounded-[5px] p-2 space-y-1">
            <div className="h-2.5 w-12 rounded bg-zinc-700" />
            <div className="h-4 w-16 rounded-[2px] bg-zinc-600/80" />
          </div>
        ))}
      </div>
      <div className="h-10 rounded-[7px] bg-amber-500/15 border border-amber-500/20" />
    </div>
  </div>
);

interface HeroGridSkeletonProps { count?: number; }

export const HeroEquipmentGridSkeleton: React.FC<HeroGridSkeletonProps> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse" aria-busy="true" aria-label="Cargando equipos en patio Km 22">
    {Array.from({ length: count }).map((_, i) => (
      <HeroEquipmentCardSkeleton key={i} />
    ))}
  </div>
);