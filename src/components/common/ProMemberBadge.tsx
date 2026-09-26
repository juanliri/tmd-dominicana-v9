import React from 'react';
import { Crown, Sparkles, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { getProTierForPoints } from '../../data/proMemberData';

interface ProMemberBadgeProps {
  points?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum';
  memberNumber?: string;
  variant?: 'pill' | 'header_card' | 'tag' | 'mini';
  onClick?: () => void;
  className?: string;
}

export const ProMemberBadge: React.FC<ProMemberBadgeProps> = ({
  points = 1850,
  tier,
  memberNumber = 'TMD-PRO-8492',
  variant = 'pill',
  onClick,
  className = ''
}) => {
  const tierInfo = tier ? (tier === 'Platinum' ? getProTierForPoints(3000) : tier === 'Gold' ? getProTierForPoints(1500) : getProTierForPoints(500)) : getProTierForPoints(points);

  // Variant: Mini tag for product listings or checkout line items
  if (variant === 'mini') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${className}`}>
        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
        <span>TMD Pro -{tierInfo.partsDiscountPercent}%</span>
      </span>
    );
  }

  // Variant: Tag for parts cards
  if (variant === 'tag') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs ${onClick ? 'cursor-pointer hover:border-amber-500 transition-colors' : ''} ${className}`}
      >
        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        <span>Precio TMD Pro ({tierInfo.tier})</span>
        <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded text-[10px] font-black">
          -{tierInfo.partsDiscountPercent}%
        </span>
      </div>
    );
  }

  // Variant: Pill for Main Navbar / Header
  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-black transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${className}`}
        title="Ver estatus y beneficios TMD Pro-Member"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30 group-hover:rotate-12 transition-transform" />
        <span className="tracking-tight hidden sm:inline">TMD Pro-Member</span>
        <span className="sm:hidden font-mono">Pro</span>
        <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-black font-extrabold text-[10px] uppercase">
          {tierInfo.tier}
        </span>
      </button>
    );
  }

  // Variant: Grand Header Card (for Portal & Dashboard)
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
        tierInfo.tier === 'Platinum'
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-950 border-amber-400/50 shadow-lg'
          : tierInfo.tier === 'Gold'
            ? 'bg-gradient-to-br from-zinc-900 via-amber-950/40 to-zinc-950 border-amber-500/40 shadow-md'
            : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-700 shadow-sm'
      } text-white ${onClick ? 'cursor-pointer hover:border-amber-400' : ''} ${className}`}
    >
      {/* Background glow decoration */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black shadow-md shrink-0">
            <Crown className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                TMD Pro-Member
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                {tierInfo.tier} Tier
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="font-mono text-amber-400 font-bold">{memberNumber}</span>
              <span>•</span>
              <span className="text-zinc-300 font-medium">-{tierInfo.partsDiscountPercent}% en Repuestos</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
            Puntos Acumulados
          </span>
          <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
            {points.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
