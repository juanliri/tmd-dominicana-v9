import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Calendar,
  Truck,
  Sparkles,
  Radio,
  FileText,
  Building2,
  Shield,
  Gauge,
  Cpu,
  Layers,
  Check,
  ArrowRight,
  ChevronRight,
  ChevronUp,
  Award,
  Zap,
  Droplets,
  Settings,
  Flame,
  Filter
} from 'lucide-react';
import { WorkshopsInteractiveMap } from './WorkshopsInteractiveMap';
import { IndustrialSectionDivider } from './common/IndustrialSectionDivider';
import { TmdWorkshop } from '../types';

interface MaintenanceTier {
  id: '250h' | '500h' | '1000h' | '2000h';
  hours: number;
  label: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  serviceTypeName: string;
  estimatedTime: string;
  laborType: string;
  frequencyNote: string;
  keyParts: string[];
  tasks: string[];
  fluidInspection: string;
  telemetryIntegration: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAINTENANCE_TIERS: MaintenanceTier[] = [
  {
    id: '250h',
    hours: 250,
    label: '250 HORAS',
    badge: 'LUBRICACIÓN & SERVICIO MENOR',
    badgeColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    title: 'SERVICIO MENOR DE CAMPO',
    tagline: 'Preservación de lubricación diésel, retención de partículas y engrase de alta presión en obra.',
    serviceTypeName: 'Mantenimiento Preventivo (250h)',
    estimatedTime: '2.5 - 3.5 Horas',
    laborType: 'Unidad Móvil 4x4 o Taller',
    frequencyNote: 'Cada 2 meses o 250h de uso',
    keyParts: [
      'Filtro Aceite Motor Diésel OEM',
      'Filtro Separador Agua/Combustible 10µ',
      'Aceite Motor 15W-40 CK-4 Heavy Duty',
      'Grasa Litio NLGI 2 Alta Presión'
    ],
    tasks: [
      'Drenaje y cambio de aceite de motor diésel con toma de muestra para laboratorio',
      'Reemplazo de filtro de aceite motor y cartucho separador de agua primario',
      'Engrase integral de alta presión en pines, balde, tornamesa y articulaciones',
      'Inspección y ajuste de tensión en cadenas/orugas y fajas de accesorios',
      'Inspección visual de fugas en mandos finales, banco de válvulas y cilindros'
    ],
    fluidInspection: 'Monitoreo de viscosidad y nivel de hollín',
    telemetryIntegration: 'Reseteo de horómetro en módulo LiveLink™',
    icon: Droplets
  },
  {
    id: '500h',
    hours: 500,
    label: '500 HORAS',
    badge: 'ESTÁNDAR MÁS SOLICITADO',
    badgeColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    title: 'PREVENTIVO COMPLETO DIÉSEL',
    tagline: 'Filtración total del sistema de inyección common rail, circuito hidráulico y filtro primario de aire.',
    serviceTypeName: 'Mantenimiento Preventivo (500h)',
    estimatedTime: '4.0 - 5.0 Horas',
    laborType: 'Mecánico Certificado en Obra',
    frequencyNote: 'Cada 4 meses o 500h de uso',
    keyParts: [
      'Filtros Diésel Primario + Secundario 2µ',
      'Filtro Aceite de Motor Heavy Duty OEM',
      'Filtro Hidráulico de Retorno Alta Capacidad',
      'Elemento Primario Filtro Aire Donaldson',
      'Aceite Motor 15W-40 CK-4 & Aditivos'
    ],
    tasks: [
      'Todas las rutinas de inspección y lubricación del servicio de 250 horas',
      'Sustitución de filtro secundario de combustible common rail (2 micras)',
      'Cambio del filtro de retorno del circuito hidráulico principal con detección de virutas',
      'Inspección, limpieza o reemplazo del elemento primario del filtro de aire',
      'Escaneo computarizado con escáner oficial para lectura de códigos DTC en ECM',
      'Verificación y calibración de presiones piloto de trabajo de los implementos'
    ],
    fluidInspection: 'Análisis espectrométrico de aceite motor (Laboratorio SOS)',
    telemetryIntegration: 'Auditoría remota de alarmas DTC en plataforma LiveLink™',
    icon: Filter
  },
  {
    id: '1000h',
    hours: 1000,
    label: '1,000 HORAS',
    badge: 'SERVICIO MAYOR SEMESTRAL',
    badgeColor: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    title: 'OVERHAUL TREN DE FUERZA',
    tagline: 'Intervención profunda en mandos finales, respiraderos, calibración de válvulas y refrigeración.',
    serviceTypeName: 'Mantenimiento Mayor (1000h)',
    estimatedTime: '6.5 - 8.0 Horas',
    laborType: 'Taller Km 22 o Bahía en Mina',
    frequencyNote: 'Cada 6-8 meses o 1,000h',
    keyParts: [
      'Filtros de Aire Primario + Seguridad Interior',
      'Filtro Respiradero Tanque Hidráulico',
      'Filtro de Transmisión / Mando Hidrostático',
      'Aceite Mandos Finales y Diferenciales TO-4',
      'Líquido Refrigerante Orgánico ELC 50/50'
    ],
    tasks: [
      'Todas las rutinas e insumos incluidos en los servicios de 250h y 500h',
      'Drenaje y recambio total de aceite de engranajes en mandos finales y diferenciales',
      'Sustitución de filtro de transmisión / convertidor de par y respiradero hidráulico',
      'Reemplazo del cartucho de seguridad interior del filtro de aire Donaldson',
      'Calibración de holgura de válvulas de motor diésel Cummins / JCB según manual',
      'Verificación manométrica con manómetros certificados de presión de alivio (hasta 350 bar)'
    ],
    fluidInspection: 'Cromatografía completa de fluidos de mandos finales',
    telemetryIntegration: 'Re-certificación de telemetría y geocercas LiveLink™',
    icon: Gauge
  },
  {
    id: '2000h',
    hours: 2000,
    label: '2,000 HORAS',
    badge: 'GRAN PARADA & CICLO MAESTRO',
    badgeColor: 'text-purple-400 border-purple-400/30 bg-purple-500/10',
    title: 'RENOVACIÓN INTEGRAL MAESTRA',
    tagline: 'Reemplazo total de fluido hidráulico, desgasificación de tanque, fajas, termostatos y banco.',
    serviceTypeName: 'Overhaul Preventivo (2000h)',
    estimatedTime: '1.5 - 2 Días Laborales',
    laborType: 'Taller Central Km 22 Especializado',
    frequencyNote: 'Anual o cada 2,000h de trabajo severo',
    keyParts: [
      'Fluido Hidráulico ISO VG 46 (40-60 Gal)',
      'Kit Maestro Filtros Succión, Retorno y Piloto',
      'Correas Serpentinas de Distribución y Tensores',
      'Kit de Termostatos y Mangueras Radiador',
      'Refrigerante ELC y Desincrustante'
    ],
    tasks: [
      'Drenaje y lavado químico desgasificador del tanque hidráulico principal',
      'Sustitución total de fluido hidráulico y coladores magnéticos de succión',
      'Lavado exterior químico y prueba hidrostática del radiador y posenfriador (intercooler)',
      'Reemplazo preventivo de correa serpentina de accesorios, poleas tensoras y termostatos',
      'Prueba dinámica de desempeño en banco hidráulico computarizado a 350 bar',
      'Inspección estructural no destructiva por ultrasonido en pluma, balancín y chasis'
    ],
    fluidInspection: 'Certificación ISO 4406 de pureza del fluido hidráulico nuevo',
    telemetryIntegration: 'Actualización de firmware de ECU de control maestro',
    icon: Zap
  }
];

interface ServicesViewProps {
  onNavigate: (route: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string>('');
  
  // Floating Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    equipment: '',
    location: '',
    serviceType: 'Mantenimiento Preventivo (500h)',
    urgency: 'Normal',
    description: ''
  });

