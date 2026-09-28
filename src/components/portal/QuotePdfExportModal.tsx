import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileDown, 
  Printer, 
  Eye, 
  Check, 
  Copy, 
  Wrench, 
  Building, 
  Calendar, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  CreditCard, 
  Sparkles,
  ChevronDown,
  Info
} from 'lucide-react';
import { PortalQuote, Machine } from '../../types';
import { USD_TO_DOP_RATE, MACHINES_DATA } from '../../data/catalog';
import { downloadQuotePDF } from '../../utils/pdfGenerator';
import { getQuoteWhatsAppUrl, copyQuoteShareLink, generateShortQuoteShareUrl } from '../../utils/whatsappMessaging';
import { Share2, Phone, Link2 } from 'lucide-react';

interface QuotePdfExportModalProps {
  quote: PortalQuote;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export const QuotePdfExportModal: React.FC<QuotePdfExportModalProps> = ({
  quote,
  onClose,
  onNavigate
}) => {
  // Find matching machine from catalog if possible or allow user to pick
  const initialMachine = MACHINES_DATA.find((m) => {
    const summary = (quote.itemsSummary || '').toLowerCase();
    const name = m.name.toLowerCase();
    const brand = m.brand.toLowerCase();
    return summary.includes(name) || summary.includes(m.id) || (summary.includes(brand) && summary.includes(m.category.toLowerCase()));
  }) || MACHINES_DATA[0];

  const [selectedMachineId, setSelectedMachineId] = useState<string>(initialMachine ? initialMachine.id : MACHINES_DATA[0].id);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Patio Central Km 22, Autopista Duarte / En Obra RD');
  const [paymentMethod, setPaymentMethod] = useState<string>('Transferencia Bancaria / Leasing Comercial');
  const [customerNotes, setCustomerNotes] = useState<string>(quote.notes || 'Equipos garantizados con entrega inmediata y capacitación de operador.');
  const [includeSpecs, setIncludeSpecs] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedShortUrl, setCopiedShortUrl] = useState<boolean>(false);

  const selectedMachine = MACHINES_DATA.find((m) => m.id === selectedMachineId) || initialMachine;

  // Pricing calculations
  const machinePrice = selectedMachine?.basePriceUsd || quote.subtotal || 89500;
  const subtotal = quote.subtotal > 0 ? quote.subtotal : machinePrice;
  const itbis = quote.itbis > 0 ? quote.itbis : Math.round(subtotal * 0.18);
  const total = quote.total > 0 ? quote.total : subtotal + itbis;
  const totalDop = total * USD_TO_DOP_RATE;

  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      const updatedQuote: PortalQuote = {
        ...quote,
        subtotal,
        itbis,
        total,
        notes: customerNotes
      };

