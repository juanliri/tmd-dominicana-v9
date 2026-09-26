import React, { useState } from 'react';
import { 
  Truck, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Wrench, 
  ShieldAlert, 
  Radio, 
  Send,
  Sparkles,
  Zap
} from 'lucide-react';
import { EMERGENCY_SERVICE_TRUCKS, INITIAL_EMERGENCY_TICKETS } from '../../data/emergencyData';
import { EmergencyServiceTruck, EmergencyTicket } from '../../types';
import { UniversalBreadcrumbs } from '../common/navigation/UniversalBreadcrumbs';

interface EmergencyDispatchViewProps {
  onNavigate?: (route: string) => void;
}

export const EmergencyDispatchView: React.FC<EmergencyDispatchViewProps> = ({ onNavigate }) => {
  const [trucks] = useState<EmergencyServiceTruck[]>(EMERGENCY_SERVICE_TRUCKS);
  const [tickets, setTickets] = useState<EmergencyTicket[]>(INITIAL_EMERGENCY_TICKETS);
  
  // New ticket state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [zone, setZone] = useState<'Santo Domingo' | 'Cibao' | 'Este' | 'Sur' | 'Noroeste'>('Santo Domingo');
  const [machineModel, setMachineModel] = useState('JCB 3CX Eco');
  const [faultDescription, setFaultDescription] = useState('');
  const [severity, setSeverity] = useState<'URGENTE_PARADA' | 'ALERTA_OPERATIVA' | 'MANTENIMIENTO_URGENTE'>('URGENTE_PARADA');
  const [ticketCreated, setTicketCreated] = useState<EmergencyTicket | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt: EmergencyTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `SOS-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      phone,
      locationAddress,
      zone,
      machineModel,
      faultDescription,
      severity,
      status: 'recibido',
      assignedUnitCode: zone === 'Cibao' ? 'TMD-MÓVIL-02' : zone === 'Este' ? 'TMD-MÓVIL-03' : zone === 'Sur' ? 'TMD-MÓVIL-04' : 'TMD-MÓVIL-01',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrivalMin: zone === 'Santo Domingo' ? 45 : zone === 'Cibao' ? 60 : 75
    };

    setTickets(prev => [newTkt, ...prev]);
    setTicketCreated(newTkt);
    setFaultDescription('');
  };

  const getStatusBadge = (status: EmergencyServiceTruck['currentStatus']) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">Disponible</span>;
      case 'en_route':
        return <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold uppercase">En Ruta</span>;
      case 'on_site':
        return <span className="px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase">En Obra</span>;
      default:
        return <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-mono font-bold uppercase">En Base</span>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24">
      {/* Top Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-white relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-4">
          {onNavigate && (
            <UniversalBreadcrumbs currentRoute="#/emergency" onNavigate={onNavigate} />
          )}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono uppercase tracking-wider mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Centro de Despacho Rápido & Unidades Móviles 24/7 • Protocolo SOS-TMD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
              Emergencias de Taller <span className="text-rose-500">& Servicio en Campo</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans max-w-2xl">
              Respuesta táctica in-situ ante fallas críticas de maquinaria en canteras, carreteras y proyectos mineros. Camiones taller 4x4 equipados con generador, prensa de mangueras hidráulicas, lubricación a granel y herramientas de diagnóstico electrónico.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        
        {/* Urgent Hotline Strip */}
        <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 text-white border border-rose-500/40 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div className="space-y-1 text-center md:text-left pl-2">
            <div className="flex items-center gap-2 text-rose-400 text-[11px] font-mono uppercase tracking-wider justify-center md:justify-start">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Línea Directa de Máquina Parada (24 Horas)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              ¿Equipo detenido en proyecto crítico?
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              Despachamos la unidad móvil más cercana a su ubicación geográfica en menos de 15 minutos en todo el territorio nacional.
            </p>
          </div>

          <a
            href="tel:+18095601234"
            className="px-5 py-2.5 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Llamar al (809) 560-1234</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Mobile Fleet Units Radar (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-zinc-900 rounded-[5px] p-5 border border-zinc-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Unidades Móviles en Cobertura
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GPS Activo
                </span>
              </div>

              <div className="space-y-2.5">
                {trucks.map(t => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <strong className="text-xs font-mono font-bold text-white uppercase">{t.unitCode}</strong>
                      </div>
                      {getStatusBadge(t.currentStatus)}
                    </div>

                    <div className="text-xs font-sans text-zinc-400 space-y-0.5">
                      <div>Base: <strong className="text-zinc-200 font-mono">{t.baseLocation}</strong></div>
                      <div>Tripulación: <span className="text-zinc-300">{t.driverTechnician}</span></div>
                      <div>Especialidad: <span className="text-amber-400 font-medium font-mono text-[11px]">{t.specialty}</span></div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-zinc-400">
                      {t.equippedWithCrane && <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase">Grúa Hidráulica</span>}
                      {t.onboardOilRecoverySystem && <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase">Recup. Fluidos</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Instant SOS Dispatch Ticket Request (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 border border-zinc-800 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-white">
                    Solicitud de Despacho Inmediato de Taller Móvil
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Registre el síntoma para que el camión salga con los repuestos específicos requeridos
                  </p>
                </div>
              </div>

              {ticketCreated ? (
                <div className="p-6 rounded-[3px] bg-zinc-950 border border-emerald-500/30 text-center space-y-3 animate-in fade-in duration-200">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold uppercase tracking-tight text-white font-mono">
                    ¡Ticket {ticketCreated.ticketNumber} Despachado!
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                    La unidad <strong className="text-white font-mono">{ticketCreated.assignedUnitCode}</strong> ha sido alertada con tiempo estimado de arribo de <strong className="text-amber-400 font-mono">~{ticketCreated.estimatedArrivalMin} minutos</strong> a {ticketCreated.locationAddress}.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTicketCreated(null)}
                      className="px-3.5 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold uppercase cursor-pointer"
                    >
                      Registrar Otra Avería
                    </button>
                    <a
                      href={`https://wa.me/18095601234?text=Emergencia%20TMD%20Ticket%20${ticketCreated.ticketNumber}:%20${encodeURIComponent(ticketCreated.machineModel)}%20en%20${encodeURIComponent(ticketCreated.locationAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase cursor-pointer"
                    >
                      Monitorear por WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Empresa / Contacto Responsable
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ej. Consorcio Vial del Norte"
                        className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Teléfono en Obra
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="809-555-0199"
                        className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Zona Geográfica
                      </label>
                      <select
                        value={zone}
                        onChange={(e) => setZone(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="Santo Domingo">Santo Domingo / Distrito / San Cristóbal</option>
                        <option value="Cibao">Santiago / La Vega / Bonao / Puerto Plata</option>
                        <option value="Este">Punta Cana / La Romana / San Pedro / Higüey</option>
                        <option value="Sur">Baní / Azua / Barahona / San Juan</option>
                        <option value="Noroeste">Montecristi / Dajabón / Mao</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Modelo de Máquina
                      </label>
                      <input
                        type="text"
                        required
                        value={machineModel}
                        onChange={(e) => setMachineModel(e.target.value)}
                        placeholder="Ej. Retroexcavadora JCB 3CX"
                        className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Ubicación Exacta / Referencia en Obra
                    </label>
                    <input
                      type="text"
                      required
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Ej. Km 18 Circunvalación Norte, frente a cantera San José"
                      className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Descripción de la Falla / Síntoma
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={faultDescription}
                      onChange={(e) => setFaultDescription(e.target.value)}
                      placeholder="Indique si hay fuga de aceite hidráulico, humo negro en escape, recalentamiento o bloqueo de transmisión..."
                      className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold uppercase tracking-wider text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Despachar Unidad de Emergencia Inmediata</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Active Tickets List */}
            <div className="bg-zinc-900 rounded-[5px] p-5 border border-zinc-800 shadow-2xl">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-400 tracking-wider block mb-3">
                Tickets Activos en Atención ({tickets.length})
              </span>
              <div className="space-y-2">
                {tickets.map(tkt => (
                  <div
                    key={tkt.id}
                    className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{tkt.ticketNumber}</span>
                        <strong className="text-white font-mono uppercase text-[11px]">{tkt.machineModel}</strong>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{tkt.locationAddress}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase">
                      {tkt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
