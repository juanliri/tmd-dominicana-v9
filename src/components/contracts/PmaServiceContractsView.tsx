import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Zap, 
  Truck, 
  FlaskConical, 
  ArrowRight, 
  FileText,
  DollarSign
} from 'lucide-react';
import { PMA_PLAN_TIERS } from '../../data/pmaData';
import { PmaPlanTier } from '../../types';
import { useCart } from '../../context/CartContext';

interface PmaServiceContractsViewProps {
  onNavigate?: (route: string) => void;
}

export const PmaServiceContractsView: React.FC<PmaServiceContractsViewProps> = ({ onNavigate }) => {
  const { formatPrice } = useCart();
  const [plans] = useState<PmaPlanTier[]>(PMA_PLAN_TIERS);
  const [selectedFleetSize, setSelectedFleetSize] = useState<number>(3);
  const [estimatedMonthlyHours, setEstimatedMonthlyHours] = useState<number>(150); // Hours per machine per month
  const [contractModalOpen, setContractModalOpen] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<PmaPlanTier | null>(null);

  const handleSelectPlan = (plan: PmaPlanTier) => {
    setActivePlan(plan);
    setContractModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Contratos de Mantenimiento Planificado (PMA / CVA)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Pólizas de Servicio <span className="text-amber-500">TMD Care™</span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Proteja su inversión contra paradas imprevistas. Cobertura de mano de obra oficial, kits de filtros OEM programados y telemetría predictiva con tiempos de respuesta garantizados por contrato en toda República Dominicana.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* Fleet Cost Estimator Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase text-amber-500 tracking-wider block mb-1">
                Simulador de Cuota Mensual por Flota
              </span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                Calcula el Costo de Protección para tu Parque de Maquinaria
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Cantidad de Equipos</label>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {[1, 3, 5, 10].map(qty => (
                    <button
                      key={qty}
                      onClick={() => setSelectedFleetSize(qty)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        selectedFleetSize === qty
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {qty} {qty === 1 ? 'Máquina' : 'Máquinas'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Horas Mes / Equipo</label>
                <input
                  type="number"
                  value={estimatedMonthlyHours}
                  onChange={(e) => setEstimatedMonthlyHours(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PMA Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => {
            const monthlyCost = plan.pricePerOperatingHourUsd * estimatedMonthlyHours * selectedFleetSize;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  plan.badge === 'Gold'
                    ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 text-white border-2 border-amber-500 shadow-2xl shadow-amber-500/10'
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-lg'
                }`}
              >
                {plan.badge === 'Gold' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                    Recomendado para Canteras & Contratistas
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                      {plan.targetFleetSize}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                      plan.badge === 'Gold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      Plan {plan.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black mb-2">
                    {plan.name}
                  </h3>

                  <div className="py-4 border-y border-zinc-100 dark:border-zinc-800 my-4 space-y-1">
                    <div className="text-3xl font-black text-amber-500">
                      ${plan.pricePerOperatingHourUsd.toFixed(2)} <span className="text-xs font-normal text-zinc-400">USD / hora de trabajo</span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Estimado para tu flota: <strong>{formatPrice(monthlyCost)} / mes</strong>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                      Beneficios & Coberturas Incluidas:
                    </span>
                    {plan.includedServices.map((srv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{srv}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">SLA Respuesta en Obra:</span>
                      <strong className="text-amber-500 font-bold">&lt; {plan.emergencyResponseSlaHours} Horas</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Descuento en Repuestos:</span>
                      <strong className="text-emerald-500 font-bold">{plan.discountOnPartsPercent}% OFF</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Muestreo SOS Aceites:</span>
                      <strong>{plan.fluidAnalysisIncluded ? 'Incluido' : 'Opcional'}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      plan.badge === 'Gold'
                        ? 'bg-amber-500 hover:bg-amber-400 text-black'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100'
                    }`}
                  >
                    <span>Contratar Plan {plan.badge}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Contract Request Modal */}
      {contractModalOpen && activePlan && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase">TMD Care™</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Formalizar Póliza {activePlan.badge}
                </h3>
              </div>
              <button onClick={() => setContractModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 mb-4 text-xs space-y-1">
              <div className="font-bold text-zinc-900 dark:text-white">{activePlan.name}</div>
              <div className="text-zinc-500">Flota: {selectedFleetSize} máquinas • {estimatedMonthlyHours} hrs/mes</div>
              <div className="text-amber-500 font-black text-sm">
                Tarifa: ${activePlan.pricePerOperatingHourUsd.toFixed(2)} USD/hora
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Un ejecutivo de posventa de TMD se pondrá en contacto para registrar los números de serie de sus equipos y despachar los primeros kits de filtros programados.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setContractModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs"
              >
                Cerrar
              </button>
              <a
                href={`https://wa.me/18095601234?text=Hola%20TMD,%20quiero%20activar%20la%20póliza%20${encodeURIComponent(activePlan.name)}%20para%20mi%20flota%20de%20${selectedFleetSize}%20equipos`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-center text-xs"
              >
                Confirmar por WhatsApp
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
