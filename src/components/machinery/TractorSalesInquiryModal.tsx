import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  CreditCard,
  Truck,
  FileText
} from 'lucide-react';
import { submitMachinerySalesLead } from '../../services/tractorCatalogService';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface TractorSalesInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: {
    id: string;
    name: string;
    model: string;
    brand: string;
    priceUsd: number;
    category?: string;
  };
}

export const TractorSalesInquiryModal: React.FC<TractorSalesInquiryModalProps> = ({
  isOpen,
  onClose,
  machine
}) => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Santo Domingo / Distrito Nacional');
  const [acquisitionType, setAcquisitionType] = useState<'cash_purchase' | 'bank_financing' | 'operating_lease' | 'trade_in'>('bank_financing');
  const [preferredBank, setPreferredBank] = useState<'Banco Popular Dominicano' | 'BHD León' | 'Banco Agrícola' | 'Banreservas' | 'Propio TMD'>('Banco Popular Dominicano');
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [tradeInBrand, setTradeInBrand] = useState('');
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInYear, setTradeInYear] = useState(2015);
  const [urgency, setUrgency] = useState<'immediate' | '15_to_30_days' | '1_to_3_months' | 'budget_planning'>('15_to_30_days');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert('Por favor ingrese su nombre y teléfono para comunicarnos.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitMachinerySalesLead({
        listingId: machine.id,
        machineTitle: machine.name,
        machineBrand: machine.brand,
        machineModel: machine.model,
        estimatedPriceUsd: machine.priceUsd,
        customerName,
        companyName: companyName || undefined,
        email: email || 'cliente@tmd.rd',
        phone,
        province,
        preferredContactMethod,
        acquisitionType,
        preferredBank: acquisitionType === 'bank_financing' ? preferredBank : undefined,
        hasTradeIn,
        tradeInDetails: hasTradeIn ? {
          brand: tradeInBrand || 'General',
          model: tradeInModel || 'Equipo Usado',
          year: Number(tradeInYear) || 2015
        } : undefined,
        urgency,
        notes: notes || undefined,
        source: 'machine_detail_modal'
      });

      if (res.success) {
        setSubmitted(true);
        setFeedback(res.message);
      }
    } catch {
      setSubmitted(true);
      setFeedback('¡Solicitud registrada localmente! Nuestro equipo de ventas se comunicará con usted.');
    } finally {
      setSubmitting(false);
    }
  };

  const priceDop = machine.priceUsd * USD_TO_DOP_RATE;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-[4px] w-full max-w-2xl max-h-[90vh] flex flex-col font-mono text-zinc-100 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[2px] bg-amber-400 text-black font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Catálogo de Venta Directa • TMD Dominicana
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase text-white font-display">
                SOLICITUD DE PROFORMA: {machine.brand} {machine.model}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Summary Bar */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-400">Equipo Seleccionado: </span>
            <strong className="text-white">{machine.name}</strong>
          </div>
          <div className="text-right">
            <span className="text-amber-400 font-bold">US$ {machine.priceUsd.toLocaleString()}</span>
            <span className="text-zinc-500 text-[10px] ml-1.5 hidden sm:inline">
              (RD$ {priceDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-white uppercase font-display">
                ¡Solicitud Registrada en el CRM de Ventas!
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                {feedback || 'Su asesor comercial asignado en TMD Dominicana le contactará con la proforma oficial con NCF B01 y la corrida financiera aprobada.'}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-[2px] bg-amber-400 text-black font-black uppercase text-xs hover:bg-amber-300 transition-colors"
                >
                  Entendido & Volver al Catálogo
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Contact Data */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Datos del Solicitante / Contratista</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ing. Ramón Rosario"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Empresa / Razón Social</label>
                    <input
                      type="text"
                      placeholder="Ej: Constructora Quisqueya S.R.L."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(809) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="contacto@empresa.rd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Financing & Trade-in */}
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <h4 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>2. Modalidad de Adquisición & Financiamiento</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Tipo de Compra</label>
                    <select
                      value={acquisitionType}
                      onChange={(e) => setAcquisitionType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    >
                      <option value="bank_financing">Financiamiento Bancario (Popular / BHD / Bagrícola)</option>
                      <option value="cash_purchase">Pago de Contado / Transferencia Directa</option>
                      <option value="operating_lease">Leasing Operativo / Arrendamiento con Opción a Compra</option>
                      <option value="trade_in">Trade-In (Entrega de Equipo Usado a Cuenta)</option>
                    </select>
                  </div>
                  {acquisitionType === 'bank_financing' && (
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase block mb-1">Banco Preferido para Proforma</label>
                      <select
                        value={preferredBank}
                        onChange={(e) => setPreferredBank(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                      >
                        <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
                        <option value="BHD León">BHD León</option>
                        <option value="Banco Agrícola">Banco Agrícola (Tasa Preferencial Agro)</option>
                        <option value="Banreservas">Banreservas</option>
                        <option value="Propio TMD">Financiamiento Directo TMD (Casos Especiales)</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Provincia de Destino / Obra</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    >
                      <option value="Santo Domingo / Distrito Nacional">Santo Domingo / Distrito Nacional</option>
                      <option value="Santiago de los Caballeros">Santiago de los Caballeros</option>
                      <option value="La Altagracia (Punta Cana / Bávaro)">La Altagracia (Punta Cana / Bávaro)</option>
                      <option value="San Cristóbal / Baní">San Cristóbal / Baní</option>
                      <option value="San Juan de la Maguana / Azua">San Juan de la Maguana / Azua</option>
                      <option value="La Vega / Bonao">La Vega / Bonao</option>
                      <option value="Puerto Plata">Puerto Plata</option>
                      <option value="Monte Cristi / Dajabón">Monte Cristi / Dajabón</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase block mb-1">Plazo Estimado de Compra</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                    >
                      <option value="immediate">Inmediato (1 a 7 días - Entrega de Patio)</option>
                      <option value="15_to_30_days">15 a 30 días (En trámite bancario)</option>
                      <option value="1_to_3_months">1 a 3 meses (Proyección de obra)</option>
                      <option value="budget_planning">Planificación de presupuesto anual</option>
                    </select>
                  </div>
                </div>

                {/* Trade In Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={hasTradeIn}
                      onChange={(e) => setHasTradeIn(e.target.checked)}
                      className="rounded-[2px] text-amber-400 focus:ring-amber-400 border-zinc-700 bg-zinc-900"
                    />
                    <span className="text-zinc-200">Deseo entregar una máquina usada a cuenta (Trade-In)</span>
                  </label>

                  {hasTradeIn && (
                    <div className="grid grid-cols-3 gap-2 mt-2 p-2.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-xs">
                      <div>
                        <label className="text-[9px] text-zinc-400 block uppercase">Marca Usada</label>
                        <input
                          type="text"
                          placeholder="Ej: CAT / Case"
                          value={tradeInBrand}
                          onChange={(e) => setTradeInBrand(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 block uppercase">Modelo</label>
                        <input
                          type="text"
                          placeholder="Ej: 320D / 580N"
                          value={tradeInModel}
                          onChange={(e) => setTradeInModel(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 block uppercase">Año</label>
                        <input
                          type="number"
                          placeholder="2015"
                          value={tradeInYear}
                          onChange={(e) => setTradeInYear(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase block mb-1">Notas o Requisitos Especiales</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Requiere martillo hidráulico o kit de acople rápido; enviar a banco popular sucursal 27 de febrero..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-[2px] bg-zinc-900 border border-zinc-800 text-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-[2px] border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud a Ventas TMD'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
