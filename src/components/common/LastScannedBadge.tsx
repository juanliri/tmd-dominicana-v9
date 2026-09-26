import React, { useState, useEffect } from 'react';
import { 
  History, 
  QrCode, 
  CheckCircle2, 
  MapPin, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';
import { InventoryScanLog } from '../../types';
import { subscribeToLatestScanForItem, isRecentlyVerified } from '../../services/inventoryLogService';

interface LastScannedBadgeProps {
  itemId: string;
  itemCode?: string;
  itemType?: 'machinery' | 'part';
  className?: string;
  showDetailsAccordion?: boolean;
  showEmptyState?: boolean;
  compact?: boolean;
  onOpenScanner?: () => void;
}

export const LastScannedBadge: React.FC<LastScannedBadgeProps> = ({
  itemId,
  itemCode,
  itemType = 'machinery',
  className = '',
  showDetailsAccordion = true,
  showEmptyState = true,
  compact = false,
  onOpenScanner
}) => {
  const [latestScan, setLatestScan] = useState<InventoryScanLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (!itemId) {
      setLatestScan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToLatestScanForItem(
      itemId,
      (log) => {
        setLatestScan(log);
        setLoading(false);
      },
      itemCode
    );

    return () => unsubscribe();
  }, [itemId, itemCode]);

  // Compute friendly Dominican date/time string
  const formatScanTime = (isoString?: string, unixMs?: number) => {
    if (!isoString && !unixMs) return '';
    try {
      const date = isoString ? new Date(isoString) : new Date(unixMs!);
      const now = new Date();
      
      const isToday = date.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      const timeStr = date.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      if (isToday) {
        return `Hoy a las ${timeStr}`;
      } else if (isYesterday) {
        return `Ayer a las ${timeStr}`;
      } else {
        const dateStr = date.toLocaleDateString('es-DO', {
          day: '2-digit',
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
        return `${dateStr}, ${timeStr}`;
      }
    } catch {
      return isoString || '';
    }
  };

  const getRelativeTime = (isoString?: string, unixMs?: number) => {
    if (!isoString && !unixMs) return '';
    try {
      const date = isoString ? new Date(isoString) : new Date(unixMs!);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Hace 1 día';
      return `Hace ${diffDays} días`;
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 animate-pulse ${className}`}>
        <Clock className="w-3 h-3 text-zinc-500 animate-spin" />
        <span>Verificando inventario...</span>
      </div>
    );
  }

  // If no scan is found for this product
  if (!latestScan) {
    if (!showEmptyState) return null;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-zinc-900/90 border border-zinc-800/80 text-[10px] font-mono text-zinc-400 ${className}`}>
        <QrCode className="w-3 h-3 text-zinc-500" />
        <span className="uppercase text-zinc-400">Sin escaneo reciente en patio</span>
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer ml-1"
          >
            Registrar
          </button>
        )}
      </div>
    );
  }

  const timeFormatted = formatScanTime(latestScan.scannedAt, latestScan.timestamp);
  const relativeTime = getRelativeTime(latestScan.scannedAt, latestScan.timestamp);
  const zoneName = latestScan.location?.zoneName || latestScan.location?.facility || 'Patio Km 22';
  const staff = latestScan.staffName || latestScan.staffEmail?.split('@')[0] || 'Técnico TMD';
  const verified = isRecentlyVerified(latestScan);

  if (compact) {
    if (verified) {
      return (
        <div 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono shadow-sm backdrop-blur-md ${className}`}
          title={`Recently Verified por ${staff} (${timeFormatted}) en ${zoneName}`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="font-black uppercase tracking-wider text-emerald-300">Recently Verified</span>
          {relativeTime && (
            <span className="text-[9px] text-emerald-400/90 font-bold hidden sm:inline">({relativeTime})</span>
          )}
        </div>
      );
    }

    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono shadow-sm backdrop-blur-md ${className}`}
        title={`Último escaneo: ${timeFormatted} en ${zoneName} por ${staff}`}
      >
        <span className="w-2 h-2 rounded-[1px] bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-black uppercase tracking-wider text-emerald-400">Último Escaneo:</span>
        <span className="font-bold text-white">{timeFormatted}</span>
        {relativeTime && (
          <span className="text-[9px] text-emerald-400/80 hidden sm:inline">({relativeTime})</span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-[3px] bg-zinc-950/90 border ${verified ? 'border-emerald-400/60 ring-1 ring-emerald-500/30' : 'border-emerald-500/40'} text-xs font-mono shadow-md backdrop-blur-md overflow-hidden ${className}`}>
      {/* Primary Badge Header */}
      <div className={`flex items-center justify-between gap-3 px-3 py-1.5 ${verified ? 'bg-emerald-950/70 border-b border-emerald-500/40' : 'bg-emerald-950/40 border-b border-emerald-500/20'}`}>
        <div className="flex items-center gap-2 min-w-0">
          {verified ? (
            <div className="w-5 h-5 rounded-[2px] bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-[2px] bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          )}
          <div className="flex items-center gap-1.5 truncate">
            {verified && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              {verified ? 'Recently Verified:' : 'Último Escaneo:'}
            </span>
            <span className="text-[11px] font-black text-white truncate">
              {timeFormatted}
            </span>
            {relativeTime && (
              <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase shrink-0">
                {relativeTime}
              </span>
            )}
          </div>
        </div>

        {showDetailsAccordion && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-white p-0.5 rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Ver detalles de auditoría de patio"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Expanded Audit Metadata */}
      {isExpanded && (
        <div className="p-2.5 bg-zinc-900/90 space-y-1.5 text-[11px] border-t border-zinc-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-1 text-zinc-400">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Ubicación en Patio:</span>
            </span>
            <span className="font-bold text-white text-right truncate max-w-[200px]">
              {zoneName}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="flex items-center gap-1 text-zinc-400">
              <User className="w-3 h-3 text-zinc-400" />
              <span>Técnico Inspector:</span>
            </span>
            <span className="font-bold text-zinc-200">
              {staff}
            </span>
          </div>

          {latestScan.location?.latitude && latestScan.location?.longitude && (
            <div className="flex items-center justify-between text-zinc-400 text-[10px]">
              <span>Coordenadas GPS:</span>
              <span className="font-mono text-zinc-300">
                {latestScan.location.latitude.toFixed(4)}, {latestScan.location.longitude.toFixed(4)}
              </span>
            </div>
          )}

          {latestScan.notes && (
            <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400">
              <span className="text-zinc-500 block uppercase font-bold">Nota de inspección:</span>
              <p className="italic text-zinc-300">{latestScan.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
