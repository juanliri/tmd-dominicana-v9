import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PortalQuote, Machine, CustomerPurchaseOrder, ServiceWorkOrder, LiveLinkUnit } from '../types';
import { USD_TO_DOP_RATE, MACHINES_DATA } from '../data/catalog';

export interface ExportQuotePdfOptions {
  quote: PortalQuote;
  selectedMachine?: Machine | null;
  customerNotes?: string;
  paymentMethod?: string;
  deliveryLocation?: string;
  includeSpecs?: boolean;
}

export const TMD_LOGO_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPUAAABjCAMAAAB0ULYJAAAAbFBMVEVHcEypo5rmpSXtpyngoCPrpyngoiP6sC76sC/zrCz///8AAAD7sC8cGxf/tzDKkCoMCQUTExP/wTPdnS01KhaxfyekpKTtqS50VR1iYmJWPxeSaSHw8PC0tLRCQkJ5eXnExMTd3d3Q0NCOjo7TRdItAAAACnRSTlMA+lpyIo4/2eW318cSYAAACv1JREFUeNrtXIt22ygQzUnTpl4JhCT0AizZ0v//4w5Ql5rXEJ/snpOkk9iyBYK5zJ1hBEqe/spf+fxyev288iOJ+rX+vPLtS6I+fUnU9cuXRP2MoKYfVFLKO4rnUDcfU/oapG/6xv+dDKqfL1nUPas+pLQ9renckkAGaimeQ00/KuoK0NEhRN3O1FL8c6Keu5pOPETNJ2oo/jlR87qOU7yxxv6B+vU6vlHWqmLjORQeccBItQXr89iWlSCwmwTFpUX9HbX18s8bZasqEj8fyBqpdjbnEVH7sbYZ1JKC9iRELSzq1/dHDbbmsfOXKpAjUY2X9KPGhSUpDuioiFC8dxR/X9Q8YSsV0JJdI9WumvmqrKvrljA4A3RURig+OIqn/Poh1IqkrllwgoOo1g5HIe4lMXflKX56b1tf4aItWjJiBLeiKXEp7++yxlAbdBGK3+aul3dGfUnCuTKc4CAaxfgWcm2x9GzKU/z5nVGPaaVXhOCu1vG2Lts4xRuCpGeYXyvzhryMHGmCHjjBrfvfXERFu4Y3T3YSoDboeBtJz+wdyDvbGvjGdjj6qoZzFxA8Vu8omLB97NcANkmkZ22YnuGocT3W9MSjCELwFGpcrhxJz3yKf39fWwNqAqjxuevIBAZeOMx+qMTTM8JrI6/vOl8rYi2FO/Zu68dS0nDccBkjcxcVyB3Ie9lasQzqvXLCc5Va5bm8LwrN85mbu9A7kBD1uv8hl/uoCu+7J6MeqKSOzrH9Sh5Xdz8FA9m27TjG867ibSv+4NyF31+PAWdDYdufCqmEY59D3ZWLeZcgOXe6tOt2wW9vmE3PknNX/VK+bnZJ0QqLU85nQfKeyyOjy/0UfkcTfTLV2fTsW7Gt2TXTUUiI0JpthOCqIDlbA02OfNgAaRCKF6NuFaJNQF6/vldHJUy24KO7qmDc1pL0jHjpGYqaERW5QYq7gcrOXUTls7vVwXHXBbBjDlS+evZc6terN7iGsRk3UL5B92QEV8nkLESdbIQ8sHqGM3zNepJzg7TwrBOoVJpyjo1uNfqc2oL0bOLJ9OxnKeolpFQo5J+MLLGBUcEMxK7IolvcT/Zw9WzGVs9w1BuSBvqECKGd70ZPJdOUS3Aumhlk729Yj6RnhX49eii2ctR3keCMVjl7PCBlxl4CijfYAjFu63PBdM0Wp3Akk14dwVPm5siE7SQYnCNMz3ia4i8I6sR90oqlZqFsCTaoe4TL9bqbH3u8JlAvBXMXkp6hqNtraBU8NVOeXplxUX8yiBkxR3jFUa8F6VlyaYGeivyaqFjwQNxAHcE1+/0ZFdChWIjKRj0J6KbY6llt5QWxtRtZNLLu9wZWXg61+LnOnryRw6VVsWCJz12NR3EENTaLhlOtYmeH0WDaPJALMh/iqFUCNevz6dmpBPUWTr446fZq8Qiye+EZHUyc4R5qLD1rhUvPUL8+SqjIfQzeGbUpjwtFjoNEswRqgW5u4rYeS8LO6hFi9DkfpNjcK1GkGPWC7SpN2B0IjvoSJim4IgeybbWk79pxGb3BvLxxc/MVR82uJUnK5qNKpt3qNufvj6Jm13ggxCnOXXqG+HVbNF0fRdsCynESWY1DCI5cia6eobbm8dCBOP+a348+8JVX3NQqxRJ8gRhBjaR/nvOrO0JsJWuDKnvbnnAmlH2AjkbTs8lR3EOd5JNKK7dHoipPb8u1pmF8OAsXznxhnCJ3IIhfl60ptCpEEGTeXhurV1Q2YZNrckUcT88cxTFb49N1fMXL43CoJw9X/XDhO7JVXDZ3/XxBULs17OTIhnY7vLP3xVZP8sCEvbjIkSMfnp49I6ixaTWKb/PuzEMm4FsqofBzbCbk1QMP5pzyfs3wNYX0rsUYj+EblvRFcayjQrf3ytOzrK1Z2ZrCFs/flniSQuK+c1l+y2Z/3c9xVth20pvuu76nUZevKRxxQpCcdYAJj4pCphRk4weNZqzsNvicyN/23HPEhwcDkfTMHwpDHst5RubrzamVGtvM8v2R4KRr+nFRGX7PXTI3QzJSZE0hF/J2jykqOiTLg2jxOxaevfsAfiOoy5KU1ptGL15BnC3rw9x2TWX4TVqc3yHq8umFkaQ252hiFsY6HL4KK53ZI/ymJ3TdjF1RR8puPC/RBDJkCA41PD+yN8bvwS2bZW1duM6zJN2AqHRWEUZ4xPhlqxAMfawSRV32dMaSvs2/+EA25FEWlQKMuBrO756W7mn6QfjaFq4fuZkvndGOj8fwy5oCzaf8rfUPZP+6fCVlDF03HLawga0cKfqXAPijV8hzKfimKZ6aObmm5/slFrJwUWPMzfD4jTx5leHuWLR+lGlhjROpXPYtjRnfvH4uQr1d7iUaQ9iy3cnyZxm/L7sLlec7uRTIuFr1Hozfp8/299cZfoP0v1LRD/w3uezB+E2/PWVR88GIIPYIp8TQDKIS+jMbhhaqyKaZoYDJYa6qdoBSEDnwylxvC2ddJgZpPkg4Qol09eYBZGa2WkVMR1C919eCcFtsPtxUYmxuerj4ptk8CDx+C8fvHOq56yjtOiE6eO8mxoYOpKngMFe8q0HRugPpScVpB5dIKLDXSX2gpjqrGvgKZY350EODleh6jczWGzpQsxvgaL91HIoonXRFENt7Q6oZLpJWFTjWE2hky+q27wS+9m/5Pb0gf89F+EwnwdncDRwEuupnIXnVgEqMAwpOqRSAHKwIp1o2UTqbZWg6GO+SQtYwDg28DCZQTtdpoGwwQQc+Vrq4lQDBVIMmqak9MCGZ9dJeNyPNuA1WFWhFMCmgrPn1lbv4TXP8hqkasbXpUbNXd6XtWfPb4no3i26wRqyktgGlNRFdTYU2ztADMXoAYdTXYA02rRzRrXPZSVNvqknFpk7ojqzBBgo/us1JEgsDerd9DKZHUKWtoHHD/1+aQaMEid9uDRxFbXvUtgWK6YG97RVK2oPtmO0MNIa+eiqaCd5Ao5oMHefAB9uCBqv1FJzWLac92Eyb1dYTWuW+0eapoRoHKtcTwBpoVxsHt8QHlzBcABoZt+A98FxUg9WMa31d/O45sgSOoLau1lM5z9wwTAvgIQ01ehrjDxpYPdcNlY3x2UYM3cw7gxroYGC0AF10ky41q9TCMFe3z+EbpeZItC0F2N4EMWqOcErYPox/WFVARGMGG76aLn/v3mrFsGdwkPnauFqrnYi1DDgyc2FDkTCK95pgM6Wc055Dfxw0ZMYctCGgIOfAVAJwBJNg+tkQZjDxhv+q1+vmwHLSNmvOUUmGmQnowfrTzCWlxnk1H4wqA2dgBNZbzax7s8zmragdvxFbG5czAcY4owm2HW218lpnDkqaM7PB0psXh1IpZV1DNbisq4Umdz3Rbjb+oj2a1EB1aetRYsdC128YmFrKAXwW+Ft3huFEMwH6MFy4qdJ0dKJUtLX5KmRHQTiSn1h+46hJP3FAPRkhFZNTPQ3tPGlHm3oC731dN5qAkzCvZhINHOyJGaw/cENGIA+QRk4SXuZDY5vWF+izpDdHPjVM99eTua8nCZ9t7/3AzenfqrQQB3tx+8oH/d63Ov/G+Y37NdMHZsV853Awn28nCLH17MtV1AcbCGwt5mrZ0lu9W3OuF1uPWA1s0U0ZV6klTrXbIR2/vaco/9M8XDZz9X+KRPitp+pP979xsPj9+vQJUVt+kzS/f2Co66n5eGI8swlloo7fn+9/2aXUrh2/v9x/a/zxFVGfnr4g6p8vXxH1t6e8nH5+LHmFH+83/Dk9/ZW/8lXlX4XLFMHiyWdPAAAAAElFTkSuQmCC';

