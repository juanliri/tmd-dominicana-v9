import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X, 
  HardHat, 
  UserCheck, 
  Send, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  FileCheck,
  QrCode,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Fuel,
  Printer
} from 'lucide-react';
import { MACHINES_DATA } from '../../data/catalog';
import { Machine, PatioTestDriveBooking, PatioTrackZone, PatioTimeSlotInfo } from '../../types';
import { PatioInteractiveCalendar } from './PatioInteractiveCalendar';
import { 
  PATIO_TIME_SLOTS,
  PATIO_TRACK_ZONES,
  PATIO_INSTRUCTORS,
  fetchPatioBookings,
  subscribeToPatioBookings,
  fetchPatioAvailability,
  subscribeToPatioAvailability,
  createPatioBooking,
  getPatioBookingWhatsAppUrl
} from '../../services/patioBookingService';

interface TestDriveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedMachine?: Machine | null;
}

export const TestDriveBookingModal: React.FC<TestDriveBookingModalProps> = ({
  isOpen,
  onClose,
  preselectedMachine
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    preselectedMachine?.id || MACHINES_DATA[0]?.id || ''
  );

  // Tomorrow as default date
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // skip Sunday
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getDefaultDate());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<PatioTimeSlotInfo>(PATIO_TIME_SLOTS[0]);
  const [selectedTrackZone, setSelectedTrackZone] = useState<PatioTrackZone>('pista_1_excavacion');
  const [operatorName, setOperatorName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [licenseCategory, setLicenseCategory] = useState<string>('Categoría 3 (Equipos Pesados)');
  const [testFocus, setTestFocus] = useState<string>('Ciclo hidráulico y fuerza de desprendimiento en banco de tierra');
  const [instructorRequested, setInstructorRequested] = useState<boolean>(true);
  const [telemetryRequired, setTelemetryRequired] = useState<boolean>(true);
  const [safetyEquipmentConfirmed, setSafetyEquipmentConfirmed] = useState<boolean>(true);
  const [clientNotes, setClientNotes] = useState<string>('');
  
  // Real-time Firestore state
  const [bookings, setBookings] = useState<PatioTestDriveBooking[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<PatioTestDriveBooking | null>(null);

  // Sync preselected machine when prop changes
  useEffect(() => {
    if (preselectedMachine?.id) {
      setSelectedMachineId(preselectedMachine.id);
      
      // Auto assign ideal track zone
      if (preselectedMachine.category === 'Tractores' || preselectedMachine.category === 'Implementos Agrícolas') {
        setSelectedTrackZone('pista_5_agricola');
      } else if (preselectedMachine.category === 'Compactación') {
        setSelectedTrackZone('pista_4_velocidad');
      } else if (preselectedMachine.category === 'Minicargadores' || preselectedMachine.category === 'Manipuladores') {
        setSelectedTrackZone('pista_3_confinado');
      } else {
        setSelectedTrackZone('pista_1_excavacion');
      }
    }
  }, [preselectedMachine]);

  // Subscribe to real-time Firestore bookings and availability
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const chosenMachine = MACHINES_DATA.find(m => m.id === selectedMachineId) || MACHINES_DATA[0];
  const machineAvail = availabilityMap[selectedMachineId];
  const activeTrack = PATIO_TRACK_ZONES.find(p => p.id === selectedTrackZone) || PATIO_TRACK_ZONES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newBooking = await createPatioBooking({
        machineId: chosenMachine.id,
        machineName: `${chosenMachine.brand} ${chosenMachine.modelCode} - ${chosenMachine.name}`,
        machineBrand: chosenMachine.brand,
        machineCategory: chosenMachine.category,
        machineModel: chosenMachine.modelCode,
        machineImage: chosenMachine.image,
        date: selectedDate,
        timeSlot: selectedTimeSlot.label,
        timeSlotId: selectedTimeSlot.id,
        status: 'confirmed',
        operatorName,
        companyName: companyName || 'Particular / Contratista Independiente',
        clientEmail: clientEmail || `${operatorName.toLowerCase().replace(/[^a-z0-9]/g, '')}@contratista.com`,
        phone,
        licenseCategory,
        testFocus,
        trackZone: selectedTrackZone,
        trackZoneName: activeTrack.name,
        instructorRequested,
        assignedInstructor: machineAvail?.instructorLead || PATIO_INSTRUCTORS[0].name,
        assignedInstructorPhone: PATIO_INSTRUCTORS[0].phone,
        telemetryRequired,
        safetyEquipmentConfirmed,
        clientNotes,
        machineOperatingHours: machineAvail?.operatingHours || 15.0,
        fuelLevelPercent: machineAvail?.fuelLevel || 95
      });

      setConfirmedBooking(newBooking);
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with High-Tech Patio Branding */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black uppercase font-display tracking-tight">
                  DEMOSTRACIÓN TÉCNICA & TEST DRIVE
                </h3>
                <span className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-black bg-amber-400 text-black uppercase">
                  PATIO KM 22
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FIRESTORE LIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Pista de pruebas para operadores e ingenieros con telemetría en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[3px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentic Patio Km 22 Live Notice */}
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-4 py-2 flex items-center justify-between gap-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white uppercase text-[11px]">PATIO KM 22:</span>
            <span className="text-zinc-400 text-[11px] hidden sm:inline uppercase">15,000 m² con banco de excavación, prueba de giro y tracción.</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0 uppercase">
            📍 AUTOPISTA DUARTE KM 22
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {confirmedBooking ? (
            /* Confirmation & Industrial Access Pass Screen */
            <div className="py-2 space-y-5 max-w-2xl mx-auto animate-fadeIn">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-[5px] bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white uppercase font-display">
                  ¡DEMOSTRACIÓN PROGRAMADA CON ÉXITO!
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                  Hemos reservado la pista de maniobras en el Patio Km 22 y sincronizado la orden en el sistema de telemetría de TMD Dominicana.
                </p>
              </div>

              {/* Pass Industrial Credential Card */}
              <div className="rounded-[5px] border border-amber-400/60 bg-zinc-900 text-white p-4 shadow-xl relative overflow-hidden">
                {/* Badge top */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                        PASE DE INGRESO A PISTA DE PRUEBAS
                      </span>
                      <h5 className="text-xs font-bold text-white uppercase">TMD DOMINICANA — PATIO KM 22</h5>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 uppercase">CÓDIGO DE ACCESO:</span>
                    <p className="text-xs font-black text-amber-400 font-mono tracking-wider">
                      {confirmedBooking.qrAccessPass}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs uppercase">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">MAQUINARIA ASIGNADA:</span>
                    <p className="font-black text-white text-xs font-display">
                      {confirmedBooking.machineName}
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium">
                      Categoría: {confirmedBooking.machineCategory}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">FECHA & HORARIO:</span>
                    <p className="font-black text-white text-xs font-mono">
                      {confirmedBooking.date}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold font-mono">
                      {confirmedBooking.timeSlot}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">PISTA ASIGNADA:</span>
                    <p className="font-bold text-zinc-300 text-xs">
                      {confirmedBooking.trackZoneName}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">INSTRUCTOR ASIGNADO:</span>
                    <p className="font-bold text-zinc-300 text-xs">
                      {confirmedBooking.assignedInstructor}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono">
                      TEL: {confirmedBooking.assignedInstructorPhone || '+1 (809) 555-2201'}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">OPERADOR / INGENIERO:</span>
                    <p className="font-bold text-zinc-300 text-xs">
                      {confirmedBooking.operatorName}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {confirmedBooking.companyName}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-zinc-500 text-[10px]">EQUIPO DE PROTECCIÓN (EPP):</span>
                    <p className="font-semibold text-amber-400 text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Casco, Botas y Chaleco Obligatorios
                    </p>
                  </div>
                </div>

                {/* Simulated QR Code Banner */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white rounded-[3px] text-black">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase">PRESENTE ESTE CÓDIGO EN GARITA 1:</p>
                      <p className="text-[11px] font-bold text-white uppercase">Autopista Duarte Km 22, Pedro Brand / Sto. Dgo.</p>
                    </div>
                  </div>

                  <a
                    href="https://maps.google.com/?q=18.5721,-70.0234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-colors uppercase"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>GOOGLE MAPS</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={getPatioBookingWhatsAppUrl(confirmedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer uppercase"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WHATSAPP CONFIRMACIÓN</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>IMPRIMIR PASE</span>
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-4 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-colors uppercase cursor-pointer"
                >
                  FINALIZAR
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form with Interactive Calendar */
            <form onSubmit={handleSubmit} className="space-y-4 font-mono">
              {/* Step 1: Equipment Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-[2px] bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">1</span>
                    <span>SELECCIONAR MAQUINARIA PARA LA PRUEBA</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    FLOTA KM 22
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="md:col-span-2">
                    <select
                      value={selectedMachineId}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs font-bold text-white focus:border-amber-400"
                    >
                      {MACHINES_DATA.map((m) => {
                        const statusObj = availabilityMap[m.id];
                        const isBlocked = statusObj?.currentStatus === 'mantenimiento';
                        return (
                          <option key={m.id} value={m.id}>
                            {m.brand} {m.modelCode} — {m.name} ({m.category}) {isBlocked ? '[TALLER]' : '[DISPONIBLE]'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Track selector */}
                  <div>
                    <select
                      value={selectedTrackZone}
                      onChange={(e) => setSelectedTrackZone(e.target.value as PatioTrackZone)}
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs font-bold text-white focus:border-amber-400"
                    >
                      {PATIO_TRACK_ZONES.map((pz) => (
                        <option key={pz.id} value={pz.id}>
                          {pz.name.split(':')[0]}: {pz.name.split(':')[1] || pz.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chosen Machine Live Status Card */}
                {chosenMachine && (
                  <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={chosenMachine.image}
                        alt={chosenMachine.name}
                        className="w-14 h-10 rounded-[2px] object-cover bg-black/20 shrink-0 border border-zinc-800"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white uppercase font-display">
                            {chosenMachine.brand} {chosenMachine.modelCode}
                          </p>
                          <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] font-black bg-amber-400/20 text-amber-400 uppercase">
                            {chosenMachine.powerHp} HP
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 uppercase">
                          {chosenMachine.category} • PESO: {(chosenMachine.operatingWeightKg / 1000).toFixed(1)} TON
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase font-mono">TANQUE: {machineAvail?.fuelLevel || 95}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">LISTO KM 22</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Interactive Calendar & Time Slot Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-[2px] bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">2</span>
                  <span>FECHA Y TURNO EN PISTA</span>
                </label>

                <PatioInteractiveCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  selectedTimeSlotId={selectedTimeSlot.id}
                  onSelectTimeSlot={setSelectedTimeSlot}
                  selectedMachineId={selectedMachineId}
                  bookings={bookings}
                  availabilityMap={availabilityMap}
                />
              </div>

              {/* Step 3: Operator & Contractor Credentials */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-[2px] bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">3</span>
                  <span>DATOS DEL OPERADOR / INGENIERO</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ing. Rafael Mejía"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Empresa Contratista
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Constructora del Cibao S.R.L."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="809-555-0100"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="ingenieria@empresa.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Licencia de Conducir
                    </label>
                    <select
                      value={licenseCategory}
                      onChange={(e) => setLicenseCategory(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                    >
                      <option value="Categoría 3 (Equipos Pesados)">Categoría 3 (Equipos Pesados)</option>
                      <option value="Categoría 4 (Especial Maquinaria)">Categoría 4 (Especial Maquinaria)</option>
                      <option value="Certificación Internacional de Operador">Certificación Internacional</option>
                      <option value="Ingeniero / Evaluador (Requiere Chofer TMD)">Ingeniero / Evaluador (Chofer TMD)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Technical Scope & Safety Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-[2px] bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">4</span>
                  <span>ENFOQUE TÉCNICO & PROTOCOLO DE SEGURIDAD</span>
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Enfoque Principal de la Demostración
                  </label>
                  <select
                    value={testFocus}
                    onChange={(e) => setTestFocus(e.target.value)}
                    className="w-full px-3 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-400"
                  >
                    <option value="Ciclo hidráulico y fuerza de desprendimiento en banco de tierra">Ciclo hidráulico y fuerza de desprendimiento en banco de tierra</option>
                    <option value="Consumo de combustible por ciclo de carga y ralentí">Consumo de combustible por ciclo de carga y ralentí con telemetría</option>
                    <option value="Ergonomía de cabina, visibilidad y mandos joystick">Ergonomía de cabina, visibilidad y mandos joystick</option>
                    <option value="Tracción y estabilidad en pendientes pronunciadas">Tracción y estabilidad en pendientes pronunciadas 35°</option>
                    <option value="Rendimiento de implemento acoplado (martillo/rastra/ahoyador)">Rendimiento de implemento acoplado (martillo/rastra/ahoyador)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={instructorRequested}
                      onChange={(e) => setInstructorRequested(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-[2px] text-amber-400 accent-amber-400"
                    />
                    <span className="text-[11px] text-zinc-300 font-medium uppercase font-mono">
                      Instructor Técnico Máster TMD en pista.
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telemetryRequired}
                      onChange={(e) => setTelemetryRequired(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-[2px] text-amber-400 accent-amber-400"
                    />
                    <span className="text-[11px] text-zinc-300 font-medium uppercase font-mono">
                      Medición de telemetría y reporte de consumo.
                    </span>
                  </label>
                </div>

                <label className="flex items-center gap-2 p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyEquipmentConfirmed}
                    onChange={(e) => setSafetyEquipmentConfirmed(e.target.checked)}
                    required
                    className="w-3.5 h-3.5 rounded-[2px] text-amber-400 accent-amber-400"
                  />
                  <span className="text-[11px] text-zinc-200 font-bold uppercase font-mono">
                    Confirmo porte obligatorio de EPP (Casco y Botas) en Patio Km 22.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] cursor-pointer uppercase"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>REGISTRANDO EN FIRESTORE PATIO KM 22...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>CONFIRMAR AGENDAMIENTO EN PISTA ({selectedDate} — {selectedTimeSlot.label})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
