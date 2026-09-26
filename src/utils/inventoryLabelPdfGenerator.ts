import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Machine, Part } from '../types';
import { getProductMobileUrl } from './qrExporter';
import { drawTmdOfficialLogoPdf } from './pdfGenerator';

export type LabelSheetFormat = 'single_placard' | 'grid_6' | 'grid_8' | 'grid_12';

export interface LabelPdfOptions {
  sheetFormat?: LabelSheetFormat;
  includeFacilityZone?: boolean;
  facilityZone?: string;
  copies?: number;
  includeTimestamp?: boolean;
  includeBorder?: boolean;
}

/**
 * Computes or formats the official SKU identification code for warehouse inventory
 */
export function getProductSku(product: Machine | Part, type: 'machinery' | 'part'): string {
  if (product.sku) return product.sku.toUpperCase();
  const brand = (product.brand || 'TMD').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (type === 'machinery') {
    const machine = product as Machine;
    const model = (machine.modelCode || machine.id).toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `TMD-EQ-${brand}-${model}`;
  } else {
    const part = product as Part;
    const pnum = (part.partNumber || part.id).toUpperCase().replace(/[^A-Z0-9]/g, '');
    return `TMD-PT-${brand}-${pnum}`;
  }
}

/**
 * Generates an industrial-grade PDF document formatted for mass inventory labeling,
 * warehouse rack stickers, and heavy machinery yard placards.
 */
