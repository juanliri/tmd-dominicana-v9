import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  XCircle, 
  HardHat, 
  UserCheck, 
  Send, 
  ShieldCheck, 
  Phone, 
  QrCode, 
  Share2, 
  Filter, 
  Search, 
  Plus, 
  Wrench, 
  Fuel, 
  Layers, 
  Sparkles, 
  FileText, 
  Download,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  PatioTestDriveBooking, 
  PatioBookingStatus, 
  PatioMachineAvailability, 
  PatioTrackZone 
} from '../../types';
import { MACHINES_DATA } from '../../data/catalog';
import { 
  PATIO_TIME_SLOTS,
  PATIO_TRACK_ZONES,
  PATIO_INSTRUCTORS,
  fetchPatioBookings,
  subscribeToPatioBookings,
  fetchPatioAvailability,
  subscribeToPatioAvailability,
  updatePatioBookingStatus,
  reschedulePatioBooking,
  updateMachinePatioAvailability,
  getPatioBookingWhatsAppUrl,
  createPatioBooking
} from '../../services/patioBookingService';

interface AdminPatioKm22ManagerProps {
  onNavigateToQuotes?: () => void;
}

export const AdminPatioKm22Manager: React.FC<AdminPatioKm22ManagerProps> = ({
  onNavigateToQuotes
}) => {
  const [bookings, setBookings] = useState<PatioTestDriveBooking[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, PatioMachineAvailability>>({});
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'fleet_readiness' | 'tracks'>('bookings');

  // Modal states
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState<PatioTestDriveBooking | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [isRescheduling, setIsRescheduling] = useState<PatioTestDriveBooking | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleSlotId, setNewRescheduleSlotId] = useState<string>('slot_0830');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  
  // New Booking Modal state
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState<boolean>(false);
  const [newMachineId, setNewMachineId] = useState<string>(MACHINES_DATA[0]?.id || '');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSlotId, setNewSlotId] = useState<string>('slot_0830');
  const [newOperator, setNewOperator] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newTrackZone, setNewTrackZone] = useState<PatioTrackZone>('pista_1_excavacion');
  const [newInstructor, setNewInstructor] = useState<string>(PATIO_INSTRUCTORS[0].name);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubBookings = subscribeToPatioBookings((data) => {
      setBookings(data);
    });

    const unsubAvail = subscribeToPatioAvailability((data) => {
      setAvailabilityMap(data);
    });

    return () => {
      unsubBookings();
      unsubAvail();
    };
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedStatusFilter !== 'all' && b.status !== selectedStatusFilter) return false;
    if (selectedMachineFilter !== 'all' && b.machineId !== selectedMachineFilter) return false;
    if (selectedDateFilter && b.date !== selectedDateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.operatorName.toLowerCase().includes(q);
      const matchCompany = (b.companyName || '').toLowerCase().includes(q);
      const matchMachine = b.machineName.toLowerCase().includes(q);
      const matchPass = b.qrAccessPass.toLowerCase().includes(q);
      if (!matchName && !matchCompany && !matchMachine && !matchPass) return false;
    }
    return true;
  });

  // Calculate high-level KPIs
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalFleetMachines = MACHINES_DATA.length;
  const machinesInMaintenance = Object.values(availabilityMap).filter(m => m.currentStatus === 'mantenimiento').length;

  // Handle status transitions
  const handleStatusChange = async (bookingId: string, status: PatioBookingStatus) => {
    await updatePatioBookingStatus(bookingId, status);
  };

  const handleCompleteWithNotes = async () => {
    if (!selectedBookingForNotes) return;
    await updatePatioBookingStatus(
      selectedBookingForNotes.id, 
      'completed', 
      completionNotes || 'Prueba concluida satisfactoriamente con telemetría registrada.'
    );
    setSelectedBookingForNotes(null);
    setCompletionNotes('');
  };

  const handleExecuteReschedule = async () => {
    if (!isRescheduling || !newRescheduleDate) return;
    const slotObj = PATIO_TIME_SLOTS.find(s => s.id === newRescheduleSlotId) || PATIO_TIME_SLOTS[0];
    await reschedulePatioBooking(
      isRescheduling.id,
      newRescheduleDate,
      slotObj.label,
      slotObj.id,
      rescheduleReason
    );
    setIsRescheduling(null);
    setNewRescheduleDate('');
    setRescheduleReason('');
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const machine = MACHINES_DATA.find(m => m.id === newMachineId) || MACHINES_DATA[0];
    const slotObj = PATIO_TIME_SLOTS.find(s => s.id === newSlotId) || PATIO_TIME_SLOTS[0];
    const trackObj = PATIO_TRACK_ZONES.find(p => p.id === newTrackZone) || PATIO_TRACK_ZONES[0];

    await createPatioBooking({
      machineId: machine.id,
      machineName: `${machine.brand} ${machine.modelCode} - ${machine.name}`,
      machineBrand: machine.brand,
      machineCategory: machine.category,
      machineModel: machine.modelCode,
      machineImage: machine.image,
      date: newDate,
      timeSlot: slotObj.label,
      timeSlotId: slotObj.id,
      status: 'confirmed',
      operatorName: newOperator,
      companyName: newCompany || 'Contratista Registrado Manualmente',
      clientEmail: `${newOperator.toLowerCase().replace(/[^a-z0-9]/g, '')}@empresa.com`,
      phone: newPhone,
      licenseCategory: 'Categoría 3 (Equipos Pesados)',
      testFocus: 'Evaluación general y prueba de fuerza',
      trackZone: newTrackZone,
      trackZoneName: trackObj.name,
      instructorRequested: true,
      assignedInstructor: newInstructor,
      assignedInstructorPhone: '+1 (809) 555-2201',
      telemetryRequired: true,
      safetyEquipmentConfirmed: true,
      clientNotes: 'Agendado manualmente desde el Command Desk de Patio Km 22'
    });

    setIsNewBookingModalOpen(false);
    setNewOperator('');
    setNewCompany('');
    setNewPhone('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID Reserva', 'Pase Acceso', 'Fecha', 'Horario', 'Estado', 'Equipo', 'Operador', 'Empresa', 'Teléfono', 'Pista', 'Instructor', 'Notas'];
    const rows = filteredBookings.map(b => [
      b.id,
      b.qrAccessPass,
      b.date,
      b.timeSlot,
      b.status,
      `"${b.machineName}"`,
      `"${b.operatorName}"`,
      `"${b.companyName || ''}"`,
      b.phone,
      `"${b.trackZoneName}"`,
      `"${b.assignedInstructor}"`,
      `"${b.staffNotes || b.clientNotes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tmd_patio_km22_citas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Matrix */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-amber-950 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black uppercase tracking-wider">
                Fase 15.2 • Operaciones Pista
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Realtime Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              <span>Centro de Control Patio Km 22</span>
              <span className="text-xs font-semibold text-zinc-400 font-sans hidden sm:inline">
                (Autopista Duarte • Pistas 1 a 5)
              </span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-1">
              Administración de pruebas de campo en terreno, disponibilidad de telemetría de flota e instructores técnicos máster para contratistas.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Cita Manual</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-zinc-700"
              title="Exportar Reporte a CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Citas en Pista</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{totalBookings}</span>
              <span className="text-[11px] text-amber-400 font-bold">Registradas</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Confirmadas / Próximas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400">{confirmedCount}</span>
              <span className="text-[11px] text-zinc-400 font-medium">Listas para entrar</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pruebas en Curso</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-400 animate-pulse">{inProgressCount}</span>
              <span className="text-[11px] text-amber-400/80 font-medium">En Pistas</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Flota Km 22 en Taller</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-zinc-300">{machinesInMaintenance} / {totalFleetMachines}</span>
              <span className="text-[11px] text-zinc-400">Mantenimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs: Bookings vs Fleet Readiness vs Tracks */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendario & Citas Agendadas ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet_readiness')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'fleet_readiness'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Disponibilidad de Flota ({MACHINES_DATA.length} Equipos)</span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tracks'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pistas de Maniobras (Km 22)</span>
          </button>
        </div>

        <div className="text-xs text-zinc-500 hidden md:block">
          Garita 1 Autopista Duarte Km 22
        </div>
      </div>

      {/* TAB 1: BOOKINGS LIST & CALENDAR */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por operador, empresa, pase TMD-KM22 o máquina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">Todos los Estados</option>
                <option value="confirmed">Confirmadas</option>
                <option value="in_progress">En Pista (En Vivo)</option>
                <option value="pending">Pendientes</option>
                <option value="completed">Completadas</option>
                <option value="rescheduled">Reagendadas</option>
                <option value="cancelled">Canceladas</option>
              </select>

              {/* Machine Filter */}
              <select
                value={selectedMachineFilter}
                onChange={(e) => setSelectedMachineFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 max-w-[180px] truncate"
              >
                <option value="all">Todas las Máquinas</option>
                {MACHINES_DATA.map(m => (
                  <option key={m.id} value={m.id}>{m.brand} {m.modelCode}</option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200"
              />

              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter('')}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  title="Limpiar Filtro de Fecha"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bookings Table / Cards */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="py-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <CalendarIcon className="w-10 h-10 text-zinc-400 mx-auto" />
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                  No se encontraron demostraciones agendadas con los filtros actuales
                </p>
                <p className="text-xs text-zinc-400">
                  Prueba modificando la fecha, el estado o la maquinaria seleccionada.
                </p>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const statusStyles = {
                  confirmed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
                  in_progress: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse',
                  pending: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
                  completed: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
                  rescheduled: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
                  cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
                };

                const statusLabels = {
                  confirmed: 'Confirmada',
                  in_progress: 'En Pista (En Curso)',
                  pending: 'Pendiente Revisión',
                  completed: 'Prueba Completada',
                  rescheduled: 'Reagendada',
                  cancelled: 'Cancelada'
                };

                return (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-400/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    {/* Machine & Booking details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 overflow-hidden flex items-center justify-center">
                        {b.machineImage ? (
                          <img src={b.machineImage} alt={b.machineName} className="w-full h-full object-cover" />
                        ) : (
                          <HardHat className="w-6 h-6 text-amber-500" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusStyles[b.status] || statusStyles.confirmed}`}>
                            {statusLabels[b.status] || b.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {b.qrAccessPass}
                          </span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {b.trackZoneName.split(':')[0]}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                          {b.machineName}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1 font-bold text-zinc-700 dark:text-zinc-300">
                            <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                            {b.date} ({b.timeSlot})
                          </span>
                          <span>•</span>
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {b.operatorName}
                          </span>
                          <span className="text-zinc-400">
                            ({b.companyName || 'Particular'})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {b.phone}
                          </span>
                        </div>

                        {/* Test Focus & Instructor */}
                        <div className="text-[11px] text-zinc-500 pt-0.5 flex items-center gap-3 flex-wrap">
                          <span><strong>Enfoque:</strong> {b.testFocus}</span>
                          <span>•</span>
                          <span><strong>Instructor:</strong> {b.assignedInstructor}</span>
                        </div>

                        {/* Staff Notes if any */}
                        {b.staffNotes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-medium">
                            📝 <strong>Nota Técnica:</strong> {b.staffNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                      {/* WhatsApp Dispatch */}
                      <a
                        href={getPatioBookingWhatsAppUrl(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 transition-colors"
                        title="Enviar Confirmación / Recordatorio por WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      {/* In progress toggle */}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'in_progress')}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Iniciar en Pista</span>
                        </button>
                      )}

                      {/* Complete Test */}
                      {(b.status === 'in_progress' || b.status === 'confirmed') && (
                        <button
                          onClick={() => setSelectedBookingForNotes(b)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completar</span>
                        </button>
                      )}

                      {/* Reschedule Button */}
                      {b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setIsRescheduling(b);
                            setNewRescheduleDate(b.date);
                            setNewRescheduleSlotId(b.timeSlotId || 'slot_0830');
                          }}
                          className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors"
                        >
                          Reagendar
                        </button>
                      )}

                      {/* Cancel */}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Cancelar Cita"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FLEET READINESS AT KM 22 */}
      {activeTab === 'fleet_readiness' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Estado de alistamiento técnico, nivel de combustible y horas de operación para cada unidad en el Patio Km 22.
            </p>
            <span className="text-xs font-bold text-amber-500">
              {MACHINES_DATA.length} Equipos en Inventario
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MACHINES_DATA.map((machine) => {
              const statusObj = availabilityMap[machine.id];
              const isMaintenance = statusObj?.currentStatus === 'mantenimiento';
              const isInPista = statusObj?.currentStatus === 'en_pista';
              const isAvailable = !isMaintenance;

              return (
                <div
                  key={machine.id}
                  className={`p-4 rounded-3xl border transition-all ${
                    isMaintenance
                      ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-80'
                      : isInPista
                      ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-16 h-12 rounded-xl object-cover bg-black/20 shrink-0 border border-zinc-200 dark:border-zinc-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                          {machine.brand}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          isMaintenance
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                            : isInPista
                            ? 'bg-amber-500 text-black animate-pulse'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {statusObj?.currentStatus || 'Disponible'}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate">
                        {machine.modelCode} — {machine.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {machine.category} • {machine.powerHp} HP
                      </p>
                    </div>
                  </div>

                  {/* Readiness stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      <span>Combustible: <strong>{statusObj?.fuelLevel || 95}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Horas: <strong>{(statusObj?.operatingHours || 12).toFixed(1)} h</strong></span>
                    </div>
                  </div>

                  {/* Instructor & Location */}
                  <div className="mt-2 text-[10px] text-zinc-500 flex justify-between items-center">
                    <span>Instructor: <strong>{statusObj?.instructorLead || PATIO_INSTRUCTORS[0].name.split(' ')[1]}</strong></span>
                    <span>Demos: <strong>{statusObj?.totalCompletedDemos || 5}</strong></span>
                  </div>

                  {/* Action toggles */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => updateMachinePatioAvailability(machine.id, {
                        currentStatus: isMaintenance ? 'disponible' : 'mantenimiento',
                        isAvailable: isMaintenance
                      })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        isMaintenance
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-amber-500'
                      }`}
                    >
                      {isMaintenance ? 'Habilitar para Pruebas' : 'Enviar a Mantenimiento'}
                    </button>

                    <button
                      onClick={() => updateMachinePatioAvailability(machine.id, {
                        fuelLevel: 100,
                        lastInspectionDate: new Date().toISOString().split('T')[0]
                      })}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                    >
                      Llenar Tanque 100%
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRACK ZONES OVERVIEW */}
      {activeTab === 'tracks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PATIO_TRACK_ZONES.map((track) => {
            const activeDemosInTrack = bookings.filter(
              b => b.trackZone === track.id && (b.status === 'in_progress' || b.status === 'confirmed')
            );

            return (
              <div
                key={track.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {track.name.split(':')[0]}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-500">
                    Capacidad: {track.maxSimultaneousMachines} Máquinas
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                    {track.name.split(':')[1] || track.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {track.description}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Categorías Recomendadas:</span>
                  <div className="flex flex-wrap gap-1">
                    {track.suitableCategories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Pruebas programadas hoy:</span>
                  <span className="font-black text-amber-500">{activeDemosInTrack.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: COMPLETE TEST DRIVE WITH OBSERVATIONS */}
      {selectedBookingForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Completar Prueba en Terreno
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForNotes(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
              <p><strong>Equipo:</strong> {selectedBookingForNotes.machineName}</p>
              <p><strong>Operador:</strong> {selectedBookingForNotes.operatorName} ({selectedBookingForNotes.companyName})</p>
              <p><strong>Pase:</strong> {selectedBookingForNotes.qrAccessPass}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Observaciones Técnicas y Telemetría Final
              </label>
              <textarea
                rows={4}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Ej. Prueba completada con 45 min de ciclo en zanja. Presión hidráulica óptima (315 bar). Cliente satisfecho con tiempos de ciclo."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedBookingForNotes(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteWithNotes}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-lg"
              >
                Guardar y Marcar Completada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE BOOKING */}
      {isRescheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Reagendar Demostración
              </h3>
              <button
                onClick={() => setIsRescheduling(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
              <p><strong>Equipo:</strong> {isRescheduling.machineName}</p>
              <p><strong>Fecha Actual:</strong> {isRescheduling.date} ({isRescheduling.timeSlot})</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Nueva Fecha
                </label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Nuevo Turno
                </label>
                <select
                  value={newRescheduleSlotId}
                  onChange={(e) => setNewRescheduleSlotId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                >
                  {PATIO_TIME_SLOTS.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Motivo de la Reagendación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Solicitud de contratista por lluvia / transporte de choferes"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsRescheduling(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteReschedule}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-lg"
              >
                Confirmar Reagendación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL BOOKING BY STAFF */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Agendar Demostración Manual en Patio Km 22
              </h3>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Maquinaria
                </label>
                <select
                  value={newMachineId}
                  onChange={(e) => setNewMachineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                >
                  {MACHINES_DATA.map(m => (
                    <option key={m.id} value={m.id}>{m.brand} {m.modelCode} — {m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Turno
                  </label>
                  <select
                    value={newSlotId}
                    onChange={(e) => setNewSlotId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                  >
                    {PATIO_TIME_SLOTS.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Operador / Contacto *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ing. Carlos Santana"
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Constructora del Norte"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Teléfono WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="809-555-0100"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Instructor Asignado
                  </label>
                  <select
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                  >
                    {PATIO_INSTRUCTORS.map(inst => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Pista de Maniobras
                </label>
                <select
                  value={newTrackZone}
                  onChange={(e) => setNewTrackZone(e.target.value as PatioTrackZone)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                >
                  {PATIO_TRACK_ZONES.map(pz => (
                    <option key={pz.id} value={pz.id}>{pz.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors shadow-lg"
                >
                  Guardar en Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
