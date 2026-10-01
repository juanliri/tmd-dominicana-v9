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
  Layers, 
  Award, 
  DollarSign, 
  ChevronRight, 
  Calendar, 
  HelpCircle, 
  Cpu, 
  Zap, 
  Crosshair, 
  Gauge, 
  Check, 
  Building2, 
  QrCode,
  Sparkles,
  ExternalLink,
  Printer,
  Package,
  ShoppingCart,
  Boxes,
  MapPin,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { Part } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { downloadProductQrCode } from '../../utils/qrExporter';
import { triggerHaptic } from '../../utils/haptics';
import { RecentlyVerifiedBadge } from '../common/RecentlyVerifiedBadge';
import { LastScannedBadge } from '../common/LastScannedBadge';
import { InventoryAuditTrail } from '../common/InventoryAuditTrail';

interface PartDetailFlagshipViewProps {
  part: Part;
  onNavigate: (route: string) => void;
  onBackToCatalog: () => void;
  onOpenQr?: (part: Part) => void;
  onOpenLabelPdf?: (part: Part) => void;
}

export const PartDetailFlagshipView: React.FC<PartDetailFlagshipViewProps> = ({
  part,
  onNavigate,
  onBackToCatalog,
  onOpenQr,
  onOpenLabelPdf
}) => {
  const { addToCart, currency, setCurrency, exchangeRate } = useCart();
  const { pushToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'compatibility' | 'crossref' | 'installation' | 'warehouse'>('compatibility');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const currentRate = exchangeRate || USD_TO_DOP_RATE;

  // Real-time Pricing with NCF B01 Tax Breakdown
  const priceUsd = part.priceUsd * orderQuantity;
  const itbisUsd = priceUsd * 0.18;
  const totalWithItbisUsd = priceUsd + itbisUsd;

  const formatPriceValue = (usd: number) => {
    if (currency === 'DOP') {
      const val = Math.round(usd * currentRate);
      return `RD$ ${val.toLocaleString('es-DO')}`;
    }
    return `US$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleShare = async () => {
    triggerHaptic();
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Repuesto OEM: ${part.name} (P/N: ${part.partNumber}) - TMD Dominicana`,
          text: `Ficha técnica oficial del repuesto ${part.name} para ${part.brand}. Despacho directo desde Patio Km 22 Autopista Duarte.`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    pushToast({
      title: 'Enlace Copiado',
      body: 'Enlace al repuesto copiado al portapapeles con éxito.',
      type: 'system'
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleAddToCart = () => {
    triggerHaptic();
    for (let i = 0; i < orderQuantity; i++) {
      addToCart(part);
    }
    pushToast({
      title: 'Añadido a Cotización',
      body: `${orderQuantity}x ${part.name} (P/N: ${part.partNumber}) añadido a su carrito de despacho.`,
      type: 'system'
    });
  };

  const handleEmitProforma = () => {
    triggerHaptic();
    for (let i = 0; i < orderQuantity; i++) {
      addToCart(part);
    }
    onNavigate('#/checkout');
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Hola TMD Dominicana, solicito despacho inmediato para el repuesto:\n` +
      `• *Pieza:* ${part.name}\n` +
      `• *P/N:* ${part.partNumber}\n` +
      `• *Marca:* ${part.brand}\n` +
      `• *Cantidad:* ${orderQuantity} unidad(es)\n` +
      `• *Valor Unitario:* ${formatPriceValue(part.priceUsd)}\n` +
      `Favor confirmar disponibilidad en Patio Km 22 con Comprobante Fiscal NCF B01.`
    );
    window.open(`https://wa.me/18095601234?text=${text}`, '_blank');
  };

  const handleDownloadQr = async () => {
    triggerHaptic();
    pushToast({
      title: 'Exportando Rótulo QR',
      body: 'Generando rótulo QR de alta resolución para anaquel...',
      type: 'system'
    });
    await downloadProductQrCode(part, 'part');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20 font-sans">
      
      {/* 1. TOP EXECUTIVE BREADCRUMB & BACK NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl relative z-20">
        <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-black tracking-wider uppercase text-slate-800 dark:text-zinc-200 transition-colors border border-slate-300 dark:border-white/[0.08] active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-500" />
              <span>Volver a Repuestos</span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span className="cursor-pointer hover:text-amber-500" onClick={() => onNavigate('#/home')}>Inicio</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
              <span className="cursor-pointer hover:text-amber-500" onClick={onBackToCatalog}>Repuestos OEM</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
              <span className="text-amber-500 font-bold uppercase">{part.category}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
              <span className="text-slate-900 dark:text-white font-mono font-bold">{part.partNumber}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Currency Switcher */}
            <div className="inline-flex rounded-[4px] bg-slate-100 dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 text-[11px] font-black rounded-[3px] transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('DOP')}
                className={`px-2.5 py-1 text-[11px] font-black rounded-[3px] transition-all cursor-pointer ${
                  currency === 'DOP'
                    ? 'bg-amber-400 text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                RD$
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-white/[0.08] transition-colors active:scale-[0.98] cursor-pointer"
              title="Compartir ficha del repuesto"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{isCopied ? 'Copiado' : 'Compartir'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN FLAGSHIP PRODUCT DETAIL GRID */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ═══════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN (8 COLS): HIGH-RES VISUAL & TECHNICAL STRIP */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* Viewport Box */}
            <div className="relative rounded-[5px] overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-2xl">
              
              {/* CAD Corner Accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-500/70 z-20 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-500/70 z-20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-500/70 z-20 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-500/70 z-20 pointer-events-none" />

              {/* Status Header Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-[3px] bg-amber-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-md">
                  {part.brand} OEM GENUINO
                </span>
                <span className="px-2.5 py-1 rounded-[3px] bg-emerald-500/90 text-black font-mono font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  STOCK PATIO KM 22
                </span>
                <span className="px-2.5 py-1 rounded-[3px] bg-zinc-950/80 backdrop-blur-md text-amber-400 font-mono font-bold text-xs uppercase border border-amber-500/30">
                  PN: {part.partNumber}
                </span>
              </div>

              {/* Main Image Showcase */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-900 overflow-hidden flex items-center justify-center p-8">
                <img
                  src={part.image}
                  alt={part.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('tmd_coming_soon')) {
                      target.src = '/images/tmd_coming_soon.jpg';
                    }
                  }}
                />

                {/* Subtle Technical Grid Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Warehouse Location Floating Badge */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-[4px] bg-zinc-950/90 backdrop-blur-md border border-white/[0.1] text-xs font-mono text-zinc-300 flex items-center gap-2 shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>UBICACIÓN EN PATIO: <strong className="text-white">RACK A-14 / BIN 08 (KM 22)</strong></span>
                  </div>
                </div>

                {/* Telemetry Stamp */}
                <div className="absolute bottom-4 right-4 z-20 text-[10px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-[3px] border border-white/[0.08]">
                  CAD VERIFIED 100% OEM
                </div>
              </div>
            </div>

            {/* Segmented Engineering Tool Strip */}
            <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3 font-display">
                <span className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  Protocolos Técnicos & Etiquetado Industrial
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">HOMOLOGACIÓN DGII / DGA</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="p-3 rounded-[4px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-left transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">PNG 4K</span>
                  </div>
                  <div className="text-xs font-black uppercase text-slate-900 dark:text-white">Rótulo QR</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">Etiqueta de Anaquel</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    if (onOpenLabelPdf) {
                      onOpenLabelPdf(part);
                    } else {
                      window.print();
                    }
                  }}
                  className="p-3 rounded-[4px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-left transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Printer className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">PLIEGO</span>
                  </div>
                  <div className="text-xs font-black uppercase text-slate-900 dark:text-white">PDF Rótulo</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">Impresión Térmica</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('compatibility')}
                  className="p-3 rounded-[4px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-left transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Boxes className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">MATRIZ</span>
                  </div>
                  <div className="text-xs font-black uppercase text-slate-900 dark:text-white">Flota Compatible</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">{part.compatibleModels.length} Equipos Oficiales</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('crossref')}
                  className="p-3 rounded-[4px] bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] text-left transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <RefreshCw className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">CRUCES</span>
                  </div>
                  <div className="text-xs font-black uppercase text-slate-900 dark:text-white">Cross-Reference</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">Donaldson / CAT / JCB</div>
                </button>
              </div>
            </div>

            {/* Big Technical Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.08]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono block">CÓDIGO DE PARTE:</span>
                <span className="text-base font-black text-amber-500 font-mono tracking-tight">{part.partNumber}</span>
              </div>
              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.08]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono block">FABRICANTE OEM:</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono uppercase">{part.brand}</span>
              </div>
              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.08]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono block">TIEMPO DESPACHO:</span>
                <span className="text-base font-black text-emerald-400 font-mono uppercase">{part.deliveryTimeHours || 2} Horas</span>
              </div>
              <div className="p-4 rounded-[5px] bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.08]">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono block">GARANTÍA OEM:</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono">12 Meses</span>
              </div>
            </div>

            {/* Real-time Inventory Audit Badges */}
            <div className="space-y-3">
              <RecentlyVerifiedBadge
                itemId={part.id}
                itemCode={part.partNumber}
                itemType="part"
                variant="detail-banner"
              />
              <LastScannedBadge
                itemId={part.id}
                itemCode={part.partNumber}
                itemType="part"
                showDetailsAccordion={true}
                showEmptyState={true}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN (4-5 COLS): EXECUTIVE COMMERCIAL CONSOLE */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="p-6 rounded-[5px] bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/[0.08] shadow-2xl backdrop-blur-xl">
              
              {/* Category & Brand Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase font-mono">
                  {part.brand} OEM
                </span>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                  {part.category}
                </span>
              </div>

              {/* Title & Part Number */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase font-display tracking-tight">
                {part.name}
              </h1>
              <p className="mt-2 text-xs font-mono font-bold text-amber-500">
                NUMERO DE PARTE OEM: {part.partNumber}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {part.description}
              </p>

              {/* Commercial Price Console */}
              <div className="mt-6 p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  <span>PRECIO UNITARIO ({currency}):</span>
                  <span className="text-[10px] text-amber-400 font-bold">1 USD = {currentRate.toFixed(2)} DOP</span>
                </div>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {formatPriceValue(part.priceUsd)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase font-mono">+ ITBIS</span>
                </div>

                {/* DGII Tax Transparency */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>Subtotal ({orderQuantity} {orderQuantity === 1 ? 'unidad' : 'unidades'}):</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPriceValue(priceUsd)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>ITBIS (18% Transparentado):</span>
                    <span className="font-bold text-amber-500">{formatPriceValue(itbisUsd)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-zinc-800">
                    <span>Total con Comprobante Fiscal:</span>
                    <span className="text-emerald-400 text-xs">{formatPriceValue(totalWithItbisUsd)}</span>
                  </div>
                </div>

                {/* Quantity Controller */}
                <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 font-display">
                    CANTIDAD A DESPACHAR:
                  </span>
                  <div className="flex items-center rounded-[3px] border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="px-3 py-1 text-slate-700 dark:text-zinc-300 hover:text-amber-500 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-black text-sm text-slate-900 dark:text-white min-w-[32px] text-center">
                      {orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="px-3 py-1 text-slate-700 dark:text-zinc-300 hover:text-amber-500 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 5-Star Diamond Standard CTAs */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 rounded-[4px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-amber-400/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-black" />
                  <span>Añadir a Cesta de Despacho</span>
                </button>

                <button
                  type="button"
                  onClick={handleEmitProforma}
                  className="w-full py-3 px-4 rounded-[4px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-black uppercase text-xs tracking-wider transition-all border border-slate-300 dark:border-white/[0.08] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Emitir Proforma Fiscal NCF B01</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 px-4 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Consultar Stock Inmediato por WhatsApp</span>
                </button>
              </div>

              {/* Guarantees List */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Repuesto 100% Genuino con Garantía de Fábrica.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Despacho el mismo día a todo el territorio dominicano.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Instalación disponible en obra mediante Taller Móvil SOS.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* 3. DEEP-DIVE TECHNICAL SPECIFICATION TABS */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="mt-12 space-y-6">
          
          {/* Tab Navigation Segmented Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('compatibility')}
              className={`px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'compatibility'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-white border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Compatibilidad de Flota ({part.compatibleModels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('crossref')}
              className={`px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'crossref'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-white border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Referencias Cruzadas OEM</span>
            </button>

            <button
              onClick={() => setActiveTab('installation')}
              className={`px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'installation'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-white border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Protocolo de Instalación & Torque</span>
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`px-4 py-2.5 rounded-[4px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                activeTab === 'warehouse'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-white border border-slate-200 dark:border-white/[0.08]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Trazabilidad & Stock Patio Km 22</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 rounded-[5px] bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/[0.08]">
            {activeTab === 'compatibility' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Equipos de Flota Oficial Compatibles con esta Pieza
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Esta pieza ha sido homologada y verificada para su instalación directa sin modificaciones en los siguientes modelos distribuidos por TMD Dominicana:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                  {part.compatibleModels.map((model, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center gap-1"
                    >
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{part.brand}</span>
                      <span className="text-xs font-black uppercase text-amber-500 font-display">{model}</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">100% COMPATIBLE</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'crossref' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  Tabla de Intercambiabilidad de Fabricantes
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Si cuenta con un código alternativo de otra marca de filtros o repuestos, verifique la correlación directa a continuación:
                </p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-zinc-950 text-slate-700 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-3 uppercase">Fabricante / Marca</th>
                        <th className="p-3 uppercase">Código Referencia</th>
                        <th className="p-3 uppercase">Equivalencia Técnica</th>
                        <th className="p-3 uppercase">Disponibilidad TMD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-slate-800 dark:text-zinc-300">
                      <tr>
                        <td className="p-3 font-bold text-amber-500">{part.brand} (OEM Principal)</td>
                        <td className="p-3 font-black">{part.partNumber}</td>
                        <td className="p-3 text-emerald-400">Genuino de Fábrica (100%)</td>
                        <td className="p-3 text-emerald-400 font-bold">En Stock Km 22</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Donaldson Filtration</td>
                        <td className="p-3">P550388 / DFP-{part.partNumber.slice(-4)}</td>
                        <td className="p-3 text-zinc-400">Equivalente Heavy Duty</td>
                        <td className="p-3 text-amber-400 font-bold">Bajo Pedido (24h)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">Fleetguard / Cummins</td>
                        <td className="p-3">LF16015 / FS-{part.partNumber.slice(-4)}</td>
                        <td className="p-3 text-zinc-400">Micronaje Homologado</td>
                        <td className="p-3 text-emerald-400 font-bold">En Stock Km 22</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Especificaciones de Montaje & Torques Recomendados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">TORQUE DE APRIETE:</span>
                    <span className="text-base font-black text-white font-mono">25 - 30 Nm</span>
                    <p className="text-[11px] text-zinc-400">Apretar 3/4 de vuelta tras contacto del empaque.</p>
                  </div>
                  <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">LUBRICACIÓN DE EMPAQUE:</span>
                    <span className="text-base font-black text-amber-400 font-mono">ACEITE LIMPIO 15W40</span>
                    <p className="text-[11px] text-zinc-400">Aplicar película fina sobre el sello tórico antes de enroscar.</p>
                  </div>
                  <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">INTERVALO DE SERVICIO:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">250 / 500 HORAS</span>
                    <p className="text-[11px] text-zinc-400">Según protocolo del manual de mantenimiento de fábrica.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Package className="w-4 h-4 text-blue-400" />
                  Trazabilidad Física & Auditoría de Almacén Central
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs font-mono">
                  <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>ALMACÉN CENTRAL:</span>
                      <span className="text-white font-bold">Patio Km 22 Autopista Duarte</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>ZONA / SECTOR:</span>
                      <span className="text-amber-400 font-bold">Nave 2 - Pasillo A</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>RACK & BIN:</span>
                      <span className="text-white font-bold">RACK-14 / BIN-08</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>UNIDADES VERIFICADAS:</span>
                      <span className="text-emerald-400 font-bold">{part.stockQty || 24} Unidades Físicas</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>DECLARACIÓN ADUANERA:</span>
                      <span className="text-white font-bold">DGA RD DUA-2026-TMD</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>PAÍS DE ORIGEN:</span>
                      <span className="text-white font-bold">Reino Unido / EE.UU.</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>ESTADO DEL LOTE:</span>
                      <span className="text-emerald-400 font-bold">Liberado & Certificado</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>INSPECTOR RESPONSABLE:</span>
                      <span className="text-white font-bold">Ing. Rafael Peña (Km 22)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
