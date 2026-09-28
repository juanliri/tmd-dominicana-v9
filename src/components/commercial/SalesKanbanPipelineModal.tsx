import React, { useState } from 'react';
import {
  Kanban,
  DollarSign,
  Building2,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type PipelineStage = 'new_request' | 'negotiation' | 'bank_approval' | 'delivered';

export interface DealCard {
  id: string;
  code: string;
  clientName: string;
  companyName: string;
  rnc: string;
  machineModel: string;
  dealValueUsd: number;
  stage: PipelineStage;
  assignedAdvisor: string;
  daysInStage: number;
  bankPartner?: string;
  notes: string;
  probability: number;
}

const INITIAL_DEALS: DealCard[] = [
  {
    id: 'D-01',
    code: 'COT-2026-9921',
    clientName: 'Ing. Carlos Mendoza',
    companyName: 'Constructora Malespín S.A.S.',
    rnc: '1-01-02412-2',
    machineModel: 'LiuGong 922E HD (x2 Unidades)',
    dealValueUsd: 298000,
    stage: 'new_request',
    assignedAdvisor: 'Lic. Arnaldo Peña',
    daysInStage: 2,
    notes: 'Cotización solicitada para proyecto circunvalación Baní.',
    probability: 40
  },
  {
    id: 'D-02',
    code: 'COT-2026-9884',
    clientName: 'Lic. Roberto Castillo',
    companyName: 'Agregados del Caribe S.R.L.',
    rnc: '1-31-88412-9',
    machineModel: 'LiuGong 856H Pala Cargadora 3.5m³',
    dealValueUsd: 185000,
    stage: 'negotiation',
    assignedAdvisor: 'Ing. Marcos Guzmán',
    daysInStage: 5,
    notes: 'Prueba en patio de pruebas Km 22 completada con éxito. Negociando bono por permuta de equipo usado.',
    probability: 65
  },
  {
    id: 'D-03',
    code: 'COT-2026-9740',
    clientName: 'Ing. Patricia Jiménez',
    companyName: 'Ingeniería & Suelos del Este',
    rnc: '1-02-44910-3',
    machineModel: 'JCB 3DX Super Retroexcavadora 4x4',
    dealValueUsd: 94000,
    stage: 'bank_approval',
    assignedAdvisor: 'Ing. Patricia Valdez',
    daysInStage: 4,
    bankPartner: 'Banco BHD (Leasing 48 Meses)',
    notes: 'Expediente crediticio pre-aprobado. En espera de carta de compromiso bancaria.',
    probability: 85
  },
  {
    id: 'D-04',
    code: 'COT-2026-9610',
    clientName: 'Don Aurelio Vargas',
    companyName: 'Minera & Canteras del Sur',
    rnc: '1-01-99201-4',
    machineModel: 'Ammann ASC 110 Rodillo 11 Toneladas',
    dealValueUsd: 112000,
    stage: 'delivered',
    assignedAdvisor: 'Lic. Arnaldo Peña',
    daysInStage: 1,
    bankPartner: 'Banco Popular Dominicano',
    notes: 'PDI 85 puntos firmado y equipo despachado hacia Azua con pase de garita.',
    probability: 100
  },
  {
    id: 'D-05',
    code: 'COT-2026-9532',
    clientName: 'Ing. Manuel Fernández',
    companyName: 'Consorcio Vial Pedernales',
    rnc: '1-01-55829-1',
    machineModel: 'LiuGong 936E Excavadora 36 Ton',
    dealValueUsd: 265000,
    stage: 'negotiation',
    assignedAdvisor: 'Ing. Marcos Guzmán',
    daysInStage: 8,
    notes: 'Solicitan inclusión de martillo hidráulico Montabert 4 Ton.',
    probability: 70
  }
];

interface SalesKanbanPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesKanbanPipelineModal: React.FC<SalesKanbanPipelineModalProps> = ({
  isOpen,
  onClose
}) => {
  const [deals, setDeals] = useState<DealCard[]>(INITIAL_DEALS);
  const [advisorFilter, setAdvisorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const STAGES: { id: PipelineStage; name: string; color: string; border: string }[] = [
    {
      id: 'new_request',
      name: '1. Nueva Proforma',
      color: 'bg-zinc-800 text-zinc-300',
      border: 'border-zinc-700'
    },
    {
      id: 'negotiation',
      name: '2. En Negociación / Demo',
      color: 'bg-amber-400/10 text-amber-400',
      border: 'border-amber-400/40'
    },
    {
      id: 'bank_approval',
      name: '3. Aprobación Leasing / Banco',
      color: 'bg-cyan-500/10 text-cyan-400',
      border: 'border-cyan-500/40'
    },
    {
      id: 'delivered',
      name: '4. Equipo Facturado & Entregado',
      color: 'bg-emerald-500/10 text-emerald-400',
      border: 'border-emerald-500/40'
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesAdvisor = advisorFilter === 'all' || deal.assignedAdvisor === advisorFilter;
    const matchesSearch = 
      deal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.machineModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAdvisor && matchesSearch;
  });

  const totalPipelineUsd = filteredDeals.reduce((sum, d) => sum + d.dealValueUsd, 0);

  // Move deal to next stage
  const handleMoveStage = (dealId: string, direction: 'forward' | 'backward') => {
    const stageOrder: PipelineStage[] = ['new_request', 'negotiation', 'bank_approval', 'delivered'];
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const currentIndex = stageOrder.indexOf(deal.stage);
        const newIndex = direction === 'forward' 
          ? Math.min(stageOrder.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
        return {
          ...deal,
          stage: stageOrder[newIndex],
          daysInStage: 0
        };
      }
      return deal;
    }));
  };

  const handleExportCsv = () => {
    const headers = 'ID,CODIGO,CLIENTE,EMPRESA,RNC,EQUIPO,VALOR_USD,ETAPA,ASESOR,DIAS_EN_ETAPA,BANCO\n';
    const rows = filteredDeals.map(d => 
      `"${d.id}","${d.code}","${d.clientName}","${d.companyName}","${d.rnc}","${d.machineModel}","${d.dealValueUsd}","${d.stage}","${d.assignedAdvisor}","${d.daysInStage}","${d.bankPartner || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_PIPELINE_VENTAS_KANBAN_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-6xl h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  CRM COMERCIAL TMD
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Embudo de Ventas & Negociaciones de Maquinaria
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Pipeline de Ventas Kanban
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Pipeline en CSV para Gerencia"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline KPI & Filter Bar */}
        <div className="p-3.5 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-zinc-500 text-[10px] block">VALOR TOTAL PIPELINE:</span>
              <span className="text-amber-400 font-black text-sm sm:text-base font-mono">
                US$ {totalPipelineUsd.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-zinc-500 text-[10px] block">OPORTUNIDADES ACTIVAS:</span>
              <span className="text-white font-bold font-mono">
                {filteredDeals.length} Operaciones
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Advisor Selector */}
            <select
              value={advisorFilter}
              onChange={e => setAdvisorFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-zinc-300 text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos los Asesores</option>
              <option value="Lic. Arnaldo Peña">Lic. Arnaldo Peña</option>
              <option value="Ing. Marcos Guzmán">Ing. Marcos Guzmán</option>
              <option value="Ing. Patricia Valdez">Ing. Patricia Valdez</option>
            </select>

            {/* Quick Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, modelo, RNC..."
              className="bg-zinc-950 border border-zinc-800 rounded-[2px] px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
            />
          </div>
        </div>

        {/* Kanban Board Columns Container */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[900px] h-full">
            {STAGES.map(stage => {
              const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.dealValueUsd, 0);

              return (
                <div 
                  key={stage.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-[4px] flex flex-col h-full overflow-hidden"
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between ${stage.border}`}>
                    <div>
                      <h3 className="text-xs font-black uppercase text-white font-display">
                        {stage.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        US$ {stageValue.toLocaleString()} ({stageDeals.length})
                      </span>
                    </div>
                  </div>

                  {/* Cards List in this stage */}
                  <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                    {stageDeals.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-zinc-800/80 rounded-[3px] text-zinc-600 text-xs">
                        Sin operaciones en esta etapa
                      </div>
                    ) : (
                      stageDeals.map(deal => (
                        <div 
                          key={deal.id}
                          className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-[3px] p-3 space-y-2 text-xs shadow-xs transition-all"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="px-1.5 py-0.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-[10px] text-amber-400 font-bold font-mono">
                              {deal.code}
                            </span>
                            <span className="text-white font-black font-mono">
                              US$ {deal.dealValueUsd.toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-xs line-clamp-1">{deal.companyName}</h4>
                            <span className="text-zinc-500 text-[10px] font-sans block">{deal.clientName} • RNC: {deal.rnc}</span>
                          </div>

                          <div className="p-1.5 bg-zinc-900/60 rounded-[2px] border border-zinc-800/60 text-[11px] text-zinc-300">
                            <strong>{deal.machineModel}</strong>
                          </div>

                          {deal.bankPartner && (
                            <div className="text-[10px] text-cyan-400 font-mono">
                              🏦 {deal.bankPartner}
                            </div>
                          )}

                          <p className="text-[10px] text-zinc-400 font-sans line-clamp-2">
                            {deal.notes}
                          </p>

                          {/* Footer with Advisor, Age & Stage Shift Buttons */}
                          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 font-sans">
                              {deal.assignedAdvisor.split(' ')[1]} • {deal.daysInStage}d
                            </span>

                            <div className="flex items-center gap-1">
                              {stage.id !== 'new_request' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(deal.id, 'backward')}
                                  className="p-1 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                                  title="Mover a etapa anterior"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {stage.id !== 'delivered' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(deal.id, 'forward')}
                                  className="p-1 rounded-[2px] bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 cursor-pointer"
                                  title="Avanzar de etapa"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span>Actualización en tiempo real con cotizaciones web y CRM central.</span>
          <span className="font-mono text-[10px]">TMD Sales Pipeline v9</span>
        </div>
      </div>
    </div>
  );
};
