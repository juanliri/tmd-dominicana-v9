import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Plus, 
  Minus, 
  HardHat, 
  Cog, 
  ArrowUpRight, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { InventoryMachine, InventoryPart, InventoryAlert, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface AdminInventoryModuleProps {
  machines: InventoryMachine[];
  parts: InventoryPart[];
  alerts: InventoryAlert[];
  currency: Currency;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNavigateToMachines: () => void;
  onNavigateToParts: () => void;
}

export const AdminInventoryModule: React.FC<AdminInventoryModuleProps> = ({
  machines,
  parts,
  alerts,
  currency,
  isExpanded = false,
  onToggleExpand,
  onNavigateToMachines,
  onNavigateToParts
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'machines' | 'parts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'critical_list' | 'quick_adjust'>('overview');

  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Inventory summary metrics
  const totalMachinesCount = machines.reduce((acc, m) => acc + (m.stockQty || (m.inStock ? 1 : 0)), 0);
  const totalPartsCount = parts.reduce((acc, p) => acc + (p.stockQty || 0), 0);
  const machinesValuation = machines.reduce((acc, m) => acc + (m.basePriceUsd * (m.stockQty || (m.inStock ? 1 : 0))), 0);
  const partsValuation = parts.reduce((acc, p) => acc + (p.priceUsd * (p.stockQty || 0)), 0);
  const totalInventoryValuation = machinesValuation + partsValuation;

  const outOfStockCount = alerts.filter(a => a.severity === 'out_of_stock').length;
  const criticalStockCount = alerts.filter(a => a.severity === 'critical').length;

  // Filtered critical items
  const filteredAlerts = useMemo(() => {
    return alerts.filter(item => {
      if (filterType === 'machines' && item.itemType !== 'machine') return false;
      if (filterType === 'parts' && item.itemType !== 'part') return false;
      if (filterType === 'critical' && item.severity !== 'out_of_stock') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, filterType, searchQuery]);

  // Quick Stock Adjust Handler in Firestore
  const handleQuickAdjustStock = async (item: InventoryAlert, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta);
    setUpdatingItemId(item.id);
    try {
      if (item.itemType === 'machine') {
        const machineRef = doc(db, 'inventory_machines', item.itemId);
        await updateDoc(machineRef, {
          stockQty: newStock,
          inStock: newStock > 0,
          status: newStock > 0 ? 'available' : 'sold',
          updatedAt: new Date().toISOString()
        });
      } else {
        const partRef = doc(db, 'inventory_parts', item.itemId);
        await updateDoc(partRef, {
          stockQty: newStock,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error updating stock in Firestore:", err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      {/* Card Header with Module Priority Indicator */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                Módulo Inventario
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {machines.length} Maquinarias • {parts.length} Repuestos SKU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isExpanded ? "Vista Normal" : "Maximizar Módulo"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-zinc-100/40 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800/60 text-center">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Valoración Total</span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white tracking-tight">
            {formatMoney(totalInventoryValuation)}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Unidades Físicas</span>
          <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white tracking-tight">
            {(totalMachinesCount + totalPartsCount).toLocaleString()} unds
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Alertas Stock</span>
          <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Sub-Tabs & Filtering Controls */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveSubTab('critical_list')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeSubTab === 'critical_list'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span>Stock Crítico</span>
            {alerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('quick_adjust')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'quick_adjust'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Ajuste Rápido
          </button>
        </div>

        {/* Quick Navigate Links */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNavigateToMachines}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <HardHat className="w-3 h-3 text-amber-500" />
            <span>Maquinaria ({machines.length})</span>
          </button>
          <button
            onClick={onNavigateToParts}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Cog className="w-3 h-3 text-amber-500" />
            <span>Repuestos ({parts.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area with Conditional Views */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin">
        {/* 1. Overview View */}
        {activeSubTab === 'overview' && (
          <div className="space-y-4">
            {/* Machinery vs Parts Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">Flota de Maquinaria</h4>
                    <span className="text-[11px] text-zinc-500">{totalMachinesCount} unidades registradas</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-900 dark:text-white">{formatMoney(machinesValuation)}</span>
                  <span className="text-[10px] text-emerald-500 font-bold block">{machines.filter(m => m.inStock).length} disponibles</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Cog className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white">Almacén de Repuestos</h4>
                    <span className="text-[11px] text-zinc-500">{parts.length} líneas SKU activas</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-900 dark:text-white">{formatMoney(partsValuation)}</span>
                  <span className="text-[10px] text-zinc-500 font-bold block">{totalPartsCount} en estantería</span>
                </div>
              </div>
            </div>

            {/* Top Critical Alert Items Teaser */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Reabastecimiento Urgente Recomendado
                </h4>
                <button
                  onClick={() => setActiveSubTab('critical_list')}
                  className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-0.5"
                >
                  <span>Ver todas ({alerts.length})</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Niveles de Stock Óptimos</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Todos los equipos y repuestos superan el umbral mínimo.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${item.severity === 'out_of_stock' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        <div className="truncate">
                          <p className="font-bold text-zinc-900 dark:text-white truncate">{item.title}</p>
                          <span className="text-[10px] text-zinc-500">{item.brand} • {item.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          item.severity === 'out_of_stock'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.currentStock} / min {item.minStock}
                        </span>
                        
                        <button
                          onClick={() => handleQuickAdjustStock(item, 1)}
                          disabled={updatingItemId === item.id}
                          className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold transition-colors cursor-pointer"
                          title="Sumar 1 al stock"
                        >
                          +1 Reponer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Critical Stock List View */}
        {activeSubTab === 'critical_list' && (
          <div className="space-y-3">
            {/* Search & Filter Strip */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar en stock crítico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-1">
                {(['all', 'critical', 'machines', 'parts'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      filterType === t
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {t === 'all' ? 'Todos' : t === 'critical' ? 'Agotados' : t === 'machines' ? 'Equipos' : 'Repuestos'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredAlerts.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No se encontraron items con los filtros actuales.</p>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          item.itemType === 'machine' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {item.itemType === 'machine' ? 'Maquinaria' : 'Repuesto'}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">{item.code}</span>
                      </div>
                      <p className="font-black text-zinc-900 dark:text-white truncate">{item.title}</p>
                      <span className="text-[10px] text-zinc-500">{item.brand} • {item.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className={`text-xs font-black block ${item.currentStock === 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                          {item.currentStock} unds
                        </span>
                        <span className="text-[9px] text-zinc-400">Mín: {item.minStock}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickAdjustStock(item, 1)}
                          disabled={updatingItemId === item.id}
                          className="p-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors"
                          title="Añadir 1 unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Quick Adjust View */}
        {activeSubTab === 'quick_adjust' && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Ajuste directo en tiempo real para reposición y cuadraturas de almacén físico en patio Km 22:
            </p>

            <div className="space-y-2">
              {[...machines.slice(0, 3).map(m => ({
                id: `m-${m.id}`,
                itemId: m.id,
                itemType: 'machine' as const,
                title: m.name,
                code: m.modelCode,
                brand: m.brand,
                category: m.category,
                currentStock: m.stockQty ?? (m.inStock ? 1 : 0),
                minStock: m.minStockAlert ?? 1,
                severity: (m.stockQty === 0 ? 'out_of_stock' : 'critical') as any,
                updatedAt: m.updatedAt
              })), ...parts.slice(0, 4).map(p => ({
                id: `p-${p.id}`,
                itemId: p.id,
                itemType: 'part' as const,
                title: p.name,
                code: p.partNumber,
                brand: p.brand,
                category: p.category,
                currentStock: p.stockQty,
                minStock: p.minStockAlert ?? 3,
                severity: (p.stockQty === 0 ? 'out_of_stock' : 'critical') as any,
                updatedAt: p.updatedAt
              }))].map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/50 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-zinc-900 dark:text-white truncate">{item.title}</p>
                    <span className="text-[10px] text-zinc-500">{item.brand} • {item.code}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickAdjustStock(item, -1)}
                      disabled={updatingItemId === item.id || item.currentStock <= 0}
                      className="p-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-black text-xs">{item.currentStock}</span>
                    <button
                      onClick={() => handleQuickAdjustStock(item, 1)}
                      disabled={updatingItemId === item.id}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-zinc-500">Auto-sincronizado con Registro Central Cloud</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToMachines}
            className="text-[11px] font-black text-amber-500 hover:underline"
          >
            Gestor Maquinaria &rarr;
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <button
            onClick={onNavigateToParts}
            className="text-[11px] font-black text-amber-500 hover:underline"
          >
            Gestor Repuestos &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
