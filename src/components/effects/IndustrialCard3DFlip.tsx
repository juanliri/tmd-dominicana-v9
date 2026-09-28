import React, { useState } from 'react';
import { RotateCw, MapPin, Layers, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Part } from '../../types';

interface IndustrialCard3DFlipProps {
  part: Part;
  currency: 'USD' | 'DOP';
  usdRate: number;
  onAddToCart?: (part: Part) => void;
  onOpenDetails?: (part: Part) => void;
}

export const IndustrialCard3DFlip: React.FC<IndustrialCard3DFlipProps> = ({
  part,
  currency,
  usdRate,
  onAddToCart,
  onOpenDetails
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const priceFormatted = currency === 'DOP'
    ? `RD$ ${(part.priceUsd * usdRate).toLocaleString()}`
    : `US$ ${part.priceUsd.toLocaleString()}`;

  return (
    <div 
      className="card-flip-container relative w-full h-[360px] cursor-pointer group"
      style={{ perspective: '1000px' }}
    >
      <div 
        className={`card-flip-inner w-full h-full relative transition-transform duration-500 transform-gpu ${isFlipped ? 'is-flipped' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ==================================================== */}
        {/* FRONT FACE                                           */}
        {/* ==================================================== */}
        <div 
          className="card-flip-front absolute inset-0 w-full h-full bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 rounded-[4px] p-3.5 flex flex-col justify-between shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={(e) => {
            // If clicking interactive elements inside, don't trigger flip
            if ((e.target as HTMLElement).closest('button')) return;
            setIsFlipped(true);
          }}
        >
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-[2px] bg-black text-amber-400 font-mono font-bold text-[10px] uppercase border border-zinc-800">
                {part.brand}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                }}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-amber-400 font-mono transition-colors"
                title="Girar para ver equivalencias y pasillo Km 22"
              >
                <RotateCw className="w-3 h-3" />
                <span className="hidden sm:inline">GIRAR 3D</span>
              </button>
            </div>

            {/* Image */}
            <div className="w-full h-36 bg-zinc-950 rounded-[3px] overflow-hidden mb-3 relative border border-zinc-850 flex items-center justify-center p-2">
              <img 
                src={part.image || '/assets/machinery/brand_new_genuine_yellow_and_black.jpg'} 
                alt={part.name}
                className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-[2px] bg-black/80 text-[9px] font-mono text-zinc-300 backdrop-blur-xs">
                {part.partNumber}
              </span>
            </div>

            {/* Info */}
            <h4 className="text-xs font-black text-white uppercase font-mono line-clamp-1 group-hover:text-amber-400 transition-colors">
              {part.name}
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono line-clamp-1 mt-0.5">
              {part.category} · {part.description || 'Genuino OEM'}
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-zinc-400 block font-mono">PRECIO NETO</span>
              <span className="text-sm font-black text-amber-400 font-mono">{priceFormatted}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(part);
                  }}
                  className="p-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black transition-colors"
                  title="Añadir al Carrito"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* BACK FACE (180deg)                                   */}
        {/* ==================================================== */}
        <div 
          className="card-flip-back absolute inset-0 w-full h-full bg-zinc-950 border-2 border-amber-400/80 rounded-[4px] p-3.5 flex flex-col justify-between shadow-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
            setIsFlipped(false);
          }}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5">
              <span className="text-[10px] font-black text-amber-400 uppercase font-mono flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>FICHA TÉCNICA & CRUCE OEM</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-[10px] text-zinc-400 hover:text-white font-mono flex items-center gap-0.5"
              >
                <RotateCw className="w-3 h-3" />
                <span>VOLVER</span>
              </button>
            </div>

            {/* Warehouse Location Km 22 */}
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-[3px] mb-2 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-bold mb-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>UBICACIÓN EN PATIO KM 22:</span>
              </div>
              <p className="text-[11px] font-black text-white pl-4">
                {part.warehouseLocation || 'Pasillo A · Rack 04 · Bahía 2'}
              </p>
            </div>

            {/* Cross Reference & Specs */}
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">P/N Original:</span>
                <span className="font-bold text-white">{part.partNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Equivalencia Tier-1:</span>
                <span className="font-bold text-amber-400">{part.compatibleModels?.[0] || 'Donaldson / Fleetguard'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Disponibilidad:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>En Stock ({part.stockQty || 12} unids)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900">
            <a
              href={`https://wa.me/18095601234?text=Hola%20TMD%2C%20solicito%20despacho%20del%20repuesto%20${encodeURIComponent(part.name)}%20(P%2FN%3A%20${part.partNumber})%20ubicado%20en%20Km%2022.`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-[10px] uppercase rounded-[2px] flex items-center justify-center gap-1 transition-colors"
            >
              <span>PEDIR DESPACHO INMEDIATO</span>
            </a>

            {onOpenDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(part);
                }}
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[9px] uppercase rounded-[2px] text-center transition-colors"
              >
                VER FICHA COMPLETA & PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
