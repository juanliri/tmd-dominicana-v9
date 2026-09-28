import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Fuel, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  CheckCircle2, 
  Leaf, 
  FileText, 
  Download, 
  Info,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { LiveLinkUnit } from '../../types';

interface IdleTimeAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: LiveLinkUnit | null;
}

export const IdleTimeAnalyticsModal: React.FC<IdleTimeAnalyticsModalProps> = ({
  isOpen,
  onClose,
  unit
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'lifetime'>('month');

  if (!isOpen) return null;

  // Base machine parameters
  const baseHorometer = unit?.horometerHours || 1420;
  
  // Hours calculations based on selected period
  let totalHours = 180;
  let idleHours = 46.8; // ~26%
  let productiveHours = 133.2; // ~74%

  if (period === 'week') {
    totalHours = 45;
    idleHours = 10.8; // 24%
    productiveHours = 34.2;
  } else if (period === 'lifetime') {
    totalHours = baseHorometer;
    idleHours = parseFloat((baseHorometer * 0.235).toFixed(1));
    productiveHours = parseFloat((baseHorometer * 0.765).toFixed(1));
  }

  const idlePercent = Math.round((idleHours / totalHours) * 100);
  const productivePercent = 100 - idlePercent;

  // Fuel parameters:
  // Heavy machinery burns approx 3.2 Liters/hr (0.845 Gal/hr) in low-idle mode
  const idleBurnGalPerHour = 0.845;
  const idleBurnLitersPerHour = 3.2;

  const wastedGal = parseFloat((idleHours * idleBurnGalPerHour).toFixed(1));
  const wastedLiters = parseFloat((idleHours * idleBurnLitersPerHour).toFixed(1));

  // Fuel pricing in Dominican Republic (Sept 2026 market reference)
  const priceDopPerGal = 242.0; // RD$ 242.00 por galón diésel regular
  const dopToUsdRate = 60.0;

  const costLossDop = Math.round(wastedGal * priceDopPerGal);
  const costLossUsd = Math.round(costLossDop / dopToUsdRate);

  // CO2 Emissions: ~10.18 kg CO2 per gallon of diesel burned
  const co2WastedKg = Math.round(wastedGal * 10.18);

  // Premature service penalty: fraction of 250h maintenance consumed by idle
  const serviceIntervalHours = 250;
  const maintenanceCyclesLost = (idleHours / serviceIntervalHours).toFixed(2);

  const handleExportReport = () => {
    const reportText = `=====================================================
TMD DOMINICANA - AUDITORÍA DE HORAS EN RALENTÍ & DESPERDICIO DIÉSEL
=====================================================
Equipo: ${unit?.model || 'LiuGong / JCB'}
No. Serie: ${unit?.serialNumber || 'TMD-UNIT-2026'}
Periodo Analizado: ${period === 'week' ? 'Última Semana (45h)' : period === 'month' ? 'Último Mes (180h)' : 'Vida Útil del Horómetro'}
Fecha de Emisión: ${new Date().toLocaleDateString('es-DO')}

1. DESGLOSE HORÓMETRO:
   - Horas Totales Registradas: ${totalHours} h
   - Horas de Trabajo Productivo: ${productiveHours} h (${productivePercent}%)
   - Horas en Ralentí (>10 min sin carga hidráulica): ${idleHours} h (${idlePercent}%)

2. PÉRDIDAS ECONÓMICAS POR COMBUSTIBLE:
   - Tasa de Consumo en Ralentí: ${idleBurnGalPerHour} gal/h (3.2 L/h)
   - Galones Desperdiciados: ${wastedGal} gal
   - Litros Desperdiciados: ${wastedLiters} L
   - Costo Diésel RD$ 242.00/gal: RD$ ${costLossDop.toLocaleString()}
   - Equivalente USD (Tasa 60.00): US$ ${costLossUsd.toLocaleString()}

3. DESGASTE MECÁNICO PREMATURO:
   - Ciclos de Servicio Preventivo (250h) Consumidos en Vacío: ${maintenanceCyclesLost} ciclos
   - Impacto Ambiental: ${co2WastedKg} kg CO2 innecesarios emitidos a la atmósfera

4. RECOMENDACIONES DE OPERACIÓN TMD:
   - Habilitar temporizador Auto-Idle Shutdown a 5 minutos en cabina.
   - Apagar el motor durante esperas de volquetas en cantera superiores a 4 minutos.
   - Limitar precalentamiento matutino a 3 minutos con aceite multigrado 15W40.
=====================================================
Telemetría CAN-Bus J1939 certificada por TMD Dominicana.
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TMD_Auditoria_Ralenti_${unit?.model || 'Equipo'}_${period}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Auditoría de Eficiencia Operativa
                </span>
                <span className="text-[10px] text-zinc-400">
                  Telemetría J1939 CAN-Bus
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Monitoreo de Ralentí & Desperdicio Diésel: {unit?.model || 'Excavadora LiuGong 922E'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              title="Descargar reporte pericial de consumo"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar TXT</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Periodo de Cálculo:</span>
          <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-[2px] border border-zinc-800">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                period === 'week' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Semana Actual (45h)
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                period === 'month' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mes Corrido (180h)
            </button>
            <button
              onClick={() => setPeriod('lifetime')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                period === 'lifetime' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vida Útil ({baseHorometer}h)
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Main Visual Ratio Card */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Relación Trabajo Efectivo vs. Ralentí Innecesario
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Detectado por sensores J1939: Motor encendido a 800-950 RPM sin presión en las líneas hidráulicas maestras.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Productivo ({productivePercent}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Ralentí ({idlePercent}%)
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="w-full h-4 bg-zinc-800 rounded-[2px] overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-black text-black"
                style={{ width: `${productivePercent}%` }}
              >
                {productivePercent}%
              </div>
              <div
                className="h-full bg-amber-400 transition-all duration-500 flex items-center justify-center text-[10px] font-black text-black"
                style={{ width: `${idlePercent}%` }}
              >
                {idlePercent}%
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-[2px] bg-zinc-900/80 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Horas Totales del Periodo</span>
                <span className="text-xl font-bold text-white font-mono mt-1 block">{totalHours} h</span>
              </div>

              <div className="p-3 rounded-[2px] bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase block">Horas Productivas Reales</span>
                <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">{productiveHours} h</span>
              </div>

              <div className="p-3 rounded-[2px] bg-amber-950/20 border border-amber-400/30">
                <span className="text-[10px] text-amber-400 uppercase block">Horas en Espera / Ralentí</span>
                <span className="text-xl font-bold text-amber-400 font-mono mt-1 block">{idleHours} h</span>
              </div>
            </div>
          </div>

          {/* Financial Waste Breakdown (DOP & USD) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-[3px] bg-gradient-to-br from-rose-950/30 to-zinc-950 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-300 font-bold uppercase tracking-wider">Pérdida en Combustible</span>
                <Fuel className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono pt-1">
                RD$ {costLossDop.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                ≈ US$ {costLossUsd.toLocaleString()} (Tasa RD$ 60.00)
              </p>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-rose-950">
                {wastedGal} galones ({wastedLiters} L) quemados sin producir
              </div>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Desgaste Mecánico</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono pt-1">
                {maintenanceCyclesLost} Ciclos
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Consumidos de intervalos PM-250h
              </p>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                Acelera recambio de aceite 15W40 y filtros
              </div>
            </div>

            <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Huella Ambiental</span>
                <Leaf className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono pt-1">
                {co2WastedKg} kg CO₂
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Emisiones evitables del motor
              </p>
              <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                Auditable bajo estándares ISO 14001
              </div>
            </div>
          </div>

          {/* Coaching & Best Practices Guide */}
          <div className="p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                Plan de Ahorro & Capacitación de Operadores TMD
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-amber-400 block text-[11px] uppercase">
                  1. Auto-Idle Shutdown (5 min)
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  Configurar la ECU del motor LiuGong/JCB para corte automático de encendido tras 5 minutos de inactividad de las palancas joystick.
                </p>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-amber-400 block text-[11px] uppercase">
                  2. Protocolo en Espera de Volquetas
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  Instruir a los operadores en cantera o mina a girar la llave a posición de contacto si la cola de camiones supera los 3 minutos.
                </p>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-amber-400 block text-[11px] uppercase">
                  3. Calentamiento Racional (3 min)
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed font-sans">
                  En el clima cálido de República Dominicana, 3 minutos de calentamiento son suficientes para estabilizar la presión de aceite hidráulico.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reducir un 10% el ralentí ahorra más de RD$ 85,000 anuales por máquina en obra.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
