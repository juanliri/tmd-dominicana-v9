import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Tag, 
  FileText, 
  X, 
  ArrowRight, 
  Wrench, 
  Radio, 
  CheckCheck, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';

interface NotificationToastBannerProps {
  onNavigate: (route: string) => void;
}

// Individual Toast Item with 6-second auto-dismiss progress bar
const StackedToastItem: React.FC<{
  toast: AppNotification;
  index: number;
  total: number;
  onNavigate: (route: string) => void;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}> = ({ toast, index, total, onNavigate, onDismiss, onMarkRead }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const duration = 6000; // 6s duration
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, onDismiss, isPaused]);

  const isMaintenance = toast.type === 'maintenance_due';
  const isOffer = toast.type === 'special_offer';
  const isQuote = toast.type === 'quote_status';
  const isTelematics = toast.type === 'system' && (toast.title.includes('SPN') || toast.title.includes('Telemática') || toast.title.includes('IoT'));

  const handleClick = () => {
    onMarkRead(toast.id);
    onDismiss(toast.id);
    if (toast.actionUrl) {
      onNavigate(toast.actionUrl);
    } else if (isMaintenance || isQuote) {
      onNavigate('#/portal');
    } else if (isOffer) {
      onNavigate('#/machinery');
    } else {
      onNavigate('#/home');
    }
  };

  // Color profiles per category
  let borderClass = 'border-amber-400/50 shadow-amber-400/5';
  let badgeClass = 'bg-amber-400/20 text-amber-400 border-amber-400/30';
  let iconBgClass = 'bg-amber-400 text-black';
  let categoryLabel = 'Aviso TMD';
  let IconComponent = Bell;
  let progressBarColor = 'bg-amber-400';

  if (isMaintenance) {
    borderClass = 'border-rose-500/80 shadow-rose-500/10';
    badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    iconBgClass = 'bg-rose-600 text-white';
    categoryLabel = 'Alerta Taller (<100h)';
    IconComponent = Wrench;
    progressBarColor = 'bg-rose-500';
  } else if (isTelematics) {
    borderClass = 'border-cyan-500/80 shadow-cyan-500/10';
    badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    iconBgClass = 'bg-cyan-500 text-black';
    categoryLabel = 'Telemetría J1939';
    IconComponent = Radio;
    progressBarColor = 'bg-cyan-400';
  } else if (isOffer) {
    borderClass = 'border-amber-400/80 shadow-amber-400/10';
    badgeClass = 'bg-amber-400/20 text-amber-400 border-amber-400/30';
    iconBgClass = 'bg-amber-400 text-black';
    categoryLabel = 'Oferta Especial';
    IconComponent = Tag;
    progressBarColor = 'bg-amber-400';
  } else if (isQuote) {
    borderClass = 'border-emerald-500/80 shadow-emerald-500/10';
    badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    iconBgClass = 'bg-emerald-500 text-black';
    categoryLabel = 'DGII / Cotización';
    IconComponent = FileText;
    progressBarColor = 'bg-emerald-400';
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative overflow-hidden bg-zinc-900/95 backdrop-blur-md text-white rounded-[3px] shadow-2xl p-3.5 transition-all duration-300 border font-mono ${borderClass} animate-in slide-in-from-right-4 fade-in`}
      style={{
        zIndex: 100 - index,
      }}
    >
      {/* Auto-Dismiss Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className={`h-full transition-all duration-75 ${progressBarColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3 mt-1">
        <div className={`p-2 rounded-[2px] shrink-0 shadow-sm ${iconBgClass}`}>
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] border ${badgeClass}`}>
              {categoryLabel}
            </span>
            <span className="text-[10px] text-zinc-500">
              {index === 0 ? 'En vivo' : `#${index + 1}`}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug uppercase tracking-tight">
            {toast.title}
          </h4>

          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {toast.body}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <button
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer uppercase tracking-wider"
            >
              <span>{isMaintenance ? 'Gestionar Orden' : isOffer ? 'Ver Promoción' : isQuote ? 'Revisar Proforma' : 'Ver Detalles'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer uppercase transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-[2px] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({ onNavigate }) => {
  const { activeToasts, dismissToastById, dismissAllToasts, markAsRead } = useNotifications();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <aside 
      aria-label="Notificaciones emergentes"
      className="fixed bottom-5 right-5 z-[9999] max-w-sm w-[92vw] sm:w-[380px] flex flex-col gap-2.5 font-mono pointer-events-auto"
    >
      {/* Header bar when multiple toasts are queued */}
      {activeToasts.length > 1 && (
        <div className="flex items-center justify-between bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-[2px] border border-zinc-800 text-[10px] text-zinc-400 shadow-lg">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider text-zinc-300">
              Alertas Activas ({activeToasts.length})
            </span>
          </div>

          <button
            onClick={dismissAllToasts}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-amber-400 uppercase tracking-wider transition-colors cursor-pointer font-bold"
          >
            <CheckCheck className="w-3 h-3" />
            <span>Descartar Todas</span>
          </button>
        </div>
      )}

      {/* Stacked Toasts List */}
      <div className="flex flex-col gap-2">
        {activeToasts.map((toast, idx) => (
          <StackedToastItem
            key={toast.id}
            toast={toast}
            index={idx}
            total={activeToasts.length}
            onNavigate={onNavigate}
            onDismiss={dismissToastById}
            onMarkRead={markAsRead}
          />
        ))}
      </div>
    </aside>
  );
};
