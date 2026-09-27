import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Settings, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Truck, 
  User, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Copy, 
  Layers, 
  Activity, 
  ChevronRight, 
  Cpu, 
  ExternalLink,
  MapPin,
  HelpCircle,
  Tag,
  Hash,
  ShoppingBag
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { ServiceWorkOrder, RegisteredEquipment, InstalledServicePart, UserProfile, Part } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { useNotifications } from '../../context/NotificationContext';
import { useCart } from '../../context/CartContext';
import { 
  getLocalServiceHistory, 
  generateDemoServiceHistory, 
  saveServiceOrderToLocalStorage,
  getLocalFleet,
  saveFleetToLocalStorage,
  generateDemoFleet,
  updateEquipmentHorometer,
  completeEquipmentServiceCycle
} from '../../services/serviceHistoryService';
import { approveFullbayEstimate } from '../../services/fullbayService';
import { WorkshopLiveTimeline } from './WorkshopLiveTimeline';
import { fetchFullbayActiveRepairOrders } from '../../services/fullbayConnectMockService';
import { FullbayActiveRepairOrder } from '../../types';
import { ServiceDetailModal } from './service/ServiceDetailModal';

interface ServiceHistoryTabProps {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  isAdmin?: boolean;
  isStaff?: boolean;
  onNavigate: (route: string) => void;
}

