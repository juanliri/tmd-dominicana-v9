import React, { useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check, 
  RotateCcw, 
  Zap, 
  Layers, 
  Fuel, 
  Scale, 
  Building2 
} from 'lucide-react';
import { MachineBrand } from '../../types';

export interface FacetFilterState {
  brands: string[];
  tonnageRange: string[]; // 'mini' | 'medium' | 'heavy' | 'extra_heavy'
  powerRange: string[];   // 'low' | 'mid' | 'high' | 'ultra'
  fuelTypes: string[];    // 'tier3' | 'tier4f' | 'diesel'
  availability: string[]; // 'in_stock' | 'transit' | 'factory'
}

interface MachineryFacetFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FacetFilterState;
  onChange: (filters: FacetFilterState) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const MachineryFacetFilterDrawer: React.FC<MachineryFacetFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  totalFilteredCount
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brand: true,
    tonnage: true,
    power: false,
    fuel: false,
    availability: true
  });

  if (!isOpen) return null;

  const toggleSection = (sec: string) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleValue = (category: keyof FacetFilterState, val: string) => {
    const current = filters[category] as string[];
    const next = current.includes(val)
      ? current.filter(x => x !== val)
      : [...current, val];
    onChange({ ...filters, [category]: next });
  };

  const activeFilterCount = 
    filters.brands.length + 
    filters.tonnageRange.length + 
    filters.powerRange.length + 
    filters.fuelTypes.length + 
    filters.availability.length;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end bg-black/75 backdrop-blur-xs font-mono animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-display uppercase tracking-tight">
                Filtros Multifaceta
              </h3>
              <span className="text-[10px] text-zinc-400">
                {totalFilteredCount} Equipos Coincidentes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="px-2 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar ({activeFilterCount})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Facet Accordions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* 1. Brand Facet Accordion */}
          <div className="border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900/60">
            <button
              onClick={() => toggleSection('brand')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-white uppercase hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Marca de Fabricante</span>
                {filters.brands.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                    {filters.brands.length}
                  </span>
                )}
              </div>
              {openSections.brand ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.brand && (
              <div className="p-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                {['LiuGong', 'JCB', 'Yanmar', 'Ammann', 'Kubota', 'LS Tractor', 'IMER', 'AFEX'].map((b) => {
                  const isChecked = filters.brands.includes(b);
                  return (
                    <button
                      key={b}
                      onClick={() => toggleValue('brands', b)}
                      className={`p-2 rounded-[2px] border text-left text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{b}</span>
                      {isChecked && <Check className="w-3 h-3 text-black" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Tonnage Range Accordion */}
          <div className="border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900/60">
            <button
              onClick={() => toggleSection('tonnage')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-white uppercase hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Rango de Tonelaje Operativo</span>
                {filters.tonnageRange.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                    {filters.tonnageRange.length}
                  </span>
                )}
              </div>
              {openSections.tonnage ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.tonnage && (
              <div className="p-3 border-t border-zinc-800/80 space-y-1.5 text-xs">
                {[
                  { id: 'mini', label: '1 - 6 Toneladas (Compacta / Urbana)' },
                  { id: 'medium', label: '7 - 15 Toneladas (Mediana / Vial)' },
                  { id: 'heavy', label: '16 - 25 Toneladas (Pesada Estándar)' },
                  { id: 'extra_heavy', label: '> 25 Toneladas (Mina / Cantera Dura)' }
                ].map((t) => {
                  const isChecked = filters.tonnageRange.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleValue('tonnageRange', t.id)}
                      className={`w-full p-2 rounded-[2px] border text-left text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isChecked && <Check className="w-3 h-3 text-black" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Horsepower Accordion */}
          <div className="border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900/60">
            <button
              onClick={() => toggleSection('power')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-white uppercase hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Potencia de Motor (HP)</span>
                {filters.powerRange.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                    {filters.powerRange.length}
                  </span>
                )}
              </div>
              {openSections.power ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.power && (
              <div className="p-3 border-t border-zinc-800/80 space-y-1.5 text-xs">
                {[
                  { id: 'low', label: 'Hasta 60 HP (Agrícola / Mini)' },
                  { id: 'mid', label: '61 - 120 HP (Retroexcavadoras / Rodillos)' },
                  { id: 'high', label: '121 - 200 HP (Excavadoras 20-22T)' },
                  { id: 'ultra', label: '> 200 HP (Palas 36T / Cargadores Pesados)' }
                ].map((p) => {
                  const isChecked = filters.powerRange.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleValue('powerRange', p.id)}
                      className={`w-full p-2 rounded-[2px] border text-left text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isChecked && <Check className="w-3 h-3 text-black" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Availability Accordion */}
          <div className="border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900/60">
            <button
              onClick={() => toggleSection('availability')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-white uppercase hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Disponibilidad en Rep. Dominicana</span>
                {filters.availability.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                    {filters.availability.length}
                  </span>
                )}
              </div>
              {openSections.availability ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {openSections.availability && (
              <div className="p-3 border-t border-zinc-800/80 space-y-1.5 text-xs">
                {[
                  { id: 'in_stock', label: '✓ Entrega Inmediata (Patio Km 22 Duarte)', color: 'text-emerald-400' },
                  { id: 'transit', label: '🚢 En Tránsito Marítimo (Puerto Caucedo / Río Haina)', color: 'text-amber-400' },
                  { id: 'factory', label: '🏭 Pedido Directo de Fábrica (4-6 Semanas)', color: 'text-zinc-400' }
                ].map((a) => {
                  const isChecked = filters.availability.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleValue('availability', a.id)}
                      className={`w-full p-2 rounded-[2px] border text-left text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400 text-black border-amber-400 font-bold'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className={isChecked ? 'text-black' : a.color}>{a.label}</span>
                      {isChecked && <Check className="w-3 h-3 text-black" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-colors cursor-pointer text-center font-display tracking-wider shadow-sm"
          >
            Ver {totalFilteredCount} Maquinarias
          </button>
        </div>

      </div>
    </div>
  );
};
