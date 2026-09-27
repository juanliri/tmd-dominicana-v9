import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Filter, 
  Search, 
  TrendingUp, 
  DollarSign, 
  User, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  ChevronRight, 
  Flame, 
  Target, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  BarChart3, 
  Zap, 
  Plus, 
  Check, 
  X,
  PieChart as PieChartIcon,
  HardHat
} from 'lucide-react';
import { 
  CrmInquiry, 
  CrmFunnelStage, 
  CrmInquirySource, 
  CrmBuyerIntent, 
  CrmInquiryPriority, 
  CrmFunnelMetrics, 
  PortalQuote, 
  Currency 
} from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { 
  FUNNEL_STAGES_CONFIG, 
  SALES_REPRESENTATIVES, 
  calculateConversionFunnelMetrics, 
  subscribeToAllCrmInquiries, 
  updateInquiryFunnelStage, 
  addInquiryActivityNote, 
  triggerRfqCrmInquiryLogging 
} from '../../services/crmService';
import { fetchSalesLeads } from '../../services/tractorCatalogService';

interface AdminCrmFunnelViewProps {
  quotes: PortalQuote[];
  currency: Currency;
  onNavigateToQuotes?: () => void;
  onOpenQuotePdf?: (quote: PortalQuote) => void;
}

