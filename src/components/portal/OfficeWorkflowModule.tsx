import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  Phone, 
  Mail, 
  Building2, 
  DollarSign, 
  Plus, 
  Download, 
  FileDown, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  User, 
  Check, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar, 
  Layers, 
  AlertCircle,
  TrendingUp,
  Briefcase,
  HardHat,
  BadgeCheck,
  Send,
  MapPin,
  FileSpreadsheet,
  Users,
  MessageSquare,
  Repeat,
  CreditCard,
  QrCode,
  Gauge,
  PackageCheck,
  CheckCheck,
  Share2,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { 
  PortalQuote, 
  ServiceWorkOrder, 
  UserProfile, 
  Currency, 
  RegisteredEquipment, 
  AdvancePaymentRecord, 
  TradeInEvaluation 
} from '../../types';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../../data/catalog';
import { useCart } from '../../context/CartContext';
import { downloadQuotePDF } from '../../utils/pdfGenerator';
import { 
  getQuoteWhatsAppUrl, 
  getWorkOrderDispatchWhatsAppUrl, 
  getPreventiveAlertWhatsAppUrl, 
  getGatePassWhatsAppUrl 
} from '../../utils/whatsappMessaging';
import { 
  getLocalFleet, 
  getHorometerHealthStatus, 
  updateEquipmentHorometer,
  completeEquipmentServiceCycle
} from '../../services/serviceHistoryService';
import { OFFICIAL_SERVICE_KITS, getBestServiceKitForMachine } from '../../data/serviceKitsData';

interface OfficeWorkflowModuleProps {
  quotes: PortalQuote[];
  workOrders: ServiceWorkOrder[];
  allUsers: UserProfile[];
  currency: Currency;
  onOpenCreateQuote: () => void;
  onUpdateQuoteStatus: (quoteId: string, newStatus: PortalQuote['status']) => void;
  onUpdateWorkOrderStatus: (orderId: string, newStatus: ServiceWorkOrder['status']) => void;
  onExportQuotePdf: (quote: PortalQuote) => void;
  onNavigate: (route: string) => void;
  onAddToCart?: (item: any) => void;
}