  const [selectedTier, setSelectedTier] = useState<'250h' | '500h' | '1000h' | '2000h'>('500h');

  const handleSelectTier = (tierId: '250h' | '500h' | '1000h' | '2000h', serviceTypeName: string) => {
    setSelectedTier(tierId);
    setFormData(prev => ({
      ...prev,
      serviceType: serviceTypeName
    }));
  };

  const handleBookTier = (tierId: '250h' | '500h' | '1000h' | '2000h', serviceTypeName: string) => {
    handleSelectTier(tierId, serviceTypeName);
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
    if (value.includes('250h')) setSelectedTier('250h');
    else if (value.includes('500h')) setSelectedTier('500h');
    else if (value.includes('1000h') || value.includes('1,000h')) setSelectedTier('1000h');
    else if (value.includes('2000h') || value.includes('2,000h')) setSelectedTier('2000h');
  };

  const handleSelectWorkshopFromMap = (workshop: TmdWorkshop) => {
    setFormData(prev => ({
      ...prev,
      location: `${workshop.province} - ${workshop.name}`
    }));
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedTicket = `TMD-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketNumber(generatedTicket);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white transition-colors pb-16 font-display">
      {/* Top Hero Banner - Industrial Heavy Engineering Style */}
      <div className="relative bg-zinc-950 text-white border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 type-badge">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>TALLER CENTRAL KM 22 & RED NACIONAL DE ASISTENCIA 24/7</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl type-section-title text-white">
                SERVICIO TÉCNICO CERTIFICADO Y <span className="text-amber-400">RESPALDO OFICIAL</span> EN RD
              </h1>

              <p className="text-sm sm:text-base type-body-lead text-zinc-300 max-w-2xl">
                12 bahías de servicio diésel pesado, bancos de prueba de bombas hidráulicas hasta 350 bar, técnicos homologados de fábrica y despacho de unidades móviles 4x4 a canteras y obras.
              </p>

              {/* Call to Actions & Emergency Numbers */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="tel:18095601234"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-[3px] shadow-md transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>EMERGENCIAS 24/7: (809) 560-1234</span>
                </a>
                <a
                  href="https://wa.me/18095601234?text=Hola%20TMD%20Dominicana,%20solicito%20asistencia%20tecnica%20de%20taller%20en%20obra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 font-black uppercase tracking-wider text-xs rounded-[3px] transition-all cursor-pointer"
                >
                  <span>DESPACHO SOS WHATSAPP</span>
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate('#/fullbay')}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-black uppercase tracking-wider text-xs rounded-[3px] transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>PANEL FULLBAY TALLER</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Matrix */}
            <div className="lg:col-span-4 bg-zinc-900/90 rounded-[5px] p-5 border border-zinc-800 shadow-xl space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  CAPACIDAD OPERATIVA
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">AUTOPISTA DUARTE KM 22</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="text-base font-black text-amber-400 block">12 BAHÍAS</span>
                  <span className="text-[10px] text-zinc-400 block uppercase">LÍNEAS HD</span>
                </div>
                <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="text-base font-black text-white block">350 BAR</span>
                  <span className="text-[10px] text-zinc-400 block uppercase">BANCO HIDRÁULICO</span>
                </div>
                <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="text-base font-black text-amber-400 block">&lt; 3 HORAS</span>
                  <span className="text-[10px] text-zinc-400 block uppercase">LLEGADA A OBRA</span>
                </div>
                <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                  <span className="text-base font-black text-emerald-400 block">100% NCF</span>
                  <span className="text-[10px] text-zinc-400 block uppercase">CRÉDITO FISCAL B01</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* TALLER SPECIALIZED ECOSYSTEM QUICK ACCESS HUB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('#/fullbay')}
            className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-[3px] bg-zinc-950 text-amber-400 border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                FULLBAY SHOP MANAGEMENT
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Monitoreo en vivo de 12 bahías, diagnósticos, órdenes abiertas y mecánicos asignados.
              </p>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              ABRIR FULLBAY <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('#/reman')}
            className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-emerald-400/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-[3px] bg-zinc-950 text-emerald-400 border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                PROGRAMA REMAN & ECO
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Intercambio de motores, bombas y transmisiones reconstruidas con garantía de 12 meses.
              </p>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              VER PROGRAMA REMAN <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('#/pma')}
            className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-[3px] bg-zinc-950 text-amber-400 border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                CONTRATOS PMA MASTERCARE
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Planes preventivos programados a 250h, 500h y 1,000h con kits de filtros genuinos.
              </p>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              COTIZAR CONTRATOS PMA <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('#/portal')}
            className="p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-[3px] bg-zinc-950 text-amber-400 border border-zinc-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white mb-1 uppercase tracking-tight">
                TELEMETRÍA LIVELINK™
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Horómetros satelitales, códigos de falla DTC en vivo y alertas automáticas de servicio.
              </p>
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              PORTAL TELEMATICS <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Industrial Gradient Separator */}
        <IndustrialSectionDivider badge="CAPACIDADES DE TALLER" />

        {/* Grid of Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-[3px] bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              UNIDADES MÓVILES 4X4
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Camionetas equipadas con generador, compresor de aire, herramientas de torque y escáner electrónico oficial para calibración y reparación in situ en cualquier punto de RD.
            </p>
            <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
              COBERTURA: CIBAO, ESTE, SUR Y SANTO DOMINGO
            </span>
          </div>

          <div className="p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-[3px] bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center">
              <Gauge className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              BANCO DE PRUEBAS HIDRÁULICO
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Laboratorio hidráulico certificado en el Km 22 con capacidad de prueba dinámica de bombas, válvulas y motores de giro hasta 350 bar de presión con reporte computarizado.
            </p>
            <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
              REPORTE GRÁFICO DE FLUJO Y PRESIÓN CERTIFICADO
            </span>
          </div>

          <div className="p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
            <div className="w-12 h-12 rounded-[3px] bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              CONTRATOS TMD MASTERCARE
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Programas preventivos programados cada 250, 500 y 1,000 horas de operación para minimizar paradas imprevistas y extender la vida útil de su flota pesada con kits OEM.
            </p>
            <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
              TARIFAS PREFERENCIALES FIJAS Y GARANTÍA EXTENDIDA
            </span>
          </div>
        </div>

        {/* Industrial Gradient Separator */}
        <IndustrialSectionDivider badge="PROGRAMAS DE MANTENIMIENTO PREVENTIVO OFICIAL" />

        {/* Maintenance Tier Selector: TMD Industrial Luxury Cards */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>PLANIFICACIÓN TÉCNICA CERTIFICADA • INTERVALOS 250H / 500H / 1,000H / 2,000H</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
                SELECTOR DE INTERVALOS <span className="text-amber-400">TMD INDUSTRIAL</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl font-sans leading-relaxed">
                Seleccione el intervalo según el horómetro de su máquina para consultar el resumen visual de tareas técnicas obligatorias, kits de filtración genuinos y agendar la cuadrilla móvil 4x4 o ingreso a bahía en el Taller Km 22.
              </p>
            </div>

            {/* Current Active Selection Pill */}
            <div className="self-start md:self-auto px-3.5 py-2 rounded-[3px] bg-zinc-900 border border-zinc-800 flex items-center gap-2.5 font-mono text-xs shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-zinc-400 text-[11px] uppercase">INTERVALO ACTIVO:</span>
              <span className="font-black text-amber-400 uppercase">
                {MAINTENANCE_TIERS.find(t => t.id === selectedTier)?.label}
              </span>
            </div>
          </div>

          {/* 4 TMD Industrial Luxury Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {MAINTENANCE_TIERS.map((tier) => {
              const IconComp = tier.icon;
              const isSelected = selectedTier === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => handleSelectTier(tier.id, tier.serviceTypeName)}
                  className={`relative flex flex-col justify-between p-5 sm:p-6 rounded-[5px] bg-zinc-900 border transition-all duration-300 cursor-pointer group overflow-hidden ${
                    isSelected
                      ? 'border-amber-400 bg-zinc-900 shadow-[0_0_35px_rgba(251,191,36,0.16)] ring-1 ring-amber-400/50'
                      : 'border-zinc-800 hover:border-amber-400/70 hover:shadow-[0_0_25px_rgba(251,191,36,0.09)] bg-zinc-900/90'
                  }`}
                >
                  {/* Top Amber Accent Strip (Illuminates on Hover & Selected) */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                      isSelected ? 'bg-amber-400' : 'bg-transparent group-hover:bg-amber-400'
                    }`} 
                  />

