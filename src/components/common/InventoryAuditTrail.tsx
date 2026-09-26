import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  Navigation, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  Activity,
  History,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { InventoryScanLog } from '../../types';
import { subscribeToScanHistoryForItem } from '../../services/inventoryLogService';

interface InventoryAuditTrailProps {
  itemId: string;
  itemCode?: string;
  itemName?: string;
  itemType?: 'machinery' | 'part';
  className?: string;
  maxEvents?: number;
}

export const InventoryAuditTrail: React.FC<InventoryAuditTrailProps> = ({
  itemId,
  itemCode,
  itemName,
  itemType = 'machinery',
  className = '',
  maxEvents = 3
}) => {
  const [logs, setLogs] = useState<InventoryScanLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (!itemId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToScanHistoryForItem(
      itemId,
      (fetchedLogs) => {
        setLogs(fetchedLogs.slice(0, maxEvents));
        setLoading(false);
        setRefreshing(false);
      },
      maxEvents,
      itemCode
    );

    return () => unsubscribe();
  }, [itemId, itemCode, maxEvents]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const formatExactDate = (isoOrMs?: string | number) => {
    if (!isoOrMs) return 'Fecha no disponible';
    try {
      const date = new Date(isoOrMs);
      return date.toLocaleDateString('es-DO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(isoOrMs);
    }
  };

  const getRelativeTime = (isoOrMs?: string | number) => {
    if (!isoOrMs) return '';
    try {
      const date = new Date(isoOrMs).getTime();
      const now = Date.now();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Hace unos momentos';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours === 1) return 'Hace 1 hora';
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 30) return `Hace ${diffDays} días`;
      return `Hace ${Math.floor(diffDays / 30)} meses`;
    } catch {
      return '';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-4 rounded-[4px] bg-zinc-950/80 border border-zinc-800 animate-pulse font-mono text-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-zinc-800" />
          <div className="h-3 w-40 bg-zinc-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-16 bg-zinc-900 rounded" />
          <div className="h-16 bg-zinc-900 rounded" />
          <div className="h-16 bg-zinc-900 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[4px] bg-zinc-950 border border-zinc-800 text-xs font-mono shadow-md overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[3px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs uppercase tracking-wide">
                Audit Trail de Inventario
              </span>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-zinc-300 text-[9px] font-black uppercase border border-zinc-700">
                Últimos {logs.length} Escaneos
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Registro auditado en tiempo real desde colección <span className="text-amber-400">inventory_logs</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          className="p-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
          title="Actualizar registro de auditoría"
          aria-label="Actualizar registro de auditoría"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Audit Events List (Last 3 events) */}
      <div className="p-3.5 space-y-3">
        {logs.length === 0 ? (
          <div className="p-4 text-center rounded-[3px] bg-zinc-900/40 border border-zinc-800 text-zinc-400 text-xs">
            <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-zinc-500" />
            <p>No se encontraron registros previos de escaneo para este ítem.</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isMostRecent = index === 0;
            const isWithin24Hours = (Date.now() - (log.timestamp || new Date(log.scannedAt).getTime())) <= 24 * 60 * 60 * 1000;
            const staff = log.staffName || log.staffEmail || 'Personal de Inventario';
            const zone = log.location?.zoneName || log.location?.facility || 'Patio Central Km 22';
            const relative = getRelativeTime(log.scannedAt || log.timestamp);
            const exact = formatExactDate(log.scannedAt || log.timestamp);

            return (
              <div
                key={log.id || `audit-log-${index}`}
                className={`p-3 rounded-[3px] border transition-all ${
                  isMostRecent
                    ? 'bg-zinc-900/90 border-amber-500/50 shadow-sm'
                    : 'bg-zinc-950/80 border-zinc-800/80'
                }`}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-[2px] text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isMostRecent
                          ? 'bg-amber-400 text-black shadow-xs'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-[11px] uppercase">
                          {isMostRecent ? 'Último Escaneo Físico' : `Escaneo de Control #${logs.length - index}`}
                        </span>

                        {isMostRecent && isWithin24Hours && (
                          <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Recently Verified</span>
                          </span>
                        )}

                        <span className="text-[10px] text-zinc-400">
                          • {relative}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-zinc-300 font-semibold">{exact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      log.status === 'verified'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                        : log.status === 'inspected'
                        ? 'bg-blue-950/80 text-blue-400 border border-blue-500/40'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {log.status === 'verified' ? '✓ Verificado' : log.status === 'inspected' ? '⚙ Inspeccionado' : 'Auditado'}
                  </span>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-800/80">
                  {/* Staff Info */}
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-zinc-500 font-bold uppercase text-[9px]">Auditor:</span>
                    <span className="truncate font-semibold">{staff}</span>
                    {log.staffRole && (
                      <span className="text-[8px] uppercase px-1 py-0.2 bg-zinc-800 text-amber-400 rounded border border-zinc-700">
                        {log.staffRole}
                      </span>
                    )}
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-zinc-500 font-bold uppercase text-[9px]">Ubicación:</span>
                    <span className="truncate text-zinc-200">{zone}</span>
                  </div>

                  {/* GPS & Method */}
                  {log.location?.latitude && log.location?.longitude && (
                    <div className="flex items-center gap-1.5 text-zinc-400 sm:col-span-2">
                      <Navigation className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="text-zinc-500 font-bold uppercase text-[9px]">GPS Geo-Stamp:</span>
                      <span className="text-zinc-300">
                        {log.location.latitude.toFixed(4)}° N, {Math.abs(log.location.longitude).toFixed(4)}° W
                        {log.location.accuracy ? ` (±${log.location.accuracy}m)` : ''}
                      </span>
                    </div>
                  )}

                  {/* Notes / Inspector Remarks */}
                  {log.notes && (
                    <div className="sm:col-span-2 bg-zinc-950/60 p-2 rounded-[2px] border border-zinc-800/80 text-zinc-300 mt-1">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 uppercase mb-0.5">
                        <FileText className="w-2.5 h-2.5" />
                        <span>Nota de Auditoría Físca:</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 italic">
                        "{log.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3.5 py-2 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1">
          <QrCode className="w-3 h-3 text-amber-400" />
          <span>Sincronización Blockchain & QR TMD</span>
        </span>
        <span className="text-zinc-400">Patio Central Km 22 Autopista Duarte</span>
      </div>
    </div>
  );
};
