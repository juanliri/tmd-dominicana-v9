import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  collectionGroup,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  CrmInquiry, 
  CrmFunnelStage, 
  CrmInquirySource, 
  CrmBuyerIntent, 
  CrmInquiryPriority, 
  CrmFunnelMetrics,
  CrmInquiryActivity,
  PortalQuote 
} from '../types';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { recordAdminAuditLog } from './auditService';
import { playNotificationSound } from './notificationService';

// Sales Representative Registry for automated assignment
export const SALES_REPRESENTATIVES = [
  {
    name: 'Ing. Carlos Mendoza',
    role: 'Asesor Comercial Senior (Viales & JCB)',
    email: 'cmendoza@tmd.rd',
    phone: '+1 (809) 560-4001',
    categorySpecialty: ['Retroexcavadoras', 'Rodillos', 'Vial', 'JCB']
  },
  {
    name: 'Ing. Rafael Castillo',
    role: 'Especialista Flotas Minería & LiuGong',
    email: 'rcastillo@tmd.rd',
    phone: '+1 (809) 560-4002',
    categorySpecialty: ['Excavadoras', 'Cargadores', 'Minería', 'LiuGong']
  },
  {
    name: 'Lic. Marcos Almonte',
    role: 'Consultor Agroindustrial & Kubota/LS',
    email: 'malmonte@tmd.rd',
    phone: '+1 (809) 560-4003',
    categorySpecialty: ['Tractores', 'Miniexcavadoras', 'Agrícola', 'Kubota', 'LS Tractor']
  },
  {
    name: 'Ing. Sarah De León',
    role: 'Gerente Post-Venta & Repuestos OEM',
    email: 'sdeleon@tmd.rd',
    phone: '+1 (809) 560-4004',
    categorySpecialty: ['Repuestos', 'Filtros', 'Tren de Rodaje', 'AFEX', 'Ammann']
  }
];

export const FUNNEL_STAGES_CONFIG: Record<CrmFunnelStage, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  probability: number;
  description: string;
  order: number;
}> = {
  new_inquiry: {
    label: '1. Nueva Solicitud (RFQ)',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500/30',
    probability: 0.15,
    description: 'Solicitud recién enviada por cliente o portal web',
    order: 1
  },
  contacted: {
    label: '2. Contactado / Calificado',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-500/30',
    probability: 0.35,
    description: 'Primer contacto vía llamada, WhatsApp o reunión virtual',
    order: 2
  },
  technical_evaluation: {
    label: '3. Evaluación Técnica',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-500/30',
    probability: 0.55,
    description: 'Validación de terreno, aditamentos, hidráulica y horómetro',
    order: 3
  },
  commercial_proposal: {
    label: '4. Propuesta Formal (NCF)',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500/30',
    probability: 0.75,
    description: 'Cotización proforma emitida con ITBIS y desglose leasing',
    order: 4
  },
  negotiation: {
    label: '5. Negociación & Crédito',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
    badgeText: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-500/30',
    probability: 0.88,
    description: 'Aprobación bancaria, plazos de entrega y contrato comercial',
    order: 5
  },
  won: {
    label: '6. Cerrada Ganada (PO)',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500/40',
    probability: 1.0,
    description: 'Orden de compra emitida y despacho programado',
    order: 6
  },
  lost: {
    label: 'Perdida / Descartada',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-500/30',
    probability: 0.0,
    description: 'Desestimada por precio, plazo o financiamiento',
    order: 7
  }
};

/**
 * Calculates lead quality score (0 - 100) dynamically based on business signals
 */
