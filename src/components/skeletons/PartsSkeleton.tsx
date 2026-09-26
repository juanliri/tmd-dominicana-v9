import React from 'react';

export const PartCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden flex flex-col justify-between skeleton-shimmer">
      <div>
        {/* Part Image & Badges Placeholder */}
        <div className="relative h-44 bg-zinc-200/70 dark:bg-zinc-800/60 overflow-hidden">
          {/* P/N badge skeleton */}
          <div className="absolute top-2.5 left-2.5 h-5 w-24 rounded bg-zinc-900/40 dark:bg-zinc-700/60" />
          {/* OEM badge skeleton */}
          <div className="absolute top-2.5 right-2.5 h-5 w-16 rounded bg-amber-500/20" />
          {/* Assembly tag skeleton */}
          <div className="absolute bottom-2.5 left-2.5 h-4 w-28 rounded bg-zinc-900/50 dark:bg-zinc-700/70" />
        </div>

        {/* Body Placeholder */}
        <div className="p-4 space-y-3">
          {/* Brand & Category */}
          <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />

          {/* Part Name (2 lines) */}
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-2/3 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/20" />
            <div className="h-3 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Compatibility Pill */}
          <div className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800/50" />
        </div>
      </div>

      {/* Price & Action Button Footer */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-24 rounded bg-zinc-300 dark:bg-zinc-700" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 rounded-xl bg-amber-500/20" />
          <div className="w-16 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
};

interface PartsGridSkeletonProps {
  count?: number;
}

export const PartsGridSkeleton: React.FC<PartsGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse" aria-busy="true" aria-label="Cargando catálogo de repuestos genuinos">
      {Array.from({ length: count }).map((_, index) => (
        <PartCardSkeleton key={index} />
      ))}
    </div>
  );
};
