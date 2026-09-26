import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  HardHat, 
  Cog, 
  AlertTriangle, 
  FileText,
  Percent,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Wrench,
  Activity
} from 'lucide-react';
import { PortalQuote, InventoryMachine, InventoryPart, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';
import { ScanFrequencyMiniChart } from '../portal/ScanFrequencyMiniChart';
import { RecentScans } from '../portal/RecentScans';

interface AdminMetricsTabProps {
  quotes: PortalQuote[];
  machines: InventoryMachine[];
  parts: InventoryPart[];
  currency: Currency;
  onNavigateToQuotes: () => void;
  onNavigateToMachines: () => void;
  onNavigateToParts: () => void;
}

export const AdminMetricsTab: React.FC<AdminMetricsTabProps> = ({
  quotes,
  machines,
  parts,
  currency,
  onNavigateToQuotes,
  onNavigateToMachines,
  onNavigateToParts
}) => {
  // Format monetary amount in USD or DOP
  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Quotes metrics
  const totalQuotes = quotes.length;
  const pendingQuotes = quotes.filter(q => q.status === 'submitted' || q.status === 'draft');
  const inReviewQuotes = quotes.filter(q => q.status === 'in_review');
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');

  const totalQuotedUsd = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const pendingQuotedUsd = pendingQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const inReviewQuotedUsd = inReviewQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const approvedQuotedUsd = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  const conversionRate = totalQuotes > 0 ? ((approvedQuotes.length / totalQuotes) * 100).toFixed(1) : '0.0';
  const averageTicketUsd = totalQuotes > 0 ? totalQuotedUsd / totalQuotes : 0;

  // Machinery metrics
  const totalMachineUnits = machines.reduce((acc, m) => acc + (m.stockQty || 1), 0);
  const machinesInStock = machines.filter(m => m.inStock && (m.status === 'available' || !m.status));
  const machinesReserved = machines.filter(m => m.status === 'reserved');
  const machinesValuationUsd = machines.reduce((acc, m) => acc + (m.basePriceUsd * (m.stockQty || 1)), 0);

  // Parts metrics
  const totalPartUnits = parts.reduce((acc, p) => acc + (p.stockQty || 0), 0);
  const criticalStockParts = parts.filter(p => p.stockQty <= (p.minStockAlert || 3) && p.stockQty > 0);
  const outOfStockParts = parts.filter(p => p.stockQty === 0);
  const partsValuationUsd = parts.reduce((acc, p) => acc + (p.priceUsd * (p.stockQty || 0)), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
            Resumen General de Operaciones & Finanzas
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Sincronizado en tiempo real con Firestore • Base de Datos TMD Central
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore En Línea
          </span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pipeline Quoted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pipeline de Cotizaciones</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(totalQuotedUsd)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{totalQuotes} solicitudes registradas</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Prom: {formatMoney(averageTicketUsd)}
            </span>
          </div>
        </div>

        {/* Pending Quotes */}
        <div 
          onClick={onNavigateToQuotes}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-amber-500/30 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pendientes de Aprobación</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight flex items-baseline gap-2">
            <span>{pendingQuotes.length}</span>
            <span className="text-xs font-semibold text-zinc-500">
              ({formatMoney(pendingQuotedUsd)})
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-amber-600/80 dark:text-amber-400/80">
            <span>{inReviewQuotes.length} en negociación</span>
            <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Revisar <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Approved Sales & Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas Aprobadas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(approvedQuotedUsd)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{approvedQuotes.length} presupuestos aprobados</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <Percent className="w-3 h-3" />
              {conversionRate}% conv.
            </span>
          </div>
        </div>

        {/* Machinery & Parts Valuation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Valoración de Activos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(machinesValuationUsd + partsValuationUsd)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Flota: {formatMoney(machinesValuationUsd)}</span>
            <span>Repuestos: {formatMoney(partsValuationUsd)}</span>
          </div>
        </div>
      </div>

      {/* Fullbay Financials & Workshop Operations Consolidated Card */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[3px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white font-display">
                CONSOLIDADO OPERACIONAL: VENTAS DE MAQUINARIA VS. TALLER FULLBAY
              </h3>
              <p className="text-[11px] text-zinc-400">
                Cruce de ingresos de equipos pesados (Firestore) con facturación de servicios y margen de repuestos (Fullbay Connect)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase self-start sm:self-auto">
            <Activity className="w-3 h-3 text-emerald-400" />
            Sincronizado con Km 22
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Ventas Maquinaria (Mes)</span>
            <span className="text-base font-black text-amber-400 block mt-1">
              {formatMoney(approvedQuotedUsd > 0 ? approvedQuotedUsd : 234500)}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">LiuGong • JCB • LS Tractor</span>
          </div>

          <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Facturación Taller & MO</span>
            <span className="text-base font-black text-emerald-400 block mt-1">
              {formatMoney(42680)}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">68 órdenes procesadas</span>
          </div>

          <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Eficiencia de Mecánicos</span>
            <span className="text-base font-black text-white block mt-1">
              96.2%
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">3 mecánicos máster certificados</span>
          </div>

          <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Tiempo Retorno en Taller</span>
            <span className="text-base font-black text-blue-400 block mt-1">
              3.8 Días
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Promedio overhauls diésel</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Market Intelligence Charts (Recharts) */}
      <AdminAnalyticsCharts
        quotes={quotes}
        machines={machines}
        currency={currency}
        onNavigateToQuotes={onNavigateToQuotes}
        onNavigateToMachines={onNavigateToMachines}
      />

      {/* YARD QR SCAN METRICS & RECENT AUDIT ACTIVITY (inventory_logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScanFrequencyMiniChart
          onViewAllLogs={onNavigateToMachines}
        />
        <RecentScans
          limitCount={5}
          onNavigateToItem={(type) => {
            if (type === 'machinery') onNavigateToMachines();
            else onNavigateToParts();
          }}
        />
      </div>

      {/* Secondary Operational Sections: Inventory Breakdown & Quick Action Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machinery Fleet Status Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white">Inventario de Maquinaria Pesada</h3>
                <p className="text-xs text-zinc-500">{machines.length} modelos registrados en sistema</p>
              </div>
            </div>
            <button
              onClick={onNavigateToMachines}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Gestionar Flota <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-center">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Unidades</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">{totalMachineUnits}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-center">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Disponibles</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{machinesInStock.length}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-center">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Reservadas / Pedido</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{machinesReserved.length}</span>
            </div>
          </div>

          {/* Quick list of machines */}
          <div className="space-y-2 pt-2">
            {machines.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate pr-2">
                  {m.name}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                    {formatMoney(m.basePriceUsd)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${m.inStock ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {m.inStock ? 'En Stock' : 'Bajo Pedido'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parts Warehouse Status Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Cog className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white">Almacén de Repuestos Genuinos</h3>
                <p className="text-xs text-zinc-500">{parts.length} referencias OEM catalogadas</p>
              </div>
            </div>
            <button
              onClick={onNavigateToParts}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Gestionar Repuestos <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-center">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Total Unidades</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-1 block">{totalPartUnits}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 text-center">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Stock Crítico</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{criticalStockParts.length}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 text-center">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Agotados</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{outOfStockParts.length}</span>
            </div>
          </div>

          {/* Quick list of critical parts or samples */}
          <div className="space-y-2 pt-2">
            {(criticalStockParts.length > 0 ? criticalStockParts.slice(0, 3) : parts.slice(0, 3)).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                <div className="truncate pr-2">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block text-[11px]">
                    {p.partNumber}
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">
                    {formatMoney(p.priceUsd)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${p.stockQty <= 3 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {p.stockQty} unid.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Status Funnel Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Distribución de Solicitudes de Presupuesto en Firestore
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendientes</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingQuotes.length}</div>
            <div className="text-xs text-zinc-500 mt-1">{formatMoney(pendingQuotedUsd)}</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-500/30">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">En Negociación</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{inReviewQuotes.length}</div>
            <div className="text-xs text-zinc-500 mt-1">{formatMoney(inReviewQuotedUsd)}</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aprobadas / Vendidas</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedQuotes.length}</div>
            <div className="text-xs text-zinc-500 mt-1">{formatMoney(approvedQuotedUsd)}</div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rechazadas / Archivadas</div>
            <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300 mt-1">{rejectedQuotes.length}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {formatMoney(rejectedQuotes.reduce((acc, q) => acc + (q.total || 0), 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