/**
 * Embeds the exact official TMD Logo image asset into the PDF document without modifying the design.
 */
export function drawTmdOfficialLogoPdf(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number = 42, 
  height: number = 17
): void {
  try {
    doc.addImage(TMD_LOGO_PNG_BASE64, 'PNG', x, y, width, height);
  } catch (err) {
    console.error('Error drawing TMD logo to PDF:', err);
  }
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

  // Official TMD Chevron Logo matching homepage
  drawTmdOfficialLogoPdf(doc, margin, 10, 44, 16);

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

  // Official TMD Chevron Logo matching homepage
  drawTmdOfficialLogoPdf(doc, margin, 10, 44, 16);

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

export const downloadWorkOrderPDF = (order: ServiceWorkOrder, filename?: string) => {
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

  // Official TMD Chevron Logo
  drawTmdOfficialLogoPdf(doc, margin, 10, 44, 16);

  // Company info
  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TECNOMAQUINARIAS DIESEL DOMINICANA S.R.L.', pageWidth - margin, 14, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...brandGray);
  doc.text('TALLER CENTRAL & SERVICIO MÓVIL EN OBRA | FULLBAY INTEGRATED', pageWidth - margin, 18.5, { align: 'right' });
  doc.text('Km 22 Autopista Duarte, Santo Domingo Oeste, R.D. | Tel: +1 (809) 560-1234', pageWidth - margin, 22.5, { align: 'right' });

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);

  let currentY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brandDark);
  doc.text('ORDEN DE SERVICIO TÉCNICO & DIAGNÓSTICO FULLBAY', margin, currentY);

  doc.setFontSize(8.5);
  doc.text(`ORDEN: ${order.orderNumber}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 8;

  // Metadata boxes
  const colW = (pageWidth - margin * 2 - 6) / 2;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, colW, 28, 2, 2, 'F');
  doc.roundedRect(margin + colW + 6, currentY, colW, 28, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text('DATOS DEL CLIENTE / PROYECTO:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${order.clientName || 'Cliente TMD'}`, margin + 4, currentY + 11);
  doc.text(`Empresa: ${order.companyName || 'Constructora / Operador'}`, margin + 4, currentY + 16);
  doc.text(`Ubicación: ${order.location || 'Patio Km 22 Autopista Duarte'}`, margin + 4, currentY + 21);
  doc.text(`Prioridad: ${(order.priority || 'routine').toUpperCase()}`, margin + 4, currentY + 26);

  const rX = margin + colW + 6;
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL EQUIPO & DIAGNÓSTICO:', rX + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Equipo: ${order.machineModel} (${order.equipmentBrand || 'TMD'})`, rX + 4, currentY + 11);
  doc.text(`Serie / VIN: ${order.machineSerial || 'N/A'}`, rX + 4, currentY + 16);
  doc.text(`Horómetro: ${order.horometerHours ? `${order.horometerHours.toLocaleString()} hrs` : 'N/A'}`, rX + 4, currentY + 21);
  doc.text(`Estado: ${(order.status || 'in_progress').toUpperCase()}`, rX + 4, currentY + 26);

  currentY += 34;

  // Description / Diagnostic box
  doc.setFillColor(244, 244, 245);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandDark);
  doc.text('MOTIVO DE INTERVENCIÓN / TRABAJO SOLICITADO:', margin + 4, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...brandGray);
  const descLines = doc.splitTextToSize(order.description || 'Mantenimiento preventivo general y chequeo de sistemas.', pageWidth - margin * 2 - 8);
  doc.text(descLines, margin + 4, currentY + 10.5);

  currentY += 24;

  // Parts & Services Table
  const parts = order.installedParts || [];
  const rows = parts.length > 0 
    ? parts.map((part, idx) => [
        String(idx + 1).padStart(2, '0'),
        part.partName,
        part.partNumber || 'OEM-GENUINE',
        String(part.quantity),
        part.status.toUpperCase(),
        `US$ ${(part.totalCostUsd || part.unitCostUsd * part.quantity).toFixed(2)}`
      ])
    : [
        ['01', order.serviceType ? order.serviceType.replace(/_/g, ' ').toUpperCase() : 'SERVICIO TÉCNICO ESPECIALIZADO', 'LABOR-01', '1', 'INSTALADO', `US$ ${(order.totalLaborCostUsd || 450).toFixed(2)}`],
        ['02', 'Kit de Filtros y Fluidos Certificados OEM', 'KIT-OEM-TMD', '1', 'SUMINISTRADO', `US$ ${(order.totalPartsCostUsd || 850).toFixed(2)}`]
      ];

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'DESCRIPCIÓN DE PIEZA / MANO DE OBRA', 'CÓDIGO OEM', 'CANT', 'ESTADO', 'SUBTOTAL (USD)']],
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
      2: { halign: 'center', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 32, fontStyle: 'bold' }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // @ts-expect-error autoTable finalY
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 6;

  // Totals box
  const tW = 85;
  const tX = pageWidth - margin - tW;
  const partsCost = order.totalPartsCostUsd || 850;
  const laborCost = order.totalLaborCostUsd || 450;
  const subtotal = partsCost + laborCost;
  const itbis = subtotal * 0.18;
  const total = subtotal + itbis;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(tX, currentY, tW, 30, 2, 2, 'F');
  doc.roundedRect(tX, currentY, tW, 30, 2, 2, 'D');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Costo Repuestos:', tX + 4, currentY + 6);
  doc.text(`US$ ${partsCost.toFixed(2)}`, pageWidth - margin - 4, currentY + 6, { align: 'right' });

  doc.text('Mano de Obra Taller:', tX + 4, currentY + 11);
  doc.text(`US$ ${laborCost.toFixed(2)}`, pageWidth - margin - 4, currentY + 11, { align: 'right' });

  doc.text('ITBIS (18%):', tX + 4, currentY + 16);
  doc.text(`US$ ${itbis.toFixed(2)}`, pageWidth - margin - 4, currentY + 16, { align: 'right' });

  doc.setFillColor(...brandAmber);
  doc.roundedRect(tX + 2, currentY + 20, tW - 4, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL DE ORDEN:', tX + 4, currentY + 25.5);
  doc.text(`US$ ${total.toFixed(2)}`, pageWidth - margin - 4, currentY + 25.5, { align: 'right' });

  // Signatures
  const sigY = pageHeight - 20;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  doc.line(margin + 10, sigY, margin + 70, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...brandDark);
  doc.text('TÉCNICO / JEFE DE TALLER TMD', margin + 40, sigY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...brandGray);
  doc.text(order.assignedTechnician || 'Ing. Carlos Mendoza (Jefe de Taller)', margin + 40, sigY + 6.5, { align: 'center' });

  const rSigX = pageWidth - margin - 70;
  doc.line(rSigX, sigY, rSigX + 60, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...brandDark);
  doc.text('RECIBIDO CONFORME CLIENTE', rSigX + 30, sigY + 3.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...brandGray);
  doc.text(order.clientName || 'Representante Autorizado', rSigX + 30, sigY + 6.5, { align: 'center' });

  doc.setFillColor(...brandAmber);
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

  const safeName = filename || `OrdenServicio_${order.orderNumber}.pdf`;
  doc.save(safeName);
};

