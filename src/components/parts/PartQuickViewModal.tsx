import React from 'react';
import {
  Wrench,
  CheckCircle2,
  Package,
  Layers,
  Truck,
  ShoppingCart,
  Phone,
  X,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Part } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface PartQuickViewModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (part: Part) => void;
}

export const PartQuickViewModal: React.FC<PartQuickViewModalProps> = ({
  part,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !part) return null;

  const priceDop = (part.priceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 2 });
  const itbisUsd = (part.priceUsd * 0.18).toFixed(2);
  const totalWithItbisUsd = (part.priceUsd * 1.18).toFixed(2);

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(part);
    }
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hola TMD Dominicana, solicito confirmación de stock y retiro en Km 22 para el repuesto:\n` +
    `• P/N: ${part.partNumber} - ${part.name}\n` +
    `• Marca: ${part.brand}\n` +
    `• Precio: US$ ${part.priceUsd.toFixed(2)}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  VISTA RÁPIDA OEM
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  {part.brand} &bull; {part.category}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black font-display uppercase tracking-tight text-white mt-0.5">
                {part.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Part Image or Placeholder */}
            <div className="relative aspect-4/3 bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden flex items-center justify-center">
              {part.image ? (
                <img
                  src={part.image}
                  alt={part.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Wrench className="w-12 h-12 text-zinc-600" />
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-amber-400 font-bold text-[10px] border border-amber-400/30 rounded-[2px]">
                ORIGINAL OEM
              </span>
            </div>

            {/* Technical Quick Summary */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">NÚMERO DE PARTE (SKU):</span>
                  <span className="text-base font-black text-amber-400 font-mono">{part.partNumber}</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">ESTADO EN ALMACÉN KM 22:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-bold">
                      {part.stockKm22 !== undefined ? `${part.stockKm22} unidades disponibles` : 'En Stock Inmediato'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">PRECIO UNITARIO:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white font-mono">US$ {part.priceUsd.toFixed(2)}</span>
                    <span className="text-zinc-400 text-xs">≈ RD$ {priceDop}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    + ITBIS 18%: US$ {itbisUsd} = Total US$ {totalWithItbisUsd}
                  </span>
                </div>
              </div>

              {/* Action buttons in right column */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full py-2 px-3 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar a la Proforma</span>
                </button>

                <a
                  href={`https://wa.me/18095601234?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Compatible Machinery Models */}
          {part.compatibleModels && part.compatibleModels.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                Modelos de Maquinaria Compatibles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {part.compatibleModels.map((model, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-sans"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cross References */}
          {part.crossReferences && part.crossReferences.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                Referencias Cruzadas (Equivalencias OEM):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {part.crossReferences.map((ref, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-amber-400/20 text-amber-400 text-[10px] font-mono"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Garantía TMD Directa: 6 Meses en Repuestos Genuinos
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">Almacén Km 22 Duarte</span>
        </div>
      </div>
    </div>
  );
};