export async function generateInventoryLabelPdf(
  product: Machine | Part,
  type: 'machinery' | 'part',
  options: LabelPdfOptions = {}
): Promise<jsPDF> {
  const isMachine = type === 'machinery';
  const machine = isMachine ? (product as Machine) : null;
  const part = !isMachine ? (product as Part) : null;

  const {
    sheetFormat = 'grid_6',
    includeFacilityZone = true,
    facilityZone = isMachine ? 'Patio Central Km 22 • Flota Pesada' : 'Almacén Central • Racks OEM',
    copies = 1,
    includeTimestamp = true,
    includeBorder = true
  } = options;

  const brand = (product.brand || 'TMD').toUpperCase();
  const internalId = product.id;
  const skuCode = getProductSku(product, type);
  const identifierCode = isMachine 
    ? (machine?.modelCode || machine?.id || 'EQUIPO')
    : (part?.partNumber || part?.id || 'REPUESTO');
  const internalCodeLabel = isMachine ? `MOD. ${identifierCode}` : `P/N: ${identifierCode}`;
  const title = product.name;
  const category = isMachine ? (machine?.category || 'MAQUINARIA') : (part?.category || 'REPUESTOS');

  // Compute canonical URL for scanning
  const mobileUrl = getProductMobileUrl(product, type);

  // Generate crisp QR code data URL (High Error Correction 'H' for durable warehouse scans)
  const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
    width: 600,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });

  // Create A4 PDF (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const nowStr = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // =========================================================================
  // OPTION 1: SINGLE LARGE PLACARD (A4 Full Hangar / Machine Placard)
  // =========================================================================
  if (sheetFormat === 'single_placard') {
    for (let copy = 0; copy < copies; copy++) {
      if (copy > 0) doc.addPage();

      // Outer Hazard Border
      if (includeBorder) {
        doc.setDrawColor(245, 158, 11); // Amber
        doc.setLineWidth(1.5);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

        doc.setDrawColor(24, 24, 27); // Zinc-900
        doc.setLineWidth(0.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      }

      // Top Hazard Header
      doc.setFillColor(245, 158, 11);
      doc.rect(10, 10, pageWidth - 20, 8, 'F');

      // Top Industrial Header Bar
      doc.setFillColor(24, 24, 27);
      doc.rect(10, 18, pageWidth - 20, 24, 'F');

      // Official TMD Logo matching homepage
      drawTmdOfficialLogoPdf(doc, 15, 21, 46, 17);

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('TECNOMAQUINARIAS DIESEL S.R.L.', 66, 29);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont('courier', 'bold');
      doc.text('RÓTULO OFICIAL DE ALMACÉN & TRAZABILIDAD INDUSTRIAL • PATIO KM 22', 66, 36);

      // Code Identification Header Box
      doc.setFillColor(244, 244, 245);
      doc.rect(15, 47, pageWidth - 30, 36, 'F');
      doc.setDrawColor(212, 212, 216);
      doc.setLineWidth(0.5);
      doc.rect(15, 47, pageWidth - 30, 36, 'D');

      doc.setTextColor(24, 24, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(brand, 20, 56);

      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122);
      doc.text(category.toUpperCase(), pageWidth - 20, 56, { align: 'right' });

      // Internal Identification Code (Big Emphasis)
      doc.setTextColor(180, 83, 9); // Rich Amber/Brown
      doc.setFont('courier', 'bold');
      doc.setFontSize(19);
      doc.text(internalCodeLabel, 20, 67);

      // SKU Identification Code (Prominently Highlighted)
      doc.setFillColor(24, 24, 27);
      doc.rect(20, 71, 95, 8, 'F');
      doc.setTextColor(245, 158, 11);
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.text(`SKU: ${skuCode}`, 23, 76.5);

      doc.setFontSize(9);
      doc.setTextColor(82, 82, 91);
      doc.text(`ID: ${internalId}`, 120, 76.5);

      if (includeFacilityZone) {
        doc.setFontSize(9);
        doc.setTextColor(39, 39, 42);
        doc.text(`UBICACIÓN: ${facilityZone.toUpperCase()}`, pageWidth - 20, 76.5, { align: 'right' });
      }

      // Massive Central QR Code
      const qrSize = 118;
      const qrX = (pageWidth - qrSize) / 2;
      const qrY = 88;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.rect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6);
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      // Product Title Box below QR
      doc.setFillColor(250, 250, 250);
      doc.rect(15, 215, pageWidth - 30, 30, 'F');
      doc.setDrawColor(228, 228, 231);
      doc.rect(15, 215, pageWidth - 30, 30, 'D');

      doc.setTextColor(9, 9, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);

      const splitTitle = doc.splitTextToSize(title.toUpperCase(), pageWidth - 40);
      doc.text(splitTitle, pageWidth / 2, 224, { align: 'center' });

      // Instruction & Barcode Notice
      doc.setTextColor(113, 113, 122);
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.text('ESCANEAR CON COLECTOR DE DATOS TMD O CÁMARA MÓVIL', pageWidth / 2, 252, { align: 'center' });
      doc.text(`URL: ${mobileUrl}`, pageWidth / 2, 257, { align: 'center' });

      // Footer Meta
      if (includeTimestamp) {
        doc.setFontSize(8);
        doc.setTextColor(161, 161, 170);
        doc.text(`RÓTULO IMPRESO: ${nowStr} • SISTEMA TMD ERP AUTO-SYNC`, pageWidth / 2, 275, { align: 'center' });
      }

      // Bottom Hazard Stripe
      doc.setFillColor(245, 158, 11);
      doc.rect(10, pageHeight - 16, pageWidth - 20, 6, 'F');
    }

    return doc;
  }

  // =========================================================================
  // OPTION 2: MULTI-LABEL GRID SHEETS (2x3 = 6 labels, 2x4 = 8 labels, 3x4 = 12 labels)
  // =========================================================================
  const gridConfigs = {
    grid_6: { cols: 2, rows: 3, labelsPerPage: 6 },
    grid_8: { cols: 2, rows: 4, labelsPerPage: 8 },
    grid_12: { cols: 3, rows: 4, labelsPerPage: 12 }
  };

  const currentGrid = gridConfigs[sheetFormat] || gridConfigs.grid_6;
  const { cols, rows, labelsPerPage } = currentGrid;

  const totalLabels = copies * labelsPerPage;
  const marginX = 10;
  const marginY = 12;
  const gapX = 6;
  const gapY = 6;

  const labelWidth = (pageWidth - 2 * marginX - (cols - 1) * gapX) / cols;
  const labelHeight = (pageHeight - 2 * marginY - (rows - 1) * gapY) / rows;

  let labelCount = 0;

  for (let l = 0; l < totalLabels; l++) {
    const pageIndex = Math.floor(l / labelsPerPage);
    const labelInPage = l % labelsPerPage;

    if (labelInPage === 0 && pageIndex > 0) {
      doc.addPage();
    }

    const colIndex = labelInPage % cols;
    const rowIndex = Math.floor(labelInPage / cols);

    const x = marginX + colIndex * (labelWidth + gapX);
    const y = marginY + rowIndex * (labelHeight + gapY);

    // Draw Label Box
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, labelWidth, labelHeight, 'F');

    if (includeBorder) {
      doc.setDrawColor(212, 212, 216);
      doc.setLineWidth(0.4);
      doc.rect(x, y, labelWidth, labelHeight, 'D');

      // Top Amber Accent Strip
      doc.setFillColor(245, 158, 11);
      doc.rect(x, y, labelWidth, 3, 'F');
    }

    // Header strip
    doc.setFillColor(24, 24, 27);
    doc.rect(x, y + 3, labelWidth, 10, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 8 : 10);
    doc.text('TMD DOMINICANA', x + 3, y + 9.5);

    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 6 : 7);
    doc.text('KM 22', x + labelWidth - 3, y + 9.5, { align: 'right' });

    // Left QR Code vs Right Info Layout
    const qrSizeMm = sheetFormat === 'grid_12' ? 24 : sheetFormat === 'grid_8' ? 32 : 38;
    const qrPosX = x + 3;
    const qrPosY = y + 16;

    // Draw QR Code
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(qrPosX - 0.5, qrPosY - 0.5, qrSizeMm + 1, qrSizeMm + 1, 'D');
    doc.addImage(qrDataUrl, 'PNG', qrPosX, qrPosY, qrSizeMm, qrSizeMm);

    // Right Details Box
    const infoX = qrPosX + qrSizeMm + 4;
    const infoWidth = labelWidth - (qrSizeMm + 7);

    // Brand & Category
    doc.setTextColor(9, 9, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 7.5 : 9.5);
    doc.text(brand, infoX, y + 18);

    doc.setFontSize(sheetFormat === 'grid_12' ? 5.5 : 6.5);
    doc.setTextColor(113, 113, 122);
    doc.text(category.slice(0, 16).toUpperCase(), x + labelWidth - 3, y + 18, { align: 'right' });

    // Internal Identification Code (Prominent)
    doc.setTextColor(180, 83, 9);
    doc.setFont('courier', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 8.5 : 11);
    doc.text(internalCodeLabel, infoX, y + (sheetFormat === 'grid_12' ? 23.5 : 25));

    // SKU Code Tag
    doc.setTextColor(24, 24, 27);
    doc.setFont('courier', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 6 : 7.5);
    doc.text(`SKU: ${skuCode}`, infoX, y + (sheetFormat === 'grid_12' ? 28 : 30.5));

    // Internal UUID / Database ID
    doc.setTextColor(113, 113, 122);
    doc.setFont('courier', 'normal');
    doc.setFontSize(sheetFormat === 'grid_12' ? 5 : 6);
    doc.text(`ID: ${internalId.slice(0, 14)}`, infoX, y + (sheetFormat === 'grid_12' ? 32 : 35));

    // Product Title
    doc.setTextColor(24, 24, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 6 : 7.5);
    const splitSubTitle = doc.splitTextToSize(title.toUpperCase(), infoWidth);
    doc.text(splitSubTitle.slice(0, 2), infoX, y + (sheetFormat === 'grid_12' ? 36.5 : 41));

    // Bottom Zone and Timestamp
    doc.setFillColor(244, 244, 245);
    doc.rect(x + 1, y + labelHeight - 8, labelWidth - 2, 7, 'F');

    doc.setTextColor(39, 39, 42);
    doc.setFont('courier', 'bold');
    doc.setFontSize(sheetFormat === 'grid_12' ? 5 : 6.5);
    doc.text(facilityZone.slice(0, 30).toUpperCase(), x + 3, y + labelHeight - 3.5);

    if (includeTimestamp) {
      doc.setTextColor(113, 113, 122);
      doc.text(nowStr.slice(0, 10), x + labelWidth - 3, y + labelHeight - 3.5, { align: 'right' });
    }

    labelCount++;
  }

  return doc;
}

