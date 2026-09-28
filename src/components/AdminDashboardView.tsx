import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  HardHat, 
  Cog, 
  ArrowLeft, 
  DollarSign, 
  LogOut, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Bell,
  Database,
  Wrench,
  Kanban
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PortalQuote, InventoryMachine, InventoryPart, InventoryAlert } from '../types';
import { AdminMetricsTab } from './admin/AdminMetricsTab';
import { AdminQuotesTab } from './admin/AdminQuotesTab';
import { AdminMachineryTab } from './admin/AdminMachineryTab';
import { AdminPartsTab } from './admin/AdminPartsTab';
import { AdminCommandGrid } from './admin/AdminCommandGrid';
import { AdminDemandHeatmap } from './admin/AdminDemandHeatmap';
import { AdminSecurityAuditLog } from './admin/AdminSecurityAuditLog';
import { AdminNotificationCenter } from './admin/AdminNotificationCenter';
import { AdminAlertsBanner } from './admin/AdminAlertsBanner';
import { AdminCrmFunnelView } from './admin/AdminCrmFunnelView';
import { AdminPatioKm22Manager } from './admin/AdminPatioKm22Manager';
import { FirestoreBulkManagerModal } from './FirestoreBulkManagerModal';
import { FullbayShopManager } from './shop/FullbayShopManager';
import { AdminIntegrationsHealthView } from './admin/AdminIntegrationsHealthView';
import { MonthlyBusinessConfigModal } from './admin/MonthlyBusinessConfigModal';
import { Dgii606_607ExporterModal } from './accounting/Dgii606_607ExporterModal';
import { SalesKanbanPipelineModal } from './commercial/SalesKanbanPipelineModal';
import { TechnicianLaborHoursModal } from './workshop/TechnicianLaborHoursModal';
import { LayoutGrid, Sparkles, Flame, ShieldCheck as ShieldCheckIcon, TrendingUp, Calendar as CalendarIcon, Activity as ActivityIcon, Settings } from 'lucide-react';

interface AdminDashboardViewProps {
  onNavigate: (route: string) => void;
}

