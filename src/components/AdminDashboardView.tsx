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
import { getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { INITIAL_PORTAL_QUOTES } from '../data/portalSeedData';
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
import { PatioGatePassModal } from './security/PatioGatePassModal';
import { CustomerCallLogCrmModal } from './crm/CustomerCallLogCrmModal';
import { MonthlyExecutiveReportModal } from './admin/MonthlyExecutiveReportModal';
import { S3GlacierBackupModal } from './security/S3GlacierBackupModal';
import { LayoutGrid, Sparkles, Flame, ShieldCheck as ShieldCheckIcon, TrendingUp, Calendar as CalendarIcon, Activity as ActivityIcon, Settings, PhoneCall, HardDrive } from 'lucide-react';

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
  const [isGatePassOpen, setIsGatePassOpen] = useState(false);
  const [isCallLogOpen, setIsCallLogOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);
  const [isGlacierBackupOpen, setIsGlacierBackupOpen] = useState(false);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  // Supabase Real-Time & Resilient Data Sync (Vercel + Supabase Master Architecture)
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setLoadingData(false);
      return;
    }

    let isMounted = true;
    setLoadingData(true);

    const syncAdminData = async () => {
      try {
        // Safety timeout so user NEVER gets stuck on spinner (max 400ms)
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 400));

        const dataPromise = (async () => {
          // 1. Quotes Sync (Supabase -> Seed fallback)
          let fetchedQuotes: PortalQuote[] = [];
          try {
            const { data, error } = await supabase
              .from('quotes')
              .select('*')
              .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
              fetchedQuotes = data.map((q: any) => ({
                id: q.id,
                quoteNumber: q.quote_number || `QT-2026-${q.id.substring(0, 4)}`,
                clientId: q.user_id || 'usr-anon',
                clientEmail: q.customer_email || 'ventas@constructoratavares.rd',
                clientName: q.customer_name || 'Cliente Corporativo TMD',
                companyName: q.company || 'Constructora Nacional',
                rnc: q.customer_rnc || '1-01-85732-1',
                phone: q.customer_phone || '+1 (809) 560-1234',
                status: q.status || 'submitted',
                currency: q.currency || 'USD',
                subtotal: Number(q.subtotal || 0),
                itbis: Number(q.itbis_amount || 0),
                total: Number(q.total_amount || 0),
                itemsCount: Array.isArray(q.items) ? q.items.length : 1,
                itemsSummary: q.items_summary || (Array.isArray(q.items) && q.items[0]?.name) || 'Equipos de Alto Rendimiento',
                notes: q.notes,
                createdAt: q.created_at || new Date().toISOString(),
                updatedAt: q.updated_at || new Date().toISOString()
              }));
            }
          } catch (e) {
            console.warn('Supabase quotes sync fallback:', e);
          }

          if (fetchedQuotes.length === 0) {
            fetchedQuotes = INITIAL_PORTAL_QUOTES;
          }
          if (isMounted) setQuotes(fetchedQuotes);

          // 2. Machinery Sync (Supabase -> Unified Store Machinery)
          let fetchedMachines: InventoryMachine[] = [];
          try {
            const { data, error } = await supabase.from('machinery').select('*');
            if (!error && data && data.length > 0) {
              fetchedMachines = data.map((m: any) => ({
                id: m.id,
                name: m.name,
                brand: m.brand,
                category: m.category,
                modelCode: m.model_code || m.sku || m.id,
                serialNumber: m.serial_number || `VIN-${m.id.toUpperCase()}`,
                priceUsd: Number(m.price_usd || 0),
                inStock: m.in_stock ?? true,
                stockQty: m.stock_qty ?? 1,
                minStockAlert: m.min_stock_alert ?? 1,
                location: m.location || 'Patio Km 22, Autopista Duarte',
                image: m.primary_image_url || m.image || '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
                specs: m.specs || {},
                status: m.status || 'available'
              }));
            }
          } catch (e) {
            console.warn('Supabase machinery sync fallback:', e);
          }

          if (fetchedMachines.length === 0) {
            const localMachinery = await getUnifiedStoreMachinery();
            fetchedMachines = localMachinery.map((m) => ({
              id: m.id,
              name: m.name,
              brand: m.brand,
              category: m.category,
              modelCode: m.model,
              serialNumber: `VIN-${m.id.toUpperCase()}-2026`,
              priceUsd: m.priceUsd,
              priceDop: m.priceDop,
              inStock: m.inStock,
              stockQty: m.stockQty ?? 4,
              minStockAlert: 1,
              location: 'Patio Km 22, Autopista Duarte',
              image: m.primaryImage,
              specs: m.specs || {},
              status: 'available'
            }));
          }
          if (isMounted) setMachines(fetchedMachines);

          // 3. Parts Sync (Supabase -> Unified Store Parts)
          let fetchedParts: InventoryPart[] = [];
          try {
            const { data, error } = await supabase.from('parts').select('*');
            if (!error && data && data.length > 0) {
              fetchedParts = data.map((p: any) => ({
                id: p.id,
                partNumber: p.part_number || p.sku || p.id,
                name: p.name,
                brand: p.brand,
                category: p.category,
                priceUsd: Number(p.price_usd || 0),
                inStock: p.in_stock ?? true,
                stockQty: p.stock_qty ?? 6,
                minStockAlert: p.min_stock_alert ?? 2,
                location: p.location || 'Almacén Central Km 22',
                image: p.image_url || p.image || '/assets/machinery/brand_new_genuine_yellow_and_black.jpg',
                compatibleModels: p.compatible_models || []
              }));
            }
          } catch (e) {
            console.warn('Supabase parts sync fallback:', e);
          }

          if (fetchedParts.length === 0) {
            const localParts = await getUnifiedStoreParts();
            fetchedParts = localParts.map((p) => ({
              id: p.id,
              partNumber: p.partNumber,
              name: p.name,
              brand: p.brand,
              category: p.category,
              priceUsd: p.priceUsd,
              priceDop: p.priceDop,
              inStock: p.inStock,
              stockQty: p.stockQty ?? 8,
              minStockAlert: 2,
              location: 'Almacén Central Km 22',
              image: p.image,
              compatibleModels: p.compatibleMachines || []
            }));
          }
          if (isMounted) setParts(fetchedParts);
        })();

        await Promise.race([dataPromise, timeoutPromise]);
      } catch (err) {
        console.error('Admin sync error:', err);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    syncAdminData();

    // Setup Supabase Realtime channel for live database events
    const channel = supabase
      .channel('admin-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
        syncAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machinery' }, () => {
        syncAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, () => {
        syncAdminData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20">
      {/* Top Banner & Navigation Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm dark:shadow-2xl">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left Brand & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('#/portal')}
                className="p-2 rounded-[2px] bg-slate-100 dark:bg-zinc-950 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-800 transition-colors cursor-pointer"
                title="Volver al Portal General"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-black">
                    ADMIN HQ
                  </span>
                  <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Dashboard de Administración
                  </h1>
                </div>
                <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
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

              {/* Task #84: Gate Pass Security Ticket Trigger */}
              <button
                type="button"
                onClick={() => setIsGatePassOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Pase de Puerta Digital con QR para Garita de Salida Km 22"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Pase Garita</span>
              </button>

              {/* Task #79: Customer Call Log CRM Trigger */}
              <button
                type="button"
                onClick={() => setIsCallLogOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-sky-400/40 text-sky-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Bitácora CRM de Llamadas y Visitas al Patio Km 22"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Bitácora CRM</span>
              </button>

              {/* Task #80: Monthly Executive Report Trigger */}
              <button
                type="button"
                onClick={() => setIsExecutiveReportOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Informe Ejecutivo Mensual Automatizado para Dirección General"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Reporte CFO</span>
              </button>

              {/* Task #56: S3 Glacier Cold Storage Backup Trigger */}
              <button
                type="button"
                onClick={() => setIsGlacierBackupOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Backups en Frío Semanales en Amazon S3 Glacier (AES-256 / Retención 7 Años)"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">S3 Glacier</span>
              </button>

              {/* Supabase / Master Catalog Bulk Manager Trigger Button */}
              <button
                onClick={() => setIsBulkManagerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                title="Carga Masiva & Sincronización Supabase Cloud"
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
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-200 dark:border-zinc-800 mt-2.5 scrollbar-none font-mono text-xs">
            <button
              onClick={() => setActiveTab('command_grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap ${
                activeTab === 'command_grid'
                  ? 'bg-amber-400 text-black font-mono shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
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
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-5">
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
            <p className="text-xs font-mono font-bold text-zinc-400">Sincronizando consola con Supabase & Vercel Edge...</p>
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

      {/* Task #84: Gate Pass Security Ticket Modal */}
      <PatioGatePassModal
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
      />

      {/* Task #79: Customer Call Log CRM Modal */}
      <CustomerCallLogCrmModal
        isOpen={isCallLogOpen}
        onClose={() => setIsCallLogOpen(false)}
      />

      {/* Task #80: Monthly Executive Report Modal */}
      <MonthlyExecutiveReportModal
        isOpen={isExecutiveReportOpen}
        onClose={() => setIsExecutiveReportOpen(false)}
      />

      {/* Task #56: S3 Glacier Cold Storage Backup Modal */}
      <S3GlacierBackupModal
        isOpen={isGlacierBackupOpen}
        onClose={() => setIsGlacierBackupOpen(false)}
      />
    </div>
  );
};