export const OfficeWorkflowModule: React.FC<OfficeWorkflowModuleProps> = ({
  quotes,
  workOrders,
  allUsers,
  currency,
  onOpenCreateQuote,
  onUpdateQuoteStatus,
  onUpdateWorkOrderStatus,
  onExportQuotePdf,
  onNavigate,
  onAddToCart
}) => {
  const { showToast } = useCart();
  const [activeSection, setActiveSection] = useState<
    'sales_quotes' | 'preventive_maintenance' | 'advances_ledger' | 'patio_dispatch' | 'service_dispatch' | 'client_accounts'
  >('sales_quotes');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'in_review' | 'approved' | 'rejected'>('all');
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<PortalQuote | null>(null);
  
  // Fleet and Preventive State
  const [fleetList, setFleetList] = useState<RegisteredEquipment[]>(() => getLocalFleet());
  const [selectedFleetUnit, setSelectedFleetUnit] = useState<RegisteredEquipment | null>(null);
  const [editingHorometerId, setEditingHorometerId] = useState<string | null>(null);
  const [newHorometerValue, setNewHorometerValue] = useState<number>(0);

  // Yard Bay allocations for Patio Km 22 with Gate Pass Tracking
  const [yardBays, setYardBays] = useState([
    {
      id: 'BAY-A1',
      bayName: 'Bahía A-1 (Excavación)',
      machineModel: 'JCB 3CX Eco Backhoe Loader',
      serial: 'JCB3CX-DOM-8942',
      status: 'ready_dispatch',
      statusLabel: 'Lista para Despacho',
      destination: 'Proyecto Autovía Samaná / Constructora Rizek',
      pdiStatus: 'Aprobado 60/60 Puntos',
      assignedTech: 'Ing. Carlos Peña',
      gatePassCode: 'GP-2026-8812',
      gatePassAuthorized: true,
      balanceCleared: true,
      carrierDriver: 'Rafael Santana (Lowboy Furgón #04)'
    },
    {
      id: 'BAY-A2',
      bayName: 'Bahía A-2 (Tierras)',
      machineModel: 'LiuGong 922E HD Excavator',
      serial: 'LG922E-2025-1104',
      status: 'pdi_inspect',
      statusLabel: 'PDI en Inspección',
      destination: 'Cantera San Cristóbal / Áridos del Sur',
      pdiStatus: 'Calibración de Bomba Hidráulica (45/60)',
      assignedTech: 'Técnico Roberto Valdez',
      gatePassCode: 'GP-2026-8813',
      gatePassAuthorized: false,
      balanceCleared: false,
      carrierDriver: 'Pendiente Asignación'
    },
    {
      id: 'BAY-B1',
      bayName: 'Bahía B-1 (Agrícola)',
      machineModel: 'LS Tractor MT357 Hydro',
      serial: 'LSMT-DOM-5520',
      status: 'available',
      statusLabel: 'Disponible Showroom',
      destination: 'Sede Central Km 22 (Venta Inmediata)',
      pdiStatus: 'Inspección PDI Completa',
      assignedTech: 'Patio TMD',
      gatePassCode: 'GP-2026-8814',
      gatePassAuthorized: false,
      balanceCleared: true,
      carrierDriver: 'Showroom Km 22'
    },
    {
      id: 'BAY-B2',
      bayName: 'Bahía B-2 (Compactación)',
      machineModel: 'Ammann ARX 26-2 Roller',
      serial: 'AMM-ARX-2024-77',
      status: 'reserved',
      statusLabel: 'Reservada con Inicial (50%)',
      destination: 'Alcaldía Sto Dgo Norte / Obras Públicas',
      pdiStatus: 'Pendiente Traslado Lowboy',
      assignedTech: 'Ing. Marcos Díaz',
      gatePassCode: 'GP-2026-8815',
      gatePassAuthorized: true,
      balanceCleared: true,
      carrierDriver: 'Transporte Díaz & Asocs.'
    },
    {
      id: 'BAY-C1',
      bayName: 'Bahía C-1 (Minería)',
      machineModel: 'LiuGong 856H Wheel Loader',
      serial: 'LG856H-2024-991',
      status: 'rented',
      statusLabel: 'En Alquiler Activo',
      destination: 'Mina Pueblo Viejo / Barrick Subcontratista',
      pdiStatus: 'Supervisión LiveLink Activa (1,240 hrs)',
      assignedTech: 'Unidad Móvil 02',
      gatePassCode: 'GP-2026-8816',
      gatePassAuthorized: true,
      balanceCleared: true,
      carrierDriver: 'Transporte Pesado Cibao'
    }
  ]);

  // Registered Corporate Clients
  const sampleClients = [
    {
      id: 'CLI-001',
      name: 'Constructora Malecon S.R.L.',
      rnc: '1-31-45678-9',
      contact: 'Ing. Fernando Morales',
      phone: '+1 (809) 555-0192',
      fleetCount: 5,
      creditStatus: 'Línea Aprobada (US$ 250,000)',
      city: 'Santo Domingo'
    },
    {
      id: 'CLI-002',
      name: 'Agregados & Minería del Cibao',
      rnc: '1-01-88992-1',
      contact: 'Lic. Rafael Santos',
      phone: '+1 (809) 555-4433',
      fleetCount: 8,
      creditStatus: 'Crédito Comercial 30 Días',
      city: 'Santiago de los Caballeros'
    },
    {
      id: 'CLI-003',
      name: 'Desarrollos Viales Punta Cana S.A.',
      rnc: '1-32-11029-4',
      contact: 'Ing. Melissa Almonte',
      phone: '+1 (829) 555-7811',
      fleetCount: 3,
      creditStatus: 'Contado / Leasing Bancario',
      city: 'Higüey / Punta Cana'
    }
  ];

  // Filtered Quotes
  const filteredQuotes = quotes.filter(q => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchClient = q.clientName?.toLowerCase().includes(term);
      const matchCompany = q.companyName?.toLowerCase().includes(term);
      const matchSummary = q.itemsSummary?.toLowerCase().includes(term);
      const matchNumber = q.quoteNumber?.toLowerCase().includes(term);
      return matchClient || matchCompany || matchSummary || matchNumber;
    }
    return true;
  });

  // Sales Pipeline Stats
  const totalPipelineUsd = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const approvedPipelineUsd = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const totalAdvancesUsd = quotes.reduce((acc, q) => acc + (q.downPaymentAmountUsd || 0), 0);
  const totalTradeInDeductionsUsd = quotes.reduce((acc, q) => acc + (q.tradeInDeductionUsd || 0), 0);
  const pendingCount = quotes.filter(q => q.status === 'submitted' || q.status === 'in_review').length;

  const formatAmount = (usd: number) => {
    if (currency === 'DOP') {
      const dop = usd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `US$ ${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const handleUpdateHorometer = (equipmentId: string, hours: number) => {
    const updated = updateEquipmentHorometer(equipmentId, hours, fleetList);
    setFleetList(updated);
    setEditingHorometerId(null);
  };

  const handleCompleteService = (equipmentId: string, intervalHours: number = 500) => {
    const updated = completeEquipmentServiceCycle(equipmentId, intervalHours, fleetList);
    setFleetList(updated);
  };

  const handleToggleGatePass = (bayId: string) => {
    setYardBays(prev => prev.map(b => {
      if (b.id === bayId) {
        const nextState = !b.gatePassAuthorized;
        return {
          ...b,
          gatePassAuthorized: nextState,
          status: nextState ? 'ready_dispatch' : 'pdi_inspect',
          statusLabel: nextState ? 'Pase de Salida Emitido' : 'PDI en Inspección'
        };
      }
      return b;
    }));
  };

  return (
    <div className="space-y-4 font-mono">
      {/* 1. EXECUTIVE WORKFLOW NAVIGATION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black font-black flex items-center justify-center shrink-0 shadow-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                Módulo Operativo de Oficina & Ventas TMD
              </h3>
              <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/30">
                Inside Operations Hub
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Integración de WhatsApp Business, control de anticipos Patio Km 22, trade-in y mantenimiento preventivo.
            </p>
          </div>
        </div>

        {/* Action: Create Quote for Customer */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCreateQuote}
            className="px-3.5 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer uppercase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NUEVA PROFORMA</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>PIPELINE TOTAL</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono">
            {formatAmount(totalPipelineUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">{quotes.length} COTIZACIONES FISCALES DGII</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>ANTICIPOS RECIBIDOS</span>
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-sky-400 font-mono">
            {formatAmount(totalAdvancesUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">POPULAR • BHD • BANRESERVAS</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>RETOMA TRADE-IN</span>
            <Repeat className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
            {formatAmount(totalTradeInDeductionsUsd)}
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">DEDUCIDO EN MAQUINARIA</span>
        </div>

        <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-bold uppercase mb-1">
            <span>PATIO KM 22 & BAHÍAS</span>
            <Truck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono">
            {yardBays.filter(b => b.gatePassAuthorized).length} / {yardBays.length} DESPACHOS
          </div>
          <span className="text-[10px] text-zinc-500 uppercase">{workOrders.length} ÓRDENES ACTIVAS</span>
        </div>
      </div>

      {/* 3. WORKFLOW TAB NAVIGATION PILLS */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSection('sales_quotes')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'sales_quotes'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PROFORMAS ({quotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('preventive_maintenance')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'preventive_maintenance'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span>HORÓMETROS ({fleetList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('advances_ledger')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'advances_ledger'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-sky-400" />
          <span>ANTICIPOS & BANCOS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('patio_dispatch')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'patio_dispatch'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>PATIO KM 22 ({yardBays.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('service_dispatch')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'service_dispatch'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>DESPACHO WHATSAPP ({workOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('client_accounts')}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase ${
            activeSection === 'client_accounts'
              ? 'bg-amber-400 text-black shadow-xs font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>CUENTAS & RNC</span>
        </button>
      </div>

      {/* SECTION 1: SALES & QUOTES PIPELINE WITH DIRECT WHATSAPP INTEGRATION */}
      {activeSection === 'sales_quotes' && (
        <div className="space-y-3">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="BUSCAR POR CLIENTE, EMPRESA, MÁQUINA O NCF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 uppercase focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              {(['all', 'submitted', 'in_review', 'approved', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                    statusFilter === st
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {st === 'all' ? 'TODAS' : st === 'submitted' ? 'ENVIADAS' : st === 'in_review' ? 'EN REVISIÓN' : st === 'approved' ? 'APROBADAS' : 'RECHAZADAS'}
                </button>
              ))}
            </div>
          </div>

          {/* Quotes Table / List */}
          {filteredQuotes.length === 0 ? (
            <div className="p-6 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-2.5">
              <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="font-bold text-xs text-white uppercase">No hay cotizaciones que coincidan con la búsqueda</h4>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Puedes emitir una nueva cotización formal con NCF B01/B02, Trade-In y anticipo para cualquier contratista.
              </p>
              <button
                type="button"
                onClick={onOpenCreateQuote}
                className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>CREAR COTIZACIÓN</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredQuotes.map(quote => {
                const waUrl = getQuoteWhatsAppUrl(quote, quote.phone, {
                  includeTradeIn: !!quote.tradeInDeductionUsd,
                  includeAdvance: !!quote.downPaymentAmountUsd
                });

                return (
                  <div
                    key={quote.id}
                    className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xs flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-black text-amber-400 block">
                            {quote.quoteNumber || 'TMD-COT-DGII'}
                          </span>
                          <h4 className="font-bold text-xs text-white line-clamp-1 uppercase">
                            {quote.clientName || 'Cliente TMD'}
                          </h4>
                          <span className="text-[10px] text-zinc-400 font-mono line-clamp-1 uppercase">
                            {quote.companyName ? `${quote.companyName} • ` : ''}RNC: {quote.rnc || 'NO REGISTRADO'}
                          </span>
                        </div>

                        <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider shrink-0 ${
                          quote.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : quote.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                        }`}>
                          {quote.status === 'approved' ? 'APROBADA' : quote.status === 'rejected' ? 'RECHAZADA' : quote.status === 'submitted' ? 'ENVIADA' : 'EN REVISIÓN'}
                        </span>
                      </div>

                      {/* Financial Badges: Trade In, Anticipo, NCF */}
                      <div className="flex flex-wrap gap-1">
                        {quote.ncfNumber && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-950 text-[9px] font-mono font-bold text-zinc-300 border border-zinc-800">
                            NCF: {quote.ncfNumber} ({quote.ncfType === 'B01_CREDITO_FISCAL' ? 'B01' : 'B02'})
                          </span>
                        )}
                        {quote.tradeInDeductionUsd && quote.tradeInDeductionUsd > 0 && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase">
                            <Repeat className="w-2.5 h-2.5" />
                            <span>TRADE-IN -US$ {quote.tradeInDeductionUsd.toLocaleString()}</span>
                          </span>
                        )}
                        {quote.downPaymentAmountUsd && quote.downPaymentAmountUsd > 0 && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-sky-500/10 text-[9px] font-bold text-sky-400 border border-sky-500/30 flex items-center gap-1 uppercase">
                            <CreditCard className="w-2.5 h-2.5" />
                            <span>ANTICIPO: US$ {quote.downPaymentAmountUsd.toLocaleString()}</span>
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[11px] space-y-0.5">
                        <p className="font-bold text-zinc-200 line-clamp-2 uppercase">
                          {quote.itemsSummary || 'Equipo / Repuestos'}
                        </p>
                        {quote.notes && (
                          <p className="text-[10px] text-zinc-400 italic line-clamp-1">
                            "{quote.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase font-bold block">TOTAL NETO DGII</span>
                          <span className="text-sm font-black text-white font-mono">
                            US$ {quote.total.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-zinc-500 ml-1 font-mono">
                            (~RD$ {(quote.total * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                          </span>
                        </div>

                        {/* Quick Approve / Reject Actions for Office Staff */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuoteStatus(quote.id, 'approved')}
                            className="p-1 rounded-[2px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Aprobar Cotización"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateQuoteStatus(quote.id, 'rejected')}
                            className="p-1 rounded-[2px] bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-colors cursor-pointer"
                            title="Rechazar Cotización"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp Business & Export Buttons */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WHATSAPP</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => downloadQuotePDF({ quote, includeSpecs: true })}
                          className="py-1.5 px-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>PDF DGII</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PREVENTIVE MAINTENANCE & HOROMETER RADAR */}
      {activeSection === 'preventive_maintenance' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase font-display">
                  RADAR DE HORÓMETROS & MANTENIMIENTO PREVENTIVO (250H / 500H / 1,000H)
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Monitoreo de intervalos de servicio de la flota de clientes, venta recurrente de kits OEM y alertas WhatsApp.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black self-start sm:self-auto uppercase">
              {fleetList.length} EQUIPOS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fleetList.map(machine => {
              const health = getHorometerHealthStatus(machine);
              const recommendedKit = getBestServiceKitForMachine(machine.brand, machine.model, machine.currentHorometer);
              const waAlertUrl = getPreventiveAlertWhatsAppUrl(machine, health.recommendedInterval, '+18095601234', machine.assignedOperator);

              return (
                <div
                  key={machine.id}
                  className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-950 text-amber-400 border border-zinc-800 inline-block mb-1">
                          FICHA: {machine.unitId}
                        </span>
                        <h5 className="font-bold text-xs text-white uppercase">
                          {machine.brand} {machine.model}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-mono">VIN: {machine.serialNumber}</p>
                      </div>

                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider ${health.badgeColor}`}>
                        {health.statusLabel}
                      </span>
                    </div>

                    {/* Horometer Progress Bar */}
                    <div className="space-y-1 p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500 font-bold uppercase">Horómetro:</span>
                        {editingHorometerId === machine.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={newHorometerValue}
                              onChange={(e) => setNewHorometerValue(Number(e.target.value))}
                              className="w-16 px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-amber-400 font-mono text-xs font-bold text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateHorometer(machine.id, newHorometerValue)}
                              className="px-1.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <strong className="font-mono text-white">
                              {machine.currentHorometer.toLocaleString()} hrs
                            </strong>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHorometerId(machine.id);
                                setNewHorometerValue(machine.currentHorometer);
                              }}
                              className="text-[9px] text-amber-400 underline font-bold uppercase"
                            >
                              Ajustar
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="w-full h-1.5 rounded-[1px] bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            health.status === 'overdue'
                              ? 'bg-rose-500'
                              : health.status === 'due_soon'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${health.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>PRÓXIMO: <strong>{machine.nextServiceHours.toLocaleString()}h</strong></span>
                        <span className="font-bold">{health.hoursRemaining}h RESTANTES</span>
                      </div>
                    </div>

                    {/* Recommended OEM Service Kit */}
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                      <span className="text-[9px] font-bold uppercase text-amber-400 block font-mono">
                        KIT RECOMENDADO ({recommendedKit.intervalHours}H)
                      </span>
                      <p className="font-bold text-white text-[11px] line-clamp-1 uppercase">
                        {recommendedKit.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-zinc-500 font-mono">P/N: {recommendedKit.kitCode}</span>
                        <strong className="text-amber-400 font-mono">
                          US$ {recommendedKit.priceUsd.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Send WhatsApp Alert & Mark Serviced */}
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <a
                        href={waAlertUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WHATSAPP</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart({
                              id: recommendedKit.id,
                              name: recommendedKit.title,
                              price: recommendedKit.priceUsd,
                              category: 'Kits de Servicio',
                              quantity: 1,
                              image: recommendedKit.image
                            });
                          }
                          showToast(`Kit ${recommendedKit.kitCode} agregado al carrito de repuestos.`);
                        }}
                        className="py-1.5 px-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                      >
                        <PackageCheck className="w-3 h-3 text-amber-400" />
                        <span>ORDENAR</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCompleteService(machine.id, health.recommendedInterval)}
                      className="w-full py-1.5 px-2 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                    >
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                      <span>REGISTRAR SERVICIO (+{health.recommendedInterval}H)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: ADVANCES & FINANCIAL RECONCILIATION (PATIO KM 22) */}
      {activeSection === 'advances_ledger' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[2px] bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase font-display">
                  LIBRO DE ANTICIPOS & CONTROL DE SALDOS (BANCA DOMINICANA)
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Validación de transferencias bancarias (Popular, BHD, Banreservas) para liberación de pases de salida en Patio Km 22.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-sky-500 text-black self-start sm:self-auto uppercase">
              ANTICIPOS: {formatAmount(totalAdvancesUsd)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotes.filter(q => (q.downPaymentAmountUsd || 0) > 0 || q.status === 'approved').map(q => {
              const advanceUsd = q.downPaymentAmountUsd || Math.round(q.total * 0.3);
              const balanceDue = Math.max(0, q.total - advanceUsd - (q.tradeInDeductionUsd || 0));
              const isCleared = balanceDue === 0 || q.status === 'approved';

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-black text-sky-400 block">
                          {q.quoteNumber}
                        </span>
                        <h5 className="font-bold text-xs text-white uppercase">
                          {q.clientName}
                        </h5>
                        <p className="text-[10px] text-zinc-500 uppercase">{q.companyName || 'Constructora'}</p>
                      </div>

                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase ${
                        isCleared
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      }`}>
                        {isCleared ? 'AUTORIZADO SALIDA' : 'SALDO PENDIENTE'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[11px] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase">Banco Receptor:</span>
                        <strong className="text-zinc-300 uppercase">{q.downPaymentMethod || 'Banco Popular Dominicano'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase">Ref. Bancaria:</span>
                        <strong className="font-mono text-zinc-300">{q.downPaymentReference || 'TRF-BPD-994102'}</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-zinc-800">
                        <span className="text-sky-400 font-bold uppercase">Anticipo Recibido:</span>
                        <strong className="font-mono text-sky-400">US$ {advanceUsd.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-bold uppercase">Saldo por Cobrar:</span>
                        <strong className="font-mono text-white">US$ {balanceDue.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => showToast(`NCF ${q.ncfNumber || 'B0100008892'} y anticipo US$ ${advanceUsd.toLocaleString()} conciliados con Tesorería TMD.`)}
                      className="w-full py-1.5 px-2.5 rounded-[2px] bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CONCILIAR CON BANCO</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: PATIO KM 22 DISPATCH & GATE PASS LOGISTICS */}
      {activeSection === 'patio_dispatch' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[5px] bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase font-display">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>PATIO CENTRAL KM 22 • PDI & PASES DE SALIDA (GATE PASS)</span>
              </h4>
              <p className="text-[11px] text-zinc-400">
                Supervisión física de maquinaria, inspección PDI de 60 puntos, verificación de saldo y despacho en Lowboys.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30 self-start sm:self-auto uppercase">
              5 BAHÍAS ACTIVAS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {yardBays.map(bay => {
              const waGatePassUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                `🎟️ *TMD DOMINICANA | PASE DE SALIDA AUTORIZADO*\n` +
                `📍 *PATIO CENTRAL KM 22 - AUTOPISTA DUARTE*\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `✅ *CÓDIGO:* \`${bay.gatePassCode}\`\n` +
                `🚜 *Equipo:* ${bay.machineModel} (${bay.serial})\n` +
                `🏢 *Bahía:* ${bay.bayName}\n` +
                `🚚 *Chofer Lowboy:* ${bay.carrierDriver}\n` +
                `📍 *Destino:* ${bay.destination}\n` +
                `🔒 Autorizado por Gerencia de Patio Km 22.`
              )}`;

              return (
                <div
                  key={bay.id}
                  className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wider bg-zinc-950 text-zinc-300 border border-zinc-800 inline-block mb-1">
                          {bay.bayName}
                        </span>
                        <h5 className="font-bold text-xs text-white uppercase">
                          {bay.machineModel}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-mono">CHASIS: {bay.serial}</p>
                      </div>

                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider ${
                        bay.gatePassAuthorized
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                      }`}>
                        {bay.statusLabel}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-[11px] space-y-1">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate"><strong>DESTINO:</strong> {bay.destination}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span><strong>PDI:</strong> {bay.pdiStatus}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Truck className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate"><strong>TRANSPORTE:</strong> {bay.carrierDriver}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px]">
                        <span className="text-zinc-500 uppercase">Pase Salida:</span>
                        <strong className="font-mono text-amber-400">{bay.gatePassCode}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleGatePass(bay.id)}
                        className={`py-1.5 px-2 rounded-[2px] text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase ${
                          bay.gatePassAuthorized
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <QrCode className="w-3 h-3" />
                        <span>{bay.gatePassAuthorized ? 'REVOCAR' : 'EMITIR'}</span>
                      </button>

                      <a
                        href={waGatePassUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer uppercase"
                      >
                        <MessageSquare className="w-3 h-3 text-amber-400" />
                        <span>WHATSAPP</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: WORKSHOP & SERVICE DISPATCH VIA WHATSAPP */}
      {activeSection === 'service_dispatch' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase font-display">
                ÓRDENES DE SERVICIO TÉCNICO & DESPACHO WHATSAPP
              </h4>
              <p className="text-[11px] text-zinc-400">
                Notificación instantánea a mecánicos certificados para canteras y obras con piezas OEM y diagnóstico.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase">
              {workOrders.length} ÓRDENES
            </span>
          </div>

          {workOrders.length === 0 ? (
            <div className="p-6 rounded-[3px] bg-zinc-900 border border-zinc-800 text-center space-y-1.5">
              <Wrench className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-500 uppercase">No hay órdenes de servicio pendientes de despacho.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workOrders.map(order => {
                const waDispatchUrl = getWorkOrderDispatchWhatsAppUrl(order, '+18095601234');

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 block">
                          {order.orderNumber}
                        </span>
                        <h5 className="font-bold text-xs text-white uppercase">
                          {order.machineModel}
                        </h5>
                        <span className="text-[10px] text-zinc-500 font-mono">SERIE: {order.machineSerial || 'N/D'}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'in_progress'
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {order.status === 'completed' ? 'COMPLETADO' : order.status === 'in_progress' ? 'EN PROGRESO' : 'SOLICITADO'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-300 space-y-1 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <p><strong>UBICACIÓN:</strong> {order.location}</p>
                      <p><strong>TIPO:</strong> {order.serviceType.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>TÉCNICO:</strong> {order.assignedTechnician || 'Ing. Carlos Santana'}</p>
                      {order.description && <p className="italic text-[10px] text-zinc-400">"{order.description}"</p>}
                    </div>

                    {/* Staff dispatch controls & WhatsApp */}
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs gap-2">
                      <a
                        href={waDispatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer uppercase text-[11px]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WHATSAPP TÉCNICO</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateWorkOrderStatus(order.id, 'in_progress')}
                          className="px-2 py-1 rounded-[2px] bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-400/20 font-bold transition-colors cursor-pointer text-[10px] uppercase"
                        >
                          EN PROGRESO
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateWorkOrderStatus(order.id, 'completed')}
                          className="px-2 py-1 rounded-[2px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 font-bold transition-colors cursor-pointer text-[10px] uppercase"
                        >
                          RESUELTO
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: CORPORATE CLIENT DOSSIER & RNC */}
      {activeSection === 'client_accounts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase font-display">
                DIRECTORIO DE CLIENTES CORPORATIVOS & RNC
              </h4>
              <p className="text-[11px] text-zinc-400">
                Empresas constructoras, contratistas y mineras con créditos pre-aprobados y maquinaria asignada.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
              {sampleClients.length} CUENTAS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sampleClients.map(client => (
              <div
                key={client.id}
                className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-[2px] bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RNC VALIDADO
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-white uppercase">
                    {client.name}
                  </h5>
                  <p className="text-[10px] text-zinc-500 font-mono">RNC: {client.rnc}</p>
                </div>

                <div className="text-[11px] space-y-1 p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <p><strong>CONTACTO:</strong> {client.contact}</p>
                  <p><strong>TELÉFONO:</strong> {client.phone}</p>
                  <p><strong>CONDICIÓN:</strong> <span className="text-amber-400 font-bold">{client.creditStatus}</span></p>
                  <p><strong>FLOTA ACTIVA:</strong> {client.fleetCount} máquinas</p>
                </div>

                <button
                  type="button"
                  onClick={onOpenCreateQuote}
                  className="w-full py-1.5 px-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase"
                >
                  <FileText className="w-3 h-3" />
                  <span>EMITIR PROFORMA</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