                  {/* Ambient Luxury Corner Glow */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/10 transition-all duration-500" />

                  {/* Card Content Top Header */}
                  <div>
                    {/* Top Row: Horometer Display + Category Badge */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                      <div className="flex items-baseline gap-1 font-mono font-black">
                        <span className="text-2xl sm:text-3xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                          {tier.hours}
                        </span>
                        <span className="text-amber-400 text-xs tracking-wider">HORAS</span>
                      </div>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" /> ACTIVO
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-wider border ${tier.badgeColor}`}>
                          {tier.badge}
                        </span>
                      )}
                    </div>

                    {/* Icon & Title */}
                    <div className="mt-4 flex items-start gap-3">
                      <div className="w-11 h-11 rounded-[3px] bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center group-hover:border-amber-400/50 group-hover:scale-105 group-hover:text-amber-300 transition-all duration-300 shrink-0 shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight font-display group-hover:text-amber-400 transition-colors">
                          {tier.title}
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                          {tier.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Quick Operational Metrics */}
                    <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 grid grid-cols-2 gap-2 text-xs font-mono my-3.5">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-bold">DURACIÓN TÉCNICA</span>
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {tier.estimatedTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block font-bold">MODALIDAD DESPACHO</span>
                        <span className="text-[11px] font-bold text-zinc-300 block truncate mt-0.5">
                          {tier.laborType}
                        </span>
                      </div>
                    </div>

                    {/* Visual Summary of Included Service Tasks */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-800">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Wrench className="w-3 h-3 text-amber-400" />
                          TAREAS INCLUIDAS ({tier.tasks.length})
                        </span>
                        <span className="text-amber-400 font-black">OFICIAL</span>
                      </div>
                      
                      <ul className="space-y-2 my-2">
                        {tier.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2 text-xs text-zinc-300 font-sans leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key OEM Parts & Filtration Box */}
                    <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1.5 my-3.5 font-mono">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-amber-400">REPUESTOS & FLUIDOS OEM:</span>
                        <span className="text-zinc-500">{tier.frequencyNote}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tier.keyParts.map((part, pIdx) => (
                          <span 
                            key={pIdx} 
                            className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-sans"
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer & Action Buttons */}
                  <div className="pt-3 border-t border-zinc-800/80 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-zinc-500">DIAGNÓSTICO:</span>
                      <span className="text-emerald-400 font-bold truncate max-w-[170px] text-right">
                        {tier.fluidInspection}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookTier(tier.id, tier.serviceTypeName);
                      }}
                      className={`w-full py-2.5 px-3 rounded-[2px] font-mono text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-md ring-1 ring-amber-400'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-300 group-hover:bg-amber-400 group-hover:text-black group-hover:border-amber-400'
                      }`}
                    >
                      <span>{isSelected ? 'INTERVALO SELECCIONADO' : 'AGENDAR ESTE INTERVALO'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Industrial Gradient Separator */}
        <IndustrialSectionDivider badge="RED NACIONAL DE COBERTURA" />

        {/* Interactive National Technical Support Map */}
        <WorkshopsInteractiveMap 
          onSelectWorkshop={handleSelectWorkshopFromMap}
          onNavigate={onNavigate}
        />

        {/* Industrial Gradient Separator */}
        <IndustrialSectionDivider badge="AGENDAMIENTO & DESPACHO" />

        {/* Service Booking Request Form */}
        <div 
          ref={formSectionRef}
          className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-6 sm:p-10 shadow-2xl"
        >
          <div className="max-w-2xl mb-8">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400">
              AGENDAMIENTO DIRECTO CON TALLER
            </span>
            <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight">
              SOLICITAR ASISTENCIA TÉCNICA O TALLER MÓVIL
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
              Complete la ficha técnica para que el jefe de taller de TMD asigne el mecánico certificado y la unidad móvil más cercana a su obra.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-[5px] bg-zinc-950 border border-emerald-500/30 text-center max-w-lg mx-auto space-y-4 font-mono">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <span className="px-3 py-1 rounded-[3px] bg-zinc-900 border border-zinc-800 text-emerald-400 font-black text-xs uppercase">
                  TICKET: {ticketNumber}
                </span>
                <h3 className="text-lg font-black text-white mt-2 uppercase font-display">
                  ¡SOLICITUD DE SERVICIO REGISTRADA!
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                El equipo de guardia técnica de TMD Dominicana le contactará al teléfono <strong>{formData.phone}</strong> en los próximos 15 minutos para coordinar la intervención en {formData.location || 'su obra'}.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-display">
                <a
                  href={`https://wa.me/18095601234?text=${encodeURIComponent(`Hola TMD, he registrado la solicitud ${ticketNumber} para el equipo ${formData.equipment || 'maquinaria'} en ${formData.location || 'obra'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 font-black uppercase tracking-wider text-xs rounded-[3px] transition-all flex items-center justify-center gap-2"
                >
                  <span>CONFIRMAR POR WHATSAPP</span>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black uppercase tracking-wider text-xs rounded-[3px] border border-zinc-800 transition-all cursor-pointer"
                >
                  NUEVA SOLICITUD
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  NOMBRE DE CONTACTO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ING. JUAN PÉREZ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  TELÉFONO / WHATSAPP *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(809) 555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  EMPRESA O CONTRATISTA
                </label>
                <input
                  type="text"
                  placeholder="CONSTRUCTORA DEL CARIBE S.R.L."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  EQUIPO Y MODELO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="JCB 3CX, LIUGONG 922E, ETC."
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  UBICACIÓN / PROYECTO EN RD *
                </label>
                <input
                  type="text"
                  required
                  placeholder="PUNTA CANA, BÁVARO, SANTIAGO, ETC."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label className="block font-black text-zinc-400 text-[11px] uppercase tracking-wider font-mono">
                    TIPO DE REQUERIMIENTO O INTERVALO OEM *
                  </label>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    SELECCIÓN RÁPIDA POR HORÓMETRO:
                  </span>
                </div>

                {/* 4 Fast Tier Switchers in Form */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {MAINTENANCE_TIERS.map((tier) => {
                    const isTierSelected = formData.serviceType === tier.serviceTypeName;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleSelectTier(tier.id, tier.serviceTypeName)}
                        className={`p-2.5 rounded-[3px] border font-mono text-left transition-all duration-200 cursor-pointer ${
                          isTierSelected
                            ? 'bg-amber-400 text-black border-amber-400 shadow-md font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-400/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{tier.label}</span>
                          {isTierSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] opacity-80 block truncate font-sans mt-0.5">{tier.title}</span>
                      </button>
                    );
                  })}
                </div>

                <select
                  value={formData.serviceType}
                  onChange={(e) => handleServiceTypeChange(e.target.value)}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-amber-400 focus:outline-none uppercase font-mono"
                >
                  <option value="Mantenimiento Preventivo (250h)">Mantenimiento Preventivo (250h) - Menor & Lubricación Crítica</option>
                  <option value="Mantenimiento Preventivo (500h)">Mantenimiento Preventivo (500h) - Estándar & Filtración Total Diésel</option>
                  <option value="Mantenimiento Mayor (1000h)">Mantenimiento Mayor (1,000h) - Overhaul Tren de Fuerza & Mandos Finales</option>
                  <option value="Overhaul Preventivo (2000h)">Overhaul Preventivo (2,000h) - Renovación Hidráulica Integral Maestra</option>
                  <option value="Diagnóstico Electrónico de Motor">Diagnóstico Electrónico de Motor (Lectura DTC & ECM)</option>
                  <option value="Reparación de Sistema Hidráulico">Reparación de Sistema Hidráulico (Banco 350 bar)</option>
                  <option value="Cambio de Tren de Rodaje">Cambio de Tren de Rodaje (Cadenas, Rodillos & Zapatas)</option>
                  <option value="Overhaul Completo en Taller Km 22">Overhaul Completo en Taller Km 22</option>
                  <option value="Auxilio Mecánico de Urgencia">Auxilio Mecánico de Urgencia en Obra 24/7</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-black text-zinc-400 mb-1.5 text-[11px] uppercase tracking-wider font-mono">
                  DESCRIPCIÓN DE LA FALLA O SÍNTOMAS
                </label>
                <textarea
                  rows={3}
                  placeholder="Describa brevemente la anomalía..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-600 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-[3px] shadow-md transition-all cursor-pointer font-display"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVIAR SOLICITUD A GUARDIA DE TALLER</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Floating Scroll-to-Top Pill */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 p-3 sm:px-4 sm:py-2.5 rounded-[3px] bg-amber-500 text-black shadow-2xl border border-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-3 font-display"
          aria-label="Volver arriba en servicios"
        >
          <ChevronUp className="w-4 h-4 stroke-[3]" />
          <span className="text-xs hidden sm:inline">SUBIR</span>
        </button>
      )}
    </div>
  );
};

