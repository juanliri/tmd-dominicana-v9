import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  Scale, 
  PhoneCall, 
  AlertTriangle, 
  Wrench, 
  X, 
  MapPin, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useComparison } from '../../../context/ComparisonContext';
import { triggerHaptic } from '../../../utils/haptics';
import { useScrollDirection } from '../../../hooks/useScrollDirection';

interface FloatingActionOrchestratorProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenChatbot?: () => void;
  isChatbotOpen?: boolean;
}

export const FloatingActionOrchestrator: React.FC<FloatingActionOrchestratorProps> = ({
  currentRoute,
  onNavigate,
  onOpenChatbot,
  isChatbotOpen = false
}) => {
  const { isScrollingDown } = useScrollDirection();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const { selectedMachineIds, openComparison } = useComparison();

  const isExcludedRoute = [
    '#/checkout', 
    '#/admin', 
    '#/admin-dashboard',
    '#/portal',
    '#/fullbay',
    '#/livelink'
  ].includes(currentRoute);
  const isEmergencyRoute = currentRoute === '#/emergency';
  const hasActiveComparison = selectedMachineIds.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isExcludedRoute) {
    return null;
  }

  return (
    <>
      {/* 24/7 Emergency Quick Action Popover */}
      {isSosOpen && (
        <div className="fixed bottom-36 sm:bottom-36 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-88 bg-zinc-950 text-white rounded-[5px] border border-red-500/50 shadow-2xl p-4 font-mono animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 absolute top-0 left-0 right-0 rounded-t-[5px]" />
          
          <div className="flex items-start justify-between gap-2 pt-1 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Emergencia 24/7 en Obra
                </h4>
                <p className="text-[10px] text-zinc-400 font-sans">
                  Despacho Inmediato de Taller Móvil
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setIsSosOpen(false);
              }}
              className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-300 my-2.5 font-sans leading-relaxed">
            ¿Equipo detenido en cantera o proyecto nocturno? Contacta a la unidad móvil más cercana en República Dominicana.
          </p>

          <div className="space-y-2 text-xs">
            {/* Direct Phone Call */}
            <a
              href="tel:+18095601234"
              className="w-full py-2 px-3 rounded-[3px] bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider flex items-center justify-between transition-colors shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>Llamar Guardia 24/7</span>
              </div>
              <span className="text-[10px] font-mono opacity-90">(809) 560-1234</span>
            </a>

            {/* WhatsApp Quick Dispatch with GPS */}
            <a
              href={`https://wa.me/18095601234?text=${encodeURIComponent(
                '🚨 *EMERGENCIA EN OBRA / AVERÍA DE MAQUINARIA*\n\nSolicito despacho urgente de taller móvil TMD. Equipo varado en proyecto.\n\n📍 Ubicación / Obra:\n🚜 Modelo de Equipo:\n⚠️ Falla observada:'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>Despacho por WhatsApp</span>
              </div>
              <span className="text-[10px] text-emerald-300">Km 22 Duarte</span>
            </a>

            {/* Full Emergency Form */}
            <button
              type="button"
              onClick={() => {
                setIsSosOpen(false);
                onNavigate('#/emergency');
              }}
              className="w-full py-1.5 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold uppercase text-[10px] tracking-wider flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Ver Unidades Móviles en Radar</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons Container */}
      <div 
        className={`fixed left-4 sm:left-auto sm:right-6 bottom-20 sm:bottom-22 z-40 flex sm:flex-col items-start sm:items-end gap-2 sm:gap-2.5 font-mono pointer-events-none transition-all duration-300 ease-in-out ${
          isScrollingDown && !isSosOpen
            ? 'translate-y-28 opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Floating 24/7 SOS Emergency Button (Only when not on #/emergency) */}
        {!isEmergencyRoute && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('heavy');
              setIsSosOpen(!isSosOpen);
            }}
            className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs border border-red-400/50 shadow-xl shadow-red-600/30 transition-all cursor-pointer pointer-events-auto active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-200"
            title="Llamada de Emergencia 24/7 para averías en obra"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wide">SOS 24/7</span>
          </button>
        )}

        {/* Floating Compare Pill (If 1+ machines are selected for comparison) */}
        {hasActiveComparison && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              openComparison();
            }}
            className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs border border-amber-300 shadow-xl shadow-amber-500/25 transition-all cursor-pointer pointer-events-auto active:scale-95 animate-in bounce-in duration-200"
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>Comparar ({selectedMachineIds.length})</span>
          </button>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="p-2 sm:p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 shadow-xl backdrop-blur-md transition-all cursor-pointer pointer-events-auto active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-150"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
};
