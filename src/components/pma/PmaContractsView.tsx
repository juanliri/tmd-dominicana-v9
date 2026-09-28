import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  Award, 
  Wrench, 
  ArrowRight, 
  Layers, 
  FileText,
  Phone,
  Cpu
} from 'lucide-react';
import { PMA_PLAN_TIERS } from '../../data/pmaData';
import { PmaPlanTier } from '../../types';
import { useCart } from '../../context/CartContext';
import { PmaPackageSelectorModal } from './PmaPackageSelectorModal';

interface PmaContractsViewProps {
  onNavigate?: (route: string) => void;
}

export const PmaContractsView: React.FC<PmaContractsViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [plans] = useState<PmaPlanTier[]>(PMA_PLAN_TIERS);
  const [selectedPlan, setSelectedPlan] = useState<PmaPlanTier | null>(null);
  const [isPackageSelectorOpen, setIsPackageSelectorOpen] = useState<boolean>(false);
  const [fleetSize, setFleetSize] = useState<number>(3);
  const [annualHoursPerMachine, setAnnualHoursPerMachine] = useState<number>(2000);
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  const handleOpenQuote = (plan: PmaPlanTier) => {
    setSelectedPlan(plan);
    setQuoteSuccess(false);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSuccess(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-20 font-mono">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>CONTRATOS DE VALOR AL CLIENTE • CVA & PMA PLANES TMD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight uppercase font-display">
              PÓLIZAS DE <span className="text-amber-400">MANTENIMIENTO PROGRAMADO</span> (PMA)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 uppercase leading-relaxed">
              Proteja su inversión fijando un costo predecible por hora trabajada. Kits de filtros originales despachados automáticamente, técnicos certificados en su obra y telemetría predictiva LiveLink™ 24/7.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsPackageSelectorOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-colors cursor-pointer shadow-md"
              >
                <Clock className="w-4 h-4" />
                <span>CONFIGURAR PAQUETE DE HORAS (1,000H, 2,000H, 3,000H) CON LEASING</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Fleet Pricing Calculator Bar */}
        <div className="bg-zinc-900 rounded-[5px] p-5 shadow-xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-wider font-display">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIMULADOR DE PRESUPUESTO MENSUAL POR FLOTA</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase font-display">
              CÁLCULO PARA {fleetSize} EQUIPO{fleetSize > 1 ? 'S' : ''} EN OPERACIÓN
            </h2>
            <p className="text-xs text-zinc-400 uppercase">
              Ajuste el tamaño de su parque de maquinaria para proyectar el costo de cobertura preventiva.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-52 space-y-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-400">EQUIPOS EN FLOTA:</label>
              <input
                type="range"
                min={1}
                max={25}
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                <span>1 MÁQ</span>
                <span className="text-amber-400">{fleetSize} UNIDADES</span>
                <span>25+</span>
              </div>
            </div>

            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-center shrink-0">
              <span className="text-[8px] font-bold text-zinc-500 uppercase block">HRS / AÑO / MÁQ</span>
              <strong className="text-sm font-black text-white font-mono">{annualHoursPerMachine} HRS</strong>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const monthlyCostEstimate = (fleetSize * (annualHoursPerMachine / 12) * plan.pricePerOperatingHourUsd);

            return (
              <div
                key={plan.id}
                className={`rounded-[5px] p-5 sm:p-6 flex flex-col justify-between transition-all relative ${
                  plan.badge === 'Gold'
                    ? 'bg-zinc-900 text-white border-2 border-amber-400 shadow-xl'
                    : 'bg-zinc-900 text-white border border-zinc-800 shadow-md'
                }`}
              >
                {plan.badge === 'Gold' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-[3px] bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider font-display">
                    RECOMENDADO PARA FLOTAS
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-display">
                      {plan.badge} TIER
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      {plan.targetFleetSize}
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase font-display">
                    {plan.name}
                  </h3>

                  <div className="py-3 border-y border-zinc-800 my-2 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        {formatPrice(plan.pricePerOperatingHourUsd)}
                      </span>
                      <span className="text-xs text-zinc-400 uppercase">/ HORA MOTOR</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase">
                      Costo estimado flota: <strong className="text-zinc-200 font-mono">{formatPrice(monthlyCostEstimate)}/MES</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                      COBERTURAS INCLUIDAS:
                    </span>
                    <ul className="space-y-1.5">
                      {plan.includedServices.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed uppercase">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-300 text-[11px]">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[10px] space-y-1 text-zinc-400 uppercase">
                    <div>SLA TIEMPO RESPUESTA: <strong className="text-zinc-200 font-mono">{plan.emergencyResponseSlaHours} HORAS</strong></div>
                    <div>DESCUENTO EN REPUESTOS: <strong className="text-amber-400 font-mono">{plan.discountOnPartsPercent}% OFF</strong></div>
                    <div>LABORATORIO SOS: <strong className="text-zinc-200">{plan.fluidAnalysisIncluded ? 'INCLUIDO' : 'OPCIONAL'}</strong></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenQuote(plan)}
                  className={`w-full mt-5 py-2.5 px-3 rounded-[3px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 ${
                    plan.badge === 'Gold'
                      ? 'bg-amber-400 hover:bg-amber-300 text-black'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  <span>CONTRATAR PÓLIZA {plan.badge}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* Quote Modal */}
      {selectedPlan && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-[5px] p-5 sm:p-6 max-w-md w-full border border-zinc-800 shadow-2xl relative font-mono">
            {quoteSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-black text-white uppercase font-display">
                  ¡SOLICITUD DE PÓLIZA ENVIADA!
                </h3>
                <p className="text-xs text-zinc-400 uppercase">
                  Un ingeniero de servicio TMD preparará el contrato marco PMA para su firma y programará la primera auditoría de flota.
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="mt-2 px-4 py-2 rounded-[3px] bg-amber-400 text-black font-black text-xs uppercase"
                >
                  CERRAR
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-display">
                      CONTRATO DE SERVICIO TMD
                    </span>
                    <h3 className="text-sm font-black text-white uppercase font-display">
                      ACTIVAR {selectedPlan.name}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedPlan(null)} className="text-zinc-400 hover:text-white text-sm">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleQuoteSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                      EMPRESA O CONSTRUCTORA
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Constructora del Este S.A."
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                      TELÉFONO DE CONTACTO
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="809-XXX-XXXX"
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                      UBICACIÓN DE EQUIPOS / PROYECTO
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Autovía del Coral, Bávaro"
                      className="w-full px-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="px-3 py-2 rounded-[3px] text-zinc-400 font-bold hover:bg-zinc-800 uppercase text-[11px]"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[11px]"
                    >
                      SOLICITAR PROPUESTA FORMAL
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Task #76: Configurable 1000h, 2000h, 3000h PMA Package Selector Modal */}
      <PmaPackageSelectorModal
        isOpen={isPackageSelectorOpen}
        onClose={() => setIsPackageSelectorOpen(false)}
      />
    </div>
  );
};