      downloadQuotePDF({
        quote: updatedQuote,
        selectedMachine,
        deliveryLocation,
        paymentMethod,
        customerNotes,
        includeSpecs
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const handleCopySummary = async () => {
    const text = `COTIZACIÓN TMD DOMINICANA\nN°: ${quote.quoteNumber}\nCliente: ${quote.companyName || quote.clientName}\nEquipo: ${selectedMachine?.name}\nTotal: US$ ${total.toLocaleString()} (~RD$ ${totalDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })})\nValidez: 30 días con garantía oficial de 2 años.`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (fallbackErr) {
        console.warn('Could not copy summary to clipboard:', fallbackErr);
      }
    }
  };

  const handleCopyShortUrl = async () => {
    const success = await copyQuoteShareLink(quote.id || quote.quoteNumber);
    if (success) {
      setCopiedShortUrl(true);
      setTimeout(() => setCopiedShortUrl(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = getQuoteWhatsAppUrl(quote, quote.phone);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 w-full max-w-4xl rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-mono text-zinc-100">
        
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-amber-400" />

        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Exportación de Presupuesto PDF
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 font-mono text-xs font-bold text-zinc-300">
                  {quote.quoteNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold uppercase text-white tracking-tight">
                Cotización Oficial TMD Dominicana
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-zinc-100 scrollbar-thin">
          
          {/* Customization Options Bar */}
          <div className="p-4 rounded-[2px] bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Personalizar Datos de la Cotización para Exportar</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">
                Formato Oficial RNC: 1-31-89024-5
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Select Machine */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px] block">Maquinaria Asignada *</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-bold"
                >
                  {MACHINES_DATA.map((machine) => (
                    <option key={machine.id} value={machine.id}>
                      {machine.brand} - {machine.name} (US$ {machine.basePriceUsd?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px] block">Condición de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white"
                >
                  <option value="Transferencia Bancaria (Banco Popular / Banreservas)">Transferencia Bancaria (RD$/USD)</option>
                  <option value="Financiamiento Leasing Comercial (36-48 Meses)">Financiamiento Leasing Comercial</option>
                  <option value="Crédito Corporativo 30 Días con Pagaré Notarial">Crédito Corporativo 30 Días</option>
                  <option value="Pago al Contado con Descuento Especial">Contado con Descuento</option>
                </select>
              </div>

              {/* Delivery Place */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-400 uppercase text-[10px] block">Lugar de Entrega</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Ej. Patio Km 22 o Santo Domingo Norte"
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>
            </div>

            {/* Checkbox for specs */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="includeSpecsCheck"
                checked={includeSpecs}
                onChange={(e) => setIncludeSpecs(e.target.checked)}
                className="w-3.5 h-3.5 rounded-[2px] text-amber-400 focus:ring-amber-400 border-zinc-800 bg-zinc-900 cursor-pointer"
              />
              <label htmlFor="includeSpecsCheck" className="text-xs font-bold text-zinc-300 uppercase cursor-pointer">
                Incluir ficha de especificaciones técnicas del fabricante (Motor, Fuerza de Arranque, Transmisión, etc.) en el PDF
              </label>
            </div>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="p-4 sm:p-5 rounded-[2px] bg-zinc-950 border border-zinc-800 shadow-xs space-y-4">
            {/* Visual Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[2px] bg-zinc-900 border border-zinc-800 text-white font-bold text-xs tracking-wider">
                  TMD <span className="text-amber-400">RD</span>
                </div>
                <div>
                  <h4 className="font-bold uppercase text-xs sm:text-sm text-white">
                    TMD MAQUINARIA PESADA DOMINICANA S.R.L.
                  </h4>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    Autopista Duarte Km 22, Santo Domingo Oeste • RNC: 1-31-89024-5
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Número de Proforma</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {quote.quoteNumber}
                </span>
                <span className="text-[10px] text-zinc-400 block">
                  Fecha: {new Date(quote.createdAt || Date.now()).toLocaleDateString('es-DO')}
                </span>
              </div>
            </div>

            {/* Client & Machinery Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cliente / Solicitante</span>
                <strong className="text-white block text-xs uppercase">
                  {quote.companyName || quote.clientName}
                </strong>
                <span className="text-zinc-400 block text-[11px]">Email: {quote.clientEmail}</span>
                {quote.phone && <span className="text-zinc-400 block text-[11px]">Teléfono: {quote.phone}</span>}
                <span className="text-zinc-400 block text-[11px]">Destino: {deliveryLocation}</span>
              </div>

              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Maquinaria Principal</span>
                <strong className="text-amber-400 block text-xs uppercase">
                  {selectedMachine?.name}
                </strong>
                <span className="text-zinc-400 block text-[11px]">Marca: {selectedMachine?.brand} • Año: {selectedMachine?.year || 2026}</span>
                <span className="text-zinc-400 block text-[11px]">Motor: {selectedMachine?.engine}</span>
                <span className="text-emerald-400 font-bold block text-[11px] uppercase">Garantía: 2 Años / 3,000 Horas</span>
              </div>
            </div>

            {/* Machinery Visual Specs Pill Grid */}
            {selectedMachine && includeSpecs && selectedMachine.specs && (
              <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">
                  Especificaciones Técnicas Incluidas en el Documento PDF:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedMachine.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between bg-zinc-950 p-2 rounded-[2px] border border-zinc-800">
                      <span className="text-zinc-400 font-bold uppercase text-[10px]">{spec.label}:</span>
                      <strong className="text-white font-mono text-[11px]">{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Breakdown Card */}
            <div className="p-3.5 rounded-[2px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 uppercase text-[10px]">Subtotal Neto:</span>
                  <strong className="font-mono text-white">US$ {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 uppercase text-[10px]">ITBIS (18% Ley 11-92):</span>
                  <strong className="font-mono text-white">US$ {itbis.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Equivalente oficial en Pesos Dominicanos: <strong className="text-white">RD$ {totalDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}</strong>
                </div>
              </div>

              <div className="text-left sm:text-right bg-zinc-950 p-3 rounded-[2px] border border-amber-400/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Total Cotizado
                </span>
                <span className="text-lg sm:text-xl font-bold text-white font-mono">
                  US$ {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Resumen Copiado' : 'Copiar Resumen'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShortUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-amber-400 hover:bg-zinc-800 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer"
              title="Copiar enlace web directo para ver proforma online"
            >
              {copiedShortUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copiedShortUrl ? 'Enlace Web Copiado' : 'Copiar Link Proforma'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Proforma</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-[2px] text-xs uppercase transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-[2px] text-xs uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generando PDF...' : 'Descargar PDF Oficial (.pdf)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
