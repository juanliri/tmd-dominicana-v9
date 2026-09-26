import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  HardHat,
  Cog,
  MessageCircle,
  Maximize2,
  FileText,
  Printer,
  Palette,
  CheckCircle2,
  Wrench,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { Machine, Part } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { LastScannedBadge } from './common/LastScannedBadge';
import { RecentlyVerifiedBadge } from './common/RecentlyVerifiedBadge';
import { InventoryAuditTrail } from './common/InventoryAuditTrail';
import { InventoryLabelPdfModal } from './common/InventoryLabelPdfModal';
import { downloadProductQrCode } from '../utils/qrExporter';

interface ProductQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: (Machine | Part) | null;
  type: 'machinery' | 'part';
}

type QrColorTheme = 'dark' | 'amber' | 'mono';

export const ProductQrCodeModal: React.FC<ProductQrCodeModalProps> = ({
  isOpen,
  onClose,
  product,
  type
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [colorTheme, setColorTheme] = useState<QrColorTheme>('dark');
  const [activeTab, setActiveTab] = useState<'qr' | 'specs' | 'audit'>('qr');
  const [isLabelSheetModalOpen, setIsLabelSheetModalOpen] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute the exact direct mobile URL to open this product in the store
  const getProductMobileUrl = (): string => {
    if (!product) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const cleanPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
    
    if (type === 'machinery') {
      return `${origin}${cleanPath}#/machinery?id=${encodeURIComponent(product.id)}`;
    } else {
      return `${origin}${cleanPath}#/parts?id=${encodeURIComponent(product.id)}`;
    }
  };

  const mobileUrl = getProductMobileUrl();

  useEffect(() => {
    if (!isOpen || !product) {
      setQrDataUrl('');
      return;
    }

    setIsGenerating(true);
    const targetUrl = getProductMobileUrl();

    let darkColor = '#09090b';
    if (colorTheme === 'amber') darkColor = '#b45309'; // Rich Amber
    if (colorTheme === 'mono') darkColor = '#000000';  // Crisp Black

    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: darkColor,
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        setIsGenerating(false);
      });
  }, [isOpen, product, type, colorTheme]);

  if (!isOpen || !product || typeof document === 'undefined') return null;

  const isMachine = type === 'machinery';
  const machine = isMachine ? (product as Machine) : null;
  const part = !isMachine ? (product as Part) : null;

  const title = product.name;
  const brand = product.brand;
  const identifier = isMachine ? machine?.modelCode : part?.partNumber;
  const priceUsd = isMachine ? machine?.basePriceUsd || 0 : part?.priceUsd || 0;
  const priceDop = Math.round(priceUsd * USD_TO_DOP_RATE);

  const handleCopyLink = async () => {
    if (!mobileUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(mobileUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = mobileUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Could not copy URL:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const safeBrand = (brand || 'TMD').replace(/\s+/g, '-');
    const safeId = (identifier || product.id).replace(/\s+/g, '-');
    link.download = `QR-${safeBrand}-${safeId}-TMD-Dominicana.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚜 *Ficha Técnica TMD Dominicana*\n` +
      `*Equipo/Pieza:* ${title}\n` +
      `*Marca:* ${brand}\n` +
      `*Código:* ${identifier}\n` +
      (isMachine && machine ? `*Potencia:* ${machine.powerHp} HP\n*Motor:* ${machine.engine}\n` : '') +
      (!isMachine && part ? `*Repuesto:* ${part.category}\n*Disponibilidad:* ${part.stockQty > 0 ? 'En Stock' : 'Bajo pedido'}\n` : '') +
      `*Precio Referencial:* US$${priceUsd.toLocaleString()} / RD$${priceDop.toLocaleString()}\n` +
      `*Ver Ficha Móvil:* ${mobileUrl}\n\n` +
      `_Atención y Patio: Km 22 Autopista Duarte, Santo Domingo Oeste_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Generate printable PDF spec placard for equipment windshield or warehouse shelf
  const handleDownloadPdfLabel = () => {
    if (!qrDataUrl || !product) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      const amberColor: [number, number, number] = [245, 158, 11];
      const darkColor: [number, number, number] = [24, 24, 27];
      const slateBg: [number, number, number] = [248, 250, 252];

      // Top Accent Bar
      doc.setFillColor(...amberColor);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Header Box
      doc.setFillColor(...darkColor);
      doc.rect(0, 5, pageWidth, 26, 'F');

      // Header Brand text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('TMD DOMINICANA', margin, 17);

      doc.setFontSize(8);
      doc.setTextColor(...amberColor);
      doc.text('MAQUINARIA PESADA, REPUESTOS GENUINOS & SERVICIO TÉCNICO', margin, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text('Km 22 Autopista Duarte, Pedro Brand, Sto. Dgo. | Tel: +1 (809) 560-8484 | info@tmd.do', margin, 27);

      // Placard Title on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(
        isMachine ? 'RÓTULO DE EXHIBICIÓN EN PATIO' : 'RÓTULO DE IDENTIFICACIÓN EN ALMACÉN',
        pageWidth - margin,
        18,
        { align: 'right' }
      );
      doc.setFontSize(7.5);
      doc.setTextColor(...amberColor);
      doc.text('FICHA TÉCNICA Y ESPECIFICACIONES MÓVILES', pageWidth - margin, 24, { align: 'right' });

      // Product Title Box
      let currentY = 36;
      doc.setFillColor(...slateBg);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...amberColor);
      doc.text(
        (brand || 'TMD').toUpperCase() + (isMachine ? ' • MAQUINARIA CERTIFICADA' : ' • REPUESTO GENUINO OEM'),
        margin + 5,
        currentY + 6
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...darkColor);
      doc.text(title.slice(0, 50), margin + 5, currentY + 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        isMachine
          ? `Código / Modelo: ${identifier}  |  Categoría: ${machine?.category || 'Maquinaria'}`
          : `Número de Parte (P/N): ${identifier}  |  Categoría: ${part?.category || 'Repuesto'}`,
        margin + 5,
        currentY + 18
      );

      currentY += 27;

      // QR Code Box (Left Stage)
      const qrBoxWidth = 85;
      const qrBoxHeight = 110;
      const qrBoxX = margin;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(qrBoxX, currentY, qrBoxWidth, qrBoxHeight, 3, 3, 'F');
      doc.setDrawColor(...amberColor);
      doc.setLineWidth(0.8);
      doc.roundedRect(qrBoxX, currentY, qrBoxWidth, qrBoxHeight, 3, 3, 'S');
      doc.setLineWidth(0.2);

      // Add QR image
      const qrImgSize = 65;
      doc.addImage(qrDataUrl, 'PNG', qrBoxX + 10, currentY + 8, qrImgSize, qrImgSize);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...darkColor);
      doc.text('ESCANEA CON TU CELULAR', qrBoxX + qrBoxWidth / 2, currentY + 84, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Acceso instantáneo a especificaciones,', qrBoxX + qrBoxWidth / 2, currentY + 91, { align: 'center' });
      doc.text('manuales técnicos y cotización directa.', qrBoxX + qrBoxWidth / 2, currentY + 96, { align: 'center' });

      // Technical Specs Box (Right side of QR)
      const specBoxX = qrBoxX + qrBoxWidth + 6;
      const specBoxWidth = pageWidth - margin - specBoxX;

      doc.setFillColor(...slateBg);
      doc.roundedRect(specBoxX, currentY, specBoxWidth, qrBoxHeight, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(specBoxX, currentY, specBoxWidth, qrBoxHeight, 3, 3, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text('DATOS TÉCNICOS CERTIFICADOS', specBoxX + 6, currentY + 9);

      let specY = currentY + 18;
      const printSpecRow = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label + ':', specBoxX + 6, specY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(value, specBoxX + 38, specY);
        specY += 8.5;
      };

      if (isMachine && machine) {
        printSpecRow('Motor Diésel', machine.engine || 'Certificado Oficial');
        printSpecRow('Potencia Nominal', `${machine.powerHp} HP`);
        printSpecRow('Peso Operativo', `${machine.operatingWeightKg.toLocaleString()} kg`);
        if (machine.bucketCapacityM3) {
          printSpecRow('Capacidad Balde', `${machine.bucketCapacityM3} m³`);
        }
        printSpecRow('Garantía de Fábrica', `${machine.warrantyMonths || 12} meses`);
        printSpecRow('Entrega Inmediata', 'Patio Central Km 22 Autopista Duarte');
        printSpecRow('Inversión Sugerida', `US$ ${priceUsd.toLocaleString()} (RD$ ${priceDop.toLocaleString()})`);
      } else if (part) {
        printSpecRow('Número de Parte', part.partNumber);
        printSpecRow('Marca OEM', part.brand);
        printSpecRow('Categoría', part.category);
        printSpecRow('Disponibilidad', part.stockQty > 0 ? `En Stock (${part.stockQty} unid.)` : 'Bajo pedido');
        printSpecRow('Compatibilidad', part.compatibleModels?.slice(0, 2).join(', ') || 'Consultar asesor');
        printSpecRow('Precio Unitario', `US$ ${priceUsd.toLocaleString()} (RD$ ${priceDop.toLocaleString()})`);
      }

      currentY += qrBoxHeight + 8;

      // Footer Support Strip
      doc.setFillColor(...darkColor);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'F');

      doc.setTextColor(...amberColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('SOPORTE TÉCNICO Y VENTAS DIRECTAS EN REPÚBLICA DOMINICANA', margin + 6, currentY + 7);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Centro de Servicio Especializado, Taller Certificado y Repuestos en Km 22 Autopista Duarte, Sto. Dgo. Oeste.', margin + 6, currentY + 12);
      doc.text('WhatsApp Ventas: +1 (829) 762-8000 | Taller & Despacho: +1 (809) 560-8484 | Web: tmd.do', margin + 6, currentY + 17);

      const safeBrand = (brand || 'TMD').replace(/\s+/g, '-');
      const safeId = (identifier || product.id).replace(/\s+/g, '-');
      doc.save(`Rotulo-QR-${safeBrand}-${safeId}-TMD.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF label:', e);
    }
  };

  return createPortal(
    <div
      id="product-qr-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-qr-modal-card"
        className="relative w-full max-w-xl bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-amber-400" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2 uppercase tracking-wide">
                <span>Generador de Código QR</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] font-bold uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  {isMachine ? 'Maquinaria' : 'Repuesto OEM'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Acceso móvil instantáneo a especificaciones técnicas y cotización
              </p>
            </div>
          </div>
          <button
            id="product-qr-close-btn"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Navigation Tabs (QR View vs Specifications Preview) */}
        <div className="px-4 sm:px-6 pt-2.5 pb-2 border-b border-zinc-800 flex items-center justify-between gap-2 bg-zinc-950/40">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                activeTab === 'qr'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Código QR & Descarga</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                activeTab === 'specs'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Vista Ficha Móvil</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-[2px] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                activeTab === 'audit'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Audit Trail (3)</span>
            </button>
          </div>

          {/* Color Theme Selector for QR */}
          {activeTab === 'qr' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase hidden sm:inline mr-1">Estilo:</span>
              <button
                type="button"
                onClick={() => setColorTheme('dark')}
                className={`w-4.5 h-4.5 rounded-[2px] border transition-all cursor-pointer ${
                  colorTheme === 'dark' ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-zinc-700'
                }`}
                style={{ backgroundColor: '#09090b' }}
                title="Oscuro Oficial TMD"
              />
              <button
                type="button"
                onClick={() => setColorTheme('amber')}
                className={`w-4.5 h-4.5 rounded-[2px] border transition-all cursor-pointer ${
                  colorTheme === 'amber' ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-zinc-700'
                }`}
                style={{ backgroundColor: '#d97706' }}
                title="Ámbar Industrial"
              />
              <button
                type="button"
                onClick={() => setColorTheme('mono')}
                className={`w-4.5 h-4.5 rounded-[2px] border transition-all cursor-pointer ${
                  colorTheme === 'mono' ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-zinc-700'
                }`}
                style={{ backgroundColor: '#000000' }}
                title="Monocromo Térmico / Alto Contraste"
              />
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Product Mini Banner */}
          <div className="flex items-center gap-3 p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 shadow-xs">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 rounded-[2px] object-cover bg-zinc-950 shrink-0 border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black">
                  {brand}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-300">
                  {isMachine ? `MOD. ${identifier}` : `P/N: ${identifier}`}
                </span>
                <RecentlyVerifiedBadge
                  itemId={product.id}
                  itemCode={identifier}
                  itemType={type}
                  variant="card-badge"
                />
              </div>
              <h4 className="font-bold text-xs text-white truncate uppercase">
                {title}
              </h4>
              <p className="text-xs font-mono font-bold text-amber-400">
                US${priceUsd.toLocaleString()} • RD${priceDop.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Real-time Last Scanned Badge from inventory_logs */}
          <LastScannedBadge
            itemId={product.id}
            itemCode={identifier}
            itemType={type}
            showDetailsAccordion={true}
            showEmptyState={true}
          />

          {activeTab === 'qr' ? (
            <>
              {/* QR Code Presentation Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-[3px] border border-zinc-800 shadow-inner">
                <div className="relative p-3 bg-white rounded-[3px] shadow-xl border-2 border-amber-400/40">
                  {isGenerating ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center gap-2.5">
                      <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-bold text-zinc-600">Generando QR de alta definición...</span>
                    </div>
                  ) : qrDataUrl ? (
                    <img
                      id="rendered-product-qr-image"
                      src={qrDataUrl}
                      alt={`Código QR para ${title}`}
                      className="w-48 h-48 object-contain block mx-auto rounded-[2px]"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-rose-500 font-bold">
                      Error al generar código QR
                    </div>
                  )}

                  {/* Verified Badge */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-[2px] bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 text-black" />
                    <span>TMD Certificado RD</span>
                  </div>
                </div>

                <p className="text-[11px] text-center text-zinc-400 mt-4 max-w-sm flex items-center justify-center gap-1.5 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Apunta la cámara de cualquier smartphone para abrir la ficha interactiva.</span>
                </p>
              </div>

              {/* Direct URL Bar with Copy */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Enlace Directo del Producto
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-2.5 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 truncate select-all">
                    {mobileUrl}
                  </div>
                  <button
                    id="copy-product-qr-url-btn"
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer uppercase"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  id="download-product-warehouse-label-btn"
                  type="button"
                  onClick={() => setIsLabelSheetModalOpen(true)}
                  className="p-2 rounded-[2px] border border-amber-400 bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm uppercase"
                  title="Generar pliego PDF con múltiples etiquetas/rótulos para etiquetado masivo de almacén"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Pliego PDF Masivo</span>
                </button>

                <button
                  id="download-product-warehouse-single-label-btn"
                  type="button"
                  onClick={async () => {
                    await downloadProductQrCode(product, type);
                  }}
                  className="p-2 rounded-[2px] border border-amber-400/50 bg-amber-400/10 hover:bg-amber-400 hover:text-black text-amber-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase"
                  title="Descargar Rótulo QR PNG individual para etiquetado físico de almacén / patio"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Rótulo PNG</span>
                </button>

                <button
                  id="download-product-qr-btn"
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={!qrDataUrl}
                  className="p-2 rounded-[2px] border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs uppercase"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>QR Solo</span>
                </button>

                <button
                  id="download-product-qr-pdf-btn"
                  type="button"
                  onClick={handleDownloadPdfLabel}
                  disabled={!qrDataUrl}
                  className="p-2 rounded-[2px] border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs uppercase"
                  title="Generar ficha técnica en PDF para imprimir y colocar en patio o anaquel"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ficha PDF</span>
                </button>

                <button
                  id="share-product-qr-whatsapp-btn"
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-2 rounded-[2px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  id="open-product-qr-tab-btn"
                  type="button"
                  onClick={() => window.open(mobileUrl, '_blank')}
                  className="p-2 rounded-[2px] border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Probar Enlace</span>
                </button>
              </div>

              {/* Field & Yard Application Note */}
              <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                <HardHat className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-zinc-200 uppercase">Uso Operativo en Patio y Almacén:</strong> Imprime el rótulo o calcomanía QR para colocarlo en el parabrisas de las maquinarias en exhibición o en el anaquel de repuestos en el <strong>Km 22 Autopista Duarte</strong>. Los clientes y mecánicos de campo accederán a la ficha completa al instante sin necesidad de instalar aplicaciones.
                </p>
              </div>
            </>
          ) : activeTab === 'specs' ? (
            /* Specifications Preview Tab */
            <div className="space-y-3">
              <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Resumen de la Ficha Móvil
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {isMachine && machine ? (
                  <>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Motor Diésel</span>
                      <span className="font-bold text-white uppercase">{machine.engine}</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Potencia Nominal</span>
                      <span className="font-bold text-white font-mono">{machine.powerHp} HP</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Peso Operativo</span>
                      <span className="font-bold text-white font-mono">{machine.operatingWeightKg.toLocaleString()} kg</span>
                    </div>
                    {machine.bucketCapacityM3 && (
                      <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px] uppercase">Capacidad Cucharón</span>
                        <span className="font-bold text-white font-mono">{machine.bucketCapacityM3} m³</span>
                      </div>
                    )}
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Garantía Oficial</span>
                      <span className="font-bold text-white font-mono">{machine.warrantyMonths || 12} MESES</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Disponibilidad</span>
                      <span className="font-bold text-emerald-400 uppercase">Patio Central Km 22</span>
                    </div>
                  </>
                ) : part ? (
                  <>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Número de Parte (P/N)</span>
                      <span className="font-bold font-mono text-white">{part.partNumber}</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Categoría</span>
                      <span className="font-bold text-white uppercase">{part.category}</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800 sm:col-span-2">
                      <span className="text-zinc-500 block text-[10px] uppercase">Modelos Compatibles</span>
                      <span className="font-bold text-zinc-200 uppercase">{part.compatibleModels.join(', ')}</span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Inventario en Patio</span>
                      <span className="font-bold text-emerald-400 uppercase">
                        {part.stockQty > 0 ? `${part.stockQty} UNIDADES DISPONIBLES` : 'DISPONIBLE BAJO PEDIDO'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px] uppercase">Calidad Certificada</span>
                      <span className="font-bold text-amber-400 uppercase">OEM Genuino Directo</span>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Precio Oficial:</span>
                  <span className="font-black text-amber-400 text-sm font-mono">
                    US${priceUsd.toLocaleString()} • RD${priceDop.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(mobileUrl, '_blank')}
                  className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer uppercase"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Nueva Pestaña</span>
                </button>
              </div>
            </div>
          ) : (
            /* Audit Trail Tab - Last 3 Scans from inventory_logs */
            <div className="space-y-3 animate-in fade-in duration-150">
              <InventoryAuditTrail
                itemId={product.id}
                itemCode={identifier}
                itemName={title}
                itemType={type}
                maxEvents={3}
              />
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            TMD Dominicana • Catálogo Inteligente 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer uppercase"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Mass Inventory Labeling PDF Sheet Modal */}
      <InventoryLabelPdfModal
        isOpen={isLabelSheetModalOpen}
        onClose={() => setIsLabelSheetModalOpen(false)}
        product={product}
        type={type}
      />
    </div>,
    document.body
  );
};
