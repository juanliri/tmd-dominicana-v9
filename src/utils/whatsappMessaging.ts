/**
 * TMD Dominicana - WhatsApp Business Messaging Utility
 * Formats structured messages with Dominican Republic business conventions (USD, DOP, ITBIS, NCF, Patio Km 22).
 */

import { PortalQuote, ServiceWorkOrder, RegisteredEquipment, Machine } from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';

export const TMD_CENTRAL_PHONE = '+18095601234';
export const TMD_CENTRAL_WHATSAPP = '18095601234';

/**
 * Formats a Dominican phone number for WhatsApp API (e.g. +1 809 555-0192 -> 18095550192)
 */
export const cleanPhoneNumberForWhatsApp = (phone?: string): string => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Formats a commercial Machine / Parts Quotation for WhatsApp sharing
 */
export const generateQuoteWhatsAppMessage = (
  quote: PortalQuote,
  options?: {
    customAdvisorName?: string;
    includeTradeIn?: boolean;
    includeAdvance?: boolean;
  }
): string => {
  const advisor = options?.customAdvisorName || quote.assignedSalesRep || 'Asesor Comercial TMD';
  const totalDop = Math.round((quote.total || 0) * USD_TO_DOP_RATE);
  const itbisDop = Math.round((quote.itbis || 0) * USD_TO_DOP_RATE);
  const subtotalDop = Math.round((quote.subtotal || 0) * USD_TO_DOP_RATE);

  const lines: string[] = [
    `🚜 *TECNOMAQUINARIAS DIESEL S.R.L. (TMD)*`,
    `🇩🇴 *COTIZACIÓN COMERCIAL OFICIAL*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *No. Cotización:* \`${quote.quoteNumber}\``,
    `👤 *Cliente:* ${quote.clientName || 'Estimado Cliente'}${quote.companyName ? ` (${quote.companyName})` : ''}`,
    quote.rnc ? `🏢 *RNC / Cédula:* ${quote.rnc}` : '',
    quote.ncfNumber ? `🏛️ *Comprobante Fiscal:* ${quote.ncfNumber} (${quote.ncfType || 'B01'})` : '',
    `📅 *Fecha:* ${new Date(quote.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 *RESUMEN DE EQUIPOS Y REPUESTOS:*`,
    `• ${quote.itemsSummary || 'Maquinaria pesada certificada'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *DESGLOSE FINANCIERO:*`,
    `• *Subtotal:* US$ ${quote.subtotal?.toLocaleString()} (RD$ ${subtotalDop.toLocaleString()})`,
    `• *ITBIS (18%):* US$ ${quote.itbis?.toLocaleString()} (RD$ ${itbisDop.toLocaleString()})`,
    `• *TOTAL NETO:* *US$ ${quote.total?.toLocaleString()}* (*RD$ ${totalDop.toLocaleString()}*)`
  ].filter(Boolean);

  if (quote.tradeInDeductionUsd && quote.tradeInDeductionUsd > 0) {
    const tradeInDop = Math.round(quote.tradeInDeductionUsd * USD_TO_DOP_RATE);
    lines.push(`🔄 *Crédito Retoma Usada (Trade-In):* -US$ ${quote.tradeInDeductionUsd.toLocaleString()} (-RD$ ${tradeInDop.toLocaleString()})`);
    if (quote.tradeInEquipmentName) {
      lines.push(`   _Equipo: ${quote.tradeInEquipmentName}_`);
    }
  }

  if (quote.downPaymentAmountUsd && quote.downPaymentAmountUsd > 0) {
    const advanceDop = Math.round(quote.downPaymentAmountUsd * USD_TO_DOP_RATE);
    const balanceUsd = Math.max(0, (quote.total || 0) - (quote.downPaymentAmountUsd || 0) - (quote.tradeInDeductionUsd || 0));
    lines.push(`💳 *Anticipo Recibido:* US$ ${quote.downPaymentAmountUsd.toLocaleString()} (RD$ ${advanceDop.toLocaleString()})`);
    if (quote.downPaymentReference) {
      lines.push(`   _Ref. Bancaria: ${quote.downPaymentReference} (${quote.downPaymentMethod || 'Banco'})_`);
    }
    lines.push(`⚖️ *Saldo Pendiente para Despacho:* *US$ ${balanceUsd.toLocaleString()}*`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📍 *Lugar de Entrega:* Patio Central Km 22, Autopista Duarte, Sto. Dgo. Oeste`,
    `🛡️ *Garantía:* Oficial TMD Care con Respaldo de Fábrica`,
    `⏱️ *Validez de Oferta:* 15 Días Calendario`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👨‍💼 *Atendido por:* ${advisor}`,
    `📞 *Teléfono Central:* +1 (809) 560-1234`,
    `🌐 *Plataforma:* https://tmd-dominicana.com.do`
  );

  return lines.join('\n');
};

/**
 * Returns direct WhatsApp Web / App share URL for a quote
 */
export const getQuoteWhatsAppUrl = (
  quote: PortalQuote,
  targetPhone?: string,
  options?: {
    customAdvisorName?: string;
    includeTradeIn?: boolean;
    includeAdvance?: boolean;
  }
): string => {
  const message = generateQuoteWhatsAppMessage(quote, options);
  const encodedText = encodeURIComponent(message);
  const cleanPhone = cleanPhoneNumberForWhatsApp(targetPhone || quote.phone);

  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Formats a Field Technician Work Order Dispatch message
 */
export const generateWorkOrderDispatchWhatsAppMessage = (
  order: ServiceWorkOrder
): string => {
  const partsSummary = order.installedParts && order.installedParts.length > 0
    ? order.installedParts.map(p => `  - ${p.quantity}x ${p.name} (P/N: ${p.partNumber})`).join('\n')
    : '  - Kit de filtros y fluidos estándar de mantenimiento';

  const lines: string[] = [
    `⚠️ *TMD DOMINICANA | ASIGNACIÓN DE SERVICIO TÉCNICO 24/7*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔧 *Orden de Trabajo:* \`${order.orderNumber}\``,
    `🚨 *Prioridad:* *${order.priority.toUpperCase()}*`,
    `👷 *Técnico Asignado:* ${order.assignedTechnician || 'Técnico de Turno'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Cliente / Empresa:* ${order.clientName} (${order.companyName || 'Obra'})`,
    `🚜 *Equipo:* ${order.machineModel}`,
    `🔢 *Serie / VIN:* ${order.machineSerial || 'Ver en placa'}`,
    order.horometerHours ? `⏱️ *Horómetro Registrado:* ${order.horometerHours.toLocaleString()} Horas` : '',
    `📍 *Ubicación en Campo:* ${order.location}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *SERVICIO / FALLA REPORTADA:*`,
    `${order.description || order.serviceCategory || 'Mantenimiento en Obra'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔩 *REPUESTOS / KITS REQUERIDOS:*`,
    partsSummary,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📲 Favor confirmar recepción y reporte de salida de unidad móvil vía app TMD.`
  ].filter(Boolean);

  return lines.join('\n');
};

/**
 * Returns direct WhatsApp URL for technician dispatch
 */
export const getWorkOrderDispatchWhatsAppUrl = (
  order: ServiceWorkOrder,
  technicianPhone?: string
): string => {
  const message = generateWorkOrderDispatchWhatsAppMessage(order);
  const encodedText = encodeURIComponent(message);
  const cleanPhone = cleanPhoneNumberForWhatsApp(technicianPhone);

  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Formats a Preventive Maintenance Horometer Alert message for contractor
 */
export const generatePreventiveAlertWhatsAppMessage = (
  equipment: RegisteredEquipment,
  intervalHours: number,
  clientName?: string
): string => {
  const hoursLeft = Math.max(0, equipment.nextServiceHours - equipment.currentHorometer);

  const lines: string[] = [
    `⏳ *TMD DOMINICANA | ALERTA DE MANTENIMIENTO PREVENTIVO*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Estimado/a:* ${clientName || 'Contratista'}`,
    `🚜 *Equipo:* *${equipment.brand} ${equipment.model}* (Ficha: \`${equipment.unitId}\`)`,
    `🔢 *Serie:* ${equipment.serialNumber}`,
    `⏱️ *Horómetro Actual:* *${equipment.currentHorometer.toLocaleString()} Horas*`,
    `🎯 *Próximo Servicio:* *${equipment.nextServiceHours.toLocaleString()} Horas* (Kit ${intervalHours}h)`,
    hoursLeft === 0 
      ? `🚨 *ESTADO:* ¡SERVICIO VENCIDO! Requiere atención inmediata para preservar garantía.`
      : `⚠️ *Margen Restante:* ${hoursLeft} horas de operación restantes`,
    `📍 *Ubicación:* ${equipment.jobsiteLocation || 'Obra / Cantera'}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📦 *KITS OEM DISPONIBLES EN PATIO KM 22:*`,
    `• Filtros genuinos Donaldson / Fleetguard / OEM`,
    `• Aceite motor 15W-40 CK-4 / Hidráulico ISO VG 46`,
    `• Engrase y diagnóstico computarizado con escáner`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛒 *Ordenar Kit o Agendar Técnico Móvil:*`,
    `📞 Central de Repuestos: +1 (809) 560-1234`,
    `📍 Km 22 Autopista Duarte, Santo Domingo Oeste`
  ];

  return lines.join('\n');
};

/**
 * Returns WhatsApp URL for preventive alert
 */
export const getPreventiveAlertWhatsAppUrl = (
  equipment: RegisteredEquipment,
  intervalHours: number,
  clientPhone?: string,
  clientName?: string
): string => {
  const message = generatePreventiveAlertWhatsAppMessage(equipment, intervalHours, clientName);
  const encodedText = encodeURIComponent(message);
  const cleanPhone = cleanPhoneNumberForWhatsApp(clientPhone);

  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Formats a Gate Pass (Pase de Salida) verification for Patio Km 22
 */
export const generateGatePassWhatsAppMessage = (
  quote: PortalQuote,
  bayName: string,
  gatePassCode: string,
  driverName?: string
): string => {
  const lines: string[] = [
    `🎟️ *TMD DOMINICANA | PASE DE SALIDA AUTORIZADO*`,
    `📍 *PATIO CENTRAL KM 22 - AUTOPISTA DUARTE*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✅ *CÓDIGO DE SALIDA:* \`${gatePassCode}\``,
    `📋 *Cotización / Factura:* ${quote.quoteNumber}`,
    `👤 *Cliente:* ${quote.clientName} (${quote.companyName || 'Empresa'})`,
    `🚜 *Equipo:* ${quote.itemsSummary}`,
    `🏢 *Bahía de Carga:* ${bayName}`,
    driverName ? `🚚 *Chofer Lowboy / Transporte:* ${driverName}` : '',
    `💰 *Estado Financiero:* Saldado / Crédito Verificado`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔒 Pase verificado por Gerencia de Patio Km 22 y Control de Salida.`
  ].filter(Boolean);

  return lines.join('\n');
};

/**
 * Returns WhatsApp URL for Gate Pass Dispatch
 */
export const getGatePassWhatsAppUrl = (
  quote: PortalQuote,
  bayName: string,
  gatePassCode: string,
  driverName?: string,
  targetPhone?: string
): string => {
  const message = generateGatePassWhatsAppMessage(quote, bayName, gatePassCode, driverName);
  const encodedText = encodeURIComponent(message);
  const cleanPhone = cleanPhoneNumberForWhatsApp(targetPhone);

  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};
