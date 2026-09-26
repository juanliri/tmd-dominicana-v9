import React from 'react';

export const MachineryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col skeleton-shimmer">
      {/* Image & Badge Placeholder */}
      <div className="relative aspect-[16/10] bg-zinc-200/70 dark:bg-zinc-800/60 overflow-hidden">
        {/* Brand & Status Skeleton Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-zinc-300/80 dark:bg-zinc-700/80" />
          <div className="h-6 w-24 rounded-full bg-zinc-300/60 dark:bg-zinc-700/60" />
        </div>
        <div className="absolute top-4 right-4">
          <div className="h-7 w-7 rounded-full bg-zinc-300/80 dark:bg-zinc-700/80" />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          {/* Category & Model Code */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="h-4 w-28 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Machine Title (2 lines) */}
          <div className="space-y-2 mb-3">
            <div className="h-6 w-4/5 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-3/5 rounded-md bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>

          {/* Key Specs Grid (4 boxes) */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 space-y-1.5"
              >
                <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-20 rounded bg-zinc-300/80 dark:bg-zinc-700/80" />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-7 w-32 rounded-lg bg-zinc-300/90 dark:bg-zinc-700/90" />
            </div>
            <div className="h-5 w-24 rounded-full bg-amber-500/10 dark:bg-amber-500/10" />
          </div>

          {/* Action Buttons (Ver Ficha / Cotizar) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface MachineryGridSkeletonProps {
  count?: number;
}

export const MachineryGridSkeleton: React.FC<MachineryGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true" aria-label="Cargando catálogo de maquinaria pesada">
      {Array.from({ length: count }).map((_, index) => (
        <MachineryCardSkeleton key={index} />
      ))}
    </div>
  );
};
