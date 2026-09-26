import React from 'react';
import { Bell, Tag, FileText, X, ArrowRight, Sparkles, Wrench } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationToastBannerProps {
  onNavigate: (route: string) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  if (!activeToast) return null;

  const isOffer = activeToast.type === 'special_offer';
  const isMaintenance = activeToast.type === 'maintenance_due';

  const handleClick = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.actionUrl) {
      onNavigate(activeToast.actionUrl);
    } else if (activeToast.type === 'quote_status' || activeToast.type === 'maintenance_due') {
      onNavigate('#/portal');
    } else {
      onNavigate('#/machinery');
    }
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-sm w-[92vw] sm:w-full bg-zinc-900 text-white rounded-[5px] shadow-2xl p-3.5 animate-in slide-in-from-bottom-4 duration-300 font-mono ${
      isMaintenance 
        ? 'border border-rose-500/80 shadow-rose-500/10' 
        : 'border border-amber-400/60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-[3px] shrink-0 ${
          isMaintenance 
            ? 'bg-rose-600 text-white' 
            : isOffer 
              ? 'bg-amber-400 text-black' 
              : 'bg-cyan-500 text-black'
        }`}>
          {isMaintenance ? <Wrench className="w-4 h-4" /> : isOffer ? <Tag className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[2px] border ${
              isMaintenance
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-black'
                : 'bg-amber-400/20 text-amber-400 border-amber-400/30'
            }`}>
              {isMaintenance ? 'Mantenimiento (<100h)' : isOffer ? 'Oferta Push' : 'Actualización Presupuesto'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Ahora</span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug uppercase">
            {activeToast.title}
          </h4>

          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
            {activeToast.body}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
            <button
              onClick={handleClick}
              className={`inline-flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer uppercase ${
                isMaintenance 
                  ? 'text-rose-400 hover:text-rose-300' 
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span>{isMaintenance ? 'Gestionar Mantenimiento' : isOffer ? 'Ver Oferta' : 'Ver en Mi Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={dismissToast}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer uppercase font-mono"
            >
              Descartar
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-[2px] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Cerrar alerta"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
