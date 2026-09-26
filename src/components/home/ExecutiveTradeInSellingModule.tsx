import React, { useState } from 'react';
import { 
  RefreshCw, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  Phone, 
  FileText, 
  Clock, 
  Truck,
  Building2,
  Calendar,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ExecutiveTradeInSellingModuleProps {
  onNavigate?: (route: string) => void;
  onOpenConsultation?: () => void;
}

export const ExecutiveTradeInSellingModule: React.FC<ExecutiveTradeInSellingModuleProps> = ({
  onNavigate,
  onOpenConsultation
}) => {
  const { formatPrice } = useCart();

  // Valuation Form State
  const [brand, setBrand] = useState('JCB');
  const [modelType, setModelType] = useState('Retroexcavadora 4x4');
  const [year, setYear] = useState(2019);
  const [hours, setHours] = useState(4200);
  const [condition, setCondition] = useState<'excelente' | 'bueno' | 'regular'>('bueno');
  const [sellerGoal, setSellerGoal] = useState<'sell_cash' | 'trade_in' | 'consign'>('trade_in');
  const [showValuation, setShowValuation] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');

  // Calculate Dominican Market Valuation
  const calculateEstimate = () => {
    let basePrice = 50000;
    if (brand === 'JCB') basePrice = 55000;
    if (brand === 'Caterpillar') basePrice = 62000;
    if (brand === 'LiuGong') basePrice = 48000;
    if (brand === 'Komatsu') basePrice = 54000;
    if (brand === 'Case') basePrice = 46000;

    if (modelType.includes('Excavadora (20-30T)')) basePrice *= 1.8;
    if (modelType.includes('Cargador Frontal')) basePrice *= 1.4;
    if (modelType.includes('Rodillo')) basePrice *= 1.1;
    if (modelType.includes('Tractor')) basePrice *= 0.65;

    const age = Math.max(0, 2026 - year);
    const ageDecay = age * 3200;
    const hourDecay = (hours / 1000) * 1900;
    let net = Math.max(16000, basePrice - ageDecay - hourDecay);

    if (condition === 'excelente') net *= 1.15;
    if (condition === 'regular') net *= 0.85;

    return Math.round(net);
  };

  const estimatedValue = calculateEstimate();
  const estimatedDOP = Math.round(estimatedValue * 60.5);

  const handleSubmitValuation = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValuation(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <section 
      id="tradein-valuation-module" 
      className="w-full px-3 sm:px-6 lg:px-8 xl:px-12 max-w-[1780px] mx-auto py-6 sm:py-8 font-display"
    >
      <div className="rounded-[5px] bg-zinc-950 border border-zinc-800 shadow-2xl p-3.5 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-zinc-800">
          <div className="space-y-2 sm:space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-[3px] bg-amber-500 text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                PAGO DIRECTO O CRÉDITO TRADE-IN
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-[3px] bg-zinc-900 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 border border-zinc-800">
                MERCADO DE OCASIÓN RD • PATIO KM 22 DUARTE
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white">
              ¿DESEAS VENDER TU MAQUINARIA O RENOVAR FLOTA?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans font-normal leading-relaxed">
              No esperes meses buscando compradores informales. En Técnica Modular Dominicana tasamos con rigor de ingeniería y te pagamos por transferencia bancaria inmediata o tomamos tu equipo como parte de pago para tu nueva unidad JCB o LiuGong.
            </p>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex-1 sm:flex-none p-2.5 sm:p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center shadow-md">
              <span className="text-[10px] sm:text-xs text-amber-400 font-black uppercase tracking-wider block">TIEMPO DE PAGO</span>
              <span className="text-sm sm:text-lg font-black uppercase tracking-wider text-white">24 A 48 HORAS</span>
            </div>
            <div className="flex-1 sm:flex-none p-2.5 sm:p-4 rounded-[4px] bg-zinc-900 border border-zinc-800 text-center shadow-md">
              <span className="text-[10px] sm:text-xs text-emerald-400 font-black uppercase tracking-wider block">INSPECCIÓN TÉCNICA</span>
              <span className="text-sm sm:text-lg font-black uppercase tracking-wider text-white">150 PUNTOS</span>
            </div>
          </div>
        </div>

        {/* Valuation & Interactive Engine */}
        <div className="relative z-10 pt-5 sm:pt-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-start">
          {/* Interactive Calculator Form */}
          <div className="lg:col-span-7 bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-6 lg:p-7 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-wider text-white">
                  SIMULADOR DE AVALÚO INMEDIATO DE MAQUINARIA
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 font-mono px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800">PASO 1 DE 2</span>
            </div>

            <form onSubmit={handleSubmitValuation} className="space-y-3.5 sm:space-y-4">
              {/* Option Selector: What do you want to do? */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block mb-2">
                  ¿CUÁL ES TU OBJETIVO COMERCIAL?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSellerGoal('trade_in')}
                    className={`p-3 rounded-[3px] border text-center transition-all cursor-pointer ${
                      sellerGoal === 'trade_in'
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 font-bold hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider block">TRADE-IN</span>
                    <span className="text-[10px] font-sans opacity-90 block mt-0.5">Abonar a equipo nuevo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerGoal('sell_cash')}
                    className={`p-3 rounded-[3px] border text-center transition-all cursor-pointer ${
                      sellerGoal === 'sell_cash'
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 font-bold hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider block">VENDER / PAYOUT</span>
                    <span className="text-[10px] font-sans opacity-90 block mt-0.5">Recibir dinero rápido</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerGoal('consign')}
                    className={`p-3 rounded-[3px] border text-center transition-all cursor-pointer ${
                      sellerGoal === 'consign'
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 font-bold hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider block">CONSIGNACIÓN</span>
                    <span className="text-[10px] font-sans opacity-90 block mt-0.5">Exhibir en Km 22</span>
                  </button>
                </div>
              </div>

              {/* Machine Brand & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 block mb-1.5">
                    MARCA DEL EQUIPO
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[3px] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="JCB">JCB (Reino Unido)</option>
                    <option value="Caterpillar">Caterpillar (CAT)</option>
                    <option value="LiuGong">LiuGong (Maquinaria Pesada)</option>
                    <option value="Komatsu">Komatsu</option>
                    <option value="Case">Case Construction</option>
                    <option value="John Deere">John Deere</option>
                    <option value="Kubota">Kubota / LS Tractor</option>
                    <option value="Ammann">Ammann / Dynapac</option>
                    <option value="Otra">Otra Marca Internacional</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 block mb-1.5">
                    TIPO DE EQUIPO
                  </label>
                  <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[3px] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Retroexcavadora 4x4">Retroexcavadora 4x4 (3CX / 416 / 580)</option>
                    <option value="Excavadora (20-30T)">Excavadora de Orugas (20T - 30T)</option>
                    <option value="Cargador Frontal">Cargador Frontal (3 a 5 m³)</option>
                    <option value="Rodillo">Rodillo Compactador (10-12T)</option>
                    <option value="Minicargador">Minicargador Skid Steer</option>
                    <option value="Manipulador">Manipulador Telescópico (Telehandler)</option>
                    <option value="Tractor">Tractor Agrícola 4WD</option>
                  </select>
                </div>
              </div>

              {/* Year, Hours, Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 block mb-1.5">
                    AÑO
                  </label>
                  <input
                    type="number"
                    min={2005}
                    max={2026}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[3px] px-3 py-2.5 text-xs sm:text-sm font-black text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 block mb-1.5">
                    HORÓMETRO (H)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={25000}
                    step={100}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[3px] px-3 py-2.5 text-xs sm:text-sm font-black text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-300 block mb-1.5">
                    ESTADO
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[3px] px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="excelente">Excelente (Listo para obra)</option>
                    <option value="bueno">Bueno (Operativo regular)</option>
                    <option value="regular">Regular (Requiere mantenimiento)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>CALCULAR VALOR COMERCIAL ESTIMADO EN RD</span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-Time Valuation Result Card & Direct Action */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-[5px] bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    VALORACIÓN FORMAL PRELIMINAR
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-zinc-300 font-mono px-2 py-0.5 rounded-[2px] bg-zinc-950 border border-zinc-800">TMD-VAL-2026</span>
                </div>

                <div className="py-3 border-y border-zinc-800 space-y-1">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block">
                    VALOR ESTIMADO ({brand} {modelType} • {year}):
                  </span>
                  <div className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                    <span>{formatPrice(estimatedValue)}</span>
                    <span className="text-xs sm:text-sm font-mono text-amber-400 font-bold">USD</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                    ≈ RD$ {estimatedDOP.toLocaleString()} DOP
                  </div>
                </div>

                {/* Key Selling Perks */}
                <div className="space-y-2 text-xs text-zinc-300 font-sans pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tasador mecánico se traslada a tu proyecto sin costo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pago bancario seguro vía transferencia o cheque certificado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tramitación de descargo fiscal y documentación legal DGII</span>
                  </div>
                </div>

                {/* Direct Action Contact Form */}
                {!contactSubmitted ? (
                  <form onSubmit={handleContactSubmit} className="pt-3 space-y-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-white block">
                      SOLICITAR INSPECCIÓN TÉCNICA EN OBRA & OFERTA:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Nombre / Empresa"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-[3px] px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="WhatsApp (RD)"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded-[3px] px-3.5 py-2 text-xs sm:text-sm font-black text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-3 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>AGENDAR INSPECCIÓN</span>
                      </button>

                      <a
                        href={`https://wa.me/18095601234?text=${encodeURIComponent(
                          `Hola TMD Dominicana, solicito inspección para ${sellerGoal === 'trade_in' ? 'Trade-In' : sellerGoal === 'sell_cash' ? 'Venta Directa Payout' : 'Consignación'} de maquinaria:\n• Equipo: ${brand} ${modelType}\n• Año: ${year}\n• Horas: ${hours}h\n• Estado: ${condition}\n• Valor Estimado: US$ ${estimatedValue.toLocaleString()} (~RD$ ${estimatedDOP.toLocaleString()} DOP)\n• Contacto: ${sellerName || 'Cliente'} (${sellerPhone || 'Pendiente'})\n• Ubicación: Patio / Obra en República Dominicana.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>WHATSAPP DIRECTO</span>
                      </a>
                    </div>
                  </form>
                ) : (
                  <div className="p-3.5 rounded-[4px] bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2.5 mt-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white block">
                      SOLICITUD DE TASACIÓN REGISTRADA
                    </span>
                    <p className="text-xs text-zinc-300 font-sans">
                      Un tasador senior de Técnica Modular Dominicana te contactará al <strong className="text-white font-mono">{sellerPhone}</strong> para coordinar la inspección en tu obra.
                    </p>
                    <a
                      href={`https://wa.me/18095601234?text=${encodeURIComponent(
                        `Hola TMD Dominicana, acabo de registrar la solicitud de tasación para ${brand} ${modelType} (${year}, ${hours}h, US$ ${estimatedValue.toLocaleString()}). Mi número es ${sellerPhone}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>CONFIRMAR VÍA WHATSAPP</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Consignment Banner */}
            <div className="p-3.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold uppercase tracking-wider">¿TIENES MÁS DE 3 MÁQUINAS PARA LIQUIDAR EN LOTE?</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('#/trade-in')}
                className="text-amber-400 font-black uppercase tracking-wider hover:text-amber-300 cursor-pointer text-xs shrink-0"
              >
                LIQUIDAR FLOTA COMPLETA →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