export const downloadTelematicsReportPDF = (unit: LiveLinkUnit, filename?: string) => {
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

  drawTmdOfficialLogoPdf(doc, margin, 10, 44, 16);

  doc.setTextColor(...brandDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TECNOMAQUINARIAS DIESEL DOMINICANA S.R.L.', pageWidth - margin, 14, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...brandGray);
  doc.text('LIVELINK™ TELEMATICS & DIAGNOSTICS GATEWAY (CAN BUS J1939)', pageWidth - margin, 18.5, { align: 'right' });
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-DO')} | Hora: ${new Date().toLocaleTimeString('es-DO')}`, pageWidth - margin, 22.5, { align: 'right' });

  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(margin, 30, pageWidth - margin, 30);

  let currentY = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brandDark);
  doc.text('REPORTE TÉCNICO DE TELEMETRÍA LIVELINK™', margin, currentY);

  doc.setFontSize(8.5);
  doc.text(`UNIDAD: ${unit.name} (${unit.brand})`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 8;

  // Unit Summary Grid
  const cardW = (pageWidth - margin * 2 - 9) / 4;
  const metrics = [
    { label: 'HORÓMETRO', val: `${unit.horometerHours.toLocaleString()} hrs` },
    { label: 'TEMP. REFRIGERANTE', val: `${unit.engineCoolantTempC} °C` },
    { label: 'TEMP. HIDRÁULICO', val: `${unit.hydraulicOilTempC} °C` },
    { label: 'COMBUSTIBLE', val: `${unit.fuelLevelPercent}% (${unit.fuelConsumptionLph} L/h)` }
  ];

  metrics.forEach((m, idx) => {
    const x = margin + idx * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, currentY, cardW, 18, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, cardW, 18, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...brandGray);
    doc.text(m.label, x + 3, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...brandDark);
    doc.text(m.val, x + 3, currentY + 13);
  });

  currentY += 24;

  // Unit details box
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'F');
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text('INFORMACIÓN DE MAQUINARIA & ENLACE SATELITAL:', margin + 4, currentY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente / Empresa: ${unit.customerCompany} (${unit.customerName})`, margin + 4, currentY + 12);
  doc.text(`VIN / Serie Chasis: ${unit.vin} | Modelo: ${unit.model}`, margin + 4, currentY + 17);
  doc.text(`Ubicación Satelital: ${unit.location.address}, ${unit.location.province} (${unit.location.lat.toFixed(4)}, ${unit.location.lng.toFixed(4)})`, margin + 4, currentY + 22);

  doc.text(`Geocerca: ${unit.geofenceName} [${unit.geofenceStatus.toUpperCase()}]`, pageWidth - margin - 75, currentY + 12);
  doc.text(`Voltaje Batería: ${unit.batteryVoltage} V`, pageWidth - margin - 75, currentY + 17);
  doc.text(`Estado Motor: ${unit.status.toUpperCase()}`, pageWidth - margin - 75, currentY + 22);

  currentY += 32;

  // DTC Fault Codes Table
  const dtcRows = (unit.faultCodes || []).map(f => [
    f.code,
    f.spnFmi || 'SPN-999 / FMI-0',
    f.description,
    f.severity.toUpperCase(),
    f.timestamp ? new Date(f.timestamp).toLocaleDateString('es-DO') : 'Activo'
  ]);

  if (dtcRows.length === 0) {
    dtcRows.push(['DTC-NONE', 'CAN-BUS-OK', 'Sin códigos de falla activos en memoria ECM.', 'NORMAL', 'Activo']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['CÓDIGO DTC', 'SPN / FMI', 'DESCRIPCIÓN DE DIAGNÓSTICO', 'SEVERIDAD', 'REGISTRO']],
    body: dtcRows,
    theme: 'grid',
    headStyles: {
      fillColor: brandDark,
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 26 },
      4: { halign: 'center', cellWidth: 24 }
    },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // @ts-expect-error autoTable finalY
  currentY = (doc.lastAutoTable?.finalY || currentY + 30) + 10;

  // Maintenance forecast
  doc.setFillColor(244, 244, 245);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...brandDark);
  doc.text('PROYECCIÓN DE MANTENIMIENTO PREVENTIVO:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...brandGray);
  doc.text(`Próximo servicio requerido en: ${unit.serviceCountdownHours} horas operativas.`, margin + 4, currentY + 11.5);
  doc.text('Recomendación técnica TMD: Solicitar despacho preventivo de kit de filtros y fluidos 15 días antes del vencimiento.', margin + 4, currentY + 16);

  // Footer Bottom Line
  doc.setFillColor(...brandAmber);
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

  const safeName = filename || `Telemetria_LiveLink_${unit.vin}.pdf`;
  doc.save(safeName);
};
