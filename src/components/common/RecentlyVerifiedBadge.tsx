import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, User, MapPin, Sparkles } from 'lucide-react';
import { InventoryScanLog } from '../../types';
import { subscribeToLatestScanForItem, isRecentlyVerified } from '../../services/inventoryLogService';

interface RecentlyVerifiedBadgeProps {
  itemId: string;
  itemCode?: string;
  itemType?: 'machinery' | 'part';
  variant?: 'card-badge' | 'pill' | 'detail-banner';
  className?: string;
  showOnlyIfVerified?: boolean;
}

export const RecentlyVerifiedBadge: React.FC<RecentlyVerifiedBadgeProps> = ({
  itemId,
  itemCode,
  itemType = 'machinery',
  variant = 'card-badge',
  className = '',
  showOnlyIfVerified = true
}) => {
  const [latestScan, setLatestScan] = useState<InventoryScanLog | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);

  // Real-time Firestore subscription to scan events for this specific item
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

  // Keep timestamp/relative-time dynamic and ensure 24-hour expiration updates in real time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const scanTime = latestScan?.scannedAt ? new Date(latestScan.scannedAt).getTime() : latestScan?.timestamp || 0;
  const verified = isRecentlyVerified(latestScan);

  // Compute friendly relative time (e.g. "Hace 2h", "Hace 35 min")
  const getRelativeTime = (timeMs: number) => {
    if (!timeMs) return '';
    const diffMs = now - timeMs;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours === 1) return 'Hace 1h';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return 'Hace +24h';
  };

  const formatExactTime = (isoOrMs?: string | number) => {
    if (!isoOrMs) return '';
    try {
      const date = new Date(isoOrMs);
      return date.toLocaleTimeString('es-DO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return null;
  }

  // If not scanned by inventory staff within 24 hours
  if (!verified) {
    if (showOnlyIfVerified) return null;

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-zinc-400 ${className}`}>
        <Clock className="w-3 h-3 text-zinc-500" />
        <span className="uppercase text-[9px]">Sin verificación 24h</span>
      </div>
    );
  }

  const staff = latestScan?.staffName || latestScan?.staffEmail?.split('@')[0] || 'Personal de Inventario';
  const zone = latestScan?.location?.zoneName || latestScan?.location?.facility || 'Patio Km 22';
  const relativeTime = getRelativeTime(scanTime);
  const exactTime = formatExactTime(latestScan?.scannedAt || scanTime);

  // 1. DETAIL BANNER (For Product Detail Modal / Technical Studio)
  if (variant === 'detail-banner') {
    return (
      <div 
        className={`rounded-[3px] bg-gradient-to-r from-emerald-950/90 via-zinc-950 to-zinc-950 border border-emerald-500/50 p-2.5 shadow-lg backdrop-blur-md font-mono ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Live radar beacon */}
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Recently Verified</span>
              </span>
              <span className="text-[11px] font-bold text-white">
                Verificado en Patio ({relativeTime})
              </span>
            </div>
          </div>

          {/* Verification metadata */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-300">
            <span className="flex items-center gap-1 text-emerald-400/90">
              <User className="w-3 h-3" />
              <span>{staff}</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="truncate max-w-[150px]">{zone}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. PILL / INLINE BADGE
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono shadow-sm backdrop-blur-md ${className}`}
        title={`Verificado por ${staff} (${relativeTime}, ${exactTime}) en ${zone}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="font-black uppercase tracking-wider text-emerald-300">Recently Verified</span>
        {relativeTime && (
          <span className="text-[9px] text-emerald-400/80 font-bold hidden sm:inline">({relativeTime})</span>
        )}
      </div>
    );
  }

  // 3. CARD BADGE (Standard for Machinery and Parts Product Detail Cards in the Catalog)
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-[9px] font-mono shadow-md backdrop-blur-md transition-all hover:border-emerald-400 group cursor-help ${className}`}
      title={`✓ RECENTLY VERIFIED: Escaneado hace ${relativeTime} por ${staff} en ${zone}`}
    >
      {/* Live Pulsing Beacon */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-xs"></span>
      </span>

      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
      <span className="font-black uppercase tracking-wider text-white">
        Recently Verified
      </span>
      {relativeTime && (
        <span className="text-[8px] text-emerald-300/90 font-bold bg-emerald-900/60 px-1 py-0.2 rounded-[2px] border border-emerald-500/30">
          {relativeTime}
        </span>
      )}
    </div>
  );
};
