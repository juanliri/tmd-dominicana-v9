import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, 
  X, 
  Send, 
  Phone, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  Clock, 
  FileText,
  MapPin,
  HelpCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Machine } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { useCart } from '../context/CartContext';
import { IndustrialPageFlipReaderModal } from './effects/IndustrialPageFlipReaderModal';

interface PriceEstimateModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export const PriceEstimateModal: React.FC<PriceEstimateModalProps> = ({
  machine,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { formatPrice, currency, addMachineToQuote } = useCart();

  // Interactive Estimate Customization States
  const [acquisitionType, setAcquisitionType] = useState<'cash' | 'leasing' | 'rent_to_own'>('leasing');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% down
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(36); // 36 months
  const [selectedAttachment, setSelectedAttachment] = useState<string>('standard');
  const [targetProvince, setTargetProvince] = useState<string>('Santo Domingo / SDO (Km 22)');
  const [applicationSector, setApplicationSector] = useState<string>('Construcción & Obras Viales');

  // Contact info
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [show3dBooklet, setShow3dBooklet] = useState(false);

  if (!isOpen || !machine || typeof document === 'undefined') return null;

  // Pricing calculations
  const basePrice = machine.basePriceUsd;

  // Attachment additional estimated cost
  const attachmentCost = 
    selectedAttachment === 'hammer' ? 8500 :
    selectedAttachment === 'quick_coupler' ? 2400 :
    selectedAttachment === 'heavy_duty_bucket' ? 3200 : 0;

  const totalEstimateUsd = basePrice + attachmentCost;
  const downPaymentUsd = (totalEstimateUsd * downPaymentPercent) / 100;
  const financedAmountUsd = totalEstimateUsd - downPaymentUsd;

  // Indicative monthly payment calculation (approx 9.5% annual corporate APR for Dominican banking)
  const monthlyInterestRate = 0.095 / 12;
  const monthlyLeaseEstimateUsd = acquisitionType === 'leasing'
    ? (financedAmountUsd * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, leaseTermMonths))) /
      (Math.pow(1 + monthlyInterestRate, leaseTermMonths) - 1)
    : 0;

  const monthlyLeaseEstimateDop = monthlyLeaseEstimateUsd * USD_TO_DOP_RATE;

  const handleSendToSales = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const ticketId = `EST-TMD-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setSubmittedTicket(ticketId);
      setIsSubmitting(false);
    }, 600);
  };

  const getWhatsAppEstimateMessage = () => {
    let msg = `*SOLICITUD DE ESTIMADO DE PRECIO - TMD DOMINICANA*\n`;
    msg += `*Equipo:* ${machine.name} (${machine.brand} - Mod. ${machine.modelCode})\n`;
    msg += `*Inversión Ref:* US$ ${totalEstimateUsd.toLocaleString()} (Aprox RD$ ${(totalEstimateUsd * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})\n`;
    msg += `*Modalidad:* ${acquisitionType === 'leasing' ? `Leasing Bancario (${downPaymentPercent}% Inicial, ${leaseTermMonths} meses)` : acquisitionType === 'cash' ? 'Compra Directa' : 'Renta con Opción a Compra'}\n`;
    if (acquisitionType === 'leasing') {
      msg += `*Cuota Estimada Mensual:* ~US$ ${monthlyLeaseEstimateUsd.toFixed(0)} / mes\n`;
    }
    msg += `*Aditamento:* ${selectedAttachment}\n`;
    msg += `*Ubicación Obra:* ${targetProvince}\n`;
    msg += `*Sector:* ${applicationSector}\n\n`;
    msg += `*Datos del Cliente:*\n`;
    msg += `Nombre: ${clientName || 'Cliente TMD'}\n`;
    if (companyName) msg += `Empresa: ${companyName}\n`;
    msg += `Teléfono: ${phone}\n`;
    if (notes) msg += `Notas: ${notes}\n`;

    return encodeURIComponent(msg);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 font-mono">
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Herramienta Interactiva
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 uppercase">
                  Conexión Ventas Km 22
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white uppercase tracking-tight">
                Estimado de Precio & Financiamiento
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Model Card */}
        <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center gap-3">
          <img
            src={machine.image}
            alt={machine.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-[2px] object-cover bg-zinc-950 shrink-0 border border-zinc-800"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase">
                {machine.brand}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                MOD. {machine.modelCode}
              </span>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5 uppercase">
              {machine.name}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              {machine.powerHp} HP • {(machine.operatingWeightKg / 1000).toFixed(1)} Ton • Garantía Oficial TMD
            </p>
          </div>
          <div className="text-right shrink-0 font-mono">
            <span className="block text-[9px] text-zinc-500 uppercase font-bold">Inversión Base</span>
            <span className="text-xs sm:text-sm font-black text-amber-400">
              US$ {machine.basePriceUsd.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => setShow3dBooklet(true)}
              className="mt-1 flex items-center justify-end gap-1 text-[9px] text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors cursor-pointer"
              title="Abrir folleto técnico 3D interactivo"
            >
              <BookOpen className="w-3 h-3" />
              <span>FOLLETO 3D</span>
            </button>
          </div>
        </div>

        {/* SUBMITTED SUCCESS VIEW */}
        {submittedTicket ? (
          <div className="p-5 rounded-[3px] bg-zinc-950 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-[3px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Solicitud Recibida por el Equipo de Ventas
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1 uppercase font-mono">
                Ticket N° {submittedTicket}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                Hemos asignado tu solicitud para la máquina <strong className="text-zinc-200">{machine.name}</strong> a un asesor comercial sénior de la sede Km 22 Autopista Duarte. Te contactaremos al <strong className="text-amber-400 font-mono">{phone}</strong> en menos de 15 minutos.
              </p>
            </div>

            <div className="p-3 bg-zinc-900 rounded-[2px] border border-zinc-800 text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase text-[10px]">Modelo Seleccionado:</span>
                <span className="font-bold text-white uppercase">{machine.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 uppercase text-[10px]">Estimado Inversión:</span>
                <span className="font-bold text-amber-400">US$ {totalEstimateUsd.toLocaleString()}</span>
              </div>
              {acquisitionType === 'leasing' && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase text-[10px]">Cuota Indicativa Leasing:</span>
                  <span className="font-bold text-emerald-400">~US$ {monthlyLeaseEstimateUsd.toFixed(0)} / mes</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={`https://wa.me/18095601234?text=${getWhatsAppEstimateMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs uppercase cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Reenviar a WhatsApp Ventas</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  addMachineToQuote(machine);
                  onClose();
                  if (onNavigate) onNavigate('#/checkout');
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors uppercase cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Ir al Carrito</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendToSales} className="space-y-4">
            {/* Step 1: Interactive Configuration */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <span>1. Configuración de Inversión y Modalidad</span>
              </h4>

              {/* Acquisition Type Tabs */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => setAcquisitionType('leasing')}
                  className={`py-1.5 px-2.5 rounded-[2px] text-xs font-bold transition-all uppercase cursor-pointer ${
                    acquisitionType === 'leasing'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Leasing Bancario
                </button>
                <button
                  type="button"
                  onClick={() => setAcquisitionType('cash')}
                  className={`py-1.5 px-2.5 rounded-[2px] text-xs font-bold transition-all uppercase cursor-pointer ${
                    acquisitionType === 'cash'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Compra Directa
                </button>
                <button
                  type="button"
                  onClick={() => setAcquisitionType('rent_to_own')}
                  className={`py-1.5 px-2.5 rounded-[2px] text-xs font-bold transition-all uppercase cursor-pointer ${
                    acquisitionType === 'rent_to_own'
                      ? 'bg-amber-400 text-black shadow-xs'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Renta con Opción
                </button>
              </div>

              {/* Dynamic Sliders when Leasing is selected */}
              {acquisitionType === 'leasing' && (
                <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-3 font-mono">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300 uppercase text-[10px]">
                        Pago Inicial / Inicial ({downPaymentPercent}%):
                      </span>
                      <span className="font-bold text-amber-400">
                        US$ {downPaymentUsd.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase">
                      <span>10% (Mínimo)</span>
                      <span>30%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-300 uppercase text-[10px]">
                        Plazo del Financiamiento:
                      </span>
                      <span className="font-bold text-amber-400">
                        {leaseTermMonths} Meses ({leaseTermMonths / 12} Años)
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[12, 24, 36, 48].map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setLeaseTermMonths(term)}
                          className={`py-1 text-xs font-bold rounded-[2px] border transition-all cursor-pointer uppercase ${
                            leaseTermMonths === term
                              ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-extrabold'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {term}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Monthly Payment Box */}
                  <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                        Cuota Mensual Estimada (Banco Popular / BHD):
                      </span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        ~RD$ {monthlyLeaseEstimateDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })} <span className="text-[10px] font-normal text-zinc-400">/ MES</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-300 font-mono">
                      ≈ US$ {monthlyLeaseEstimateUsd.toFixed(0)} / mes
                    </span>
                  </div>

                  {/* Dominican Bank Direct Pre-qualification Buttons */}
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase font-display">
                      <span>PRE-CALIFICAR DIRECTO CON BANCO:</span>
                      <span className="text-emerald-400 font-mono font-bold">RESPUESTA EN 48H</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-display text-[10px]">
                      <a
                        href={`https://wa.me/18095601234?text=${encodeURIComponent(
                          `Hola TMD Dominicana, deseo PRE-CALIFICAR con BANCO POPULAR para el equipo ${machine.name} (${machine.modelCode}). Inversión: US$ ${totalEstimateUsd.toLocaleString()} (~RD$ ${(totalEstimateUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')}), Inicial: ${downPaymentPercent}%, Plazo: ${leaseTermMonths} meses. Cuota estimada: ~RD$ ${monthlyLeaseEstimateDop.toLocaleString('es-DO')}/mes.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-[2px] bg-[#002B66] hover:bg-[#003882] text-white font-black uppercase text-center border border-blue-400/40 transition-all cursor-pointer"
                      >
                        POPULAR
                      </a>
                      <a
                        href={`https://wa.me/18095601234?text=${encodeURIComponent(
                          `Hola TMD Dominicana, deseo PRE-CALIFICAR con BANCO BHD para el equipo ${machine.name} (${machine.modelCode}). Inversión: US$ ${totalEstimateUsd.toLocaleString()} (~RD$ ${(totalEstimateUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')}), Inicial: ${downPaymentPercent}%, Plazo: ${leaseTermMonths} meses. Cuota estimada: ~RD$ ${monthlyLeaseEstimateDop.toLocaleString('es-DO')}/mes.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-[2px] bg-[#007A33] hover:bg-[#00943e] text-white font-black uppercase text-center border border-emerald-400/40 transition-all cursor-pointer"
                      >
                        BANCO BHD
                      </a>
                      <a
                        href={`https://wa.me/18095601234?text=${encodeURIComponent(
                          `Hola TMD Dominicana, deseo PRE-CALIFICAR con BANRESERVAS para el equipo ${machine.name} (${machine.modelCode}). Inversión: US$ ${totalEstimateUsd.toLocaleString()} (~RD$ ${(totalEstimateUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')}), Inicial: ${downPaymentPercent}%, Plazo: ${leaseTermMonths} meses. Cuota estimada: ~RD$ ${monthlyLeaseEstimateDop.toLocaleString('es-DO')}/mes.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-[2px] bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-black uppercase text-center transition-all cursor-pointer"
                      >
                        RESERVAS
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments & Accessories Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 text-xs">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Aditamento / Implemento de Trabajo:
                  </label>
                  <select
                    value={selectedAttachment}
                    onChange={(e) => setSelectedAttachment(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none uppercase text-xs cursor-pointer"
                  >
                    <option value="standard">Balde Estándar de Fábrica (+US$ 0)</option>
                    <option value="quick_coupler">Acople Rápido Hidráulico (+US$ 2,400)</option>
                    <option value="heavy_duty_bucket">Balde Reforzado para Roca (+US$ 3,200)</option>
                    <option value="hammer">Martillo Hidráulico Completo (+US$ 8,500)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Ubicación / Destino en República Dominicana:
                  </label>
                  <select
                    value={targetProvince}
                    onChange={(e) => setTargetProvince(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white focus:border-amber-400 focus:outline-none uppercase text-xs cursor-pointer"
                  >
                    <option>Santo Domingo / SDO (Km 22)</option>
                    <option>Santiago / Región Cibao</option>
                    <option>Punta Cana / Bávaro / Altagracia</option>
                    <option>La Romana / San Pedro</option>
                    <option>San Cristóbal / Baní</option>
                    <option>Puerto Plata / Costa Norte</option>
                    <option>La Vega / Bonao</option>
                    <option>Barahona / Región Sur</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Contact Details for Direct Routing to Sales Desk */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <span>2. Datos para Envío Directo al Equipo de Ventas</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Nombre o Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ing. Manuel Gómez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Empresa / Constructora
                  </label>
                  <input
                    type="text"
                    placeholder="Gómez & Asociados S.R.L."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(809) 560-1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="compras@empresa.rd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="mt-2.5 text-xs">
                <label className="block font-bold text-zinc-400 mb-1 uppercase text-[10px]">
                  Requerimientos específicos del proyecto o faena:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Requerimos entrega en obra en Punta Cana antes de fin de mes, con capacitación para 2 operadores."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-[2px] bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-xs"
              >
                {isSubmitting ? (
                  <span>Enviando al Asesor Comercial...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Estimado a Ventas TMD</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/18095601234?text=${getWhatsAppEstimateMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer uppercase"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 text-center font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Atención directa por especialistas de Tecnomaquinarias Diesel S.R.L. Km 22 Autopista Duarte.
              </span>
            </div>
          </form>
        )}

        {/* 3D Interactive Page-Flip Booklet Modal */}
        {show3dBooklet && (
          <IndustrialPageFlipReaderModal
            machine={machine}
            onClose={() => setShow3dBooklet(false)}
            onDownloadPdf={() => {
              // Direct WhatsApp or download action
              const msg = encodeURIComponent(`Hola TMD Dominicana, solicito la Ficha Técnica Oficial en PDF del equipo ${machine.name} (Mod. ${machine.modelCode}).`);
              window.open(`https://wa.me/18095601234?text=${msg}`, '_blank');
            }}
          />
        )}

      </div>
    </div>,
    document.body
  );
};
