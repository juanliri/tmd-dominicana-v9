import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Share2, 
  Download, 
  FileText, 
  RotateCw, 
  Video, 
  Layers, 
  Award, 
  DollarSign, 
  ChevronRight, 
  Calendar, 
  FileSpreadsheet, 
  HelpCircle, 
  Cpu, 
  Zap, 
  Crosshair, 
  Gauge, 
  TrendingDown, 
  Check, 
  Building2, 
  Fuel, 
  QrCode,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Machine } from '../../types';
import { useCart } from '../../context/CartContext';
import { useComparison } from '../../context/ComparisonContext';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { downloadProductQrCode } from '../../utils/qrExporter';
import { generateSingleMachineSpecPdf } from '../../services/catalogPdfExport';
import { useNotifications } from '../../context/NotificationContext';
import { triggerHaptic } from '../../utils/haptics';

interface MachineDetailFlagshipViewProps {
  machine: Machine;
  onNavigate: (route: string) => void;
  onBackToCatalog: () => void;
  onOpen360?: (machine: Machine) => void;
  onOpenTestDrive?: (machine: Machine) => void;
}

export const MachineDetailFlagshipView: React.FC<MachineDetailFlagshipViewProps> = ({
  machine,
  onNavigate,
  onBackToCatalog,
  onOpen360,
  onOpenTestDrive
}) => {
  const { addMachineToQuote, addToCart, currency, setCurrency, exchangeRate } = useCart();
  const { toggleMachineCompare, isComparing, openComparison } = useComparison();
  const { pushToast } = useNotifications();

  // Active Gallery Media Image (default to main machine photo)
  const [activeImage, setActiveImage] = useState<string>(machine.image);
  const [activeTab, setActiveTab] = useState<'specs' | 'implements' | 'maintenance' | 'audit' | 'tco'>('specs');
  
  // Interactive Financing Simulator State
  const [financingDownPaymentPercent, setFinancingDownPaymentPercent] = useState<number>(20);
  const [financingMonths, setFinancingMonths] = useState<number>(48);

  // Currency Formatter
  const formatPriceValue = (usd: number) => {
    if (currency === 'DOP') {
      return `RD$ ${Math.round(usd * exchangeRate).toLocaleString('es-DO')}`;
    }
    return `US$ ${usd.toLocaleString('en-US')}`;
  };

  // Financing Calculation
  const downPaymentAmount = machine.basePriceUsd * (financingDownPaymentPercent / 100);
  const financedPrincipal = machine.basePriceUsd - downPaymentAmount;
  const annualInterestRate = 0.0875; // 8.75% annual rate
  const monthlyRate = annualInterestRate / 12;
  const estimatedMonthlyPayment = Math.round(
    (financedPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, financingMonths))) / 
    (Math.pow(1 + monthlyRate, financingMonths) - 1)
  );

  const handleShare = async () => {
    triggerHaptic();
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${machine.brand} ${machine.name} - TMD Dominicana`,
          text: `Ficha técnica oficial de ${machine.name} (${machine.powerHp} HP) disponible en Patio Km 22 Autopista Duarte.`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    pushToast({
      title: 'Enlace Copiado',
      body: 'Enlace de la ficha técnica copiado al portapapeles.',
      type: 'system'
    });
  };

  const handleDownloadPdf = async () => {
    triggerHaptic();
    pushToast({
      title: 'Ficha Técnica Oficial',
      body: 'Generando Ficha Técnica Oficial en PDF con sellos DGII...',
      type: 'system'
    });
    try {
      const doc = generateSingleMachineSpecPdf({
        machine,
        downPaymentPercent: financingDownPaymentPercent,
        loanTermMonths: financingMonths,
        targetBank: 'Banco Popular Dominicano'
      });
      doc.save(`Ficha_Tecnica_${machine.brand}_${machine.name.replace(/\s+/g, '_')}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleEmitProforma = () => {
    triggerHaptic();
    addMachineToQuote(machine);
    onNavigate('#/checkout');
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Hola TMD Dominicana, estoy interesado en la unidad oficial ${machine.brand} ${machine.name} (MOD. ${machine.modelCode}) con precio de lista ${formatPriceValue(machine.basePriceUsd)}. Solicito proforma formal con NCF B01.`
    );
    window.open(`https://wa.me/18095601234?text=${text}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
      
      {/* 1. TOP EXECUTIVE BREADCRUMB & BACK NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-14 sm:top-16 z-30">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Back & Breadcrumb Trail */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-medium">
            <button
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold transition-all cursor-pointer border border-slate-200 dark:border-white/[0.06] active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
              <span>Volver al Catálogo</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
            <button onClick={() => onNavigate('#/home')} className="hover:text-amber-500 transition-colors cursor-pointer">
              Inicio
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
            <button onClick={onBackToCatalog} className="hover:text-amber-500 transition-colors cursor-pointer">
              Maquinaria Pesada
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
              {machine.brand} {machine.modelCode}
            </span>
          </div>

          {/* Quick Share, Compare & Currency Switcher */}
          <div className="flex items-center gap-2">
            {/* Currency Pill */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-[4px] border border-slate-200 dark:border-white/[0.08] font-mono text-[10px] font-black">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  currency === 'USD' ? 'bg-amber-400 text-black shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('DOP')}
                className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  currency === 'DOP' ? 'bg-amber-400 text-black shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                RD$
              </button>
            </div>

            {/* Compare Button */}
            <button
              onClick={() => {
                toggleMachineCompare(machine.id);
                openComparison();
              }}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isComparing(machine.id)
                  ? 'bg-amber-400/20 border-amber-400 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{isComparing(machine.id) ? 'En Comparativa' : 'Comparar'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-[4px] bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
              title="Compartir Ficha Técnica"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLAGSHIP HERO GRID (Left 7 Columns Visual Studio + Right 5 Columns Executive Buy Deck) */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* LEFT COLUMN: 4K MACHINERY MEDIA STAGE & ACTION BAR */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Cinema Viewport with CAD Brackets */}
            <div className="relative aspect-[16/10] w-full rounded-[6px] overflow-hidden bg-zinc-950 border border-slate-200 dark:border-white/[0.1] shadow-2xl group">
              {/* Subtle gold radial ambient backing */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,155,38,0.12)_0%,transparent_75%)] pointer-events-none" />

              {/* Viewfinder CAD Corner Alignment Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400 pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400 pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400 pointer-events-none z-20" />

              {/* High-Resolution Machinery Image */}
              <img
                src={activeImage}
                alt={machine.name}
                className="w-full h-full object-cover object-center filter brightness-105 contrast-110 transition-transform duration-700 group-hover:scale-103"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('tmd_coming_soon')) {
                    target.src = '/images/tmd_coming_soon.jpg';
                  }
                }}
              />

              {/* Subtle top/bottom legibility gradients */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 via-transparent to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-10" />

              {/* Floating Badges inside Viewport */}
              <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-20">
                <div className="bg-zinc-950/90 backdrop-blur-md px-3 py-1 rounded-[4px] text-[11px] font-black text-amber-400 border border-amber-400/40 uppercase tracking-wider font-display flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{machine.brand} • {machine.modelCode}</span>
                </div>

                <div className="bg-zinc-950/90 backdrop-blur-md px-3 py-1 rounded-[4px] text-[10px] font-bold text-zinc-200 border border-white/[0.12] uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Km 22 · Stock Físico Listo</span>
                </div>
              </div>

              {/* Interactive Visual Studio Overlay Bar (Bottom Inside Photo) */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  {onOpen360 && (
                    <button
                      type="button"
                      onClick={() => onOpen360(machine)}
                      className="px-3 py-1.5 rounded-[4px] bg-zinc-950/90 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/50 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
                    >
                      <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>Giro 360° Interactivo</span>
                    </button>
                  )}
                  {onOpenTestDrive && (
                    <button
                      type="button"
                      onClick={() => onOpenTestDrive(machine)}
                      className="px-3 py-1.5 rounded-[4px] bg-zinc-950/90 hover:bg-zinc-800 text-white border border-white/[0.15] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer backdrop-blur-md"
                    >
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Test Drive en Obra</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-zinc-400 hidden sm:block bg-zinc-950/80 px-2.5 py-1 rounded-[3px] border border-white/[0.08]">
                  CAD TELEMETRY 16:10
                </div>
              </div>
            </div>

            {/* Refined Engineering Tool Strip (Clean Segmented Action Bar replacing 13 cluttered buttons) */}
            <div className="p-3 rounded-[6px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 font-display">
                    Herramientas Técnicas & Protocolos
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  DOCUMENTACIÓN HOMOLOGADA MOPC
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-zinc-950 hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer font-bold active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <span className="block text-[11px] font-black leading-tight">Ficha PDF</span>
                    <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-normal">Brochure Oficial</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => downloadProductQrCode(machine, 'machinery')}
                  className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-zinc-950 hover:bg-amber-400 hover:text-black dark:hover:bg-amber-400 dark:hover:text-black text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer font-bold active:scale-[0.98]"
                >
                  <QrCode className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <span className="block text-[11px] font-black leading-tight">Exportar QR</span>
                    <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-normal">Rótulo de Patio</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer font-bold active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <div className="text-left">
                    <span className="block text-[11px] font-black leading-tight">Auditoría PDI</span>
                    <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-normal">85 Puntos Físicos</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tco')}
                  className="p-2.5 rounded-[4px] bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer font-bold active:scale-[0.98]"
                >
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <span className="block text-[11px] font-black leading-tight">Cálculo TCO</span>
                    <span className="block text-[9px] text-slate-500 dark:text-zinc-400 font-normal">Retorno a 5 Años</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 4 CAD Engineering Telemetry Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  POTENCIA MOTOR
                </span>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-[#e0a22a] font-mono">
                  {machine.powerHp} HP
                </span>
              </div>

              <div className="p-3 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  PESO OPERATIVO
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                  {(machine.operatingWeightKg / 1000).toFixed(1)} TONELADAS
                </span>
              </div>

              <div className="p-3 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  MOTORIZACIÓN
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                  {machine.engine}
                </span>
              </div>

              <div className="p-3 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                  CAPACIDAD / CARGA
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                  {machine.bucketCapacityM3 ? `${machine.bucketCapacityM3} m³` : 'Heavy Duty'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: EXECUTIVE BUY & LEASING CONSOLE (Sticky Desktop Deck) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <div className="p-5 sm:p-6 rounded-[6px] bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 border border-slate-200 dark:border-white/[0.1] shadow-xl space-y-5">
              
              {/* Header Title & Warranty Slogan */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-[3px] bg-amber-400/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                    {machine.brand} OFICIAL
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                    MOD. {machine.modelCode}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white leading-tight font-display">
                  {machine.name}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                  {machine.description}
                </p>
              </div>

              {/* Price & Commercial Valuation Box */}
              <div className="p-4 rounded-[5px] bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase block">
                      INVERSIÓN ESTIMADA ({currency})
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      {formatPriceValue(machine.basePriceUsd)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase block">
                      TASA OFICIAL BCRD
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block">
                      1 USD = RD$ {exchangeRate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Fiscal DGII Shield Note */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Factura NCF B01 Fiscal</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ITBIS Transparentado
                  </span>
                </div>
              </div>

              {/* Interactive Leasing RD Simulator */}
              <div className="p-4 rounded-[5px] bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-zinc-200">
                      Simulador de Leasing Bancario RD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">
                    PRE-APROBACIÓN 24H
                  </span>
                </div>

                {/* Down Payment & Months Sliders */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-zinc-400">Inicial: {financingDownPaymentPercent}%</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPriceValue(downPaymentAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={financingDownPaymentPercent}
                    onChange={(e) => setFinancingDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] font-mono pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Plazo: {financingMonths} Meses</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatPriceValue(estimatedMonthlyPayment)}/mes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="60"
                    step="12"
                    value={financingMonths}
                    onChange={(e) => setFinancingMonths(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-200 dark:border-white/[0.04] pt-2 flex items-center justify-between font-mono">
                  <span>Bancos Aliados: Popular, BHD, Banreservas</span>
                  <span className="text-amber-500 font-bold">0% Penalidad Prepago</span>
                </div>
              </div>

              {/* Primary Call to Action Buttons (5-Star Design System) */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleEmitProforma}
                  className="w-full py-3.5 px-4 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Emitir Proforma Fiscal NCF B01</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 px-4 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-md shadow-emerald-600/15"
                >
                  <Phone className="w-4 h-4" />
                  <span>Cotizar por WhatsApp Directo</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="py-2.5 px-3 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all border border-slate-300 dark:border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-500" />
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('#/checkout')}
                    className="py-2.5 px-3 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all border border-slate-300 dark:border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Ver Carrito</span>
                  </button>
                </div>
              </div>

              {/* Official Warranty & Coverage Guarantee */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1 font-medium">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Garantía Oficial TMD 2 Años / 2,000h</span>
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                  Taller Móvil 24/7
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DEEP-DIVE TECHNICAL SPECIFICATIONS & WORKSHOP TABS */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-12 sm:mt-16">
        
        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] overflow-x-auto pb-2 scrollbar-none font-display">
          {[
            { id: 'specs', label: 'Ficha Técnica Completa', icon: Layers },
            { id: 'implements', label: 'Implementos OEM & Accesorios', icon: Wrench },
            { id: 'maintenance', label: 'Mantenimiento & Taller Km 22', icon: Clock },
            { id: 'audit', label: 'Auditoría Física en Patio', icon: ShieldCheck },
            { id: 'tco', label: 'Retorno de Inversión TCO', icon: TrendingDown },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-amber-400 text-black border-amber-500 shadow-md'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="mt-6">
          {/* TAB 1: SPECIFICATIONS MATRIX */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machine.specs && machine.specs.length > 0 ? (
                machine.specs.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] flex items-center justify-between shadow-xs"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                      {spec.label}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono text-right">
                      {spec.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-8 text-center text-slate-500 dark:text-zinc-400 font-mono text-xs">
                  Especificaciones técnicas detalladas configuradas bajo certificación OEM.
                </div>
              )}

              {/* Standard TMD Inclusion Cards */}
              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] flex items-center justify-between shadow-xs">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  Cabina Climatizada
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ROPS/FOPS Nivel 2
                </span>
              </div>

              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] flex items-center justify-between shadow-xs">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  Telemetría Satelital
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                  LiveLink™ 24/7 Incluido
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: IMPLEMENTS */}
          {activeTab === 'implements' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Martillo Hidráulico Rompedor OEM', desc: 'Fuerza de impacto optimizada para roca coralina y hormigón armado.', price: 'Desde US$ 5,800' },
                { name: 'Acople Rápido Hidráulico (Quick Hitch)', desc: 'Cambio de cuchara a martillo en menos de 30 segundos desde cabina.', price: 'Desde US$ 1,950' },
                { name: 'Cucharón de Zanjas 300mm', desc: 'Perfil reforzado con dientes Hardox 450 para zanjeo de tuberías.', price: 'Desde US$ 1,200' },
              ].map((imp, idx) => (
                <div key={idx} className="p-4 rounded-[5px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-display">{imp.name}</h3>
                    <span className="text-xs font-black font-mono text-amber-500">{imp.price}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">{imp.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="p-6 rounded-[6px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-4">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white font-display">
                Protocolo de Mantenimiento Preventivo Recomendado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-amber-500 font-bold block mb-1">250 HORAS</span>
                  <span>Cambio de aceite de motor y filtros primarios.</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-amber-500 font-bold block mb-1">500 HORAS</span>
                  <span>Filtros hidráulicos y análisis tribológico SOS-OIL.</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-amber-500 font-bold block mb-1">1,000 HORAS</span>
                  <span>Fluidos de transmisión, ejes y calibración de presiones.</span>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-amber-500 font-bold block mb-1">2,000 HORAS</span>
                  <span>Overhaul preventivo de inyectores y sistema de refrigeración.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT */}
          {activeTab === 'audit' && (
            <div className="p-6 rounded-[6px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">INSPECCIÓN PDI PATIO KM 22</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">UNIDAD FÍSICA CERTIFICADA 0 HORAS</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  APROBADA PARA ENTREGA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.04]">
                  <span className="text-slate-500 block text-[10px]">CHASIS / SERIE:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">TMD-{machine.brand.toUpperCase()}-2026-{machine.modelCode.replace(/\s+/g, '')}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.04]">
                  <span className="text-slate-500 block text-[10px]">HORÓMETRO ACTUAL:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">3.5 HORAS (PRUEBA PDI)</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.04]">
                  <span className="text-slate-500 block text-[10px]">UBICACIÓN FÍSICA:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Patio Maniobras Km 22, Autopista Duarte</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TCO */}
          {activeTab === 'tco' && (
            <div className="p-6 rounded-[6px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] space-y-4">
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white font-display">
                Análisis de Costo Total de Propiedad a 5 Años
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                La motorización OEM EcoMAX y bombas de caudal variable reducen el consumo en hasta un 16% comparado con unidades convencionales, generando un ahorro proyectado de hasta US$ 14,200 en combustible durante un ciclo operacional de 8,000 horas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
