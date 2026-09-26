import React from 'react';

export const SchematicSkeleton: React.FC = () => {
  return (
    <div className="mb-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm skeleton-shimmer">
      {/* Top Bar Skeleton */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-5 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3.5 w-64 rounded bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* Main Canvas & Side Panel Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[420px]">
        {/* CAD Canvas Placeholder */}
        <div className="lg:col-span-2 bg-zinc-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 relative">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 rounded bg-zinc-800" />
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-800" />
              <div className="h-7 w-7 rounded-lg bg-zinc-800" />
              <div className="h-7 w-7 rounded-lg bg-zinc-800" />
            </div>
          </div>

          {/* Center blueprint wireframe placeholder */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="w-4/5 h-48 rounded-2xl border border-dashed border-zinc-800 flex items-center justify-center">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div key={dot} className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="h-3 w-40 rounded bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-800" />
          </div>
        </div>

        {/* Right Drawer Skeleton */}
        <div className="p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-4/5 rounded-lg bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-14 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60" />
          
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((r) => (
              <div key={r} className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3.5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-20 rounded bg-zinc-200/70 dark:bg-zinc-700/70" />
                </div>
                <div className="h-7 w-7 rounded-lg bg-amber-500/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
