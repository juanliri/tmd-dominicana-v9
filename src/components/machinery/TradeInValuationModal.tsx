import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Repeat, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Wrench, 
  Gauge, 
  Calendar, 
  Building2, 
  Phone, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Check
} from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export interface TradeInEquipmentData {
  brand: string;
  model: string;
  year: number;
  category: string;
  serialNumber: string;
  hours: number;
  location: string;
  conditionEngine: 'excelente' | 'bueno' | 'regular' | 'reparar';
  conditionHydraulics: 'excelente' | 'bueno' | 'regular' | 'reparar';
  conditionUndercarriage: 'excelente' | 'bueno' | 'regular' | 'reparar';
  conditionChassis: 'excelente' | 'bueno' | 'regular' | 'reparar';
  estimatedValueUsd: number;
  estimatedValueDop: number;
  inspectionPhotosCount: number;
}

interface TradeInValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMachineName?: string;
  targetMachinePriceUsd?: number;
  exchangeRate?: number;
  onApplyTradeInCredit?: (creditUsd: number, summary: string) => void;
}

const BRANDS = ['LiuGong', 'Caterpillar', 'Komatsu', 'JCB', 'Volvo', 'Hyundai', 'Case', 'SANY', 'John Deere', 'Doosan / Develon', 'Otra'];
const CATEGORIES = ['Excavadora de Orugas', 'Pala Cargadora', 'Retroexcavadora', 'Rodillo Compactador', 'Motoniveladora', 'Minicargador', 'Camión Volqueta'];

