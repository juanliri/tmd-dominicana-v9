import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export const ComparisonFloatingBar: React.FC = () => {
  const { 
    selectedMachines, 
    removeMachineFromCompare, 
    openComparison, 
    clearComparison, 
    maxMachines 
  } = useComparison();

  if (selectedMachines.length === 0) return null;

  return (
    <div className="fixed bottom-18 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl animate-in slide-in-from-bottom duration-300 font-mono">
      <div className="bg-[#0c0c14]/95 text-white border border-white/[0.1] rounded-xl shadow-2xl backdrop-blur-xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
        {/* Left: Indicator and Machine Thumbnails */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#d99b26] text-black flex items-center justify-center font-black shrink-0 shadow-sm">
            <Scale className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#e0a22a] uppercase tracking-wide">
                Comparativa Activa
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-[#14141c] text-[9px] font-mono text-zinc-300 border border-white/[0.08] font-bold">
                {selectedMachines.length}/{maxMachines}
              </span>
            </div>

            {/* Micro thumbnails */}
            <div className="flex items-center gap-1.5 mt-1 overflow-x-auto scrollbar-none py-0.5">
              {selectedMachines.map((m) => (
                <div 
                  key={m.id} 
                  className="relative group shrink-0 flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-md bg-[#07070b] border border-white/[0.08] text-[10px]"
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-4 h-4 rounded-[2px] object-cover"
                  />
                  <span className="font-bold text-zinc-300 truncate max-w-[80px] sm:max-w-[120px] uppercase">
                    {m.modelCode}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMachineFromCompare(m.id);
                    }}
                    className="p-0.5 rounded-[2px] hover:bg-[#181824] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="hidden sm:inline-flex p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-[#181824] transition-colors text-xs font-semibold cursor-pointer"
            title="Limpiar Selección"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openComparison}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-lg bg-[#d99b26] hover:bg-[#e0a22a] text-black font-black text-xs shadow-xs transition-all cursor-pointer uppercase"
          >
            <span>Ver Tabla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
