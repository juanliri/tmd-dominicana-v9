import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  FileText, 
  Percent, 
  Download, 
  ChevronRight, 
  Wrench, 
  Phone,
  HelpCircle,
  Truck,
  Droplets
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { Machine } from '../../types';
import { useCart } from '../../context/CartContext';

interface PmaPackageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine?: Machine | null;
  onSelectPmaPackage?: (packageData: PmaSelection) => void;
}

export interface PmaSelection {
  hoursPackage: 1000 | 2000 | 3000;
  packageName: string;
  basePriceUsd: number;
  discountPercent: number;
  finalPriceUsd: number;
  includeInBankLeasing: boolean;
  monthlyLeasingIncrementUsd: number;
  machineModel: string;
}

export const PmaPackageSelectorModal: React.FC<PmaPackageSelectorModalProps> = ({
  isOpen,
  onClose,
  machine,
  onSelectPmaPackage
}) => {
  const { addToCart, showToast, formatPrice } = useCart();
  const [selectedHours, setSelectedHours] = useState<1000 | 2000 | 3000>(2000);
  const [includeInLeasing, setIncludeInLeasing] = useState(true);
  const [leasingTermMonths, setLeasingTermMonths] = useState<24 | 36 | 48>(36);

  if (!isOpen) return null;

  const machineName = machine?.name || 'Maquinaria Pesada General';
  const machineModel = machine?.modelCode || 'SERIE-TMD';

  // Packages definition
  const packages = {
    1000: {
      hours: 1000,
      title: 'PMA 1,000 HORAS • CICLO INICIAL 1 AÑO',
      visits: 4,
      schedule: 'Servicios cada 250 Horas (250h, 500h, 750h, 1000h)',
      basePriceUsd: 3850,
      discountPercent: 5,
      finalPriceUsd: 3657.50,
      monthlyPriceUsd: 304.79,
      features: [
        '4 Kits completos de filtros Donaldson / OEM despachados a obra',
        '2 Muestreos espectrométricos de aceite S.O.S. en laboratorio',
        'Mano de obra técnica y viáticos de taller móvil 4x4 incluidos',
        'Monitoreo telemático LiveLink™ con alertas DTC preventivas',
        'Inspección pericial de 50 puntos con informe digital al propietario'
      ],
      badge: 'Básico Recomendado'
    },
    2000: {
      hours: 2000,
      title: 'PMA 2,000 HORAS • COBERTURA BIENAL DE ALTO RENDIMIENTO',
      visits: 8,
      schedule: '8 Servicios programados • Incluye cambio total de aceite hidráulico',
      basePriceUsd: 7600,
      discountPercent: 10,
      finalPriceUsd: 6840.00,
      monthlyPriceUsd: 285.00,
      features: [
        '8 Kits de filtros completos de motor, combustible, aire e hidráulico',
        'Cambio completo de fluidos hidráulicos ISO VG 46/68 y mandos a 2000h',
        '4 Análisis espectrométricos S.O.S. de metales de desgaste y hollín',
        'Prioridad de despacho técnico en menos de 12 horas en todo el país',
        '15% de descuento adicional en repuestos de desgaste (cuchillas/dientes)',
        'Certificado de Mantenimiento Homologado TMD para reventa'
      ],
      badge: 'Más Popular • Mejor Retorno'
    },
    3000: {
      hours: 3000,
      title: 'PMA 3,000 HORAS • TOTAL PROTECTION & GARANTÍA EXTENDIDA',
      visits: 12,
      schedule: '12 Servicios integrales • Cobertura máxima de tren de potencia',
      basePriceUsd: 11400,
      discountPercent: 15,
      finalPriceUsd: 9690.00,
      monthlyPriceUsd: 269.17,
      features: [
        '12 Servicios programados completos en obra durante 36 meses',
        'Extensión oficial de Garantía TMD en Motor & Bombas hasta 3 Años',
        'Laboratorio S.O.S. ilimitado con diagnósticos periciales en 24h',
        'Equipo de respaldo bonificado en renta si reparación excede 48h',
        '20% de descuento en componentes remanufacturados TMD Reman',
        'Capacitación y certificación de 2 operadores en TMD Academy'
      ],
      badge: 'Máximo Valor Empresarial'
    }
  };

  const currentPkg = packages[selectedHours];

  // Calculate monthly leasing increment
  // Typical commercial equipment leasing APR ~11.5% in USD
  const monthlyInterestRate = 0.115 / 12;
  const nMonths = leasingTermMonths;
  const pmaMonthlyLoanPayment = 
    (currentPkg.finalPriceUsd * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, nMonths))) /
    (Math.pow(1 + monthlyInterestRate, nMonths) - 1);

  const handleSelectPlan = (h: 1000 | 2000 | 3000) => {
    triggerHaptic('selection');
    setSelectedHours(h);
  };

  const handleConfirmAndAdd = () => {
    triggerHaptic('success');
    const selection: PmaSelection = {
      hoursPackage: selectedHours,
      packageName: currentPkg.title,
      basePriceUsd: currentPkg.basePriceUsd,
      discountPercent: currentPkg.discountPercent,
      finalPriceUsd: currentPkg.finalPriceUsd,
      includeInBankLeasing: includeInLeasing,
      monthlyLeasingIncrementUsd: Math.round(pmaMonthlyLoanPayment),
      machineModel: machineModel
    };

    if (onSelectPmaPackage) {
      onSelectPmaPackage(selection);
    } else {
      addToCart({
        id: `pma-${selectedHours}h-${machineModel}`,
        name: `Póliza PMA ${selectedHours} Horas - ${machineName}`,
        partNumber: `PMA-${selectedHours}H-${machineModel}`,
        brand: machine?.brand || 'TMD Service',
        priceUsd: currentPkg.finalPriceUsd,
        category: 'Pólizas & Contratos PMA',
        image: '/images/tmd_coming_soon.jpg',
        stockQty: 10,
        isOem: true,
        compatibleModels: [machineModel],
        deliveryTimeHours: 24,
        description: `Contrato de mantenimiento preventivo de ${selectedHours} horas con ${currentPkg.visits} servicios en obra.`
      });
      showToast(`Póliza PMA ${selectedHours}H agregada al carrito oficial (-${currentPkg.discountPercent}% descuento).`);
    }

    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                CONTRATOS CVA & PMA TMD DOMINICANA
              </span>
              <span className="text-[10px] text-zinc-500">HOMOLOGACIÓN TALLER KM 22</span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white font-display">
              CONFIGURADOR DE MANTENIMIENTO PREVENTIVO (PMA)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Equipo Asignado: <span className="text-amber-400 font-bold">{machineName}</span> ({machineModel})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Package Tier Selector Cards */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-zinc-400 block">
            1. SELECCIONE EL PAQUETE DE HORAS OPERATIVAS:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1000, 2000, 3000].map((hoursKey) => {
              const pkg = packages[hoursKey as 1000 | 2000 | 3000];
              const isSelected = selectedHours === hoursKey;

              return (
                <div
                  key={hoursKey}
                  onClick={() => handleSelectPlan(hoursKey as 1000 | 2000 | 3000)}
                  className={`p-4 rounded-[3px] border transition-all cursor-pointer flex flex-col justify-between select-none relative ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-[2px] ${
                      isSelected ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {pkg.badge}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      -{pkg.discountPercent}% OFF
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase text-white font-display">
                      {hoursKey.toLocaleString()} HORAS
                    </h4>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {pkg.visits} Visitas en Obra
                    </span>

                    {/* Price Block */}
                    <div className="my-3 py-2 border-y border-zinc-800">
                      <span className="text-[10px] text-zinc-500 line-through block">
                        US$ {pkg.basePriceUsd.toLocaleString()}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-amber-400 font-mono">
                          US$ {pkg.finalPriceUsd.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-zinc-400">Total</span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">
                        ≈ US$ {pkg.monthlyPriceUsd.toFixed(0)} / mes estimado
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {pkg.schedule}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-400 uppercase">Filtros + Fluidos</span>
                    <span className={`w-4 h-4 rounded-[1px] flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-amber-400 text-black' : 'border border-zinc-700'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deliverables Checklist for Selected Package */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>COBERTURA INCLUIDA EN EL PAQUETE DE {selectedHours} HORAS:</span>
            </h4>
            <span className="text-[10px] text-zinc-400 uppercase">
              {currentPkg.visits} INSPECCIONES PROGRAMADAS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {currentPkg.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed text-[11px]">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Financing Integration Toggle (Leasing Proforma) */}
        <div className="p-4 rounded-[3px] bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase text-white block">
                  VINCULAR A FINANCIAMIENTO BANCARIO (LEASING PROFORMA)
                </span>
                <span className="text-[10px] text-zinc-400 block font-sans">
                  Banco Popular, BHD León o Banco Agrícola permiten financiar el equipo + póliza PMA en una sola cuota mensual.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={includeInLeasing}
                onChange={(e) => setIncludeInLeasing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {includeInLeasing && (
            <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 uppercase text-[10px]">Plazo de financiamiento:</span>
                {[24, 36, 48].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLeasingTermMonths(term as 24 | 36 | 48)}
                    className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      leasingTermMonths === term
                        ? 'bg-amber-400 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {term} Meses
                  </button>
                ))}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase block">Impacto en Cuota Mensual:</span>
                <span className="text-sm font-black text-amber-400">
                  + US$ {Math.round(pmaMonthlyLoanPayment)} / mes
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-zinc-500 uppercase block text-[10px]">TOTAL PÓLIZA PREVENTIVA:</span>
            <span className="text-base font-black text-white font-mono">
              US$ {currentPkg.finalPriceUsd.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 block font-bold">
              Ahorro de US$ {(currentPkg.basePriceUsd - currentPkg.finalPriceUsd).toLocaleString()} por prepago comercial
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs transition-colors cursor-pointer"
            >
              CANCELAR
            </button>

            <button
              type="button"
              onClick={handleConfirmAndAdd}
              className="py-2.5 px-6 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CONFIRMAR PÓLIZA ({selectedHours}H)</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
