import React from 'react';
import { 
  X, 
  FileText, 
  QrCode, 
  RotateCw, 
  Calculator, 
  ShieldCheck, 
  Check, 
  Truck, 
  Layers,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Machine, Part } from '../../../types';
import { TmdButton, TmdBadge } from '../tmd-industrial';

interface QuickSpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: Machine | Part | null;
  type: 'machinery' | 'part';
  onQuote: (item: Machine | Part) => void;
  onOpen360?: (item: Machine) => void;
  onOpenQr?: (item: Machine | Part) => void;
  onCalculateTco?: (machineId: string) => void;
}

export const QuickSpecsDrawer: React.FC<QuickSpecsDrawerProps> = ({
  isOpen,
  onClose,
  item,
  type,
  onQuote,
  onOpen360,
  onOpenQr,
  onCalculateTco
}) => {
  if (!item) return null;

  const isMachine = type === 'machinery';
  const machine = isMachine ? (item as Machine) : null;
  const part = !isMachine ? (item as Part) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-mono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl relative"
            >
              {/* Engineering Top Bar */}
              <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

              {/* Drawer Header */}
              <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TmdBadge variant={isMachine ? 'amber' : 'cyan'} size="xs">
                      {isMachine ? 'MAQUINARIA PESADA' : 'REPUESTO OEM'}
                    </TmdBadge>
                    <span className="text-[11px] text-zinc-500 uppercase">
                      ID: {item.id}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold">
                    US$ {(item as any).basePriceUsd?.toLocaleString() || (item as any).priceUsd?.toLocaleString()} + ITBIS
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Cerrar cajón técnico"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Image Showcase */}
                <div className="relative aspect-video rounded-[4px] overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img
                    src={(item as any).imageUrl || (item as any).images?.[0] || '/assets/machinery/LiuGong_856H_Wheel_Loader_Official_Photo.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    {onOpenQr && (
                      <button
                        type="button"
                        onClick={() => onOpenQr(item)}
                        className="p-1.5 rounded-[3px] bg-black/70 hover:bg-black text-white border border-white/20 transition-all text-xs flex items-center gap-1 cursor-pointer"
                        title="Ver Código QR Oficial"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                    {isMachine && onOpen360 && (
                      <button
                        type="button"
                        onClick={() => onOpen360(machine!)}
                        className="p-1.5 rounded-[3px] bg-black/70 hover:bg-black text-white border border-white/20 transition-all text-xs flex items-center gap-1 cursor-pointer"
                        title="Simulador Giro 360°"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold">360°</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>FICHA TÉCNICA VERIFICADA</span>
                  </h4>
                  
                  <div className="rounded-[4px] bg-zinc-900/90 border border-zinc-800 divide-y divide-zinc-800/80 text-xs">
                    {isMachine && machine && (
                      <>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Marca / Fabricante:</span>
                          <span className="text-white font-bold">{machine.brand}</span>
                        </div>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Modelo:</span>
                          <span className="text-white font-bold">{machine.modelCode}</span>
                        </div>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Categoría:</span>
                          <span className="text-white font-bold">{machine.category}</span>
                        </div>
                        {machine.specs && Object.entries(machine.specs).map(([key, val]) => (
                          <div key={key} className="p-2.5 flex justify-between">
                            <span className="text-zinc-400 capitalize">{key}:</span>
                            <span className="text-white font-bold">{String(val)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {!isMachine && part && (
                      <>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Número de Parte OEM:</span>
                          <span className="text-amber-400 font-bold">{part.partNumber}</span>
                        </div>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Categoría:</span>
                          <span className="text-white font-bold">{part.category}</span>
                        </div>
                        <div className="p-2.5 flex justify-between">
                          <span className="text-zinc-400">Disponibilidad en Patio:</span>
                          <span className="text-emerald-400 font-bold">Entrega Inmediata (Km 22)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* TCO Quick Link (For Machinery) */}
                {isMachine && onCalculateTco && (
                  <div className="p-3.5 rounded-[4px] bg-zinc-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>PROYECCIÓN DE COSTO TCO</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Calcula combustible y depreciación por hora de operación.
                      </p>
                    </div>
                    <TmdButton
                      variant="outline"
                      size="xs"
                      onClick={() => onCalculateTco(item.id)}
                    >
                      Calcular
                    </TmdButton>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-2">
                <TmdButton
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={ShoppingCart}
                  onClick={() => {
                    onClose();
                    onQuote(item);
                  }}
                >
                  SOLICITAR COTIZACIÓN FORMAL
                </TmdButton>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