export const ServiceHistoryTab: React.FC<ServiceHistoryTabProps> = ({
  currentUser,
  userProfile,
  isAdmin,
  isStaff,
  onNavigate
}) => {
  const { checkMaintenanceReminders } = useNotifications();
  const { addToCart } = useCart();
  const [serviceRecords, setServiceRecords] = useState<ServiceWorkOrder[]>([]);
  const [activeFullbayOrders, setActiveFullbayOrders] = useState<FullbayActiveRepairOrder[]>([]);
  const [fleet, setFleet] = useState<RegisteredEquipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<ServiceWorkOrder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingHorometerId, setEditingHorometerId] = useState<string | null>(null);
  const [tempHorometerVal, setTempHorometerVal] = useState<number>(0);
  const [horometerFeedback, setHorometerFeedback] = useState<string | null>(null);
  
  // Register machine modal
  const [showAddMachineModal, setShowAddMachineModal] = useState<boolean>(false);
  const [newUnitId, setNewUnitId] = useState<string>('');
  const [newBrand, setNewBrand] = useState<string>('LiuGong');
  const [newModel, setNewModel] = useState<string>('');
  const [newSerial, setNewSerial] = useState<string>('');
  const [newYear, setNewYear] = useState<number>(2024);
  const [newHorometer, setNewHorometer] = useState<number>(100);
  const [newLocation, setNewLocation] = useState<string>('Santo Domingo');

  // Order filter kit helper for individual machine
  const handleOrderFilterKitForMachine = (machine: RegisteredEquipment) => {
    const kitPart: Part = {
      id: `kit-filter-${machine.brand.toLowerCase()}-${machine.model.toLowerCase().replace(/\s+/g, '-')}`,
      partNumber: `KIT-${machine.brand.toUpperCase().slice(0, 3)}-500H`,
      name: `Kit de Mantenimiento 500H Genuino - ${machine.brand} ${machine.model}`,
      brand: `${machine.brand} OEM Genuine`,
      category: 'Filtros',
      assemblyId: 'powertrain',
      compatibleModels: [machine.model, machine.brand],
      priceUsd: 285.00,
      stockQty: 40,
      image: '/assets/parts/heavy_oil_filter.jpg',
      description: `Kit completo con filtro de aceite de motor, elemento primario y secundario de aire, filtro de combustible con trampa de agua para ${machine.brand} ${machine.model} (${machine.unitId}, Serie: ${machine.serialNumber}). Entrega inmediata 2-4 horas en Santo Domingo o despacho nacional.`,
      isOem: true,
      deliveryTimeHours: 4
    };

    addToCart(kitPart, 1);
    setHorometerFeedback(`¡Kit 500h para ${machine.unitId} (${machine.model}) añadido al carrito con tarifa Pro!`);
    setTimeout(() => {
      setHorometerFeedback(null);
    }, 4500);
  };

  // Order filter kits for all machines due soon
  const handleOrderAllDueFilterKits = () => {
    const dueMachines = fleet.filter((m) => {
      const nextService = m.nextServiceHours || (m.currentHorometer + 500);
      return (nextService - m.currentHorometer) <= 100;
    });

    if (dueMachines.length === 0) {
      setHorometerFeedback('No hay equipos con servicio próximo pendiente en este momento.');
      return;
    }

    dueMachines.forEach((machine) => {
      const kitPart: Part = {
        id: `kit-filter-${machine.brand.toLowerCase()}-${machine.model.toLowerCase().replace(/\s+/g, '-')}`,
        partNumber: `KIT-${machine.brand.toUpperCase().slice(0, 3)}-500H`,
        name: `Kit Mantenimiento 500H - ${machine.brand} ${machine.model}`,
        brand: `${machine.brand} OEM Genuine`,
        category: 'Filtros',
        assemblyId: 'powertrain',
        compatibleModels: [machine.model, machine.brand],
        priceUsd: 285.00,
        stockQty: 40,
        image: '/assets/parts/heavy_oil_filter.jpg',
        description: `Kit completo para ${machine.brand} ${machine.model} (${machine.unitId}).`,
        isOem: true,
        deliveryTimeHours: 4
      };
      addToCart(kitPart, 1);
    });

    setHorometerFeedback(`¡Se añadieron ${dueMachines.length} Kits de Mantenimiento para sus equipos en alerta al carrito!`);
    setTimeout(() => {
      setHorometerFeedback(null);
    }, 4500);
  };

  // Load fleet & service records from Firestore & local persistence
  useEffect(() => {
    // Load local fleet
    let initialFleet = getLocalFleet();
    if (initialFleet.length === 0) {
      initialFleet = generateDemoFleet();
      saveFleetToLocalStorage(initialFleet);
    }
    setFleet(initialFleet);

    if (!currentUser) {
      const localOrders = getLocalServiceHistory();
      setServiceRecords(localOrders);
      setLoading(false);
      return;
    }

    setLoading(true);
    const local = getLocalServiceHistory().filter(
      (o) => o.clientId === currentUser.uid || o.clientId === 'guest'
    );

    const workOrdersCol = collection(db, 'work_orders');
    const q = isStaff || isAdmin
      ? query(workOrdersCol)
      : query(workOrdersCol, where('clientId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: ServiceWorkOrder[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as ServiceWorkOrder);
        });

        // Merge Firestore and local cache
        const combinedMap = new Map<string, ServiceWorkOrder>();
        local.forEach((o) => combinedMap.set(o.id || o.orderNumber, o));
        fetched.forEach((o) => combinedMap.set(o.id || o.orderNumber, o));

        const list = Array.from(combinedMap.values());
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setServiceRecords(list);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore work_orders read notice (using local cache fallback):', error);
        setServiceRecords(local);
        setLoading(false);
      }
    );

    // Fetch active shop repair orders from Fullbay
    fetchFullbayActiveRepairOrders().then((orders) => {
      if (orders && orders.length > 0) {
        setActiveFullbayOrders(orders);
      }
    }).catch((e) => console.warn('Fullbay active repair orders notice:', e));

    return () => unsubscribe();
  }, [currentUser, isStaff, isAdmin]);

  // Seed demo service history records
  const handleSeedDemoRecords = () => {
    if (!currentUser) return;
    const demo = generateDemoServiceHistory(
      currentUser.uid,
      userProfile?.displayName || currentUser.displayName || 'Ing. Manuel Tavares',
      userProfile?.companyName || 'Constructora del Caribe S.R.L.'
    );
    demo.forEach((rec) => saveServiceOrderToLocalStorage(rec));
    setServiceRecords((prev) => [...demo, ...prev]);

    if (fleet.length === 0) {
      const demoFleet = generateDemoFleet();
      setFleet(demoFleet);
      saveFleetToLocalStorage(demoFleet);
    }
  };

  // Register a new machine in local fleet
  const handleRegisterMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim() || !newSerial.trim()) return;

    const currentH = Number(newHorometer) || 0;
    const newMachine: RegisteredEquipment = {
      id: `eq-${Date.now()}`,
      unitId: newUnitId.trim() || `EQ-${fleet.length + 1}`,
      brand: newBrand,
      model: newModel.trim(),
      serialNumber: newSerial.trim(),
      year: newYear,
      currentHorometer: currentH,
      nextServiceHours: currentH + 250,
      serviceIntervalHours: 250,
      reminderThresholdHours: 100,
      reminderAutoEnabled: true,
      jobsiteLocation: newLocation.trim(),
      status: 'active',
      lastServiceDate: 'Pendiente primer servicio'
    };

    const updated = [newMachine, ...fleet];
    setFleet(updated);
    saveFleetToLocalStorage(updated);
    setShowAddMachineModal(false);
    
    // Reset form
    setNewUnitId('');
    setNewModel('');
    setNewSerial('');
    setNewHorometer(100);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateHorometer = async (equipmentId: string, newHorometer: number) => {
    const updated = updateEquipmentHorometer(equipmentId, newHorometer);
    setFleet(updated);
    setEditingHorometerId(null);
    setHorometerFeedback(`Horómetro actualizado a ${newHorometer.toLocaleString()} hrs.`);
    setTimeout(() => setHorometerFeedback(null), 3000);

    // Trigger maintenance check across fleet
    if (userProfile?.maintenanceAlertsEnabled !== false) {
      await checkMaintenanceReminders(updated);
    }
  };

  const handleQuickIncrementHorometer = async (equipmentId: string, deltaHours: number) => {
    const eq = fleet.find(f => f.id === equipmentId);
    if (!eq) return;
    const newHorometer = (eq.currentHorometer || 0) + deltaHours;
    await handleUpdateHorometer(equipmentId, newHorometer);
  };

  const handleResetServiceCycle = async (equipmentId: string, intervalHours: number = 500) => {
    const updated = completeEquipmentServiceCycle(equipmentId, intervalHours);
    setFleet(updated);
    setHorometerFeedback(`¡Servicio registrado! Próximo mantenimiento fijado a +${intervalHours}h.`);
    setTimeout(() => setHorometerFeedback(null), 3000);

    if (userProfile?.maintenanceAlertsEnabled !== false) {
      await checkMaintenanceReminders(updated);
    }
  };

  const handleManualCheckReminders = async () => {
    await checkMaintenanceReminders(fleet);
    setHorometerFeedback('Comprobación de alertas de mantenimiento ejecutada.');
    setTimeout(() => setHorometerFeedback(null), 3000);
  };

  // Machinery with maintenance due (< 100 hours or configured threshold)
  const threshold = userProfile?.maintenanceReminderThresholdHours || 100;
  const machinesDueForService = fleet.filter((m) => {
    const nextH = m.nextServiceHours || 0;
    const currH = m.currentHorometer || 0;
    return (nextH - currH) <= threshold;
  });

  // Filtered service history
  const filteredRecords = serviceRecords.filter((rec) => {
    if (selectedMachineFilter !== 'all') {
      const matchUnit = rec.equipmentUnitId === selectedMachineFilter;
      const matchSerial = rec.machineSerial === selectedMachineFilter;
      const matchModel = rec.machineModel.toLowerCase().includes(selectedMachineFilter.toLowerCase());
      if (!matchUnit && !matchSerial && !matchModel) return false;
    }

    if (serviceTypeFilter !== 'all') {
      if (serviceTypeFilter === 'preventive' && !rec.serviceType.startsWith('preventive')) return false;
      if (serviceTypeFilter === 'corrective' && rec.serviceType.startsWith('preventive')) return false;
      if (serviceTypeFilter === 'undercarriage' && rec.serviceType !== 'undercarriage') return false;
      if (serviceTypeFilter === 'hydraulic' && rec.serviceType !== 'hydraulic_repair') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = rec.orderNumber.toLowerCase().includes(q);
      const matchSerial = rec.machineSerial.toLowerCase().includes(q);
      const matchModel = rec.machineModel.toLowerCase().includes(q);
      const matchTech = (rec.assignedTechnician || '').toLowerCase().includes(q);
      const matchPart = (rec.installedParts || []).some(
        (p) => p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q)
      );
      return matchNum || matchSerial || matchModel || matchTech || matchPart;
    }

    return true;
  });

  // Calculate stats
  const totalServices = serviceRecords.length;
  const totalInstalledPartsCount = serviceRecords.reduce(
    (acc, r) => acc + (r.installedParts?.reduce((pAcc, p) => pAcc + p.quantity, 0) || r.installedPartsCount || 0),
    0
  );
  const activeMachinesCount = fleet.length;

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Fleet Overview */}
      <div className="bg-zinc-900 p-5 sm:p-6 rounded-[5px] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-400/20">
              <Wrench className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black font-display uppercase tracking-tight text-white">
              Historial de Mantenimiento & Repuestos Instalados
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl font-sans">
            Consulte la bitácora técnica certificada, horas de horómetro, diagnósticos de fábrica y piezas OEM instaladas en sus equipos registrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {serviceRecords.length === 0 && (
            <button
              onClick={handleSeedDemoRecords}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] text-xs transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cargar Historial de Ejemplo</span>
            </button>
          )}

          <button
            onClick={() => setShowAddMachineModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Registrar Equipo</span>
          </button>

          <button
            onClick={() => onNavigate('#/service')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] text-xs transition-all cursor-pointer shadow-md"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>Solicitar Servicio Técnico</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-400/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block font-display tracking-wider">
              Equipos en Flota
            </span>
            <span className="text-xl font-black text-white font-mono">
              {activeMachinesCount} {activeMachinesCount === 1 ? 'Unidad' : 'Unidades'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-[2px] bg-blue-500/10 text-sky-400 border border-sky-400/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block font-display tracking-wider">
              Servicios Ejecutados
            </span>
            <span className="text-xl font-black text-white font-mono">
              {totalServices} Certificados
            </span>
          </div>
        </div>

        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-400/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block font-display tracking-wider">
              Repuestos OEM Instalados
            </span>
            <span className="text-xl font-black text-white font-mono">
              {totalInstalledPartsCount} Piezas
            </span>
          </div>
        </div>

        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-[2px] bg-purple-500/10 text-purple-400 border border-purple-400/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block font-display tracking-wider">
              Garantía de Taller
            </span>
            <span className="text-xl font-black text-white font-mono">
              100% Cobertura TMD
            </span>
          </div>
        </div>
      </div>

      {/* Active Workshop Orders Timeline Strip (Fullbay Live Connect) */}
      {activeFullbayOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-sm font-black text-white uppercase font-display tracking-wider">
                Seguimiento de Taller en Vivo (Fullbay Shop Km 22)
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {activeFullbayOrders.length} {activeFullbayOrders.length === 1 ? 'unidad en proceso' : 'unidades en proceso'}
            </span>
          </div>

          <div className="space-y-4">
            {activeFullbayOrders.map((ord) => (
              <WorkshopLiveTimeline 
                key={ord.orderId}
                order={ord}
                onApproveEstimate={async (orderId) => {
                  try {
                    await approveFullbayEstimate(
                      orderId, 
                      true, 
                      userProfile?.displayName || currentUser?.displayName || 'Cliente TMD',
                      'Aprobación digital autorizada desde el portal web'
                    );
                    setActiveFullbayOrders((prev) => 
                      prev.map((o) => o.orderId === orderId ? { ...o, digitalApprovalStatus: 'approved' } : o)
                    );
                  } catch (e) {
                    console.error('Approval error:', e);
                  }
                }}
                onContactServiceAdvisor={(order) => {
                  const msg = `Hola TMD Taller, tengo una consulta sobre mi orden de taller ${order.fullbayOrderNumber} (${order.unitModel}, ${order.unitFicha}).`;
                  window.open(`https://wa.me/18095604000?text=${encodeURIComponent(msg)}`, '_blank');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fleet Registered Equipment Selector Strip & Maintenance Reminders */}
      {fleet.length > 0 && (
        <div className="space-y-3">
          {/* Active Maintenance Alert Banner (< 100 Hours) */}
          {machinesDueForService.length > 0 && (
            <div className="p-4 sm:p-5 rounded-[3px] bg-red-500/10 border-2 border-red-500/40 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-[2px] bg-red-500 text-white shadow-sm mt-0.5 shrink-0 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black font-display uppercase tracking-wide text-red-400">
                      ¡Alerta de Mantenimiento Preventivo Inminente! (&lt; 100 Horas)
                    </h4>
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black bg-red-500 text-white font-mono">
                      {machinesDueForService.length} {machinesDueForService.length === 1 ? 'Máquina' : 'Máquinas'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 max-w-2xl font-sans">
                    {machinesDueForService.map(m => `${m.unitId} (${m.model}) - Faltan ${(m.nextServiceHours || 0) - m.currentHorometer} hrs`).join(' • ')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOrderAllDueFilterKits}
                  className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black font-display uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 fill-black" />
                  <span>Pedir Kits de Filtros (1-Clic)</span>
                </button>
                <button
                  type="button"
                  onClick={handleManualCheckReminders}
                  className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer"
                >
                  Verificar Alertas
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('#/service')}
                  className="px-3.5 py-1.5 rounded-[2px] bg-red-600 hover:bg-red-500 text-white text-xs font-black font-display uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Coordinar Taller Móvil Km 22</span>
                </button>
              </div>
            </div>
          )}

          {horometerFeedback && (
            <div className="p-3 rounded-[3px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {horometerFeedback}
              </span>
              <button
                type="button"
                onClick={() => setHorometerFeedback(null)}
                className="text-emerald-300 hover:opacity-75 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 font-display">
              <Truck className="w-3.5 h-3.5" />
              <span>Mis Equipos & Horómetros Registrados ({fleet.length})</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleManualCheckReminders}
                className="text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 font-display uppercase tracking-wider"
                title="Comprobar alertas preventivas de horómetro"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Escanear Horómetros</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMachineFilter('all')}
                className={`text-xs font-bold transition-colors cursor-pointer font-display uppercase tracking-wider ${
                  selectedMachineFilter === 'all' ? 'text-amber-400 underline' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Ver Todas las Máquinas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {fleet.map((machine) => {
              const isSelected = selectedMachineFilter === machine.unitId || selectedMachineFilter === machine.serialNumber;
              const nextService = machine.nextServiceHours || (machine.currentHorometer + 500);
              const remainingHours = nextService - machine.currentHorometer;
              const isDueSoon = remainingHours <= threshold;
              const isOverdue = remainingHours <= 0;

              return (
                <div
                  key={machine.id}
                  className={`p-4 sm:p-5 rounded-[3px] border transition-all relative overflow-hidden flex flex-col justify-between h-full gap-3 ${
                    isDueSoon
                      ? 'bg-amber-500/10 border-red-500/60 shadow-sm'
                      : isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => setSelectedMachineFilter(isSelected ? 'all' : machine.unitId)}
                            className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-amber-400 border border-zinc-700 font-mono text-[10px] font-black cursor-pointer hover:opacity-80"
                          >
                            {machine.unitId}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 font-display uppercase">
                            {machine.brand}
                          </span>
                        </div>
                        <h4 
                          onClick={() => setSelectedMachineFilter(isSelected ? 'all' : machine.unitId)}
                          className="font-extrabold text-xs text-white line-clamp-1 cursor-pointer font-display uppercase tracking-tight"
                        >
                          {machine.model}
                        </h4>
                        <div className="text-[10px] font-mono text-zinc-500">
                          Serie: {machine.serialNumber}
                        </div>
                      </div>

                      {isDueSoon ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase border animate-pulse font-mono ${
                          isOverdue 
                            ? 'bg-red-500 text-white border-red-600' 
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {isOverdue ? 'Vencido' : `< ${threshold}h`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          Óptima
                        </span>
                      )}
                    </div>

                    {/* Maintenance countdown progress / pill */}
                    <div className={`p-2.5 rounded-[3px] border text-[10px] space-y-1 ${
                      isDueSoon
                        ? 'bg-red-500/15 border-red-500/30 text-red-300 font-bold'
                        : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>Próximo Servicio: <strong className="text-white font-mono">{nextService.toLocaleString()} hrs</strong></span>
                        <span className={isDueSoon ? 'text-red-400 font-black font-mono' : 'text-zinc-500 font-mono'}>
                          {isOverdue 
                            ? `Excedido por ${Math.abs(remainingHours)} hrs` 
                            : `Faltan ${remainingHours} hrs`}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-[1px] overflow-hidden">
                        <div 
                          className={`h-full rounded-[1px] ${isDueSoon ? 'bg-red-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, Math.max(0, (machine.currentHorometer / nextService) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horometer controls & Quick increment */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1 font-medium font-sans">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Horómetro Actual:
                      </span>
                      {editingHorometerId === machine.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempHorometerVal}
                            onChange={(e) => setTempHorometerVal(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-[10px] rounded-[2px] bg-zinc-800 border border-amber-400 text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateHorometer(machine.id, tempHorometerVal)}
                            className="px-1.5 py-0.5 rounded-[2px] bg-amber-400 text-black font-black text-[9px]"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingHorometerId(machine.id);
                            setTempHorometerVal(machine.currentHorometer);
                          }}
                          className="font-black text-white font-mono cursor-pointer hover:text-amber-400 underline decoration-dotted"
                          title="Click para editar horómetro directamente"
                        >
                          {machine.currentHorometer.toLocaleString()} hrs
                        </span>
                      )}
                    </div>

                    {/* Quick Horometer Add & Service Actions */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase mr-1 font-display">Simular:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickIncrementHorometer(machine.id, 10)}
                        className="px-2 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[9px] font-bold cursor-pointer transition-colors border border-zinc-750"
                        title="Sumar 10 horas de operación"
                      >
                        +10h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickIncrementHorometer(machine.id, 50)}
                        className="px-2 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[9px] font-bold cursor-pointer transition-colors border border-zinc-750"
                        title="Sumar 50 horas de operación"
                      >
                        +50h
                      </button>

                      {isDueSoon ? (
                        <button
                          type="button"
                          onClick={() => handleResetServiceCycle(machine.id, 500)}
                          className="ml-auto px-2 py-0.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] cursor-pointer transition-colors shadow-xs font-display uppercase"
                          title="Registrar servicio efectuado y programar siguiente ciclo de 500h"
                        >
                          ✓ Servicio Realizado (+500h)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedMachineFilter(isSelected ? 'all' : machine.unitId)}
                          className="ml-auto px-2 py-0.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold cursor-pointer border border-zinc-700 font-display uppercase"
                        >
                          {isSelected ? 'Ver Todos' : 'Ver Bitácora'}
                        </button>
                      )}
                    </div>

                    {/* 1-Click Maintenance Filter Kit Order & Technical Sheet */}
                    <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOrderFilterKitForMachine(machine)}
                        className="px-2 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs font-display uppercase tracking-wider"
                        title="Agregar kit de filtros genuinos 500h al carrito con tarifa Pro"
                      >
                        <ShoppingBag className="w-3 h-3 fill-black" />
                        <span>Kit Filtros (1-Clic)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMachineFilter(isSelected ? 'all' : machine.unitId)}
                        className={`px-2 py-1.5 rounded-[2px] text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors font-display uppercase tracking-wider ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        <FileText className="w-3 h-3 text-amber-400" />
                        <span>{isSelected ? 'Ver Todas' : 'Bitácora VIN'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 p-4 rounded-[5px] border border-zinc-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por N° de orden, pieza instalada, código OEM, técnico o síntoma..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>

        {/* Maintenance Type Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos los Servicios' },
            { id: 'preventive', label: 'Preventivos (250h/500h/1000h)' },
            { id: 'hydraulic', label: 'Hidráulica' },
            { id: 'undercarriage', label: 'Tren de Rodaje' },
            { id: 'corrective', label: 'Correctivos & Motor' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setServiceTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold font-display uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                serviceTypeFilter === tab.id
                  ? 'bg-amber-400 text-black shadow-sm font-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service History List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold font-display uppercase tracking-wider">Cargando bitácora de servicio técnico...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-[3px] bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/20">
            <Wrench className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-extrabold text-base text-white font-display uppercase tracking-tight">
              No hay registros de servicio encontrados
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              No se encontraron mantenimientos para la máquina o filtro seleccionado. Puede solicitar una nueva orden de servicio o cargar datos de muestra.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedDemoRecords}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cargar Bitácora Técnica de Demostración</span>
            </button>
            <button
              onClick={() => onNavigate('#/service')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-700"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Agendar Mantenimiento Preventivo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const installedCount = record.installedParts?.reduce((acc, p) => acc + p.quantity, 0) || record.installedPartsCount || 0;
            
            return (
              <div
                key={record.id || record.orderNumber}
                className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-5 sm:p-6 shadow-sm hover:border-amber-400/30 transition-all space-y-4"
              >
                {/* Header: Order Number, Date, Machine Unit & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-white font-mono">
                        {record.orderNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(record.orderNumber, record.orderNumber)}
                        title="Copiar Número de Orden"
                        className="p-1 hover:bg-zinc-800 rounded-[2px] text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedId === record.orderNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {record.equipmentUnitId && (
                        <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black font-black text-[11px] font-mono">
                          {record.equipmentUnitId}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[2px] text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completado & Certificado</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-white font-display uppercase">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        {record.machineModel}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-zinc-500">
                        Serie: {record.machineSerial}
                      </span>
                      {record.horometerHours && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {record.horometerHours.toLocaleString()} hrs de operación
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Ficha Técnica</span>
                    </button>
                    <button
                      onClick={() => onNavigate('#/service')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-400/20 font-bold font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Repetir / Nuevo Servicio</span>
                    </button>
                  </div>
                </div>

                {/* Service Details & Installed Parts Strip */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left Column: Service Description & Diagnostic */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block font-display">
                        Tipo de Mantenimiento Ejecutado
                      </span>
                      <h4 className="text-xs font-black text-white font-display uppercase tracking-tight">
                        {record.serviceCategory || record.serviceType.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-[11px] text-zinc-400 whitespace-pre-line leading-relaxed font-sans">
                        {record.workPerformed || record.description}
                      </p>
                    </div>

                    {record.assignedTechnician && (
                      <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-[2px] border border-zinc-800 text-[11px]">
                        <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-zinc-500 font-sans">Técnico Certificado: </span>
                          <strong className="text-white">{record.assignedTechnician}</strong>
                          {record.technicianTitle && (
                            <span className="text-[10px] text-zinc-500 block font-sans">{record.technicianTitle}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Installed OEM Parts (Repuestos Instalados) */}
                  <div className="md:col-span-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1 font-display">
                        <Settings className="w-3 h-3 text-amber-400" />
                        Repuestos OEM Instalados ({installedCount} {installedCount === 1 ? 'pieza' : 'piezas'})
                      </span>
                      {record.warrantyMonths && (
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">
                          Garantía: {record.warrantyMonths} meses
                        </span>
                      )}
                    </div>

                    {record.installedParts && record.installedParts.length > 0 ? (
                      <div className="space-y-1.5">
                        {record.installedParts.slice(0, 3).map((part, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-zinc-950 p-2 rounded-[2px] border border-zinc-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-1.5 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold shrink-0 border border-amber-400/20">
                                {part.partNumber}
                              </span>
                              <div className="min-w-0">
                                <span className="font-extrabold text-[11px] text-white truncate block">
                                  {part.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-sans">
                                  Marca: {part.brand} • Cantidad: <strong className="text-zinc-300 font-mono">{part.quantity}</strong>
                                </span>
                              </div>
                            </div>

                            {part.totalPriceUsd && (
                              <span className="font-mono text-[11px] font-bold text-white shrink-0 ml-2">
                                US$ {part.totalPriceUsd.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}

                        {record.installedParts.length > 3 && (
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="text-[10px] font-bold text-amber-400 hover:underline pl-2 cursor-pointer font-sans"
                          >
                            + {record.installedParts.length - 3} repuesto(s) adicional(es) en este informe...
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-[2px] bg-zinc-950 text-center text-xs text-zinc-500 border border-zinc-800 font-sans">
                        Mantenimiento preventivo por inspección y ajuste sin reemplazo de componentes mayores.
                      </div>
                    )}

                    {/* Service & Location Metadata Footer */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        Fecha: <strong className="text-zinc-300">{record.completedDate || formatDate(record.scheduledDate)}</strong>
                      </span>
                      {record.nextServiceDueHours && (
                        <span className="text-amber-400 font-bold font-mono">
                          Próximo a: {record.nextServiceDueHours.toLocaleString()} hrs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Technical Sheet Modal */}
      <ServiceDetailModal
        order={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApproveEstimate={async (orderId: string, approved: boolean) => {
          await approveFullbayEstimate(orderId, approved, userProfile?.displayName || 'Cliente TMD');
          if (selectedRecord && selectedRecord.id === orderId) {
            setSelectedRecord({ ...selectedRecord, status: approved ? 'in_progress' : 'requested' });
          }
          setHorometerFeedback(
            approved
              ? `¡Presupuesto para orden #${selectedRecord?.orderNumber} APROBADO digitalmente!`
              : `Solicitud de ajuste enviada a taller para orden #${selectedRecord?.orderNumber}.`
          );
        }}
        onNavigate={onNavigate}
      />

      {/* Add / Register Machine Modal */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 w-full max-w-lg rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-6 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-xs font-black uppercase text-amber-400 font-display tracking-wider">Registro de Flota</span>
                <h3 className="text-lg font-black font-display uppercase tracking-tight text-white">Registrar Nuevo Equipo o Maquinaria</h3>
              </div>
              <button
                onClick={() => setShowAddMachineModal(false)}
                className="p-1.5 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterMachine} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Marca *</label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-bold font-mono"
                  >
                    <option value="LiuGong">LiuGong</option>
                    <option value="JCB">JCB</option>
                    <option value="LS Tractor">LS Tractor</option>
                    <option value="Caterpillar">Caterpillar</option>
                    <option value="Komatsu">Komatsu</option>
                    <option value="Dynapac">Dynapac</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Ficha Interna / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. EX-02 o Ficha #05"
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Modelo del Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 922E Excavadora de Orugas o 3CX Retroexcavadora"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Número de Serie / VIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. LG922E-2024-1189"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Horómetro Actual (Hrs) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Ej. 450"
                    value={newHorometer}
                    onChange={(e) => setNewHorometer(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 font-display uppercase tracking-wider">Ubicación Actual de Operación</label>
                <input
                  type="text"
                  placeholder="Ej. Proyecto Circunvalación Norte, Santiago"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold font-display uppercase tracking-wider rounded-[2px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider rounded-[2px] shadow-sm cursor-pointer"
                >
                  Guardar Equipo en Flota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
