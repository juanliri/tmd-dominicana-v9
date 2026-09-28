import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Building2,
  Table,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Machine } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { useCart } from '../context/CartContext';

interface MachineryFinancingCalculatorProps {
  machine?: Machine | null;
  onOpenDetailedEstimate?: (machine: Machine) => void;
  className?: string;
}

interface BankOption {
  id: string;
  name: string;
  shortName: string;
  rate: number;
  highlight: string;
  logoColor: string;
}

const DOMINICAN_BANKS: BankOption[] = [
  {
    id: 'popular',
    name: 'Banco Popular Dominicano',
    shortName: 'Popular',
    rate: 9.95,
    highlight: 'Leasing Industrial & Obras Civiles (Popular)',
    logoColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30'
  },
  {
    id: 'bhd',
    name: 'Banco BHD',
    shortName: 'BHD',
    rate: 10.25,
    highlight: 'Línea de Crédito Pyme Contratistas en 48h',
    logoColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    id: 'banreservas',
    name: 'Banreservas',
    shortName: 'Banreservas',
    rate: 10.50,
    highlight: 'Fomento Vial y Equipos de Construcción',
    logoColor: 'text-sky-500 bg-sky-500/10 border-sky-500/30'
  },
  {
    id: 'tmd_direct',
    name: 'TMD Crédito Directo Patio Km 22',
    shortName: 'TMD Directo',
    rate: 8.50,
    highlight: 'Aprobación Inmediata con Entrega en Patio',
    logoColor: 'text-amber-500 bg-amber-500/15 border-amber-500/30'
  }
];