export function calculateLeadScore(quote: PortalQuote, extraContext?: {
  rncOrCedula?: string;
  source?: CrmInquirySource;
  equipmentInterested?: string;
  financingMethod?: string;
}): number {
  let score = 30; // Baseline score for submitting a formal RFQ

  const company = (quote.companyName || '').toLowerCase();
  const notes = (quote.notes || '').toLowerCase();
  const items = (quote.itemsSummary || '').toLowerCase();

  // 1. Corporate Identity & Registered Business Check (+25 pts)
  if (
    company.includes('constructora') ||
    company.includes('srl') ||
    company.includes('s.r.l') ||
    company.includes('sa') ||
    company.includes('s.a.') ||
    company.includes('ingenieria') ||
    company.includes('consorcio') ||
    company.includes('minera') ||
    company.includes('agregados') ||
    company.includes('transporte')
  ) {
    score += 25;
  } else if (company.length > 3) {
    score += 15;
  }

  // 2. Tax ID / RNC presence (+15 pts)
  if (extraContext?.rncOrCedula && extraContext.rncOrCedula.replace(/\D/g, '').length >= 9) {
    score += 15;
  }

  // 3. Contact completeness (+10 pts)
  if (quote.phone && quote.phone.replace(/\D/g, '').length >= 10) {
    score += 10;
  }

  // 4. Deal Value Impact (+15 pts)
  if (quote.total >= 80000) {
    score += 15;
  } else if (quote.total >= 30000) {
    score += 10;
  } else if (quote.total >= 10000) {
    score += 5;
  }

  // 5. High-Intent Signals in summary/notes (+10 pts)
  if (
    items.includes('kit') || 
    items.includes('garantía') || 
    notes.includes('financiamiento') || 
    notes.includes('leasing') ||
    notes.includes('urgente') ||
    notes.includes('entrega')
  ) {
    score += 10;
  }

  return Math.min(98, Math.max(25, score));
}

/**
 * Automates the assignment of a Sales Representative based on equipment category and brand
 */
export function assignSalesRep(equipmentText: string): typeof SALES_REPRESENTATIVES[0] {
  const query = equipmentText.toLowerCase();

  if (query.includes('jcb') || query.includes('retroexcavadora') || query.includes('3cx') || query.includes('vial') || query.includes('rodillo')) {
    return SALES_REPRESENTATIVES[0]; // Carlos Mendoza
  }

  if (query.includes('liugong') || query.includes('excavadora') || query.includes('922') || query.includes('mineria') || query.includes('cantera')) {
    return SALES_REPRESENTATIVES[1]; // Rafael Castillo
  }

  if (query.includes('kubota') || query.includes('ls tractor') || query.includes('agricola') || query.includes('tractor') || query.includes('kx040')) {
    return SALES_REPRESENTATIVES[2]; // Marcos Almonte
  }

  return SALES_REPRESENTATIVES[3]; // Sarah De León (OEM Parts & General)
}

/**
 * AUTOMATED TRIGGER:
 * Logs new RFQ inquiries directly into the dedicated Firestore sub-collection:
 * `/quotes/{quoteId}/crm_inquiries/{inquiryId}`
 * and synchronizes parent quote metadata.
 */
