import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Phone, 
  MessageSquare, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Clock, 
  MapPin, 
  Send, 
  ChevronRight, 
  HelpCircle, 
  Download, 
  HardHat, 
  Truck, 
  Layers, 
  Fuel,
  Info,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FAQSection } from '../FAQSection';
import { useCart } from '../../context/CartContext';

interface HelpSupportViewProps {
  onNavigate: (route: string) => void;
}

interface DiagnosticItem {
  id: string;
  title: string;
  category: 'motor' | 'hidraulica' | 'electrico' | 'refrigeracion';
  symptom: string;
  possibleCause: string;
  firstStep: string;
  requiresMobileShop: boolean;
}

const COMMON_DIAGNOSTICS: DiagnosticItem[] = [
  {
    id: 'diag-1',
    title: 'Humo Negro o Pérdida de Potencia en Carga',
    category: 'motor',
    symptom: 'El motor diésel pierde revoluciones bajo carga y emite humo negro por el escape.',
    possibleCause: 'Restricción en el elemento filtrante de aire primario o saturación en el prefiltro de combustible por sedimentos.',
    firstStep: 'Inspeccionar el indicador de restricción de aire en el filtro primario Donaldson y purgar la trampa de agua del filtro sedimentador de diésel.',
    requiresMobileShop: false
  },
  {
    id: 'diag-2',
    title: 'Lentitud o Falta de Fuerza en Pluma y Balde',
    category: 'hidraulica',
    symptom: 'Los movimientos del equipo son lentos y la bomba hidráulica emite zumbido al acelerar.',
    possibleCause: 'Bajo nivel de fluido hidráulico ISO VG 46/68, cavitación en bomba principal o saturación del filtro de retorno.',
    firstStep: 'Verificar la mirilla de nivel hidráulico con todos los cilindros retraídos en suelo plano. Revisar temperatura del tanque.',
    requiresMobileShop: true
  },
  {
    id: 'diag-3',
    title: 'Alerta de Alta Temperatura en Radiador',
    category: 'refrigeracion',
    symptom: 'La aguja de temperatura entra en zona roja tras 30 minutos de operación continua en clima caluroso.',
    possibleCause: 'Panal del radiador obstruido por polvo de caliche/coralina, correa de ventilador destensada o nivel bajo de refrigerante.',
    firstStep: 'Limpiar las aletas del radiador con aire a presión en sentido inverso. Nunca aplicar agua fría con el motor caliente.',
    requiresMobileShop: false
  },
  {
    id: 'diag-4',
    title: 'Código de Falla en Pantalla o CAN Bus',
    category: 'electrico',
    symptom: 'Testigo de advertencia encendido en cabina con código alfanumérico (ej. SPN 110 FMI 3).',
    possibleCause: 'Sensor descalibrado, baja tensión en alternador/baterías 24V o conector con humedad salina.',
    firstStep: 'Tomar fotografía de la pantalla y compartir el código por WhatsApp al equipo de ingeniería Km 22 para lectura de diagnóstico.',
    requiresMobileShop: true
  }
];

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ onNavigate }) => {
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'ticket' | 'manuals' | 'faq'>('overview');
  const [diagnosticSearch, setDiagnosticSearch] = useState('');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticItem | null>(COMMON_DIAGNOSTICS[0]);

  // Support ticket form
  const [ticketForm, setTicketForm] = useState({
    name: '',
    company: '',
    phone: '',
    machineModel: 'JCB 3CX Eco',
    serialNumber: '',
    hourMeter: '',
    province: 'Santo Domingo',
    priority: 'Normal',
    description: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const filteredDiagnostics = COMMON_DIAGNOSTICS.filter(d => {
    const q = diagnosticSearch.toLowerCase().trim();
    if (!q) return true;
    return d.title.toLowerCase().includes(q) || d.symptom.toLowerCase().includes(q) || d.possibleCause.toLowerCase().includes(q);
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TMD-TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedTicketId(id);
    setTicketSubmitted(true);

    const message = encodeURIComponent(
      `*Solicitud de Soporte Técnico TMD MasterCare*\n` +
      `Ticket ID: ${id}\n` +
      `Cliente: ${ticketForm.name} (${ticketForm.company})\n` +
      `Teléfono: ${ticketForm.phone}\n` +
      `Máquina: ${ticketForm.machineModel}\n` +
      `Chasis/Serie: ${ticketForm.serialNumber || 'N/A'}\n` +
      `Horómetro: ${ticketForm.hourMeter} hrs\n` +
      `Provincia: ${ticketForm.province}\n` +
      `Prioridad: ${ticketForm.priority}\n` +
      `Problema: ${ticketForm.description}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/18095601234?text=${message}`, '_blank');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 font-mono">
      {/* 1. HERO BANNER */}
      <section className="bg-zinc-950 text-white border-b border-zinc-800 pt-8 pb-10 sm:pt-10 sm:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-3 border border-amber-500/30">
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>CENTRO DE AYUDA, SOPORTE & GARANTÍA TMD</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase font-display">
              SOPORTE TÉCNICO & CENTRO DE ASISTENCIA AL CONTRATISTA
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 leading-relaxed font-sans">
              Atención directa y resolución ágil de fallas operacionales para su flota en República Dominicana. Desde diagnósticos in situ hasta el despacho prioritario de repuestos y soporte de garantía MasterCare.
            </p>
          </div>

          {/* Emergency 24/7 Action Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-zinc-800">
            <a
              href="tel:18095601234"
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-[3px] bg-amber-400 text-black flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">CENTRAL KM 22</span>
                <span className="text-xs font-black text-white font-mono">+1 (809) 560-1234</span>
                <span className="text-[10px] text-zinc-500 block uppercase">Lunes a Sábado 7:30 AM - 6:00 PM</span>
              </div>
            </a>

            <a
              href="https://wa.me/18095601234?text=Emergencia%20en%20Obra%20-%20Solicito%20Taller%20Movil%20TMD"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-emerald-400 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-[3px] bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">TALLER MÓVIL SOS 24/7</span>
                <span className="text-xs font-black text-white uppercase">EMERGENCIAS EN OBRA</span>
                <span className="text-[10px] text-zinc-500 block uppercase">COBERTURA EN 31 PROVINCIAS</span>
              </div>
            </a>

            <button
              onClick={() => { setActiveTab('ticket'); }}
              className="p-3.5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400 transition-all flex items-center gap-3 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[3px] bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">GARANTÍA MASTERCARE</span>
                <span className="text-xs font-black text-white uppercase">RADICAR TICKET DE SERVICIO</span>
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">RESPUESTA EN &lt; 2 HORAS</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="sticky top-14 sm:top-16 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
            {[
              { id: 'overview', label: 'VISIÓN GENERAL & SEDES' },
              { id: 'diagnostics', label: 'GUÍA DE DIAGNÓSTICO RÁPIDO' },
              { id: 'ticket', label: 'RADICAR TICKET DE SERVICIO' },
              { id: 'manuals', label: 'MANUALES & MANTENIMIENTO' },
              { id: 'faq', label: 'PREGUNTAS FRECUENTES' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-[3px] text-xs font-bold whitespace-nowrap transition-all cursor-pointer uppercase ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TAB 1: OVERVIEW & LOCATIONS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Support Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
                <div className="w-8 h-8 rounded-[3px] bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase mb-1.5 font-display">
                  Taller Móvil en Obra
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Camionetas 4x4 equipadas con escáner oficial, generador, soldadura y herramientas de alta presión para faena directa.
                </p>
              </div>

              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
                <div className="w-8 h-8 rounded-[3px] bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase mb-1.5 font-display">
                  Garantía MasterCare
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Hasta 2 años o 4,000 horas de cobertura oficial de fábrica en tren de fuerza para maquinaria nueva JCB y LiuGong.
                </p>
              </div>

              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
                <div className="w-8 h-8 rounded-[3px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase mb-1.5 font-display">
                  Almacén Km 22
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Más de 18,000 líneas de repuestos OEM listos para despacho en 2 a 4 horas en Gran Santo Domingo y 24h a provincias.
                </p>
              </div>

              <div className="p-4 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
                <div className="w-8 h-8 rounded-[3px] bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                  <HardHat className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white uppercase mb-1.5 font-display">
                  Capacitación Operativa
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Inducción teórica y práctica en obra para sus operadores, reduciendo el desgaste prematuro y el consumo diésel.
                </p>
              </div>
            </div>

            {/* Strategic Locations */}
            <div className="p-5 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <h3 className="text-base font-black text-white mb-4 flex items-center gap-2 uppercase font-display">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>SEDES Y PUNTOS DE ASISTENCIA EN REPÚBLICA DOMINICANA</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase">
                    SEDE CENTRAL
                  </span>
                  <h4 className="text-sm font-black text-white mt-1.5 uppercase font-display">
                    Patio & Almacén Km 22
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 font-sans">
                    Autopista Duarte Km 22, Pedro Brand, Santo Domingo Oeste.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 text-xs space-y-1">
                    <p><strong className="text-zinc-300">Teléfono:</strong> +1 (809) 560-1234</p>
                    <p className="text-zinc-400 text-[11px]"><strong className="text-zinc-300">Servicios:</strong> Taller Fullbay, Patio de Pruebas, Despacho Repuestos.</p>
                  </div>
                </div>

                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">
                    SUCURSAL CIBAO
                  </span>
                  <h4 className="text-sm font-black text-white mt-1.5 uppercase font-display">
                    Centro Logístico Santiago
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 font-sans">
                    Av. Circunvalación Norte Km 7, Santiago de los Caballeros.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 text-xs space-y-1">
                    <p><strong className="text-zinc-300">Teléfono:</strong> +1 (809) 582-9900</p>
                    <p className="text-zinc-400 text-[11px]"><strong className="text-zinc-300">Servicios:</strong> Base de Taller Móvil Norte, Repuestos de Alta Rotación.</p>
                  </div>
                </div>

                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="px-2 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase">
                    SUCURSAL ESTE
                  </span>
                  <h4 className="text-sm font-black text-white mt-1.5 uppercase font-display">
                    Punta Cana & Zona Hotelera
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 font-sans">
                    Boulevard Turístico del Este, Bávaro - Punta Cana.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 text-xs space-y-1">
                    <p><strong className="text-zinc-300">Teléfono:</strong> +1 (809) 552-1144</p>
                    <p className="text-zinc-400 text-[11px]"><strong className="text-zinc-300">Servicios:</strong> Asistencia en Canteras de Coralina y Obras Viales.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNOSTICS GUIDE */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-black text-white uppercase font-display">
                    GUÍA DE DIAGNÓSTICO RÁPIDO DE FALLAS EN OBRA
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Protocolos preliminares antes de solicitar el desplazamiento de un Taller Móvil.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={diagnosticSearch}
                    onChange={(e) => setDiagnosticSearch(e.target.value)}
                    placeholder="Buscar síntoma (humo, calor, presión)..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Diagnostics List */}
                <div className="space-y-2">
                  {filteredDiagnostics.map((diag) => (
                    <button
                      key={diag.id}
                      onClick={() => setSelectedDiagnostic(diag)}
                      className={`w-full p-3 rounded-[3px] border text-left transition-all cursor-pointer ${
                        selectedDiagnostic?.id === diag.id
                          ? 'bg-amber-500/10 border-amber-400 text-white shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase text-amber-400 block mb-0.5">
                        {diag.category}
                      </span>
                      <h4 className="font-bold text-xs uppercase">
                        {diag.title}
                      </h4>
                    </button>
                  ))}
                </div>

                {/* Diagnostic Details Panel */}
                {selectedDiagnostic && (
                  <div className="lg:col-span-2 p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase">
                        {selectedDiagnostic.category}
                      </span>
                      {selectedDiagnostic.requiresMobileShop && (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1 uppercase text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          REQUIERE INSPECCIÓN TÉCNICA
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-white uppercase font-display">
                      {selectedDiagnostic.title}
                    </h3>

                    <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs">
                      <strong className="text-zinc-400 block mb-0.5 uppercase text-[9px]">SÍNTOMA OBSERVADO:</strong>
                      <p className="text-zinc-200 font-sans">{selectedDiagnostic.symptom}</p>
                    </div>

                    <div className="p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-xs">
                      <strong className="text-zinc-400 block mb-0.5 uppercase text-[9px]">CAUSA TÉCNICA PROBABLE:</strong>
                      <p className="text-zinc-200 font-sans">{selectedDiagnostic.possibleCause}</p>
                    </div>

                    <div className="p-2.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-xs">
                      <strong className="text-amber-400 block mb-0.5 uppercase text-[9px]">ACCIÓN INMEDIATA RECOMENDADA:</strong>
                      <p className="text-zinc-100 font-medium font-sans">{selectedDiagnostic.firstStep}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <a
                        href={`https://wa.me/18095601234?text=Consulta%20diagnostico%20de%20falla:%20${encodeURIComponent(selectedDiagnostic.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all inline-flex items-center gap-1.5 shadow-xs uppercase"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>CONSULTAR POR WHATSAPP</span>
                      </a>
                      <button
                        onClick={() => { setActiveTab('ticket'); }}
                        className="px-3 py-1.5 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-all cursor-pointer uppercase"
                      >
                        SOLICITAR TALLER MÓVIL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TICKET SUBMISSION */}
        {activeTab === 'ticket' && (
          <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase mb-1.5 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MESA DE AYUDA MASTERCARE</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase font-display">
                RADICAR TICKET DE SERVICIO O GARANTÍA
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                Complete los datos de la máquina y ubicación para asignar un técnico especialista o coordinar despacho de piezas.
              </p>
            </div>

            {ticketSubmitted ? (
              <div className="p-6 text-center space-y-3 bg-zinc-950 rounded-[3px] border border-emerald-500/40">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-black text-white uppercase font-display">
                  ¡TICKET REGISTRADO CON ÉXITO!
                </h4>
                <p className="text-xs font-mono font-bold text-amber-400 bg-zinc-900 px-2.5 py-1 rounded-[3px] inline-block border border-zinc-800">
                  NÚMERO DE TICKET: {generatedTicketId}
                </p>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
                  Hemos transferido su reporte al equipo de guardia en la Sede Central Km 22. En breve recibirá confirmación por WhatsApp y llamada telefónica.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setTicketSubmitted(false)}
                    className="px-3.5 py-1.5 bg-amber-400 text-black text-xs font-black rounded-[3px] uppercase cursor-pointer"
                  >
                    CREAR OTRO TICKET
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Nombre del Solicitante *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ing. Héctor Morales"
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Empresa Constructora *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Pavimentos del Caribe"
                      value={ticketForm.company}
                      onChange={(e) => setTicketForm({ ...ticketForm, company: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Teléfono Móvil / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(809) 000-0000"
                      value={ticketForm.phone}
                      onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Provincia donde está la Máquina
                    </label>
                    <select
                      value={ticketForm.province}
                      onChange={(e) => setTicketForm({ ...ticketForm, province: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    >
                      <option value="Santo Domingo">SANTO DOMINGO / D.N.</option>
                      <option value="Santiago">SANTIAGO</option>
                      <option value="La Altagracia (Punta Cana)">LA ALTAGRACIA (PUNTA CANA)</option>
                      <option value="La Vega">LA VEGA</option>
                      <option value="Monseñor Nouel (Bonao)">MONSEÑOR NOUEL (BONAO)</option>
                      <option value="Puerto Plata">PUERTO PLATA</option>
                      <option value="Barahona / Pedernales">BARAHONA / PEDERNALES</option>
                      <option value="San Pedro de Macorís">SAN PEDRO DE MACORÍS</option>
                      <option value="Otra">OTRA PROVINCIA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Modelo de Máquina
                    </label>
                    <input
                      type="text"
                      value={ticketForm.machineModel}
                      onChange={(e) => setTicketForm({ ...ticketForm, machineModel: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Horómetro Actual (hrs)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 1250"
                      value={ticketForm.hourMeter}
                      onChange={(e) => setTicketForm({ ...ticketForm, hourMeter: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                      Nivel de Urgencia
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                    >
                      <option value="Normal">NORMAL (MANTENIMIENTO)</option>
                      <option value="Alta">ALTA (RENDIMIENTO REDUCIDO)</option>
                      <option value="Crítica">CRÍTICA (MÁQUINA PARADA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1 uppercase">
                    Descripción de la Falla o Solicitud *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detalle los síntomas, códigos de error en pantalla, o el tipo de mantenimiento requerido..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400 resize-none uppercase"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 uppercase"
                  >
                    <Send className="w-4 h-4" />
                    <span>ENVIAR TICKET Y ABRIR WHATSAPP DIRECTO</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: MANUALS & MAINTENANCE */}
        {activeTab === 'manuals' && (
          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xs">
              <h3 className="text-base font-black text-white mb-1 uppercase font-display">
                FICHAS DE MANTENIMIENTO PREVENTIVO & PAUTAS TÉCNICAS
              </h3>
              <p className="text-xs text-zinc-400 mb-5 font-sans">
                Descargue e imprima los protocolos oficiales recomendados para prolongar la vida útil de su maquinaria pesada en faena dominicana.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase">250 HORAS</span>
                    <h4 className="font-bold text-xs text-white uppercase font-display">Servicio Inicial de Asentamiento</h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      Cambio de aceite motor 15W40, filtro primario diésel, engrase general y verificación de torque de pernos.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Descargando Guía de Mantenimiento 250H en PDF...');
                    }}
                    className="p-2 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors shrink-0 cursor-pointer border border-zinc-800"
                    title="Descargar Ficha PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase">500 HORAS</span>
                    <h4 className="font-bold text-xs text-white uppercase font-display">Mantenimiento Preventivo Estándar</h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      Kit completo de filtros (aceite, combustible Donaldson, filtro hidráulico), análisis de fluidos y limpieza de radiadores.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Descargando Guía de Mantenimiento 500H en PDF...');
                    }}
                    className="p-2 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors shrink-0 cursor-pointer border border-zinc-800"
                    title="Descargar Ficha PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">1,000 HORAS</span>
                    <h4 className="font-bold text-xs text-white uppercase font-display">Servicio Mayor de Tren de Fuerza</h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      Reemplazo de fluido Powershift ZF, aceite de mandos finales SAE 80W90, calibración de válvulas y prueba de presión.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Descargando Guía de Mantenimiento 1000H en PDF...');
                    }}
                    className="p-2 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors shrink-0 cursor-pointer border border-zinc-800"
                    title="Descargar Ficha PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">FLUIDOS & GRASA</span>
                    <h4 className="font-bold text-xs text-white uppercase font-display">Tabla de Lubricantes Tropicalizados</h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      Especificación de aceites hidráulicos ISO 46/68, grasa de litio complejo EP-2 con bisulfuro de molibdeno.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast('Descargando Tabla de Lubricantes en PDF...');
                    }}
                    className="p-2 rounded-[3px] bg-zinc-900 hover:bg-amber-400 hover:text-black text-zinc-300 transition-colors shrink-0 cursor-pointer border border-zinc-800"
                    title="Descargar Ficha PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EMBEDDED FAQ SECTION */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <FAQSection onNavigate={onNavigate} />
          </div>
        )}

      </main>
    </div>
  );
};
