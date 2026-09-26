import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  UserCheck, 
  FileText, 
  Truck, 
  Package, 
  ChevronRight, 
  RefreshCw, 
  DollarSign, 
  Building,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';
import { FullbayWorkOrder, FullbayTechnician, FullbayOrderStatus } from '../../types';
import { 
  fetchFullbayWorkOrders, 
  fetchFullbayTechnicians, 
  createFullbayWorkOrder, 
  updateFullbayWorkOrderStatus 
} from '../../services/fullbayService';

interface Props {
  initialSelectedOrderId?: string;
  onNavigateToLiveLink?: () => void;
}

export const FullbayShopManager: React.FC<Props> = ({ initialSelectedOrderId, onNavigateToLiveLink }) => {
  const [workOrders, setWorkOrders] = useState<FullbayWorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<FullbayTechnician[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FullbayWorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerCompany: '',
    customerPhone: '',
    unitModel: 'JCB 3CX Eco 4x4',
    unitBrand: 'JCB',
    unitVin: '',
    unitHorometer: 1500,
    priority: 'urgent' as const,
    serviceDepartment: 'Taller Central Km 22' as const,
    complaint: '',
    assignedTechnicianId: 'tech-01',
    ncfType: 'B01_CREDITO_FISCAL' as const
  });

  const loadData = async () => {
    try {
      const [orders, techs] = await Promise.all([
        fetchFullbayWorkOrders(),
        fetchFullbayTechnicians()
      ]);
      setWorkOrders(orders);
      setTechnicians(techs);

      if (initialSelectedOrderId) {
        const match = orders.find(o => o.id === initialSelectedOrderId);
        if (match) setSelectedOrder(match);
      } else if (orders.length > 0 && !selectedOrder) {
        setSelectedOrder(orders[0]);
      }
    } catch (e) {
      console.error('Error loading Fullbay shop data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialSelectedOrderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: FullbayOrderStatus) => {
    const res = await updateFullbayWorkOrderStatus(orderId, { status: newStatus });
    if (res.success && res.workOrder) {
      setActionFeedback(`Estado actualizado a: ${newStatus.toUpperCase()}`);
      setSelectedOrder(res.workOrder);
      loadData();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleAddLaborHours = async (orderId: string, currentHours: number) => {
    const additional = 1.0;
    const res = await updateFullbayWorkOrderStatus(orderId, { 
      technicianLaborHours: currentHours + additional,
      technicianClockStatus: 'clocked_in'
    });
    if (res.success && res.workOrder) {
      setActionFeedback(`+1.0 hora de mano de obra registrada.`);
      setSelectedOrder(res.workOrder);
      loadData();
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTech = technicians.find(t => t.id === newOrder.assignedTechnicianId);
    
    const res = await createFullbayWorkOrder({
      ...newOrder,
      assignedTechnicianName: assignedTech ? assignedTech.name : 'Ing. Marcos Peña',
      status: 'scheduled',
      laborRateUsd: 65,
      technicianLaborHours: 2.0,
      totalLaborUsd: 130,
      totalPartsUsd: 0,
      totalAmountUsd: 130,
      totalAmountDop: 7800
    });

    if (res.success && res.workOrder) {
      setShowCreateModal(false);
      setActionFeedback(`¡Orden ${res.workOrder.fullbayOrderNumber} creada exitosamente en Fullbay!`);
      setSelectedOrder(res.workOrder);
      loadData();
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const filteredOrders = workOrders.filter(o => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    return true;
  });

  return (
    <div id="fullbay-shop-root" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              FULLBAY HEAVY-DUTY SHOP MANAGEMENT • HUB CENTRAL KM 22 AUTOPISTA DUARTE
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wider font-display">
              GESTIÓN DE ÓRDENES DE SERVICIO & TALLER DIÉSEL
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl font-mono uppercase">
              Control integral de reparaciones, mecánicos certificados, despacho de unidades móviles 24/7 y facturación fiscal NCF (DGII).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-mono font-bold uppercase text-xs tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              ACTUALIZAR
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-mono font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black" />
              NUEVA ORDEN FULLBAY
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {actionFeedback && (
        <div className="p-3.5 rounded-[4px] bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {actionFeedback}
        </div>
      )}

      {/* Main Content Layout: Orders List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Orders List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 font-display">
                <FileText className="w-4 h-4 text-amber-400" />
                ÓRDENES DE TRABAJO ({filteredOrders.length})
              </h2>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-[3px] px-2.5 py-1 text-zinc-300 text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
              >
                <option value="all">TODOS LOS ESTADOS</option>
                <option value="triage">TRIAGE / EVALUACIÓN</option>
                <option value="scheduled">PROGRAMADAS</option>
                <option value="in_progress">EN PROGRESO</option>
                <option value="waiting_parts">ESPERANDO REPUESTOS</option>
                <option value="quality_check">CONTROL DE CALIDAD</option>
                <option value="invoiced">FACTURADAS NCF</option>
              </select>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 rounded-[4px] border transition-all cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-zinc-900 border-amber-500 ring-1 ring-amber-500/30' 
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-400">
                            {order.fullbayOrderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-black uppercase ${
                            order.priority === 'emergency' 
                              ? 'bg-rose-500 text-white' 
                              : order.priority === 'urgent' 
                                ? 'bg-amber-500 text-black' 
                                : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {order.priority}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase mt-1">
                          {order.unitModel} ({order.unitFicha})
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-mono uppercase">
                          {order.customerCompany} • {order.customerName}
                        </p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-black text-white block">
                          ${order.totalAmountUsd?.toLocaleString()} USD
                        </span>
                        <div className="mt-0.5 text-[10px] text-zinc-400">
                          {order.ncfNumber || order.ncfType}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono uppercase">
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        {order.assignedTechnicianName}
                      </span>
                      <span className="font-bold text-amber-400">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order Detail & Actions */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] p-5 sm:p-6 shadow-sm space-y-6 text-white font-mono">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[2px] font-mono text-[11px] font-black bg-amber-500 text-black uppercase">
                      {selectedOrder.fullbayOrderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-400 uppercase">
                      {selectedOrder.serviceDepartment}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mt-1.5 font-display">
                    {selectedOrder.unitModel} • {selectedOrder.unitFicha}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 uppercase">
                    CLIENTE: <strong className="text-white">{selectedOrder.customerCompany}</strong> ({selectedOrder.customerName}) • TEL: {selectedOrder.customerPhone || 'KM 22'}
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">ESTADO DEL TRABAJO</span>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value as FullbayOrderStatus)}
                    className="block bg-zinc-900 border border-zinc-800 rounded-[3px] px-2.5 py-1 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="triage">TRIAGE / RECEPCIÓN</option>
                    <option value="scheduled">PROGRAMADO</option>
                    <option value="in_progress">EN PROGRESO (MECÁNICO)</option>
                    <option value="waiting_parts">ESPERANDO REPUESTOS</option>
                    <option value="quality_check">CONTROL DE CALIDAD</option>
                    <option value="invoiced">FACTURADO NCF</option>
                    <option value="closed">CERRADO / ENTREGADO</option>
                  </select>
                </div>
              </div>

              {/* Diagnostic & Complaint */}
              <div className="bg-zinc-900 p-4 rounded-[4px] border border-zinc-800 space-y-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block font-display">
                  REPORTE DEL CLIENTE & DIAGNÓSTICO
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed uppercase">
                  {selectedOrder.complaint}
                </p>
                {selectedOrder.correction && (
                  <p className="text-xs text-emerald-400 font-bold pt-2 border-t border-zinc-800 uppercase">
                    <strong>ACCIÓN CORRECTIVA TMD:</strong> {selectedOrder.correction}
                  </p>
                )}
              </div>

              {/* Technician & Labor Module */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="bg-zinc-900 p-4 rounded-[4px] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">TÉCNICO ASIGNADO</span>
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-950 text-emerald-400 border border-zinc-800 uppercase">
                      {selectedOrder.technicianClockStatus === 'clocked_in' ? 'EN BAHÍA' : 'DISPONIBLE'}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs flex items-center gap-2 uppercase">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    {selectedOrder.assignedTechnicianName}
                  </div>
                  <p className="text-[11px] text-zinc-400 uppercase">
                    TARIFA: ${selectedOrder.laborRateUsd} USD / HORA
                  </p>
                </div>

                <div className="bg-zinc-900 p-4 rounded-[4px] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">HORAS MANO DE OBRA</span>
                    <button
                      onClick={() => handleAddLaborHours(selectedOrder.id, selectedOrder.technicianLaborHours)}
                      className="px-2 py-0.5 rounded-[2px] bg-amber-500 text-black font-black text-[10px] hover:bg-amber-400 uppercase transition cursor-pointer"
                    >
                      +1.0 HORA
                    </button>
                  </div>
                  <div className="text-lg font-black text-white font-mono">
                    {selectedOrder.technicianLaborHours.toFixed(1)} <span className="text-xs text-zinc-500 uppercase">HORAS</span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-bold uppercase">
                    TOTAL LABOR: ${selectedOrder.totalLaborUsd?.toFixed(2)} USD
                  </p>
                </div>
              </div>

              {/* Parts Allocated Table */}
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-white flex items-center gap-2 font-display">
                    <Package className="w-4 h-4 text-amber-400" />
                    REPUESTOS ASIGNADOS (ALMACÉN CENTRAL KM 22)
                  </h3>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase">
                    TOTAL: ${selectedOrder.totalPartsUsd?.toFixed(2)} USD
                  </span>
                </div>

                {selectedOrder.partsRequired && selectedOrder.partsRequired.length > 0 ? (
                  <div className="border border-zinc-800 rounded-[4px] overflow-hidden bg-zinc-900">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-950 text-zinc-400 text-[10px] uppercase font-bold border-b border-zinc-800">
                        <tr>
                          <th className="p-2.5">CÓDIGO / PARTE</th>
                          <th className="p-2.5">CANT</th>
                          <th className="p-2.5">PRECIO UNIT</th>
                          <th className="p-2.5 text-right">SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {selectedOrder.partsRequired.map((p, i) => (
                          <tr key={i} className="hover:bg-zinc-800/50">
                            <td className="p-2.5 font-bold text-white uppercase">
                              <span className="text-amber-400 mr-1">{p.partNumber}</span> - {p.name}
                            </td>
                            <td className="p-2.5 font-bold">{p.quantity}</td>
                            <td className="p-2.5">${p.unitCostUsd?.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-black text-amber-400">
                              ${p.totalCostUsd?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 p-3 bg-zinc-900 rounded-[4px] border border-zinc-800 uppercase">
                    NO SE HAN CARGADO REPUESTOS ADICIONALES EN ESTA ORDEN.
                  </p>
                )}
              </div>

              {/* Fiscal Invoice Summary (NCF B01) */}
              <div className="bg-zinc-900 p-4 sm:p-5 rounded-[4px] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-black bg-amber-500 text-black uppercase">
                      {selectedOrder.ncfType}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      NCF: {selectedOrder.ncfNumber || 'POR GENERAR'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 uppercase">
                    COMPROBANTE FISCAL VÁLIDO PARA CRÉDITO FISCAL DGII REPÚBLICA DOMINICANA.
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="text-xl font-black text-amber-400 font-mono">
                    ${selectedOrder.totalAmountUsd?.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    RD$ {selectedOrder.totalAmountDop?.toLocaleString()} DOP (TASA 60.00)
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-zinc-800 rounded-[5px] text-zinc-500 text-xs font-mono uppercase bg-zinc-950">
              SELECCIONE UNA ORDEN DE SERVICIO PARA VER EL DETALLE TÉCNICO
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create Work Order */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-[5px] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black uppercase text-white flex items-center gap-2 font-display">
                <Wrench className="w-4 h-4 text-amber-400" />
                NUEVA ORDEN DE SERVICIO FULLBAY
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1 uppercase">NOMBRE CONTACTO</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customerName}
                    onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[3px] p-2.5 text-white uppercase focus:outline-none focus:border-amber-500"
                    placeholder="ING. RAFAEL GÓMEZ"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1 uppercase">EMPRESA / RAZÓN SOCIAL</label>
                  <input
                    type="text"
                    required
                    value={newOrder.customerCompany}
                    onChange={e => setNewOrder({ ...newOrder, customerCompany: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[3px] p-2.5 text-white uppercase focus:outline-none focus:border-amber-500"
                    placeholder="CONSTRUCTORA DEL ESTE S.R.L."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1 uppercase">MODELO DE MAQUINARIA</label>
                  <select
                    value={newOrder.unitModel}
                    onChange={e => setNewOrder({ ...newOrder, unitModel: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[3px] p-2.5 text-white uppercase focus:outline-none focus:border-amber-500"
                  >
                    <option value="JCB 3CX Eco 4x4">JCB 3CX ECO 4X4</option>
                    <option value="JCB 220X Excavator">JCB 220X HEAVY EXCAVATOR</option>
                    <option value="LiuGong 922E HD">LIUGONG 922E HEAVY DUTY</option>
                    <option value="LiuGong CLG856H">LIUGONG CLG856H WHEEL LOADER</option>
                    <option value="Kubota M7-172 Tractor">KUBOTA M7-172 PREMIUM</option>
                    <option value="Ammann ASC 110">AMMANN ASC 110 RODILLO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-bold mb-1 uppercase">DEPARTAMENTO DE TALLER</label>
                  <select
                    value={newOrder.serviceDepartment}
                    onChange={e => setNewOrder({ ...newOrder, serviceDepartment: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-[3px] p-2.5 text-white uppercase focus:outline-none focus:border-amber-500"
                  >
                    <option value="Taller Central Km 22">TALLER CENTRAL KM 22</option>
                    <option value="Unidad Móvil Campo 24/7">UNIDAD MÓVIL CAMPO 24/7</option>
                    <option value="Hidráulica y Banqueo">HIDRÁULICA Y BANQUEO</option>
                    <option value="Overhaul Motores">OVERHAUL MOTORES</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1 uppercase">SÍNTOMA O REQUERIMIENTO TÉCNICO</label>
                <textarea
                  required
                  rows={3}
                  value={newOrder.complaint}
                  onChange={e => setNewOrder({ ...newOrder, complaint: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-[3px] p-2.5 text-white uppercase focus:outline-none focus:border-amber-500"
                  placeholder="DESCRIBA EL FALLO, FUGA HIDRÁULICA, HORAS O CÓDIGO DTC..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase cursor-pointer border border-zinc-800"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase cursor-pointer shadow-md"
                >
                  CREAR ORDEN DE TRABAJO
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
