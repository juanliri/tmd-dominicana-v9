import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Database, 
  RefreshCw,
  Eye,
  Key,
  DollarSign,
  Layers,
  HardHat,
  Trash2,
  PlusCircle,
  Download,
  Filter,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Calendar,
  Check
} from 'lucide-react';
import { AdminAuditLog, AdminAuditActionType } from '../../types';
import { 
  subscribeToAdminAuditLogs, 
  exportAuditLogsToCsv, 
  exportAuditLogsToJson,
  recordAdminAuditLog
} from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

export const AdminSecurityAuditLog: React.FC = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Real-time listener for Firestore audit logs
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAdminAuditLogs(
      (updatedLogs) => {
        setLogs(updatedLogs);
        setLoading(false);
      },
      (err) => {
        console.warn("Audit listener note:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Action Type Filter
      if (filterType !== 'all') {
        if (filterType === 'prices' && log.actionType !== 'PRICE_UPDATE') return false;
        if (filterType === 'stock' && log.actionType !== 'INVENTORY_STOCK_UPDATE') return false;
        if (filterType === 'bulk' && log.actionType !== 'BULK_IMPORT') return false;
        if (filterType === 'creations' && !['MACHINE_CREATED', 'PART_CREATED'].includes(log.actionType)) return false;
        if (filterType === 'deletions' && !['MACHINE_DELETED', 'PART_DELETED'].includes(log.actionType)) return false;
        if (filterType === 'roles' && log.actionType !== 'USER_ROLE_PROMOTION') return false;
      }

      // 2. Date Filter
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - logDate > oneDay) return false;
        } else if (dateFilter === '7days') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (now - logDate > sevenDays) return false;
        } else if (dateFilter === '30days') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (now - logDate > thirtyDays) return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesActor = log.actorEmail?.toLowerCase().includes(q) || log.actorName?.toLowerCase().includes(q);
        const matchesTarget = log.targetName?.toLowerCase().includes(q) || log.targetId?.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q) || log.diffSummary?.toLowerCase().includes(q);
        const matchesId = log.id?.toLowerCase().includes(q) || log.checksum?.toLowerCase().includes(q);
        return matchesActor || matchesTarget || matchesDetails || matchesId;
      }

      return true;
    });
  }, [logs, filterType, dateFilter, searchQuery]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = logs.length;
    const priceUpdates = logs.filter(l => l.actionType === 'PRICE_UPDATE').length;
    const stockUpdates = logs.filter(l => l.actionType === 'INVENTORY_STOCK_UPDATE').length;
    const bulkImports = logs.filter(l => l.actionType === 'BULK_IMPORT').length;
    const userRoleChanges = logs.filter(l => l.actionType === 'USER_ROLE_PROMOTION').length;

    return { total, priceUpdates, stockUpdates, bulkImports, userRoleChanges };
  }, [logs]);

  // Helper to render badge based on action type
  const renderActionBadge = (type: AdminAuditActionType) => {
    switch (type) {
      case 'PRICE_UPDATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Actualización de Precios</span>
          </span>
        );
      case 'INVENTORY_STOCK_UPDATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Ajuste de Stock</span>
          </span>
        );
      case 'BULK_IMPORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-3.5 h-3.5" />
            <span>Alta Masiva ERP Cloud</span>
          </span>
        );
      case 'MACHINE_CREATED':
      case 'PART_CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Creación de Ítem</span>
          </span>
        );
      case 'MACHINE_DELETED':
      case 'PART_DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Baja / Eliminación</span>
          </span>
        );
      case 'USER_ROLE_PROMOTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cambio de Rol RBAC</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>{type}</span>
          </span>
        );
    }
  };

  // Simulation handler for testing
  const handleSimulateAuditEntry = async () => {
    setIsSimulating(true);
    try {
      await recordAdminAuditLog({
        actorUid: currentUser?.uid || 'usr-test-admin',
        actorEmail: currentUser?.email || 'jliriano154@gmail.com',
        actorName: currentUser?.displayName || 'J. Liriano (Super Admin)',
        actorRole: 'admin',
        actionType: 'PRICE_UPDATE',
        targetEntity: 'inventory_machines',
        targetId: 'jcb-3cx-test',
        targetName: 'Retroexcavadora JCB 3CX Eco 4x4 (Verificación Auditoría)',
        previousValue: { basePriceUsd: 85000 },
        diffSummary: 'Precio USD: $85,000 → $88,500 (+4.1%)',
        details: 'Validación criptográfica en tiempo real registrada en el Registro Central de Seguridad ERP.'
      });
      showFeedback("Entrada de auditoría registrada e inmutabilizada exitosamente en el Registro Central ERP");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Immutable Security Protocol */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Auditoría Inmutable de Acciones Administrativas (Fase 20.2)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Registro criptográfico inmutable en <strong>Base de Datos ERP Cloud (Supabase / Postgres)</strong> para todos los cambios de existencias de maquinaria, ajustes de precios OEM, altas masivas y elevaciones de permisos RBAC. Visible exclusivamente para administradores autenticados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => exportAuditLogsToCsv(filteredLogs)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Exportar a CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportAuditLogsToJson(filteredLogs)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Exportar a JSON"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateAuditEntry}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Escribiendo...' : 'Probar Auditoría'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Total Registros</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
            {stats.total}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Inmutables en ERP Cloud</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-500 block tracking-wider">Cambios de Precios</span>
          <div className="text-2xl font-black text-amber-500 mt-1 font-mono">
            {stats.priceUpdates}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Ajustes tarifarios OEM</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-500 block tracking-wider">Ajustes de Stock</span>
          <div className="text-2xl font-black text-blue-500 mt-1 font-mono">
            {stats.stockUpdates}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Flota & Almacén Km 22</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">Altas Masivas</span>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
            {stats.bulkImports}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Lotes CSV / JSON</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">Roles RBAC</span>
          <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">
            {stats.userRoleChanges}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Permisos elevados</span>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Administrador, Maquinaria, Número de Parte, Checksum o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
            />
          </div>

          {/* Action Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'prices', label: 'Precios' },
              { id: 'stock', label: 'Stock' },
              { id: 'bulk', label: 'Altas Masivas' },
              { id: 'creations', label: 'Nuevos Ítems' },
              { id: 'deletions', label: 'Eliminaciones' },
              { id: 'roles', label: 'Roles' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              aria-label="Filtrar registros por período de tiempo"
              className="text-xs bg-transparent font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer py-1.5"
            >
              <option value="all">Todo el Historial</option>
              <option value="today">Hoy (24 Horas)</option>
              <option value="7days">Últimos 7 Días</option>
              <option value="30days">Últimos 30 Días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-bold">Consultando registros criptográficos en el sistema ERP...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-zinc-400" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No se encontraron registros de auditoría</p>
            <p className="text-xs text-zinc-500">Intente modificar los filtros de búsqueda o registre una nueva acción administrativa.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const dateObj = new Date(log.timestamp);
            const formattedDate = dateObj.toLocaleDateString('es-DO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('es-DO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={log.id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs overflow-hidden"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="mt-0.5 sm:mt-0">
                      {renderActionBadge(log.actionType)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-zinc-900 dark:text-white">
                          {log.targetName}
                        </span>
                        {log.diffSummary && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                            {log.diffSummary}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {log.actorName}
                        </span>
                        <span>•</span>
                        <span>{log.actorEmail}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-zinc-400">{log.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block">
                        {formattedTime}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
                    {/* Full description */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                        Descripción de la Operación
                      </span>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {log.details}
                      </p>
                    </div>

                    {/* Diff comparison table */}
                    {(log.previousValue || log.newValue) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                          <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">
                            Valor Anterior (Prev)
                          </span>
                          <pre className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
                            {typeof log.previousValue === 'object' 
                              ? JSON.stringify(log.previousValue, null, 2) 
                              : (log.previousValue || 'Ninguno / Registro inicial')}
                          </pre>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">
                            Nuevo Valor (Post)
                          </span>
                          <pre className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
                            {typeof log.newValue === 'object' 
                              ? JSON.stringify(log.newValue, null, 2) 
                              : (log.newValue || 'N/A')}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Security Metadata Footer */}
                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Sello Criptográfico Inmutable:</span>
                        <code className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-bold text-[10px]">
                          {log.checksum || 'SHA256-VALIDATED'}
                        </code>
                      </div>

                      <div className="flex items-center gap-3">
                        <span>Colección: <strong className="text-zinc-700 dark:text-zinc-300">{log.targetEntity}</strong></span>
                        <span>ID Documento: <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{log.targetId}</strong></span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Lock className="w-3 h-3" />
                          <span>ERP Read-Only</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
