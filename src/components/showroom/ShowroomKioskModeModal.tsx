import React, { useState, useEffect } from 'react';
import {
  MonitorPlay,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { MACHINES_DATA } from '../../data/catalog';

interface ShowroomKioskModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMachine?: (machineId: string) => void;
}

export const ShowroomKioskModeModal: React.FC<ShowroomKioskModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMachine
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter 6 hero flagship machines for showroom display
  const showroomMachines = MACHINES_DATA.slice(0, 6);
  const currentMachine = showroomMachines[currentIndex] || showroomMachines[0];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % showroomMachines.length);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, showroomMachines.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % showroomMachines.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + showroomMachines.length) % showroomMachines.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white overflow-hidden select-none font-sans">
      {/* Background Image with dramatic cinema gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={currentMachine.image}
          alt={currentMachine.name}
          className="w-full h-full object-cover object-center filter brightness-60 contrast-110 scale-105 transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80" />
      </div>

      {/* Top Kiosk Header Bar */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-[2px] bg-amber-400 text-black font-black font-mono text-xs uppercase tracking-widest flex items-center gap-1.5">
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>MODO KIOSCO • SALA DE VENTAS KM 22</span>
          </div>
          <span className="text-xs text-zinc-300 font-mono hidden sm:inline">
            TECNOMAQUINARIAS DIESEL &bull; DISTRIBUIDOR AUTORIZADO
          </span>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-[2px] bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
            title={isPlaying ? 'Pausar rotación' : 'Reanudar rotación automática'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-[2px] bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
            title="Pantalla Completa Kiosco"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-[2px] bg-red-600/80 hover:bg-red-500 text-white transition-colors cursor-pointer"
            title="Salir del Modo Kiosco"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Showcase */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 sm:p-12 max-w-6xl mx-auto w-full">
        {/* Machine Meta Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-[2px] bg-amber-500 text-black font-black font-mono text-xs uppercase tracking-widest">
            {currentMachine.brand}
          </span>
          <span className="px-3 py-1 rounded-[2px] bg-black/60 border border-white/20 text-white font-mono text-xs uppercase tracking-widest backdrop-blur-xs">
            {currentMachine.category}
          </span>
          <span className="px-3 py-1 rounded-[2px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ENTREGA INMEDIATA EN PATIO KM 22
          </span>
        </div>

        {/* Machine Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display uppercase tracking-tight text-white drop-shadow-xl mb-4">
          {currentMachine.name}
        </h1>

        {/* Machine Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mb-6 font-mono">
          <div className="p-3 bg-black/70 backdrop-blur-md rounded-[3px] border border-white/15">
            <span className="text-[10px] text-zinc-400 uppercase block">POTENCIA MOTOR:</span>
            <span className="text-base sm:text-lg font-black text-amber-400">
              {currentMachine.enginePowerHp ? `${currentMachine.enginePowerHp} HP` : 'Motor Cummins'}
            </span>
          </div>

          <div className="p-3 bg-black/70 backdrop-blur-md rounded-[3px] border border-white/15">
            <span className="text-[10px] text-zinc-400 uppercase block">PESO OPERATIVO:</span>
            <span className="text-base sm:text-lg font-black text-white">
              {currentMachine.operatingWeightKg ? `${(currentMachine.operatingWeightKg / 1000).toFixed(1)} Ton` : 'Uso Pesado HD'}
            </span>
          </div>

          <div className="p-3 bg-black/70 backdrop-blur-md rounded-[3px] border border-white/15">
            <span className="text-[10px] text-zinc-400 uppercase block">CAPACIDAD CUCHARA:</span>
            <span className="text-base sm:text-lg font-black text-white">
              {currentMachine.bucketCapacityM3 ? `${currentMachine.bucketCapacityM3} m³` : 'Reforzada'}
            </span>
          </div>

          <div className="p-3 bg-black/70 backdrop-blur-md rounded-[3px] border border-white/15">
            <span className="text-[10px] text-zinc-400 uppercase block">GARANTÍA TMD:</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {currentMachine.warrantyMonths || 24} Meses
            </span>
          </div>
        </div>

        {/* Price & Action Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/15 bg-black/50 p-4 rounded-[4px] backdrop-blur-md">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-mono block">PRECIO BASE DE REFERENCIA:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                US$ {currentMachine.basePriceUsd.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                (Aprox. RD$ {(currentMachine.basePriceUsd * 60).toLocaleString()})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSelectMachine && (
              <button
                type="button"
                onClick={() => {
                  onSelectMachine(currentMachine.id);
                  onClose();
                }}
                className="flex-1 sm:flex-none px-6 py-3 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2 font-display"
              >
                <span>Ver Ficha Técnica Completa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="p-2.5 rounded-[2px] bg-white/10 border border-white/20 text-zinc-300 flex items-center gap-2 font-mono text-xs">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>(809) 560-1234</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Thumbnail Navigation Carousel */}
      <div className="relative z-10 p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 rounded-[2px] bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          {showroomMachines.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`flex items-center gap-2.5 p-1.5 rounded-[3px] border transition-all cursor-pointer shrink-0 ${
                idx === currentIndex
                  ? 'bg-amber-400/20 border-amber-400 scale-105'
                  : 'bg-black/60 border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={m.image}
                alt={m.name}
                className="w-10 h-8 object-cover rounded-[1px]"
              />
              <div className="text-left font-mono">
                <span className="text-[10px] text-zinc-400 block uppercase">{m.brand}</span>
                <span className="text-xs font-bold text-white block truncate max-w-[120px]">{m.name}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-2 rounded-[2px] bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
