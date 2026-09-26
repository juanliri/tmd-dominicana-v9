import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Scale, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Calculator, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Truck,
  Building,
  FileText
} from 'lucide-react';
import { Machine } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface AboveFoldConversionDeckProps {
  onNavigate: (route: string) => void;
  onOpenQuoteModal: (machine?: Machine) => void;
  onScrollToCatalog: () => void;
  onScrollToTradeIn: () => void;
  featuredMachines?: Machine[];
}

export const AboveFoldConversionDeck: React.FC<AboveFoldConversionDeckProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onScrollToCatalog,
  onScrollToTradeIn,
  featuredMachines = [],
}) => {
  // Mini interactive state for the quick financing calculator teaser
  const [selectedInvestment, setSelectedInvestment] = useState<number>(85000);
  const [selectedTermMonths, setSelectedTermMonths] = useState<number>(48);

  // Calculate estimated monthly payment (approximate 8.5% annual leasing rate)
  const monthlyRate = 0.085 / 12;
  const estimatedMonthlyUsd = Math.round(
    (selectedInvestment * (monthlyRate * Math.pow(1 + monthlyRate, selectedTermMonths))) /
    (Math.pow(1 + monthlyRate, selectedTermMonths) - 1)
  );
  const estimatedMonthlyDop = Math.round(estimatedMonthlyUsd * USD_TO_DOP_RATE);

  return (
    <div className="w-full relative z-20 mt-4 sm:mt-6 pt-4 border-t border-white/[0.08] font-display">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="type-kicker text-[#e0a22a] text-xs sm:text-sm">
            ACCIONES COMERCIALES DIRECTAS • SIN ESPERAS
          </span>
        </div>
        <span className="type-badge text-zinc-400 hidden sm:inline-block">
          DGII B01/B15 • LEASING RD • ENTREGA INMEDIATA
        </span>
      </div>

      {/* 3 High-Conversion Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* CARD 1: SOLICITAR COTIZACIÓN (REQUEST QUOTE) - Pilot Trial: Glossy Obsidian & Calibrated Gold */}
        <div className="group relative rounded-[5px] bg-gradient-to-b from-[#15151c]/95 via-[#0c0c10]/98 to-[#030305] border border-white/[0.1] hover:border-[#d99b26]/50 p-3.5 sm:p-5 transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(217,155,38,0.12)] overflow-hidden">
          {/* Subtle Top Specular Sheen */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

          <div className="space-y-2.5 sm:space-y-3 relative z-10">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-gradient-to-b from-[#1a1a24] to-[#08080c] border border-white/[0.12] text-[#e0a22a] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <FileSpreadsheet className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-[3px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                PROFORMA B01/B15
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white group-hover:text-[#e0a22a] transition-colors flex items-center gap-1.5">
                <span>SOLICITAR COTIZACIÓN</span>
                <ChevronRight className="w-4 h-4 text-[#e0a22a] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal mt-1 leading-relaxed">
                Emita cotización formal con comprobante fiscal DGII, desglose de ITBIS, exenciones mineras o viales y despacho a obra.
              </p>
            </div>

            <div className="space-y-1 sm:space-y-1.5 pt-0.5 sm:pt-1 font-display">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>DESCUENTO ESPECIAL POR LOTE DE 2+ UNIDADES</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>DESCARGA INMEDIATA EN PDF CON CÓDIGO NCF</span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-white/[0.08] flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => {
                if (featuredMachines.length > 0) {
                  onOpenQuoteModal(featuredMachines[0]);
                } else {
                  onNavigate('#/checkout');
                }
              }}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] active:from-[#c58b1f] text-zinc-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(217,155,38,0.25)] cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>COTIZAR EN LÍNEA</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('#/checkout')}
              className="py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-b from-[#181820] to-[#07070a] hover:from-[#22222c] hover:to-[#0f0f14] text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs transition-all cursor-pointer border border-white/[0.1] shadow-sm"
              title="Ir a Generador de Proformas"
            >
              NCF EXPRESS
            </button>
          </div>
        </div>

        {/* CARD 2: FINANCIAMIENTO & LEASING */}
        <div className="group relative rounded-[5px] bg-gradient-to-b from-[#15151c]/95 via-[#0c0c10]/98 to-[#030305] border border-white/[0.1] hover:border-[#d99b26]/50 p-3.5 sm:p-5 transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(217,155,38,0.12)] overflow-hidden">
          {/* Subtle Top Specular Sheen */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

          <div className="space-y-2.5 sm:space-y-3 relative z-10">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-gradient-to-b from-[#1a1a24] to-[#08080c] border border-white/[0.12] text-[#e0a22a] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <Scale className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-[3px] bg-[#14141e]/90 text-[#e0a22a] border border-[#d99b26]/40 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                0% INICIAL • 24H
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white group-hover:text-[#e0a22a] transition-colors flex items-center gap-1.5">
                <span>FINANCIAMIENTO & LEASING</span>
                <ChevronRight className="w-4 h-4 text-[#e0a22a] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal mt-1 leading-relaxed">
                Planes comerciales con Banco Popular, BHD, Banreservas y JCB Finance. Plazos flexibles de 12 a 60 meses.
              </p>
            </div>

            {/* Quick Teaser Calculator */}
            <div className="bg-[#07070b] rounded-[4px] p-2.5 sm:p-3 border border-white/[0.08] space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-zinc-400">CUOTA EST. ({selectedTermMonths}M):</span>
                <span className="font-mono font-black text-[#e0a22a] text-xs sm:text-sm">
                  US$ {estimatedMonthlyUsd.toLocaleString()}/MES
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 font-mono font-bold uppercase tracking-wider">
                <span>EQ. EN PESOS:</span>
                <span className="text-zinc-300">RD$ {estimatedMonthlyDop.toLocaleString()}/MES</span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-white/[0.08] flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={() => onNavigate('#/financing')}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] active:from-[#c58b1f] text-zinc-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(217,155,38,0.25)] cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>SIMULAR LEASING</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('#/financing')}
              className="py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-b from-[#181820] to-[#07070a] hover:from-[#22222c] hover:to-[#0f0f14] text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs transition-all cursor-pointer border border-white/[0.1] shadow-sm"
              title="Solicitar Pre-Aprobación Bancaria"
            >
              PRE-APROBAR
            </button>
          </div>
        </div>

        {/* CARD 3: VENTA DIRECTA & TRADE-IN */}
        <div className="group relative rounded-[5px] bg-gradient-to-b from-[#15151c]/95 via-[#0c0c10]/98 to-[#030305] border border-white/[0.1] hover:border-[#d99b26]/50 p-3.5 sm:p-5 transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] flex flex-col justify-between hover:shadow-[0_12px_36px_rgba(217,155,38,0.12)] overflow-hidden">
          {/* Subtle Top Specular Sheen */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

          <div className="space-y-2.5 sm:space-y-3 relative z-10">
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-gradient-to-b from-[#1a1a24] to-[#08080c] border border-white/[0.12] text-[#e0a22a] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <span className="px-2.5 py-0.5 sm:py-1 rounded-[3px] bg-[#14141e]/90 text-zinc-200 border border-white/[0.12] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                SHOWROOM KM 22
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white group-hover:text-[#e0a22a] transition-colors flex items-center gap-1.5">
                <span>VENTA DIRECTA & TRADE-IN</span>
                <ChevronRight className="w-4 h-4 text-[#e0a22a] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal mt-1 leading-relaxed">
                Compre unidades listas para despacho inmediato en patio o venda su flota usada con tasación y pago bancario en 24-48h.
              </p>
            </div>

            <div className="space-y-1 sm:space-y-1.5 pt-0.5 sm:pt-1 font-display">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e0a22a] shrink-0" />
                <span>DESPACHO DIRECTO DESDE KM 22, AUTOPISTA DUARTE</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>RECIBIMOS SU EQUIPO ACTUAL AL MEJOR VALOR</span>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 mt-2.5 sm:mt-3 border-t border-white/[0.08] flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={onScrollToCatalog}
              className="flex-1 py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-r from-[#d99b26] via-[#e5a83b] to-[#d99b26] hover:from-[#e5a83b] hover:to-[#f0b54d] active:from-[#c58b1f] text-zinc-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(217,155,38,0.25)] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>VER SHOWROOM</span>
            </button>
            <button
              type="button"
              onClick={onScrollToTradeIn}
              className="py-2.5 sm:py-3 px-3 rounded-[3px] bg-gradient-to-b from-[#181820] to-[#07070a] hover:from-[#22222c] hover:to-[#0f0f14] text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center gap-1 border border-white/[0.1] shadow-sm"
              title="Vender o Recibir Pago por Maquinaria"
            >
              <RefreshCw className="w-4 h-4 text-[#e0a22a]" />
              <span>TRADE-IN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
