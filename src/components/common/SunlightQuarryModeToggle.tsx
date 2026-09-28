import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export const SunlightQuarryModeToggle: React.FC = () => {
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tmd_sunlight_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isSunlightMode) {
      root.classList.add('sunlight-quarry-mode');
      localStorage.setItem('tmd_sunlight_mode', 'true');
    } else {
      root.classList.remove('sunlight-quarry-mode');
      localStorage.setItem('tmd_sunlight_mode', 'false');
    }
  }, [isSunlightMode]);

  return (
    <button
      type="button"
      onClick={() => setIsSunlightMode(prev => !prev)}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] text-xs font-mono font-bold uppercase transition-all cursor-pointer border shadow-xs ${
        isSunlightMode
          ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/50'
          : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-700 hover:text-amber-400'
      }`}
      title={
        isSunlightMode
          ? 'Desactivar Modo Cantera (Volver a Dark Mode Industrial)'
          : 'Activar Modo Cantera / Sol Radiante: Alto contraste polar para uso en tabletas al mediodía'
      }
    >
      <Sun className={`w-3.5 h-3.5 ${isSunlightMode ? 'text-black animate-spin-slow' : 'text-amber-400'}`} />
      <span className="hidden xl:inline">
        {isSunlightMode ? 'MODO SOL ACTIVO' : 'MODO CANTERA'}
      </span>
    </button>
  );
};
