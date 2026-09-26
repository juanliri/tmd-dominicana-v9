import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine, Part } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { drawTmdOfficialLogoPdf } from '../utils/pdfGenerator';

export interface ExportMachineryPdfOptions {
  machines: Machine[];
  category?: string;
  brand?: string;
  searchTerm?: string;
  clientName?: string;
  salespersonName?: string;
  includePrices?: boolean;
}

export interface ExportPartsPdfOptions {
  parts: Part[];
  category?: string;
  searchTerm?: string;
  clientName?: string;
  salespersonName?: string;
  includePrices?: boolean;
}

export const generateMachineryCatalogPdf = (options: ExportMachineryPdfOptions): jsPDF => {
  const {
    machines,
    category = 'Todas',
    brand = 'Todas',
    searchTerm = '',
    clientName = '',
    salespersonName = 'Equipo Comercial TMD',
    includePrices = true
  } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Top Accent Bar (TMD Amber #F59E0B)
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Banner Background (Dark Slate #0F172A)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, pageWidth, 28, 'F');

  // Official TMD Chevron Logo matching homepage
  drawTmdOfficialLogoPdf(doc, 14, 9, 42, 15);

  // Title & Brand info alongside logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TECNOMAQUINARIAS DIESEL DOMINICANA', 60, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text('DISTRIBUIDOR AUTORIZADO DE MAQUINARIA PESADA Y AGROINDUSTRIAL', 60, 21.5);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Km 22 Autopista Duarte, Santo Domingo Oeste | Tel: +1 (809) 560-1234 | info@tmd.com.do', 60, 27);

  // Document metadata on right side of header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('CATÁLOGO COMERCIAL DE EQUIPOS', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha: ${currentDate}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Total de Equipos: ${machines.length}`, pageWidth - 14, 28, { align: 'right' });

  // Presentation metadata section
  const yPos = 38;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 18, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARADO PARA:', 18, yPos + 6);
  doc.text('ASESOR DE VENTAS:', 120, yPos + 6);
  doc.text('FILTROS APLICADOS:', 210, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName ? clientName.toUpperCase() : 'PRESENTACIÓN CORPORATIVA A CLIENTES', 18, yPos + 12);
  doc.text(salespersonName, 120, yPos + 12);

  const filterSummary = [
    brand !== 'Todas' ? `Marca: ${brand}` : null,
    category !== 'Todas' ? `Cat: ${category}` : null,
    searchTerm ? `Búsqueda: "${searchTerm}"` : null
  ].filter(Boolean).join(' | ') || 'Catálogo General Completo';

  doc.text(filterSummary, 210, yPos + 12);

  // Prepare table rows
  const tableRows = machines.map((machine, index) => {
    const priceUsd = machine.basePriceUsd || 0;
    const priceDop = Math.round(priceUsd * USD_TO_DOP_RATE);

    const priceCell = includePrices
      ? `US$ ${priceUsd.toLocaleString()}\n(RD$ ${priceDop.toLocaleString()})`
      : 'Consultar Cotización';

    const keySpecs: string[] = [];
    if (machine.powerHp) keySpecs.push(`Potencia: ${machine.powerHp} HP`);
    if (machine.operatingWeightKg) keySpecs.push(`Peso: ${(machine.operatingWeightKg / 1000).toFixed(1)} Ton`);
    if (machine.engine) keySpecs.push(`Motor: ${machine.engine}`);
    if (machine.bucketCapacityM3) keySpecs.push(`Balde: ${machine.bucketCapacityM3} m³`);

    if (keySpecs.length === 0 && Array.isArray(machine.specs)) {
      machine.specs.slice(0, 3).forEach((s) => keySpecs.push(`${s.label}: ${s.value}`));
    }

    const specsSummary = keySpecs.join(' | ') || machine.description.slice(0, 85) + '...';

    return [
      String(index + 1),
      machine.brand.toUpperCase(),
      machine.name,
      machine.modelCode || 'N/A',
      machine.category,
      specsSummary,
      priceCell,
      machine.inStock ? 'DISPONIBLE\nEntrega Inmediata' : 'BAJO PEDIDO\nImportación'
    ];
  });

  autoTable(doc, {
    startY: yPos + 22,
    head: [[
      '#',
      'Marca',
      'Nombre del Equipo',
      'Modelo',
      'Categoría',
      'Especificaciones Técnicas Clave',
      'Inversión Estimada',
      'Disponibilidad'
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      cellPadding: 3
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      2: { fontStyle: 'bold', cellWidth: 46 },
      3: { halign: 'center', fontStyle: 'bold', cellWidth: 22 },
      4: { cellWidth: 28 },
      5: { cellWidth: 78, fontSize: 7.5 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 36, textColor: [180, 83, 9] },
      7: { halign: 'center', fontSize: 7, cellWidth: 28 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: (data) => {
      const totalPages = doc.getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');

      // Left Footer
      doc.text(
        'TMD Dominicana • Precios sujetos a confirmación y disponibilidad de inventario • Garantía oficial y soporte en taller central Km 22',
        14,
        pageHeight - 6
      );

      // Right Footer: Page number
      doc.text(
        `Página ${data.pageNumber} de ${totalPages}`,
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    }
  });

  return doc;
};

export const generatePartsCatalogPdf = (options: ExportPartsPdfOptions): jsPDF => {
  const {
    parts,
    category = 'Todos',
    searchTerm = '',
    clientName = '',
    salespersonName = 'División de Repuestos TMD',
    includePrices = true
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currentDate = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Top Accent Bar
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Banner Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, pageWidth, 28, 'F');

  // Official TMD Chevron Logo matching homepage
  drawTmdOfficialLogoPdf(doc, 14, 9, 42, 15);

  // Title & Brand info alongside logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TECNOMAQUINARIAS DIESEL DOMINICANA', 60, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11);
  doc.text('DIVISIÓN DE REPUESTOS Y COMPONENTES OEM GENUINOS', 60, 21.5);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Almacén Central Autopista Duarte Km 22 | Despacho a todo el país en 24h', 60, 27);

  // Document metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('COTIZACIÓN DE REPUESTOS', pageWidth - 14, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha: ${currentDate}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Total Ítems: ${parts.length}`, pageWidth - 14, 28, { align: 'right' });

  // Presentation metadata box
  const yPos = 38;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 16, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, pageWidth - 28, 16, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('SOLICITANTE:', 18, yPos + 5.5);
  doc.text('RESPONSABLE REPUESTOS:', 90, yPos + 5.5);
  doc.text('FILTROS:', 150, yPos + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(clientName ? clientName.toUpperCase() : 'CLIENTE CORPORATIVO / TALLER', 18, yPos + 11.5);
  doc.text(salespersonName, 90, yPos + 11.5);

  const filterSummary = [
    category !== 'Todos' ? `Cat: ${category}` : null,
    searchTerm ? `Búsqueda: "${searchTerm}"` : null
  ].filter(Boolean).join(' | ') || 'Catálogo Completo';

  doc.text(filterSummary, 150, yPos + 11.5);

  // Prepare table rows
  const tableRows = parts.map((part, index) => {
    const priceUsd = part.priceUsd || 0;
    const priceDop = Math.round(priceUsd * USD_TO_DOP_RATE);

    const priceCell = includePrices
      ? `US$ ${priceUsd.toLocaleString()}\n(RD$ ${priceDop.toLocaleString()})`
      : 'A Cotizar';

    const compatibleList = Array.isArray(part.compatibleModels)
      ? part.compatibleModels.slice(0, 3).join(', ')
      : 'Múltiples';

    return [
      String(index + 1),
      part.partNumber,
      part.name,
      part.category,
      compatibleList,
      part.stockQty > 0 ? `${part.stockQty} disp.` : 'Sobre Pedido',
      priceCell
    ];
  });

  autoTable(doc, {
    startY: yPos + 20,
    head: [[
      '#',
      'No. Parte',
      'Descripción del Repuesto',
      'Categoría',
      'Compatibilidad',
      'Stock',
      'Precio Unitario'
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 25 },
      2: { fontStyle: 'bold', cellWidth: 55 },
      3: { cellWidth: 26 },
      4: { fontSize: 7, cellWidth: 32 },
      5: { halign: 'center', fontSize: 7, cellWidth: 16 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 26, textColor: [180, 83, 9] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: (data) => {
      const totalPages = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');

      doc.text(
        'TMD Dominicana • Repuestos 100% Genuinos con Certificado de Origen • Precios no incluyen 18% ITBIS',
        14,
        pageHeight - 6
      );

      doc.text(
        `Página ${data.pageNumber} de ${totalPages}`,
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    }
  });

  return doc;
};

// =========================================================================
// HOMOLOGATED SINGLE MACHINE BANK PROFORMA / SPEC SHEET PDF EXPORT
// =========================================================================

export interface ExportSingleMachineProformaOptions {
  machine: Machine;
  clientName?: string;
  companyName?: string;
  clientPhone?: string;
  targetBank?: string;
  selectedAttachments?: { name: string; priceUsd: number }[];
  downPaymentPercent?: number;
  loanTermMonths?: number;
  annualInterestRate?: number;
  salespersonName?: string;
  salespersonContact?: string;
}

export const generateSingleMachineSpecPdf = (options: ExportSingleMachineProformaOptions): jsPDF => {
  const {
    machine,
    clientName = 'Cliente Comercial',
    companyName = 'Constructora / Empresa Agropecuaria',
    clientPhone = '(809) 000-0000',
    targetBank = 'Banco Popular Dominicano',
    selectedAttachments = [],
    downPaymentPercent = 20,
    loanTermMonths = 48,
    annualInterestRate = 12.5,
    salespersonName = 'Ing. Carlos Mendoza - Asesor Técnico Comercial',
    salespersonContact = 'cmendoza@tmd.com.do | +1 (809) 560-4001'
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const proformaCode = `PROFORMA-TMD-${new Date().getFullYear()}-${machine.id.substring(machine.id.length - 4).toUpperCase()}`;

  // Top Accent Bar (Amber #F59E0B)
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Header Banner Background (Dark Slate #0F172A)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 5, pageWidth, 30, 'F');

  // Official TMD Chevron Logo matching homepage
  drawTmdOfficialLogoPdf(doc, 14, 10, 44, 16);

  // Title alongside logo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TECNOMAQUINARIAS DIESEL DOMINICANA', 62, 17);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 158, 11);
  doc.text('MAQUINARIA PESADA, TRACTORES & RESPALDO TÉCNICO OFICIAL', 62, 22);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text('Autopista Duarte Km 22, Santo Domingo Oeste • RNC: 1-31-88492-1 • Tel: +1 (809) 560-1234', 62, 27);

  // Proforma Badge on Top Right
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(pageWidth - 65, 10, 51, 20, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('COTIZACIÓN BANCARIA', pageWidth - 62, 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(proformaCode, pageWidth - 62, 21);
  doc.text(`Fecha: ${dateStr}`, pageWidth - 62, 26);

  let currentY = 41;

  // Box 1: Bank & Client Financial Routing Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 25, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DESTINATARIO & ENTIDAD FINANCIERA:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Cliente: ${clientName} (${companyName})`, 18, currentY + 12);
  doc.text(`Contacto: ${clientPhone}`, 18, currentY + 18);

  doc.text(`Banco / Entidad: ${targetBank}`, pageWidth / 2 + 10, currentY + 12);
  doc.text(`Atención: Oficial de Crédito / Negocios Corporativos`, pageWidth / 2 + 10, currentY + 18);

  currentY += 30;

  // Machine Title Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`EQUIPO: ${machine.brand.toUpperCase()} ${machine.name.toUpperCase()} (MODELO ${machine.modelCode || machine.id})`, 18, currentY + 5.5);

  currentY += 12;

  // Technical Specs AutoTable
  const specsData = [
    ['Marca / Fabricante', machine.brand, 'Categoría', machine.category.toUpperCase()],
    ['Modelo Comercial', machine.modelCode || machine.name, 'Condición / Año', `NUEVO 0 HORAS (Año ${machine.year || 2026})`],
    ['Potencia Motor', `${machine.powerHp || 100} HP (${machine.engine || 'Diésel Turbo'})`, 'Peso Operativo', `${((machine.operatingWeightKg || 8000) / 1000).toFixed(1)} Toneladas (${(machine.operatingWeightKg || 8000).toLocaleString()} kg)`],
    ['Capacidad Balde', `${machine.bucketCapacityM3 || 1.0} m³`, 'Motorización', machine.engine || 'Cummins / JCB Dieselmax'],
    ['Ubicación de Stock', 'Patio Central Km 22 Autopista Duarte', 'Garantía Oficial TMD', `${machine.warrantyMonths || 24} Meses o 4,000 Horas (Piezas y Mano de Obra)`],
    ['Sistema Telemático', 'Satélite GPS + Diagnóstico Remoto 24/7', 'Disponibilidad Entrega', machine.inStock ? 'Inmediata (1 a 3 días hábiles en obra)' : 'Disponible bajo pedido']
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    body: specsData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      3: { cellWidth: 48 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Commercial Investment Table
  const basePriceUsd = machine.basePriceUsd || 75000;
  let attachmentsTotal = 0;
  const financialRows: any[] = [
    ['1', `${machine.brand} ${machine.name} - Configuración Estándar Cabina ROPS/FOPS`, `$${basePriceUsd.toLocaleString()} USD`, `RD$ ${Math.round(basePriceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')}`]
  ];

  selectedAttachments.forEach((att, idx) => {
    attachmentsTotal += att.priceUsd;
    financialRows.push([
      `${idx + 2}`,
      `Implemento OEM: ${att.name}`,
      `$${att.priceUsd.toLocaleString()} USD`,
      `RD$ ${Math.round(att.priceUsd * USD_TO_DOP_RATE).toLocaleString('es-DO')}`
    ]);
  });

  const totalInvestmentUsd = basePriceUsd + attachmentsTotal;
  const totalInvestmentDop = totalInvestmentUsd * USD_TO_DOP_RATE;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    head: [['#', 'DESCRIPCIÓN DE LA INVERSIÓN COMERCIAL', 'PRECIO (USD)', 'PRECIO (DOP - TASA 60.50)']],
    body: financialRows,
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [245, 158, 11],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 95 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 38 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 39 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Investment Totals Box & Monthly Payment Simulation
  const downPaymentAmount = totalInvestmentUsd * (downPaymentPercent / 100);
  const amountToFinance = totalInvestmentUsd - downPaymentAmount;
  const monthlyRate = (annualInterestRate / 100) / 12;
  const monthlyPaymentUsd = (amountToFinance * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
    (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
  const monthlyPaymentDop = monthlyPaymentUsd * USD_TO_DOP_RATE;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RESUMEN DE INVERSIÓN & CORRIDA BANCARIA ESTIMADA:', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Inversión Total del Equipo: $${totalInvestmentUsd.toLocaleString()} USD (RD$ ${Math.round(totalInvestmentDop).toLocaleString('es-DO')})`, 18, currentY + 12);
  doc.text(`Inicial Sugerido (${downPaymentPercent}%): $${Math.round(downPaymentAmount).toLocaleString()} USD (RD$ ${Math.round(downPaymentAmount * USD_TO_DOP_RATE).toLocaleString('es-DO')})`, 18, currentY + 18);
  doc.text(`Monto a Financiar: $${Math.round(amountToFinance).toLocaleString()} USD`, 18, currentY + 24);

  // Cuota Promedio Destacada
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - 78, currentY + 4, 60, 22, 1.5, 1.5, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CUOTA BANCARIA (${loanTermMonths} MESES):`, pageWidth - 75, currentY + 10);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`$${Math.round(monthlyPaymentUsd).toLocaleString()} USD/mes`, pageWidth - 75, currentY + 17);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Aprox. RD$ ${Math.round(monthlyPaymentDop).toLocaleString('es-DO')} al mes`, pageWidth - 75, currentY + 22);

  currentY += 34;

  // Terms and Official Seal Notice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TÉRMINOS COMERCIALES & CONDICIONES FISCALES (DGII):', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Esta proforma es válida por 30 días calendario y es apta para radicar expediente de crédito comercial en el banco indicado.', 14, currentY + 4);
  doc.text('2. Todos los equipos incluyen capacitación de operadores certificada por TMD, manuales en español y primer servicio de 250h.', 14, currentY + 8);
  doc.text('3. Factura definitiva emitida con Comprobante Fiscal B01 (Crédito Fiscal) conforme a la legislación tributaria dominicana.', 14, currentY + 12);

  // Bottom Signature & Seal
  const footerY = pageHeight - 28;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 80, footerY);
  doc.line(pageWidth - 80, footerY, pageWidth - 14, footerY);

  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('ING. CARLOS MENDOZA', 14, footerY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('Gerencia de Ventas & Maquinaria Pesada TMD', 14, footerY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('SELLO OFICIAL TMD DOMINICANA', pageWidth - 80, footerY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('Dpto. de Créditos & Proformas Bancarias', pageWidth - 80, footerY + 8);

  // Bottom Accent Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(6.5);
  doc.text('TMD DOMINICANA S.R.L. • DISTRIBUIDOR AUTORIZADO • PATIO KM 22 AUTOPISTA DUARTE • WWW.TMD.COM.DO', pageWidth / 2, pageHeight - 2, { align: 'center' });

  return doc;
};