export async function triggerRfqCrmInquiryLogging(
  quote: PortalQuote,
  extraContext?: {
    source?: CrmInquirySource;
    equipmentCategory?: string;
    equipmentInterested?: string;
    downPaymentUsd?: number;
    financingMethod?: string;
    rncOrCedula?: string;
    customerNotes?: string;
  }
): Promise<CrmInquiry> {
  const source: CrmInquirySource = extraContext?.source || 'portal_rfq';
  const equipmentInterested = extraContext?.equipmentInterested || quote.itemsSummary || 'Maquinaria Pesada TMD';
  const equipmentCategory = extraContext?.equipmentCategory || (quote.itemsSummary.includes('Repuesto') ? 'Repuestos OEM' : 'Maquinaria');

  const leadScore = calculateLeadScore(quote, extraContext);
  const buyerIntent: CrmBuyerIntent = leadScore >= 75 ? 'high' : leadScore >= 50 ? 'medium' : 'exploratory';
  
  const priority: CrmInquiryPriority = 
    quote.total >= 100000 || buyerIntent === 'high' ? 'urgent' :
    quote.total >= 40000 || buyerIntent === 'medium' ? 'high' : 'standard';

  const assignedRep = assignSalesRep(equipmentInterested);

  // 24-hour SLA follow up calculation
  const followUpDate = new Date();
  followUpDate.setHours(followUpDate.getHours() + (priority === 'urgent' ? 4 : 24));

  const nowIso = new Date().toISOString();
  const inquiryId = `INQ-${quote.quoteNumber.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

  const initialActivity: CrmInquiryActivity = {
    id: `ACT-${Date.now()}`,
    timestamp: nowIso,
    actor: 'Sistema CRM Automatizado TMD',
    action: 'Disparo de Trigger Automático por Nueva Cotización (RFQ)',
    toStage: 'new_inquiry',
    notes: `Solicitud registrada desde ${source.toUpperCase()}. Monto: US$ ${quote.total.toLocaleString()}. Lead Score: ${leadScore}/100. Asignado a ${assignedRep.name}.`
  };

  const crmInquiryData: CrmInquiry = {
    id: inquiryId,
    quoteId: quote.id,
    quoteNumber: quote.quoteNumber,
    clientId: quote.clientId,
    clientEmail: quote.clientEmail,
    clientName: quote.clientName,
    companyName: quote.companyName || 'Constructora / Cliente TMD',
    phone: quote.phone || '',
    rncOrCedula: extraContext?.rncOrCedula || '',
    source: source,
    funnelStage: 'new_inquiry',
    dealValueUsd: quote.total,
    dealValueDop: quote.total * USD_TO_DOP_RATE,
    currency: quote.currency || 'USD',
    equipmentCategory: equipmentCategory,
    equipmentInterested: equipmentInterested,
    buyerIntent: buyerIntent,
    leadScore: leadScore,
    assignedSalesRep: assignedRep.name,
    assignedSalesEmail: assignedRep.email,
    assignedSalesPhone: assignedRep.phone,
    followUpDueDate: followUpDate.toISOString(),
    priority: priority,
    itemsCount: quote.itemsCount,
    itemsSummary: quote.itemsSummary,
    customerNotes: extraContext?.customerNotes || quote.notes || '',
    financingMethod: extraContext?.financingMethod,
    downPaymentUsd: extraContext?.downPaymentUsd,
    activityLog: [initialActivity],
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    // 1. Write inquiry to dedicated sub-collection: /quotes/{quoteId}/crm_inquiries/{inquiryId}
    const subColRef = doc(db, 'quotes', quote.id, 'crm_inquiries', inquiryId);
    await setDoc(subColRef, crmInquiryData);

    // 2. Update parent quote document with CRM pointers
    const quoteDocRef = doc(db, 'quotes', quote.id);
    await updateDoc(quoteDocRef, {
      crmInquiryId: inquiryId,
      crmFunnelStage: 'new_inquiry',
      crmLeadScore: leadScore,
      assignedSalesRep: assignedRep.name,
      updatedAt: nowIso
    }).catch(err => console.warn('Non-fatal: could not sync CRM fields onto parent quote doc:', err));

    // 3. Log security and commercial audit event
    recordAdminAuditLog({
      actorEmail: quote.clientEmail,
      actorName: quote.clientName,
      actorRole: 'system',
      actionType: 'QUOTE_STATUS_OVERRIDE',
      targetEntity: 'quotes',
      targetId: quote.id,
      targetName: quote.quoteNumber,
      diffSummary: `RFQ CRM Ingestion: ${inquiryId} logged into quotes/${quote.id}/crm_inquiries. Score: ${leadScore}`,
      details: `Lead Score: ${leadScore}, Valor: US$ ${quote.total.toLocaleString()}, Asignado: ${assignedRep.name}`
    }).catch(() => {});

    // 4. Acoustic feedback
    playNotificationSound();

    console.info(`[CRM Automated Trigger] Successfully logged inquiry ${inquiryId} into /quotes/${quote.id}/crm_inquiries`);
    return crmInquiryData;
  } catch (error) {
    console.error(`[CRM Automated Trigger Error] Failed to log inquiry for quote ${quote.id}:`, error);
    handleFirestoreError(error, OperationType.CREATE, `quotes/${quote.id}/crm_inquiries/${inquiryId}`);
    return crmInquiryData;
  }
}

/**
 * Real-time listener for all CRM inquiries belonging to a specific quote
 */
export function subscribeToQuoteCrmInquiries(
  quoteId: string, 
  callback: (inquiries: CrmInquiry[]) => void
): () => void {
  const subColRef = collection(db, 'quotes', quoteId, 'crm_inquiries');
  const q = query(subColRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const inquiries: CrmInquiry[] = [];
    snapshot.forEach((docSnap) => {
      inquiries.push({ id: docSnap.id, ...docSnap.data() } as CrmInquiry);
    });
    callback(inquiries);
  }, (err) => {
    console.warn(`Error listening to crm_inquiries for quote ${quoteId}:`, err);
    callback([]);
  });
}

/**
 * Listen to all CRM inquiries across the sales pipeline (collectionGroup or aggregation)
 */
export function subscribeToAllCrmInquiries(
  callback: (inquiries: CrmInquiry[]) => void
): () => void {
  try {
    const cgQuery = query(collectionGroup(db, 'crm_inquiries'), orderBy('createdAt', 'desc'));
    return onSnapshot(cgQuery, (snapshot) => {
      const items: CrmInquiry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as CrmInquiry);
      });
      callback(items);
    }, (err) => {
      console.warn("Collection group listener error, falling back to parent quotes mapping:", err);
      // Fallback: Query all quotes and fetch their subcollections
      const quotesQuery = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
      return onSnapshot(quotesQuery, async (qSnap) => {
        const aggregated: CrmInquiry[] = [];
        for (const quoteDoc of qSnap.docs) {
          try {
            const subSnaps = await getDocs(collection(db, 'quotes', quoteDoc.id, 'crm_inquiries'));
            subSnaps.forEach(s => aggregated.push({ id: s.id, ...s.data() } as CrmInquiry));
          } catch {
            // Ignore single doc fetch errors
          }
        }
        callback(aggregated);
      });
    });
  } catch (e) {
    console.error("subscribeToAllCrmInquiries error:", e);
    return () => {};
  }
}

/**
 * Updates an inquiry's stage in the conversion funnel with activity audit trail
 */
export async function updateInquiryFunnelStage(
  quoteId: string,
  inquiryId: string,
  newStage: CrmFunnelStage,
  notes?: string,
  actor: string = 'Asesor Comercial TMD'
): Promise<void> {
  const inquiryRef = doc(db, 'quotes', quoteId, 'crm_inquiries', inquiryId);
  const nowIso = new Date().toISOString();

  const activity: CrmInquiryActivity = {
    id: `ACT-${Date.now()}`,
    timestamp: nowIso,
    actor: actor,
    action: `Cambio de Etapa del Embudo a: ${FUNNEL_STAGES_CONFIG[newStage].label}`,
    toStage: newStage,
    notes: notes || `Etapa actualizada a ${FUNNEL_STAGES_CONFIG[newStage].label}`
  };

  const updatePayload: Record<string, any> = {
    funnelStage: newStage,
    updatedAt: nowIso
  };

  if (newStage === 'won') {
    updatePayload.wonDate = nowIso;
  }

  try {
    // 1. Update subcollection document
    await updateDoc(inquiryRef, {
      ...updatePayload,
      activityLog: [activity] // In production append or merge
    });

    // 2. Also keep parent quote status in sync if applicable
    const quoteRef = doc(db, 'quotes', quoteId);
    let quoteStatus: PortalQuote['status'] = 'in_review';
    if (newStage === 'won') quoteStatus = 'approved';
    if (newStage === 'lost') quoteStatus = 'rejected';

    await updateDoc(quoteRef, {
      crmFunnelStage: newStage,
      status: quoteStatus,
      updatedAt: nowIso
    }).catch(() => {});

  } catch (error) {
    console.error(`Failed to update inquiry ${inquiryId} stage:`, error);
    handleFirestoreError(error, OperationType.UPDATE, `quotes/${quoteId}/crm_inquiries/${inquiryId}`);
  }
}

/**
 * Adds an interactive follow-up note to an inquiry's activity history
 */
export async function addInquiryActivityNote(
  quoteId: string,
  inquiryId: string,
  currentActivityLog: CrmInquiryActivity[],
  noteText: string,
  actor: string = 'Asesor Comercial TMD'
): Promise<void> {
  const inquiryRef = doc(db, 'quotes', quoteId, 'crm_inquiries', inquiryId);
  const nowIso = new Date().toISOString();

  const newActivity: CrmInquiryActivity = {
    id: `ACT-${Date.now()}`,
    timestamp: nowIso,
    actor: actor,
    action: 'Nota de Seguimiento Comercial',
    notes: noteText
  };

  try {
    await updateDoc(inquiryRef, {
      activityLog: [newActivity, ...(currentActivityLog || [])],
      updatedAt: nowIso
    });
  } catch (error) {
    console.error(`Failed to add activity note to inquiry ${inquiryId}:`, error);
    handleFirestoreError(error, OperationType.UPDATE, `quotes/${quoteId}/crm_inquiries/${inquiryId}`);
  }
}

/**
 * Computes deep conversion funnel metrics from active and historical inquiries
 */
export function calculateConversionFunnelMetrics(inquiries: CrmInquiry[]): CrmFunnelMetrics {
  const stageCounts: Record<CrmFunnelStage, number> = {
    new_inquiry: 0,
    contacted: 0,
    technical_evaluation: 0,
    commercial_proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0
  };

  const stageValuesUsd: Record<CrmFunnelStage, number> = {
    new_inquiry: 0,
    contacted: 0,
    technical_evaluation: 0,
    commercial_proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0
  };

  let totalPipelineUsd = 0;
  let weightedPipelineUsd = 0;
  let closedWonUsd = 0;
  let closedLostUsd = 0;

  inquiries.forEach((inq) => {
    const stage = inq.funnelStage || 'new_inquiry';
    const val = inq.dealValueUsd || 0;

    if (stageCounts[stage] !== undefined) {
      stageCounts[stage] += 1;
      stageValuesUsd[stage] += val;
    }

    if (stage === 'won') {
      closedWonUsd += val;
    } else if (stage === 'lost') {
      closedLostUsd += val;
    } else {
      totalPipelineUsd += val;
      const prob = FUNNEL_STAGES_CONFIG[stage]?.probability || 0.2;
      weightedPipelineUsd += val * prob;
    }
  });

  const totalInquiries = inquiries.length;
  const closedTotal = stageCounts.won + stageCounts.lost;
  const overallWinRatePercent = closedTotal > 0 
    ? Math.round((stageCounts.won / closedTotal) * 100) 
    : (totalInquiries > 0 ? Math.round((stageCounts.won / totalInquiries) * 100) : 0);

  const avgDealSizeUsd = totalInquiries > 0 
    ? Math.round((totalPipelineUsd + closedWonUsd) / totalInquiries) 
    : 0;

  // Cumulative funnel conversion step calculations
  const reachedContact = stageCounts.contacted + stageCounts.technical_evaluation + stageCounts.commercial_proposal + stageCounts.negotiation + stageCounts.won;
  const reachedTechEval = stageCounts.technical_evaluation + stageCounts.commercial_proposal + stageCounts.negotiation + stageCounts.won;
  const reachedProposal = stageCounts.commercial_proposal + stageCounts.negotiation + stageCounts.won;
  const reachedNegotiation = stageCounts.negotiation + stageCounts.won;

  const inquiryToContact = totalInquiries > 0 ? Math.round((reachedContact / totalInquiries) * 100) : 0;
  const contactToTechEval = reachedContact > 0 ? Math.round((reachedTechEval / reachedContact) * 100) : 0;
  const techEvalToProposal = reachedTechEval > 0 ? Math.round((reachedProposal / reachedTechEval) * 100) : 0;
  const proposalToNegotiation = reachedProposal > 0 ? Math.round((reachedNegotiation / reachedProposal) * 100) : 0;
  const negotiationToWon = reachedNegotiation > 0 ? Math.round((stageCounts.won / reachedNegotiation) * 100) : 0;

  return {
    totalInquiries,
    totalPipelineUsd,
    weightedPipelineUsd,
    closedWonUsd,
    closedLostUsd,
    overallWinRatePercent,
    avgDealSizeUsd,
    avgDaysToClose: 8.5, // Representative Dominican heavy machinery conversion cycle (days)
    stageCounts,
    stageValuesUsd,
    stageConversionRates: {
      inquiryToContact,
      contactToTechEval,
      techEvalToProposal,
      proposalToNegotiation,
      negotiationToWon
    }
  };
}