export const TradeInValuationModal: React.FC<TradeInValuationModalProps> = ({
  isOpen,
  onClose,
  targetMachineName = 'Equipo Nuevo LiuGong / TMD',
  targetMachinePriceUsd = 125000,
  exchangeRate = 60.50,
  onApplyTradeInCredit
}) => {
  const [brand, setBrand] = useState('Caterpillar');
  const [model, setModel] = useState('320D');
  const [year, setYear] = useState<number>(2017);
  const [category, setCategory] = useState('Excavadora de Orugas');
  const [serialNumber, setSerialNumber] = useState('CAT0320DPK10492');
  const [hours, setHours] = useState<number>(5400);
  const [location, setLocation] = useState('Santo Domingo / Obra Activa');

  // Condition 4-pillar ratings
  const [conditionEngine, setConditionEngine] = useState<'excelente' | 'bueno' | 'regular' | 'reparar'>('bueno');
  const [conditionHydraulics, setConditionHydraulics] = useState<'excelente' | 'bueno' | 'regular' | 'reparar'>('bueno');
  const [conditionUndercarriage, setConditionUndercarriage] = useState<'excelente' | 'bueno' | 'regular' | 'reparar'>('regular');
  const [conditionChassis, setConditionChassis] = useState<'excelente' | 'bueno' | 'regular' | 'reparar'>('bueno');

  // Mock photos uploaded state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'Vista Frontal y Cuchara',
    'Compartimento de Motor y Bombas'
  ]);

  const [step, setStep] = useState<'specs' | 'condition_photos' | 'valuation'>('specs');
  const [isCalculating, setIsCalculating] = useState(false);
  const [creditApplied, setCreditApplied] = useState(false);

  if (!isOpen) return null;

  // Valuation algorithm derived from brand tier, category base value, age and hours
  const calculateAppraisal = (): { minUsd: number; maxUsd: number; suggestedUsd: number } => {
    let baseCategoryPrice = 90000;
    if (category === 'Excavadora de Orugas') baseCategoryPrice = 130000;
    else if (category === 'Pala Cargadora') baseCategoryPrice = 115000;
    else if (category === 'Retroexcavadora') baseCategoryPrice = 75000;
    else if (category === 'Rodillo Compactador') baseCategoryPrice = 65000;
    else if (category === 'Motoniveladora') baseCategoryPrice = 140000;

    // Brand premium factor
    let brandMultiplier = 0.95;
    if (brand === 'Caterpillar') brandMultiplier = 1.05;
    else if (brand === 'Komatsu') brandMultiplier = 1.02;
    else if (brand === 'LiuGong') brandMultiplier = 1.00;
    else if (brand === 'Volvo') brandMultiplier = 1.03;
    else if (brand === 'JCB') brandMultiplier = 0.98;

    // Age depreciation (approx 7.5% per year from 2026)
    const age = Math.max(1, 2026 - year);
    const ageDepreciationFactor = Math.max(0.25, 1 - (age * 0.075));

    // Horometer usage factor (approx -2.5% per 1,000 hrs after 2,000)
    const hoursPenalty = Math.max(0, (hours - 2000) * 0.000025);
    const hoursFactor = Math.max(0.40, 1 - hoursPenalty);

    // Condition multiplier
    const conditionScores = {
      excelente: 1.10,
      bueno: 1.00,
      regular: 0.85,
      reparar: 0.65
    };
    const avgCondition = (
      conditionScores[conditionEngine] +
      conditionScores[conditionHydraulics] +
      conditionScores[conditionUndercarriage] +
      conditionScores[conditionChassis]
    ) / 4;

    const rawAppraisal = baseCategoryPrice * brandMultiplier * ageDepreciationFactor * hoursFactor * avgCondition;
    const roundedSuggested = Math.round(rawAppraisal / 500) * 500;
    const minUsd = Math.round((roundedSuggested * 0.92) / 500) * 500;
    const maxUsd = Math.round((roundedSuggested * 1.08) / 500) * 500;

    return { minUsd, maxUsd, suggestedUsd: roundedSuggested };
  };

  const appraisal = calculateAppraisal();

  const handleStartValuation = () => {
    triggerHaptic('selection');
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setStep('valuation');
      triggerHaptic('success');
    }, 1000);
  };

  const handleApplyToQuote = () => {
    triggerHaptic('success');
    setCreditApplied(true);
    if (onApplyTradeInCredit) {
      onApplyTradeInCredit(
        appraisal.suggestedUsd,
        `Permuta de ${brand} ${model} (${year}, ${hours.toLocaleString()} hrs)`
      );
    }
  };

  const tradeInWhatsAppMessage = encodeURIComponent(
    `*SOLICITUD DE TASACIÓN PERICIAL Y PERMUTA (TRADE-IN)*\n` +
    `*Equipo a Entregar:* ${brand} ${model} (${year})\n` +
    `*Categoría:* ${category}\n` +
    `*Horómetro:* ${hours.toLocaleString()} hrs\n` +
    `*Serial / Chasis:* ${serialNumber}\n` +
    `*Ubicación:* ${location}\n` +
    `*Condición Mecánica:* Motor (${conditionEngine}), Hidráulico (${conditionHydraulics}), Tren de Rodaje (${conditionUndercarriage})\n` +
    `*Tasación Estimada Web:* US$ ${appraisal.suggestedUsd.toLocaleString()} (RD$ ${(appraisal.suggestedUsd * exchangeRate).toLocaleString('es-DO', { maximumFractionDigits: 0 })})\n` +
    `*Interés en Unidad Nueva:* ${targetMachineName} (Ref: US$ ${targetMachinePriceUsd.toLocaleString()})\n\n` +
    `Deseo agendar visita del perito tasador de TMD en obra o patio Km 22.`
  );

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl p-5 sm:p-6 text-white font-mono space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                <Repeat className="w-3 h-3 text-amber-400" />
                <span>PROGRAMA TMD TRADE-IN 2026</span>
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-mono">
                TASACIÓN DE USADOS EN PARTE DE PAGO
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-display">
              PERMUTA DE MAQUINARIA PESADA USADA
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              Entrega tu equipo usado multimarca y aplícalo como crédito directo o inicial para tu maquinaria nueva.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setStep('specs')}
            className={`p-2 rounded-[3px] border text-center transition-all ${
              step === 'specs'
                ? 'border-amber-500 bg-zinc-900 text-amber-400 shadow-sm'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            1. FICHA TÉCNICA
          </button>
          <button
            type="button"
            onClick={() => setStep('condition_photos')}
            className={`p-2 rounded-[3px] border text-center transition-all ${
              step === 'condition_photos'
                ? 'border-amber-500 bg-zinc-900 text-amber-400 shadow-sm'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            2. ESTADO & FOTOS
          </button>
          <button
            type="button"
            onClick={() => setStep('valuation')}
            className={`p-2 rounded-[3px] border text-center transition-all ${
              step === 'valuation'
                ? 'border-amber-500 bg-zinc-900 text-amber-400 shadow-sm'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            3. DICTAMEN VALUACIÓN
          </button>
        </div>

        {/* STEP 1: SPECS */}
        {step === 'specs' && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  MARCA DEL EQUIPO USADO *
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 uppercase"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  MODELO COMERCIAL *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej. 320D, 922E, PC200-8"
                  className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  CATEGORÍA DE MÁQUINA *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 uppercase"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  AÑO DE FABRICACIÓN (2008 - 2025) *
                </label>
                <input
                  type="number"
                  min={2008}
                  max={2025}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  LECTURA HORÓMETRO (HORAS) *
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  N° SERIAL / SERIE DE CHASIS
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Ej. CAT0320D..."
                  className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                UBICACIÓN ACTUAL EN REPÚBLICA DOMINICANA
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Mina de Agregados Nizao, Carretera Sánchez / Cantera La Vega"
                className="w-full p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setStep('condition_photos');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md"
              >
                <span>CONTINUAR A ESTADO & FOTOS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONDITION & PHOTOS */}
        {step === 'condition_photos' && (
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-white font-bold uppercase mb-2">
                EVALUACIÓN PRELIMINAR DE ESTADO TÉCNICO (4 PILARES)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-bold mb-1 uppercase">1. MOTOR DIÉSEL & SISTEMA DE INYECCIÓN</span>
                  <select
                    value={conditionEngine}
                    onChange={(e: any) => setConditionEngine(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-bold focus:outline-none focus:border-amber-500 uppercase"
                  >
                    <option value="excelente">Excelente (Sin humo ni fugas)</option>
                    <option value="bueno">Bueno (Operativo estándar)</option>
                    <option value="regular">Regular (Requiere servicio menor)</option>
                    <option value="reparar">Requiere Reparación / Overhaul</option>
                  </select>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-bold mb-1 uppercase">2. SISTEMA HIDRÁULICO & BOMBAS</span>
                  <select
                    value={conditionHydraulics}
                    onChange={(e: any) => setConditionHydraulics(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-bold focus:outline-none focus:border-amber-500 uppercase"
                  >
                    <option value="excelente">Excelente (Presión completa &gt;320 bar)</option>
                    <option value="bueno">Bueno (Cilindros y mangueras secas)</option>
                    <option value="regular">Regular (Sudores leves en cilindros)</option>
                    <option value="reparar">Bomba o mandos con baja presión</option>
                  </select>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-bold mb-1 uppercase">3. TREN DE RODAJE / ORUGAS O CAUCHOS</span>
                  <select
                    value={conditionUndercarriage}
                    onChange={(e: any) => setConditionUndercarriage(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-bold focus:outline-none focus:border-amber-500 uppercase"
                  >
                    <option value="excelente">Excelente (&gt;80% vida restante)</option>
                    <option value="bueno">Bueno (50% - 75% vida útil)</option>
                    <option value="regular">Regular (30% - 40% desgaste)</option>
                    <option value="reparar">Desgastado (&lt;20% / Requiere cambio)</option>
                  </select>
                </div>

                <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400 block font-bold mb-1 uppercase">4. CABINA, ESTRUCTURA & PINTURA</span>
                  <select
                    value={conditionChassis}
                    onChange={(e: any) => setConditionChassis(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-amber-400 font-bold focus:outline-none focus:border-amber-500 uppercase"
                  >
                    <option value="excelente">Excelente (ROPS/FOPS impecable, A/C)</option>
                    <option value="bueno">Bueno (Uso normal en obra)</option>
                    <option value="regular">Regular (Abolladuras leves, sin fracturas)</option>
                    <option value="reparar">Cabina o pluma con fisuras o soldaduras</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo inspection mock upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white font-bold uppercase flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>FOTOGRAFÍAS DE PERITAJE (SUBIDAS: {uploadedPhotos.length}/4)</span>
                </label>
                <span className="text-[11px] text-zinc-400">Requeridas para oferta vinculante</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['1. Frente & Cuchara', '2. Bahía de Motor', '3. Interior Cabina', '4. Tren de Oruga'].map((label, idx) => {
                  const isUploaded = idx < uploadedPhotos.length;
                  return (
                    <div 
                      key={label}
                      className={`p-2.5 rounded-[3px] border text-center flex flex-col items-center justify-center min-h-[72px] transition-all ${
                        isUploaded 
                          ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' 
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                      }`}
                    >
                      {isUploaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase truncate max-w-full">
                            {label}
                          </span>
                          <span className="text-[9px] text-emerald-400/80">Cargada</span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection');
                            setUploadedPhotos([...uploadedPhotos, label]);
                          }}
                          className="flex flex-col items-center justify-center text-zinc-400 hover:text-amber-400 cursor-pointer w-full h-full"
                        >
                          <Upload className="w-4 h-4 mb-1" />
                          <span className="text-[10px] font-bold uppercase">{label}</span>
                          <span className="text-[9px] text-zinc-500">+ Subir</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('specs')}
                className="px-4 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs border border-zinc-800 cursor-pointer"
              >
                VOLVER A FICHA
              </button>

              <button
                type="button"
                onClick={handleStartValuation}
                disabled={isCalculating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-50"
              >
                {isCalculating ? (
                  <span>CALCULANDO TASACIÓN PERICIAL...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>GENERAR TASACIÓN OFICIAL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VALUATION RESULT */}
        {step === 'valuation' && (
          <div className="space-y-4 text-xs font-mono">
            {/* Primary Valuation Banner */}
            <div className="p-4 rounded-[4px] bg-zinc-900 border border-amber-500/40 space-y-3 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-bold">
                    VALOR ESTIMADO DE TOMA EN PERMUTA (TRADE-IN):
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                      US$ {appraisal.suggestedUsd.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400">
                      ≈ RD$ {(appraisal.suggestedUsd * exchangeRate).toLocaleString('es-DO', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase block font-bold">RANGO MERCADO:</span>
                  <span className="text-xs font-bold text-white">
                    US$ {appraisal.minUsd.toLocaleString()} – {appraisal.maxUsd.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Machine Specs Pill */}
              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800 font-bold text-white uppercase">
                  {brand} {model} ({year})
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                  {hours.toLocaleString()} HORAS
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                  SERIAL: {serialNumber}
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  PERITAJE PRE-APROBADO
                </span>
              </div>
            </div>

            {/* Impact on Target Machine */}
            <div className="p-3.5 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-zinc-400 font-bold uppercase block text-[11px]">
                APLICACIÓN DE CRÉDITO A TU COMPRA NUEVA:
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white uppercase font-bold">{targetMachineName}:</span>
                <span className="font-bold text-white">US$ {targetMachinePriceUsd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                <span className="uppercase">(-) ABONO CRÉDITO TRADE-IN:</span>
                <span>-US$ {appraisal.suggestedUsd.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-bold text-xs">
                <span className="text-amber-400 uppercase">SALDO NETO A FINANCIAR / DESEMBOLSAR:</span>
                <span className="text-sm font-black text-amber-400 font-display">
                  US$ {Math.max(0, targetMachinePriceUsd - appraisal.suggestedUsd).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Guarantee Note */}
            <div className="p-3 rounded-[3px] bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                La tasación preliminar queda sujeta a la inspección pericial física final por el equipo de TMD Dominicana en obra o en nuestras instalaciones del Km 22 Autopista Duarte.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {creditApplied ? (
                <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CRÉDITO DE TRADE-IN APLICADO A LA PROFORMA</span>
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-[2px]"
                  >
                    LISTO
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyToQuote}
                  className="w-full py-3 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>APLICAR CRÉDITO (US$ {appraisal.suggestedUsd.toLocaleString()}) A MI COTIZACIÓN</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/18095601234?text=${tradeInWhatsAppMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-[3px] bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-xs flex items-center justify-center gap-2 text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>SOLICITAR PERITO POR WHATSAPP</span>
                </a>

                <button
                  type="button"
                  onClick={() => setStep('condition_photos')}
                  className="py-2.5 px-4 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs border border-zinc-800 cursor-pointer"
                >
                  RECALCULAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
