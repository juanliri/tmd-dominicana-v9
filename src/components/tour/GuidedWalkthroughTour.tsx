import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Crown, 
  Calculator, 
  Radio, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Compass,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  routeTarget: string;
  icon: React.ReactNode;
  highlights: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-welcome',
    title: 'Bienvenido al Ecosistema TMD Dominicana',
    subtitle: 'Plataforma Integral de Maquinaria Pesada JCB & LiuGong',
    description: 'Explore la suite más avanzada para contratistas, canteras y empresas de construcción en la República Dominicana: desde adquisición de flota hasta telemática IoT en tiempo real.',
    badge: 'Paso 1 de 4 • Introducción',
    routeTarget: '#/machinery',
    icon: <Compass className="w-8 h-8 text-amber-500" />,
    highlights: [
      'Gama completa de excavadoras, retroexcavadoras y palas cargadoras',
      'Fichas técnicas oficiales y cotizaciones fiscales NCF',
      'Soporte técnico y talleres móviles en todo el país'
    ]
  },
  {
    id: 'step-promember',
    title: 'Dashboard de Clientes & Programa VIP Pro-Member',
    subtitle: 'Beneficios Exclusivos, Puntos de Recompensa y Crédito Corporativo',
    description: 'Gestione su flota registrada, consulte facturas con valor fiscal B01, acumule puntos Pro-Member por cada compra de repuestos OEM y desbloquee descuentos preferenciales en taller Fullbay.',
    badge: 'Paso 2 de 4 • Pro-Member VIP',
    routeTarget: '#/portal',
    icon: <Crown className="w-8 h-8 text-amber-400" />,
    highlights: [
      'Niveles Bronze, Silver, Gold y Platinum con beneficios progresivos',
      'Historial de servicios de mantenimiento preventivo y correctivo',
      'Línea de crédito comercial y cotizaciones instantáneas'
    ]
  },
  {
    id: 'step-tco',
    title: 'Calculadora de Costo Total de Propiedad (TCO)',
    subtitle: 'Simulador Financiero de Combustible y Ciclo de Vida',
    description: 'Proyecte el costo horario real por metro cúbico excavado. Compare el consumo de diésel entre tecnologías Tier 3 / Stage V y optimice el valor residual de reventa de su inversión.',
    badge: 'Paso 3 de 4 • Economía de Flota',
    routeTarget: '#/tco-calculator',
    icon: <Calculator className="w-8 h-8 text-blue-400" />,
    highlights: [
      'Parámetros adaptados a precios de combustible en República Dominicana',
      'Desglose gráfico de diésel, mantenimiento y depreciación neta',
      'Descarga de estudios de retorno de inversión (ROI) para juntas directivas'
    ]
  },
  {
    id: 'step-livelink',
    title: 'Portal de Telemática IoT LiveLink™ en Tiempo Real',
    subtitle: 'Monitoreo Satelital GPS, Geocercas y Diagnóstico DTC',
    description: 'Vigile la ubicación exacta, horas de motor, nivel de combustible y códigos de falla de cada máquina en el mapa nacional. Active el inmovilizador remoto ante alertas de seguridad.',
    badge: 'Paso 4 de 4 • Telemática IoT',
    routeTarget: '#/livelink',
    icon: <Radio className="w-8 h-8 text-emerald-400" />,
    highlights: [
      'Ubicación satelital y horas de trabajo en vivo en el mapa de RD',
      'Geocercas de seguridad en canteras y obras con alertas automáticas',
      'Inmovilizador remoto y diagnóstico predictivo de mantenimiento'
    ]
  }
];

interface GuidedWalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const GuidedWalkthroughTour: React.FC<GuidedWalkthroughTourProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigate(TOUR_STEPS[nextIndex].routeTarget);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      onNavigate(TOUR_STEPS[prevIndex].routeTarget);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('tmd_tour_completed', 'true');
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Dark Backdrop Spotlight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-xl bg-zinc-900 text-zinc-100 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden font-mono"
        >
          {/* Top Progress Bar */}
          <div className="h-1 w-full bg-zinc-950">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Header with Icon & Close */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[2px] bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-xs">
                  {currentStep.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                    {currentStep.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold leading-tight uppercase text-white">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs uppercase"
                title="Cerrar tour"
                aria-label="Cerrar tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle & Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                {currentStep.subtitle}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {currentStep.description}
              </p>
            </div>

            {/* Highlights List */}
            <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">
                Aspectos Clave a Conocer:
              </span>
              {currentStep.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      onNavigate(TOUR_STEPS[idx].routeTarget);
                    }}
                    className={`h-1.5 rounded-[1px] transition-all cursor-pointer ${
                      idx === currentStepIndex ? 'w-6 bg-amber-400' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    aria-label={`Ir al paso ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Explorar TMD' : 'Siguiente'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
