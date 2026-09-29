import React from 'react';
import { 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Copy, 
  Check, 
  Zap, 
  QrCode 
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../../data/catalog';

interface ProTierCardProps {
  memberName: string;
  companyName: string;
  memberNumber: string;
  memberSince: string;
  points: number;
  tierInfo: {
    tier: string;
    partsDiscountPercent: number;
    textColor: string;
    badgeBorder: string;
  };
  nextTier: {
    name: string;
    pointsRequired?: number;
    minPoints?: number;
    tier?: string;
  } | null;
  progressPercent: number;
  pointsToNext: number;
  isProMemberDiscountActive: boolean;
  onActivateDiscount: (active: boolean, discountPercent: number) => void;
  onOpenQrPass: () => void;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
}

export const ProTierCard: React.FC<ProTierCardProps> = ({
  memberName,
  companyName,
  memberNumber,
  memberSince,
  points,
  tierInfo,
  nextTier,
  progressPercent,
  pointsToNext,
  isProMemberDiscountActive,
  onActivateDiscount,
  onOpenQrPass,
  onCopyCode,
  copiedCode
}) => {
  return (
    <div className="relative overflow-hidden rounded-[5px] bg-zinc-950 border border-amber-500/30 text-white shadow-2xl font-mono">
      {/* Background glow & metallic carbon pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-amber-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Card Left: Identity & Badges */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black shadow-sm font-mono">
              <Crown className="w-3.5 h-3.5" />
              <span>TMD Pro-Member</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider border ${tierInfo.badgeBorder} ${tierInfo.textColor} bg-zinc-900/80 font-mono`}>
              <Sparkles className="w-3 h-3" />
              <span>Nivel {tierInfo.tier}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Verificado 2026</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 font-display uppercase">
              <span>{memberName}</span>
            </h2>
            <p className="text-sm font-semibold text-zinc-400 mt-1 font-sans">
              {companyName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 pt-1">
            <div className="bg-zinc-900/90 px-3 py-1.5 rounded-[2px] border border-zinc-800 flex items-center gap-2">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">ID Pro:</span>
              <span className="font-mono text-amber-400 font-black">{memberNumber}</span>
              <button
                type="button"
                onClick={() => onCopyCode(memberNumber)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copiar ID Pro"
              >
                {copiedCode === memberNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="bg-zinc-900/90 px-3 py-1.5 rounded-[2px] border border-zinc-800 flex items-center gap-2">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Miembro Desde:</span>
              <span className="font-bold text-zinc-200">{memberSince}</span>
            </div>

            <div className="bg-zinc-900/90 px-3 py-1.5 rounded-[2px] border border-zinc-800 flex items-center gap-2">
              <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Descuento Repuestos:</span>
              <span className="font-black text-amber-400">-{tierInfo.partsDiscountPercent}% Directo</span>
            </div>
          </div>
        </div>

        {/* Card Right: Points Balance Box & Next Tier Progress */}
        <div className="bg-zinc-900/95 border border-zinc-800/80 rounded-[3px] p-5 sm:p-6 w-full lg:w-80 shrink-0 shadow-lg space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block font-display">
                Puntos Acumulados
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
                <span>{points.toLocaleString()}</span>
                <span className="text-xs font-bold text-zinc-400">pts</span>
              </div>
            </div>
            <div className="p-2.5 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Approximate cash value */}
          <div className="text-xs text-zinc-400 bg-zinc-950/80 px-3 py-2 rounded-[2px] border border-zinc-800/60 flex justify-between items-center font-mono">
            <span>Valor Canjeable:</span>
            <span className="font-bold text-zinc-200">
              ~US$ {Math.round(points / 10)} / RD$ {Math.round((points / 10) * USD_TO_DOP_RATE).toLocaleString()}
            </span>
          </div>

          {/* Next Tier Progression */}
          {nextTier ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-zinc-400">Progreso a {nextTier.name}:</span>
                <span className="text-amber-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-[1px] bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block text-right font-mono">
                Faltan <strong className="text-white">{pointsToNext.toLocaleString()} pts</strong> para subir de nivel
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 p-2 rounded-[2px] border border-amber-500/20">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>¡Estatus Máximo Platinum Alcanzado!</span>
            </div>
          )}

          {/* Quick Action: Cart Discount */}
          <button
            type="button"
            onClick={() => onActivateDiscount(!isProMemberDiscountActive, tierInfo.partsDiscountPercent)}
            className={`w-full py-2.5 px-4 rounded-[2px] text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase ${
              isProMemberDiscountActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-400 hover:bg-amber-300 text-black shadow-sm active:scale-[0.98]'
            }`}
          >
            {isProMemberDiscountActive ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Descuento Activado en Carrito (-{tierInfo.partsDiscountPercent}%)</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Activar -{tierInfo.partsDiscountPercent}% en Mi Carrito</span>
              </>
            )}
          </button>

          {/* Show Digital QR Pass Button */}
          <button
            type="button"
            onClick={onOpenQrPass}
            className="w-full py-2 px-3 rounded-[2px] text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Pase Digital & QR de Almacén</span>
          </button>
        </div>
      </div>
    </div>
  );
};
