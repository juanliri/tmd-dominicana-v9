import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Check, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Info, 
  Zap, 
  Truck,
  PackageCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { USD_TO_DOP_RATE } from '../../data/catalog';

export interface OptionalAttachment {
  id: string;
  name: string;
  partNumber: string;
  category: 'hydraulic' | 'bucket' | 'maintenance';
  compatibility: string;
  priceUsd: number;
  weightKg: number;
  specs: string;
  image: string;
}

const RECOMMENDED_ATTACHMENTS: OptionalAttachment[] = [
  {
    id: 'att_soosan_sb40',
    name: 'Martillo Hidráulico Soosan HD SB-40',
    partNumber: 'SOOSAN-SB40-OEM',
    category: 'hydraulic',
    compatibility: 'LiuGong 922E / JCB 3CX / CAT 320',
    priceUsd: 6850,
    weightKg: 850,
    specs: 'Flujo 90-120 L/min • Presión 150-170 bar • Cincel 100mm',
    image: '/assets/machinery/JCB_Contractor_breakers.jpg'
  },
  {
    id: 'att_quick_coupler_20t',
    name: 'Acople Rápido Hidráulico Universal ISO',
    partNumber: 'QC-ISO-20T-HD',
    category: 'hydraulic',
    compatibility: 'Excavadoras 18 – 24 Toneladas',
    priceUsd: 2450,
    weightKg: 280,
    specs: 'Válvula de retención de seguridad • Cambio de balde en 15s',
    image: '/assets/machinery/JCB_Raptor_Tiltrotator.jpg'
  },
  {
    id: 'att_trench_bucket_450',
    name: 'Cuchara de Zanja Estrecha Reforzada (450 mm)',
    partNumber: 'BCK-TR450-HARDOX',
    category: 'bucket',
    compatibility: 'Retroexcavadoras & Excavadoras Medianas',
    priceUsd: 1280,
    weightKg: 310,
    specs: 'Acero Hardox 450 • 3 Dientes tipo tigre • Capacidad 0.28 m³',
    image: '/assets/machinery/JCB_Tapered_ditching_bucket.jpg'
  },
  {
    id: 'att_ditch_clean_1500',
    name: 'Cuchara de Limpieza / Talud Basculante 1500mm',
    partNumber: 'BCK-TL1500-TILT',
    category: 'bucket',
    compatibility: 'Excavadoras 14 – 22 Toneladas',
    priceUsd: 2150,
    weightKg: 490,
    specs: 'Inclinación hidráulica ±45° • Cuchilla reversible apernada',
    image: '/assets/machinery/JCB_Tilting_grading_bucket.jpg'
  },
  {
    id: 'att_pm_filter_combo_500h',
    name: 'Combo Completo Filtros Servicio PM-500h',
    partNumber: 'KIT-PM500-FLEET',
    category: 'maintenance',
    compatibility: 'Motores Cummins QSB 6.7 / Perkins 1104',
    priceUsd: 385,
    weightKg: 18,
    specs: 'Filtro aceite + 2 Combustible Donaldson + Primario aire',
    image: '/assets/machinery/clean_new_jcb_oem_diesel_fuel.jpg'
  }
];

interface SmartAttachmentsUpsellProps {
  onAddAttachmentToOrder?: (attachment: OptionalAttachment) => void;
}

export const SmartAttachmentsUpsell: React.FC<SmartAttachmentsUpsellProps> = ({
  onAddAttachmentToOrder
}) => {
  const { addToCart, formatPrice } = useCart();
  const { pushToast } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hydraulic' | 'bucket' | 'maintenance'>('all');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filteredAttachments = RECOMMENDED_ATTACHMENTS.filter(att => {
    if (selectedCategory === 'all') return true;
    return att.category === selectedCategory;
  });

  const handleAddAttachment = (att: OptionalAttachment) => {
    // Add as a catalog part into cart
    addToCart({
      id: att.id,
      name: att.name,
      partNumber: att.partNumber,
      brand: 'OEM Heavy Duty',
      category: 'Implementos & Baldes',
      priceUsd: att.priceUsd,
      stockQty: 5,
      image: att.image,
      compatibleModels: [att.compatibility],
      isOem: true,
      deliveryTimeHours: 24,
      description: `${att.name} compatible con ${att.compatibility}. Especificaciones técnicas: ${att.specs}.`
    });

    setAddedIds(prev => ({ ...prev, [att.id]: true }));

    if (onAddAttachmentToOrder) {
      onAddAttachmentToOrder(att);
    }

    pushToast({
      title: '✅ Implemento Agregado al Pedido',
      body: `${att.name} (P/N: ${att.partNumber}) incorporado exitosamente con cálculo de ITBIS.`,
      type: 'quote_status'
    });
  };

  return (
    <div className="bg-zinc-900/90 rounded-[4px] border border-amber-400/40 p-4 sm:p-5 shadow-lg space-y-4 font-mono animate-in fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[2px] bg-amber-400 text-black shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                Cross-Sell Inteligente OEM
              </span>
              <span className="text-[10px] text-zinc-400">
                1 Clic para Cotizar
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight mt-0.5 font-display">
              Implementos & Accesorios Opcionales Compatibles
            </h4>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-[2px] uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({RECOMMENDED_ATTACHMENTS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('hydraulic')}
            className={`px-2.5 py-1 rounded-[2px] uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === 'hydraulic'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Hidráulicos
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('bucket')}
            className={`px-2.5 py-1 rounded-[2px] uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === 'bucket'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Cucharas
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('maintenance')}
            className={`px-2.5 py-1 rounded-[2px] uppercase font-bold transition-all cursor-pointer ${
              selectedCategory === 'maintenance'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Kits 500h
          </button>
        </div>
      </div>

      {/* Attachments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAttachments.map((att) => {
          const isAdded = !!addedIds[att.id];
          const priceDop = Math.round(att.priceUsd * USD_TO_DOP_RATE);

          return (
            <div
              key={att.id}
              className={`p-3 rounded-[3px] bg-zinc-950 border transition-all duration-200 flex flex-col justify-between ${
                isAdded 
                  ? 'border-emerald-500/60 bg-emerald-950/10' 
                  : 'border-zinc-800 hover:border-amber-400/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold block">
                      P/N: {att.partNumber}
                    </span>
                    <h5 className="text-xs font-bold text-white uppercase leading-snug">
                      {att.name}
                    </h5>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300 shrink-0">
                    {att.weightKg} kg
                  </span>
                </div>

                <div className="p-2 rounded-[2px] bg-zinc-900 text-[10px] text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Compatible: {att.compatibility}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    {att.specs}
                  </p>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-white font-mono block">
                    {formatPrice(att.priceUsd)}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    ≈ RD$ {priceDop.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddAttachment(att)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-[2px] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : 'bg-amber-400 hover:bg-amber-300 text-black shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Agregado</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir (+{formatPrice(att.priceUsd)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 pt-1">
        <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>Todos los implementos incluyen garantía oficial TMD de 12 meses y montaje inicial en taller central Km 22.</span>
      </div>

    </div>
  );
};
