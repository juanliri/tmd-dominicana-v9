import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  HardHat, 
  Cog, 
  X, 
  ChevronRight, 
  Plus, 
  Check, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Sliders, 
  Volume2, 
  VolumeX,
  MapPin,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { InventoryAlert, InventoryMachine, InventoryPart } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: InventoryAlert[];
  machines: InventoryMachine[];
  parts: InventoryPart[];
  onNavigateToMachines: (highlightId?: string) => void;
  onNavigateToParts: (highlightId?: string) => void;
  onAlertUpdated?: (message: string) => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  isOpen,
  onClose,
  alerts,
  machines,
  parts,
  onNavigateToMachines,
  onNavigateToParts,
  onAlertUpdated
}) => {
  const [filterType, setFilterType] = useState<'all' | 'machine' | 'part' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingThresholdAlert, setEditingThresholdAlert] = useState<InventoryAlert | null>(null);
  const [newThresholdValue, setNewThresholdValue] = useState<number>(1);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Filter alerts based on dismissals, filterType, and search
  const visibleAlerts = alerts
    .filter(a => !dismissedAlertIds.includes(a.id))
    .filter(a => {
      if (filterType === 'machine') return a.itemType === 'machine';
      if (filterType === 'part') return a.itemType === 'part';
      if (filterType === 'out_of_stock') return a.severity === 'out_of_stock';
      return true;
    })
    .filter(a => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.brand.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.location && a.location.toLowerCase().includes(q))
      );
    });

  const outOfStockCount = alerts.filter(a => a.severity === 'out_of_stock').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const machinesCount = alerts.filter(a => a.itemType === 'machine').length;
  const partsCount = alerts.filter(a => a.itemType === 'part').length;

  // Quick Restock Handler (+delta)
  const handleQuickRestock = async (alert: InventoryAlert, delta: number) => {
    try {
      setUpdatingId(alert.id);
      const collectionName = alert.itemType === 'machine' ? 'inventory_machines' : 'inventory_parts';
      const docRef = doc(db, collectionName, alert.itemId);

      const newQty = Math.max(0, alert.currentStock + delta);
      const updatePayload: Record<string, any> = {
        stockQty: newQty,
        updatedAt: new Date().toISOString()
      };

      // For machines, also update inStock flag
      if (alert.itemType === 'machine') {
        updatePayload.inStock = newQty > 0;
      }

      await updateDoc(docRef, updatePayload);

      if (onAlertUpdated) {
        onAlertUpdated(`+${delta} unidad(es) añadidas a ${alert.title}. Stock actual: ${newQty}`);
      }
    } catch (err) {
      console.error("Error restocking item:", err);
      handleFirestoreError(err, OperationType.UPDATE, `${alert.itemType === 'machine' ? 'inventory_machines' : 'inventory_parts'}/${alert.itemId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update Minimum Stock Alert Threshold Handler
  const handleSaveNewThreshold = async () => {
    if (!editingThresholdAlert) return;
    try {
      setUpdatingId(editingThresholdAlert.id);
      const collectionName = editingThresholdAlert.itemType === 'machine' ? 'inventory_machines' : 'inventory_parts';
      const docRef = doc(db, collectionName, editingThresholdAlert.itemId);

      await updateDoc(docRef, {
        minStockAlert: Math.max(1, newThresholdValue),
        updatedAt: new Date().toISOString()
      });

      if (onAlertUpdated) {
        onAlertUpdated(`Nivel de stock mínimo actualizado a ${newThresholdValue} para ${editingThresholdAlert.title}`);
      }
      setEditingThresholdAlert(null);
    } catch (err) {
      console.error("Error updating minStockAlert:", err);
      handleFirestoreError(err, OperationType.UPDATE, `${editingThresholdAlert.itemType === 'machine' ? 'inventory_machines' : 'inventory_parts'}/${editingThresholdAlert.itemId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds(prev => [...prev, alertId]);
  };

  const handleRestoreDismissed = () => {
    setDismissedAlertIds([]);
  };

  const handleNavigateToItem = (alert: InventoryAlert) => {
    onClose();
    if (alert.itemType === 'machine') {
      onNavigateToMachines(alert.itemId);
    } else {
      onNavigateToParts(alert.itemId);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 relative">
              <Bell className="w-5 h-5 animate-pulse" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  {alerts.length}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                  Notificaciones de Stock Crítico
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {alerts.length} Activas
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Supervisión de inventario de maquinarias y repuestos por debajo del umbral mínimo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-zinc-100/50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <span className="text-zinc-500 font-medium">Agotados (0)</span>
            <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
              {outOfStockCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <span className="text-zinc-500 font-medium">Stock Crítico</span>
            <span className="font-mono font-black text-amber-500 text-sm">
              {criticalCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <span className="text-zinc-500 font-medium">Maquinaria</span>
            <span className="font-mono font-black text-zinc-900 dark:text-white text-sm">
              {machinesCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <span className="text-zinc-500 font-medium">Repuestos OEM</span>
            <span className="font-mono font-black text-zinc-900 dark:text-white text-sm">
              {partsCount}
            </span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-900">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código OEM, serie o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Todas ({alerts.length})
              </button>

              <button
                onClick={() => setFilterType('out_of_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'out_of_stock'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Agotados ({outOfStockCount})</span>
              </button>

              <button
                onClick={() => setFilterType('machine')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'machine'
                    ? 'bg-amber-500 text-black font-extrabold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                <span>Equipos ({machinesCount})</span>
              </button>

              <button
                onClick={() => setFilterType('part')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterType === 'part'
                    ? 'bg-amber-500 text-black font-extrabold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Cog className="w-3.5 h-3.5 text-amber-500" />
                <span>Repuestos ({partsCount})</span>
              </button>
            </div>
          </div>

          {dismissedAlertIds.length > 0 && (
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <span>{dismissedAlertIds.length} alerta(s) silenciadas en esta sesión</span>
              <button
                onClick={handleRestoreDismissed}
                className="text-amber-500 hover:underline font-bold"
              >
                Restaurar todas
              </button>
            </div>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {visibleAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {alerts.length === 0
                    ? 'Inventario en Óptimas Condiciones'
                    : 'No hay alertas con los filtros seleccionados'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {alerts.length === 0
                    ? 'Todas las maquinarias y repuestos superan sus niveles mínimos de stock configurados.'
                    : 'Ajuste el término de búsqueda o seleccione otro filtro para visualizar otras alertas.'}
                </p>
              </div>
            </div>
          ) : (
            visibleAlerts.map((alert) => {
              const isUpdating = updatingId === alert.id;
              const isOutOfStock = alert.severity === 'out_of_stock';
              const stockPercentage = Math.min(100, Math.round((alert.currentStock / Math.max(1, alert.minStock)) * 100));

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOutOfStock
                      ? 'bg-rose-500/5 border-rose-500/30 dark:border-rose-500/20'
                      : 'bg-amber-500/5 border-amber-500/30 dark:border-amber-500/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left Icon & Details */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isOutOfStock
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {alert.itemType === 'machine' ? (
                          <HardHat className="w-5 h-5" />
                        ) : (
                          <Cog className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isOutOfStock
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-500 text-black'
                            }`}
                          >
                            {isOutOfStock ? 'Sin Existencias (0)' : 'Stock Crítico'}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {alert.brand}
                          </span>

                          <span className="text-[11px] font-mono text-zinc-500">
                            {alert.code}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-snug">
                          {alert.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-0.5">
                          {alert.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{alert.location}</span>
                            </span>
                          )}

                          <span className="font-medium">
                            Stock actual:{' '}
                            <strong className={`font-mono font-black ${isOutOfStock ? 'text-rose-600 dark:text-rose-400' : 'text-amber-500'}`}>
                              {alert.currentStock} {alert.itemType === 'machine' ? 'unidad(es)' : 'pieza(s)'}
                            </strong>{' '}
                            • Mínimo requerido: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{alert.minStock}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-end sm:self-center">
                      {/* Quick Restock button */}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleQuickRestock(alert, alert.itemType === 'machine' ? 1 : 5)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        title={alert.itemType === 'machine' ? "Añadir 1 máquina al stock" : "Añadir 5 piezas al stock"}
                      >
                        {isUpdating ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{alert.itemType === 'machine' ? '+1 Equipo' : '+5 Repuestos'}</span>
                      </button>

                      {/* Adjust Threshold Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingThresholdAlert(alert);
                          setNewThresholdValue(alert.minStock);
                        }}
                        className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                        title="Configurar nivel de stock mínimo de alerta"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>

                      {/* Go to catalog tab */}
                      <button
                        type="button"
                        onClick={() => handleNavigateToItem(alert)}
                        className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                        title="Ver en tabla de inventario"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      {/* Dismiss for session */}
                      <button
                        type="button"
                        onClick={() => handleDismissAlert(alert.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        title="Silenciar alerta en esta sesión"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Level Progress Bar */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                      <span>Nivel de Cobertura de Inventario</span>
                      <span className="font-mono font-bold">{stockPercentage}% del mínimo</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOutOfStock
                            ? 'bg-rose-500 w-0'
                            : stockPercentage <= 50
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, stockPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Edit Minimum Stock Threshold Modal Sub-dialog */}
        {editingThresholdAlert && (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-700 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  Configurar Umbral de Alerta
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  {editingThresholdAlert.title} ({editingThresholdAlert.code})
                </p>
                <p className="text-[11px] text-zinc-500">
                  El sistema notificará cuando las existencias sean menores o iguales a este número.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700">
                  <span className="text-xs text-zinc-500">Mínimo:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newThresholdValue}
                    onChange={(e) => setNewThresholdValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 font-mono font-black text-xs text-zinc-900 dark:text-white bg-transparent focus:outline-hidden"
                  />
                  <span className="text-[11px] text-zinc-400">unid.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveNewThreshold}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingThresholdAlert(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Monitoreo en tiempo real sincronizado con Firestore</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-extrabold text-xs transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
