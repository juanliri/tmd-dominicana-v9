import React, { useState } from 'react';
import { 
  Radio, 
  ArrowRight, 
  Play, 
  Pause, 
  Sparkles, 
  ChevronRight, 
  Tag, 
  Ship, 
  Wrench, 
  Truck, 
  Percent, 
  ExternalLink 
} from 'lucide-react';
import { TICKER_UPDATES, TickerUpdate } from '../data/tickerUpdates';

interface LiveMarqueeProps {
  onNavigate: (route: string) => void;
}

export const LiveMarquee: React.FC<LiveMarqueeProps> = ({ onNavigate }) => {
  const [isPaused, setIsPaused] = useState(false);

  const getBadgeIcon = (type: TickerUpdate['type']) => {
    switch (type) {
      case 'arrival':
        return <Ship className="w-3 h-3" />;
      case 'discount':
        return <Percent className="w-3 h-3" />;
      case 'service':
        return <Wrench className="w-3 h-3" />;
      case 'logistics':
        return <Truck className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const getBadgeClass = (color: TickerUpdate['badgeColor']) => {
    switch (color) {
      case 'emerald':
      case 'sky':
      case 'purple':
      case 'amber':
      default:
        return 'bg-zinc-800/90 text-amber-400 border-zinc-700/80 font-mono';
    }
  };

  // Duplicate items twice to ensure seamless infinite looping without gaps
  const displayItems = [...TICKER_UPDATES, ...TICKER_UPDATES];

  return (
    <div 
      className="relative w-full border-y border-zinc-200 dark:border-white/[0.08] bg-zinc-50/90 dark:bg-[#0a0a10]/95 backdrop-blur-md overflow-hidden transition-colors"
      role="region"
      aria-label="Actualizaciones en vivo de maquinaria y servicios"
    >
      <div className="flex items-center">
        {/* Left static Live Badge */}
        <div className="shrink-0 z-10 flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0c0c14] text-white shadow-md border-r border-white/[0.08]">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#d99b26] animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-[#e0a22a]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a22a] leading-none">
              Actualizaciones
            </span>
            <span className="text-[9px] font-medium text-zinc-400 leading-tight hidden sm:inline">
              Llegadas & Taller
            </span>
          </div>
        </div>

        {/* Scrolling Marquee Track */}
        <div 
          className="relative flex-1 overflow-hidden group cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle gradient edge masks for smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-[#0a0a10] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-[#0a0a10] to-transparent z-10 pointer-events-none" />

          <div 
            className={`animate-marquee py-2 ${isPaused ? 'animate-marquee-paused' : ''}`}
          >
            {displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => {
                  if (item.actionRoute) {
                    onNavigate(item.actionRoute);
                  }
                }}
                className="inline-flex items-center gap-3 px-5 py-1 text-xs text-zinc-700 dark:text-zinc-200 border-r border-zinc-200/80 dark:border-zinc-800/80 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors whitespace-nowrap"
              >
                {/* Badge Tag */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black tracking-wide ${getBadgeClass(item.badgeColor)}`}>
                  {getBadgeIcon(item.type)}
                  <span>{item.badge}</span>
                </span>

                {/* Timestamp */}
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {item.time}
                </span>

                {/* Headline & Detail */}
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {item.headline}:
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                  {item.detail}
                </span>

                {/* Action CTA link if provided */}
                {item.actionText && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Play/Pause Controller */}
        <div className="shrink-0 z-10 flex items-center px-2 py-2 bg-zinc-100/90 dark:bg-zinc-900/90 border-l border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Reanudar desplazamiento" : "Pausar desplazamiento"}
            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            aria-label={isPaused ? "Reanudar marquesina" : "Pausar marquesina"}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
