import React, { useState } from 'react';
import { 
  DollarSign, 
  RefreshCw, 
  Building2, 
  HardHat, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Scale, 
  PhoneCall, 
  Clock, 
  Cpu, 
  Sparkles,
  Award,
  Landmark,
  Compass,
  Coins
} from 'lucide-react';

interface ExecutiveTargetProfilesBarProps {
  onNavigate: (route: string) => void;
  onScrollToCatalog?: () => void;
  onOpenTradeInCalculator?: () => void;
}

export const ExecutiveTargetProfilesBar: React.FC<ExecutiveTargetProfilesBarProps> = ({
  onNavigate,
  onScrollToCatalog = () => {
    const el = document.getElementById('fleet-catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },
  onOpenTradeInCalculator = () => {
    const el = document.getElementById('tradein-valuation-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },
}) => {
  const [activeTab, setActiveTab] = useState<'contractors' | 'sell' | 'government' | 'engineers'>('sell');

  return (
    <section id="executive-commercial-profiles" className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto font-display">
      <div className="rounded-[5px] bg-zinc-950 border border-zinc-800 shadow-2xl p-3.5 sm:p-5 lg:p-7 relative overflow-hidden">
        {/* Subtle grid watermark */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-5 border-b border-zinc-800">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-xs">
                <Coins className="w-3.5 h-3.5" />
                CENTRO FINANCIERO & OPERATIVO RD
              </span>
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                TRANSPARENCIA DE PRECIOS, VENTA DE FLOTAS & LICITACIONES
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-white">
              DECISIONES COMERCIALES & ADQUISICIÓN DE MAQUINARIA
            </h2>
          </div>

          {/* Quick Target Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none bg-zinc-900 p-1 sm:p-1.5 rounded-[4px] border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('sell')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[3px] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 border ${
                activeTab === 'sell'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-850 border-zinc-800'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-inherit" />
              <span>VENDER / TRADE-IN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contractors')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[3px] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 border ${
                activeTab === 'contractors'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-850 border-zinc-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-inherit" />
              <span>PRECIOS & CONTRATISTAS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('government')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[3px] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 border ${
                activeTab === 'government'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-850 border-zinc-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-inherit" />
              <span>GOBIERNO & LICITACIONES</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('engineers')}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[3px] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 border ${
                activeTab === 'engineers'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-950 hover:bg-zinc-850 border-zinc-800'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-inherit" />
              <span>INGENIEROS EN OBRA</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Panel by Target Profile */}
        <div className="relative z-10 pt-5">
          {/* TAB 1: VENDER / TRADE-IN (PAGO INMEDIATO) */}
          {activeTab === 'sell' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    LIQUIDEZ INMEDIATA & RETOMA
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                    INSPECCIÓN TÉCNICA EN MENOS DE 24H
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                  ¿TIENES MAQUINARIA PARA VENDER O DESEAS RENOVAR TU FLOTA?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed max-w-3xl">
                  En TMD compramos directamente equipos usados (JCB, CAT, LiuGong, Komatsu, Case) o los consignamos en nuestro <strong>Patio Km 22 Autopista Duarte</strong> ante cientos de compradores activos semanales. Recibe avalúo formal y desembolso bancario ágil.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block mb-1">OPCIÓN 1: COMPRA DIRECTA</span>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">PAGO BANCARIO INMEDIATO</span>
                    <span className="text-[11px] text-zinc-400 font-sans mt-0.5 block">Tasación en obra y transferencia formal con NCF.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block mb-1">OPCIÓN 2: TRADE-IN LLAVE EN MANO</span>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">ABONA A MÁQUINA NUEVA</span>
                    <span className="text-[11px] text-zinc-400 font-sans mt-0.5 block">Entrega tu usado como inicial para tu JCB o LiuGong 0 Horas.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block mb-1">OPCIÓN 3: CONSIGNACIÓN KM 22</span>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">EXHIBICIÓN EN SHOWROOM</span>
                    <span className="text-[11px] text-zinc-400 font-sans mt-0.5 block">Exhibe en la vitrina de mayor tráfico de maquinaria de RD.</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-4 p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3.5 text-center sm:text-left shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  SIMULADOR DE AVALÚO RÁPIDO
                </span>
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  CALCULA EL VALOR COMERCIAL DE TU EQUIPO
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Ingresa marca, año y horómetro para conocer la retoma estimada en el mercado dominicano.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onOpenTradeInCalculator}
                    className="w-full py-3 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>ABRIR VALUADOR DE FLOTA & TRADE-IN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('#/trade-in')}
                    className="w-full py-2.5 px-4 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>VER MERCADO DE USADOS CERTIFICADOS</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRECIOS & CONTRATISTAS */}
          {activeTab === 'contractors' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    PRESUPUESTO & RENTABILIDAD
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                    PRECIOS TRANSPARENTES EN USD Y DOP • NCF FISCAL TIPO B01
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                  CONTRATISTAS GENERALES, MOVIMIENTO DE TIERRA & CANTERAS
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed max-w-3xl">
                  Sin precios ocultos ni intermediarios. Consulta la inversión base de cada equipo, calcula cuotas de <strong>Leasing Bancario (Banco Popular, Banreservas, BHD)</strong> a tasas preferenciales de construcción, y emite tu cotización proforma instantánea con ITBIS desglosado.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Retroexcavadora 3CX</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">Desde US$ 88,500</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mt-0.5">Cuota ~US$ 1,420/m</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Excavadora 22T 922E</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">Desde US$ 145,000</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mt-0.5">Cuota ~US$ 2,340/m</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Rodillo ASC 110</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">Desde US$ 96,000</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mt-0.5">Cuota ~US$ 1,550/m</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Tractor Agrícola 4WD</span>
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">Desde US$ 38,500</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase block mt-0.5">Cuota ~US$ 620/m</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-4 p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  ACCESO INMEDIATO AL CATÁLOGO
                </span>
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  VER TODA LA FLOTA CON PRECIOS
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Explora especificaciones técnicas, fuerza de desprendimiento, motorización y disponibilidad física en patio.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={onScrollToCatalog}
                    className="w-full py-3 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>IR A LA FLOTA CON PRECIOS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('#/checkout')}
                    className="w-full py-2.5 px-4 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>EMITIR PROFORMA FISCAL NCF B01</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOBIERNO & LICITACIONES */}
          {activeTab === 'government' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    SECTOR PÚBLICO RD & ALCALDÍAS
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                    REGISTRO DE PROVEEDORES DEL ESTADO (RPE) ACTIVO • DGCP / MOPC
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                  LICITACIONES PÚBLICAS, OBRAS VIALES & COMPROBANTE NCF B15
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed max-w-3xl">
                  Proveemos maquinaria pesada homologada para ministerios, alcaldías y organismos estatales. Cumplimiento estricto de pliegos de condiciones técnicas, certificaciones de origen directo de fábrica, fianza de cumplimiento y soporte de repuestos garantizado por 10 años.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>RPE HABILITADO</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-sans block">Estatus al día en Compras Dominicanas y DGII.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>FICHAS HOMOLOGADAS</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-sans block">Parámetros técnicos listos para anexos de licitación.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
                      <Award className="w-4 h-4" />
                      <span>NCF B15 GUBERNAMENTAL</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-sans block">Facturación electrónica y retenciones de ley.</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-4 p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  CANAL INSTITUCIONAL
                </span>
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  MESA DE LICITACIONES & CONTRATOS PÚBLICOS
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Solicita pliegos técnicos, certificaciones de concesionario exclusivo o agenda visita de inspección en Patio Km 22.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('#/checkout')}
                    className="w-full py-3 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Landmark className="w-4 h-4" />
                    <span>SOLICITAR COTIZACIÓN DE LICITACIÓN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('#/about')}
                    className="w-full py-2.5 px-4 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-200 hover:text-white font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>VER CERTIFICACIONES DE EMPRESA</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INGENIEROS EN OBRA */}
          {activeTab === 'engineers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    INGENIERÍA RESIDENTE & OPERACIÓN
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-bold uppercase">
                    TELEMETRÍA LIVELINK™ • TALLERES MÓVILES SOS 24/7 • REPUESTOS EXPRESS
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
                  SOPORTE INMEDIATO EN MINA, CANTERA Y OBRAS CIVILES
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed max-w-3xl">
                  Para ingenieros de proyectos, jefes de mantenimiento y operadores. Si tu máquina sufre una parada en campo o necesitas despachar un filtro urgente, nuestros camiones taller 4x4 y el almacén central del Km 22 responden sin detener la producción de tu proyecto.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">SOS MÓVIL EN OBRA</span>
                    <span className="text-xs text-zinc-400 font-sans block">Mecánicos con banco de diagnóstico y soldadura in-situ.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">REPUESTOS EXPRESS 24H</span>
                    <span className="text-xs text-zinc-400 font-sans block">Despacho hacia Santiago, Punta Cana, Pedernales o D.N.</span>
                  </div>
                  <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">TELEMETRÍA LIVELINK™</span>
                    <span className="text-xs text-zinc-400 font-sans block">Alertas CAN-bus en tiempo real en tu teléfono inteligente.</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-4 p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 space-y-3 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  HERRAMIENTAS TÉCNICAS DE CAMPO
                </span>
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  DESPACHO DE URGENCIA & MONITOREO
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Localiza repuestos por número de parte OEM o solicita asistencia mecánica de emergencia en tu frente de trabajo.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('#/parts')}
                    className="w-full py-3 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>BUSCADOR DE REPUESTOS OEM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('#/emergency-dispatch')}
                    className="w-full py-2.5 px-4 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-emerald-400 font-black uppercase tracking-wider text-xs border border-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LLAMAR TALLER SOS 24/7 EN OBRA</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
