import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  Trash2, 
  FileText, 
  Layers, 
  DollarSign, 
  Truck, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getStoredOutbox, 
  OutboxQuotationItem, 
  dispatchOutboxItem, 
  dispatchAllPendingOutbox, 
  addOutboxItem, 
  removeOutboxItem, 
  clearOutbox 
} from '../../services/offlineOutboxService';
import { useOfflineSync } from '../../context/OfflineSyncContext';

interface OfflineQuotationOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineQuotationOutboxModal: React.FC<OfflineQuotationOutboxModalProps> = ({
  isOpen,
  onClose
}) => {
  const { effectiveOnline } = useOfflineSync();
  const [items, setItems] = useState<OutboxQuotationItem[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems(getStoredOutbox());
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const pendingCount = items.filter((x) => x.status === 'pending').length;
  const syncedCount = items.filter((x) => x.status === 'synced').length;

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    setSyncFeedback('Iniciando Background Sync con servidores TMD Km 22...');
    try {
      const dispatched = await dispatchAllPendingOutbox();
      setItems(getStoredOutbox());
      setSyncFeedback(`✓ ${dispatched} cotizaciones despachadas con éxito.`);
      setTimeout(() => setSyncFeedback(null), 3500);
    } catch (e) {
      console.error(e);
      setSyncFeedback('Error al despachar cotizaciones.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSimulateNew = () => {
    const created = addOutboxItem({
      type: 'machine_quote',
      clientName: 'Ing. Danilo Bautista',
      clientPhone: '+1 (809) 333-7744',
      companyName: 'Constructora del Cibao',
      itemsSummary: '1x Retroexcavadora JCB 3CX Eco 4WD',
      totalUsd: 84500,
      totalDop: 5101575
    });
    setItems(getStoredOutbox());
    setSyncFeedback(`Cotización ${created.id} guardada en almacenamiento local.`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleExportTxt = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - BANDEJA DE SALIDA OFFLINE (BACKGROUND SYNC OUTBOX)\n`;
    report += `Exportado: ${new Date().toLocaleString('es-DO')} | Elementos: ${items.length}\n`;
    report += `========================================================================\n\n`;

    items.forEach((it) => {
      report += `[${it.id}] TIPO: ${it.type.toUpperCase()} | ESTATUS: ${it.status.toUpperCase()}\n`;
      report += `• Cliente: ${it.clientName} (${it.clientPhone})\n`;
      report += `• Empresa: ${it.companyName}\n`;
      report += `• Resumen: ${it.itemsSummary}\n`;
      report += `• Monto: US$ ${it.totalUsd.toLocaleString()} / RD$ ${it.totalDop.toLocaleString()}\n`;
      report += `• Fecha Registro: ${it.createdAt}\n`;
      if (it.syncedAt) report += `• Fecha Transmisión: ${it.syncedAt}\n`;
      report += `------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_Outbox_Offline_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <Send className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                  PWA Service Worker • Background Sync API
                </span>
                <span className={`px-1.5 py-0.2 rounded-[2px] text-[10px] font-mono font-bold border ${
                  effectiveOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                }`}>
                  {effectiveOnline ? 'EN LÍNEA' : 'MODO MINA SIN SEÑAL'}
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Bandeja de Salida Offline (Outbox)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTxt}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPORTAR TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-zinc-900/90 rounded-[3px] border border-zinc-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            {effectiveOnline ? (
              <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold text-white uppercase block font-display">
                {pendingCount} Cotizaciones pendientes en cola local
              </span>
              <p className="text-[11px] text-zinc-400 font-sans">
                {effectiveOnline
                  ? 'Conexión activa. La cola se transmitirá automáticamente a TMD en segundo plano.'
                  : 'Operando sin internet. Las solicitudes permanecen encriptadas en la memoria local.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateNew}
              className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 border border-zinc-700"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Simular Cotización</span>
            </button>

            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll || pendingCount === 0}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Despachando...' : `Despachar Todo (${pendingCount})`}</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {syncFeedback && (
          <div className="p-2.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {items.length === 0 ? (
            <div className="text-center py-14 text-zinc-500 text-xs">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <p className="font-bold text-zinc-400 uppercase">La bandeja de salida está vacía</p>
              <p className="text-[11px] mt-1">Todas las cotizaciones han sido sincronizadas con el servidor.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-[3px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  item.status === 'pending'
                    ? 'bg-zinc-900 border-amber-400/40 shadow-xs'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-xs uppercase">
                      {item.id}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold uppercase border ${
                      item.status === 'pending'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        : item.status === 'syncing'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.status === 'pending' ? 'EN COLA (OFFLINE)' : item.status === 'syncing' ? 'TRANSMITIENDO' : 'DESPACHADO'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-sans">
                      {new Date(item.createdAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-zinc-200 font-bold">
                    {item.clientName} &bull; <span className="text-zinc-400 font-normal">{item.companyName} ({item.clientPhone})</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    {item.itemsSummary}
                  </p>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                  <div className="text-left sm:text-right font-mono">
                    <span className="text-sm font-black text-amber-400 block">
                      US$ {item.totalUsd.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      RD$ {item.totalDop.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.status === 'pending' && (
                      <button
                        onClick={async () => {
                          await dispatchOutboxItem(item.id);
                          setItems(getStoredOutbox());
                        }}
                        className="px-2 py-1 rounded-[2px] bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        title="Despachar ahora"
                      >
                        Enviar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const updated = removeOutboxItem(item.id);
                        setItems(updated);
                      }}
                      className="p-1 rounded-[2px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Eliminar de la cola"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            TMD Background Sync Outbox Engine v2.4 • Conforme a PWA W3C Spec
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
