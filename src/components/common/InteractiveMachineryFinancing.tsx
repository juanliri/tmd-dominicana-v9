import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Calculator, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  Percent, 
  ShieldCheck, 
  PhoneCall, 
  ExternalLink,
  Sparkles,
  FileSpreadsheet,
  BadgeCheck,
  Send,
  X,
  FileCheck
} from 'lucide-react';
import { Machine } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

export interface DominicanBankPartner {
  id: 'popular' | 'bhd' | 'banreservas' | 'tmd_direct';
  name: string;
  shortName: string;
  tagline: string;
  annualRate: number; // e.g. 9.25%
  maxTermMonths: number;
  minDownPaymentPercent: number;
  brandColor: string;
  badgeBg: string;
  prequalUrl?: string;
  whatsappMessage: string;
}

export const DOMINICAN_BANK_PARTNERS: DominicanBankPartner[] = [
  {
    id: 'popular',
    name: 'Banco Popular Dominicano',
    shortName: 'Popular',
    tagline: 'Líder en Leasing Industrial & Constructoras RD',
    annualRate: 9.25,
    maxTermMonths: 60,
    minDownPaymentPercent: 15,
    brandColor: '#002B66',
    badgeBg: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
    prequalUrl: 'https://popularenlinea.com/personas/prestamos/leasing-vehiculos-comerciales',
    whatsappMessage: 'Solicito pre-calificación para Leasing de Equipo con Banco Popular Dominicano.'
  },
  {
    id: 'bhd',
    name: 'Banco BHD',
    shortName: 'BHD',
    tagline: 'Aprobación Ágil en 48 Horas para Contratistas',
    annualRate: 9.50,
    maxTermMonths: 60,
    minDownPaymentPercent: 20,
    brandColor: '#007A33',
    badgeBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    prequalUrl: 'https://www.bhd.com.do/prestamos-comerciales',
    whatsappMessage: 'Solicito pre-calificación para Crédito/Leasing con Banco BHD.'
  },
  {
    id: 'banreservas',
    name: 'Banreservas',
    shortName: 'Banreservas',
    tagline: 'Tasa Fija y Respaldo Estatal para Proyectos Viales',
    annualRate: 9.00,
    maxTermMonths: 60,
    minDownPaymentPercent: 15,
    brandColor: '#0284C7',
    badgeBg: 'bg-sky-950/60 text-sky-400 border-sky-500/30',
    prequalUrl: 'https://www.banreservas.com/prestamos-comerciales',
    whatsappMessage: 'Solicito asesoría de financiamiento institucional vía Banreservas.'
  },
  {
    id: 'tmd_direct',
    name: 'TMD Directo (Patio Km 22)',
    shortName: 'TMD Directo',
    tagline: 'Crédito Inmediato de Distribuidor sin Burocracia',
    annualRate: 8.50,
    maxTermMonths: 48,
    minDownPaymentPercent: 25,
    brandColor: '#D97706',
    badgeBg: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    whatsappMessage: 'Solicito evaluación para Crédito Directo de Distribuidor con TMD en Patio Km 22.'
  }
];

interface InteractiveMachineryFinancingProps {
  machine: Machine;
  totalInvestmentUsd?: number;
  onOpenDetailedProforma?: () => void;
  className?: string;
}

