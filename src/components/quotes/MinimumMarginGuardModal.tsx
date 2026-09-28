import React, { useState } from 'react';
import {
  ShieldAlert,
  Percent,
  TrendingDown,
  DollarSign,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

interface MinimumMarginGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  listPriceUsd?: number;
  onApplyDiscount?: (discountPercent: number, finalPriceUsd: number) => void;
}

export const MinimumMarginGuardModal: React.FC<MinimumMarginGuardModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora 22 Ton',
  listPriceUsd = 165000,
  onApplyDiscount
}) => {
  const [discountPercent, setDiscountPercent] = useState<number>(6);
  const [gmPin, setGmPin] = useState<string>('');
  const [pinAuthorized, setPinAuthorized] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);

  if (!isOpen) return null;

  // Base factory cost + customs/logistics (approx 83.5% of list price)
  const factoryCostUsd = Math.round(listPriceUsd * 0.835);

  // Computed sale price and margin
  const discountAmountUsd = Math.round(listPriceUsd * (discountPercent / 100));
  const finalSalePriceUsd = listPriceUsd - discountAmountUsd;
  const grossProfitUsd = finalSalePriceUsd - factoryCostUsd;
  const grossMarginPercent = parseFloat(((grossProfitUsd / finalSalePriceUsd) * 100).toFixed(1));

  const isBelowMinimum = grossMarginPercent < 12.0;

  const handleAuthorizePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (gmPin === '9922' || gmPin === '2026') {
      setPinAuthorized(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleConfirmDiscount = () => {
    if (isBelowMinimum && !pinAuthorized) {
      alert('Se requiere autorización de Gerencia General para descuentos con margen menor al 12%.');
      return;
    }
    if (onApplyDiscount) {
      onApplyDiscount(discountPercent, finalSalePriceUsd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-[3px] border ${
              isBelowMinimum
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                  isBelowMinimum ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'
                }`}>
                  POLÍTICA COMERCIAL TMD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Margen Mínimo: 12.0%
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Control de Márgenes de Venta
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Machine Header */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">UNIDAD A COTIZAR:</span>
              <span className="font-bold text-white text-xs">{machineName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase block">PRECIO DE LISTA:</span>
              <span className="font-bold text-amber-400 font-mono text-xs">US$ {listPriceUsd.toLocaleString()}</span>
            </div>
          </div>

          {/* Discount Slider */}
          <div className="space-y-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-[3px]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold uppercase">Descuento Comercial:</span>
              <span className="text-amber-400 font-black text-sm">{discountPercent}% (US$ -{discountAmountUsd.toLocaleString()})</span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              step="0.5"
              value={discountPercent}
              onChange={e => setDiscountPercent(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0% (Sin Descuento)</span>
              <span>8% (Límite Asesor)</span>
              <span>18% (Excepcional)</span>
            </div>
          </div>

          {/* Margin Analysis Strip */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-[2px]">
              <span className="text-[10px] text-zinc-500 uppercase block">PRECIO FINAL</span>
              <span className="text-sm font-black text-white font-mono">US$ {finalSalePriceUsd.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-[2px]">
              <span className="text-[10px] text-zinc-500 uppercase block">UTILIDAD BRUTA</span>
              <span className={`text-sm font-black font-mono ${grossProfitUsd > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                US$ {grossProfitUsd.toLocaleString()}
              </span>
            </div>

            <div className={`p-2.5 rounded-[2px] border ${
              isBelowMinimum
                ? 'bg-red-500/10 border-red-500/40 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
            }`}>
              <span className="text-[10px] uppercase block font-bold">MARGEN BRUTO</span>
              <span className="text-sm font-black font-mono">{grossMarginPercent}%</span>
            </div>
          </div>

          {/* Alert or Authorization Status */}
          {isBelowMinimum ? (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-[3px] space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>BLOQUEO DE MARGEN (&lt; 12.0%): REQUIERE AUTORIZACIÓN</span>
              </div>
              <p className="text-[11px] font-sans text-zinc-300 leading-relaxed">
                El margen bruto de {grossMarginPercent}% viola el límite mínimo de venta establecido por la Junta Directiva. 
                Debe ingresar el PIN de la Gerencia General (PIN: 9922) para autorizar la emisión de la proforma.
              </p>

              {!pinAuthorized ? (
                <form onSubmit={handleAuthorizePin} className="flex gap-2 pt-1">
                  <input
                    type="password"
                    maxLength={4}
                    value={gmPin}
                    onChange={e => setGmPin(e.target.value)}
                    placeholder="PIN de Gerencia (4 dígitos)"
                    className="flex-1 p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-white text-xs font-mono focus:border-red-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-[2px] bg-red-500 hover:bg-red-400 text-white font-bold uppercase text-xs cursor-pointer"
                  >
                    Autorizar
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Autorización Gerencial Aprobada con Éxito (PIN Validador #9922)</span>
                </div>
              )}

              {pinError && (
                <span className="text-[10px] text-red-400 block font-mono">
                  PIN incorrecto. Contacte a la Gerencia General de TMD.
                </span>
              )}
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[3px] flex items-center gap-2.5 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Margen comercial óptimo ({grossMarginPercent}% ≥ 12.0%). Proforma habilitada para emisión inmediata.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 uppercase cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isBelowMinimum && !pinAuthorized}
            onClick={handleConfirmDiscount}
            className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Aplicar Descuento Autorizado</span>
          </button>
        </div>
      </div>
    </div>
  );
};
