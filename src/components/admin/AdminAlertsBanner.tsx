import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Bell, ChevronRight, X, HardHat, Cog } from 'lucide-react';
import { InventoryAlert } from '../../types';

interface AdminAlertsBannerProps {
  alerts: InventoryAlert[];
  onOpenNotifications: () => void;
  onNavigateToMachines: () => void;
  onNavigateToParts: () => void;
}

export const AdminAlertsBanner: React.FC<AdminAlertsBannerProps> = ({
  alerts,
  onOpenNotifications,
  onNavigateToMachines,
  onNavigateToParts
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (alerts.length === 0 || isDismissed) {
    return null;
  }

  const outOfStock = alerts.filter(a => a.severity === 'out_of_stock');
  const critical = alerts.filter(a => a.severity === 'critical');
  const machinesCount = alerts.filter(a => a.itemType === 'machine').length;
  const partsCount = alerts.filter(a => a.itemType === 'part').length;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 p-4 shadow-sm relative overflow-hidden animate-fadeIn">
      {/* Background visual highlight */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* Left summary */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center flex-shrink-0 shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                ALERTA DE REABASTECIMIENTO
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                {alerts.length} {alerts.length === 1 ? 'artículo requiere' : 'artículos requieren'} atención inmediata
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {outOfStock.length > 0 && (
                <strong className="text-rose-600 dark:text-rose-400">
                  {outOfStock.length} agotado(s) a 0 unidades.{' '}
                </strong>
              )}
              {critical.length > 0 && (
                <span>{critical.length} en nivel crítico (por debajo del stock mínimo estipulado). </span>
              )}
              {machinesCount > 0 && <span>• {machinesCount} equipo(s) </span>}
              {partsCount > 0 && <span>• {partsCount} repuesto(s)</span>}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
          {machinesCount > 0 && (
            <button
              onClick={onNavigateToMachines}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Equipos ({machinesCount})</span>
            </button>
          )}

          {partsCount > 0 && (
            <button
              onClick={onNavigateToParts}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Cog className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Repuestos ({partsCount})</span>
            </button>
          )}

          <button
            onClick={onOpenNotifications}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Gestionar Alertas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Ocultar banner de alerta en esta sesión"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