/**
 * Convenience helper to download the generated PDF directly in the browser
 */
export async function downloadInventoryLabelPdf(
  product: Machine | Part,
  type: 'machinery' | 'part',
  options: LabelPdfOptions = {}
): Promise<void> {
  const doc = await generateInventoryLabelPdf(product, type, options);
  const isMachine = type === 'machinery';
  const machine = isMachine ? (product as Machine) : null;
  const part = !isMachine ? (product as Part) : null;

  const brand = (product.brand || 'TMD').replace(/[^a-zA-Z0-9_-]/g, '_');
  const rawCode = isMachine ? (machine?.modelCode || machine?.id) : (part?.partNumber || part?.id);
  const code = (rawCode || product.id || 'ITEM').replace(/[^a-zA-Z0-9_-]/g, '_');
  const formatName = options.sheetFormat || 'grid_6';
  
  const filename = `ROTULOS_INVENTARIO_TMD_${brand}_${code}_${formatName}.pdf`;
  doc.save(filename);
}

/**
 * Convenience helper to open the printable PDF in a new tab for native browser printing
 */
export async function printInventoryLabelPdf(
  product: Machine | Part,
  type: 'machinery' | 'part',
  options: LabelPdfOptions = {}
): Promise<void> {
  const doc = await generateInventoryLabelPdf(product, type, options);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
