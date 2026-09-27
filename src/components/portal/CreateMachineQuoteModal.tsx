import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileDown, 
  Sparkles, 
  DollarSign, 
  Check, 
  Truck, 
  ShieldCheck, 
  Building, 
  Calendar,
  Layers,
  Wrench,
  AlertCircle,
  Repeat,
  CreditCard,
  MessageSquare,
  FileCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { PortalQuote, Machine, UserProfile } from '../../types';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../../data/catalog';
import { downloadQuotePDF } from '../../utils/pdfGenerator';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { triggerRfqCrmInquiryLogging } from '../../services/crmService';
import { getQuoteWhatsAppUrl } from '../../utils/whatsappMessaging';

interface CreateMachineQuoteModalProps {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  onClose: () => void;
  onQuoteCreated?: (newQuote: PortalQuote) => void;
}

export const CreateMachineQuoteModal: React.FC<CreateMachineQuoteModalProps> = ({
  currentUser,
  userProfile,
  onClose,
  onQuoteCreated
}) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>(MACHINES_DATA[0].id);
  const [companyName, setCompanyName] = useState<string>(userProfile?.companyName || 'Constructora / Particular');
  const [clientName, setClientName] = useState<string>(userProfile?.displayName || currentUser?.displayName || 'Ing. Contratista');
  const [clientEmail, setClientEmail] = useState<string>(currentUser?.email || userProfile?.email || 'cliente@tmd.rd');
  const [phone, setPhone] = useState<string>(userProfile?.phone || '+1 (809) 560-1234');
  const [rnc, setRnc] = useState<string>(userProfile?.rnc || '1-31-89421-4');
  const [ncfType, setNcfType] = useState<'B01_CREDITO_FISCAL' | 'B02_CONSUMIDOR_FINAL'>('B01_CREDITO_FISCAL');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Patio Central Km 22, Autopista Duarte / En Obra RD');
  const [paymentMethod, setPaymentMethod] = useState<string>('Financiamiento Leasing Comercial (36-48 Meses)');
  const [includeMaintenanceKit, setIncludeMaintenanceKit] = useState<boolean>(true);
  const [includeExtendedWarranty, setIncludeExtendedWarranty] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('Requiere evaluación de financiamiento y entrega en patio Autopista Duarte Km 22.');
  
  // Trade-In (Retoma de Maquinaria Usada)
  const [enableTradeIn, setEnableTradeIn] = useState<boolean>(false);
  const [tradeInBrand, setTradeInBrand] = useState<string>('Caterpillar');
  const [tradeInModel, setTradeInModel] = useState<string>('416E Retroexcavadora');
  const [tradeInYear, setTradeInYear] = useState<number>(2017);
  const [tradeInHours, setTradeInHours] = useState<number>(5400);
  const [tradeInAppraisalUsd, setTradeInAppraisalUsd] = useState<number>(28500);

  // Registro de Anticipo / Reserva Bancaria
  const [enableAdvancePayment, setEnableAdvancePayment] = useState<boolean>(false);
  const [advancePercent, setAdvancePercent] = useState<number>(30); // 30% or 50%
  const [advanceBank, setAdvanceBank] = useState<string>('Banco Popular Dominicano');
  const [advanceReference, setAdvanceReference] = useState<string>('BPD-TRF-992144');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedMachine = MACHINES_DATA.find((m) => m.id === selectedMachineId) || MACHINES_DATA[0];

  // Price calculations
  const baseMachinePrice = selectedMachine.basePriceUsd || 89500;
  const kitPrice = includeMaintenanceKit ? 850 : 0;
  const warrantyPrice = includeExtendedWarranty ? 2400 : 0;
  
  const subtotalBeforeTradeIn = baseMachinePrice + kitPrice + warrantyPrice;
  const tradeInDeduction = enableTradeIn ? tradeInAppraisalUsd : 0;
  
  // Tax calculation on net equipment investment
  const netSubtotal = Math.max(0, subtotalBeforeTradeIn - tradeInDeduction);
  const itbis = Math.round(netSubtotal * 0.18);
  const total = netSubtotal + itbis;
  const totalDop = total * USD_TO_DOP_RATE;

  // Advance calculation
  const calculatedAdvanceUsd = enableAdvancePayment ? Math.round((total * advancePercent) / 100) : 0;
  const pendingBalanceUsd = Math.max(0, total - calculatedAdvanceUsd);

  const generateNcfSequence = () => {
    const randomSeq = Math.floor(10000000 + Math.random() * 90000000);
    return ncfType === 'B01_CREDITO_FISCAL' ? `B01${randomSeq}` : `B02${randomSeq}`;
  };

  const handleSaveAndExport = async (actionType: 'save_only' | 'export_pdf' | 'share_whatsapp') => {
    if (!currentUser) return;
    setIsSubmitting(true);

    try {
      const quoteNum = `COT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const summaryItems: string[] = [
        `1x ${selectedMachine.name} (Mod. ${selectedMachine.modelCode || '2026'})`
      ];

      if (includeMaintenanceKit) summaryItems.push('Kit Mantenimiento Preventivo 500h OEM');
      if (includeExtendedWarranty) summaryItems.push('Garantía Extendida TMD Care (3 Años / 4,500 Horas)');
      if (enableTradeIn) summaryItems.push(`Retoma Usada: ${tradeInBrand} ${tradeInModel} (${tradeInYear})`);

      const ncfSeq = generateNcfSequence();

      // Build form state representation for quote creation
      const formState = {
        tradeInEquipmentName: enableTradeIn && (tradeInBrand || tradeInModel) ? `${tradeInBrand} ${tradeInModel}`.trim() : null,
        tradeInAllowance: enableTradeIn ? tradeInAppraisalUsd : 0
      };

      const quoteData: any = {
        quoteNumber: quoteNum,
        clientId: currentUser.uid,
        clientEmail: clientEmail,
        clientName: clientName,
        companyName: companyName,
        phone: phone,
        rnc: rnc,
        status: 'submitted',
        currency: 'USD',
        subtotal: netSubtotal,
        itbis: itbis,
        total: total,
        itemsCount: summaryItems.length,
        itemsSummary: summaryItems.join(' + '),
        notes: notes,
        ncfType: ncfType,
        ncfNumber: ncfSeq,
        tradeInAllowance: formState.tradeInAllowance || 0,
        tradeInDeductionUsd: formState.tradeInAllowance || 0,
        tradeInEquipmentName: formState.tradeInEquipmentName || null,
        tradeInEquipmentBrand: enableTradeIn && tradeInBrand ? tradeInBrand : null,
        tradeInEquipmentYear: enableTradeIn && tradeInYear ? tradeInYear : null,
        tradeInEquipmentHours: enableTradeIn && tradeInHours ? tradeInHours : null,
        tradeInStatus: enableTradeIn ? 'approved_deduction' : 'none',
        downPaymentAmountUsd: enableAdvancePayment ? calculatedAdvanceUsd : 0,
        downPaymentMethod: enableAdvancePayment ? advanceBank : null,
        downPaymentReference: enableAdvancePayment ? advanceReference : null,
        downPaymentDate: enableAdvancePayment ? new Date().toISOString() : null,
        downPaymentVerified: enableAdvancePayment,
        balanceDueUsd: pendingBalanceUsd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Sanitize the form payload before calling addDoc:
      // Ensure tradeInEquipmentName defaults to null and tradeInAllowance defaults to 0 to prevent Firebase addDoc errors
      const sanitizedQuotePayload = {
        ...quoteData,
        tradeInEquipmentName: formState.tradeInEquipmentName || null,
        tradeInAllowance: formState.tradeInAllowance || 0
      };

      // Strip any accidental undefined fields before sending to Firestore to prevent addDoc errors
      const cleanQuotePayload = Object.fromEntries(
        Object.entries(sanitizedQuotePayload).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, 'quotes'), cleanQuotePayload);
      const createdQuote: PortalQuote = { id: docRef.id, ...quoteData };

      // AUTOMATED TRIGGER: Log into dedicated CRM sub-collection for sales conversion funnel
      triggerRfqCrmInquiryLogging(createdQuote, {
        source: 'portal_rfq',
        equipmentCategory: selectedMachine.category || 'Maquinaria Pesada',
        equipmentInterested: `${selectedMachine.brand} ${selectedMachine.name} (${selectedMachine.modelCode || '2026'})`,
        financingMethod: paymentMethod,
        rncOrCedula: rnc,
        customerNotes: notes
      }).catch(err => console.warn('Non-fatal CRM trigger logging notice:', err));

      if (actionType === 'export_pdf') {
        downloadQuotePDF({
          quote: createdQuote,
          selectedMachine,
          deliveryLocation,
          paymentMethod,
          customerNotes: notes,
          includeSpecs: true
        });
      } else if (actionType === 'share_whatsapp') {
        const waUrl = getQuoteWhatsAppUrl(createdQuote, phone, {
          includeTradeIn: enableTradeIn,
          includeAdvance: enableAdvancePayment
        });
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      if (onQuoteCreated) {
        onQuoteCreated(createdQuote);
      }
      onClose();
    } catch (err) {
      console.error('Error saving quote:', err);
      handleFirestoreError(err, OperationType.CREATE, 'quotes');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-3xl rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-mono text-zinc-100">
        
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-amber-400" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Generador de Cotización Proforma
              </span>
              <h3 className="text-base sm:text-lg font-bold uppercase text-white tracking-tight">
                Cotizar Maquinaria Pesada TMD Dominicana
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs uppercase"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-zinc-100 scrollbar-thin">
          
          {/* Machine Selection Grid */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5 tracking-wider">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Seleccionar Maquinaria del Catálogo Oficial</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MACHINES_DATA.map((machine) => {
                const isSelected = machine.id === selectedMachineId;
                return (
                  <div
                    key={machine.id}
                    onClick={() => setSelectedMachineId(machine.id)}
                    className={`p-3 rounded-[2px] border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-zinc-950 border-amber-400 text-white shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-14 h-14 rounded-[2px] object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {machine.brand}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <h4 className="font-bold text-xs text-white truncate uppercase">
                        {machine.name}
                      </h4>
                      <div className="text-[11px] font-mono font-bold text-zinc-300">
                        US$ {machine.basePriceUsd?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Machine Specs Summary */}
          <div className="p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Ficha Técnica del Equipo Seleccionado: {selectedMachine.name}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-zinc-900 p-2 rounded-[2px] border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Potencia</span>
                <strong className="text-white font-mono">{selectedMachine.powerHp} HP</strong>
              </div>
              <div className="bg-zinc-900 p-2 rounded-[2px] border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Peso Operativo</span>
                <strong className="text-white font-mono">{selectedMachine.operatingWeightKg.toLocaleString()} kg</strong>
              </div>
              <div className="bg-zinc-900 p-2 rounded-[2px] border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Motor</span>
                <strong className="text-white truncate block text-[11px] uppercase">{selectedMachine.engine}</strong>
              </div>
              <div className="bg-zinc-900 p-2 rounded-[2px] border border-zinc-800">
                <span className="text-zinc-400 block text-[10px] uppercase">Garantía TMD</span>
                <strong className="text-emerald-400 font-bold block text-[11px] uppercase">2 Años / 3,000h</strong>
              </div>
            </div>
          </div>

          {/* Additional Equipment Packages */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5 tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Paquetes y Opciones Adicionales</span>
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeMaintenanceKit}
                    onChange={(e) => setIncludeMaintenanceKit(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[2px] text-amber-400 focus:ring-amber-400 border-zinc-800 bg-zinc-900 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">
                      Kit de Mantenimiento Preventivo 500h Original (OEM)
                    </span>
                    <span className="text-[11px] text-zinc-400 font-sans">
                      Incluye filtros de combustible, aceite, hidráulico y aire genuinos.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +US$ 850.00
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-[2px] bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeExtendedWarranty}
                    onChange={(e) => setIncludeExtendedWarranty(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[2px] text-amber-400 focus:ring-amber-400 border-zinc-800 bg-zinc-900 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">
                      Cobertura Extendida TMD Care Plus (3 Años / 4,500h)
                    </span>
                    <span className="text-[11px] text-zinc-400 font-sans">
                      Garantía extendida en tren de potencia y diagnóstico computarizado prioritario.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +US$ 2,400.00
                </span>
              </label>
            </div>
          </div>

          {/* ITEM 4: TRADE-IN RETOMA DE MAQUINARIA USADA */}
          <div className="space-y-3 p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5 tracking-wider">
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Retoma de Maquinaria Usada (Trade-In / Parte de Pago)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tradein-toggle"
                  checked={enableTradeIn}
                  onChange={(e) => setEnableTradeIn(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] text-emerald-400 focus:ring-emerald-400 border-zinc-800 bg-zinc-900 cursor-pointer"
                />
                <label htmlFor="tradein-toggle" className="text-xs font-bold uppercase text-emerald-400 cursor-pointer">
                  {enableTradeIn ? 'Trade-In Activo' : 'Aplicar Usado'}
                </label>
              </div>
            </div>

            {enableTradeIn && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">Marca del Usado</label>
                  <input
                    type="text"
                    value={tradeInBrand}
                    onChange={(e) => setTradeInBrand(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-bold"
                    placeholder="Ej. Caterpillar, Komatsu, JCB"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">Modelo y Año</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tradeInModel}
                      onChange={(e) => setTradeInModel(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white"
                      placeholder="Ej. 416E Retro"
                    />
                    <input
                      type="number"
                      value={tradeInYear}
                      onChange={(e) => setTradeInYear(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 font-mono text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">Valor Tasado (Deducción USD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-emerald-400 font-bold">$</span>
                    <input
                      type="number"
                      value={tradeInAppraisalUsd}
                      onChange={(e) => setTradeInAppraisalUsd(Number(e.target.value))}
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-emerald-500/50 font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ITEM 3: REGISTRO DE ANTICIPOS & BANCA LOCAL RD */}
          <div className="space-y-3 p-3.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-sky-400 flex items-center gap-1.5 tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                <span>4. Registro de Anticipo / Reserva Bancaria (Patio Km 22)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="advance-toggle"
                  checked={enableAdvancePayment}
                  onChange={(e) => setEnableAdvancePayment(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] text-sky-400 focus:ring-sky-400 border-zinc-800 bg-zinc-900 cursor-pointer"
                />
                <label htmlFor="advance-toggle" className="text-xs font-bold uppercase text-sky-400 cursor-pointer">
                  {enableAdvancePayment ? 'Anticipo Registrado' : 'Registrar Pago'}
                </label>
              </div>
            </div>

            {enableAdvancePayment && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">Porcentaje de Inicial</label>
                  <select
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-bold"
                  >
                    <option value={30}>30% de Reserva (Importación / Bloqueo)</option>
                    <option value={50}>50% Inicial (Patio Km 22)</option>
                    <option value={20}>20% Inicial Especial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">Banco Receptor (RD)</label>
                  <select
                    value={advanceBank}
                    onChange={(e) => setAdvanceBank(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white"
                  >
                    <option value="Banco Popular Dominicano">Banco Popular Dominicano</option>
                    <option value="Banco BHD">Banco BHD</option>
                    <option value="Banreservas">Banreservas</option>
                    <option value="Scotiabank República Dominicana">Scotiabank RD</option>
                    <option value="Caja Central Km 22">Caja Central Km 22</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase text-[10px] font-bold">No. Referencia / Transferencia</label>
                  <input
                    type="text"
                    value={advanceReference}
                    onChange={(e) => setAdvanceReference(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-mono"
                    placeholder="Ej. BPD-TRF-992144"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Client & Fiscal DGII Details */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5 tracking-wider">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>5. Datos de la Empresa y Facturación Fiscal DGII</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">Empresa / Razón Social *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">Persona de Contacto *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">RNC o Cédula (DGII)</label>
                <input
                  type="text"
                  value={rnc}
                  onChange={(e) => setRnc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono"
                  placeholder="1-31-89421-4"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">Tipo de Comprobante Fiscal NCF</label>
                <select
                  value={ncfType}
                  onChange={(e) => setNcfType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-bold"
                >
                  <option value="B01_CREDITO_FISCAL">B01 - Factura de Crédito Fiscal (Empresas)</option>
                  <option value="B02_CONSUMIDOR_FINAL">B02 - Factura Consumidor Final</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono"
                  placeholder="+1 (809) 560-1234"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px]">Lugar de Entrega / Despacho</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing Summary Deck */}
          <div className="p-4 rounded-[2px] bg-zinc-950 text-white border border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <span className="uppercase text-[10px]">Precio Base Equipo:</span>
                  <strong className="text-white font-mono">US$ {baseMachinePrice.toLocaleString()}</strong>
                </div>
                {includeMaintenanceKit && (
                  <div className="flex justify-between">
                    <span className="uppercase text-[10px]">Kit Mantenimiento 500h:</span>
                    <strong className="text-white font-mono">+US$ {kitPrice.toLocaleString()}</strong>
                  </div>
                )}
                {includeExtendedWarranty && (
                  <div className="flex justify-between">
                    <span className="uppercase text-[10px]">Garantía Extendida TMD Care:</span>
                    <strong className="text-white font-mono">+US$ {warrantyPrice.toLocaleString()}</strong>
                  </div>
                )}
                {enableTradeIn && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span className="uppercase text-[10px]">Deducción Retoma Usada:</span>
                    <strong className="font-mono">-US$ {tradeInAppraisalUsd.toLocaleString()}</strong>
                  </div>
                )}
                <div className="flex justify-between text-amber-400">
                  <span className="uppercase text-[10px]">ITBIS (18% DGII):</span>
                  <strong className="font-mono">US$ {itbis.toLocaleString()}</strong>
                </div>
              </div>

              <div className="sm:text-right flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-zinc-800 sm:pl-4 pt-2 sm:pt-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Monto Total Proforma Oficial
                </span>
                <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                  US$ {total.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  (~RD$ {totalDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                </span>

                {enableAdvancePayment && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] space-y-0.5">
                    <div className="text-sky-400 flex justify-between sm:justify-end gap-2">
                      <span className="uppercase text-[10px]">Anticipo {advancePercent}%:</span>
                      <strong className="font-mono">US$ {calculatedAdvanceUsd.toLocaleString()}</strong>
                    </div>
                    <div className="text-zinc-300 flex justify-between sm:justify-end gap-2">
                      <span className="uppercase text-[10px]">Saldo para Despacho:</span>
                      <strong className="font-mono text-white">US$ {pendingBalanceUsd.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSaveAndExport('share_whatsapp')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndExport('save_only')}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
            >
              Guardar Proforma
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndExport('export_pdf')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-[2px] text-xs uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Procesando...' : 'Descargar PDF Formal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
