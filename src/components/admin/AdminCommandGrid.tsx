import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Package, 
  Users, 
  LifeBuoy, 
  SlidersHorizontal, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { InventoryMachine, InventoryPart, InventoryAlert, Currency } from '../../types';
import { AdminInventoryModule } from './AdminInventoryModule';
import { AdminUserInsightsModule } from './AdminUserInsightsModule';
import { AdminSupportTicketsModule } from './AdminSupportTicketsModule';

interface AdminCommandGridProps {
  machines: InventoryMachine[];
  parts: InventoryPart[];
  alerts: InventoryAlert[];
  currency: Currency;
  onNavigateToMachines: () => void;
  onNavigateToParts: () => void;
  onNavigateToEmergency?: () => void;
}

export type GridViewMode = 'all_grid' | 'inventory_focus' | 'users_focus' | 'support_focus';

export const AdminCommandGrid: React.FC<AdminCommandGridProps> = ({
  machines,
  parts,
  alerts,
  currency,
  onNavigateToMachines,
  onNavigateToParts,
  onNavigateToEmergency
}) => {
  const [viewMode, setViewMode] = useState<GridViewMode>('all_grid');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dynamic Module Selector & Grid Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white tracking-tight">
                Matriz de Control Operativo
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Alta Prioridad
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Módulos activos con sincronización en tiempo real y renderizado condicional inteligente
            </p>
          </div>
        </div>

        {/* View Mode Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setViewMode('all_grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'all_grid'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Grid Completo (3 Módulos)</span>
          </button>

          <button
            onClick={() => setViewMode('inventory_focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'inventory_focus'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventario</span>
          </button>

          <button
            onClick={() => setViewMode('users_focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'users_focus'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Insights</span>
          </button>

          <button
            onClick={() => setViewMode('support_focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'support_focus'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Tickets SOS</span>
          </button>
        </div>
      </div>

      {/* Grid Rendering based on Mode */}
      {viewMode === 'all_grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {/* Module 1: Inventory */}
          <div className="h-full">
            <AdminInventoryModule
              machines={machines}
              parts={parts}
              alerts={alerts}
              currency={currency}
              onToggleExpand={() => setViewMode('inventory_focus')}
              onNavigateToMachines={onNavigateToMachines}
              onNavigateToParts={onNavigateToParts}
            />
          </div>

          {/* Module 2: User Insights */}
          <div className="h-full">
            <AdminUserInsightsModule
              currency={currency}
              onToggleExpand={() => setViewMode('users_focus')}
            />
          </div>

          {/* Module 3: Support Tickets */}
          <div className="h-full md:col-span-2 xl:col-span-1">
            <AdminSupportTicketsModule
              onToggleExpand={() => setViewMode('support_focus')}
              onNavigateToEmergency={onNavigateToEmergency}
            />
          </div>
        </div>
      )}

      {/* Focus Mode 1: Inventory Only */}
      {viewMode === 'inventory_focus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">Vista Expandida: Inventario de Maquinaria y Repuestos</span>
            <button
              onClick={() => setViewMode('all_grid')}
              className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Volver a la Matriz de 3 Módulos</span>
            </button>
          </div>
          <div className="w-full">
            <AdminInventoryModule
              machines={machines}
              parts={parts}
              alerts={alerts}
              currency={currency}
              isExpanded={true}
              onToggleExpand={() => setViewMode('all_grid')}
              onNavigateToMachines={onNavigateToMachines}
              onNavigateToParts={onNavigateToParts}
            />
          </div>
        </div>
      )}

      {/* Focus Mode 2: User Insights Only */}
      {viewMode === 'users_focus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">Vista Expandida: Métricas de Usuarios & Fidelidad Pro-Member</span>
            <button
              onClick={() => setViewMode('all_grid')}
              className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Volver a la Matriz de 3 Módulos</span>
            </button>
          </div>
          <div className="w-full">
            <AdminUserInsightsModule
              currency={currency}
              isExpanded={true}
              onToggleExpand={() => setViewMode('all_grid')}
            />
          </div>
        </div>
      )}

      {/* Focus Mode 3: Support Tickets Only */}
      {viewMode === 'support_focus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">Vista Expandida: Centro de Despacho de Emergencias & Tickets SOS</span>
            <button
              onClick={() => setViewMode('all_grid')}
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Volver a la Matriz de 3 Módulos</span>
            </button>
          </div>
          <div className="w-full">
            <AdminSupportTicketsModule
              isExpanded={true}
              onToggleExpand={() => setViewMode('all_grid')}
              onNavigateToEmergency={onNavigateToEmergency}
            />
          </div>
        </div>
      )}
    </div>
  );
};