export const InteractiveMachineryFinancing: React.FC<InteractiveMachineryFinancingProps> = ({
  machine,
  totalInvestmentUsd,
  onOpenDetailedProforma,
  className = ''
}) => {
  const basePrice = totalInvestmentUsd || machine.basePriceUsd;

  // Selected parameters
  const [selectedBankId, setSelectedBankId] = useState<DominicanBankPartner['id']>('popular');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(48);
  const [activePrequalModal, setActivePrequalModal] = useState<DominicanBankPartner | null>(null);
  const [prequalRnc, setPrequalRnc] = useState<string>('');
  const [prequalCompanyName, setPrequalCompanyName] = useState<string>('');
  const [prequalPhone, setPrequalPhone] = useState<string>('');
  const [prequalSubmitted, setPrequalSubmitted] = useState<boolean>(false);

  const selectedBank = useMemo(() => {
    return DOMINICAN_BANK_PARTNERS.find(b => b.id === selectedBankId) || DOMINICAN_BANK_PARTNERS[0];
  }, [selectedBankId]);

  // Calculations in USD and DOP (Dominican Pesos)
  const downPaymentUsd = (basePrice * downPaymentPercent) / 100;
  const downPaymentDop = Math.round(downPaymentUsd * USD_TO_DOP_RATE);

  const financedAmountUsd = Math.max(0, basePrice - downPaymentUsd);
  const financedAmountDop = Math.round(financedAmountUsd * USD_TO_DOP_RATE);

  const monthlyRate = (selectedBank.annualRate / 100) / 12;
  const monthlyPaymentUsd = financedAmountUsd > 0 && monthlyRate > 0 && termMonths > 0
    ? (financedAmountUsd * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
    : 0;

  const monthlyPaymentDop = Math.round(monthlyPaymentUsd * USD_TO_DOP_RATE);
  const totalFinancingPaidUsd = monthlyPaymentUsd * termMonths;
  const totalInterestUsd = Math.max(0, totalFinancingPaidUsd - financedAmountUsd);

  // Term options
  const termOptions = [12, 24, 36, 48, 60];
  // Preset down payment % options
  const downPaymentPresets = [15, 20, 25, 30, 40, 50];

  const handleOpenPrequal = (bank: DominicanBankPartner) => {
    setActivePrequalModal(bank);
    setPrequalSubmitted(false);
  };

  const handleSendPrequalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setPrequalSubmitted(true);
    
    // Construct WhatsApp message with pre-qualification telemetry
    const text = `🏦 *SOLICITUD DE PRE-CALIFICACIÓN BANCARIA TMD RD*%0A%0A` +
      `• *Entidad:* ${activePrequalModal?.name} (${activePrequalModal?.annualRate}%%25 APR)%0A` +
      `• *Equipo:* ${encodeURIComponent(machine.name)} (${encodeURIComponent(machine.brand)})%0A` +
      `• *Código / Modelo:* ${encodeURIComponent(machine.modelCode)}%0A` +
      `• *Valor Total:* US$ ${basePrice.toLocaleString()} (~RD$ ${(basePrice * USD_TO_DOP_RATE).toLocaleString('es-DO')})%0A` +
      `• *Inicial:* ${downPaymentPercent}%%25 (US$ ${Math.round(downPaymentUsd).toLocaleString()} / RD$ ${downPaymentDop.toLocaleString('es-DO')})%0A` +
      `• *Plazo:* ${termMonths} meses (${termMonths / 12} años)%0A` +
      `• *Cuota Estimada:* *RD$ ${monthlyPaymentDop.toLocaleString('es-DO')}/mes* (~US$ ${Math.round(monthlyPaymentUsd).toLocaleString()}/mes)%0A%0A` +
      `🏢 *DATOS DE LA EMPRESA / CONTRATISTA:*%0A` +
      `• Empresa / Razón Social: ${encodeURIComponent(prequalCompanyName || 'Contratista General')}%0A` +
      `• RNC / Cédula: ${encodeURIComponent(prequalRnc || 'Pendiente')}%0A` +
      `• Teléfono de Contacto: ${encodeURIComponent(prequalPhone || 'Por llamada')}%0A%0A` +
      `_Favor canalizar con el ejecutivo de cuentas corporativas del banco._`;

    setTimeout(() => {
      window.open(`https://wa.me/18095601234?text=${text}`, '_blank', 'noopener,noreferrer');
    }, 450);
  };

  return (
    <div className={`space-y-4 font-mono text-zinc-100 ${className}`}>
      {/* 1. Header & Bank Selection Pills */}
      <div className="bg-zinc-950 p-4 rounded-[4px] border border-zinc-800 space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-display font-black text-xs uppercase tracking-wider text-white">
              SIMULADOR DE FINANCIAMIENTO & LEASING RD
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-[2px] border border-amber-500/30 uppercase">
            Tasa Preferencial TMD: {selectedBank.annualRate}% APR
          </span>
        </div>

        {/* Bank Option Buttons */}
        <div>
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 font-display">
            SELECCIONAR BANCO / CONVENIO DE LEASING
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOMINICAN_BANK_PARTNERS.map(bank => {
              const isSelected = bank.id === selectedBankId;
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-2.5 rounded-[3px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-bold text-xs uppercase truncate">
                      {bank.shortName}
                    </span>
                    <span className={`text-[9px] font-mono px-1 rounded-[2px] ${
                      isSelected ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {bank.annualRate}%
                    </span>
                  </div>
                  <span className={`text-[8px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-500'
                  }`}>
                    {bank.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Sliders & Adjusters */}
        <div className="md:col-span-7 bg-zinc-950 p-4 rounded-[4px] border border-zinc-800 space-y-4">
          {/* Down Payment % Slider & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-bold uppercase font-display flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>INICIAL / PAGO INICIAL ({downPaymentPercent}%)</span>
              </span>
              <span className="text-amber-400 font-black font-mono text-xs sm:text-sm">
                RD$ {downPaymentDop.toLocaleString('es-DO')}
                <span className="text-[10px] text-zinc-500 ml-1">(US$ {Math.round(downPaymentUsd).toLocaleString()})</span>
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-none cursor-pointer"
            />

            {/* Down payment preset quick buttons */}
            <div className="grid grid-cols-6 gap-1 pt-1">
              {downPaymentPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`py-1 text-[10px] font-bold rounded-[2px] transition-all cursor-pointer uppercase ${
                    downPaymentPercent === pct
                      ? 'bg-amber-400 text-black font-black'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Term (Months) Buttons */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-bold uppercase font-display flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>PLAZO DE FINANCIAMIENTO</span>
              </span>
              <span className="text-white font-black font-mono">
                {termMonths} MESES ({termMonths / 12} {termMonths === 12 ? 'AÑO' : 'AÑOS'})
              </span>
            </div>

            {/* Term pills */}
            <div className="grid grid-cols-5 gap-1.5">
              {termOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTermMonths(m)}
                  className={`py-2 text-xs font-bold rounded-[2px] transition-all cursor-pointer uppercase text-center ${
                    termMonths === m
                      ? 'bg-zinc-100 text-black font-black shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Financed amount reference summary */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>MONTO A FINANCIAR (CAPITAL):</span>
            <span className="font-bold text-white font-mono">
              RD$ {financedAmountDop.toLocaleString('es-DO')}
              <span className="text-[10px] text-zinc-500 ml-1 font-normal">(US$ {Math.round(financedAmountUsd).toLocaleString()})</span>
            </span>
          </div>
        </div>

        {/* Right Column: Estimated Monthly Payment in Pesos & USD */}
        <div className="md:col-span-5 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-5 rounded-[4px] border border-amber-400/40 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-display">
                CUOTA MENSUAL ESTIMADA ({selectedBank.shortName})
              </span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/30">
                100% DEDUCIBLE ISR
              </span>
            </div>

            {/* Massive Cuota in DOP (Pesos Dominicanos) */}
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                RD$ {monthlyPaymentDop.toLocaleString('es-DO')}
                <span className="text-xs text-zinc-400 font-normal uppercase"> / mes</span>
              </div>
              <div className="text-xs font-bold text-zinc-300 font-mono">
                ≈ US$ {Math.round(monthlyPaymentUsd).toLocaleString()} USD / mes
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed font-sans">
              Cuota de referencia calculada con tasa fija del <strong className="text-white">{selectedBank.annualRate}% anual</strong> con {selectedBank.name}. Sujeto a evaluación crediticia.
            </p>
          </div>

          {/* Pre-qualification Buttons */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-400 font-display flex items-center justify-between">
              <span>PRE-CALIFICAR DIRECTO:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                <span>RESPUESTA EN 48H</span>
              </span>
            </div>

            {/* Bank Prequalification Trigger Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Popular Button */}
              <button
                type="button"
                onClick={() => handleOpenPrequal(DOMINICAN_BANK_PARTNERS[0])}
                className="py-2 px-2.5 rounded-[3px] bg-[#002B66] hover:bg-[#003882] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-blue-400/40"
              >
                <Building2 className="w-3 h-3 text-blue-300" />
                <span>POPULAR</span>
              </button>

              {/* BHD Button */}
              <button
                type="button"
                onClick={() => handleOpenPrequal(DOMINICAN_BANK_PARTNERS[1])}
                className="py-2 px-2.5 rounded-[3px] bg-[#007A33] hover:bg-[#00943e] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-emerald-400/40"
              >
                <Building2 className="w-3 h-3 text-emerald-300" />
                <span>BANCO BHD</span>
              </button>
            </div>

            {/* Other Banks & Direct Dispatch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenPrequal(DOMINICAN_BANK_PARTNERS[2])}
                className="py-1.5 px-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-sky-400 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-sky-500/30"
              >
                <span>BANRESERVAS</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenPrequal(DOMINICAN_BANK_PARTNERS[3])}
                className="py-1.5 px-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-amber-500/30"
              >
                <span>TMD DIRECTO</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Direct Pre-qualification Modal (Dominican Banks) */}
      {activePrequalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-700 rounded-[5px] max-w-lg w-full p-5 text-white space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[3px] bg-amber-400 text-black">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-black text-sm uppercase text-white">
                    PRE-CALIFICACIÓN {activePrequalModal.name.toUpperCase()}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Canalización prioritaria para {machine.brand} {machine.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePrequalModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-[2px] bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Summary Box */}
            <div className="p-3 bg-zinc-900 rounded-[3px] border border-zinc-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Equipo:</span>
                <span className="font-bold text-white uppercase">{machine.brand} {machine.modelCode}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Valor Total:</span>
                <span className="font-bold text-white">RD$ {(basePrice * USD_TO_DOP_RATE).toLocaleString('es-DO')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Inicial ({downPaymentPercent}%):</span>
                <span className="font-bold text-emerald-400">RD$ {downPaymentDop.toLocaleString('es-DO')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Plazo / Tasa:</span>
                <span className="font-bold text-white">{termMonths} Meses @ {activePrequalModal.annualRate}% APR</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-zinc-800 text-sm font-black">
                <span className="text-amber-400">Cuota Estimada:</span>
                <span className="text-amber-400">RD$ {monthlyPaymentDop.toLocaleString('es-DO')}/mes</span>
              </div>
            </div>

            {/* Form */}
            {!prequalSubmitted ? (
              <form onSubmit={handleSendPrequalRequest} className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                    Nombre de la Empresa o Contratista *
                  </label>
                  <input
                    type="text"
                    required
                    value={prequalCompanyName}
                    onChange={(e) => setPrequalCompanyName(e.target.value)}
                    placeholder="Ej. Constructora del Caribe S.R.L."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[3px] text-xs text-white uppercase font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      RNC o Cédula *
                    </label>
                    <input
                      type="text"
                      required
                      value={prequalRnc}
                      onChange={(e) => setPrequalRnc(e.target.value)}
                      placeholder="131-XXXXX-X"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[3px] text-xs text-white uppercase font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">
                      Teléfono Móvil / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={prequalPhone}
                      onChange={(e) => setPrequalPhone(e.target.value)}
                      placeholder="809-XXX-XXXX"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-[3px] text-xs text-white uppercase font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2 font-display">
                  <button
                    type="button"
                    onClick={() => setActivePrequalModal(null)}
                    className="flex-1 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase text-xs cursor-pointer border border-zinc-800"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ENVIAR A {activePrequalModal.shortName}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-[3px] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-xs uppercase text-white font-display">
                  ¡SOLICITUD GENERADA EXITOSAMENTE!
                </h5>
                <p className="text-[11px] text-zinc-300 font-sans">
                  Abriendo canal directo de WhatsApp con el oficial de crédito corporativo para formalizar la evaluación con {activePrequalModal.name}.
                </p>
                <button
                  type="button"
                  onClick={() => setActivePrequalModal(null)}
                  className="mt-2 px-4 py-1.5 rounded-[2px] bg-emerald-500 text-black font-black uppercase text-xs"
                >
                  CERRAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
