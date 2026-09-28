import React, { useState } from 'react';
import { Scale, X, ArrowRight, Trash2, Plus, Sparkles } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

export const ComparisonFloatingBar: React.FC = () => {
  const { 
    selectedMachines, 
    removeMachineFromCompare, 
    openComparison, 
    clearComparison, 
    addMachineToCompare,
    maxMachines 
  } = useComparison();

  const [isDragOver, setIsDragOver] = useState(false);

  // If no machines selected and not dragging, hide dock
  if (selectedMachines.length === 0 && !isDragOver) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only toggle if left container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const machineId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('machine-id');
    if (machineId) {
      addMachineToCompare(machineId);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="fixed bottom-16 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom duration-300 font-mono"
    >
      <div 
        className={`bg-zinc-950/95 text-white border transition-all duration-200 rounded-[4px] shadow-2xl backdrop-blur-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 ${
          isDragOver 
            ? 'border-amber-400 ring-2 ring-amber-400/40 bg-zinc-900/98 scale-[1.01]' 
            : 'border-zinc-800'
        }`}
      >
        {/* Left: Indicator and Machine Thumbnails */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black shrink-0 shadow-sm">
            <Scale className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider font-display">
                {isDragOver ? 'SUELTA AQUÍ PARA COMPARAR' : 'COMPARADOR FLOTANTE'}
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-zinc-900 text-[9px] font-mono text-zinc-300 border border-zinc-800 font-bold">
                {selectedMachines.length}/{maxMachines} EQUIPOS
              </span>
            </div>

            {/* Micro thumbnails */}
            <div className="flex items-center gap-1.5 mt-1 overflow-x-auto scrollbar-none py-0.5">
              {selectedMachines.map((m) => (
                <div 
                  key={m.id} 
                  className="relative group shrink-0 flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-[10px]"
                >
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-4 h-4 rounded-[2px] object-cover bg-zinc-800"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/tmd_coming_soon.jpg';
                    }}
                  />
                  <span className="font-bold text-zinc-200 truncate max-w-[80px] sm:max-w-[120px] uppercase">
                    {m.modelCode}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMachineFromCompare(m.id);
                    }}
                    className="p-0.5 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="Remover del comparador"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* Slot placeholder for remaining up to maxMachines */}
              {Array.from({ length: Math.max(0, maxMachines - selectedMachines.length) }).map((_, idx) => (
                <div 
                  key={`empty-${idx}`}
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-[2px] border border-dashed border-zinc-800 text-zinc-600 text-[9px] uppercase"
                >
                  <Plus className="w-2.5 h-2.5 text-zinc-600" />
                  <span>Arrastra equipo</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="hidden sm:inline-flex p-1.5 text-zinc-400 hover:text-zinc-200 rounded-[2px] hover:bg-zinc-900 transition-colors text-xs font-semibold cursor-pointer border border-transparent hover:border-zinc-800"
            title="Limpiar Comparador"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openComparison}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-xs transition-all cursor-pointer uppercase tracking-wider font-display"
          >
            <span>COMPARAR ({selectedMachines.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
