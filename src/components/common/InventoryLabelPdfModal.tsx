import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  ExternalLink,
  Eye,
  LayoutGrid,
  Maximize2,
  ZoomIn,
  Sparkles,
  Info
} from 'lucide-react';
import { Machine, Part } from '../../types';
import { 
  LabelSheetFormat, 
  downloadInventoryLabelPdf, 
  printInventoryLabelPdf,
  generateInventoryLabelPdf,
  getProductSku
} from '../../utils/inventoryLabelPdfGenerator';
import { downloadProductQrCode, getProductMobileUrl } from '../../utils/qrExporter';

interface InventoryLabelPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Machine | Part | null;
  type: 'machinery' | 'part';
}

export const InventoryLabelPdfModal: React.FC<InventoryLabelPdfModalProps> = ({
  isOpen,
  onClose,
  product,
  type
}) => {
  const [sheetFormat, setSheetFormat] = useState<LabelSheetFormat>('grid_6');
  const [copies, setCopies] = useState<number>(1);
  const [facilityZone, setFacilityZone] = useState<string>(
    type === 'machinery' 
      ? 'Patio Central Km 22 • Flota Pesada' 
      : 'Almacén Central • Racks OEM'
  );
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'sheet' | 'verified_data'>('sheet');

  const isMachine = type === 'machinery';
  const machine = isMachine ? (product as Machine) : null;
  const part = !isMachine ? (product as Part) : null;

  const title = product?.name || 'Producto';
  const brand = product?.brand || 'TMD';
  const skuCode = product ? getProductSku(product, type) : 'SKU-TMD-001';
  const identifierCode = isMachine 
    ? (machine?.modelCode || machine?.id || 'EQUIPO')
    : (part?.partNumber || part?.id || 'REPUESTO');
  const mobileUrl = product ? getProductMobileUrl(product, type) : 'https://tmd.com.do';

  // Calculate total labels to be printed
  const labelsPerSheetMap: Record<LabelSheetFormat, number> = {
    grid_6: 6,
    grid_8: 8,
    grid_12: 12,
    single_placard: 1
  };
  const totalLabels = (labelsPerSheetMap[sheetFormat] || 6) * copies;

  // Regenerate PDF preview when parameters change
  useEffect(() => {
    if (!isOpen || !product) {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
        setPreviewPdfUrl(null);
      }
      return;
    }

    let isMounted = true;
    const generatePreview = async () => {
      try {
        const doc = await generateInventoryLabelPdf(product, type, {
          sheetFormat,
          facilityZone,
          copies: 1, // 1 sheet for quick interactive preview
          includeTimestamp
        });
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        if (isMounted) {
          if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
          setPreviewPdfUrl(url);
        }
      } catch (err) {
        console.error('Error generating PDF preview:', err);
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, product, type, sheetFormat, facilityZone, includeTimestamp]);

  if (!isOpen || !product) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await downloadInventoryLabelPdf(product, type, {
        sheetFormat,
        copies,
        facilityZone,
        includeTimestamp
      });
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = async () => {
    setIsGenerating(true);
    try {
      await printInventoryLabelPdf(product, type, {
        sheetFormat,
        copies,
        facilityZone,
        includeTimestamp
      });
    } catch (err) {
      console.error('Error printing PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    await downloadProductQrCode(product, type);
  };

  const sheetOptions: { id: LabelSheetFormat; title: string; desc: string; countText: string; icon: string }[] = [
    {
      id: 'grid_6',
      title: 'Pliego Estándar (2 x 3)',
      desc: '6 Rótulos por hoja A4/Carta con código, QR grande y zona de patio.',
      countText: `${6 * copies} Rótulos`,
      icon: '2x3'
    },
    {
      id: 'grid_8',
      title: 'Pliego Masivo (2 x 4)',
      desc: '8 Rótulos medianos para estanterías pesadas o cajas de almacén.',
      countText: `${8 * copies} Rótulos`,
      icon: '2x4'
    },
    {
      id: 'grid_12',
      title: 'Etiquetas Adhesivas (3 x 4)',
      desc: '12 Rótulos compactos ideales para repuestos pequeños y racks OEM.',
      countText: `${12 * copies} Rótulos`,
      icon: '3x4'
    },
    {
      id: 'single_placard',
      title: 'Placa Individual de Hangar (1x1 A4)',
      desc: '1 Placa gigante de alta visibilidad para cabina de máquina o portón de bahía.',
      countText: `${1 * copies} Placa`,
      icon: '1x1'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] bg-zinc-950 border border-amber-500/40 rounded-[6px] shadow-2xl flex flex-col overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm uppercase tracking-wide">
                  Vista Previa de Impresión & Verificación de Rótulos
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-amber-400 text-black text-[9px] font-mono font-black uppercase">
                  Print Preview A4
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Verifica los datos del SKU y el código QR antes de enviar a la impresora
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[3px] bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            aria-label="Cerrar ventana de vista previa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Alert Banner (Checks SKU, QR, and Warehouse metadata) */}
        <div className="bg-zinc-900/95 border-b border-zinc-800 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto shrink-0">
          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SKU: {skuCode}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>QR Nivel-H Verificado</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate max-w-[200px]">{facilityZone}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-zinc-400">
              <span className="text-amber-400 font-bold">{totalLabels}</span> etiquetas listas
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setPreviewMode('sheet')}
              className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                previewMode === 'sheet'
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Pliego PDF
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('verified_data')}
              className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                previewMode === 'verified_data'
                  ? 'bg-amber-400 text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Ficha & Verificación
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Configuration Controls */}
          <div className="lg:col-span-5 space-y-3.5 text-xs">
            {/* Target Item Summary Box */}
            <div className="p-3 bg-zinc-900/90 rounded-[4px] border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span className="uppercase text-amber-400 font-bold">{brand}</span>
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                  {isMachine ? 'EQUIPO PESADO' : 'REPUESTO OEM'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white uppercase font-display line-clamp-1">
                {title}
              </h4>
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800 text-[11px] flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">SKU OFICIAL:</span>
                  <span className="text-amber-400 font-bold font-mono text-xs bg-black px-1.5 py-0.5 rounded border border-amber-500/30">
                    {skuCode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400">CÓDIGO:</span>
                  <span className="text-zinc-200 font-bold font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    {isMachine ? `MOD. ${identifierCode}` : `P/N: ${identifierCode}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Sheet Format Selector */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1.5 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>Formato de Pliego de Rótulos:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sheetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSheetFormat(opt.id)}
                    className={`p-2.5 rounded-[4px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      sheetFormat === opt.id
                        ? 'bg-amber-400/10 border-amber-400 text-white shadow-xs ring-1 ring-amber-400/50'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-[11px] text-white uppercase">
                        {opt.title}
                      </span>
                      <span className="px-1 py-0.2 rounded text-[9px] font-black bg-zinc-800 text-amber-400 border border-zinc-700">
                        {opt.icon}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight mb-2">
                      {opt.desc}
                    </p>
                    <span className="text-[10px] font-bold text-amber-400">
                      Total: {opt.countText}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copies & Facility Zone Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1.5">
                  Hojas / Pliegos (Copias):
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCopies(num)}
                      className={`flex-1 py-1.5 rounded-[3px] border font-bold text-xs transition-colors cursor-pointer ${
                        copies === num
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1.5">
                  Zona / Ubicación Impresa:
                </label>
                <select
                  value={facilityZone}
                  onChange={(e) => setFacilityZone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-[3px] py-1.5 px-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Patio Central Km 22 • Flota Pesada">Patio Central Km 22 • Flota Pesada</option>
                  <option value="Almacén Central • Racks OEM">Almacén Central • Racks OEM</option>
                  <option value="Pista 1 Excavación y Carga Pesada">Pista 1 Excavación y Carga</option>
                  <option value="Bahía de Mantenimiento y Taller">Bahía de Mantenimiento y Taller</option>
                  <option value="Recepción Aduanal / Km 22">Recepción Aduanal / Km 22</option>
                </select>
              </div>
            </div>

            {/* Options Checklist */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <span className="text-[11px]">Incluir sello de fecha/hora y registro ERP en cada rótulo</span>
              </label>
            </div>
          </div>

          {/* Right Column: Interactive Live PDF Print Previewer */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {previewMode === 'sheet' ? 'Vista Previa del Pliego (A4 Listo para Impresión)' : 'Verificación de Datos de Identificación'}
                </span>
              </span>
              <span className="text-zinc-500">210 x 297 mm</span>
            </div>

            {/* Preview Frame Container */}
            <div className="relative w-full h-[340px] sm:h-[380px] bg-zinc-900 rounded-[4px] border border-zinc-800 overflow-hidden flex items-center justify-center shadow-inner">
              {previewMode === 'sheet' ? (
                previewPdfUrl ? (
                  <iframe
                    src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full border-0 bg-white"
                    title="Vista Previa de Pliego PDF"
                  />
                ) : (
                  <div className="text-center text-zinc-500 text-xs p-4 animate-pulse">
                    <Printer className="w-6 h-6 mx-auto mb-2 text-amber-400 animate-spin" />
                    <p>Generando renderizado de alta resolución...</p>
                  </div>
                )
              ) : (
                /* Verified Data Inspector Tab */
                <div className="w-full h-full p-4 overflow-y-auto bg-zinc-950 text-xs space-y-3">
                  <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Datos de Trazabilidad y Código QR
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">SKU INTERNO:</span>
                        <span className="font-bold font-mono text-white">{skuCode}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">CÓDIGO CATÁLOGO:</span>
                        <span className="font-bold font-mono text-amber-400">{identifierCode}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">NIVEL DE ERROR QR:</span>
                        <span className="font-bold text-emerald-400">Nivel H (30% Corrección)</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">DESTINO DE ESCANEO:</span>
                        <span className="text-cyan-400 truncate block">Ficha Móvil Directa</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Enlace de Verificación Web:
                    </span>
                    <p className="text-[11px] text-zinc-300 break-all font-mono bg-black p-2 rounded border border-zinc-800">
                      {mobileUrl}
                    </p>
                    <a
                      href={mobileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Probar destino de escaneo en navegador</span>
                    </a>
                  </div>

                  <div className="p-2.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      Al presionar <strong>"Imprimir Ahora"</strong> se abrirá la ventana de impresión nativa de tu navegador con las dimensiones exactas de la hoja A4.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar (Trigger Print Dialog or Download PDF) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  disabled={isGenerating}
                  className="flex-1 py-2.5 px-4 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  title="Abrir el cuadro de diálogo de impresión nativo del navegador"
                >
                  <Printer className="w-4 h-4 stroke-[2.5]" />
                  <span>{isGenerating ? 'Preparando...' : `Imprimir Ahora (${totalLabels} Rótulos)`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="py-2.5 px-4 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                  title="Descargar archivo PDF al disco local"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Descargar PDF</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                <span>¿Deseas solo 1 etiqueta digital en imagen PNG?</span>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar Rótulo PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
