import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Tag, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  BellRing, 
  ShieldCheck, 
  Copy, 
  Check, 
  Info,
  Clock,
  Send,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { 
    notifications, 
    unreadCount, 
    pushPermission, 
    requestPermission, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    sendTestPushAlert
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'offers' | 'quotes'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const maintenanceCount = notifications.filter(n => n.type === 'maintenance_due').length;

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'maintenance') return n.type === 'maintenance_due';
    if (activeTab === 'offers') return n.type === 'special_offer';
    if (activeTab === 'quotes') return n.type === 'quote_status' || n.type === 'service_update';
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleAction = (notif: AppNotification) => {
    markAsRead(notif.id);
    onClose();
    if (notif.actionUrl) {
      onNavigate(notif.actionUrl);
    } else if (notif.type === 'maintenance_due') {
      onNavigate('#/portal');
    } else if (notif.type === 'quote_status') {
      onNavigate('#/portal');
    } else {
      onNavigate('#/machinery');
    }
  };

  const handleEnablePush = async () => {
    setIsRequestingPermission(true);
    await requestPermission();
    setIsRequestingPermission(false);
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Hace un momento';
      if (mins < 60) return `Hace ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Hace ${hours} h`;
      const days = Math.floor(hours / 24);
      return `Hace ${days} d`;
    } catch {
      return 'Reciente';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-end sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div 
        className="w-full sm:max-w-md h-full sm:h-[92vh] bg-zinc-900 sm:rounded-[5px] shadow-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-[3px] bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <span>Centro de Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-black bg-amber-400 text-black uppercase">
                    {unreadCount} nuevas
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Alertas en tiempo real de presupuestos y ofertas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar notificaciones"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Push Notification Permission Banner if not granted */}
        {pushPermission !== 'granted' && (
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-start gap-2.5 shrink-0">
            <div className="p-1.5 rounded-[2px] bg-amber-400 text-black mt-0.5 shrink-0">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white uppercase">
                Activar Notificaciones Push
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                Recibe alertas instantáneas cuando cambie el estado de tu cotización o lancemos ofertas de leasing.
              </p>
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isRequestingPermission}
                className="mt-2 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-bold rounded-[2px] transition-colors cursor-pointer uppercase shadow-xs"
              >
                {isRequestingPermission ? 'Activando...' : 'Permitir Notificaciones'}
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills & Quick Actions */}
        <div className="p-2.5 border-b border-zinc-800 flex items-center justify-between gap-1.5 bg-zinc-950 shrink-0 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer uppercase ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 uppercase ${
                activeTab === 'maintenance'
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : maintenanceCount > 0
                    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Servicio {maintenanceCount > 0 && `(${maintenanceCount})`}</span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer uppercase ${
                activeTab === 'offers'
                  ? 'bg-amber-400 text-black shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Ofertas
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-2.5 py-1 rounded-[2px] text-[11px] font-bold transition-all cursor-pointer uppercase ${
                activeTab === 'quotes'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Cotizaciones
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer uppercase shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Marcar leídas</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <div className="w-10 h-10 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2.5">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white uppercase">
                No hay notificaciones en esta sección
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Te notificaremos en cuanto haya cambios en tus cotizaciones, horas de servicio de maquinaria u ofertas oficiales de TMD Dominicana.
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isOffer = notif.type === 'special_offer';
              const isQuote = notif.type === 'quote_status';
              const isMaintenance = notif.type === 'maintenance_due';

              return (
                <div
                  key={notif.id}
                  className={`relative p-3 rounded-[3px] border transition-all ${
                    !notif.isRead
                      ? isMaintenance
                        ? 'bg-zinc-950 border-rose-500/40 shadow-xs'
                        : 'bg-zinc-950 border-amber-400/40 shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Indicator Dot */}
                  {!notif.isRead && (
                    <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${
                      isMaintenance ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                    }`} />
                  )}

                  <div className="flex items-start gap-2.5">
                    {/* Icon */}
                    <div className={`p-1.5 rounded-[2px] shrink-0 border ${
                      isMaintenance
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : isOffer 
                          ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                          : isQuote
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {isMaintenance ? (
                        <Wrench className="w-4 h-4" />
                      ) : isOffer ? (
                        <Tag className="w-4 h-4" />
                      ) : isQuote ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-[2px] border ${
                          isMaintenance
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-black'
                            : isOffer
                              ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                              : isQuote
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}>
                          {isMaintenance ? 'Servicio < 100h' : isOffer ? 'Oferta Especial' : isQuote ? 'Presupuesto' : 'Aviso TMD'}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white leading-snug uppercase">
                        {notif.title}
                      </h3>

                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {notif.body}
                      </p>

                      {/* Equipment Details Badge if maintenance */}
                      {isMaintenance && notif.equipmentUnitId && (
                        <div className="mt-2 p-2 rounded-[2px] bg-zinc-900 border border-rose-500/30 text-xs font-mono">
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-300">
                            <span>Unidad: <strong className="text-rose-400">{notif.equipmentUnitId}</strong></span>
                            <span>Horómetro: <strong>{notif.currentHorometer?.toLocaleString()} hrs</strong></span>
                          </div>
                          {notif.hoursRemaining !== undefined && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-bold uppercase">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>
                                {notif.hoursRemaining > 0 
                                  ? `Quedan ${notif.hoursRemaining}h para servicio ${notif.nextServiceHours?.toLocaleString()}h`
                                  : `Servicio vencido por ${Math.abs(notif.hoursRemaining)} horas`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Promo Code Box if offer has code */}
                      {notif.offerCode && (
                        <div className="mt-2 flex items-center gap-2 p-1.5 rounded-[2px] bg-zinc-900 border border-amber-400/30 text-xs font-mono">
                          <span className="text-[9px] text-amber-400 font-bold uppercase">Cupón:</span>
                          <span className="font-bold text-white tracking-wider">
                            {notif.offerCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(notif.offerCode!)}
                            className="ml-auto p-0.5 hover:bg-zinc-800 rounded-[2px] text-amber-400 transition-colors cursor-pointer"
                            title="Copiar cupón"
                          >
                            {copiedCode === notif.offerCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleAction(notif)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer uppercase"
                        >
                          <span>{isOffer ? 'Ver Promoción' : 'Ver Detalles'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-2 font-mono">
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer uppercase"
                              title="Marcar como leída"
                            >
                              Leída
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar notificación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Push test & sync status */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] uppercase font-bold">Firebase Cloud Messaging</span>
          </div>

          <button
            type="button"
            onClick={sendTestPushAlert}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-[2px] text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 uppercase border border-zinc-700"
          >
            <BellRing className="w-3 h-3 text-amber-400" />
            <span>Probar Alerta Push</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
