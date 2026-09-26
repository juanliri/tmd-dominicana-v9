import React, { useState, useEffect } from 'react';
import { 
  History, 
  MapPin, 
  HardHat, 
  Cog, 
  Clock, 
  User, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Navigation,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { InventoryScanLog } from '../../types';
import { 
  INVENTORY_LOGS_COLLECTION, 
  getCachedScanLogs, 
  subscribeToInventoryScanLogs 
} from '../../services/inventoryLogService';

interface RecentScansProps {
  onNavigateToItem?: (type: 'machinery' | 'part', id: string) => void;
  onOpenScanner?: () => void;
  onViewAllLogs?: () => void;
  className?: string;
  limitCount?: number;
}

export const RecentScans: React.FC<RecentScansProps> = ({
  onNavigateToItem,
  onOpenScanner,
  onViewAllLogs,
  className = '',
  limitCount = 5
}) => {
  const [logs, setLogs] = useState<InventoryScanLog[]>(() => {
    // Start with local cache for instant render
    const cached = getCachedScanLogs();
    // sort by scannedAt or timestamp descending
    return cached
      .sort((a, b) => {
        const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : a.timestamp || 0;
        const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : b.timestamp || 0;
        return timeB - timeA;
      })
      .slice(0, limitCount);
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchRecentLogs = async () => {
    setLoading(true);
    try {
      const logsRef = collection(db, INVENTORY_LOGS_COLLECTION);
      // Explicitly sort by 'scannedAt' as required by user prompt
      const q = query(logsRef, orderBy('scannedAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const fetchedLogs: InventoryScanLog[] = [];
        snapshot.forEach((docSnap) => {
          fetchedLogs.push({ id: docSnap.id, ...docSnap.data() } as InventoryScanLog);
        });
        setLogs(fetchedLogs);
      } else {
        // Fallback to cache if firestore collection is empty or indexing in progress
        const cached = getCachedScanLogs()
          .sort((a, b) => {
            const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : a.timestamp || 0;
            const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : b.timestamp || 0;
            return timeB - timeA;
          })
          .slice(0, limitCount);
        setLogs(cached);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('[RecentScans] Error querying inventory_logs sorted by scannedAt:', err);
      // Fallback query by timestamp or local cache
      const cached = getCachedScanLogs()
        .sort((a, b) => {
          const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : a.timestamp || 0;
          const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : b.timestamp || 0;
          return timeB - timeA;
        })
        .slice(0, limitCount);
      setLogs(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLogs();

    // Setup real-time listener on the 'inventory_logs' collection sorted by 'scannedAt'
    try {
      const logsRef = collection(db, INVENTORY_LOGS_COLLECTION);
      const q = query(logsRef, orderBy('scannedAt', 'desc'), limit(limitCount));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const liveLogs: InventoryScanLog[] = [];
            snapshot.forEach((docSnap) => {
              liveLogs.push({ id: docSnap.id, ...docSnap.data() } as InventoryScanLog);
            });
            setLogs(liveLogs);
            setLastRefreshed(new Date());
          }
          setLoading(false);
        },
        (error) => {
          console.warn('[RecentScans] onSnapshot on scannedAt error, subscribing via inventoryLogService:', error);
          // Subscribe via inventoryLogService fallback
          const serviceUnsub = subscribeToInventoryScanLogs((updatedLogs) => {
            const sorted = [...updatedLogs]
              .sort((a, b) => {
                const timeA = a.scannedAt ? new Date(a.scannedAt).getTime() : a.timestamp || 0;
                const timeB = b.scannedAt ? new Date(b.scannedAt).getTime() : b.timestamp || 0;
                return timeB - timeA;
              })
              .slice(0, limitCount);
            setLogs(sorted);
            setLoading(false);
          }, limitCount);
          return () => serviceUnsub();
        }
      );

      return () => unsubscribe();
    } catch {
      setLoading(false);
    }
  }, [limitCount]);

  // Format relative or friendly timestamp
  const formatTime = (isoString?: string, unixMs?: number) => {
    if (!isoString && !unixMs) return 'Reciente';
    try {
      const date = isoString ? new Date(isoString) : new Date(unixMs!);
      return date.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return 'Reciente';
    }
  };

  const formatDate = (isoString?: string, unixMs?: number) => {
    if (!isoString && !unixMs) return '';
    try {
      const date = isoString ? new Date(isoString) : new Date(unixMs!);
      return date.toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 shadow-md font-mono ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[3px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
                Recent Scans (Últimos {limitCount})
              </h4>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Últimas 5 lecturas registradas en la colección <span className="text-amber-400 font-bold">inventory_logs</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRecentLogs}
            disabled={loading}
            className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Refrescar últimos escaneos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {onViewAllLogs && (
            <button
              type="button"
              onClick={onViewAllLogs}
              className="text-[10px] text-zinc-400 hover:text-amber-400 font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* List Content */}
      <div className="mt-3">
        {logs.length === 0 ? (
          <div className="py-6 text-center rounded-[3px] bg-zinc-950 border border-dashed border-zinc-800 text-xs">
            <QrCode className="w-6 h-6 mx-auto mb-1 text-zinc-600" />
            <p className="font-bold text-zinc-400 uppercase">Sin escaneos recientes</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              Utiliza el escáner QR móvil para registrar equipos o repuestos en el patio.
            </p>
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="mt-3 px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <QrCode className="w-3 h-3" />
                <span>Abrir Escáner QR</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const isMach = log.itemType === 'machinery';
              return (
                <div
                  key={log.id}
                  onClick={() => onNavigateToItem && onNavigateToItem(log.itemType, log.itemId)}
                  className={`p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    onNavigateToItem ? 'cursor-pointer hover:bg-zinc-900/60' : ''
                  }`}
                >
                  {/* Left: Item identity and icon */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-[2px] flex items-center justify-center shrink-0 font-bold ${
                        isMach
                          ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isMach ? <HardHat className="w-3.5 h-3.5" /> : <Cog className="w-3.5 h-3.5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white truncate uppercase">
                          {log.itemName || 'Artículo Escaneado'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-[2px] text-[8px] font-black uppercase tracking-wider ${
                            isMach
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isMach ? 'Maquinaria' : 'Repuesto'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 truncate">
                        <span className="font-mono text-zinc-300 font-bold">{log.itemCode || log.itemId}</span>
                        {log.itemBrand && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-500">{log.itemBrand}</span>
                          </>
                        )}
                        {log.location?.zoneName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-zinc-400 truncate">
                              <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span className="truncate">{log.location.zoneName}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp and staff user */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px] shrink-0 pt-1 sm:pt-0 border-t border-zinc-900 sm:border-0">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <User className="w-2.5 h-2.5 text-zinc-500" />
                      <span className="truncate max-w-[90px] sm:max-w-[110px]">
                        {log.staffName?.split(' ')[0] || log.staffEmail?.split('@')[0] || 'Técnico'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-white font-mono font-bold">
                        <Clock className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{formatTime(log.scannedAt, log.timestamp)}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500">
                        {formatDate(log.scannedAt, log.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Ordenado por timestamp: <strong className="text-zinc-400">scannedAt desc</strong></span>
        <span>Actualizado: {lastRefreshed.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
