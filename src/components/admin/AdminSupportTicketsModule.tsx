import React, { useState, useMemo } from 'react';
import { 
  LifeBuoy, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  PhoneCall, 
  Plus, 
  Send, 
  ArrowUpRight, 
  MapPin, 
  Wrench, 
  Radio, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { EMERGENCY_SERVICE_TRUCKS, INITIAL_EMERGENCY_TICKETS } from '../../data/emergencyData';
import { EmergencyTicket, EmergencyServiceTruck } from '../../types';

interface AdminSupportTicketsModuleProps {
  onNavigateToEmergency?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const AdminSupportTicketsModule: React.FC<AdminSupportTicketsModuleProps> = ({
  onNavigateToEmergency,
  isExpanded = false,
  onToggleExpand
}) => {
  const [tickets, setTickets] = useState<EmergencyTicket[]>(INITIAL_EMERGENCY_TICKETS);
  const [trucks, setTrucks] = useState<EmergencyServiceTruck[]>(EMERGENCY_SERVICE_TRUCKS);
  const [activeTab, setActiveTab] = useState<'tickets' | 'mobile_units' | 'new_ticket'>('tickets');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'en_camino' | 'resuelto'>('unresolved');

  // New Ticket form state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [zone, setZone] = useState<'Santo Domingo' | 'Cibao' | 'Este' | 'Sur' | 'Noroeste'>('Santo Domingo');
  const [machineModel, setMachineModel] = useState('JCB 3CX Eco');
  const [faultDescription, setFaultDescription] = useState('');
  const [severity, setSeverity] = useState<'URGENTE_PARADA' | 'ALERTA_OPERATIVA' | 'MANTENIMIENTO_URGENTE'>('URGENTE_PARADA');

  // Ticket metrics
  const totalTickets = tickets.length;
  const unresolvedTickets = tickets.filter(t => t.status !== 'resuelto');
  const urgentParadaCount = tickets.filter(t => t.severity === 'URGENTE_PARADA' && t.status !== 'resuelto').length;
  const enRouteTrucks = trucks.filter(t => t.currentStatus === 'en_route').length;
  const availableTrucks = trucks.filter(t => t.currentStatus === 'available').length;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !faultDescription.trim()) return;

    const assignedUnit = zone === 'Cibao' ? 'TMD-MÓVIL-02' : zone === 'Este' ? 'TMD-MÓVIL-03' : zone === 'Sur' ? 'TMD-MÓVIL-04' : 'TMD-MÓVIL-01';

    const newTkt: EmergencyTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `SOS-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      phone: phone || '809-555-0199',
      locationAddress: locationAddress || 'Obra en Campo',
      zone,
      machineModel,
      faultDescription,
      severity,
      status: 'recibido',
      assignedUnitCode: assignedUnit,
      createdAt: 'Hace un momento',
      estimatedArrivalMin: zone === 'Santo Domingo' ? 40 : 60
    };

    setTickets(prev => [newTkt, ...prev]);
    setActiveTab('tickets');
    setClientName('');
    setPhone('');
    setLocationAddress('');
    setFaultDescription('');
  };

  const handleUpdateStatus = (ticketId: string, nextStatus: EmergencyTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t));
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'all') return tickets;
    if (statusFilter === 'unresolved') return tickets.filter(t => t.status !== 'resuelto');
    if (statusFilter === 'en_camino') return tickets.filter(t => t.status === 'en_camino');
    if (statusFilter === 'resuelto') return tickets.filter(t => t.status === 'resuelto');
    return tickets;
  }, [tickets, statusFilter]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full transition-all">
      {/* Card Header with Module Priority Indicator */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 font-black">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                Módulo Support & SOS
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                Activo
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {unresolvedTickets.length} Tickets Abiertos • {trucks.length} Unidades Móviles 24/7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isExpanded ? "Vista Normal" : "Maximizar Módulo"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-zinc-100/40 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800/60 text-center">
        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Parada Crítica</span>
          <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {urgentParadaCount} urgentes
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Talleres en Ruta</span>
          <span className="text-xs sm:text-sm font-black text-amber-500 flex items-center justify-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {enRouteTrucks} en camino
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Flota Disponible</span>
          <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
            {availableTrucks} en base
          </span>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Tickets ({unresolvedTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('mobile_units')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mobile_units'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Talleres 4x4
          </button>
          <button
            onClick={() => setActiveTab('new_ticket')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'new_ticket'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Nuevo SOS</span>
          </button>
        </div>

        {onNavigateToEmergency && (
          <button
            onClick={onNavigateToEmergency}
            className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
          >
            <span>Despacho 24/7</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Content Area with Conditional Views */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin">
        {/* 1. Tickets List */}
        {activeTab === 'tickets' && (
          <div className="space-y-3">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 pb-1">
              {(['unresolved', 'en_camino', 'resuelto', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    statusFilter === f
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-black'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {f === 'unresolved' ? 'Abiertos' : f === 'en_camino' ? 'En Ruta' : f === 'resuelto' ? 'Cerrados' : 'Todos'}
                </button>
              ))}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs">
                No hay tickets en este estado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all space-y-2 text-xs ${
                      t.severity === 'URGENTE_PARADA'
                        ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-zinc-500">{t.ticketNumber}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          t.severity === 'URGENTE_PARADA'
                            ? 'bg-rose-500 text-white'
                            : t.severity === 'ALERTA_OPERATIVA'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {t.severity === 'URGENTE_PARADA' ? 'Máquina Parada' : t.severity === 'ALERTA_OPERATIVA' ? 'Alerta Operativa' : 'Mantenimiento'}
                        </span>
                      </div>

                      <span className="text-[10px] text-zinc-400 font-bold">{t.createdAt}</span>
                    </div>

                    <div>
                      <p className="font-black text-zinc-900 dark:text-white">{t.clientName}</p>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium line-clamp-2 mt-0.5">
                        {t.faultDescription}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                        <span>🚜 {t.machineModel}</span>
                        <span>📍 {t.locationAddress}</span>
                        {t.assignedUnitCode && <span>🚐 {t.assignedUnitCode}</span>}
                      </div>
                    </div>

                    {/* Quick Status Changers */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Estado: <strong className="text-zinc-900 dark:text-white">{t.status}</strong>
                      </span>

                      <div className="flex items-center gap-1">
                        {t.status === 'recibido' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'asignado')}
                            className="px-2 py-1 rounded bg-amber-500 text-black text-[10px] font-black hover:bg-amber-400"
                          >
                            Asignar Unidad
                          </button>
                        )}
                        {t.status === 'asignado' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'en_camino')}
                            className="px-2 py-1 rounded bg-blue-500 text-white text-[10px] font-black hover:bg-blue-400"
                          >
                            Marcar En Ruta
                          </button>
                        )}
                        {t.status === 'en_camino' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'en_sitio')}
                            className="px-2 py-1 rounded bg-purple-500 text-white text-[10px] font-black hover:bg-purple-400"
                          >
                            Llegó a Obra
                          </button>
                        )}
                        {t.status === 'en_sitio' && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, 'resuelto')}
                            className="px-2 py-1 rounded bg-emerald-500 text-white text-[10px] font-black hover:bg-emerald-400"
                          >
                            Resolver Ticket
                          </button>
                        )}
                        {t.status === 'resuelto' && (
                          <span className="text-[10px] text-emerald-500 font-black flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Resuelto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Mobile Units List */}
        {activeTab === 'mobile_units' && (
          <div className="space-y-2.5">
            <p className="text-xs text-zinc-500 mb-1">
              Unidades tácticas 4x4 equipadas para intervención en cantera y carretera:
            </p>

            {trucks.map((truck) => (
              <div
                key={truck.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <div>
                      <h4 className="font-black text-zinc-900 dark:text-white">{truck.unitCode}</h4>
                      <span className="text-[10px] text-zinc-400">{truck.baseLocation}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    truck.currentStatus === 'available'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : truck.currentStatus === 'en_route'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {truck.currentStatus === 'available' ? 'Disponible' : truck.currentStatus === 'en_route' ? 'En Ruta' : 'En Base'}
                  </span>
                </div>

                <div className="pt-1 text-[11px] text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-between">
                  <span>Técnico: <strong className="text-zinc-800 dark:text-zinc-200">{truck.driverTechnician}</strong></span>
                  <span className="text-[10px] text-amber-500">{truck.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. New Ticket Quick Creator */}
        {activeTab === 'new_ticket' && (
          <form onSubmit={handleCreateTicket} className="space-y-2.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Cliente o Contratista</label>
              <input
                type="text"
                placeholder="Nombre de la empresa o cliente..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Teléfono Directo</label>
                <input
                  type="tel"
                  placeholder="809-555-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Zona / Región</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white"
                >
                  <option value="Santo Domingo">Santo Domingo / Km 22</option>
                  <option value="Cibao">Cibao / Santiago</option>
                  <option value="Este">Este / Punta Cana</option>
                  <option value="Sur">Sur / Barahona</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Modelo de Máquina</label>
              <input
                type="text"
                placeholder="Ej. Retroexcavadora JCB 3CX Eco"
                value={machineModel}
                onChange={(e) => setMachineModel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Descripción de la Falla</label>
              <textarea
                placeholder="Indique síntomas: manguera reventada, sobrecalentamiento, código SPN/FMI..."
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                rows={2}
                required
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-0.5">Severidad</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-xs text-zinc-900 dark:text-white font-bold"
              >
                <option value="URGENTE_PARADA">🚨 MÁQUINA PARADA (Prioridad Máxima)</option>
                <option value="ALERTA_OPERATIVA">⚠️ Alerta Operativa (Equipo trabaja con limitación)</option>
                <option value="MANTENIMIENTO_URGENTE">🛠️ Mantenimiento Urgente Programable</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Despachar Orden SOS Inmediata</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Summary */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-zinc-500">SLA Promedio: &lt; 45 minutos</span>
        <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
          Central 24/7 Activa
        </span>
      </div>
    </div>
  );
};
