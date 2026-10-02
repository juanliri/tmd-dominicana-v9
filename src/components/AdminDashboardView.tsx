import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Kanban,
  ChevronDown,
  X,
  Sliders
} from 'lucide-react';
import { getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { INITIAL_PORTAL_QUOTES } from '../data/portalSeedData';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PortalQuote, InventoryMachine, InventoryPart, InventoryAlert } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
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

export type AdminTab = 
  | 'command_grid' 
  | 'crm_funnel' 
  | 'patio_km22' 
  | 'metrics' 
  | 'quotes' 
  | 'machines' 
  | 'parts' 
  | 'shop' 
  | 'demand_heatmap' 
  | 'audit_log' 
  | 'integrations';

export interface AdminDashboardViewProps {
  onNavigate: (route: string) => void;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  isEmbedded?: boolean;
  quotes?: PortalQuote[];
  onUpdateQuoteStatus?: (quoteId: string, status: PortalQuote['status']) => Promise<void>;
  onDeleteQuote?: (quoteId: string) => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ 
  onNavigate,
  activeTab: activeTabProp,
  onTabChange,
  isEmbedded = false,
  quotes: quotesProp,
  onUpdateQuoteStatus: onUpdateQuoteStatusProp,
  onDeleteQuote: onDeleteQuoteProp
}) => {
  const { currentUser, userProfile, isAdmin, role, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { currency, setCurrency } = useCart();

  const [internalActiveTab, setInternalActiveTab] = useState<AdminTab>(activeTabProp || 'command_grid');

  useEffect(() => {
    if (activeTabProp !== undefined) {
      setInternalActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  const activeTab = activeTabProp !== undefined ? activeTabProp : internalActiveTab;
  const setActiveTab = (tab: AdminTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [internalQuotes, setInternalQuotes] = useState<PortalQuote[]>(quotesProp || []);
  const quotes = quotesProp !== undefined && quotesProp.length > 0 ? quotesProp : internalQuotes;
  const setQuotes = (val: React.SetStateAction<PortalQuote[]>) => {
    setInternalQuotes(val);
  };

  useEffect(() => {
    if (quotesProp !== undefined && quotesProp.length > 0) {
      setInternalQuotes(quotesProp);
    }
  }, [quotesProp]);

  const handleUpdateQuoteStatus = async (quoteId: string, status: PortalQuote['status']) => {
    if (onUpdateQuoteStatusProp) {
      await onUpdateQuoteStatusProp(quoteId, status);
    }
    setInternalQuotes(prev => {
      const updated = prev.map(q => q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q);
      try { localStorage.setItem('tmd_portal_quotes', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (isSupabaseConfigured) {
      try {
        await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', quoteId);
      } catch (err) {
        console.warn('Supabase quote status update notice:', err);
      }
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (onDeleteQuoteProp) {
      await onDeleteQuoteProp(quoteId);
    }
    setInternalQuotes(prev => {
      const updated = prev.filter(q => q.id !== quoteId);
      try { localStorage.setItem('tmd_portal_quotes', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (isSupabaseConfigured) {
      try {
        await supabase.from('quotes').delete().eq('id', quoteId);
      } catch (err) {
        console.warn('Supabase quote delete notice:', err);
      }
    }
  };
  const [machines, setMachines] = useState<InventoryMachine[]>([]);
  const [parts, setParts] = useState<InventoryPart[]>([]);

  const handleUpdateMachine = (updatedMachine: InventoryMachine) => {
    setMachines(prev => {
      const idx = prev.findIndex(m => m.id === updatedMachine.id);
      const next = idx >= 0 ? prev.map(m => m.id === updatedMachine.id ? updatedMachine : m) : [updatedMachine, ...prev];
      try { localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleDeleteMachine = (machineId: string) => {
    setMachines(prev => {
      const next = prev.filter(m => m.id !== machineId);
      try { localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleUpdatePart = (updatedPart: InventoryPart) => {
    setParts(prev => {
      const idx = prev.findIndex(p => p.id === updatedPart.id);
      const next = idx >= 0 ? prev.map(p => p.id === updatedPart.id ? updatedPart : p) : [updatedPart, ...prev];
      try { localStorage.setItem('tmd_catalog_parts_custom', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const handleDeletePart = (partId: string) => {
    setParts(prev => {
      const next = prev.filter(p => p.id !== partId);
      try { localStorage.setItem('tmd_catalog_parts_custom', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };
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
  const [isExecutiveToolsOpen, setIsExecutiveToolsOpen] = useState(false);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown on click outside or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsExecutiveToolsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExecutiveToolsOpen(false);
    };
    if (isExecutiveToolsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isExecutiveToolsOpen]);

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
                year: Number(m.year || 2024),
                basePriceUsd: Number(m.base_price_usd || m.price_usd || 0),
                inStock: m.in_stock ?? true,
                stockQty: m.stock_qty ?? 1,
                minStockAlert: m.min_stock_alert ?? 1,
                location: m.location || 'Patio Km 22, Autopista Duarte',
                image: m.primary_image_url || m.image || '/assets/machinery/heavy_22_ton_liugong_922e_tracked.jpg',
                status: (m.status || 'available') as any,
                updatedAt: m.updated_at || new Date().toISOString()
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
              modelCode: m.modelCode || m.id,
              serialNumber: `VIN-${m.id.toUpperCase()}-2026`,
              year: m.year || 2024,
              basePriceUsd: m.basePriceUsd || 0,
              inStock: m.inStock,
              stockQty: 4,
              minStockAlert: 1,
              location: 'Patio Km 22, Autopista Duarte',
              image: m.image,
              status: 'available' as const,
              updatedAt: new Date().toISOString()
            }));
          }
          try {
            const customMachines = localStorage.getItem('tmd_catalog_machines_custom');
            if (customMachines) {
              const parsed: InventoryMachine[] = JSON.parse(customMachines);
              const customMap = new Map(parsed.map(m => [m.id, m]));
              fetchedMachines = [
                ...parsed,
                ...fetchedMachines.filter(m => !customMap.has(m.id))
              ];
            }
          } catch (e) {}
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
                stockQty: p.stock_qty ?? 6,
                minStockAlert: p.min_stock_alert ?? 2,
                locationBin: p.location || p.location_bin || 'Almacén Central Km 22',
                image: p.image_url || p.image || '/assets/machinery/brand_new_genuine_yellow_and_black.jpg',
                isOem: p.is_oem ?? true,
                compatibleModels: p.compatible_models || [],
                updatedAt: p.updated_at || new Date().toISOString()
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
              stockQty: p.stockQty ?? 8,
              minStockAlert: 2,
              locationBin: 'Almacén Central Km 22',
              image: p.image,
              isOem: p.isOem ?? true,
              compatibleModels: p.compatibleModels || [],
              updatedAt: new Date().toISOString()
            }));
          }
          try {
            const customParts = localStorage.getItem('tmd_catalog_parts_custom');
            if (customParts) {
              const parsed: InventoryPart[] = JSON.parse(customParts);
              const customMap = new Map(parsed.map(p => [p.id, p]));
              fetchedParts = [
                ...parsed,
                ...fetchedParts.filter(p => !customMap.has(p.id))
              ];
            }
          } catch (e) {}
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

  const renderNavTabs = () => (
    <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-slate-200 dark:border-zinc-800 scrollbar-none font-mono text-xs">
      <button
        type="button"
        onClick={() => setActiveTab('command_grid')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('crm_funnel')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('patio_km22')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('metrics')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
          activeTab === 'metrics'
            ? 'bg-amber-400 text-black font-mono shadow-xs'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        }`}
      >
        <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
        <span>Métricas & Ventas</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('quotes')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('machines')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('parts')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('shop')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
        type="button"
        onClick={() => setActiveTab('demand_heatmap')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
          activeTab === 'demand_heatmap'
            ? 'bg-amber-400 text-black font-mono shadow-xs'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        }`}
      >
        <Flame className="w-3.5 h-3.5 text-rose-500" />
        <span>Demanda RD</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('audit_log')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
          activeTab === 'audit_log'
            ? 'bg-amber-400 text-black font-mono shadow-xs'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        }`}
      >
        <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
        <span>Auditoría</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('integrations')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
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
  );

  return (
    <div className={`w-full ${isEmbedded ? 'space-y-4' : 'min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20'}`}>
      {/* Top Banner or ERP Command Bar */}
      {isEmbedded ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[5px] p-3.5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Identity & Status */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-[2px] text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400 text-black shadow-xs">
                DIRECCIÓN GENERAL HQ
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-200 font-bold">Consola ERP Unificada</span>
                <span className="text-zinc-500 hidden md:inline">· Km 22 Autopista Duarte</span>
              </div>
            </div>

            {/* Right Action Controls: Executive Tools Dropdown & Stock Alerts */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Executive Tools Dropdown */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExecutiveToolsOpen(!isExecutiveToolsOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Abrir menú de herramientas fiscales, comerciales y de infraestructura"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Herramientas ERP</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExecutiveToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Tools Menu Popover */}
                {isExecutiveToolsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[540px] bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 font-sans">
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-black uppercase text-white font-mono">
                          Herramientas Ejecutivas ERP
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsExecutiveToolsOpen(false)}
                        className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                      {/* Quadrant 1: Fiscal & Finanzas */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                          Fiscal & Finanzas DGII
                        </span>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsDgiiExporterOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">DGII 606 & 607</div>
                            <div className="text-[10px] text-zinc-400">Exportación Fiscal NCF</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsMonthlyConfigOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Variables Mensuales</div>
                            <div className="text-[10px] text-zinc-400">Tasas DOP/USD & Banners</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsExecutiveReportOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Reporte Ejecutivo CFO</div>
                            <div className="text-[10px] text-zinc-400">Informe Dirección General</div>
                          </div>
                        </button>
                      </div>

                      {/* Quadrant 2: Comercial & CRM */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                          Comercial & CRM
                        </span>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsKanbanOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <Kanban className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Pipeline Kanban</div>
                            <div className="text-[10px] text-zinc-400">Embudo de Ventas RFQ</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsCallLogOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-sky-400 transition-colors">Bitácora CRM</div>
                            <div className="text-[10px] text-zinc-400">Llamadas & Visitas Obra</div>
                          </div>
                        </button>
                      </div>

                      {/* Quadrant 3: Operaciones Km 22 */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                          Operaciones Sede Km 22
                        </span>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsLaborHoursOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">Horas Hombre Taller</div>
                            <div className="text-[10px] text-zinc-400">Productividad & Bonos</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsGatePassOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Pases de Garita QR</div>
                            <div className="text-[10px] text-zinc-400">Control de Entrada/Salida</div>
                          </div>
                        </button>
                      </div>

                      {/* Quadrant 4: Gobernanza & Cloud */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                          Gobernanza & Cloud
                        </span>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsBulkManagerOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <Database className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors">Carga Masiva Supabase</div>
                            <div className="text-[10px] text-zinc-400">Catálogo & Sincronización</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsExecutiveToolsOpen(false); setIsGlacierBackupOpen(true); }}
                          className="w-full text-left p-2 rounded bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 flex items-center gap-2 group transition-all cursor-pointer"
                        >
                          <HardDrive className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">S3 Glacier Backup</div>
                            <div className="text-[10px] text-zinc-400">Backups AES-256 (7 Años)</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Stock Alerts Button */}
              <button
                type="button"
                onClick={() => setIsNotificationCenterOpen(true)}
                className="relative p-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                title={`Centro de Alertas de Stock (${alerts.length} alertas)`}
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-[2px] bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          {renderNavTabs()}
        </div>
      ) : (
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
              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsMonthlyConfigOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Gestor de Variables Mensuales, Banners y Tasas"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Variables Mensuales</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDgiiExporterOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Exportación Formal DGII Formatos 606 y 607"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">DGII 606/607</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsKanbanOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Embudo de Ventas Kanban & CRM Comercial"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Pipeline CRM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLaborHoursOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Control de Horas Hombre, Productividad & Bonos de Taller"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Horas Taller</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGatePassOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Pase de Puerta Digital con QR para Garita de Salida Km 22"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Pase Garita</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCallLogOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-sky-400/40 text-sky-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Bitácora CRM de Llamadas y Visitas al Patio Km 22"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Bitácora CRM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExecutiveReportOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Informe Ejecutivo Mensual Automatizado para Dirección General"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Reporte CFO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGlacierBackupOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Backups en Frío Semanales en Amazon S3 Glacier (AES-256 / Retención 7 Años)"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden lg:inline">S3 Glacier</span>
                </button>

                <button
                  onClick={() => setIsBulkManagerOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-xs"
                  title="Carga Masiva & Sincronización Supabase Cloud"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Carga Masiva</span>
                </button>

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

            {/* Standalone Navigation Tabs */}
            {renderNavTabs()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`w-full ${isEmbedded ? '' : 'max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-5'}`}>
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
                onUpdateStatus={handleUpdateQuoteStatus}
                onDeleteQuote={handleDeleteQuote}
              />
            )}

            {activeTab === 'machines' && (
              <AdminMachineryTab
                machines={machines}
                currency={currency}
                highlightMachineId={highlightItemId || undefined}
                onUpdateMachine={handleUpdateMachine}
                onDeleteMachine={handleDeleteMachine}
              />
            )}

            {activeTab === 'parts' && (
              <AdminPartsTab
                parts={parts}
                currency={currency}
                highlightPartId={highlightItemId || undefined}
                onUpdatePart={handleUpdatePart}
                onDeletePart={handleDeletePart}
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
