import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  User, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Package, 
  HardHat, 
  Navigation, 
  Radio, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { InventoryScanLog } from '../../types';
import { 
  getRecentInventoryScanLogs, 
  subscribeToInventoryScanLogs, 
  getCachedScanLogs,
  KNOWN_YARD_ZONES 
} from '../../services/inventoryLogService';
import { ScanFrequencyMiniChart } from './ScanFrequencyMiniChart';
import { RecentScans } from './RecentScans';

interface InventoryScanLogsPanelProps {
  onNavigateToItem?: (type: 'machinery' | 'part', id: string) => void;
  onOpenScanner?: () => void;
}

export const InventoryScanLogsPanel: React.FC<InventoryScanLogsPanelProps> = ({
  onNavigateToItem,
  onOpenScanner
}) => {
  const [logs, setLogs] = useState<InventoryScanLog[]>(() => getCachedScanLogs());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'machinery' | 'part'>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getRecentInventoryScanLogs(100);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Realtime subscription to inventory_logs in Firestore
    const unsubscribe = subscribeToInventoryScanLogs((updatedLogs) => {
      setLogs(updatedLogs);
    }, 100);

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.itemName?.toLowerCase().includes(q) ||
      log.itemCode?.toLowerCase().includes(q) ||
      log.itemBrand?.toLowerCase().includes(q) ||
      log.staffName?.toLowerCase().includes(q) ||
      log.staffEmail?.toLowerCase().includes(q) ||
      log.location?.zoneName?.toLowerCase().includes(q) ||
      log.rawCode?.toLowerCase().includes(q);

    const matchesType = itemTypeFilter === 'all' || log.itemType === itemTypeFilter;
    const matchesZone = zoneFilter === 'all' || log.location?.zoneName === zoneFilter;

    return matchesSearch && matchesType && matchesZone;
  });

  const exportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = [
      'ID',
      'Scanned At (ISO)',
      'Staff Member',
      'Staff Email',
      'Role',
      'Item Type',
      'Item ID',
      'Item Code',
      'Brand',
      'Item Name',
      'Zone',
      'Facility',
      'Latitude',
      'Longitude',
      'Accuracy (m)',
      'Method',
      'Raw Code'
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.scannedAt}"`,
      `"${l.staffName || ''}"`,
      `"${l.staffEmail || ''}"`,
      `"${l.staffRole || ''}"`,
      `"${l.itemType}"`,
      `"${l.itemId}"`,
      `"${l.itemCode}"`,
      `"${l.itemBrand}"`,
      `"${(l.itemName || '').replace(/"/g, '""')}"`,
      `"${l.location?.zoneName || ''}"`,
      `"${l.location?.facility || ''}"`,
      l.location?.latitude ?? '',
      l.location?.longitude ?? '',
      l.location?.accuracy ?? '',
      `"${l.scanMethod}"`,
      `"${(l.rawCode || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tmd_inventory_scan_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                Bitácora de Escaneos de Inventario
              </h3>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                Firestore Live
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Registro inmutable de lecturas QR realizadas por personal en Patio Km 22 y almacenes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Nuevo Escaneo</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
            title="Refrescar datos de Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="Descargar reporte en formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Lecturas</span>
          <span className="text-xl font-black text-white">{logs.length}</span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">En bitácora central</span>
        </div>
        <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Maquinarias</span>
          <span className="text-xl font-black text-amber-400">
            {logs.filter(l => l.itemType === 'machinery').length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Flota pesada</span>
        </div>
        <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Repuestos OEM</span>
          <span className="text-xl font-black text-emerald-400">
            {logs.filter(l => l.itemType === 'part').length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Consumibles & piezas</span>
        </div>
        <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Geolocalizadas GPS</span>
          <span className="text-xl font-black text-blue-400">
            {logs.filter(l => l.location?.source === 'gps').length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Con fijación de patio</span>
        </div>
      </div>

      {/* RECHARTS MINI-CHART & RECENT SCANS SUMMARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScanFrequencyMiniChart
          logs={logs}
          onOpenScanner={onOpenScanner}
        />
        <RecentScans
          limitCount={5}
          onOpenScanner={onOpenScanner}
          onNavigateToItem={onNavigateToItem}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por equipo, P/N, técnico, código QR o zona..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-[2px] pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-[2px] border border-zinc-800">
            <button
              type="button"
              onClick={() => setItemTypeFilter('all')}
              className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                itemTypeFilter === 'all' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setItemTypeFilter('machinery')}
              className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                itemTypeFilter === 'machinery' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Equipos
            </button>
            <button
              type="button"
              onClick={() => setItemTypeFilter('part')}
              className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                itemTypeFilter === 'part' ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Repuestos
            </button>
          </div>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2 py-1.5 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Todas las Zonas</option>
            {KNOWN_YARD_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-[4px] bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-xs">
            <Radio className="w-8 h-8 mx-auto text-zinc-600 mb-2 animate-pulse" />
            <p className="font-bold uppercase">No se encontraron registros de escaneo</p>
            <p className="text-[11px] mt-1 text-zinc-600">
              Los escaneos efectuados por personal logueado se sincronizan automáticamente con Firestore en la colección <span className="text-amber-400">inventory_logs</span>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Fecha & Hora</th>
                  <th className="py-2.5 px-3">Personal TMD</th>
                  <th className="py-2.5 px-3">Ítem Detectado</th>
                  <th className="py-2.5 px-3">Identificador / P/N</th>
                  <th className="py-2.5 px-3">Ubicación / Zona</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const isMach = log.itemType === 'machinery';
                  const dateStr = new Date(log.scannedAt || log.timestamp).toLocaleString('es-DO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-800/60 transition-colors group text-zinc-300"
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="font-bold text-[11px]">{dateStr}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 block truncate max-w-[140px]">
                          {log.id}
                        </span>
                      </td>

                      {/* Staff Member */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                            {log.staffName?.[0]?.toUpperCase() || 'S'}
                          </span>
                          <div>
                            <span className="font-bold text-white block text-[11px] leading-tight">
                              {log.staffName || 'Personal Autorizado'}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              {log.staffEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Item Detected */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded-[2px] text-[8px] font-black uppercase shrink-0 ${
                              isMach ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {isMach ? 'Maquinaria' : 'Repuesto'}
                          </span>
                          <span className="font-bold text-white truncate max-w-[200px] uppercase text-[11px]">
                            {log.itemName}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Marca: <span className="text-zinc-300 uppercase font-bold">{log.itemBrand}</span>
                        </span>
                      </td>

                      {/* Code / Part Number */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-bold text-[11px]">
                          {log.itemCode}
                        </span>
                        {log.rawCode && log.rawCode !== log.itemCode && (
                          <span className="text-[9px] text-zinc-500 block truncate max-w-[130px] mt-0.5">
                            Raw: {log.rawCode}
                          </span>
                        )}
                      </td>

                      {/* Location Metadata */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-white font-bold text-[11px] block truncate max-w-[190px]">
                              {log.location?.zoneName || 'Sede Km 22'}
                            </span>
                            <span className="text-[9px] text-zinc-400 block truncate max-w-[190px]">
                              {log.location?.facility || 'Sede Central Km 22 Autopista Duarte'}
                            </span>
                            {log.location?.latitude && log.location?.longitude && (
                              <span className="text-[9px] text-blue-400 font-mono block">
                                {log.location.latitude.toFixed(4)}°, {log.location.longitude.toFixed(4)}°
                                {log.location.accuracy ? ` (±${log.location.accuracy}m)` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Scan Method */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-800 text-[9px] font-bold text-zinc-300 uppercase">
                          {log.scanMethod === 'camera'
                            ? 'CÁMARA'
                            : log.scanMethod === 'upload'
                            ? 'FOTO'
                            : 'MANUAL'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {onNavigateToItem && (
                          <button
                            type="button"
                            onClick={() => onNavigateToItem(log.itemType, log.itemId)}
                            className="px-2 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-white font-bold text-[10px] uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
