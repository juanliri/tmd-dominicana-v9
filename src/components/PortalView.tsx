import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, 
  LogIn, 
  Building, 
  Phone, 
  Mail, 
  Check, 
  X, 
  Wrench, 
  FileText, 
  Activity, 
  Zap, 
  HardHat, 
  CheckCircle2, 
  Clock, 
  Crown, 
  Sliders,
  Fingerprint,
  Key,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PortalQuote, ServiceWorkOrder, UserProfile, UserRole } from '../types';
import { saveServiceOrderToLocalStorage } from '../services/serviceHistoryService';
import { QuotePdfExportModal } from './portal/QuotePdfExportModal';
import { CreateMachineQuoteModal } from './portal/CreateMachineQuoteModal';
import { ClientDashboard, ClientPortalTab } from './portal/ClientDashboard';
import { StaffCommandCenter, StaffPortalTab } from './portal/StaffCommandCenter';
import { StaffBiometricAuthModal } from './auth/StaffBiometricAuthModal';
import { PasskeyBiometricAuthModal } from './auth/PasskeyBiometricAuthModal';
import { EnterprisePortalLogin } from './portal/EnterprisePortalLogin';
import { PortalShell } from './portal/layout/PortalShell';
import { AdminDashboardView } from './AdminDashboardView';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { 
  INITIAL_PORTAL_QUOTES, 
  INITIAL_PORTAL_WORK_ORDERS, 
  INITIAL_PORTAL_USERS 
} from '../data/portalSeedData';

interface PortalViewProps {
  onNavigate: (route: string) => void;
  onOpenQrScanner?: () => void;
}

