import React from 'react';

export const MachineCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse shadow-sm flex flex-col h-[440px]">
      {/* Image Skeleton */}
      <div className="w-full h-56 bg-zinc-200 dark:bg-zinc-800 relative">
        <div className="absolute top-3 left-3 w-16 h-5 bg-zinc-300 dark:bg-zinc-700 rounded-md" />
        <div className="absolute top-3 right-3 w-20 h-5 bg-zinc-300 dark:bg-zinc-700 rounded-md" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-3/4 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-md" />
          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Specs Grid Skeleton */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg" />
          <div className="h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg" />
        </div>

        {/* Button Skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-10 bg-amber-500/20 rounded-xl" />
          <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const PartCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse p-4 flex flex-col justify-between h-[280px]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-20 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
        <div className="w-4/5 h-5 bg-zinc-300 dark:bg-zinc-700 rounded" />
        <div className="w-32 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="w-24 h-6 bg-zinc-300 dark:bg-zinc-700 rounded" />
        <div className="w-full h-9 bg-amber-500/20 rounded-xl" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-zinc-100 dark:border-zinc-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};
