import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  QrCode, 
  HardHat, 
  Cog, 
  RefreshCw, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { InventoryScanLog } from '../../types';
import { subscribeToInventoryScanLogs, getRecentInventoryScanLogs } from '../../services/inventoryLogService';

interface ScanFrequencyMiniChartProps {
  logs?: InventoryScanLog[];
  className?: string;
  onOpenScanner?: () => void;
  onViewAllLogs?: () => void;
}

interface DayFrequencyData {
  dayLabel: string;
  dateKey: string;
  machinery: number;
  parts: number;
  total: number;
}

export const ScanFrequencyMiniChart: React.FC<ScanFrequencyMiniChartProps> = ({
  logs: externalLogs,
  className = '',
  onOpenScanner,
  onViewAllLogs
}) => {
  const [internalLogs, setInternalLogs] = useState<InventoryScanLog[]>([]);
  const [loading, setLoading] = useState(false);

  // If logs are not passed as prop, subscribe to Firestore inventory_logs
  useEffect(() => {
    if (externalLogs) return;

    setLoading(true);
    getRecentInventoryScanLogs(150).then((initial) => {
      setInternalLogs(initial);
      setLoading(false);
    }).catch(() => setLoading(false));

    const unsubscribe = subscribeToInventoryScanLogs((updated) => {
      setInternalLogs(updated);
      setLoading(false);
    }, 150);

    return () => unsubscribe();
  }, [externalLogs]);

  const activeLogs = externalLogs || internalLogs;

  // Build last 7 days metrics
  const last7DaysData: DayFrequencyData[] = React.useMemo(() => {
    const days: DayFrequencyData[] = [];
    const now = new Date();

    // Generate 7 days in chronological order (from 6 days ago up to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      
      // Short day label in Spanish (e.g., "Lun 21", "Hoy")
      const isToday = i === 0;
      const isYesterday = i === 1;
      let dayName = d.toLocaleDateString('es-DO', { weekday: 'short' });
      // capitalize first letter
      dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);
      const dayNum = d.getDate();
      
      const dayLabel = isToday ? 'Hoy' : isYesterday ? 'Ayer' : `${dayName} ${dayNum}`;

      days.push({
        dayLabel,
        dateKey,
        machinery: 0,
        parts: 0,
        total: 0
      });
    }

    // Populate counts from activeLogs
    activeLogs.forEach((log) => {
      if (!log.scannedAt && !log.timestamp) return;
      
      let logDateKey = '';
      if (log.scannedAt) {
        logDateKey = log.scannedAt.slice(0, 10);
      } else if (log.timestamp) {
        logDateKey = new Date(log.timestamp).toISOString().slice(0, 10);
      }

      const matchDay = days.find((d) => d.dateKey === logDateKey);
      if (matchDay) {
        if (log.itemType === 'machinery') {
          matchDay.machinery += 1;
        } else {
          matchDay.parts += 1;
        }
        matchDay.total += 1;
      }
    });

    return days;
  }, [activeLogs]);

  // Aggregate summary
  const total7DaysMachinery = last7DaysData.reduce((acc, d) => acc + d.machinery, 0);
  const total7DaysParts = last7DaysData.reduce((acc, d) => acc + d.parts, 0);
  const total7Days = total7DaysMachinery + total7DaysParts;

  return (
    <div className={`p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 shadow-md font-mono ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
                Frecuencia de Escaneos QR (Últimos 7 Días)
              </h4>
              <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                inventory_logs
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Auditoría comparativa de lecturas de maquinaria pesada vs repuestos OEM
            </p>
          </div>
        </div>

        {/* Action tags */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {onViewAllLogs && (
            <button
              type="button"
              onClick={onViewAllLogs}
              className="text-[10px] text-zinc-400 hover:text-amber-400 transition-colors uppercase font-bold cursor-pointer"
            >
              Ver Bitácora Completa →
            </button>
          )}
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-2.5 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
            >
              <QrCode className="w-3 h-3" />
              <span>Escanear</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-3 gap-2 my-3">
        <div className="p-2 rounded-[3px] bg-zinc-950 border border-zinc-800/80">
          <span className="text-[9px] text-zinc-500 uppercase font-bold block">Total 7 Días</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-white font-mono">{total7Days}</span>
            <span className="text-[9px] text-zinc-500">escaneos</span>
          </div>
        </div>
        <div className="p-2 rounded-[3px] bg-zinc-950 border border-amber-400/20">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-amber-400" />
            <span className="text-[9px] text-amber-400 uppercase font-bold">Maquinarias</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-amber-400 font-mono">{total7DaysMachinery}</span>
            <span className="text-[9px] text-zinc-500">unidades</span>
          </div>
        </div>
        <div className="p-2 rounded-[3px] bg-zinc-950 border border-emerald-500/20">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[1px] bg-emerald-400" />
            <span className="text-[9px] text-emerald-400 uppercase font-bold">Repuestos OEM</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-emerald-400 font-mono">{total7DaysParts}</span>
            <span className="text-[9px] text-zinc-500">piezas</span>
          </div>
        </div>
      </div>

      {/* Recharts Mini Bar Chart */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={last7DaysData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const machineryVal = Number(payload.find(p => p.dataKey === 'machinery')?.value || 0);
                  const partsVal = Number(payload.find(p => p.dataKey === 'parts')?.value || 0);
                  const sumVal = machineryVal + partsVal;

                  return (
                    <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-700 shadow-xl text-xs font-mono">
                      <div className="font-bold text-white uppercase mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>{label}</span>
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center justify-between gap-4 text-amber-400 font-bold">
                          <span className="flex items-center gap-1">
                            <HardHat className="w-3 h-3" /> Maquinaria:
                          </span>
                          <span>{machineryVal}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Cog className="w-3 h-3" /> Repuestos OEM:
                          </span>
                          <span>{partsVal}</span>
                        </div>
                        <div className="border-t border-zinc-800 pt-1 mt-1 flex items-center justify-between gap-4 text-zinc-300 font-black">
                          <span>Total del día:</span>
                          <span className="text-white">{sumVal} escaneos</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', paddingBottom: '4px', textTransform: 'uppercase' }}
              formatter={(value) => (
                <span className="text-zinc-400 font-bold text-[10px]">
                  {value === 'machinery' ? 'Maquinaria' : 'Repuestos'}
                </span>
              )}
            />
            <Bar
              dataKey="machinery"
              name="machinery"
              fill="#fbbf24" // amber-400
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
            <Bar
              dataKey="parts"
              name="parts"
              fill="#34d399" // emerald-400
              radius={[2, 2, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
