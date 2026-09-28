import React from 'react';

interface MachinerySkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'machine' | 'engine';
}

export const MachinerySkeletonLoader: React.FC<MachinerySkeletonLoaderProps> = ({
  count = 3,
  type = 'machine'
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[3px] bg-zinc-900/80 border border-zinc-800 p-4 space-y-3 font-mono"
        >
          {/* Shimmer sweep animation overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-amber-400/5 to-transparent" />

          {/* Machine silhouette mockup skeleton */}
          <div className="relative h-44 w-full bg-zinc-950/90 rounded-[2px] border border-zinc-850 flex items-center justify-center p-3 overflow-hidden">
            {/* Outline of Boom & Tracks */}
            <div className="w-full h-full flex flex-col justify-between opacity-20">
              {/* Boom & Arm line */}
              <div className="flex justify-between items-start">
                <div className="h-2 w-16 bg-amber-400/40 rounded-full" />
                <div className="h-2 w-24 bg-amber-400/30 rounded-full rotate-12" />
              </div>

              {/* Cab / House block */}
              <div className="h-16 w-28 bg-zinc-800 rounded-[2px] self-center" />

              {/* Undercarriage tracks */}
              <div className="h-4 w-full bg-zinc-800 rounded-[2px] flex items-center justify-around px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            <span className="absolute bottom-2 right-2 text-[9px] font-bold text-amber-400/60 uppercase tracking-wider">
              Cargando Telemetría...
            </span>
          </div>

          {/* Title & Badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-zinc-800 rounded-[2px]" />
              <div className="h-4 w-14 bg-amber-400/20 rounded-[2px]" />
            </div>
            <div className="h-5 w-3/4 bg-zinc-800 rounded-[2px]" />
            <div className="h-3 w-1/2 bg-zinc-850 rounded-[2px]" />
          </div>

          {/* Specs grid skeleton */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
            <div className="h-8 bg-zinc-950 rounded-[2px]" />
            <div className="h-8 bg-zinc-950 rounded-[2px]" />
            <div className="h-8 bg-zinc-950 rounded-[2px]" />
          </div>

          {/* Footer action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <div className="h-6 w-24 bg-zinc-800 rounded-[2px]" />
            <div className="h-8 w-28 bg-amber-400/20 rounded-[2px]" />
          </div>
        </div>
      ))}
    </div>
  );
};
