import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  Zap, 
  Briefcase, 
  FileText, 
  Wrench, 
  Package, 
  Radio, 
  Activity, 
  Users, 
  Building, 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  RotateCcw, 
  MessageSquare, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  Check,
  X,
  HardHat,
  Sliders,
  LogOut,
  Sparkles,
  Phone,
  Fingerprint,
  QrCode,
  BookOpen
} from 'lucide-react';
import { PortalQuote, ServiceWorkOrder, UserProfile, UserRole, Currency, CartItem } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { TMDLogo } from '../common/BrandLogos';
import { IndustrialSectionDivider } from '../common/IndustrialSectionDivider';
import { StaffCommandCenterPanel } from './StaffCommandCenterPanel';
import { OfficeWorkflowModule } from './OfficeWorkflowModule';
import { StaffQuickActionSidebar } from './StaffQuickActionSidebar';
import { CustomerOrdersTab } from './CustomerOrdersTab';
import { ServiceHistoryTab } from './ServiceHistoryTab';
import { LiveLinkCustomerTelematicsTab } from './LiveLinkCustomerTelematicsTab';
import { FullbayShopManager } from '../shop/FullbayShopManager';
import { LiveLinkTelematicsDashboard } from '../telematics/LiveLinkTelematicsDashboard';
import { StaffBiometricAuthModal } from '../auth/StaffBiometricAuthModal';
import { getQuoteWhatsAppUrl, getWorkOrderDispatchWhatsAppUrl } from '../../utils/whatsappMessaging';
import { getLocalFleet } from '../../services/serviceHistoryService';
import { InventoryScanLogsPanel } from './InventoryScanLogsPanel';
import { TechnicalDocumentationVaultTab } from './TechnicalDocumentationVaultTab';

export type StaffPortalTab = 
  | 'command_center' 
  | 'office_workflow' 
  | 'quotes' 
  | 'orders' 
  | 'purchases' 
  | 'livelink_telematics' 
  | 'service_history' 
  | 'inventory_logs'
  | 'tech_docs'
  | 'users' 
  | 'profile';

interface StaffCommandCenterProps {
  currentUser: User;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  quotes: PortalQuote[];
  workOrders: ServiceWorkOrder[];
  allUsers: UserProfile[];
  currency: Currency;
  onNavigate: (route: string) => void;
  onOpenCreateQuote: () => void;
  onOpenNewOrderModal: () => void;
  onExportQuotePdf: (quote: PortalQuote) => void;
  onUpdateOrderStatus: (orderId: string, status: ServiceWorkOrder['status']) => Promise<void>;
  onUpdateQuoteStatus: (quoteId: string, status: PortalQuote['status']) => Promise<void>;
  onUpdateUserRole?: (userId: string, newRole: UserRole) => Promise<void>;
  onUpdateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => Promise<void>;
  addToCart?: (item: any) => void;
  onOpenQrScanner?: () => void;
  activeTab?: StaffPortalTab;
  onTabChange?: (tab: StaffPortalTab) => void;
}