export const PortalView: React.FC<PortalViewProps> = ({ onNavigate, onOpenQrScanner }) => {
  const { 
    currentUser, 
    userProfile, 
    role, 
    realRole,
    simulatedRole,
    setSimulatedRole,
    isAdmin, 
    isStaff, 
    isClient, 
    loading, 
    signInWithGoogle, 
    signInWithPin,
    signInAsRole,
    signInWithBiometrics,
    isBiometricsSupported,
    storedBiometricKeys,
    signOut, 
    updateUserRole, 
    updateProfileDetails 
  } = useAuth();
  
  const { currency, addToCart } = useCart();

  // Sub-route state from window.location.hash
  const getSubrouteFromHash = (): string => {
    if (typeof window === 'undefined') return '';
    const hash = window.location.hash || '';
    if (hash.startsWith('#/portal/')) {
      return hash.replace('#/portal/', '').split('?')[0].toLowerCase();
    }
    return '';
  };

  const [subRoute, setSubRoute] = useState<string>(getSubrouteFromHash());
  const [activePortalTab, setActivePortalTab] = useState<string>(() => {
    const sub = getSubrouteFromHash();
    if (sub === 'admin') return 'metrics';
    if (sub === 'ops') return 'command';
    if (sub === 'dealer' || sub === 'client') return 'quotes';
    return 'overview';
  });

  useEffect(() => {
    const handleHashSync = () => {
      const sub = getSubrouteFromHash();
      setSubRoute(sub);
      if (sub === 'admin') setActivePortalTab('metrics');
      else if (sub === 'ops') setActivePortalTab('command');
      else if (sub === 'dealer' || sub === 'client') setActivePortalTab('quotes');
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const [quotes, setQuotes] = useState<PortalQuote[]>(INITIAL_PORTAL_QUOTES);
  const [workOrders, setWorkOrders] = useState<ServiceWorkOrder[]>(INITIAL_PORTAL_WORK_ORDERS);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_PORTAL_USERS);
  
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [exportingQuote, setExportingQuote] = useState<PortalQuote | null>(null);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState<boolean>(false);
  const [biometricModalMode, setBiometricModalMode] = useState<'login' | 'manage'>('login');

  // Mappers between PortalShell tabs and submodule tabs
  const mapShellTabToClientTab = (tab: string): ClientPortalTab => {
    switch (tab) {
      case 'overview':
      case 'quotes': return 'quotes';
      case 'orders': return 'service_history';
      case 'service': return 'service_history';
      case 'purchases': return 'purchases';
      case 'livelink': return 'livelink_telematics';
      case 'pro': return 'pro_member';
      case 'docs': return 'tech_docs';
      case 'profile': return 'profile';
      default: return 'quotes';
    }
  };

  const mapClientTabToShellTab = (tab: ClientPortalTab): string => {
    switch (tab) {
      case 'quotes': return 'quotes';
      case 'purchases': return 'purchases';
      case 'livelink_telematics': return 'livelink';
      case 'service_history': return 'orders';
      case 'pro_member': return 'pro';
      case 'tech_docs': return 'docs';
      case 'profile': return 'profile';
      default: return 'quotes';
    }
  };

  const mapShellTabToStaffTab = (tab: string): StaffPortalTab => {
    switch (tab) {
      case 'overview':
      case 'command': return 'command_center';
      case 'workflow':
      case 'office': return 'office_workflow';
      case 'quotes': return 'quotes';
      case 'orders': return 'orders';
      case 'purchases': return 'purchases';
      case 'livelink': return 'livelink_telematics';
      case 'service': return 'service_history';
      case 'inventory': return 'inventory_logs';
      case 'docs': return 'tech_docs';
      case 'users': return 'users';
      case 'profile': return 'profile';
      default: return 'command_center';
    }
  };

  const mapStaffTabToShellTab = (tab: StaffPortalTab): string => {
    switch (tab) {
      case 'command_center': return 'command';
      case 'office_workflow': return 'workflow';
      case 'quotes': return 'quotes';
      case 'orders': return 'orders';
      case 'purchases': return 'purchases';
      case 'livelink_telematics': return 'livelink';
      case 'service_history': return 'orders';
      case 'inventory_logs': return 'inventory';
      case 'tech_docs': return 'docs';
      case 'users': return 'users';
      case 'profile': return 'profile';
      default: return 'command';
    }
  };

  const handleSelectPortalTab = (tabId: string) => {
    setActivePortalTab(tabId);
    if (['patio', 'metrics', 'audit', 'users'].includes(tabId) && isAdmin) {
      if (window.location.hash !== '#/portal/admin') {
        window.location.hash = '#/portal/admin';
      }
    }
  };

  // New Work Order Form State
  const [orderForm, setOrderForm] = useState({
    machineModel: 'JCB 3CX Eco Backhoe Loader',
    machineSerial: '',
    serviceType: 'preventive_500h' as ServiceWorkOrder['serviceType'],
    priority: 'routine' as ServiceWorkOrder['priority'],
    location: 'Santo Domingo Oeste (Km 22 / Obra)',
    description: ''
  });

  // Resilient Supabase Cloud & Vercel Edge Data Sync with Realtime channel
  useEffect(() => {
    if (!currentUser) {
      setQuotes([]);
      setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
      setAllUsers(INITIAL_PORTAL_USERS);
      return;
    }

    let isMounted = true;

    // Fast-path: if Supabase is not configured, load local storage & seed data immediately with 0 latency and no network error spam
    if (!isSupabaseConfigured) {
      const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tmd_portal_quotes') || '[]') : [];
      if (stored.length > 0) {
        setQuotes([...stored, ...INITIAL_PORTAL_QUOTES.filter(iq => !stored.some((sq: any) => sq.id === iq.id))]);
      } else {
        setQuotes(INITIAL_PORTAL_QUOTES);
      }
      setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
      setAllUsers(INITIAL_PORTAL_USERS);
      return () => {
        isMounted = false;
      };
    }

    const syncPortalData = async () => {
      // 1. Sync Quotes from Supabase
      try {
        let quotesQuery = supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isStaff && !isAdmin) {
          quotesQuery = quotesQuery.eq('user_id', currentUser.uid);
        }

        const { data, error } = await quotesQuery;
        if (!error && data && data.length > 0) {
          const mappedQuotes: PortalQuote[] = data.map((q: any) => ({
            id: q.id,
            quoteNumber: q.quote_number || `QT-2026-${q.id.substring(0, 4)}`,
            clientId: q.user_id || currentUser.uid,
            clientEmail: q.customer_email || currentUser.email || 'ventas@constructoratavares.rd',
            clientName: q.customer_name || userProfile?.displayName || 'Cliente Corporativo TMD',
            companyName: q.company || userProfile?.companyName || 'Constructora Nacional',
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
          const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tmd_portal_quotes') || '[]') : [];
          const combined = [...stored.filter((sq: any) => !mappedQuotes.some(mq => mq.id === sq.id)), ...mappedQuotes];
          if (isMounted) setQuotes(combined.length > 0 ? combined : mappedQuotes);
        } else {
          const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tmd_portal_quotes') || '[]') : [];
          if (stored.length > 0 && isMounted) {
            setQuotes([...stored, ...INITIAL_PORTAL_QUOTES.filter(iq => !stored.some((sq: any) => sq.id === iq.id))]);
          } else if (isMounted) {
            setQuotes(INITIAL_PORTAL_QUOTES);
          }
        }
      } catch (e) {
        const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tmd_portal_quotes') || '[]') : [];
        if (stored.length > 0 && isMounted) {
          setQuotes([...stored, ...INITIAL_PORTAL_QUOTES.filter(iq => !stored.some((sq: any) => sq.id === iq.id))]);
        } else if (isMounted) {
          setQuotes(INITIAL_PORTAL_QUOTES);
        }
      }

      // 2. Sync Work Orders from Supabase or LocalStorage
      try {
        let ordersQuery = supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isStaff && !isAdmin) {
          ordersQuery = ordersQuery.eq('client_id', currentUser.uid);
        }

        const { data, error } = await ordersQuery;
        if (!error && data && data.length > 0) {
          const mappedOrders: ServiceWorkOrder[] = data.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number || `OT-${o.id.substring(0, 4)}`,
            clientId: o.client_id || currentUser.uid,
            clientName: o.client_name || userProfile?.displayName || 'Cliente TMD',
            companyName: o.company_name || 'Constructora',
            machineModel: o.machine_model || 'JCB 3CX Eco',
            machineSerial: o.machine_serial || 'VIN-PENDING',
            serviceType: o.service_type || 'preventive_500h',
            priority: o.priority || 'routine',
            location: o.location || 'Km 22 Autopista Duarte',
            description: o.description || '',
            status: o.status || 'requested',
            createdAt: o.created_at || new Date().toISOString(),
            updatedAt: o.updated_at || new Date().toISOString()
          }));
          if (isMounted) setWorkOrders(mappedOrders);
        } else {
          if (isMounted) setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
        }
      } catch (e) {
        if (isMounted) setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
      }

      // 3. Sync Users / Profiles for Admin
      if (isAdmin) {
        try {
          const { data, error } = await supabase.from('profiles').select('*');
          if (!error && data && data.length > 0) {
            const mappedUsers: UserProfile[] = data.map((p: any) => ({
              id: p.id,
              uid: p.id,
              email: p.email || '',
              displayName: p.full_name || p.display_name || 'Usuario TMD',
              role: p.role || 'client',
              companyName: p.company_name || 'Constructora',
              phone: p.phone || '',
              createdAt: p.created_at || new Date().toISOString(),
              updatedAt: p.updated_at || p.created_at || new Date().toISOString()
            }));
            if (isMounted) setAllUsers(mappedUsers);
          } else {
            if (isMounted) setAllUsers(INITIAL_PORTAL_USERS);
          }
        } catch (e) {
          if (isMounted) setAllUsers(INITIAL_PORTAL_USERS);
        }
      }
    };

    syncPortalData();

    // Supabase Realtime channel
    const channel = supabase
      .channel('portal-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => syncPortalData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () => syncPortalData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => syncPortalData())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [currentUser, isStaff, isAdmin]);

  // Handle Work Order Submission
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingOrder(true);

    try {
      const orderNum = `OT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: ServiceWorkOrder = {
        id: `wo-${Date.now()}`,
        orderNumber: orderNum,
        clientId: currentUser.uid,
        clientName: userProfile?.displayName || currentUser.displayName || 'Cliente TMD',
        companyName: userProfile?.companyName || 'Constructora / Particular',
        machineModel: orderForm.machineModel,
        machineSerial: orderForm.machineSerial || 'En verificación en campo',
        serviceType: orderForm.serviceType,
        priority: orderForm.priority,
        location: orderForm.location,
        description: orderForm.description,
        status: 'requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic update
      setWorkOrders(prev => [newOrder, ...prev]);
      saveServiceOrderToLocalStorage(newOrder);

      // Persist to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('work_orders').insert([{
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            client_id: newOrder.clientId,
            client_name: newOrder.clientName,
            company_name: newOrder.companyName,
            machine_model: newOrder.machineModel,
            machine_serial: newOrder.machineSerial,
            service_type: newOrder.serviceType,
            priority: newOrder.priority,
            location: newOrder.location,
            description: newOrder.description,
            status: newOrder.status,
            created_at: newOrder.createdAt,
            updated_at: newOrder.updatedAt
          }]);
        } catch (err) {
          console.warn('Supabase work_order insert notice:', err);
        }
      }

      setShowNewOrderModal(false);
      setOrderForm({
        machineModel: 'JCB 3CX Eco Backhoe Loader',
        machineSerial: '',
        serviceType: 'preventive_500h',
        priority: 'routine',
        location: 'Santo Domingo Oeste (Km 22 / Obra)',
        description: ''
      });
    } catch (err) {
      console.error('Error creating work order:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Status updates for Staff / Admin
  const handleUpdateOrderStatus = async (orderId: string, status: ServiceWorkOrder['status']) => {
    setWorkOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    if (isSupabaseConfigured) {
      try {
        await supabase.from('work_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase work_order status update notice:', err);
      }
    }
  };

  const handleUpdateQuoteStatus = async (quoteId: string, status: PortalQuote['status']) => {
    setQuotes(prev => {
      const updated = prev.map(q => q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q);
      try {
        localStorage.setItem('tmd_portal_quotes', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
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

  // Non-authenticated State: Split-screen Enterprise Portal Login
  if (!currentUser) {
    return (
      <EnterprisePortalLogin
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithPin={signInWithPin}
        onSignInAsRole={signInAsRole}
        onOpenBiometrics={() => {
          setBiometricModalMode('login');
          setShowBiometricModal(true);
        }}
        loading={loading}
        storedBiometricKeysCount={storedBiometricKeys.length}
        onNavigate={onNavigate}
        onQuickAccess={(targetRole) => signInAsRole(targetRole as any)}
      />
    );
  }

  // =========================================================================
  // CONDITIONAL RENDERING ENGINE
  // Consumes AuthContext role and dynamically injects either the 'ClientDashboard'
  // layout or the 'StaffCommandCenter' component set to optimize UI density.
  // =========================================================================
  return (
    <PortalShell
      activeTab={activePortalTab}
      onSelectTab={handleSelectPortalTab}
      userProfile={userProfile}
      role={role}
      simulatedRole={simulatedRole}
      onSetSimulatedRole={setSimulatedRole}
      onNavigate={onNavigate}
      onOpenCreateQuote={() => setShowCreateQuoteModal(true)}
      onOpenNewOrderModal={() => setShowNewOrderModal(true)}
      onOpenQrScanner={onOpenQrScanner}
      onSignOut={signOut}
      quotesCount={quotes.length}
      ordersCount={workOrders.length}
    >
      {/* Dynamic Sub-route & Workspace Router with strict role gating */}
      {(subRoute === 'admin' || ['patio', 'metrics', 'audit'].includes(activePortalTab)) ? (
        <ProtectedRoute requiredRole="admin" onNavigate={onNavigate} fallbackRoute="#/portal">
          <AdminDashboardView onNavigate={onNavigate} />
        </ProtectedRoute>
      ) : (subRoute === 'ops' || ['command', 'workflow', 'inventory', 'users'].includes(activePortalTab) || isStaff || isAdmin) ? (
        <ProtectedRoute requiredRole="staff" onNavigate={onNavigate} fallbackRoute="#/portal">
          <StaffCommandCenter
            currentUser={currentUser}
            userProfile={userProfile}
            role={role}
            isAdmin={isAdmin}
            isStaff={isStaff}
            simulatedRole={simulatedRole}
            setSimulatedRole={setSimulatedRole}
            quotes={quotes}
            workOrders={workOrders}
            allUsers={allUsers}
            currency={currency}
            onNavigate={onNavigate}
            onOpenCreateQuote={() => setShowCreateQuoteModal(true)}
            onOpenNewOrderModal={() => setShowNewOrderModal(true)}
            onExportQuotePdf={(q) => setExportingQuote(q)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateQuoteStatus={handleUpdateQuoteStatus}
            onUpdateUserRole={updateUserRole}
            onUpdateProfileDetails={updateProfileDetails}
            onSignOut={signOut}
            addToCart={addToCart}
            onOpenQrScanner={onOpenQrScanner}
            activeTab={mapShellTabToStaffTab(activePortalTab)}
            onTabChange={(tab) => {
              handleSelectPortalTab(mapStaffTabToShellTab(tab));
            }}
          />
        </ProtectedRoute>
      ) : (
        <ClientDashboard
          currentUser={currentUser}
          userProfile={userProfile}
          role={role}
          simulatedRole={simulatedRole}
          setSimulatedRole={setSimulatedRole}
          quotes={quotes}
          workOrders={workOrders}
          currency={currency}
          onNavigate={onNavigate}
          onOpenCreateQuote={() => setShowCreateQuoteModal(true)}
          onOpenNewOrderModal={() => setShowNewOrderModal(true)}
          onExportQuotePdf={(q) => setExportingQuote(q)}
          onUpdateQuoteStatus={handleUpdateQuoteStatus}
          onUpdateProfileDetails={updateProfileDetails}
          onSignOut={signOut}
          onOpenQrScanner={onOpenQrScanner}
          activeTab={mapShellTabToClientTab(activePortalTab)}
          onTabChange={(tab) => {
            handleSelectPortalTab(mapClientTabToShellTab(tab));
          }}
        />
      )}

      {/* New Work Order Modal (Shared for rapid dispatching/requesting) */}
      {showNewOrderModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-mono">
          <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-2xl max-w-lg w-full p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white uppercase font-display">
                  SOLICITUD DE TALLER & SERVICIO TÉCNICO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="p-1 rounded-[3px] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                  Modelo de Maquinaria
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.machineModel}
                  onChange={(e) => setOrderForm({ ...orderForm, machineModel: e.target.value })}
                  placeholder="Ej. JCB 3CX, LiuGong 922E, Shacman F3000..."
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                    Número de Serie / Chasis
                  </label>
                  <input
                    type="text"
                    value={orderForm.machineSerial}
                    onChange={(e) => setOrderForm({ ...orderForm, machineSerial: e.target.value })}
                    placeholder="Ej. JCB-3CX-2024-8841"
                    className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                    Prioridad
                  </label>
                  <select
                    value={orderForm.priority}
                    onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="routine">RUTINARIO</option>
                    <option value="urgent">URGENTE (PARADA PROGRAMADA)</option>
                    <option value="emergency">EMERGENCIA (MÁQUINA PARADA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                  Tipo de Servicio
                </label>
                <select
                  value={orderForm.serviceType}
                  onChange={(e) => setOrderForm({ ...orderForm, serviceType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="preventive_500h">MANTENIMIENTO PREVENTIVO 500 HORAS</option>
                  <option value="preventive_1000h">MANTENIMIENTO PREVENTIVO 1,000 HORAS</option>
                  <option value="hydraulic_repair">REPARACIÓN HIDRÁULICA / CILINDROS</option>
                  <option value="engine_overhaul">DIAGNÓSTICO & OVERHAUL MOTOR DIESEL</option>
                  <option value="undercarriage">AJUSTE / CAMBIO DE TREN DE RODAJE</option>
                  <option value="electrical_diagnostic">DIAGNÓSTICO ELÉCTRICO Y SENSORES</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                  Ubicación de la Máquina (Patio Km 22 o en Obra)
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.location}
                  onChange={(e) => setOrderForm({ ...orderForm, location: e.target.value })}
                  placeholder="Ej. Mina Pedernales / Sede Km 22"
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1 uppercase text-[10px]">
                  Descripción del Problema o Servicio
                </label>
                <textarea
                  rows={3}
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  placeholder="Indica síntomas, códigos de error o kits de filtros requeridos..."
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-3 py-1.5 rounded-[3px] border border-zinc-700 text-zinc-300 font-bold uppercase hover:bg-zinc-800 cursor-pointer text-xs"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-4 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 text-xs"
                >
                  {isSubmittingOrder ? (
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>ENVIAR AL TALLER TMD</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* PDF Export Modal */}
      {exportingQuote && (
        <QuotePdfExportModal
          quote={exportingQuote}
          onClose={() => setExportingQuote(null)}
          onNavigate={onNavigate}
        />
      )}

      {/* Create Machine Quote Modal */}
      {showCreateQuoteModal && (
        <CreateMachineQuoteModal
          currentUser={currentUser}
          userProfile={userProfile}
          onClose={() => setShowCreateQuoteModal(false)}
          onQuoteCreated={(newQ) => {
            setQuotes((prev) => [newQ, ...prev]);
          }}
        />
      )}

      {/* WebAuthn Staff Biometric Authentication & Device Key Manager Modal */}
      <StaffBiometricAuthModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        mode={biometricModalMode}
      />

      {/* Task #58: Passkey Biometric WebAuthn Modal */}
      <PasskeyBiometricAuthModal
        isOpen={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
        onAuthenticateSuccess={(profile) => {
          signInAsRole('client');
        }}
      />
    </PortalShell>
  );
};