export const MachineryFinancingCalculator = React.memo<MachineryFinancingCalculatorProps>(({
  machine,
  onOpenDetailedEstimate,
  className = ''
}) => {
  const { formatPrice } = useCart();

  // Baseline price default if no specific machine is passed or selected
  const defaultPriceUsd = machine ? machine.basePriceUsd : 85000;
  const [customPriceUsd, setCustomPriceUsd] = useState<number>(defaultPriceUsd);
  
  // Financing variables
  const [viewMode, setViewMode] = useState<'single' | 'comparative'>('single');
  const [selectedBankId, setSelectedBankId] = useState<string>('popular');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 15%, 20%, 30%, 40%
  const [loanDurationMonths, setLoanDurationMonths] = useState<number>(36); // 12, 24, 36, 48, 60
  const [showAmortizationTable, setShowAmortizationTable] = useState<boolean>(false);

  // Recalculate price if machine prop updates
  React.useEffect(() => {
    if (machine) {
      setCustomPriceUsd(machine.basePriceUsd);
    }
  }, [machine]);

  const selectedBank = DOMINICAN_BANKS.find(b => b.id === selectedBankId) || DOMINICAN_BANKS[0];
  const annualInterestRate = selectedBank.rate;

  const effectivePriceUsd = customPriceUsd;
  const downPaymentAmountUsd = (effectivePriceUsd * downPaymentPercent) / 100;
  const financedPrincipalUsd = Math.max(0, effectivePriceUsd - downPaymentAmountUsd);

  // Multi-bank comparative leasing dataset
  const comparativeData = React.useMemo(() => {
    return DOMINICAN_BANKS.map((b) => {
      const r = (b.rate / 100) / 12;
      const n = loanDurationMonths;
      const monthlyUsd = financedPrincipalUsd > 0 && r > 0 && n > 0
        ? (financedPrincipalUsd * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
        : 0;
      const totalPaidUsd = monthlyUsd * n;
      const interestUsd = Math.max(0, totalPaidUsd - financedPrincipalUsd);
      return {
        ...b,
        monthlyUsd,
        monthlyDop: monthlyUsd * USD_TO_DOP_RATE,
        interestUsd,
        totalCostUsd: downPaymentAmountUsd + totalPaidUsd
      };
    });
  }, [financedPrincipalUsd, loanDurationMonths, downPaymentAmountUsd]);

  // Amortization calculation: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = (annualInterestRate / 100) / 12;
  const numberOfPayments = loanDurationMonths;

  const estimatedMonthlyPaymentUsd = financedPrincipalUsd > 0 && monthlyRate > 0 && numberOfPayments > 0
    ? (financedPrincipalUsd * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    : 0;

  const totalFinancedPaidUsd = estimatedMonthlyPaymentUsd * numberOfPayments;
  const totalInterestPaidUsd = Math.max(0, totalFinancedPaidUsd - financedPrincipalUsd);

  // Generate annual amortization schedule
  const amortizationSchedule = React.useMemo(() => {
    if (financedPrincipalUsd <= 0 || monthlyRate <= 0) return [];
    const schedule: { period: string; payment: number; principal: number; interest: number; balance: number }[] = [];
    let remaining = financedPrincipalUsd;
    const totalYears = Math.ceil(loanDurationMonths / 12);

    for (let year = 1; year <= totalYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      const monthsInYear = Math.min(12, loanDurationMonths - (year - 1) * 12);

      for (let m = 1; m <= monthsInYear; m++) {
        const interestM = remaining * monthlyRate;
        const principalM = estimatedMonthlyPaymentUsd - interestM;
        yearlyInterest += interestM;
        yearlyPrincipal += principalM;
        remaining = Math.max(0, remaining - principalM);
      }

      schedule.push({
        period: `Año ${year} (${monthsInYear} meses)`,
        payment: (yearlyPrincipal + yearlyInterest),
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: remaining
      });
    }

    return schedule;
  }, [financedPrincipalUsd, monthlyRate, loanDurationMonths, estimatedMonthlyPaymentUsd]);

  const durationOptions = [
    { label: '12 meses (1 año)', months: 12 },
    { label: '24 meses (2 años)', months: 24 },
    { label: '36 meses (3 años)', months: 36 },
    { label: '48 meses (4 años)', months: 48 },
    { label: '60 meses (5 años)', months: 60 },
  ];

  const downPaymentOptions = [15, 20, 25, 30, 40];

  return (
    <div className={`bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-xl overflow-hidden font-mono ${className}`}>
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-zinc-950 text-white border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[3px] bg-amber-400 text-black flex items-center justify-center shrink-0 font-black">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight uppercase font-display">
                CALCULADORA DE FINANCIAMIENTO & LEASING
              </h3>
              <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-wider">
                LEASING RD
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 uppercase">
              {machine 
                ? `Estimación de cuota para ${machine.brand} ${machine.name} (Mod. ${machine.modelCode})`
                : 'Simulador de cuotas mensuales con banca dominicana (Banco Popular, BHD, Banreservas)'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Bank agreements selector pills */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-[3px] border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Simulador
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparative')}
              className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'comparative'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Matriz Multi-Banco</span>
              <span className={`px-1 py-0.2 rounded-[2px] text-[9px] font-mono ${viewMode === 'comparative' ? 'bg-black/20 text-black' : 'bg-amber-400/20 text-amber-400'}`}>
                Popular • BHD • Banreservas
              </span>
            </button>
          </div>

          {viewMode === 'single' && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
              {DOMINICAN_BANKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBankId(b.id)}
                  className={`px-2 py-1 rounded-[3px] border transition-all cursor-pointer font-mono ${
                    selectedBankId === b.id
                      ? 'bg-amber-400 text-black border-amber-400 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {b.shortName} ({b.rate}%)
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body: Multi-Bank Comparative View OR Single Simulator */}
      {viewMode === 'comparative' ? (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Quick Slider Controls */}
          <div className="p-4 rounded-[4px] bg-zinc-950 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-zinc-400 uppercase">VALOR EQUIPO REFERENCIAL</span>
                <span className="font-mono font-black text-amber-400">US$ {effectivePriceUsd.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={25000}
                max={350000}
                step={5000}
                value={customPriceUsd}
                onChange={(e) => setCustomPriceUsd(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 appearance-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-zinc-400 uppercase">INICIAL ({downPaymentPercent}%)</span>
                <span className="font-mono font-black text-emerald-400">US$ {downPaymentAmountUsd.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 appearance-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-zinc-400 uppercase">PLAZO FINANCIAMIENTO</span>
                <span className="font-mono font-black text-amber-400">{loanDurationMonths} MESES</span>
              </div>
              <div className="flex items-center gap-1">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setLoanDurationMonths(opt.months)}
                    className={`flex-1 py-1 rounded-[2px] text-[10px] font-bold font-mono transition-all ${
                      loanDurationMonths === opt.months
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.months}M
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Card Comparative Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparativeData.map((bank) => {
              const isSelected = bank.id === selectedBankId;
              return (
                <div
                  key={bank.id}
                  className={`p-4 rounded-[4px] border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-zinc-950 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-800">
                      <div>
                        <h4 className="font-bold text-xs uppercase text-white font-display">
                          {bank.shortName}
                        </h4>
                        <span className="text-[10px] text-zinc-400 block line-clamp-1">
                          {bank.highlight}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono font-black text-[11px] shrink-0">
                        {bank.rate}%
                      </span>
                    </div>

                    {/* Monthly Fee */}
                    <div className="bg-zinc-900/90 p-3 rounded-[3px] border border-zinc-800/80 space-y-1">
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-bold">
                        CUOTA MENSUAL ESTIMADA
                      </span>
                      <div className="text-xl font-black text-white font-mono">
                        US$ {Math.round(bank.monthlyUsd).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-amber-400 font-mono">
                        ≈ RD$ {Math.round(bank.monthlyDop).toLocaleString('es-DO')}
                      </div>
                    </div>

                    {/* Financial details */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex justify-between text-zinc-400">
                        <span>CAPITAL:</span>
                        <span className="text-zinc-200">US$ {Math.round(financedPrincipalUsd).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>INTERESES TOTALES:</span>
                        <span className="text-amber-400 font-bold">US$ {Math.round(bank.interestUsd).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>INVERSIÓN TOTAL:</span>
                        <span className="text-white font-bold">US$ {Math.round(bank.totalCostUsd).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span>VENTAJA FISCAL:</span>
                        <span className="text-emerald-400 font-bold">100% GASTO ISR</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBankId(bank.id);
                        setViewMode('single');
                      }}
                      className={`w-full py-1.5 rounded-[2px] font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-xs'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      {isSelected ? '✓ SELECCIONADO' : 'VER DESGLOSE'}
                    </button>

                    <a
                      href={`https://wa.me/18095601234?text=${encodeURIComponent(
                        `Hola TMD Dominicana, solicito pre-calificación de leasing para maquinaria con ${bank.name} (${bank.rate}% APR). Valor: US$ ${effectivePriceUsd.toLocaleString()}, Inicial: US$ ${Math.round(downPaymentAmountUsd).toLocaleString()} (${downPaymentPercent}%), Plazo: ${loanDurationMonths} meses. Cuota estimada: ~US$ ${Math.round(bank.monthlyUsd).toLocaleString()}/mes (~RD$ ${Math.round(bank.monthlyDop).toLocaleString('es-DO')}/mes).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>PRE-CALIFICAR</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-zinc-950 rounded-[4px] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tasas oficiales actualizadas 2026 bajo convenio TMD Dominicana con Banco Popular, BHD y Banreservas.</span>
            </span>
            <span className="font-mono text-zinc-500 uppercase text-[10px]">
              TASA BCRD: 1 USD = {USD_TO_DOP_RATE} DOP
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-7 space-y-4">
            {/* Bank Selection Grid */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between font-display">
                <span>CONVENIO BANCARIO O CRÉDITO DE PATIO</span>
                <span className="text-[10px] font-black text-amber-400 font-mono">
                  TASA: {selectedBank.rate}% ANUAL
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DOMINICAN_BANKS.map((b) => {
                  const isCurrent = b.id === selectedBankId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-2.5 rounded-[3px] border text-left transition-all cursor-pointer uppercase ${
                        isCurrent
                          ? 'bg-amber-500/10 border-amber-400 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white">{b.shortName}</span>
                        <span className="text-[10px] font-black text-amber-400 font-mono">{b.rate}%</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-1 line-clamp-1">
                        {b.highlight}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Equipment Price Reference */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-display">
                  VALOR REFERENCIAL EQUIPO (USD)
                </label>
                <span className="text-xs font-black text-amber-400 font-mono">
                  US$ {effectivePriceUsd.toLocaleString()} 
                  <span className="text-[10px] text-zinc-500 ml-1">
                    (~RD$ {(effectivePriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                  </span>
                </span>
              </div>

              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min={20000}
                  max={500000}
                  step={2500}
                  value={customPriceUsd}
                  onChange={(e) => setCustomPriceUsd(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 rounded-[3px] bg-zinc-950 border border-zinc-700 text-white text-xs font-bold font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              
              <input
                type="range"
                min={25000}
                max={350000}
                step={5000}
                value={customPriceUsd}
                onChange={(e) => setCustomPriceUsd(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-none appearance-none"
              />
            </div>

            {/* Down Payment (% and USD) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-display">
                  <Percent className="w-3 h-3 text-amber-400" />
                  <span>PAGO INICIAL (ENGANCHE)</span>
                </label>
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  {downPaymentPercent}% = <span className="text-emerald-400 font-black">US$ {downPaymentAmountUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </span>
              </div>

              {/* Quick selector buttons */}
              <div className="grid grid-cols-5 gap-2">
                {downPaymentOptions.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-1.5 text-xs font-black rounded-[3px] transition-all cursor-pointer border font-mono ${
                      downPaymentPercent === pct
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-none appearance-none"
              />
            </div>

            {/* Loan Duration (Months) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-display">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>PLAZO DE FINANCIAMIENTO</span>
                </label>
                <span className="text-xs font-black text-amber-400 font-mono">
                  {loanDurationMonths} MESES ({loanDurationMonths / 12} {loanDurationMonths === 12 ? 'AÑO' : 'AÑOS'})
                </span>
              </div>

              {/* Duration Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setLoanDurationMonths(opt.months)}
                    className={`py-1.5 px-1 text-xs font-black rounded-[3px] transition-all text-center cursor-pointer border uppercase font-mono ${
                      loanDurationMonths === opt.months
                        ? 'bg-zinc-100 text-black border-zinc-100'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.months}M
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Amortization Table Button */}
            <button
              type="button"
              onClick={() => setShowAmortizationTable(!showAmortizationTable)}
              className="w-full py-2 px-3 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] font-black uppercase flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-amber-400" />
                <span>{showAmortizationTable ? 'OCULTAR TABLA AMORTIZACIÓN ANUAL' : 'VER TABLA AMORTIZACIÓN & CAPITAL / INTERÉS'}</span>
              </div>
              {showAmortizationTable ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {/* Amortization Table */}
            {showAmortizationTable && (
              <div className="rounded-[3px] border border-zinc-800 overflow-hidden text-[11px] bg-zinc-950 animate-in fade-in">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900 text-[9px] font-black uppercase text-zinc-400">
                    <tr>
                      <th className="p-2">PERÍODO</th>
                      <th className="p-2">ABONO TOTAL</th>
                      <th className="p-2">CAPITAL</th>
                      <th className="p-2">INTERÉS</th>
                      <th className="p-2 text-right">SALDO FINAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 font-mono">
                    {amortizationSchedule.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/50">
                        <td className="p-2 font-bold text-white uppercase">{item.period}</td>
                        <td className="p-2 text-zinc-300">US$ {Math.round(item.payment).toLocaleString()}</td>
                        <td className="p-2 text-emerald-400 font-bold">US$ {Math.round(item.principal).toLocaleString()}</td>
                        <td className="p-2 text-amber-400">US$ {Math.round(item.interest).toLocaleString()}</td>
                        <td className="p-2 text-right font-black text-white">US$ {Math.round(item.balance).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Estimated Result Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-[5px] bg-zinc-950 border border-zinc-800 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-display">
                  CUOTA ESTIMADA ({selectedBank.shortName})
                </span>
                <span className="px-2 py-0.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase">
                  APROBACIÓN 48H
                </span>
              </div>

              {/* Big Monthly Payment Display */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight font-mono">
                    US$ {Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}
                  </span>
                  <span className="text-xs font-normal text-zinc-400 uppercase">/ MES</span>
                </div>
                <div className="text-[11px] font-bold text-amber-400 mt-1 font-mono">
                  ≈ RD$ {Math.round(estimatedMonthlyPaymentUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')} / MES
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="space-y-1.5 pt-3 border-t border-zinc-800 text-[11px] uppercase">
                <div className="flex justify-between text-zinc-400">
                  <span>ENTIDAD FINANCIERA:</span>
                  <span className="font-bold text-white">
                    {selectedBank.name} ({selectedBank.rate}%)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>MONTO A FINANCIAR:</span>
                  <span className="font-bold text-white font-mono">
                    US$ {Math.round(financedPrincipalUsd).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>INICIAL ({downPaymentPercent}%):</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    US$ {Math.round(downPaymentAmountUsd).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>PLAZO:</span>
                  <span className="font-bold text-white font-mono">
                    {loanDurationMonths} CUOTAS MENSUALES
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>INTERESES ESTIMADOS:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    US$ {Math.round(totalInterestPaidUsd).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>BENEFICIO FISCAL:</span>
                  <span className="font-bold text-zinc-200">
                    100% DEDUCIBLE ISR
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-2 pt-3 border-t border-zinc-800">
              {machine && onOpenDetailedEstimate ? (
                <button
                  type="button"
                  onClick={() => onOpenDetailedEstimate(machine)}
                  className="w-full py-2.5 px-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>SOLICITAR PRE-CALIFICACIÓN {selectedBank.shortName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <a
                  href={`https://wa.me/18095601234?text=${encodeURIComponent(
                    `Hola TMD Dominicana, solicito asesoría de financiamiento/leasing para maquinaria. Entidad: ${selectedBank.name} (${selectedBank.rate}%). Valor Equipo: US$ ${effectivePriceUsd.toLocaleString()}, Inicial: ${downPaymentPercent}% (US$ ${Math.round(downPaymentAmountUsd).toLocaleString()}), Plazo: ${loanDurationMonths} meses. Cuota estimada: ~US$ ${Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}/mes (~RD$ ${Math.round(estimatedMonthlyPaymentUsd * USD_TO_DOP_RATE).toLocaleString()}/mes).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>SOLICITAR PRE-CALIFICACIÓN {selectedBank.shortName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="flex items-center gap-1.5 justify-center text-[9px] text-zinc-500 pt-1 text-center uppercase">
                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Convenios leasing directo con banca nacional y entrega en patio Km 22.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MachineryFinancingCalculator.displayName = 'MachineryFinancingCalculator';
