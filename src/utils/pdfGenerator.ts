import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PortalQuote, Machine, CustomerPurchaseOrder } from '../types';
import { USD_TO_DOP_RATE, MACHINES_DATA } from '../data/catalog';

export interface ExportQuotePdfOptions {
  quote: PortalQuote;
  selectedMachine?: Machine | null;
  customerNotes?: string;
  paymentMethod?: string;
  deliveryLocation?: string;
  includeSpecs?: boolean;
}

export const generateQuotePDF = (options: ExportQuotePdfOptions): jsPDF => {
  const { 
    quote, 
    selectedMachine, 
    customerNotes, 
    paymentMethod = 'Transferencia Bancaria / Leasing Comercial',
    deliveryLocation = 'Patio Central Km 22, Autopista Duarte / Entrega en Obra RD',
    includeSpecs = true 
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const brandAmber: [number, number, number] = [245, 158, 11]; // #f59e0b
  const brandDark: [number, number, number] = [24, 24, 27];   // #18181b
  const brandGray: [number, number, number] = [113, 113, 122]; // #71717a
  const brandLightBg: [number, number, number] = [244, 244, 245]; // #f4f4f5

  // 1. TOP HEADER ACCENT BAR
  doc.setFillColor(...brandAmber);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Title & Logo Box
  doc.setFillColor(...brandDark);
  doc.roundedRect(margin, 10, 36, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TMD', margin + 6, 20);
  doc.setTextColor(...brandAmber);
  doc.setFontSize(7.5);
  doc.text('DOMINICANA', margin + 6, 24);

  // Company Contact Details (Right side of header)
  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TMD MAQUINARIA PESADA DOMINICANA S.R.L.', pageWidth - margin, 14, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...brandGray);
  doc.text('RNC: 1-31-89024-5 | Distribuidor Autorizado LiuGong, JCB & LS Tractor', pageWidth - margin, 18.5, { align: 'right' });
  doc.text('Autopista Duarte Km 22, Santo Domingo Oeste, República Dominicana', pageWidth - margin, 22.5, { align: 'right' });
  doc.text('Tel: +1 (809) 560-1234 | WhatsApp: +1 (829) 555-0199 | www.tmd.com.do', pageWidth - margin, 26.5, { align: 'right' });

  // Divider Line
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);

  // 2. DOCUMENT TITLE & QUOTE METADATA BADGE
  let currentY = 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...brandDark);
  doc.text('COTIZACIÓN PROFORMA COMERCIAL', margin, currentY);

  // Quote Number Badge on the Right
  doc.setFillColor(...brandLightBg);
  doc.roundedRect(pageWidth - margin - 60, currentY - 5.5, 60, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(...brandAmber);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 60, currentY - 5.5, 60, 10, 1.5, 1.5, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text(`N°: ${quote.quoteNumber || 'COT-2026-TMD'}`, pageWidth - margin - 30, currentY + 1, { align: 'center' });

  currentY += 8;

  // 3. TWO-COLUMN INFO BOXES: CLIENT DATA & QUOTE DETAILS
  const colWidth = (pageWidth - margin * 2 - 6) / 2;
  const boxHeight = 32;

  // Client Info Box
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, colWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, colWidth, boxHeight, 2, 2, 'D');

  // Title bar of client box
  doc.setFillColor(...brandDark);
  doc.rect(margin, currentY, colWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DATOS DEL CLIENTE / CONTRATISTA', margin + 4, currentY + 4.2);

  doc.setTextColor(...brandDark);
  doc.setFontSize(8);
  const clientY = currentY + 10.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente / Empresa:', margin + 4, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.companyName || quote.clientName || 'Cliente Particular', margin + 34, clientY);

  doc.setFont('helvetica', 'bold');
  doc.text('Contacto:', margin + 4, clientY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.clientName || 'Ing. Encargado de Obra', margin + 34, clientY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Email / Tel:', margin + 4, clientY + 9);
  doc.setFont('helvetica', 'normal');
  const emailPhone = `${quote.clientEmail || 'N/A'}${quote.phone ? ` | ${quote.phone}` : ''}`;
  doc.text(emailPhone.length > 35 ? emailPhone.substring(0, 32) + '...' : emailPhone, margin + 34, clientY + 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Lugar Entrega:', margin + 4, clientY + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.text(deliveryLocation.length > 36 ? deliveryLocation.substring(0, 34) + '...' : deliveryLocation, margin + 34, clientY + 13.5);

  // Quote Metadata Box (Right)
  const rightBoxX = margin + colWidth + 6;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(rightBoxX, currentY, colWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(rightBoxX, currentY, colWidth, boxHeight, 2, 2, 'D');

  doc.setFillColor(...brandAmber);
  doc.rect(rightBoxX, currentY, colWidth, 6, 'F');
  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CONDICIONES DE LA COTIZACIÓN', rightBoxX + 4, currentY + 4.2);

  const quoteInfoY = currentY + 10.5;
  doc.setTextColor(...brandDark);
  doc.setFontSize(8);

  const formattedDate = new Date(quote.createdAt || Date.now()).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const validUntil = new Date(new Date(quote.createdAt || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha de Emisión:', rightBoxX + 4, quoteInfoY);
  doc.setFont('helvetica', 'normal');
  doc.text(formattedDate, rightBoxX + 34, quoteInfoY);

  doc.setFont('helvetica', 'bold');
  doc.text('Validez Oferta:', rightBoxX + 4, quoteInfoY + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${validUntil} (30 días)`, rightBoxX + 34, quoteInfoY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Moneda / Tasa:', rightBoxX + 4, quoteInfoY + 9);
  doc.setFont('helvetica', 'normal');
  doc.text(`USD Dólares (Ref: 1 USD = RD$ ${USD_TO_DOP_RATE.toFixed(2)})`, rightBoxX + 34, quoteInfoY + 9);

  doc.setFont('helvetica', 'bold');
  doc.text('Forma de Pago:', rightBoxX + 4, quoteInfoY + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentMethod.length > 34 ? paymentMethod.substring(0, 32) + '...' : paymentMethod, rightBoxX + 34, quoteInfoY + 13.5);

  currentY += boxHeight + 6;

  // 4. ITEMS / MACHINERY TABLE
  let tableRows: (string | number)[][] = [];

  if (selectedMachine) {
    const unitPrice = selectedMachine.basePriceUsd || (quote.subtotal > 0 ? quote.subtotal : 85000);
    tableRows.push([
      '01',
      `${selectedMachine.name}\nMarca: ${selectedMachine.brand} | Mod: ${selectedMachine.modelCode || '2026'}\nMotor: ${selectedMachine.engine || 'Diesel Turbo'} | Potencia: ${selectedMachine.powerHp || 92} HP\nPeso Operativo: ${(selectedMachine.operatingWeightKg || 8000).toLocaleString()} kg`,
      '1',
      `US$ ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `US$ ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    if (quote.itemsSummary && quote.itemsSummary.toLowerCase().includes('kit')) {
      tableRows.push([
        '02',
        'Kit de Mantenimiento Preventivo 500h Original (Filtros OEM + Lubricantes)',
        '1',
        'US$ 850.00',
        'US$ 850.00'
      ]);
    }
  } else {
    const items = quote.itemsSummary ? quote.itemsSummary.split('+').map(s => s.trim()) : ['Maquinaria Pesada / Repuestos TMD'];
    items.forEach((itemText, idx) => {
      const isFirst = idx === 0;
      const amount = isFirst ? (quote.subtotal || quote.total / 1.18) : 0;
      tableRows.push([
        String(idx + 1).padStart(2, '0'),
        `${itemText}\nSuministrado por TMD Dominicana con garantía oficial y soporte técnico en campo.`,
        '1',
        `US$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `US$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
    });
  }

  // AutoTable
  autoTable(doc, {
    startY: currentY,
    head: [['ITEM', 'DESCRIPCIÓN DE LA MAQUINARIA / EQUIPOS / REPUESTOS', 'CANT.', 'PRECIO UNIT. (USD)', 'TOTAL (USD)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: brandDark,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      cellPadding: 3
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14, fontSize: 8 },
      1: { halign: 'left', cellWidth: 'auto', fontSize: 8 },
      2: { halign: 'center', cellWidth: 16, fontSize: 8 },
      3: { halign: 'right', cellWidth: 36, fontSize: 8 },
      4: { halign: 'right', cellWidth: 36, fontSize: 8, fontStyle: 'bold' }
    },
    styles: {
      lineColor: [228, 228, 231],
      lineWidth: 0.2,
      cellPadding: 3.5,
      textColor: [39, 39, 42]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    }
  });

  // @ts-expect-error jspdf-autotable dynamic property
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 4;

  // 5. TOTALS AND TAX SUMMARY BOX
  const totalsBoxWidth = 80;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const subtotal = quote.subtotal || Math.round(quote.total / 1.18);
  const itbis = quote.itbis || Math.round(subtotal * 0.18);
  const total = quote.total || (subtotal + itbis);
  const totalDop = total * USD_TO_DOP_RATE;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 28, 2, 2, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(totalsBoxX, currentY, totalsBoxWidth, 28, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...brandGray);
  doc.text('Subtotal:', totalsBoxX + 4, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text(`US$ ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...brandGray);
  doc.text('ITBIS (18% Ley 11-92):', totalsBoxX + 4, currentY + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text(`US$ ${itbis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 4, currentY + 11, { align: 'right' });

  // Total Bar
  doc.setFillColor(...brandAmber);
  doc.roundedRect(totalsBoxX + 2, currentY + 14, totalsBoxWidth - 4, 11, 1.5, 1.5, 'F');
  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL COTIZADO:', totalsBoxX + 5, currentY + 21);
  doc.setFontSize(10);
  doc.text(`US$ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 5, currentY + 21, { align: 'right' });

  // Notes on the left side of totals
  const notesWidth = pageWidth - margin * 2 - totalsBoxWidth - 8;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, notesWidth, 28, 2, 2, 'F');
  doc.setDrawColor(228, 228, 231);
  doc.roundedRect(margin, currentY, notesWidth, 28, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandDark);
  doc.text('OBSERVACIONES & VALOR EN MONEDA NACIONAL:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandGray);
  doc.text(`• Equivalente aproximado en Pesos Dominicanos: RD$ ${totalDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`, margin + 4, currentY + 10);
  doc.text(`• Incluye entrega técnica y capacitación de operador en obra.`, margin + 4, currentY + 14.5);
  doc.text(`• ${customerNotes || quote.notes || 'Equipos sujetos a disponibilidad de inventario en patio Km 22.'}`, margin + 4, currentY + 19);
  doc.text(`• Emisión con Comprobante Fiscal (NCF) para Crédito Fiscal.`, margin + 4, currentY + 23.5);

  currentY += 34;

  // 6. TECHNICAL SPECS BOX
  if (includeSpecs && selectedMachine?.specs && selectedMachine.specs.length > 0 && currentY < pageHeight - 55) {
    doc.setFillColor(...brandLightBg);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'F');
    doc.setDrawColor(228, 228, 231);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...brandDark);
    doc.text(`ESPECIFICACIONES TÉCNICAS DESTACADAS (${selectedMachine.brand} ${selectedMachine.name}):`, margin + 4, currentY + 4.5);

    const specsToRender = selectedMachine.specs.slice(0, 4);
    const specColWidth = (pageWidth - margin * 2 - 8) / 2;
    specsToRender.forEach((spec, sIdx) => {
      const col = sIdx % 2;
      const row = Math.floor(sIdx / 2);
      const specX = margin + 4 + col * specColWidth;
      const specY = currentY + 10 + row * 5.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...brandDark);
      doc.text(`• ${spec.label}:`, specX, specY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...brandGray);
      doc.text(spec.value, specX + 42, specY);
    });

    currentY += 26;
  }

  // 7. TERMS & SIGNATURE BLOCK
  const bottomY = pageHeight - 34;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandDark);
  doc.text('GARANTÍA & RESPALDO TÉCNICO OFICIAL TMD:', margin, bottomY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...brandGray);
  doc.text('Garantía de 2 Años o 3,000 Horas operativas (lo que ocurra primero). Incluye primer servicio técnico en campo gratuito (mano de obra)', margin, bottomY + 3.5);
  doc.text('y stock permanente de repuestos genuinos OEM en nuestros talleres centrales del Km 22 de la Autopista Duarte.', margin, bottomY + 6.8);

  const sigY = pageHeight - 14;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  // Left signature
  doc.line(margin + 15, sigY, margin + 75, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandDark);
  doc.text('ING. GERENCIA DE VENTAS & MAQUINARIA', margin + 45, sigY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...brandGray);
  doc.text('TMD Dominicana S.R.L. - Departamento Comercial', margin + 45, sigY + 6.5, { align: 'center' });

  // Right signature
  const rightSigX = pageWidth - margin - 75;
  doc.line(rightSigX, sigY, rightSigX + 60, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandDark);
  doc.text('FIRMA / SELLO DE CONFORMIDAD DEL CLIENTE', rightSigX + 30, sigY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...brandGray);
  doc.text('Aceptación de Términos y Especificaciones Proforma', rightSigX + 30, sigY + 6.5, { align: 'center' });

  // Footer Bottom Line
  doc.setFillColor(...brandAmber);
  doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, 'F');

  return doc;
};

export const downloadQuotePDF = (options: ExportQuotePdfOptions, filename?: string) => {
  const doc = generateQuotePDF(options);
  const safeFilename = filename || `Cotizacion_${options.quote.quoteNumber || 'TMD'}.pdf`;
  doc.save(safeFilename);
};

export const downloadOrderInvoicePDF = (order: CustomerPurchaseOrder, filename?: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const brandAmber: [number, number, number] = [245, 158, 11];
  const brandDark: [number, number, number] = [24, 24, 27];
  const brandGray: [number, number, number] = [113, 113, 122];

  // Top header accent
  doc.setFillColor(...brandAmber);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Logo Box
  doc.setFillColor(...brandDark);
  doc.roundedRect(margin, 10, 36, 16, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TMD', margin + 6, 20);
  doc.setTextColor(...brandAmber);
  doc.setFontSize(7.5);
  doc.text('DOMINICANA', margin + 6, 24);

  // Company info
  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TMD MAQUINARIA PESADA DOMINICANA S.R.L.', pageWidth - margin, 14, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...brandGray);
  doc.text('RNC: 1-31-89024-5 | Facturación con Comprobante Fiscal DGII', pageWidth - margin, 18.5, { align: 'right' });
  doc.text('Autopista Duarte Km 22, Santo Domingo Oeste, R.D. | Tel: +1 (809) 560-1234', pageWidth - margin, 22.5, { align: 'right' });

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);

  let currentY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brandDark);
  doc.text('FACTURA COMERCIAL / COMPROBANTE DE ORDEN', margin, currentY);

  doc.setFontSize(8.5);
  doc.text(`ORDEN: ${order.orderNumber}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 8;

  // Metadata boxes
  const colW = (pageWidth - margin * 2 - 6) / 2;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, colW, 26, 2, 2, 'F');
  doc.roundedRect(margin + colW + 6, currentY, colW, 26, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text('DATOS DEL CLIENTE / RECEPTOR:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${order.clientName || 'Cliente TMD'}`, margin + 4, currentY + 11);
  doc.text(`Email: ${order.clientEmail || 'N/A'}`, margin + 4, currentY + 16);
  doc.text(`RNC / Cédula: ${order.rncOrCedula || 'Consumidor Final'}`, margin + 4, currentY + 21);

  const rX = margin + colW + 6;
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN FISCAL & PAGO:', rX + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo NCF: ${order.ncfType || 'B02 Consumidor Final'}`, rX + 4, currentY + 11);
  doc.text(`NCF: ${order.ncfNumber || 'E310000049281'}`, rX + 4, currentY + 16);
  doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-DO')}`, rX + 4, currentY + 21);

  currentY += 32;

  // Items table
  const rows = order.items.map((item, idx) => [
    String(idx + 1).padStart(2, '0'),
    `${item.name}\nCódigo OEM: ${item.partNumber || 'GENUINE-TMD'} | Marca: ${item.brand}`,
    item.quantity,
    `US$ ${item.priceUsd.toFixed(2)}`,
    `US$ ${(item.priceUsd * item.quantity).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'DESCRIPCIÓN DEL REPUESTO / PIEZA OEM', 'CANT', 'P. UNIT (USD)', 'TOTAL (USD)']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: brandDark,
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 32, fontStyle: 'bold' }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // @ts-expect-error autoTable finalY
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 6;

  // Totals box
  const tW = 75;
  const tX = pageWidth - margin - tW;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(tX, currentY, tW, 26, 2, 2, 'F');
  doc.roundedRect(tX, currentY, tW, 26, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', tX + 4, currentY + 6);
  doc.text(`US$ ${order.subtotalUsd.toFixed(2)}`, pageWidth - margin - 4, currentY + 6, { align: 'right' });

  doc.text('ITBIS (18%):', tX + 4, currentY + 12);
  doc.text(`US$ ${order.itbisUsd.toFixed(2)}`, pageWidth - margin - 4, currentY + 12, { align: 'right' });

  doc.setFillColor(...brandAmber);
  doc.roundedRect(tX + 2, currentY + 15, tW - 4, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', tX + 4, currentY + 21);
  doc.text(`US$ ${order.totalUsd.toFixed(2)}`, pageWidth - margin - 4, currentY + 21, { align: 'right' });

  // Signature and guarantee note
  const bY = pageHeight - 24;
  doc.setFontSize(7);
  doc.setTextColor(...brandGray);
  doc.setFont('helvetica', 'normal');
  doc.text('Repuestos genuinos respaldados por garantía oficial TMD Dominicana y asistencia de taller móvil.', margin, bY);
  doc.text('Para reclamos o soporte técnico en obra, comuníquese al +1 (809) 560-1234 con su número de orden.', margin, bY + 4);

  doc.setFillColor(...brandAmber);
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

  const safeName = filename || `Factura_${order.orderNumber}.pdf`;
  doc.save(safeName);
};
