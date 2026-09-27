import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
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
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PortalQuote, ServiceWorkOrder, UserProfile, UserRole } from '../types';
import { saveServiceOrderToLocalStorage } from '../services/serviceHistoryService';
import { QuotePdfExportModal } from './portal/QuotePdfExportModal';
import { CreateMachineQuoteModal } from './portal/CreateMachineQuoteModal';
import { ClientDashboard, ClientPortalTab } from './portal/ClientDashboard';
import { StaffCommandCenter, StaffPortalTab } from './portal/StaffCommandCenter';
import { StaffBiometricAuthModal } from './auth/StaffBiometricAuthModal';
import { EnterprisePortalLogin } from './portal/EnterprisePortalLogin';
import { PortalShell } from './portal/layout/PortalShell';
import { AdminDashboardView } from './AdminDashboardView';
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
  const [biometricModalMode, setBiometricModalMode] = useState<'login' | 'manage'>('login');

  // Mappers between PortalShell tabs and submodule tabs
  const mapShellTabToClientTab = (tab: string): ClientPortalTab => {
    switch (tab) {
      case 'overview':
      case 'quotes': return 'quotes';
      case 'orders': return 'purchases';
      case 'purchases': return 'purchases';
      case 'livelink': return 'livelink_telematics';
      case 'service': return 'service_history';
      case 'pro': return 'pro_member';
      case 'docs': return 'tech_docs';
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

  // Real-time listener for Quotes
  useEffect(() => {
    if (!currentUser) {
      setQuotes([]);
      return;
    }

    const quotesColRef = collection(db, 'quotes');
    const q = (isStaff || isAdmin)
      ? query(quotesColRef) 
      : query(quotesColRef, where('clientId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: PortalQuote[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as PortalQuote);
        });
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setQuotes(fetched.length > 0 ? fetched : INITIAL_PORTAL_QUOTES);
      },
      (error) => {
        console.warn('Firestore quotes listener notice (using seed fallback):', error);
        setQuotes(INITIAL_PORTAL_QUOTES);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isStaff, isAdmin]);

  // Real-time listener for Work Orders
  useEffect(() => {
    if (!currentUser) {
      setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
      return;
    }

    const ordersColRef = collection(db, 'work_orders');
    const q = (isStaff || isAdmin)
      ? query(ordersColRef) 
      : query(ordersColRef, where('clientId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: ServiceWorkOrder[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as ServiceWorkOrder);
        });
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setWorkOrders(fetched.length > 0 ? fetched : INITIAL_PORTAL_WORK_ORDERS);
      },
      (error) => {
        console.warn('Firestore work_orders listener notice (using seed fallback):', error);
        setWorkOrders(INITIAL_PORTAL_WORK_ORDERS);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isStaff, isAdmin]);

  // Fetch all users for Admin
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setAllUsers(INITIAL_PORTAL_USERS);
      return;
    }

    const usersColRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersColRef,
      (snapshot) => {
        const fetched: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        });
        setAllUsers(fetched.length > 0 ? fetched : INITIAL_PORTAL_USERS);
      },
      (error) => {
        console.warn('Firestore users listener notice (using seed fallback):', error);
        setAllUsers(INITIAL_PORTAL_USERS);
      }
    );

    return () => unsubscribe();
  }, [currentUser, isAdmin]);

  // Handle Work Order Submission
  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmittingOrder(true);

    try {
      const orderNum = `OT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Omit<ServiceWorkOrder, 'id'> = {
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

      const docRef = await addDoc(collection(db, 'work_orders'), newOrder);
      saveServiceOrderToLocalStorage({ id: docRef.id, ...newOrder } as ServiceWorkOrder);
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
      handleFirestoreError(err, OperationType.CREATE, 'work_orders');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Status updates for Staff / Admin
  const handleUpdateOrderStatus = async (orderId: string, status: ServiceWorkOrder['status']) => {
    try {
      const orderDoc = doc(db, 'work_orders', orderId);
      await updateDoc(orderDoc, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `work_orders/${orderId}`);
    }
  };

  const handleUpdateQuoteStatus = async (quoteId: string, status: PortalQuote['status']) => {
    try {
      const quoteDoc = doc(db, 'quotes', quoteId);
      await updateDoc(quoteDoc, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quotes/${quoteId}`);
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
      {/* Dynamic Sub-route & Workspace Router */}
      {isAdmin && (subRoute === 'admin' || ['patio', 'metrics', 'audit'].includes(activePortalTab)) ? (
        <AdminDashboardView onNavigate={onNavigate} />
      ) : (isStaff || isAdmin) ? (
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
            // Internal tab sync
          }}
        />
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
            // Internal tab sync
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
    </PortalShell>
  );
};
