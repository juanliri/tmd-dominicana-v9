import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, 
  X, 
  Percent, 
  Calendar, 
  Building2, 
  DollarSign, 
  ArrowRight, 
  ShieldCheck, 
  Copy, 
  Check, 
  MessageCircle,
  FileText
} from 'lucide-react';
import { Machine } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { useCart } from '../context/CartContext';

interface MachineQuickCalculatorModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

const BANK_PRESETS = [
  { name: 'Banco Popular', rate: 8.9, label: 'Leasing Popular (8.9%)' },
  { name: 'Banreservas', rate: 8.5, label: 'Respaldo Reservas (8.5%)' },
  { name: 'BHD León', rate: 9.2, label: 'BHD PyME Equipos (9.2%)' },
  { name: 'TMD Directo', rate: 7.9, label: 'Convenio Especial TMD (7.9%)' },
];

export const MachineQuickCalculatorModal: React.FC<MachineQuickCalculatorModalProps> = ({
  machine,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { addMachineToQuote } = useCart();
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanDurationMonths, setLoanDurationMonths] = useState<number>(36);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8.9);
  const [selectedBank, setSelectedBank] = useState<string>('Banco Popular');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !machine || typeof document === 'undefined') return null;

  const priceUsd = machine.basePriceUsd;
  const downPaymentAmountUsd = (priceUsd * downPaymentPercent) / 100;
  const financedPrincipalUsd = Math.max(0, priceUsd - downPaymentAmountUsd);

  // Amortization calculation: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = (annualInterestRate / 100) / 12;
  const numberOfPayments = loanDurationMonths;

  const estimatedMonthlyPaymentUsd = financedPrincipalUsd > 0 && monthlyRate > 0 && numberOfPayments > 0
    ? (financedPrincipalUsd * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    : 0;

  const estimatedMonthlyPaymentDop = estimatedMonthlyPaymentUsd * USD_TO_DOP_RATE;
  const totalFinancedPaidUsd = estimatedMonthlyPaymentUsd * numberOfPayments;
  const totalInterestPaidUsd = Math.max(0, totalFinancedPaidUsd - financedPrincipalUsd);

  const durationOptions = [
    { label: '12m (1a)', months: 12 },
    { label: '24m (2a)', months: 24 },
    { label: '36m (3a)', months: 36 },
    { label: '48m (4a)', months: 48 },
    { label: '60m (5a)', months: 60 },
  ];

  const downPaymentOptions = [15, 20, 25, 30, 40, 50];

  const handleCopySummary = () => {
    const text = `Simulación Financiamiento TMD Dominicana:
Equipo: ${machine.brand} ${machine.name} (Mod. ${machine.modelCode})
Precio Base: US$ ${priceUsd.toLocaleString()} (~RD$ ${(priceUsd * USD_TO_DOP_RATE).toLocaleString()})
Inicial (${downPaymentPercent}%): US$ ${Math.round(downPaymentAmountUsd).toLocaleString()}
Monto Financiado: US$ ${Math.round(financedPrincipalUsd).toLocaleString()}
Plazo: ${loanDurationMonths} meses (${loanDurationMonths / 12} años)
Tasa Anual: ${annualInterestRate}% (${selectedBank})
Cuota Mensual Estimada: US$ ${Math.round(estimatedMonthlyPaymentUsd).toLocaleString()} / mes (~RD$ ${Math.round(estimatedMonthlyPaymentDop).toLocaleString()}/mes)
Interés Total Estimado: US$ ${Math.round(totalInterestPaidUsd).toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToQuote = () => {
    addMachineToQuote(machine, true);
    onClose();
    onNavigate('#/checkout');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-black">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider">
                  {machine.brand}
                </span>
                <span className="text-[11px] text-zinc-400 font-bold">MOD. {machine.modelCode}</span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
                Calculadora de Cuotas: {machine.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-zinc-900">
          {/* Main Calculation Card (Big numbers) */}
          <div className="p-3.5 sm:p-4 rounded-[3px] bg-zinc-950 border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Cuota Mensual Estimada ({loanDurationMonths} meses)
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                INVERSIÓN TOTAL: <strong className="text-white">US$ {priceUsd.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
                US$ {Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}
                <span className="text-xs font-normal text-zinc-400 ml-1">/ MES</span>
              </span>
              <span className="text-xs font-bold text-zinc-400 font-mono">
                ≈ RD$ {Math.round(estimatedMonthlyPaymentDop).toLocaleString('es-DO')} / mes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-zinc-800 text-[11px] font-mono">
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Inicial ({downPaymentPercent}%):</span>
                <span className="font-bold text-emerald-400">
                  US$ {Math.round(downPaymentAmountUsd).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Monto Financiado:</span>
                <span className="font-bold text-white">
                  US$ {Math.round(financedPrincipalUsd).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Tasa Anual:</span>
                <span className="font-bold text-white">{annualInterestRate}% ({selectedBank})</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px] uppercase">Beneficio Fiscal:</span>
                <span className="font-bold text-amber-400">100% Deducción ISR</span>
              </div>
            </div>
          </div>

          {/* Interactive Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Down Payment Picker */}
            <div className="space-y-2 p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Porcentaje de Inicial</span>
                </label>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {downPaymentPercent}%
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1">
                {downPaymentOptions.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-1 text-[11px] font-bold rounded-[2px] transition-all cursor-pointer border uppercase ${
                      downPaymentPercent === pct
                        ? 'bg-amber-400 text-black border-amber-400 font-black'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
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
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-[2px] appearance-none mt-1"
              />
            </div>

            {/* Duration Picker */}
            <div className="space-y-2 p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plazo en Meses</span>
                </label>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {loanDurationMonths} Meses
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setLoanDurationMonths(opt.months)}
                    className={`py-1 text-[10px] font-bold rounded-[2px] transition-all cursor-pointer border uppercase ${
                      loanDurationMonths === opt.months
                        ? 'bg-amber-400 text-black border-amber-400 font-black'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={12}
                max={60}
                step={12}
                value={loanDurationMonths}
                onChange={(e) => setLoanDurationMonths(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-[2px] appearance-none mt-1"
              />
            </div>
          </div>

          {/* Bank Presets & Direct Pre-qualification */}
          <div className="space-y-2 p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Convenio Bancario / Tasa de Interés</span>
              </label>
              <span className="text-[9px] text-emerald-400 font-bold uppercase">Pre-calificación 48h</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANK_PRESETS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => {
                    setSelectedBank(bank.name);
                    setAnnualInterestRate(bank.rate);
                  }}
                  className={`p-2 rounded-[2px] border text-left transition-all cursor-pointer ${
                    selectedBank === bank.name
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white uppercase truncate">{bank.name}</div>
                  <div className="text-[10px] text-amber-400 font-bold font-mono">{bank.rate}% ANUAL</div>
                </button>
              ))}
            </div>

            {/* Direct Bank Pre-qualify Action Buttons */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2 font-display">
              <a
                href={`https://wa.me/18095601234?text=${encodeURIComponent(
                  `Hola TMD Dominicana, deseo PRE-CALIFICAR con BANCO POPULAR para ${machine.brand} ${machine.name} (${machine.modelCode}). Inicial: ${downPaymentPercent}%, Plazo: ${loanDurationMonths} meses. Cuota estimada: ~RD$ ${Math.round(estimatedMonthlyPaymentDop).toLocaleString('es-DO')}/mes (~US$ ${Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}/mes).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2 rounded-[2px] bg-[#002B66] hover:bg-[#003882] text-white font-black text-[10px] uppercase text-center border border-blue-400/40 transition-all flex items-center justify-center gap-1"
              >
                <Building2 className="w-3 h-3 text-blue-300" />
                <span>PRE-CALIFICAR POPULAR</span>
              </a>

              <a
                href={`https://wa.me/18095601234?text=${encodeURIComponent(
                  `Hola TMD Dominicana, deseo PRE-CALIFICAR con BANCO BHD para ${machine.brand} ${machine.name} (${machine.modelCode}). Inicial: ${downPaymentPercent}%, Plazo: ${loanDurationMonths} meses. Cuota estimada: ~RD$ ${Math.round(estimatedMonthlyPaymentDop).toLocaleString('es-DO')}/mes (~US$ ${Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}/mes).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2 rounded-[2px] bg-[#007A33] hover:bg-[#00943e] text-white font-black text-[10px] uppercase text-center border border-emerald-400/40 transition-all flex items-center justify-center gap-1"
              >
                <Building2 className="w-3 h-3 text-emerald-300" />
                <span>PRE-CALIFICAR BHD</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-3.5 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="py-2 px-3 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 uppercase"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <a
            href={`https://wa.me/18095601234?text=${encodeURIComponent(
              `Hola TMD Dominicana, me interesa financiamiento para ${machine.brand} ${machine.name} (Mod. ${machine.modelCode}). Estimado: Inicial ${downPaymentPercent}%, Plazo ${loanDurationMonths} meses. Cuota estimada: ~US$ ${Math.round(estimatedMonthlyPaymentUsd).toLocaleString()}/mes.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleApplyToQuote}
            className="flex-1 py-2 px-3.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Solicitar Proforma con Financiamiento</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
