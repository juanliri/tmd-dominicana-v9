import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Activity, ShieldCheck, Zap } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { triggerHaptic } from '../../utils/haptics';

export const NetworkPingBadge: React.FC = () => {
  const { 
    effectiveOnline, 
    latencyMs, 
    checkLatency, 
    isSimulatedOffline, 
    toggleSimulatedOffline,
    openVaultModal 
  } = useOfflineSync();
  const [isPinging, setIsPinging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleManualPing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setIsPinging(true);
    await checkLatency();
    setIsPinging(false);
  };

  // Determine quality color and label
  const getQuality = () => {
    if (!effectiveOnline) {
      return {
        color: 'text-rose-400',
        dotBg: 'bg-rose-500',
        border: 'border-rose-500/40',
        label: isSimulatedOffline ? 'MODO MINA SIMULADO' : 'OFFLINE (SIN SEÑAL)'
      };
    }
    if (latencyMs === null) {
      return {
        color: 'text-amber-400',
        dotBg: 'bg-amber-400',
        border: 'border-amber-400/30',
        label: 'CONECTANDO...'
      };
    }
    if (latencyMs < 75) {
      return {
        color: 'text-emerald-400',
        dotBg: 'bg-emerald-400',
        border: 'border-emerald-500/30',
        label: `${latencyMs}ms (ÓPTIMO)`
      };
    }
    if (latencyMs < 180) {
      return {
        color: 'text-amber-400',
        dotBg: 'bg-amber-400',
        border: 'border-amber-500/30',
        label: `${latencyMs}ms (ESTABLE)`
      };
    }
    return {
      color: 'text-orange-400',
      dotBg: 'bg-orange-400',
      border: 'border-orange-500/30',
      label: `${latencyMs}ms (SATELITAL/4G)`
    };
  };

  const quality = getQuality();

  return (
    <div className="relative inline-block font-mono">
      <button
        type="button"
        onClick={() => {
          triggerHaptic('selection');
          setShowTooltip(!showTooltip);
        }}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-zinc-900 border ${quality.border} text-[10px] font-bold transition-all cursor-pointer hover:bg-zinc-800`}
        title="Estado de latencia y sincronización de red en tiempo real"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {effectiveOnline && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${quality.dotBg} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${quality.dotBg}`} />
        </span>
        <span className={`${quality.color} font-black`}>
          {effectiveOnline ? (latencyMs !== null ? `${latencyMs}ms` : 'NET') : 'OFFLINE'}
        </span>
      </button>

      {/* Expanded Quick Diagnostic Popover */}
      {showTooltip && (
        <div 
          className="absolute right-0 top-full mt-1.5 z-50 w-64 p-3 bg-zinc-950 border border-zinc-800 rounded-[4px] shadow-2xl text-left font-mono space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              TELEMETRÍA DE RED & SERVIDOR
            </span>
            <button
              onClick={handleManualPing}
              disabled={isPinging}
              className="text-zinc-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Medir latencia ahora"
            >
              <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400 uppercase">Estado Enlace:</span>
              <span className={`font-bold uppercase ${quality.color}`}>{quality.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 uppercase">Servidor:</span>
              <span className="text-zinc-200">Santo Domingo (RD)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400 uppercase">Bóveda Offline:</span>
              <span className="text-emerald-400 font-bold">ACTIVA</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setShowTooltip(false);
                toggleSimulatedOffline();
              }}
              className="px-2 py-1 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-bold uppercase transition-all cursor-pointer"
            >
              {isSimulatedOffline ? 'Restaurar Red' : 'Simular Corte'}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setShowTooltip(false);
                openVaultModal();
              }}
              className="px-2 py-1 rounded-[2px] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] font-black uppercase transition-all cursor-pointer"
            >
              Bóveda PWA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
