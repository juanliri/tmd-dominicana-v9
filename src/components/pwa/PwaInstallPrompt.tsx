import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  X, 
  Share2, 
  PlusSquare, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const { isScrollingDown } = useScrollDirection();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const until = localStorage.getItem('tmd_pwa_dismissed_until');
      if (until && Number(until) > Date.now()) return true;
      return sessionStorage.getItem('tmd_pwa_dismissed') === 'true';
    }
    return false;
  });
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS devices (Safari does not emit beforeinstallprompt)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    if (isIosDevice) {
      setIsInstallable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      // Remember dismissal for 7 days
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('tmd_pwa_dismissed_until', String(expiry));
      sessionStorage.setItem('tmd_pwa_dismissed', 'true');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructionsModal(true);
    }
  };

  // Only show when installable is detected and not dismissed
  if (isInstalled || dismissed || !isInstallable) return null;

  return (
    <>
      <div 
        className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-zinc-900 text-zinc-100 p-3.5 sm:p-4 rounded-[5px] border border-zinc-800 shadow-2xl transition-all duration-300 ease-in-out font-mono overflow-hidden ${
          isScrollingDown 
            ? 'translate-y-28 opacity-0 pointer-events-none' 
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        <div className="h-0.5 w-full bg-amber-400 absolute top-0 left-0 right-0" />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Instalar App TMD</h4>
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  PWA 2026
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                Acceso rápido a catálogos, telemetría y consultas offline en canteras.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs uppercase"
            aria-label="Cerrar notificación de instalación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar App</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInstructionsModal(true)}
            className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-700 transition-colors cursor-pointer"
          >
            Guía
          </button>
        </div>
      </div>

      {/* Manual Install Guidance Modal for iOS & Browsers */}
      {showInstructionsModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 text-zinc-100 rounded-[5px] border border-zinc-800 shadow-2xl font-mono overflow-hidden">
            <div className="h-1 w-full bg-amber-400" />
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Instalación Nativa TMD</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstructionsModal(false)}
                  className="p-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs"
                  aria-label="Cerrar guía"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-amber-400">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>En iPhone / iPad (Safari):</span>
                  </div>
                  <p className="font-sans text-[11px] text-zinc-400">1. Toca el botón <strong>Compartir</strong> <Share2 className="inline w-3 h-3 mx-0.5 text-amber-400" /> en la barra inferior.</p>
                  <p className="font-sans text-[11px] text-zinc-400">2. Selecciona <strong>"Agregar al Inicio"</strong> <PlusSquare className="inline w-3 h-3 mx-0.5 text-amber-400" />.</p>
                </div>

                <div className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-amber-400">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>En Android (Chrome):</span>
                  </div>
                  <p className="font-sans text-[11px] text-zinc-400">1. Toca el menú de tres puntos (⋮) arriba a la derecha.</p>
                  <p className="font-sans text-[11px] text-zinc-400">2. Selecciona <strong>"Instalar Aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</p>
                </div>

                <div className="p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-amber-400">
                    <Laptop className="w-3.5 h-3.5" />
                    <span>En Computadoras (Chrome / Edge):</span>
                  </div>
                  <p className="font-sans text-[11px] text-zinc-400">1. Toca el icono de instalación <Download className="inline w-3 h-3 mx-0.5 text-amber-400" /> en la barra de direcciones.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