export const AdminCrmFunnelView: React.FC<AdminCrmFunnelViewProps> = ({
  quotes,
  currency,
  onNavigateToQuotes,
  onOpenQuotePdf
}) => {
  const [inquiries, setInquiries] = useState<CrmInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<CrmInquiry | null>(null);
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isSimulatingTrigger, setIsSimulatingTrigger] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'funnel_analytics' | 'table'>('pipeline');

  // Format currency helper
  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Real-time listener for all CRM subcollection inquiries
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllCrmInquiries((items) => {
      // If there are existing quotes without subcollection inquiries yet, synthesize baseline mapping
      if (items.length === 0 && quotes.length > 0) {
        const synthesized: CrmInquiry[] = quotes.map((q) => {
          const score = q.total >= 80000 ? 88 : q.total >= 40000 ? 74 : 62;
          const stage: CrmFunnelStage = 
            q.status === 'approved' ? 'won' : 
            q.status === 'rejected' ? 'lost' : 
            q.status === 'in_review' ? 'commercial_proposal' : 'new_inquiry';
          
          return {
            id: `INQ-${q.quoteNumber || q.id}`,
            quoteId: q.id,
            quoteNumber: q.quoteNumber || 'COT-2026-000',
            clientId: q.clientId,
            clientEmail: q.clientEmail,
            clientName: q.clientName,
            companyName: q.companyName || 'Constructora Dominicana',
            phone: q.phone || '+1 (809) 560-0000',
            source: 'portal_rfq',
            funnelStage: stage,
            dealValueUsd: q.total,
            dealValueDop: q.total * USD_TO_DOP_RATE,
            currency: q.currency || 'USD',
            equipmentInterested: q.itemsSummary,
            equipmentCategory: q.itemsSummary.includes('JCB') ? 'Retroexcavadoras' : 'Maquinaria Pesada',
            buyerIntent: score >= 75 ? 'high' : 'medium',
            leadScore: score,
            assignedSalesRep: 'Ing. Carlos Mendoza',
            assignedSalesEmail: 'cmendoza@tmd.rd',
            assignedSalesPhone: '+1 (809) 560-4001',
            followUpDueDate: new Date(Date.now() + 86400000).toISOString(),
            priority: q.total >= 80000 ? 'urgent' : 'high',
            itemsCount: q.itemsCount,
            itemsSummary: q.itemsSummary,
            customerNotes: q.notes,
            activityLog: [
              {
                id: `ACT-1`,
                timestamp: q.createdAt,
                actor: 'Sistema CRM TMD',
                action: 'Solicitud RFQ Registrada en Subcolección',
                toStage: stage,
                notes: `Presupuesto inicial creado por valor de US$ ${q.total.toLocaleString()}`
              }
            ],
            createdAt: q.createdAt,
            updatedAt: q.updatedAt
          };
        });
        setInquiries(synthesized);
      } else {
        setInquiries(items);
      }

      // Also merge direct Machinery & Tractor Sales leads from /sales_leads collection
      fetchSalesLeads().then((leads) => {
        if (leads && leads.length > 0) {
          const mappedLeads: CrmInquiry[] = leads.map((l) => {
            const stage: CrmFunnelStage = 
              l.status === 'won' ? 'won' :
              l.status === 'lost' ? 'lost' :
              l.status === 'negotiating' ? 'negotiation' :
              l.status === 'quote_sent' ? 'commercial_proposal' :
              l.status === 'contacted' ? 'contacted' : 'new_inquiry';

            return {
              id: `LEAD-${l.id}`,
              quoteId: l.listingId,
              quoteNumber: `LEAD-${l.machineBrand.substring(0, 3).toUpperCase()}-${l.id.substring(l.id.length - 4)}`,
              clientId: l.id,
              clientEmail: l.email,
              clientName: l.customerName,
              companyName: l.companyName || 'Empresa Dominicana',
              phone: l.phone,
              source: 'portal_rfq',
              funnelStage: stage,
              dealValueUsd: l.estimatedPriceUsd,
              dealValueDop: l.estimatedPriceUsd * USD_TO_DOP_RATE,
              currency: 'USD',
              equipmentInterested: `${l.machineBrand} ${l.machineModel}`,
              equipmentCategory: 'Tractores & Maquinaria Pesada',
              buyerIntent: l.urgency === 'immediate' ? 'high' : 'medium',
              leadScore: l.acquisitionType === 'cash_purchase' ? 95 : l.hasTradeIn ? 85 : 78,
              assignedSalesRep: l.assignedSalesRepName || 'Ing. Carlos Mendoza',
              assignedSalesEmail: l.assignedSalesRepEmail || 'cmendoza@tmd.rd',
              assignedSalesPhone: '+1 (809) 560-4001',
              followUpDueDate: new Date(Date.now() + 86400000).toISOString(),
              priority: l.urgency === 'immediate' ? 'urgent' : 'high',
              itemsCount: 1,
              itemsSummary: `${l.machineTitle} (${l.province})`,
              customerNotes: l.notes || `Modalidad: ${l.acquisitionType}. Banco: ${l.preferredBank || 'N/A'}. Trade-In: ${l.hasTradeIn ? 'Sí' : 'No'}`,
              activityLog: [
                {
                  id: `ACT-LEAD-1`,
                  timestamp: l.createdAt,
                  actor: 'Portal Web TMD (Catálogo de Maquinaria)',
                  action: 'Solicitud de Proforma Recibida',
                  toStage: stage,
                  notes: `Cliente solicitó proforma para ${l.machineBrand} ${l.machineModel}.`
                }
              ],
              createdAt: l.createdAt,
              updatedAt: l.updatedAt
            };
          });

          setInquiries((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = mappedLeads.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        }
      }).catch((e) => console.warn('Sales leads fetch error:', e));

      setLoading(false);
    });

    return () => unsubscribe();
  }, [quotes]);

  // Funnel Analytics Calculations
  const metrics: CrmFunnelMetrics = useMemo(() => {
    return calculateConversionFunnelMetrics(inquiries);
  }, [inquiries]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTerm = 
          inq.quoteNumber.toLowerCase().includes(term) ||
          inq.clientName.toLowerCase().includes(term) ||
          (inq.companyName && inq.companyName.toLowerCase().includes(term)) ||
          inq.clientEmail.toLowerCase().includes(term) ||
          inq.phone.includes(term) ||
          (inq.equipmentInterested && inq.equipmentInterested.toLowerCase().includes(term)) ||
          inq.assignedSalesRep.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }

      // Stage Filter
      if (selectedStageFilter !== 'all' && inq.funnelStage !== selectedStageFilter) {
        return false;
      }

      // Rep Filter
      if (selectedRepFilter !== 'all' && !inq.assignedSalesRep.includes(selectedRepFilter)) {
        return false;
      }

      // Priority Filter
      if (selectedPriorityFilter !== 'all' && inq.priority !== selectedPriorityFilter) {
        return false;
      }

      return true;
    });
  }, [inquiries, searchTerm, selectedStageFilter, selectedRepFilter, selectedPriorityFilter]);

  // Grouped by Funnel Stage for Pipeline View
  const stageGroups: Record<CrmFunnelStage, CrmInquiry[]> = useMemo(() => {
    const groups: Record<CrmFunnelStage, CrmInquiry[]> = {
      new_inquiry: [],
      contacted: [],
      technical_evaluation: [],
      commercial_proposal: [],
      negotiation: [],
      won: [],
      lost: []
    };

    filteredInquiries.forEach((inq) => {
      const stage = inq.funnelStage || 'new_inquiry';
      if (groups[stage]) {
        groups[stage].push(inq);
      }
    });

    return groups;
  }, [filteredInquiries]);

  // Stage change handler
  const handleStageChange = async (inquiry: CrmInquiry, newStage: CrmFunnelStage) => {
    try {
      await updateInquiryFunnelStage(
        inquiry.quoteId,
        inquiry.id,
        newStage,
        `Etapa cambiada a ${FUNNEL_STAGES_CONFIG[newStage].label} desde el CRM Funnel Board.`
      );
      
      // Update local state smoothly
      setInquiries((prev) => 
        prev.map((item) => 
          item.id === inquiry.id ? { ...item, funnelStage: newStage, updatedAt: new Date().toISOString() } : item
        )
      );

      if (selectedInquiry && selectedInquiry.id === inquiry.id) {
        setSelectedInquiry((prev) => prev ? { ...prev, funnelStage: newStage } : null);
      }

      setActionSuccess(`Lead movido a: ${FUNNEL_STAGES_CONFIG[newStage].label}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error("Error moving inquiry stage:", err);
    }
  };

  // Add activity note handler
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !newNoteText.trim()) return;

    setIsSavingNote(true);
    try {
      await addInquiryActivityNote(
        selectedInquiry.quoteId,
        selectedInquiry.id,
        selectedInquiry.activityLog || [],
        newNoteText.trim()
      );

      const newActivity = {
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Asesor Comercial TMD',
        action: 'Nota de Seguimiento Comercial',
        notes: newNoteText.trim()
      };

      setSelectedInquiry((prev) => 
        prev ? { ...prev, activityLog: [newActivity, ...(prev.activityLog || [])] } : null
      );

      setInquiries((prev) => 
        prev.map((item) => 
          item.id === selectedInquiry.id 
            ? { ...item, activityLog: [newActivity, ...(item.activityLog || [])] } 
            : item
        )
      );

      setNewNoteText('');
      setActionSuccess('Nota de seguimiento guardada en la subcolección');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding activity note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Automated trigger test simulation
  const handleSimulateAutomatedTrigger = async () => {
    setIsSimulatingTrigger(true);
    try {
      const demoQuoteNum = `COT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const randomNames = [
        { name: 'Ing. Alejandro Tavares', comp: 'Consorcio Vial del Norte SRL', phone: '+1 (809) 580-9921', equip: 'Excavadora LiuGong 922E HD (22 Ton)', val: 148500, cat: 'Excavadoras' },
        { name: 'Arq. Mariana Santana', comp: 'Constructora Punta Cana Towers', phone: '+1 (829) 450-1209', equip: 'Retroexcavadora JCB 3CX Eco 4WD + Kit 500h', val: 92850, cat: 'Retroexcavadoras' },
        { name: 'Lic. Domingo Peralta', comp: 'Agropecuaria Cibao Central', phone: '+1 (809) 560-3344', equip: 'Tractor Agrícola LS Plus 100 4WD Cabin', val: 56000, cat: 'Tractores' }
      ];
      const selectedDemo = randomNames[Math.floor(Math.random() * randomNames.length)];

      const simulatedQuote: PortalQuote = {
        id: `demo-quote-${Date.now()}`,
        quoteNumber: demoQuoteNum,
        clientId: 'demo-client-uid',
        clientEmail: `${selectedDemo.name.toLowerCase().replace(/[^a-z]/g, '')}@empresa.rd`,
        clientName: selectedDemo.name,
        companyName: selectedDemo.comp,
        phone: selectedDemo.phone,
        status: 'submitted',
        currency: 'USD',
        subtotal: selectedDemo.val,
        itbis: Math.round(selectedDemo.val * 0.18),
        total: Math.round(selectedDemo.val * 1.18),
        itemsCount: 2,
        itemsSummary: `1x ${selectedDemo.equip}`,
        notes: 'Solicitud enviada para financiamiento comercial con entrega en patio Autopista Duarte Km 22.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createdInquiry = await triggerRfqCrmInquiryLogging(simulatedQuote, {
        source: 'portal_rfq',
        equipmentCategory: selectedDemo.cat,
        equipmentInterested: selectedDemo.equip,
        rncOrCedula: '1-31-09876-2',
        financingMethod: 'Leasing Popular (36 Meses)'
      });

      setInquiries((prev) => [createdInquiry, ...prev]);
      setSelectedInquiry(createdInquiry);
      setActionSuccess(`¡Trigger RFQ Disparado! Inquiry ${createdInquiry.id} registrado en subcolección.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Trigger simulation failed:', err);
    } finally {
      setIsSimulatingTrigger(false);
    }
  };

  const getScoreColorBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score >= 55) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
  };

  const getPriorityBadge = (priority: CrmInquiryPriority) => {
    if (priority === 'urgent') return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 font-black';
    if (priority === 'high') return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 font-bold';
    return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
  };

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-900 dark:text-white">
      {/* Action Toast Alert */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-amber-500 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Trigger RFQ & Subcolección Firestore</span>
            </span>
            <span className="text-[11px] text-zinc-400">
              /quotes/&#123;id&#125;/crm_inquiries
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Embudo Comercial & Pipeline de Ventas CRM</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Seguimiento en tiempo real de leads, cualificación técnica, scoring de contratistas y ratios de conversión.
          </p>
        </div>

        {/* View mode toggle & trigger simulation button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('funnel_analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'funnel_analytics'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Métricas del Embudo
            </button>
          </div>

          <button
            onClick={handleSimulateAutomatedTrigger}
            disabled={isSimulatingTrigger}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Genera una cotización y dispara el trigger a la subcolección CRM de Firestore"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulatingTrigger ? 'Disparando...' : 'Probar Trigger RFQ'}</span>
          </button>
        </div>
      </div>

      {/* Top Funnel KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Pipeline */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Pipeline Total</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-zinc-900 dark:text-white">
            {formatMoney(metrics.totalPipelineUsd)}
          </div>
          <div className="text-[10px] text-zinc-500">
            {metrics.totalInquiries} solicitudes activas
          </div>
        </div>

        {/* Weighted Pipeline */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Ponderado (Prob.)</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400">
            {formatMoney(metrics.weightedPipelineUsd)}
          </div>
          <div className="text-[10px] text-zinc-500">
            Valor ajustado por etapa
          </div>
        </div>

        {/* Closed Won */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Cerrado Ganado</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatMoney(metrics.closedWonUsd)}
          </div>
          <div className="text-[10px] text-zinc-500">
            {metrics.stageCounts.won} órdenes confirmadas
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Tasa de Cierre</span>
            <Target className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400">
            {metrics.overallWinRatePercent}%
          </div>
          <div className="text-[10px] text-zinc-500">
            Win Rate Global
          </div>
        </div>

        {/* Average Deal Size */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Ticket Promedio</span>
            <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-zinc-900 dark:text-white">
            {formatMoney(metrics.avgDealSizeUsd)}
          </div>
          <div className="text-[10px] text-zinc-500">
            Por proforma cotizada
          </div>
        </div>

        {/* Velocity */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
            <span>Velocidad Cierre</span>
            <Clock className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-zinc-900 dark:text-white">
            {metrics.avgDaysToClose} d
          </div>
          <div className="text-[10px] text-zinc-500">
            Ciclo promedio de venta
          </div>
        </div>
      </div>

      {/* Visual Conversion Funnel Flow Step Bar */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Flujo y Tasas de Conversión entre Etapas</span>
          </span>
          <span className="text-[11px] font-bold text-zinc-400">
            Total Leads Procesados: {metrics.totalInquiries}
          </span>
        </div>

        {/* Interactive Step Funnel Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Step 1: New Inquiry */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'new_inquiry' ? 'all' : 'new_inquiry')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'new_inquiry' 
                ? 'bg-blue-500/15 border-blue-500 ring-2 ring-blue-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">1. RFQ Inicial</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.new_inquiry}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 dark:text-white">
              {formatMoney(metrics.stageValuesUsd.new_inquiry)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Conversión</span>
              <strong className="text-emerald-500 font-bold">{metrics.stageConversionRates.inquiryToContact}%</strong>
            </div>
          </div>

          {/* Step 2: Contacted */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'contacted' ? 'all' : 'contacted')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'contacted' 
                ? 'bg-purple-500/15 border-purple-500 ring-2 ring-purple-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">2. Contactado</span>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.contacted}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 dark:text-white">
              {formatMoney(metrics.stageValuesUsd.contacted)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Aprob. Técnica</span>
              <strong className="text-emerald-500 font-bold">{metrics.stageConversionRates.contactToTechEval}%</strong>
            </div>
          </div>

          {/* Step 3: Technical Evaluation */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'technical_evaluation' ? 'all' : 'technical_evaluation')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'technical_evaluation' 
                ? 'bg-cyan-500/15 border-cyan-500 ring-2 ring-cyan-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400">3. Eval. Técnica</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.technical_evaluation}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 dark:text-white">
              {formatMoney(metrics.stageValuesUsd.technical_evaluation)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Proforma NCF</span>
              <strong className="text-emerald-500 font-bold">{metrics.stageConversionRates.techEvalToProposal}%</strong>
            </div>
          </div>

          {/* Step 4: Commercial Proposal */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'commercial_proposal' ? 'all' : 'commercial_proposal')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'commercial_proposal' 
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">4. Proforma NCF</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.commercial_proposal}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 dark:text-white">
              {formatMoney(metrics.stageValuesUsd.commercial_proposal)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Negociación</span>
              <strong className="text-emerald-500 font-bold">{metrics.stageConversionRates.proposalToNegotiation}%</strong>
            </div>
          </div>

          {/* Step 5: Negotiation */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'negotiation' ? 'all' : 'negotiation')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'negotiation' 
                ? 'bg-orange-500/15 border-orange-500 ring-2 ring-orange-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-orange-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400">5. Negociación</span>
              <span className="px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.negotiation}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-zinc-900 dark:text-white">
              {formatMoney(metrics.stageValuesUsd.negotiation)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Cierre Orden</span>
              <strong className="text-emerald-500 font-bold">{metrics.stageConversionRates.negotiationToWon}%</strong>
            </div>
          </div>

          {/* Step 6: Won */}
          <div 
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'won' ? 'all' : 'won')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
              selectedStageFilter === 'won' 
                ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">6. Ganadas (PO)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-black">
                {metrics.stageCounts.won}
              </span>
            </div>
            <div className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
              {formatMoney(metrics.stageValuesUsd.won)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
              <span>Win Rate Total</span>
              <strong className="text-emerald-500 font-bold">{metrics.overallWinRatePercent}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por # cotización, contratista, empresa, equipo, asesor..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Stage filter dropdown */}
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
          >
            <option value="all">Todas las Etapas ({inquiries.length})</option>
            <option value="new_inquiry">1. Nuevas Solicitudes (RFQ)</option>
            <option value="contacted">2. Contactados</option>
            <option value="technical_evaluation">3. Evaluación Técnica</option>
            <option value="commercial_proposal">4. Propuesta Comercial</option>
            <option value="negotiation">5. Negociación</option>
            <option value="won">6. Cerradas Ganadas</option>
            <option value="lost">Perdidas / Descartadas</option>
          </select>

          {/* Rep filter dropdown */}
          <select
            value={selectedRepFilter}
            onChange={(e) => setSelectedRepFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
          >
            <option value="all">Todos los Asesores</option>
            {SALES_REPRESENTATIVES.map((r) => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
          >
            <option value="all">Prioridad (Todas)</option>
            <option value="urgent">Urgente (&gt;$100k)</option>
            <option value="high">Alta Prioridad</option>
            <option value="standard">Estándar</option>
          </select>

          {(selectedStageFilter !== 'all' || selectedRepFilter !== 'all' || selectedPriorityFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedStageFilter('all');
                setSelectedRepFilter('all');
                setSelectedPriorityFilter('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Main View: Pipeline Kanban Board */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {(['new_inquiry', 'contacted', 'technical_evaluation', 'commercial_proposal', 'negotiation', 'won'] as CrmFunnelStage[]).map((stageKey) => {
            const config = FUNNEL_STAGES_CONFIG[stageKey];
            const stageItems = stageGroups[stageKey] || [];
            const stageTotalUsd = stageItems.reduce((acc, i) => acc + i.dealValueUsd, 0);

            return (
              <div 
                key={stageKey}
                className="bg-zinc-50/70 dark:bg-zinc-900/60 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col min-w-[280px] max-h-[750px] shadow-xs"
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 rounded-t-3xl ${config.badgeBg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      {config.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-[10px] font-mono font-bold shadow-xs">
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-black text-zinc-800 dark:text-zinc-200">
                    {formatMoney(stageTotalUsd)}
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-3 overflow-y-auto space-y-3 flex-1">
                  {stageItems.length === 0 ? (
                    <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-300 dark:border-zinc-700/60 rounded-2xl">
                      Sin solicitudes en esta etapa
                    </div>
                  ) : (
                    stageItems.map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className="p-3.5 bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                      >
                        {/* Card Top: Code & Score */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 truncate">
                            {inq.quoteNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black border ${getScoreColorBadge(inq.leadScore)}`} title={`Lead Score: ${inq.leadScore}/100`}>
                              ★ {inq.leadScore}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase border ${getPriorityBadge(inq.priority)}`}>
                              {inq.priority}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Company */}
                        <div>
                          <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                            {inq.clientName}
                          </h4>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                            {inq.companyName || 'Empresa'}
                          </span>
                        </div>

                        {/* Machinery & Value */}
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 space-y-0.5">
                          <div className="text-[10px] text-zinc-600 dark:text-zinc-300 font-semibold truncate">
                            {inq.equipmentInterested || inq.itemsSummary}
                          </div>
                          <div className="text-xs font-mono font-black text-zinc-900 dark:text-white">
                            {formatMoney(inq.dealValueUsd)}
                          </div>
                        </div>

                        {/* Rep & Action */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-700/50">
                          <span className="truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-zinc-400" />
                            <span>{inq.assignedSalesRep?.split(' ')[1] || 'Asesor'}</span>
                          </span>

                          <span className="text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            <span>Ver</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail & Activity Log Modal */}
      {selectedInquiry && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-black font-black">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                      Subcolección CRM Firestore
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {selectedInquiry.id}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {selectedInquiry.clientName} — {selectedInquiry.quoteNumber}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-900 dark:text-white">
              {/* Top Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Monto Deal Proforma</span>
                  <strong className="text-base font-black font-mono text-zinc-900 dark:text-white">
                    {formatMoney(selectedInquiry.dealValueUsd)}
                  </strong>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Lead Score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black border ${getScoreColorBadge(selectedInquiry.leadScore)}`}>
                      ★ {selectedInquiry.leadScore} / 100
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Intención de Compra</span>
                  <strong className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 block mt-1">
                    {selectedInquiry.buyerIntent === 'high' ? 'Alta (Cierre Inmediato)' : selectedInquiry.buyerIntent === 'medium' ? 'Media (En Evaluación)' : 'Exploratoria'}
                  </strong>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Canal Origen</span>
                  <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block mt-1">
                    {selectedInquiry.source.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stage Progression Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mover Etapa en el Embudo de Ventas</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['new_inquiry', 'contacted', 'technical_evaluation', 'commercial_proposal', 'negotiation', 'won', 'lost'] as CrmFunnelStage[]).map((stg) => {
                    const cfg = FUNNEL_STAGES_CONFIG[stg];
                    const isActive = selectedInquiry.funnelStage === stg;
                    return (
                      <button
                        key={stg}
                        onClick={() => handleStageChange(selectedInquiry, stg)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                          isActive
                            ? `${cfg.badgeBg} border-amber-500 ring-2 ring-amber-500/30 font-black`
                            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/80 hover:border-amber-500/50 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="truncate">{cfg.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contractor & Commercial Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Client Contact Info */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-black text-zinc-400 block">
                    Ficha del Contratista / Comprador
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-bold">{selectedInquiry.companyName || 'Constructora / Cliente TMD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{selectedInquiry.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-amber-500 hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <a href={`mailto:${selectedInquiry.clientEmail}`} className="hover:underline">
                        {selectedInquiry.clientEmail}
                      </a>
                    </div>
                  </div>

                  {/* Direct WhatsApp Callout */}
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${selectedInquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${selectedInquiry.clientName}, le contactamos de TMD Dominicana respecto a su solicitud de cotización ${selectedInquiry.quoteNumber} para ${selectedInquiry.equipmentInterested}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Assigned Sales Rep */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] uppercase font-black text-zinc-400 block">
                    Asesor Comercial Asignado (SLA &lt;24h)
                  </span>
                  <div className="space-y-1.5">
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {selectedInquiry.assignedSalesRep}
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                      {selectedInquiry.assignedSalesEmail}
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                      {selectedInquiry.assignedSalesPhone || '+1 (809) 560-4000'}
                    </div>
                    <div className="text-[11px] text-zinc-400 pt-1">
                      Fecha Límite Primer Contacto: <strong className="text-amber-500">{new Date(selectedInquiry.followUpDueDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline & Log Notes */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Historial de Actividades & Bitácora de Subcolección</span>
                </span>

                {/* New Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Registrar llamada, cotización enviada, condición de leasing acordada..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isSavingNote || !newNoteText.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSavingNote ? 'Guardando...' : 'Anotar'}</span>
                  </button>
                </form>

                {/* Timeline Items */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedInquiry.activityLog || []).map((act, idx) => (
                    <div 
                      key={act.id || idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-bold text-amber-600 dark:text-amber-400">{act.actor}</span>
                        <span>{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {act.action}
                      </div>
                      {act.notes && (
                        <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                          {act.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const matchQuote = quotes.find(q => q.id === selectedInquiry.quoteId);
                    if (matchQuote && onOpenQuotePdf) {
                      onOpenQuotePdf(matchQuote);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Proforma Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
