import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileDown,
  Printer,
  X,
  Building2,
  User,
  SlidersHorizontal,
  CheckCircle2,
  DollarSign,
  FileText,
  Eye,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Machine, Part } from '../types';
import {
  generateMachineryCatalogPdf,
  generatePartsCatalogPdf
} from '../services/catalogPdfExport';
import { USD_TO_DOP_RATE } from '../data/catalog';

interface ExportCatalogPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'machinery' | 'parts';
  machines?: Machine[];
  parts?: Part[];
  activeCategory?: string;
  activeBrand?: string;
  activeSearchTerm?: string;
}

export const ExportCatalogPdfModal: React.FC<ExportCatalogPdfModalProps> = ({
  isOpen,
  onClose,
  type,
  machines = [],
  parts = [],
  activeCategory = 'Todas',
  activeBrand = 'Todas',
  activeSearchTerm = ''
}) => {
  const [clientName, setClientName] = useState<string>('');
  const [salespersonName, setSalespersonName] = useState<string>('Ing. Juan Liriano - Asesor Comercial TMD');
  const [includePrices, setIncludePrices] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const itemCount = type === 'machinery' ? machines.length : parts.length;
  const isMachinery = type === 'machinery';

  const getCleanFilename = (): string => {
    const today = new Date().toISOString().split('T')[0];
    if (isMachinery) {
      const brandClean = activeBrand && activeBrand !== 'Todas' ? `-${activeBrand.replace(/\s+/g, '')}` : '';
      return `TMD-Catalogo-Maquinaria${brandClean}-${today}.pdf`;
    } else {
      return `TMD-Catalogo-Repuestos-OEM-${today}.pdf`;
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      // Small tick for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 150));

      let doc;
      if (isMachinery) {
        doc = generateMachineryCatalogPdf({
          machines,
          category: activeCategory,
          brand: activeBrand,
          searchTerm: activeSearchTerm,
          clientName: clientName.trim(),
          salespersonName: salespersonName.trim(),
          includePrices
        });
      } else {
        doc = generatePartsCatalogPdf({
          parts,
          category: activeCategory,
          searchTerm: activeSearchTerm,
          clientName: clientName.trim(),
          salespersonName: salespersonName.trim(),
          includePrices
        });
      }

      doc.save(getCleanFilename());
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewPdf = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));

      let doc;
      if (isMachinery) {
        doc = generateMachineryCatalogPdf({
          machines,
          category: activeCategory,
          brand: activeBrand,
          searchTerm: activeSearchTerm,
          clientName: clientName.trim(),
          salespersonName: salespersonName.trim(),
          includePrices
        });
      } else {
        doc = generatePartsCatalogPdf({
          parts,
          category: activeCategory,
          searchTerm: activeSearchTerm,
          clientName: clientName.trim(),
          salespersonName: salespersonName.trim(),
          includePrices
        });
      }

      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Error opening PDF preview:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <div
      id="export-pdf-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 font-mono"
      onClick={onClose}
    >
      <div
        id="export-pdf-modal-card"
        className="relative w-full max-w-xl bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-wide">
                <span>Exportar Catálogo a PDF</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] font-bold uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  {isMachinery ? 'Maquinaria' : 'Repuestos'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Documento ejecutivo con membrete oficial para presentaciones comerciales offline
              </p>
            </div>
          </div>
          <button
            id="close-export-pdf-btn"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Active Filter Scope Card */}
          <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Alcance de Productos a Exportar</span>
              </span>
              <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase">
                {itemCount} {isMachinery ? 'Equipos' : 'Piezas'} seleccionados
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-xs">
              {isMachinery && (
                <div className="text-[11px] px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Marca: <strong className="text-white uppercase">{activeBrand}</strong>
                </div>
              )}
              <div className="text-[11px] px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                Categoría: <strong className="text-white uppercase">{activeCategory}</strong>
              </div>
              {activeSearchTerm && (
                <div className="text-[11px] px-2 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Búsqueda: <strong className="text-amber-400 uppercase">"{activeSearchTerm}"</strong>
                </div>
              )}
            </div>

            {itemCount === 0 && (
              <p className="text-[11px] font-bold text-rose-400 pt-1 uppercase">
                Aviso: Los filtros actuales no arrojan productos. Ajusta los filtros para exportar datos válidos.
              </p>
            )}
          </div>

          {/* Customization Options */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Personalización de la Presentación
            </h4>

            {/* Client / Project Name */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1.5 uppercase">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Nombre del Cliente o Proyecto (Opcional)</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej. Constructora Rizek, Consorcio Vial del Este..."
                className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Aparecerá en el encabezado oficial del documento para personalizar la entrega.
              </p>
            </div>

            {/* Salesperson Name */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1 flex items-center gap-1.5 uppercase">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Asesor Comercial / Ejecutivo TMD</span>
              </label>
              <input
                type="text"
                value={salespersonName}
                onChange={(e) => setSalespersonName(e.target.value)}
                placeholder="Ej. Ing. Juan Liriano - Asesor Técnico Comercial"
                className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Include Prices Toggle & Currency Note */}
            <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase">
                    Incluir Precios de Inversión (USD & DOP)
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Tasa de referencia oficial: US$ 1.00 = RD$ {USD_TO_DOP_RATE.toFixed(2)}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrices}
                  onChange={(e) => setIncludePrices(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-[2px] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-[1px] after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-400 peer-checked:after:bg-black"></div>
              </label>
            </div>
          </div>

          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Documento PDF descargado exitosamente con membrete oficial TMD!</span>
            </div>
          )}

          {/* Layout Features Note */}
          <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-zinc-200 uppercase">Formato Ejecutivo:</strong> Diseñado en orientación {isMachinery ? 'horizontal (landscape)' : 'vertical (portrait)'} en alta resolución, listo para imprimir en tamaño A4/Carta o enviar a licitaciones y juntas directivas.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer text-center uppercase"
          >
            Cancelar
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              id="preview-pdf-btn"
              type="button"
              onClick={handlePreviewPdf}
              disabled={isExporting || itemCount === 0}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-[2px] border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase"
              title="Abrir en pestaña nueva para visualizar o imprimir con Ctrl+P"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Imprimir / Vista Previa</span>
            </button>

            <button
              id="download-catalog-pdf-btn"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting || itemCount === 0}
              className="flex-1 sm:flex-initial px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase"
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
