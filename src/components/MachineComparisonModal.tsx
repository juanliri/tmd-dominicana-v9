import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  HardHat, 
  Scale, 
  Zap, 
  Wrench, 
  DollarSign, 
  Phone, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  Share2,
  ChevronRight
} from 'lucide-react';
import { Machine } from '../types';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../data/catalog';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';
import { PriceEstimateModal } from './PriceEstimateModal';

interface MachineComparisonModalProps {
  onNavigate?: (route: string) => void;
}

export const MachineComparisonModal: React.FC<MachineComparisonModalProps> = ({ onNavigate }) => {
  const { 
    isComparisonOpen, 
    setIsComparisonOpen, 
    selectedMachines, 
    selectedMachineIds, 
    removeMachineFromCompare, 
    addMachineToCompare,
    clearComparison,
    maxMachines 
  } = useComparison();

  const { formatPrice, addMachineToQuote } = useCart();

  // Model Picker modal state when user taps "+ Agregar modelo"
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [estimateTargetMachine, setEstimateTargetMachine] = useState<Machine | null>(null);

  if (!isComparisonOpen || typeof document === 'undefined') return null;

  const availableToAdd = MACHINES_DATA.filter((m) => !selectedMachineIds.includes(m.id));

  // Determine highest power or weight to visually highlight advantage
  const maxPower = Math.max(...selectedMachines.map(m => m.powerHp), 0);
  const maxWeight = Math.max(...selectedMachines.map(m => m.operatingWeightKg), 0);

  const handleShareWhatsApp = () => {
    let msg = `*COMPARATIVA TÉCNICA DE MAQUINARIA - TMD DOMINICANA*\n\n`;
    selectedMachines.forEach((m, idx) => {
      msg += `*${idx + 1}. ${m.name}* (${m.brand})\n`;
      msg += `• Código: ${m.modelCode} | Categoría: ${m.category}\n`;
      msg += `• Motor: ${m.engine} | Potencia: ${m.powerHp} HP\n`;
      msg += `• Peso Operativo: ${(m.operatingWeightKg / 1000).toFixed(1)} Toneladas\n`;
      if (m.bucketCapacityM3) msg += `• Balde: ${m.bucketCapacityM3} m³\n`;
      msg += `• Inversión Ref: US$ ${m.basePriceUsd.toLocaleString()}\n\n`;
    });
    msg += `Consultar disponibilidad con el Taller Central Km 22 Autopista Duarte.`;
    window.open(`https://wa.me/18095601234?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 max-w-6xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Herramienta de Comparación
                  </span>
                  <span className="px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold border border-zinc-700">
                    {selectedMachines.length}/{maxMachines} SELECCIONADAS
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight">
                  Comparativa Técnica Frente a Frente
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedMachines.length > 0 && (
                <>
                  <button
                    onClick={handleShareWhatsApp}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors cursor-pointer border border-emerald-500/20 uppercase"
                    title="Compartir por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={clearComparison}
                    className="p-1.5 rounded-[2px] text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors text-xs font-bold"
                    title="Limpiar Comparación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsComparisonOpen(false)}
                className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* If No Machines Selected */}
          {selectedMachines.length === 0 ? (
            <div className="text-center py-16 px-4">
              <HardHat className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white uppercase">
                No hay modelos seleccionados para comparar
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Selecciona hasta 3 modelos del catálogo oficial para analizar sus especificaciones técnicas, motor, potencia y costo de inversión lado a lado.
              </p>
              <button
                onClick={() => setIsPickerOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors cursor-pointer uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Elegir Primer Modelo</span>
              </button>
            </div>
          ) : (
            /* Side-by-Side Comparison Table Viewport */
            <div className="flex-1 overflow-auto border border-zinc-800 rounded-[3px]">
              <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                {/* 1. Header Row with Equipment Images and Titles */}
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800">
                    <th className="p-3.5 w-44 sm:w-52 font-bold text-zinc-400 uppercase text-[10px] align-top tracking-wider">
                      Parámetro Técnico
                    </th>

                    {/* Machine Columns */}
                    {selectedMachines.map((machine) => (
                      <th key={machine.id} className="p-3.5 w-64 sm:w-72 align-top border-l border-zinc-800">
                        <div className="relative group">
                          {/* Remove button */}
                          <button
                            onClick={() => removeMachineFromCompare(machine.id)}
                            className="absolute -top-1 -right-1 z-10 p-1 rounded-[2px] bg-zinc-950/90 text-zinc-300 hover:bg-rose-600 hover:text-white transition-colors border border-zinc-700"
                            title="Quitar de la comparativa"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Machine image */}
                          <div className="aspect-[16/10] rounded-[2px] overflow-hidden mb-2.5 bg-zinc-950 border border-zinc-800">
                            <img
                              src={machine.image}
                              alt={machine.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase">
                              {machine.brand}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              MOD. {machine.modelCode}
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-white line-clamp-2 uppercase">
                            {machine.name}
                          </h3>

                          {/* Action Buttons Header Strip */}
                          <div className="mt-2.5 flex flex-col gap-1.5">
                            <button
                              onClick={() => setEstimateTargetMachine(machine)}
                              className="w-full py-1.5 px-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] uppercase shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Calculator className="w-3 h-3" />
                              <span>Estimar Financiamiento</span>
                            </button>

                            <button
                              onClick={() => {
                                addMachineToQuote(machine);
                                setIsComparisonOpen(false);
                                if (onNavigate) onNavigate('#/checkout');
                              }}
                              className="w-full py-1.5 px-2.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-[10px] transition-colors cursor-pointer text-center uppercase"
                            >
                              + Añadir a Proforma
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Empty Slots if less than 3 */}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <th
                        key={`empty-${i}`}
                        className="p-5 w-64 sm:w-72 align-middle text-center border-l border-zinc-800 bg-zinc-950/60"
                      >
                        <div className="border border-dashed border-zinc-700 rounded-[3px] p-5 flex flex-col items-center justify-center">
                          <Plus className="w-6 h-6 text-zinc-500 mb-1.5" />
                          <span className="font-bold text-[11px] text-zinc-300 mb-1 uppercase">
                            Ranura Disponible ({selectedMachines.length + i + 1}/{maxMachines})
                          </span>
                          <p className="text-[9px] text-zinc-500 mb-2.5 uppercase">
                            Añade otro modelo para contrastar rendimiento
                          </p>
                          <button
                            onClick={() => setIsPickerOpen(true)}
                            className="py-1.5 px-3 rounded-[2px] bg-zinc-800 text-white font-bold text-[11px] hover:bg-amber-400 hover:text-black transition-colors cursor-pointer uppercase"
                          >
                            + Seleccionar Modelo
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* 2. Specs Breakdown Body */}
                <tbody className="divide-y divide-zinc-800">
                  {/* Category */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Categoría
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 font-semibold text-zinc-200 uppercase">
                        {m.category}
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-cat-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Base Investment Ref */}
                  <tr className="hover:bg-zinc-800/40 transition-colors bg-amber-400/5">
                    <td className="p-3 font-bold text-zinc-300 bg-zinc-950/50 uppercase text-[10px]">
                      Inversión Base Estimada
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 font-black text-amber-400 text-xs font-mono">
                        {formatPrice(m.basePriceUsd)}
                        <span className="block text-[9px] text-zinc-400 font-normal">
                          (Ref. RD$ {(m.basePriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                        </span>
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-price-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Engine Brand & Model */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Motor Diésel
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 font-medium text-zinc-200">
                        {m.engine}
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-eng-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Horsepower */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Potencia Nominal (HP)
                    </td>
                    {selectedMachines.map((m) => {
                      const isHighest = m.powerHp === maxPower && selectedMachines.length > 1;
                      return (
                        <td key={m.id} className="p-3 border-l border-zinc-800 font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-xs ${isHighest ? 'text-amber-400' : 'text-zinc-200'}`}>
                              {m.powerHp} HP
                            </span>
                            {isHighest && (
                              <span className="px-1 py-0.2 rounded-[2px] bg-amber-400/20 text-amber-400 text-[9px] font-bold">
                                MAYOR POTENCIA
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-hp-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Operating Weight */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Peso Operativo
                    </td>
                    {selectedMachines.map((m) => {
                      return (
                        <td key={m.id} className="p-3 border-l border-zinc-800 font-semibold text-zinc-200 font-mono">
                          {m.operatingWeightKg.toLocaleString()} kg ({ (m.operatingWeightKg / 1000).toFixed(1) } Ton)
                        </td>
                      );
                    })}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-w-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Bucket Capacity */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Capacidad Balde
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 font-medium text-zinc-200 font-mono">
                        {m.bucketCapacityM3 ? `${m.bucketCapacityM3} m³` : 'N/A'}
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-b-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Official Warranty */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 uppercase text-[10px]">
                      Garantía TMD MasterCare
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 text-zinc-300">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          2 Años • Taller Km 22
                        </span>
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-gar-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>

                  {/* Applications */}
                  <tr className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3 font-bold text-zinc-400 bg-zinc-950/50 align-top uppercase text-[10px]">
                      Aplicaciones Recomendadas RD
                    </td>
                    {selectedMachines.map((m) => (
                      <td key={m.id} className="p-3 border-l border-zinc-800 align-top">
                        <div className="flex flex-wrap gap-1">
                          {m.applications.map((app, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-300 text-[9px] font-mono uppercase"
                            >
                              {app}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: maxMachines - selectedMachines.length }).map((_, i) => (
                      <td key={`empty-app-${i}`} className="p-3 border-l border-zinc-800 text-zinc-600 italic">
                        -
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 shrink-0 text-xs">
            <div className="text-zinc-400 text-center sm:text-left text-[11px]">
              Mesa de ingeniería y soporte en Patio Km 22: <strong>(809) 560-1234</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedMachines.length < maxMachines && (
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors cursor-pointer uppercase text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Modelo</span>
                </button>
              )}

              <button
                onClick={() => setIsComparisonOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black transition-colors cursor-pointer uppercase text-xs"
              >
                Cerrar Tabla
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Model Picker Dialog */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-mono">
          <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 max-w-lg w-full p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white uppercase">
                Seleccionar Modelo para Comparar
              </h3>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {availableToAdd.length === 0 ? (
                <p className="text-center py-6 text-xs text-zinc-500 uppercase">
                  Todos los modelos disponibles ya han sido agregados a la comparativa.
                </p>
              ) : (
                availableToAdd.map((machine) => (
                  <div
                    key={machine.id}
                    onClick={() => {
                      addMachineToCompare(machine.id);
                      setIsPickerOpen(false);
                    }}
                    className="p-2.5 rounded-[3px] bg-zinc-950 hover:bg-amber-400/10 border border-zinc-800 hover:border-amber-400/50 flex items-center gap-3 cursor-pointer transition-all group"
                  >
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-12 h-12 rounded-[2px] object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase">
                          {machine.brand}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          MOD. {machine.modelCode}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors mt-0.5 uppercase">
                        {machine.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {machine.powerHp} HP • {(machine.operatingWeightKg / 1000).toFixed(1)} Ton
                      </p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="block font-black text-xs text-amber-400">
                        US$ {machine.basePriceUsd.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5 justify-end mt-0.5 uppercase">
                        + Añadir <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Linked Price Estimate Modal */}
      {estimateTargetMachine && (
        <PriceEstimateModal
          machine={estimateTargetMachine}
          isOpen={Boolean(estimateTargetMachine)}
          onClose={() => setEstimateTargetMachine(null)}
          onNavigate={onNavigate}
        />
      )}
    </>,
    document.body
  );
};