export const StaffCommandCenter: React.FC<StaffCommandCenterProps> = ({
  currentUser,
  userProfile,
  role,
  isAdmin,
  isStaff,
  simulatedRole,
  setSimulatedRole,
  quotes,
  workOrders,
  allUsers,
  currency,
  onNavigate,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onExportQuotePdf,
  onUpdateOrderStatus,
  onUpdateQuoteStatus,
  onUpdateUserRole,
  onUpdateProfileDetails,
  onSignOut,
  addToCart,
  onOpenQrScanner,
  activeTab: activeTabProp,
  onTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<StaffPortalTab>(activeTabProp || 'command_center');

  useEffect(() => {
    if (activeTabProp !== undefined) {
      setInternalActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  const activeTab = activeTabProp !== undefined ? activeTabProp : internalActiveTab;
  const setActiveTab = (tab: StaffPortalTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [activeWorkflowSection, setActiveWorkflowSection] = useState<string>('ncf_invoicing');
  
  // High-density filter states
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all');
  const [workOrderSearch, setWorkOrderSearch] = useState('');
  const [workOrderStatusFilter, setWorkOrderStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  // View mode toggles for Fullbay & LiveLink
  const [orderViewMode, setOrderViewMode] = useState<'fullbay_hd' | 'quick_table'>('fullbay_hd');
  const [telematicsViewMode, setTelematicsViewMode] = useState<'command_center' | 'customer_fleet'>('command_center');
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  
  const portalWorkspaceRef = useRef<HTMLDivElement>(null);

  const handleTabSelect = (tab: StaffPortalTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      portalWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleSelectWorkflowSection = (section: string) => {
    if (section === 'inventory_logs') {
      setActiveTab('inventory_logs');
    } else {
      setActiveWorkflowSection(section);
      setActiveTab('office_workflow');
    }
    setTimeout(() => {
      portalWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Live calculation metrics
  const totalPipelineUsd = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const pendingQuotes = quotes.filter(q => q.status === 'submitted' || q.status === 'in_review' || q.status === 'draft');
  const activeWorkOrders = workOrders.filter(w => w.status === 'in_progress' || w.status === 'scheduled' || w.status === 'requested');
  const urgentWorkOrders = workOrders.filter(w => w.priority === 'emergency' || w.priority === 'urgent');
  const fleet = getLocalFleet();

  const formatPrice = (usdAmount: number) => {
    if (currency === 'DOP') {
      return `RD$ ${(usdAmount * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `US$ ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.quoteNumber?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.clientName?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.clientEmail?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.itemsSummary?.toLowerCase().includes(quoteSearch.toLowerCase());
    const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWorkOrders = workOrders.filter(w => {
    const matchesSearch = 
      w.orderNumber?.toLowerCase().includes(workOrderSearch.toLowerCase()) ||
      w.clientName?.toLowerCase().includes(workOrderSearch.toLowerCase()) ||
      w.machineModel?.toLowerCase().includes(workOrderSearch.toLowerCase()) ||
      w.description?.toLowerCase().includes(workOrderSearch.toLowerCase());
    const matchesStatus = workOrderStatusFilter === 'all' || w.status === workOrderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = allUsers.filter(u => 
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.rnc?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-sans">
      {/* HIGH-DENSITY COMMERCIAL STAFF BAR */}
      <div className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 px-2 rounded-[3px] bg-black/60 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
            <TMDLogo variant="icon-only" className="h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-tight">
                {userProfile?.displayName || 'Personal Operativo'}
              </h2>
              <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-purple-500 text-white shadow-xs' 
                  : 'bg-amber-400 text-black shadow-xs'
              }`}>
                {isAdmin ? 'ADMINISTRADOR TMD' : 'TÉCNICO & VENTAS STAFF'}
              </span>
              <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-zinc-950 text-amber-400 border border-zinc-800">
                PATIO KM 22 • OPERACIONES
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
          </div>
        </div>

        {/* Staff Quick Switcher & Actions */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap relative z-10 w-full md:w-auto justify-between md:justify-end">
          {/* Role switcher for testing - only in dev or for real admins */}
          {(isAdmin || import.meta.env.DEV) && (
            <div className="flex items-center gap-0.5 p-0.5 bg-zinc-950 rounded-[3px] border border-zinc-800 shadow-inner">
              <span className="text-[10px] text-zinc-500 font-bold px-1 hidden sm:inline uppercase">ROL:</span>
              <button
                type="button"
                onClick={() => setSimulatedRole(null)}
                className={`px-2 py-1 rounded-[2px] text-[10px] font-bold transition-all cursor-pointer uppercase ${
                  !simulatedRole ? 'bg-amber-400 text-black shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                REAL
              </button>
              <button
                type="button"
                onClick={() => setSimulatedRole('client')}
                className={`px-2 py-1 rounded-[2px] text-[10px] font-bold transition-all cursor-pointer uppercase ${
                  simulatedRole === 'client' ? 'bg-blue-500 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                CLIENTE
              </button>
              <button
                type="button"
                onClick={() => setSimulatedRole('admin')}
                className={`px-2 py-1 rounded-[2px] text-[10px] font-bold transition-all cursor-pointer uppercase ${
                  simulatedRole === 'admin' ? 'bg-purple-500 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ADMIN
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowBiometricModal(true)}
              className="px-3 py-2 rounded bg-zinc-950 border border-zinc-700 hover:border-zinc-500 text-amber-400 hover:bg-zinc-800 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer uppercase"
              title="Gestionar Llaves Biométricas WebAuthn / FIDO2"
            >
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">BIOMETRÍA</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateQuote}
              className="px-3.5 py-2 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer uppercase"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ PROFORMA</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="p-2 rounded bg-zinc-800 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT DENSITY OPERATIONAL KPI BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div 
          onClick={() => handleTabSelect('quotes')}
          className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>PIPELINE PROFORMAS</span>
            <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
            {formatPrice(totalPipelineUsd)}
          </div>
          <span className="text-[10px] text-amber-400 font-semibold uppercase">
            {pendingQuotes.length} PENDIENTES DE CIERRE
          </span>
        </div>

        <div 
          onClick={() => handleTabSelect('orders')}
          className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>ÓRDENES DE SERVICIO</span>
            <Wrench className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
            {activeWorkOrders.length} <span className="text-xs font-normal text-zinc-500 uppercase">EN TALLER</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase">
            {urgentWorkOrders.length > 0 ? `${urgentWorkOrders.length} PRIORIDAD ALTA` : 'FLUJO NORMAL DESPACHO'}
          </span>
        </div>

        <div 
          onClick={() => handleTabSelect('livelink_telematics')}
          className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
            <span>TELEMETRÍA DE FLOTA</span>
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1">
            {fleet.length} <span className="text-xs font-normal text-zinc-500 uppercase">UNIDADES</span>
          </div>
          <span className="text-[10px] text-blue-400 font-semibold uppercase">
            GPS LIVELINK™ ACTIVO
          </span>
        </div>

        <div 
          onClick={() => handleTabSelect('office_workflow')}
          className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold uppercase">
            <span>OPERACIONES & DGII</span>
            <Briefcase className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono mt-1 uppercase">
            MÓDULO ACTIVO
          </div>
          <span className="text-[10px] text-amber-400 font-semibold uppercase">
            PASES KM 22 • FACTURACIÓN NCF
          </span>
        </div>
      </div>

      {/* DENSE STAFF NAVIGATION BAR (PILL DOCK) */}
      <div className="relative z-20 bg-zinc-900/95 backdrop-blur-md py-1.5 px-2 rounded-[5px] border border-zinc-800 shadow-md flex items-center gap-1.5 overflow-x-auto scrollbar-none transition-all">
        <button
          type="button"
          onClick={() => handleTabSelect('command_center')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'command_center'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>HQ</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('office_workflow')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'office_workflow'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>OFICINA</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('quotes')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'quotes'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>COTIZACIONES ({quotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('orders')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'orders'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>TALLER ({workOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('purchases')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'purchases'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>PEDIDOS</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('livelink_telematics')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'livelink_telematics'
              ? 'bg-emerald-500 text-black shadow-xs font-black'
              : 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>LIVELINK™</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('service_history')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'service_history'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>TÉCNICO</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('inventory_logs')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'inventory_logs'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>ESCANEOS QR</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('tech_docs')}
          className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeTab === 'tech_docs'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>FICHAS & CATÁLOGOS PDF</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleTabSelect('users')}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
              activeTab === 'users'
                ? 'bg-purple-500 text-white shadow-xs font-black'
                : 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>USUARIOS & ROLES ({allUsers.length})</span>
          </button>
        )}
      </div>

      {/* SPLIT OPERATIONAL WORKSPACE WITH QUICK ACTION SIDEBAR */}
      <div className="flex flex-col xl:flex-row items-start gap-4">
        <div ref={portalWorkspaceRef} className="flex-1 w-full min-w-0 scroll-mt-32 space-y-4">
          {/* TAB 1: COMMAND CENTER HQ */}
          {activeTab === 'command_center' && (
            <StaffCommandCenterPanel
              quotes={quotes}
              workOrders={workOrders}
              allUsers={allUsers}
              currency={currency}
              onOpenCreateQuote={onOpenCreateQuote}
              onSelectWorkflowSection={handleSelectWorkflowSection}
              onNavigate={onNavigate}
              onExportQuotePdf={onExportQuotePdf}
              onOpenQrScanner={onOpenQrScanner}
            />
          )}

          {/* TAB 2: OFFICE WORKFLOW */}
          {activeTab === 'office_workflow' && (
            <OfficeWorkflowModule
              quotes={quotes}
              workOrders={workOrders}
              allUsers={allUsers}
              currency={currency}
              initialSection={activeWorkflowSection as any}
              onOpenCreateQuote={onOpenCreateQuote}
              onUpdateQuoteStatus={onUpdateQuoteStatus}
              onUpdateWorkOrderStatus={onUpdateOrderStatus}
              onExportQuotePdf={onExportQuotePdf}
              onNavigate={onNavigate}
              onAddToCart={addToCart}
            />
          )}

          {/* TAB 3: QUOTES MANAGEMENT */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-[5px] border border-zinc-800 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Filtrar por cliente, email o proforma..."
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={quoteStatusFilter}
                    onChange={(e) => setQuoteStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white uppercase focus:border-amber-400"
                  >
                    <option value="all">TODOS LOS ESTADOS</option>
                    <option value="submitted">PENDIENTES</option>
                    <option value="in_review">EN REVISIÓN</option>
                    <option value="approved">APROBADAS</option>
                    <option value="rejected">RECHAZADAS</option>
                  </select>

                  <button
                    type="button"
                    onClick={onOpenCreateQuote}
                    className="px-3.5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 shadow-sm uppercase cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>NUEVA PROFORMA</span>
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">PROFORMA #</th>
                        <th className="p-3">CLIENTE / EMPRESA</th>
                        <th className="p-3">EQUIPOS & DETALLE</th>
                        <th className="p-3">TOTAL</th>
                        <th className="p-3">ESTADO</th>
                        <th className="p-3 text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-medium">
                      {filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-400">
                            {q.quoteNumber || 'TMD-COT'}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-white uppercase">{q.clientName || 'Cliente'}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{q.clientEmail}</div>
                          </td>
                          <td className="p-3 max-w-xs truncate text-zinc-300 uppercase">
                            {q.itemsSummary || 'Maquinaria / Repuestos'}
                          </td>
                          <td className="p-3 font-mono font-bold text-white">
                            {formatPrice(q.total || 0)}
                          </td>
                          <td className="p-3">
                            <select
                              value={q.status}
                              onChange={(e) => onUpdateQuoteStatus(q.id, e.target.value as any)}
                              className="px-2 py-1 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-white uppercase"
                            >
                              <option value="draft">BORRADOR</option>
                              <option value="submitted">ENVIADA</option>
                              <option value="in_review">EN REVISIÓN</option>
                              <option value="approved">APROBADA</option>
                              <option value="rejected">RECHAZADA</option>
                            </select>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onExportQuotePdf(q)}
                              className="p-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                              title="Exportar PDF DGII"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={getQuoteWhatsAppUrl(q)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1.5 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                              title="Enviar por WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WORK ORDERS / FULLBAY DISPATCH */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-[3px] border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('fullbay_hd')}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                      orderViewMode === 'fullbay_hd'
                        ? 'bg-amber-400 text-black shadow-xs font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    FULLBAY HD TALLER (6 BAHÍAS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('quick_table')}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                      orderViewMode === 'quick_table'
                        ? 'bg-amber-400 text-black shadow-xs font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    TABLA RESUMEN ({workOrders.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenNewOrderModal}
                  className="px-3.5 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs uppercase"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NUEVA ORDEN EXPRESS</span>
                </button>
              </div>

              {orderViewMode === 'fullbay_hd' ? (
                <FullbayShopManager 
                  onNavigateToLiveLink={() => handleTabSelect('livelink_telematics')}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-[5px] border border-zinc-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Buscar por orden, cliente o modelo..."
                        value={workOrderSearch}
                        onChange={(e) => setWorkOrderSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={workOrderStatusFilter}
                        onChange={(e) => setWorkOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white uppercase"
                      >
                        <option value="all">TODOS LOS ESTADOS</option>
                        <option value="requested">SOLICITADA</option>
                        <option value="scheduled">PROGRAMADA</option>
                        <option value="in_progress">EN PROGRESO</option>
                        <option value="completed">COMPLETADA</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                          <tr>
                            <th className="p-3">ORDEN #</th>
                            <th className="p-3">CLIENTE / EQUIPO</th>
                            <th className="p-3">TIPO SERVICIO</th>
                            <th className="p-3">TÉCNICO</th>
                            <th className="p-3">ESTADO</th>
                            <th className="p-3 text-right">DESPACHO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 font-medium">
                          {filteredWorkOrders.map((w) => (
                            <tr key={w.id} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="p-3 font-mono font-bold text-amber-400">
                                {w.orderNumber || 'TMD-OT'}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-white uppercase">{w.clientName || 'Cliente'}</div>
                                <div className="text-[10px] text-zinc-400 uppercase">{w.machineModel} ({w.machineSerial})</div>
                              </td>
                              <td className="p-3 text-zinc-300 uppercase">
                                {w.serviceType}
                              </td>
                              <td className="p-3 font-bold text-zinc-300 uppercase">
                                {w.assignedTechnician || 'Sin Asignar'}
                              </td>
                              <td className="p-3">
                                <select
                                  value={w.status}
                                  onChange={(e) => onUpdateOrderStatus(w.id, e.target.value as any)}
                                  className="px-2 py-1 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-white uppercase"
                                >
                                  <option value="requested">SOLICITADA</option>
                                  <option value="scheduled">PROGRAMADA</option>
                                  <option value="in_progress">EN TALLER</option>
                                  <option value="completed">COMPLETADA</option>
                                  <option value="cancelled">CANCELADA</option>
                                </select>
                              </td>
                              <td className="p-3 text-right">
                                <a
                                  href={getWorkOrderDispatchWhatsAppUrl(w)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase cursor-pointer"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WHATSAPP</span>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PURCHASES (ADMIN/STAFF VIEW) */}
          {activeTab === 'purchases' && (
            <CustomerOrdersTab
              currentUser={currentUser}
              userProfile={userProfile}
              isAdmin={isAdmin}
              isStaff={isStaff}
              onNavigate={onNavigate}
            />
          )}

          {/* TAB 6: LIVELINK TELEMATICS */}
          {activeTab === 'livelink_telematics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-[3px] border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTelematicsViewMode('command_center')}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                      telematicsViewMode === 'command_center'
                        ? 'bg-emerald-500 text-black shadow-xs font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    MANDO TELEMÁTICO (CAN-BUS, DTC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTelematicsViewMode('customer_fleet')}
                    className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all cursor-pointer uppercase ${
                      telematicsViewMode === 'customer_fleet'
                        ? 'bg-emerald-500 text-black shadow-xs font-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    MAPA & GEOCERCAS
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 uppercase">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>LIVELINK CAN-BUS ACTIVO</span>
                  </span>
                </div>
              </div>

              {telematicsViewMode === 'command_center' ? (
                <LiveLinkTelematicsDashboard
                  onOpenFullbayWorkOrder={() => handleTabSelect('orders')}
                />
              ) : (
                <LiveLinkCustomerTelematicsTab
                  currentUser={currentUser}
                  userProfile={userProfile}
                  onNavigate={onNavigate}
                  onOpenServiceTab={() => handleTabSelect('service_history')}
                />
              )}
            </div>
          )}

          {/* TAB 7: SERVICE HISTORY */}
          {activeTab === 'service_history' && (
            <ServiceHistoryTab
              currentUser={currentUser}
              userProfile={userProfile}
              isAdmin={isAdmin}
              isStaff={isStaff}
              onNavigate={onNavigate}
              workOrders={workOrders}
            />
          )}

          {/* TAB: INVENTORY LOGS (BITÁCORA DE ESCANEOS QR EN PATIO Y ALMACÉN) */}
          {activeTab === 'inventory_logs' && (
            <InventoryScanLogsPanel
              onNavigateToItem={(type, id) => {
                onNavigate(type === 'machinery' ? `#/machinery?id=${id}` : `#/parts?id=${id}`);
              }}
              onOpenScanner={onOpenQrScanner}
            />
          )}

          {/* TAB: TECH DOCS & CATALOGS VAULT */}
          {activeTab === 'tech_docs' && (
            <TechnicalDocumentationVaultTab />
          )}

          {/* TAB 8: ADMIN RBAC USER MANAGEMENT */}
          {activeTab === 'users' && isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-zinc-900 p-3.5 rounded-[5px] border border-zinc-800 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre, email o RNC..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <span className="px-2.5 py-1 rounded-[2px] bg-purple-500/20 text-purple-400 text-xs font-black uppercase font-mono">
                  {filteredUsers.length} USUARIOS REGISTRADOS
                </span>
              </div>

              <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">USUARIO</th>
                        <th className="p-3">EMPRESA / RNC</th>
                        <th className="p-3">ROL ACTUAL</th>
                        <th className="p-3 text-right">ASIGNAR ROL RBAC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 font-medium">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white uppercase">{u.displayName || 'Sin Nombre'}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-zinc-200 font-bold uppercase">{u.companyName || '—'}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{u.rnc ? `RNC: ${u.rnc}` : 'Sin RNC'}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider ${
                              u.role === 'admin' 
                                ? 'bg-purple-500 text-white' 
                                : u.role === 'staff' 
                                  ? 'bg-amber-400 text-black' 
                                  : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {u.role || 'client'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {onUpdateUserRole && (
                              <select
                                value={u.role || 'client'}
                                onChange={(e) => onUpdateUserRole(u.id, e.target.value as UserRole)}
                                className="px-2 py-1 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white uppercase"
                              >
                                <option value="client">CLIENTE</option>
                                <option value="staff">STAFF TÉCNICO</option>
                                <option value="admin">ADMINISTRADOR</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INTEGRATED STAFF QUICK ACTION SIDEBAR */}
        <StaffQuickActionSidebar
          onOpenCreateQuote={onOpenCreateQuote}
          onSelectWorkflowTab={handleSelectWorkflowSection}
          onNavigate={onNavigate}
          onOpenQrScanner={onOpenQrScanner}
          pendingQuotesCount={pendingQuotes.length}
          activeWorkOrdersCount={activeWorkOrders.length}
        />
      </div>

      {/* Staff Biometric Security & Device Key Management Modal */}
      <StaffBiometricAuthModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode="manage"
      />
    </div>
  );
};