type AdminTab = 'command_grid' | 'crm_funnel' | 'patio_km22' | 'metrics' | 'quotes' | 'machines' | 'parts' | 'shop' | 'demand_heatmap' | 'audit_log' | 'integrations';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, userProfile, isAdmin, role, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { currency, setCurrency } = useCart();

  const [activeTab, setActiveTab] = useState<AdminTab>('command_grid');
  const [quotes, setQuotes] = useState<PortalQuote[]>([]);
  const [machines, setMachines] = useState<InventoryMachine[]>([]);
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isBulkManagerOpen, setIsBulkManagerOpen] = useState(false);
  const [isMonthlyConfigOpen, setIsMonthlyConfigOpen] = useState(false);
  const [isDgiiExporterOpen, setIsDgiiExporterOpen] = useState(false);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [isLaborHoursOpen, setIsLaborHoursOpen] = useState(false);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  // Firestore Real-Time Listeners for quotes, machines, and parts
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // 1. Listen to quotes
    const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const items: PortalQuote[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as PortalQuote);
      });
      setQuotes(items);
      setLoadingData(false);
    }, (error) => {
      console.error("Quotes listener error:", error);
      handleFirestoreError(error, OperationType.LIST, 'quotes');
      setLoadingData(false);
    });

    // 2. Listen to inventory machines
    const machinesQuery = query(collection(db, 'inventory_machines'));
    const unsubMachines = onSnapshot(machinesQuery, (snapshot) => {
      const items: InventoryMachine[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryMachine);
      });
      setMachines(items);
    }, (error) => {
      console.warn("Machines listener error:", error);
    });

    // 3. Listen to inventory parts
    const partsQuery = query(collection(db, 'inventory_parts'));
    const unsubParts = onSnapshot(partsQuery, (snapshot) => {
      const items: InventoryPart[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryPart);
      });
      setParts(items);
    }, (error) => {
      console.warn("Parts listener error:", error);
    });

    return () => {
      unsubQuotes();
      unsubMachines();
      unsubParts();
    };
  }, [currentUser, isAdmin]);

  // Derived Real-time Inventory Alerts for low stock and out-of-stock items
  const alerts: InventoryAlert[] = useMemo(() => {
    const list: InventoryAlert[] = [];

    // 1. Check Machinery Stock
    machines.forEach((m) => {
      const minStock = m.minStockAlert ?? 1;
      const currentStock = m.stockQty ?? (m.inStock ? 1 : 0);

      if (currentStock === 0 || !m.inStock) {
        list.push({
          id: `alert-machine-${m.id}`,
          itemId: m.id,
          itemType: 'machine',
          title: m.name,
          brand: m.brand,
          code: m.modelCode || m.serialNumber || m.id,
          category: m.category || 'Maquinaria Pesada',
          currentStock: currentStock,
          minStock: minStock,
          severity: 'out_of_stock',
          location: m.location,
          image: m.image,
          updatedAt: m.updatedAt || new Date().toISOString()
        });
      } else if (currentStock <= minStock) {
        list.push({
          id: `alert-machine-${m.id}`,
          itemId: m.id,
          itemType: 'machine',
          title: m.name,
          brand: m.brand,
          code: m.modelCode || m.serialNumber || m.id,
          category: m.category || 'Maquinaria Pesada',
          currentStock: currentStock,
          minStock: minStock,
          severity: 'critical',
          location: m.location,
          image: m.image,
          updatedAt: m.updatedAt || new Date().toISOString()
        });
      }
    });

    // 2. Check Spare Parts Stock
    parts.forEach((p) => {
      const minStock = p.minStockAlert ?? 3;
      const currentStock = p.stockQty ?? 0;

      if (currentStock === 0) {
        list.push({
          id: `alert-part-${p.id}`,
          itemId: p.id,
          itemType: 'part',
          title: p.name,
          brand: p.brand,
          code: p.partNumber,
          category: p.category,
          currentStock: currentStock,
          minStock: minStock,
          severity: 'out_of_stock',
          location: p.locationBin,
          image: p.image,
          updatedAt: p.updatedAt || new Date().toISOString()
        });
      } else if (currentStock <= minStock) {
        list.push({
          id: `alert-part-${p.id}`,
          itemId: p.id,
          itemType: 'part',
          title: p.name,
          brand: p.brand,
          code: p.partNumber,
          category: p.category,
          currentStock: currentStock,
          minStock: minStock,
          severity: 'critical',
          location: p.locationBin,
          image: p.image,
          updatedAt: p.updatedAt || new Date().toISOString()
        });
      }
    });

    // Sort: Out of stock first, then ascending by current stock
    return list.sort((a, b) => {
      if (a.severity === 'out_of_stock' && b.severity !== 'out_of_stock') return -1;
      if (b.severity === 'out_of_stock' && a.severity !== 'out_of_stock') return 1;
      return a.currentStock - b.currentStock;
    });
  }, [machines, parts]);

  // If Auth is checking
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs font-bold text-zinc-500">Verificando credenciales de Administrador...</p>
      </div>
    );
  }

  // If not logged in
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-zinc-950">
        <div className="max-w-md w-full bg-zinc-900 p-6 sm:p-8 rounded-[5px] border border-zinc-800 shadow-2xl text-center space-y-5 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
          <div className="w-14 h-14 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/30">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-widest uppercase bg-zinc-950 border border-zinc-800 text-zinc-400">
              Acceso Restringido
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              Dashboard de Administración
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
              Esta sección está restringida exclusivamente para directores y administradores de TMD Dominicana. Inicie sesión con su cuenta corporativa autorizada.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 font-sans">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full py-3 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold uppercase text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Acceder con Google</span>
            </button>

            <button
              onClick={() => onNavigate('#/home')}
              className="w-full py-2.5 px-4 rounded-[2px] bg-zinc-950 text-zinc-300 font-mono font-bold text-xs uppercase border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, but not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-zinc-950">
        <div className="max-w-md w-full bg-zinc-900 p-6 sm:p-8 rounded-[5px] border border-rose-500/40 shadow-2xl text-center space-y-5 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="w-14 h-14 rounded-[2px] bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-bold tracking-widest uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Permiso Insuficiente
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
              Acceso Exclusivo de Administrador
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Su cuenta <strong className="text-white font-mono">{currentUser.email}</strong> tiene rol de <strong className="capitalize text-amber-400 font-mono">{role}</strong>. Para acceder a la gestión de inventario y métricas financieras, requiere privilegios de Administrador general.
            </p>
          </div>

          <div className="space-y-2 pt-2 font-sans">
            <button
              onClick={() => onNavigate('#/portal')}
              className="w-full py-3 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Shield className="w-4 h-4" />
              <span>Ir a Mi Portal de {role === 'staff' ? 'Personal Técnico' : 'Cliente'}</span>
            </button>

            <button
              onClick={() => signOut()}
              className="w-full py-2 px-4 rounded-[2px] text-zinc-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              Cerrar Sesión / Cambiar Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingQuotesCount = quotes.filter(q => q.status === 'submitted' || q.status === 'draft').length;
  const machineAlertsCount = alerts.filter(a => a.itemType === 'machine').length;
  const partAlertsCount = alerts.filter(a => a.itemType === 'part').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Top Banner & Navigation Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left Brand & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('#/portal')}
                className="p-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                title="Volver al Portal General"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-black">
                    ADMIN HQ
                  </span>
                  <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white">
                    Dashboard de Administración
                  </h1>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  TMD Dominicana • {currentUser.email}
                </p>
              </div>
            </div>

            {/* Right Quick Controls: Bell Notification, Currency Toggle & Logout */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Monthly Business Variables Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMonthlyConfigOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Gestor de Variables Mensuales, Banners y Tasas"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Variables Mensuales</span>
              </button>

              {/* DGII 606 & 607 Tax Exporter Button */}
              <button
                type="button"
                onClick={() => setIsDgiiExporterOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Exportación Formal DGII Formatos 606 y 607"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">DGII 606/607</span>
              </button>

              {/* Task #71: Sales Kanban Pipeline Trigger */}
              <button
                type="button"
                onClick={() => setIsKanbanOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Embudo de Ventas Kanban & CRM Comercial"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Pipeline CRM</span>
              </button>

              {/* Task #89: Technician Labor Hours Trigger */}
              <button
                type="button"
                onClick={() => setIsLaborHoursOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Control de Horas Hombre, Productividad & Bonos de Taller"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Horas Taller</span>
              </button>

              {/* Firestore Bulk Manager Trigger Button */}
              <button
                onClick={() => setIsBulkManagerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Carga Masiva & Sincronización Firestore"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Carga Masiva</span>
              </button>

              {/* Notification Bell Button */}
              <button
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative p-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors flex items-center justify-center cursor-pointer"
                title={`Centro de Alertas de Stock (${alerts.length} alertas)`}
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-[2px] bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Currency Toggle */}
              <div className="flex items-center bg-zinc-950 border border-zinc-800 p-0.5 rounded-[2px] text-xs font-mono font-bold">
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                    currency === 'USD'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  USD $
                </button>
                <button
                  onClick={() => setCurrency('DOP')}
                  className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                    currency === 'DOP'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  DOP RD$
                </button>
              </div>

              <button
                onClick={() => onNavigate('#/home')}
                className="px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-mono font-bold text-xs uppercase transition-colors"
              >
                Tienda
              </button>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-[2px] text-zinc-400 hover:text-rose-400 hover:bg-zinc-950 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-zinc-800 mt-2.5 scrollbar-none font-mono text-xs">
            <button
              onClick={() => setActiveTab('command_grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'command_grid'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matriz de Control</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-black text-amber-400">
                HQ
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crm_funnel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'crm_funnel'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Embudo CRM (RFQ)</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-emerald-500 text-black animate-pulse">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('patio_km22')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'patio_km22'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Patio Km 22 (Pistas)</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-zinc-950 border border-zinc-700 text-zinc-300">
                Pistas
              </span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Métricas & Ventas</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'quotes'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Presupuestos</span>
              {pendingQuotesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-amber-400 text-black">
                  {pendingQuotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('machines')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'machines'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Maquinaria</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300">
                {machines.length}
              </span>
              {machineAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-amber-400 text-black" title={`${machineAlertsCount} bajo nivel crítico`}>
                  {machineAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('parts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'parts'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Cog className="w-3.5 h-3.5 text-amber-400" />
              <span>Repuestos OEM</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-zinc-950 border border-zinc-800 text-zinc-300">
                {parts.length}
              </span>
              {partAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-rose-500 text-white" title={`${partAlertsCount} bajo nivel crítico`}>
                  {partAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'shop'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Taller Fullbay</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-amber-400/20 text-amber-400">
                Km 22
              </span>
            </button>

            <button
              onClick={() => setActiveTab('demand_heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'demand_heatmap'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Demanda RD</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_log')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'audit_log'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auditoría</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'integrations'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>APIs & Gateways</span>
              <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Live
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Global Inventory Alert Banner */}
        <AdminAlertsBanner
          alerts={alerts}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
          onNavigateToMachines={() => {
            setActiveTab('machines');
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          onNavigateToParts={() => {
            setActiveTab('parts');
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
        />

        {loadingData ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono font-bold text-zinc-400">Cargando registros desde Firestore...</p>
          </div>
        ) : (
          <>
            {/* COMMAND CENTER EXECUTIVE KPI RIBBON */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {/* Card 1: Pipeline de Ventas */}
              <div 
                onClick={() => setActiveTab('quotes')}
                className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl hover:border-amber-400/60 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Pipeline Cotizaciones</span>
                  <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
                  {quotes.length} <span className="text-xs font-normal text-zinc-500 font-sans">({pendingQuotesCount} pendientes)</span>
                </div>
                <p className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">
                  US$ {quotes.reduce((acc, q) => acc + (q.total || 0), 0).toLocaleString()}
                </p>
              </div>

              {/* Card 2: Flota Patio Km 22 */}
              <div 
                onClick={() => setActiveTab('machines')}
                className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl hover:border-amber-400/60 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Flota Patio Km 22</span>
                  <HardHat className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
                  {machines.length} <span className="text-xs font-normal text-zinc-500 font-sans">equipos</span>
                </div>
                <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                  Listo para despacho y prueba
                </p>
              </div>

              {/* Card 3: Stock Repuestos OEM */}
              <div 
                onClick={() => setActiveTab('parts')}
                className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl hover:border-amber-400/60 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Almacén de Repuestos</span>
                  <Cog className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
                  {parts.length} <span className="text-xs font-normal text-zinc-500 font-sans">SKUs</span>
                </div>
                <p className="text-[10px] font-mono font-bold mt-0.5">
                  {partAlertsCount > 0 ? (
                    <span className="text-amber-400">{partAlertsCount} bajo nivel mínimo</span>
                  ) : (
                    <span className="text-emerald-400">Niveles óptimos</span>
                  )}
                </p>
              </div>

              {/* Card 4: Pistas y Operaciones */}
              <div 
                onClick={() => setActiveTab('patio_km22')}
                className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-2xl hover:border-amber-400/60 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Operaciones Km 22</span>
                  <CalendarIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-lg sm:text-xl font-black text-white font-mono mt-1">
                  Patio & Taller
                </div>
                <p className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">
                  Pruebas, Pistas & Bahías
                </p>
              </div>
            </div>

            {activeTab === 'command_grid' && (
              <AdminCommandGrid
                machines={machines}
                parts={parts}
                alerts={alerts}
                currency={currency}
                onNavigateToMachines={() => setActiveTab('machines')}
                onNavigateToParts={() => setActiveTab('parts')}
                onNavigateToEmergency={() => onNavigate('#/emergency-dispatch')}
              />
            )}

            {activeTab === 'crm_funnel' && (
              <AdminCrmFunnelView
                quotes={quotes}
                currency={currency}
                onNavigateToQuotes={() => setActiveTab('quotes')}
              />
            )}

            {activeTab === 'patio_km22' && (
              <div className="pt-2">
                <AdminPatioKm22Manager
                  onNavigateToQuotes={() => setActiveTab('quotes')}
                />
              </div>
            )}

            {activeTab === 'metrics' && (
              <AdminMetricsTab
                quotes={quotes}
                machines={machines}
                parts={parts}
                currency={currency}
                onNavigateToQuotes={() => setActiveTab('quotes')}
                onNavigateToMachines={() => setActiveTab('machines')}
                onNavigateToParts={() => setActiveTab('parts')}
              />
            )}

            {activeTab === 'quotes' && (
              <AdminQuotesTab
                quotes={quotes}
                currency={currency}
              />
            )}

            {activeTab === 'machines' && (
              <AdminMachineryTab
                machines={machines}
                currency={currency}
                highlightMachineId={highlightItemId || undefined}
              />
            )}

            {activeTab === 'parts' && (
              <AdminPartsTab
                parts={parts}
                currency={currency}
                highlightPartId={highlightItemId || undefined}
              />
            )}

            {activeTab === 'shop' && (
              <div className="pt-2">
                <FullbayShopManager />
              </div>
            )}

            {activeTab === 'demand_heatmap' && (
              <div className="pt-2">
                <AdminDemandHeatmap currency={currency} />
              </div>
            )}

            {activeTab === 'audit_log' && (
              <div className="pt-2">
                <AdminSecurityAuditLog />
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="pt-2">
                <AdminIntegrationsHealthView />
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-over Notification Center Modal */}
      <AdminNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        alerts={alerts}
        machines={machines}
        parts={parts}
        onNavigateToMachines={(highlightId?: string) => {
          setActiveTab('machines');
          if (highlightId) setHighlightItemId(highlightId);
          setIsNotificationCenterOpen(false);
          setTimeout(() => {
            if (highlightId) {
              const element = document.getElementById(`machine-${highlightId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }, 250);
        }}
        onNavigateToParts={(highlightId?: string) => {
          setActiveTab('parts');
          if (highlightId) setHighlightItemId(highlightId);
          setIsNotificationCenterOpen(false);
          setTimeout(() => {
            if (highlightId) {
              const element = document.getElementById(`part-${highlightId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }, 250);
        }}
      />

      {/* Firestore Bulk Manager Modal */}
      <FirestoreBulkManagerModal
        isOpen={isBulkManagerOpen}
        onClose={() => setIsBulkManagerOpen(false)}
      />

      {/* Monthly Dynamic Business Config Modal */}
      <MonthlyBusinessConfigModal
        isOpen={isMonthlyConfigOpen}
        onClose={() => setIsMonthlyConfigOpen(false)}
        adminName={currentUser?.displayName || 'Administrador General TMD'}
      />

      {/* DGII 606 & 607 Exporter Modal */}
      <Dgii606_607ExporterModal
        isOpen={isDgiiExporterOpen}
        onClose={() => setIsDgiiExporterOpen(false)}
      />

      {/* Task #71: Sales Kanban Pipeline CRM Modal */}
      <SalesKanbanPipelineModal
        isOpen={isKanbanOpen}
        onClose={() => setIsKanbanOpen(false)}
      />

      {/* Task #89: Technician Labor Hours & Productivity Modal */}
      <TechnicianLaborHoursModal
        isOpen={isLaborHoursOpen}
        onClose={() => setIsLaborHoursOpen(false)}
      />
    </div>
  );
};
