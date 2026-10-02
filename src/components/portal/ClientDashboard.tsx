import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  User 
} from 'firebase/auth';
import { 
  FileText, 
  Wrench, 
  Package, 
  Radio, 
  Activity, 
  Crown, 
  Building, 
  Phone, 
  Plus, 
  LogOut, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ArrowUpRight, 
  Sliders, 
  Bell, 
  GripVertical, 
  RotateCcw, 
  Check, 
  Search,
  Zap,
  HardHat,
  MessageSquare,
  X,
  BookOpen,
  Eye
} from 'lucide-react';
import { PortalQuote, ServiceWorkOrder, UserProfile, UserRole, Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { 
  saveStoredProPoints, 
  getStoredProPoints, 
  getStoredPointsLedger, 
  saveStoredPointsLedger 
} from '../../data/proMemberData';
import { ProMemberBadge } from '../common/ProMemberBadge';
import { TMDLogo } from '../common/BrandLogos';
import { IndustrialSectionDivider } from '../common/IndustrialSectionDivider';
import { CustomerOrdersTab } from './CustomerOrdersTab';
import { ServiceHistoryTab } from './ServiceHistoryTab';
import { ProMemberDashboard } from './ProMemberDashboard';
import { LiveLinkCustomerTelematicsTab } from './LiveLinkCustomerTelematicsTab';
import { TechnicalDocumentationVaultTab } from './TechnicalDocumentationVaultTab';
import { getQuoteWhatsAppUrl } from '../../utils/whatsappMessaging';
import { downloadQuotePDF } from '../../utils/pdfGenerator';
import { getLocalFleet } from '../../services/serviceHistoryService';
import { 
  getScopedClientQuotes, 
  getScopedClientWorkOrders, 
  getScopedClientFleet 
} from '../../data/portalSeedData';
import { ScanFrequencyMiniChart } from './ScanFrequencyMiniChart';
import { RecentScans } from './RecentScans';

export type ClientPortalTab = 
  | 'overview'
  | 'quotes' 
  | 'purchases' 
  | 'livelink_telematics' 
  | 'service_history' 
  | 'pro_member' 
  | 'tech_docs'
  | 'profile';

interface ClientDashboardProps {
  currentUser: User;
  userProfile: UserProfile | null;
  role: UserRole;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  quotes: PortalQuote[];
  workOrders: ServiceWorkOrder[];
  currency: Currency;
  onNavigate: (route: string) => void;
  onOpenCreateQuote: () => void;
  onOpenNewOrderModal: () => void;
  onExportQuotePdf: (quote: PortalQuote) => void;
  onUpdateQuoteStatus?: (quoteId: string, status: PortalQuote['status']) => Promise<void>;
  onUpdateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenQrScanner?: () => void;
  onInspectQuote?: (quote: PortalQuote) => void;
  onInspectWorkOrder?: (workOrder: ServiceWorkOrder) => void;
  activeTab?: ClientPortalTab;
  onTabChange?: (tab: ClientPortalTab) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  userProfile,
  role,
  simulatedRole,
  setSimulatedRole,
  quotes,
  workOrders,
  currency,
  onNavigate,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onExportQuotePdf,
  onUpdateQuoteStatus,
  onUpdateProfileDetails,
  onSignOut,
  onOpenQrScanner,
  onInspectQuote,
  onInspectWorkOrder,
  activeTab: activeTabProp,
  onTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<ClientPortalTab>(activeTabProp || 'overview');
  
  useEffect(() => {
    if (activeTabProp !== undefined) {
      setInternalActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  const activeTab = activeTabProp !== undefined ? activeTabProp : internalActiveTab;
  const setActiveTab = (tab: ClientPortalTab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteFilterStatus, setQuoteFilterStatus] = useState<string>('all');
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);
  
  // Quote Approval Flow states
  const [quoteToApprove, setQuoteToApprove] = useState<PortalQuote | null>(null);
  const [isApprovingQuote, setIsApprovingQuote] = useState<boolean>(false);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);
  
  const portalWorkspaceRef = useRef<HTMLDivElement>(null);

  const [profileForm, setProfileForm] = useState({
    companyName: userProfile?.companyName || '',
    phone: userProfile?.phone || '',
    rnc: userProfile?.rnc || '',
    maintenanceAlertsEnabled: userProfile?.maintenanceAlertsEnabled ?? true,
    maintenanceReminderThresholdHours: userProfile?.maintenanceReminderThresholdHours ?? 100,
    notifyByWhatsApp: userProfile?.notifyByWhatsApp ?? true,
    notifyByBrowserPush: userProfile?.notifyByBrowserPush ?? true
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        companyName: userProfile.companyName || '',
        phone: userProfile.phone || '',
        rnc: userProfile.rnc || '',
        maintenanceAlertsEnabled: userProfile.maintenanceAlertsEnabled ?? true,
        maintenanceReminderThresholdHours: userProfile.maintenanceReminderThresholdHours ?? 100,
        notifyByWhatsApp: userProfile.notifyByWhatsApp ?? true,
        notifyByBrowserPush: userProfile.notifyByBrowserPush ?? true
      });
    }
  }, [userProfile]);

  // Support direct deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('pro_member') || hash.includes('promember') || hash.includes('puntos') || hash.includes('loyalty')) {
        setActiveTab('pro_member');
      } else if (hash.includes('tab=service_history')) {
        setActiveTab('service_history');
      } else if (hash.includes('tech_docs') || hash.includes('fichas') || hash.includes('catalogos')) {
        setActiveTab('tech_docs');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabSelect = (tab: ClientPortalTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      portalWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfileDetails(profileForm);
      setProfileSavedFeedback(true);
      setTimeout(() => setProfileSavedFeedback(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmApproval = async () => {
    if (!quoteToApprove) return;
    setIsApprovingQuote(true);
    try {
      if (onUpdateQuoteStatus) {
        await onUpdateQuoteStatus(quoteToApprove.id, 'approved');
      }
      // Award 500 loyalty points to the contractor
      const currentPoints = getStoredProPoints(1850);
      const newPoints = currentPoints + 500;
      saveStoredProPoints(newPoints);
      
      const ledger = getStoredPointsLedger(userProfile?.displayName || currentUser?.displayName || 'Cliente TMD');
      saveStoredPointsLedger([
        {
          id: `pts-quote-appr-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          activity: `Aprobación de Proforma #${quoteToApprove.quoteNumber || 'TMD'}`,
          points: 500,
          type: 'earned',
          category: 'equipment_registration'
        },
        ...ledger
      ]);

      setApprovalToast(`¡Proforma ${quoteToApprove.quoteNumber || 'TMD'} aprobada exitosamente! Se ha notificado al taller central Km 22 y se te acreditaron +500 Puntos Club Pro.`);
      setTimeout(() => setApprovalToast(null), 6000);
      setQuoteToApprove(null);
    } catch (err) {
      console.error('Error al aprobar la cotización:', err);
    } finally {
      setIsApprovingQuote(false);
    }
  };

  // Scope data strictly to current client account for 100% relational coherence
  const clientQuotes = useMemo(() => 
    getScopedClientQuotes(quotes, currentUser?.uid, currentUser?.email || userProfile?.email),
    [quotes, currentUser?.uid, currentUser?.email, userProfile?.email]
  );

  const clientWorkOrders = useMemo(() => 
    getScopedClientWorkOrders(workOrders, currentUser?.uid, currentUser?.email || userProfile?.email),
    [workOrders, currentUser?.uid, currentUser?.email, userProfile?.email]
  );

  const fleet = useMemo(() => 
    getScopedClientFleet(getLocalFleet(), currentUser?.uid, currentUser?.email || userProfile?.email),
    [currentUser?.uid, currentUser?.email, userProfile?.email]
  );

  const pendingQuotes = clientQuotes.filter(q => q.status === 'submitted' || q.status === 'in_review' || q.status === 'draft');
  const activeServices = clientWorkOrders.filter(w => w.status === 'requested' || w.status === 'scheduled' || w.status === 'in_progress');

  const filteredQuotes = clientQuotes.filter(q => {
    const matchesSearch = 
      q.quoteNumber?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.itemsSummary?.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.notes?.toLowerCase().includes(quoteSearch.toLowerCase());
    const matchesStatus = quoteFilterStatus === 'all' || q.status === quoteFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (usdAmount: number) => {
    if (currency === 'DOP') {
      return `RD$ ${(usdAmount * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `US$ ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-sans">
      {/* CONTRACTOR ACCOUNT BAR & METRICS (Shown on overview tab) */}
      {activeTab === 'overview' && (
        <>
          {/* COMMERCIAL CONTRACTOR ACCOUNT BAR (ENTERPRISE STANDARD) */}
          <div className="p-3.5 sm:p-4 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 px-2 rounded-[3px] bg-black/60 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
                <TMDLogo variant="icon-only" className="h-7" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-tight">
                    {userProfile?.displayName || 'Contratista Registrado'}
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    CUENTA CORPORATIVA
                  </span>
                  <ProMemberBadge
                    points={userProfile?.proMemberPoints || 1850}
                    tier={userProfile?.proMemberTier || 'Gold'}
                    memberNumber={userProfile?.proMemberNumber || 'TMD-PRO-8492'}
                    variant="pill"
                    onClick={() => handleTabSelect('pro_member')}
                  />
                </div>
                <p className="text-xs text-zinc-400 font-mono">{currentUser.email}</p>
                {userProfile?.companyName && (
                  <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 flex-wrap uppercase">
                    <span>{userProfile.companyName}</span>
                    {userProfile.rnc && (
                      <>
                        <span className="text-zinc-600">•</span>
                        <span className="px-1.5 py-0.2 rounded-[2px] bg-zinc-950 text-zinc-300 font-mono text-[10px] border border-zinc-800">
                          RNC: {userProfile.rnc}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CLIENT OVERVIEW KPI CARDS (COMPACT COMMERCIAL STANDARD) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div 
              onClick={() => handleTabSelect('quotes')}
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                <span>COTIZACIONES DGII</span>
                <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                {pendingQuotes.length}
              </div>
              <span className="text-[10px] text-amber-400 font-semibold uppercase">
                {quotes.length} EN HISTORIAL
              </span>
            </div>

            <div 
              onClick={() => handleTabSelect('livelink_telematics')}
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                <span>TELEMETRÍA LIVELINK</span>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                {fleet.length} <span className="text-xs font-normal text-zinc-500 uppercase">UNIDADES</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                GPS ONLINE 24/7
              </span>
            </div>

            <div 
              onClick={() => handleTabSelect('service_history')}
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                <span>TALLER KM 22 & OBRA</span>
                <Activity className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                {activeServices.length}
              </div>
              <span className="text-[10px] text-blue-400 font-semibold uppercase">
                {workOrders.length} SERVICIOS TOTALES
              </span>
            </div>

            <div 
              onClick={() => handleTabSelect('pro_member')}
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase">
                <span>CLUB PRO TMD</span>
                <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
                {userProfile?.proMemberPoints || 1850} <span className="text-xs font-normal text-zinc-500">PTS</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                NIVEL {userProfile?.proMemberTier || 'Gold'} • BENEFICIOS VIP
              </span>
            </div>
          </div>
        </>
      )}

      {/* COMPACT WORKSPACE ACTION BAR (Shown on specific operational tabs) */}
      {activeTab !== 'overview' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
              {activeTab === 'quotes' && <FileText className="w-4 h-4" />}
              {activeTab === 'purchases' && <Package className="w-4 h-4" />}
              {activeTab === 'livelink_telematics' && <Radio className="w-4 h-4 text-emerald-400" />}
              {activeTab === 'service_history' && <Activity className="w-4 h-4 text-blue-400" />}
              {activeTab === 'pro_member' && <Crown className="w-4 h-4" />}
              {activeTab === 'tech_docs' && <BookOpen className="w-4 h-4" />}
              {activeTab === 'profile' && <Building className="w-4 h-4" />}
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-white font-display">
                {activeTab === 'quotes' && 'MIS COTIZACIONES & PROFORMAS B01'}
                {activeTab === 'purchases' && 'HISTORIAL DE COMPRAS & PEDIDOS'}
                {activeTab === 'livelink_telematics' && 'TELEMETRÍA SATELITAL DE FLOTA LIVELINK™'}
                {activeTab === 'service_history' && 'HISTORIAL DE MANTENIMIENTO EN TALLER KM 22'}
                {activeTab === 'pro_member' && 'CLUB PRO TMD · BENEFICIOS Y PUNTOS'}
                {activeTab === 'tech_docs' && 'BÓVEDA TÉCNICA · FICHAS Y MANUALES PDF'}
                {activeTab === 'profile' && 'DATOS CORPORATIVOS & PREFERENCIAS'}
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono">
                {activeTab === 'quotes' && `${quotes.length} Cotizaciones registradas`}
                {activeTab === 'service_history' && `${workOrders.length} Servicios en historial`}
                {activeTab === 'livelink_telematics' && `${fleet.length} Unidades con GPS activo`}
                {activeTab === 'pro_member' && `${userProfile?.proMemberPoints || 1850} Puntos acumulados`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'quotes' && (
              <button
                type="button"
                onClick={onOpenCreateQuote}
                className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Proforma</span>
              </button>
            )}
            {activeTab === 'service_history' && (
              <button
                type="button"
                onClick={onOpenNewOrderModal}
                className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer uppercase"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>+ Solicitar Taller</span>
              </button>
            )}
          </div>
        </div>
      )}



      {/* CLIENT ACTIVE WORKSPACE CONTENT */}
      <div ref={portalWorkspaceRef} className="scroll-mt-32 space-y-4">
        {/* TAB 0: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Quotes Summary */}
              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Proformas Recientes B01
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('quotes')}
                    className="text-[11px] text-amber-400 hover:underline uppercase font-mono font-bold cursor-pointer"
                  >
                    Ver Todas ({clientQuotes.length}) →
                  </button>
                </div>
                {clientQuotes.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No hay cotizaciones registradas actualmente.</p>
                ) : (
                  <div className="space-y-2">
                    {clientQuotes.slice(0, 3).map((q) => (
                      <div
                        key={q.id}
                        onClick={() => onInspectQuote ? onInspectQuote(q) : handleTabSelect('quotes')}
                        className="p-2.5 rounded bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/50 hover:bg-zinc-900/90 transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
                        title="Click para ver desglose fiscal en panel lateral (Side-Peek)"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white font-mono group-hover:text-amber-400 transition-colors">{q.quoteNumber}</span>
                            <Eye className="w-3.5 h-3.5 text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-amber-400 transition-all" />
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate max-w-xs">{q.itemsSummary || 'Equipos TMD'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-amber-400">{formatPrice(q.total || 0)}</span>
                          <span className="block text-[9px] uppercase font-bold text-zinc-500">{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Workshop Services Summary */}
              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      Servicios en Taller Km 22
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabSelect('service_history')}
                    className="text-[11px] text-blue-400 hover:underline uppercase font-mono font-bold cursor-pointer"
                  >
                    Ver Historial ({clientWorkOrders.length}) →
                  </button>
                </div>
                {clientWorkOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No hay órdenes de servicio activas.</p>
                ) : (
                  <div className="space-y-2">
                    {clientWorkOrders.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        onClick={() => onInspectWorkOrder ? onInspectWorkOrder(w) : handleTabSelect('service_history')}
                        className="p-2.5 rounded bg-zinc-950/80 border border-zinc-800/80 hover:border-blue-400/50 hover:bg-zinc-900/90 transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
                        title="Click para ver orden de servicio en panel lateral (Side-Peek)"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white font-mono group-hover:text-blue-400 transition-colors">{w.orderNumber}</span>
                            <Eye className="w-3.5 h-3.5 text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate max-w-xs">{w.machineModel}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            w.status === 'in_progress' ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: QUOTES */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {approvalToast && (
              <div className="p-3.5 rounded-[3px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in uppercase font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{approvalToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setApprovalToast(null)}
                  className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-3.5 rounded-[5px] border border-zinc-800 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por número de proforma o equipo..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={quoteFilterStatus}
                  onChange={(e) => setQuoteFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white uppercase focus:border-amber-400"
                >
                  <option value="all">TODOS LOS ESTADOS</option>
                  <option value="submitted">ENVIADAS</option>
                  <option value="in_review">EN REVISIÓN</option>
                  <option value="approved">APROBADAS</option>
                  <option value="rejected">DESESTIMADAS</option>
                </select>

                <button
                  type="button"
                  onClick={onOpenCreateQuote}
                  className="px-3.5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 shadow-sm uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>COTIZAR EQUIPO</span>
                </button>
              </div>
            </div>

            {filteredQuotes.length === 0 ? (
              <div className="p-10 text-center bg-zinc-900 rounded-[5px] border border-zinc-800 space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase font-display">
                    NO TIENES COTIZACIONES REGISTRADAS AÚN
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 font-sans">
                    Puedes solicitar una proforma formal con NCF B01/B02 para maquinaria pesada, repuestos OEM o servicios de taller.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateQuote}
                  className="px-4 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs inline-flex items-center gap-2 cursor-pointer shadow-md uppercase"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CREAR PRIMERA COTIZACIÓN</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 space-y-3 hover:border-amber-400/50 transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                      <div>
                        <span className="font-mono font-black text-xs text-amber-400">
                          {q.quoteNumber || 'TMD-PROFORMA'}
                        </span>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(q.createdAt).toLocaleDateString('es-DO', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider ${
                        q.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : q.status === 'in_review'
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                            : q.status === 'rejected'
                              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {q.status === 'approved' ? 'Aprobada' : q.status === 'in_review' ? 'En Revisión' : q.status === 'rejected' ? 'Desestimada' : 'Enviada'}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-white line-clamp-2 uppercase">
                        {q.itemsSummary || 'Cotización formal de maquinaria pesada / repuestos OEM'}
                      </p>
                      {q.notes && (
                        <p className="text-[11px] text-zinc-400 mt-1 italic line-clamp-2">
                          "{q.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">TOTAL PROFORMA</span>
                        <div className="text-base font-black text-white font-mono">
                          {formatPrice(q.total || 0)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {q.status !== 'approved' && q.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setQuoteToApprove(q)}
                            className="px-2.5 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer uppercase"
                            title="Aprobar esta proforma y autorizar despacho / orden"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>APROBAR</span>
                          </button>
                        )}
                        {q.status === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setQuoteToApprove(q)}
                            className="px-2.5 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer uppercase"
                            title="Reactivar y autorizar esta cotización"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>REACTIVAR</span>
                          </button>
                        )}
                        {q.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/30 uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>APROBADA</span>
                          </span>
                        )}
                        {onInspectQuote && (
                          <button
                            type="button"
                            onClick={() => onInspectQuote(q)}
                            className="p-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer border border-zinc-700"
                            title="Inspeccionar Proforma Fiscal NCF B01 (Side-Peek)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onExportQuotePdf(q)}
                          className="p-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          title="Descargar PDF Fiscal DGII"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getQuoteWhatsAppUrl(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition-colors shadow-sm uppercase cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WHATSAPP</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* YARD QR SCAN FREQUENCY & RECENT ACTIVITY AUDIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <ScanFrequencyMiniChart
                onOpenScanner={onOpenQrScanner}
              />
              <RecentScans
                limitCount={5}
                onOpenScanner={onOpenQrScanner}
                onNavigateToItem={(type, id) => {
                  onNavigate(type === 'machinery' ? `#/machinery?id=${id}` : `#/parts?id=${id}`);
                }}
              />
            </div>

            {/* MODAL: APROBACIÓN DIGITAL DE PROFORMA */}
            {quoteToApprove && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in font-mono">
                <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/20">
                        APROBACIÓN DIGITAL DE PROFORMA
                      </span>
                      <h3 className="text-sm font-black text-white uppercase font-display">
                        {quoteToApprove.quoteNumber || 'TMD-PROFORMA'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuoteToApprove(null)}
                      className="p-1 rounded-[3px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase block">CONCEPTO</span>
                      <p className="font-bold text-white mt-0.5 uppercase">
                        {quoteToApprove.itemsSummary || 'Maquinaria pesada / Repuestos OEM'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-zinc-400 font-medium uppercase text-[11px]">MONTO TOTAL:</span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {formatPrice(quoteToApprove.total || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-[3px] bg-amber-400/10 border border-amber-400/25 text-xs space-y-2 text-zinc-300">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>BENEFICIOS AL AUTORIZAR:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400 font-sans">
                      <li>Reserva inmediata en patio central Km 22 con bloqueo de número de chasis/serie.</li>
                      <li>Emisión de Comprobante Fiscal DGII B01 (Crédito Fiscal) a tu RNC registrado.</li>
                      <li>Acreditación instantánea de <strong>+500 Puntos Club Pro</strong> a tu perfil de contratista.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setQuoteToApprove(null)}
                      disabled={isApprovingQuote}
                      className="px-3.5 py-2 rounded-[3px] border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer uppercase"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmApproval}
                      disabled={isApprovingQuote}
                      className="px-4 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50 uppercase"
                    >
                      {isApprovingQuote ? (
                        <span>APROBANDO...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>CONFIRMAR APROBACIÓN</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {/* TAB 2: PURCHASES */}
        {activeTab === 'purchases' && (
          <CustomerOrdersTab
            currentUser={currentUser}
            userProfile={userProfile}
            isAdmin={false}
            isStaff={false}
            onNavigate={onNavigate}
          />
        )}

        {/* TAB 3: LIVELINK TELEMATICS */}
        {activeTab === 'livelink_telematics' && (
          <LiveLinkCustomerTelematicsTab
            currentUser={currentUser}
            userProfile={userProfile}
            onNavigate={onNavigate}
            onOpenServiceTab={() => handleTabSelect('service_history')}
          />
        )}

        {/* TAB 4: SERVICE HISTORY */}
        {activeTab === 'service_history' && (
          <ServiceHistoryTab
            currentUser={currentUser}
            userProfile={userProfile}
            isAdmin={false}
            isStaff={false}
            onNavigate={onNavigate}
            workOrders={clientWorkOrders}
            onOpenNewOrderModal={onOpenNewOrderModal}
          />
        )}

        {/* TAB 5: PRO MEMBER CLUB */}
        {activeTab === 'pro_member' && (
          <ProMemberDashboard
            currentUser={currentUser}
            userProfile={userProfile}
            onNavigate={onNavigate}
            onOpenServiceTab={() => handleTabSelect('service_history')}
            onOpenLiveLinkTab={() => handleTabSelect('livelink_telematics')}
          />
        )}

        {/* TAB 6: PROFILE & ALERTS */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl space-y-4 font-mono">
            <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-display">
                    DATOS FISCALES & PERFIL DE CONTRATISTA
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5">
                    Información utilizada para comprobantes fiscales DGII (B01) y facturación.
                  </p>
                </div>
                {profileSavedFeedback && (
                  <span className="px-2.5 py-1 rounded-[2px] bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 animate-in fade-in uppercase font-mono">
                    <Check className="w-3.5 h-3.5" />
                    <span>GUARDADO</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Nombre de la Empresa / Razón Social:
                    </label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="Ej: Constructora del Caribe SRL"
                      className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      RNC o Cédula Fiscal:
                    </label>
                    <input
                      type="text"
                      value={profileForm.rnc}
                      onChange={(e) => setProfileForm(p => ({ ...p, rnc: e.target.value }))}
                      placeholder="Ej: 1-31-09876-2"
                      className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-white focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Teléfono / WhatsApp de Contacto:
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Ej: +1 (809) 555-0199"
                    className="w-full p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs font-bold text-white focus:border-amber-400"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    ALERTAS PREVENTIVAS DE HORÓMETRO
                  </h4>
                  <label className="flex items-center gap-2.5 p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.maintenanceAlertsEnabled}
                      onChange={(e) => setProfileForm(p => ({ ...p, maintenanceAlertsEnabled: e.target.checked }))}
                      className="w-3.5 h-3.5 rounded-[2px] text-amber-400 accent-amber-400"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block uppercase text-[11px]">
                        Notificaciones automáticas de mantenimiento (&lt;100h)
                      </span>
                      <span className="text-zinc-500 font-sans text-[11px]">
                        Recibe avisos antes del vencimiento de servicio para tus equipos JCB, LiuGong y Shacman.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors shadow-sm cursor-pointer uppercase"
                  >
                    GUARDAR CAMBIOS
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: TECH DOCS & CATALOGS VAULT */}
        {activeTab === 'tech_docs' && (
          <TechnicalDocumentationVaultTab />
        )}
      </div>
      {/* QUOTE APPROVAL & REACTIVATION CONFIRMATION MODAL */}
      {quoteToApprove && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-[5px] max-w-lg w-full p-6 space-y-4 shadow-2xl relative overflow-hidden font-sans">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight font-display">
                    {quoteToApprove.status === 'rejected' ? 'Reactivar & Confirmar Cotización' : 'Aprobar Proforma Fiscal B01'}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {quoteToApprove.quoteNumber || 'TMD-PROFORMA'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuoteToApprove(null)}
                className="text-zinc-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Equipo / Ítem Cotizado:</span>
                <span className="font-bold text-white text-right max-w-[260px] truncate">
                  {quoteToApprove.itemsSummary || 'Maquinaria Pesada TMD'}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Total Proforma (ITBIS incl.):</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatPrice(quoteToApprove.total || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-300">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bloqueo y reserva inmediata de número de chasis en Patio Km 22.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Emisión de factura con Valor de Crédito Fiscal (Comprobante B01 DGII).</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Acreditación automática de +500 Puntos Club Pro VIP en tu cuenta corporativa.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setQuoteToApprove(null)}
                className="px-4 py-2 rounded-[3px] border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isApprovingQuote}
                className="px-5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isApprovingQuote ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Confirmar Aprobación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
