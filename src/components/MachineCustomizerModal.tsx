import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sliders, 
  X, 
  Check, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  Send, 
  Copy, 
  RotateCcw, 
  Layers, 
  ArrowRight,
  FileText,
  Info,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { Machine, MachineCustomizationOption } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { 
  getCustomizationOptionsForMachine, 
  calculateRealtimePriceRange,
  CUSTOMIZATION_PRESETS,
  CustomizationPreset
} from '../data/machineCustomizationOptions';
import { useCart } from '../context/CartContext';

interface MachineCustomizerModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

type CategoryTab = 'all' | 'attachments' | 'cabin' | 'powertrain_hydraulics' | 'technology_safety' | 'undercarriage_tires' | 'warranty_service';

export const MachineCustomizerModal: React.FC<MachineCustomizerModalProps> = ({
  machine,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { addMachineToQuote } = useCart();

  // State: Set of selected option IDs
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [activePresetId, setActivePresetId] = useState<string>('standard');
  const [copied, setCopied] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Initialize with standard preset when a machine is selected
  useEffect(() => {
    if (machine) {
      const standardPreset = CUSTOMIZATION_PRESETS.find((p) => p.id === 'standard');
      if (standardPreset) {
        setSelectedOptionIds(new Set(standardPreset.optionIds));
        setActivePresetId('standard');
      }
    }
  }, [machine?.id]);

  const applicableOptions = useMemo(() => {
    if (!machine) return [];
    return getCustomizationOptionsForMachine(machine);
  }, [machine]);

  // Real-time calculated price range
  const priceRange = useMemo(() => {
    if (!machine) return null;
    return calculateRealtimePriceRange(machine, selectedOptionIds);
  }, [machine, selectedOptionIds]);

  if (!isOpen || !machine || !priceRange || typeof document === 'undefined') return null;

  // Toggle or select an option
  const handleToggleOption = (option: MachineCustomizationOption) => {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev);

      if (option.exclusiveGroup) {
        // If it's an exclusive group (radio behavior), remove all other options in this group first
        applicableOptions
          .filter((o) => o.exclusiveGroup === option.exclusiveGroup)
          .forEach((o) => next.delete(o.id));
        
        // Select the clicked one
        next.add(option.id);
      } else {
        // Checkbox behavior (optional multi-select add-ons)
        if (next.has(option.id)) {
          next.delete(option.id);
        } else {
          next.add(option.id);
        }
      }

      // Custom preset state becomes 'custom'
      setActivePresetId('custom');
      return next;
    });
  };

  // Apply a preset pack
  const handleApplyPreset = (preset: CustomizationPreset) => {
    setActivePresetId(preset.id);
    const validIds = new Set(
      preset.optionIds.filter((id) => applicableOptions.some((o) => o.id === id))
    );
    setSelectedOptionIds(validIds);
  };

  // Reset to default standard
  const handleResetToStandard = () => {
    const standardPreset = CUSTOMIZATION_PRESETS.find((p) => p.id === 'standard');
    if (standardPreset) {
      setSelectedOptionIds(new Set(standardPreset.optionIds));
      setActivePresetId('standard');
    }
  };

  // Add customized machine to official quote/proforma
  const handleAddToQuote = () => {
    addMachineToQuote(
      machine,
      true,
      priceRange.selectedOptionsList,
      { minUsd: priceRange.minEstimatedUsd, maxUsd: priceRange.maxEstimatedUsd }
    );
    onClose();
    onNavigate('#/checkout');
  };

  // Compose structured WhatsApp message with custom specs and price range
  const handleShareWhatsApp = () => {
    let msg = `*CONFIGURACIÓN DE MAQUINARIA PERSONALIZADA - TMD DOMINICANA*\n`;
    msg += `---------------------------------------------------\n`;
    msg += `*Equipo:* ${machine.name} (${machine.brand})\n`;
    msg += `*Modelo:* ${machine.modelCode} | Año 2026\n`;
    msg += `*Precio Base de Fábrica:* US$ ${machine.basePriceUsd.toLocaleString()} (~RD$ ${(machine.basePriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})\n\n`;

    msg += `*RANGO DE INVERSIÓN ESTIMADO (EN TIEMPO REAL):*\n`;
    msg += `*US$ ${priceRange.minEstimatedUsd.toLocaleString()} – US$ ${priceRange.maxEstimatedUsd.toLocaleString()}*\n`;
    msg += `*RD$ ${priceRange.minEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })} – RD$ ${priceRange.maxEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}*\n`;
    msg += `*Cuota Leasing Est. (36m, 20% inicial):* ~US$ ${priceRange.minMonthlyLeasingUsd.toLocaleString()} – ${priceRange.maxMonthlyLeasingUsd.toLocaleString()} / mes\n\n`;

    msg += `*OPCIONES Y ADITAMENTOS SELECCIONADOS (${priceRange.selectedOptionsList.length}):*\n`;
    priceRange.selectedOptionsList.forEach((opt, idx) => {
      const costStr = opt.maxPriceUsd > 0
        ? `+US$ ${opt.minPriceUsd.toLocaleString()} – ${opt.maxPriceUsd.toLocaleString()}`
        : `Incluido ($0)`;
      msg += `${idx + 1}. ${opt.name} [${costStr}]\n`;
    });

    msg += `\n*Sede de Preparación y Entrega:* TMD Km 22 Autopista Duarte, SDO.\n`;
    msg += `*Solicito validación de disponibilidad y proforma formal.*`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/18095558631?text=${encoded}`, '_blank');
  };

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    let text = `Configuración de Maquinaria TMD Dominicana:\n`;
    text += `Equipo: ${machine.brand} ${machine.name} (${machine.modelCode})\n`;
    text += `Rango de Precio Estimado: US$ ${priceRange.minEstimatedUsd.toLocaleString()} – US$ ${priceRange.maxEstimatedUsd.toLocaleString()}\n`;
    text += `Equivalente en Pesos: RD$ ${priceRange.minEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })} – RD$ ${priceRange.maxEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}\n`;
    text += `Cuota Leasing Est.: US$ ${priceRange.minMonthlyLeasingUsd.toLocaleString()} – ${priceRange.maxMonthlyLeasingUsd.toLocaleString()} / mes\n\n`;
    text += `Opciones Seleccionadas:\n`;
    priceRange.selectedOptionsList.forEach((opt) => {
      text += `- ${opt.name} (${opt.maxPriceUsd > 0 ? `+US$ ${opt.minPriceUsd} – ${opt.maxPriceUsd}` : 'Incluido'})\n`;
    });

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        console.warn('Could not copy summary to clipboard:', fallbackErr);
      }
    }
  };

  // Filter options by category tab
  const filteredOptions = activeCategory === 'all'
    ? applicableOptions
    : applicableOptions.filter((o) => o.category === activeCategory);

  const categoryTabs: { id: CategoryTab; label: string }[] = [
    { id: 'all', label: 'Todas las Opciones' },
    { id: 'attachments', label: 'Aditamentos' },
    { id: 'cabin', label: 'Cabina & Confort' },
    { id: 'powertrain_hydraulics', label: 'Hidráulica & Blindaje' },
    { id: 'technology_safety', label: 'Tecnología & Seguridad' },
    { id: 'undercarriage_tires', label: 'Rodaje / Llantas' },
    { id: 'warranty_service', label: 'Garantía & Respaldo' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-5xl bg-zinc-900 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[3px] bg-zinc-900 border border-zinc-800 p-0.5 flex items-center justify-center shrink-0">
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover rounded-[2px]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black font-black text-[9px] uppercase tracking-wider">
                  {machine.brand}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-400">
                  MOD. {machine.modelCode}
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline uppercase">
                  {machine.category}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate uppercase tracking-tight">
                Configurador de Personalización: {machine.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleResetToStandard}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 text-[11px] font-bold transition-colors flex items-center gap-1.5 uppercase cursor-pointer"
              title="Restablecer a configuración de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restablecer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* REAL-TIME ESTIMATED PRICE RANGE HERO BANNER */}
        <div className="bg-zinc-950 text-white p-3.5 sm:p-4 border-b border-amber-400/30 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Rango de Inversión Estimado en Tiempo Real</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 uppercase">
                  {priceRange.activeOptionsCount} OPC. ADICIONALES
                </span>
              </div>

              {/* Real-time price numbers */}
              <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono">
                  <span className="text-amber-400">US$</span> {priceRange.minEstimatedUsd.toLocaleString()}{' '}
                  <span className="text-zinc-500 font-light">–</span>{' '}
                  <span className="text-amber-400">US$</span> {priceRange.maxEstimatedUsd.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-zinc-400 font-mono">
                  ~RD$ {priceRange.minEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })} – RD$ {priceRange.maxEstimatedDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* Math breakdown subtext */}
              <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-zinc-400 mt-2 font-mono">
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                  BASE: US$ {machine.basePriceUsd.toLocaleString()}
                </span>
                <span>+</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold">
                  OPCIONES: +US$ {priceRange.optionsMinUsd.toLocaleString()} – {priceRange.optionsMaxUsd.toLocaleString()}
                </span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="text-zinc-500 hidden sm:inline uppercase">
                  PDI & alistamiento en Km 22 Autopista Duarte
                </span>
              </div>
            </div>

            {/* Monthly Leasing Estimate Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3 shrink-0 flex flex-row lg:flex-col items-center lg:items-start justify-between gap-3 font-mono">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">
                  Cuota Mensual Leasing Estimada
                </span>
                <div className="text-sm sm:text-base font-black text-amber-400">
                  US$ {priceRange.minMonthlyLeasingUsd.toLocaleString()} – {priceRange.maxMonthlyLeasingUsd.toLocaleString()}
                  <span className="text-[10px] font-normal text-zinc-400 ml-1">/ MES</span>
                </div>
                <span className="text-[9px] text-zinc-500 block mt-0.5 uppercase">
                  36M • 20% INICIAL • TASA 8.9%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 uppercase border border-zinc-700"
              >
                <span>{showBreakdown ? 'Ocultar' : 'Ver Desglose'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Breakdown Drawer */}
          {showBreakdown && (
            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs animate-in fade-in duration-150 font-mono">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider mb-2 text-[10px]">
                Artículos Incluidos en esta Configuración ({priceRange.selectedOptionsList.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {priceRange.selectedOptionsList.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                  >
                    <span className="truncate mr-2 uppercase">{opt.name}</span>
                    <span className="shrink-0 font-bold text-[10px] text-amber-400">
                      {opt.maxPriceUsd > 0
                        ? `+US$ ${opt.minPriceUsd.toLocaleString()} – ${opt.maxPriceUsd.toLocaleString()}`
                        : 'Incluido'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preset Packages Quick Bar */}
        <div className="p-2.5 sm:p-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-zinc-400 shrink-0 flex items-center gap-1.5 ml-1 uppercase">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>PAQUETES:</span>
          </span>
          {CUSTOMIZATION_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border uppercase ${
                  isActive
                    ? 'bg-amber-400 text-black border-amber-400 shadow-xs font-black'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span>{preset.name}</span>
                <span className={`text-[9px] px-1 rounded-[2px] font-mono ${
                  isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Navigation Tabs */}
        <div className="px-3 sm:px-4 pt-2.5 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`pb-2 text-[11px] font-bold transition-all cursor-pointer shrink-0 border-b-2 px-1 flex items-center gap-1.5 uppercase ${
                  isActive
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Options Selection Grid (Scrollable Body) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-zinc-950 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            {filteredOptions.map((option) => {
              const isSelected = selectedOptionIds.has(option.id);
              const isRadio = Boolean(option.exclusiveGroup);

              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(option)}
                  className={`p-3 rounded-[3px] border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-400/80 shadow-xs ring-1 ring-amber-400/20'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div>
                    {/* Top line: Selection indicator & pricing tag */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 flex items-center justify-center transition-all ${
                            isRadio ? 'rounded-full' : 'rounded-[2px]'
                          } ${
                            isSelected
                              ? 'bg-amber-400 text-black shadow-xs'
                              : 'border border-zinc-700 bg-zinc-950'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {option.categoryLabel}
                        </span>
                      </div>

                      {/* Price Badge */}
                      <div className="text-right font-mono">
                        {option.maxPriceUsd === 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                            Incluido ($0)
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-bold text-amber-400">
                              +US$ {option.minPriceUsd.toLocaleString()} – {option.maxPriceUsd.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              ~RD$ {(option.minPriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })} – {(option.maxPriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Option Title */}
                    <h3 className={`text-xs font-bold mb-1 transition-colors uppercase ${
                      isSelected ? 'text-white' : 'text-zinc-200'
                    }`}>
                      {option.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
                      {option.description}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  {option.specsBadge && (
                    <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">Especificación:</span>
                      <span className="font-bold text-zinc-300">
                        {option.specsBadge}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-3.5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Summary status indicator */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 w-full sm:w-auto justify-between sm:justify-start font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase text-[11px]">
                Configuración: <strong className="text-white">{priceRange.selectedOptionsList.length} ítems</strong>
              </span>
            </div>
            <span className="font-bold text-amber-400 sm:hidden text-xs">
              US$ {priceRange.minEstimatedUsd.toLocaleString()} – {priceRange.maxEstimatedUsd.toLocaleString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-[2px] border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase"
              title="Copiar resumen al portapapeles"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>{copied ? 'Copiado' : 'Copiar Resumen'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 uppercase shadow-xs"
              title="Consultar por WhatsApp con el asesor oficial"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp Asesor</span>
            </button>

            <button
              type="button"
              onClick={handleAddToQuote}
              className="flex-1 sm:flex-initial px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Añadir a Proforma</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
