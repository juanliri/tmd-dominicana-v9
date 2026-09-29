import React, { useMemo, useState } from 'react';
import { 
  ShoppingCart, 
  QrCode, 
  Check, 
  Clock, 
  Wrench, 
  Layers, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Package,
  RotateCw,
  MapPin,
  FileText,
  CheckCircle2,
  Cpu,
  Download
} from 'lucide-react';
import { Part } from '../../types';
import { downloadProductQrCode } from '../../utils/qrExporter';
import { LastScannedBadge } from '../common/LastScannedBadge';
import { RecentlyVerifiedBadge } from '../common/RecentlyVerifiedBadge';
import { TextHighlight } from '../common/TextHighlight';

export type PartsLayoutMode = 'mosaic' | 'uniform';

interface PartCardConfig {
  spanClass: string;
  aspectClass: string;
  aspectRatioCss: string;
  isAssemblyHero: boolean;
}

interface PartCardProps {
  part: Part;
  config: PartCardConfig;
  inStock: boolean;
  setActivePartDetail: (part: Part) => void;
  setQrModalPart: (part: Part) => void;
  addToCart: (part: Part) => void;
  formatPrice: (usd: number) => string;
  searchTerm?: string;
}

export const PartCard = React.memo<PartCardProps>(({
  part,
  config,
  inStock,
  setActivePartDetail,
  setQrModalPart,
  addToCart,
  formatPrice,
  searchTerm
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // ITBIS Calculations
  const priceNet = part.priceUsd;
  const itbisAmount = part.itbisUsd ?? Math.round(priceNet * 0.18 * 100) / 100;
  const priceWithItbis = part.totalWithItbisUsd ?? Math.round((priceNet + itbisAmount) * 100) / 100;

  return (
    <div
      className={`card-flip-container w-full min-h-[460px] ${config.spanClass}`}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`card-flip-inner w-full h-full relative transition-transform duration-500 transform-style-3d ${isFlipped ? 'is-flipped rotate-y-180' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '460px'
        }}
      >
        {/* =========================================================================
            FRONT FACE (Frontal)
            ========================================================================= */}
        <div
          className="card-flip-front w-full h-full backface-hidden bg-zinc-950 rounded-[6px] border border-zinc-800 overflow-hidden hover:border-amber-400/60 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Image Container */}
          <div 
            className={`relative ${config.aspectClass} w-full bg-zinc-900 overflow-hidden shrink-0`}
            style={{ aspectRatio: config.aspectRatioCss || '4 / 3' }}
          >
            <img
              src={part.image}
              alt={part.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              style={{ objectFit: 'cover', aspectRatio: config.aspectRatioCss || '4 / 3' }}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('tmd_portal_hero')) {
                  target.src = '/images/tmd_portal_hero.jpg';
                }
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

            {/* Brand & OEM Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 font-mono">
              <span className="bg-zinc-950/90 px-2 py-0.5 rounded-[3px] text-[9px] font-black text-amber-400 border border-zinc-700 uppercase">
                {part.brand}
              </span>
              {part.isOem && (
                <span className="bg-zinc-900 px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-200 border border-zinc-700 uppercase">
                  OEM GEN
                </span>
              )}
              {config.isAssemblyHero && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-[3px] text-[10px] font-black uppercase">
                  <Layers className="w-2.5 h-2.5" />
                  <span>ENSAMBLE</span>
                </span>
              )}
              <LastScannedBadge
                itemId={part.id}
                itemCode={part.partNumber}
                itemType="part"
                compact={true}
                showEmptyState={false}
              />
              <RecentlyVerifiedBadge
                itemId={part.id}
                itemCode={part.partNumber}
                itemType="part"
                variant="card-badge"
              />
            </div>

            {/* Category Pill */}
            <div className="absolute top-2 right-2 z-10 font-mono">
              <span className="bg-zinc-950/90 px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 border border-zinc-700 uppercase">
                {part.category}
              </span>
            </div>

            {/* Availability Tag */}
            <div className="absolute bottom-2 left-2 z-10 font-mono">
              {inStock ? (
                <span className="bg-zinc-950/90 px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-emerald-400 border border-zinc-700 flex items-center gap-1 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EN STOCK KM 22 ({part.stockQty} U)</span>
                </span>
              ) : (
                <span className="bg-zinc-950/90 px-2 py-0.5 rounded-[3px] text-[10px] font-bold text-zinc-300 border border-zinc-700 flex items-center gap-1 uppercase">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  <span>IMPORTACIÓN {part.deliveryTimeHours}H</span>
                </span>
              )}
            </div>

            {/* 3D Flip Action Trigger (Top right button) */}
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-zinc-900/90 hover:bg-amber-500 hover:text-black text-amber-400 text-[9px] font-mono font-bold rounded-[3px] border border-amber-500/40 flex items-center gap-1 transition-all shadow-md cursor-pointer"
              title="Girar tarjeta 3D para ver compatibilidad y referencias cruzadas"
            >
              <RotateCw className="w-3 h-3" />
              <span>3D FICHA</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              {/* Part Number & Code */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-[10px] font-black text-amber-400 tracking-wider truncate uppercase">
                  P/N: <TextHighlight text={part.partNumber} query={searchTerm} />
                </span>
                {part.assemblyId && (
                  <span className="text-[8px] uppercase font-mono font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded-[3px] border border-zinc-800">
                    {part.assemblyId}
                  </span>
                )}
              </div>

              {/* Real-time Recently Verified Status Indicator */}
              <div className="mb-1.5">
                <RecentlyVerifiedBadge
                  itemId={part.id}
                  itemCode={part.partNumber}
                  itemType="part"
                  variant="pill"
                />
              </div>

              {/* Name */}
              <h3 className="text-xs font-black font-display text-white line-clamp-2 mb-1 group-hover:text-amber-400 transition-colors uppercase leading-snug">
                <TextHighlight text={part.name} query={searchTerm} />
              </h3>

              {/* Description */}
              <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                {part.description}
              </p>

              {/* Compatible Models */}
              {part.compatibleModels && part.compatibleModels.length > 0 && (
                <div className="text-[9px] font-mono text-zinc-400 truncate mb-1 uppercase">
                  APLICA: <strong className="text-zinc-200 font-semibold">{part.compatibleModels.slice(0, 3).join(', ')}</strong>
                </div>
              )}
            </div>

            {/* Price & Fiscal Breakdown Strip */}
            <div className="pt-2 border-t border-zinc-800 flex items-end justify-between gap-2 font-mono">
              <div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase">
                  <span>PRECIO NETO:</span>
                  <span className="text-white font-bold">{formatPrice(priceNet)}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-400">
                  <span>CON ITBIS (18%):</span>
                  <span>{formatPrice(priceWithItbis)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-display">
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 rounded-[3px] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 flex items-center gap-1"
                  title="Ver Especificaciones y Rótulo QR en Reverso 3D"
                >
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  <span>DETALLES</span>
                </button>
                <button
                  type="button"
                  onClick={() => addToCart(part)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-black text-[10px] uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  title="Añadir a la Orden de Repuestos"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>AÑADIR</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BACK FACE (Reverso 3D)
            ========================================================================= */}
        <div
          className="card-flip-back absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-zinc-950 rounded-[6px] border-2 border-amber-500/60 p-3.5 flex flex-col justify-between shadow-2xl overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div>
            {/* Top Back Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 font-mono">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block uppercase">FICHA TÉCNICA REVERSO</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-white tracking-wider uppercase">{part.partNumber}</span>
                  <RecentlyVerifiedBadge
                    itemId={part.id}
                    itemCode={part.partNumber}
                    itemType="part"
                    variant="card-badge"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded-[3px] text-[10px] font-black font-mono uppercase flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>FRONTAL</span>
              </button>
            </div>

            {/* Full Part Name */}
            <h4 className="text-xs font-black font-display text-white uppercase line-clamp-2 mb-2">
              {part.name}
            </h4>

            {/* Compatibility Specs */}
            <div className="space-y-2 text-[10px] font-mono">
              {/* Engines Compatibility */}
              {part.engineCompatibilities && part.engineCompatibilities.length > 0 && (
                <div className="bg-zinc-900/80 p-2 rounded-[4px] border border-zinc-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase mb-1">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>MOTORES COMPATIBLES:</span>
                  </div>
                  <div className="text-[10px] text-zinc-200 leading-tight">
                    {part.engineCompatibilities.join(' • ')}
                  </div>
                </div>
              )}

              {/* Machine Compatibility */}
              <div className="bg-zinc-900/80 p-2 rounded-[4px] border border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase mb-1">
                  <Wrench className="w-2.5 h-2.5" />
                  <span>EQUIPOS Y MODELOS APLICABLES:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {part.compatibleModels.map((mod, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cross References (Códigos OEM Equivalentes) */}
              {part.crossReferences && part.crossReferences.length > 0 && (
                <div className="bg-zinc-900/80 p-2 rounded-[4px] border border-zinc-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase mb-1">
                    <Layers className="w-2.5 h-2.5" />
                    <span>REFERENCIAS CRUZADAS (CROSS-REF):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {part.crossReferences.slice(0, 4).map((ref, idx) => (
                      <span key={idx} className="bg-zinc-800/90 text-amber-300 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Warehouse Stock Location */}
              <div className="flex items-center gap-1 text-[10px] text-zinc-300 pt-1">
                <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate">{part.warehouseLocation || 'Almacén Central Km 22 Autopista Duarte, Santo Domingo'}</span>
              </div>
            </div>
          </div>

          {/* Back Action Buttons */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-1.5 font-display mt-2">
            <button
              type="button"
              onClick={() => setActivePartDetail(part)}
              className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-[3px] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700 flex items-center justify-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>FICHA COMPLETA</span>
            </button>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                await downloadProductQrCode(part, 'part');
              }}
              className="p-1.5 bg-zinc-900 hover:bg-amber-400 hover:text-black text-amber-400 rounded-[3px] border border-zinc-700 cursor-pointer flex items-center gap-1"
              title="Descargar Rótulo QR para etiquetado físico de anaquel"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold hidden sm:inline">EXPORT QR</span>
            </button>
            <button
              type="button"
              onClick={() => setQrModalPart(part)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded-[3px] border border-zinc-700 cursor-pointer"
              title="Código QR"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                addToCart(part);
                setIsFlipped(false);
              }}
              className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider rounded-[3px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>AÑADIR ORDEN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PartCard.displayName = 'PartCard';

interface PartsMosaicGridProps {
  parts: Part[];
  layoutMode?: PartsLayoutMode;
  setActivePartDetail: (part: Part) => void;
  setQrModalPart: (part: Part) => void;
  addToCart: (part: Part) => void;
  formatPrice: (usd: number) => string;
  searchTerm?: string;
}

export const PartsMosaicGrid = React.memo<PartsMosaicGridProps>(({
  parts,
  layoutMode = 'mosaic',
  setActivePartDetail,
  setQrModalPart,
  addToCart,
  formatPrice,
  searchTerm
}) => {
  // Determine card aspect ratio & spans dynamically based on part type
  const getPartCardConfig = (part: Part, index: number): PartCardConfig => {
    if (layoutMode === 'uniform') {
      return {
        spanClass: 'col-span-1',
        aspectClass: 'aspect-[4/3]',
        aspectRatioCss: '4 / 3',
        isAssemblyHero: false
      };
    }

    // Dynamic Mosaic Logic for Industrial Parts:
    // Heavy assemblies / kits (e.g. Tren de Rodaje, Hidráulica mayor, Motor Diesel assemblies) with higher price or assemblyId
    const isMajorComponent = 
      (part.category === 'Tren de Rodaje' || part.category === 'Motor Diesel' || part.category === 'Hidráulica') &&
      part.priceUsd >= 500 &&
      index % 5 === 0;

    if (isMajorComponent) {
      return {
        spanClass: 'col-span-1 sm:col-span-2',
        aspectClass: 'aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/9]',
        aspectRatioCss: '16 / 9',
        isAssemblyHero: true
      };
    }

    // Precision mechanical items (Valves, Cylinders, Turbos, Starters)
    if (['Hidráulica', 'Desgaste y Balde', 'Concreto'].includes(part.category)) {
      return {
        spanClass: 'col-span-1',
        aspectClass: 'aspect-[4/3]',
        aspectRatioCss: '4 / 3',
        isAssemblyHero: false
      };
    }

    // Compact items (Filters, Sensors, Seals, Lubricants)
    return {
      spanClass: 'col-span-1',
      aspectClass: 'aspect-square',
      aspectRatioCss: '1 / 1',
      isAssemblyHero: false
    };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] [grid-auto-flow:dense] gap-3.5 sm:gap-4.5">
      {parts.map((part, index) => {
        const config = getPartCardConfig(part, index);
        const inStock = part.stockQty > 0;

        return (
          <PartCard
            key={part.id}
            part={part}
            config={config}
            inStock={inStock}
            setActivePartDetail={setActivePartDetail}
            setQrModalPart={setQrModalPart}
            addToCart={addToCart}
            formatPrice={formatPrice}
            searchTerm={searchTerm}
          />
        );
      })}
    </div>
  );
});

PartsMosaicGrid.displayName = 'PartsMosaicGrid';

