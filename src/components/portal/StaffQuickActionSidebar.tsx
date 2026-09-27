import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap,
  Plus,
  Repeat,
  CreditCard,
  QrCode,
  MessageSquare,
  Wrench,
  Search,
  FileCheck,
  Phone,
  ChevronRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Building2,
  HardHat,
  DollarSign,
  ClipboardList
} from 'lucide-react';
import { Currency } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface StaffQuickActionSidebarProps {
  onOpenCreateQuote: () => void;
  onSelectWorkflowTab?: (tab: string) => void;
  onNavigate: (route: string) => void;
  onOpenQrScanner?: () => void;
  pendingQuotesCount?: number;
  activeWorkOrdersCount?: number;
}

export const StaffQuickActionSidebar: React.FC<StaffQuickActionSidebarProps> = ({
  onOpenCreateQuote,
  onSelectWorkflowTab,
  onNavigate,
  onOpenQrScanner,
  pendingQuotesCount = 0,
  activeWorkOrdersCount = 0
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [quickNcfModal, setQuickNcfModal] = useState(false);
  const [tradeInCalcModal, setTradeInCalcModal] = useState(false);
  
  // Quick Trade-In Calculator State
  const [tradeInModel, setTradeInModel] = useState('');
  const [tradeInYear, setTradeInYear] = useState(2020);
  const [tradeInHours, setTradeInHours] = useState(3500);
  const [tradeInEstimatedValue, setTradeInEstimatedValue] = useState<number | null>(null);

  const calculateQuickTradeIn = () => {
    // Base heuristic estimation
    const baseValue = 45000;
    const yearFactor = Math.max(0.4, 1 - (2026 - tradeInYear) * 0.08);
    const hoursFactor = Math.max(0.3, 1 - (tradeInHours / 10000) * 0.5);
    const estimated = Math.round(baseValue * yearFactor * hoursFactor);
    setTradeInEstimatedValue(estimated);
  };

  return (
    <>
      <aside
        className={`transition-all duration-300 ease-in-out shrink-0 font-mono ${
          isCollapsed ? 'w-12' : 'w-64'
        }`}
      >
        <div className="sticky top-20 bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-xl overflow-hidden p-3 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center font-black">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
                    QUICK ACTIONS
                  </h4>
                  <span className="text-[9px] text-zinc-500 uppercase">OPERACIONES</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors mx-auto cursor-pointer"
              title={isCollapsed ? 'Expandir barra rápida' : 'Colapsar barra rápida'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Action Buttons List */}
          <div className="space-y-1.5">
            {/* Action 1: Create Quote */}
            <button
              type="button"
              onClick={onOpenCreateQuote}
              className={`w-full p-2 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all flex items-center gap-2 shadow-xs cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Nueva Cotización Proforma"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span className="truncate">NUEVA PROFORMA</span>}
              </div>
              {!isCollapsed && (
                <span className="px-1 py-0.5 rounded-[2px] bg-black/15 text-[8px] font-black uppercase">
                  F1
                </span>
              )}
            </button>

            {/* Action 2: Trade-In Appraisal */}
            <button
              type="button"
              onClick={() => setTradeInCalcModal(true)}
              className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Tasación Rápida Trade-In"
            >
              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {!isCollapsed && <span className="truncate">TASACIÓN TRADE-IN</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] text-zinc-500 uppercase">AVALÚO</span>
              )}
            </button>

            {/* Action 3: Advances & Deposits */}
            <button
              type="button"
              onClick={() => onSelectWorkflowTab && onSelectWorkflowTab('advances_ledger')}
              className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Registro de Anticipos Bancarios"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                {!isCollapsed && <span className="truncate">ANTICIPOS & BANCOS</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] text-sky-400 font-mono font-bold uppercase">BHD/POPULAR</span>
              )}
            </button>

            {/* Action 4: Patio Km 22 Gate Pass */}
            <button
              type="button"
              onClick={() => onSelectWorkflowTab && onSelectWorkflowTab('patio_dispatch')}
              className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Pases de Salida Patio Km 22"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!isCollapsed && <span className="truncate">PASE SALIDA KM 22</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">GATE PASS</span>
              )}
            </button>

            {/* Action 4b: Industrial QR Scanner for Staff */}
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={onOpenQrScanner}
                className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                }`}
                title="Escanear Código QR de Maquinaria o Repuesto"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">ESCANEAR QR PATIO</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] text-zinc-400 font-mono font-bold uppercase">SCAN</span>
                )}
              </button>
            )}

            {/* Action 4c: View Inventory Logs */}
            {onSelectWorkflowTab && (
              <button
                type="button"
                onClick={() => onSelectWorkflowTab('inventory_logs')}
                className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                }`}
                title="Ver Bitácora de Escaneos de Inventario"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {!isCollapsed && <span className="truncate">BITÁCORA ESCANEOS</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">LOGS</span>
                )}
              </button>
            )}

            {/* Action 5: Dispatch Tech WhatsApp */}
            <button
              type="button"
              onClick={() => onSelectWorkflowTab && onSelectWorkflowTab('service_dispatch')}
              className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Despacho WhatsApp al Técnico"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {!isCollapsed && <span className="truncate">DESPACHO WHATSAPP</span>}
              </div>
              {!isCollapsed && activeWorkOrdersCount > 0 && (
                <span className="px-1 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 text-[9px] font-bold">
                  {activeWorkOrdersCount}
                </span>
              )}
            </button>

            {/* Action 6: NCF DGII Validator */}
            <button
              type="button"
              onClick={() => setQuickNcfModal(true)}
              className={`w-full p-2 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer uppercase ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Generador / Validador NCF DGII"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {!isCollapsed && <span className="truncate">NCF FISCAL DGII</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] text-purple-400 font-mono font-bold">B01/B02</span>
              )}
            </button>
          </div>

          {/* Direct Line & Emergency Call Box */}
          {!isCollapsed && (
            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Truck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">GARITA PATIO KM 22</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-snug">
                Coordinación de Lowboys y recepción de equipos pesados en autopista Duarte.
              </p>
              <a
                href="tel:+18095601234"
                className="w-full py-1.5 px-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors uppercase"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span>+1 (809) 560-1234</span>
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* MODAL 1: TRADE-IN QUICK APPRAISAL */}
      {tradeInCalcModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-zinc-900 rounded-[5px] border border-zinc-800 p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[2px] bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white font-display">
                    CALCULADORA DE RETOMA (TRADE-IN)
                  </h3>
                  <span className="text-[10px] text-zinc-400">Estimación previa para cotizaciones</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTradeInCalcModal(false)}
                className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1 text-[11px] uppercase">Modelo / Marca del Equipo Usado:</label>
                <input
                  type="text"
                  placeholder="Ej: CAT 420F, JCB 3CX 2018, LiuGong 920E..."
                  value={tradeInModel}
                  onChange={(e) => setTradeInModel(e.target.value)}
                  className="w-full p-2 rounded-[3px] bg-zinc-950 border border-zinc-800 font-bold text-white uppercase text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 text-[11px] uppercase">Año Fabricación:</label>
                  <input
                    type="number"
                    value={tradeInYear}
                    onChange={(e) => setTradeInYear(Number(e.target.value))}
                    className="w-full p-2 rounded-[3px] bg-zinc-950 border border-zinc-800 font-mono font-bold text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 text-[11px] uppercase">Horómetro (Horas):</label>
                  <input
                    type="number"
                    value={tradeInHours}
                    onChange={(e) => setTradeInHours(Number(e.target.value))}
                    className="w-full p-2 rounded-[3px] bg-zinc-950 border border-zinc-800 font-mono font-bold text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={calculateQuickTradeIn}
                className="w-full py-2 px-3 rounded-[3px] bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors uppercase text-xs cursor-pointer"
              >
                CALCULAR AVALÚO ESTIMADO
              </button>

              {tradeInEstimatedValue !== null && (
                <div className="p-3 rounded-[3px] bg-zinc-950 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">
                    VALOR DE RETOMA SUGERIDO
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    US$ {tradeInEstimatedValue.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    (~RD$ {(tradeInEstimatedValue * USD_TO_DOP_RATE).toLocaleString('es-DO', { maximumFractionDigits: 0 })})
                  </p>
                  <p className="text-[9px] text-zinc-500 pt-0.5 uppercase">
                    Sujeto a inspección mecánica física de 60 puntos en Patio Km 22.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: NCF DGII SEQUENCE GENERATOR & VALIDATOR */}
      {quickNcfModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-zinc-900 rounded-[5px] border border-zinc-800 p-5 space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[2px] bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white font-display">
                    COMPROBANTES FISCALES DGII
                  </h3>
                  <span className="text-[10px] text-zinc-400">Secuencias autorizadas TMD Dominicana</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickNcfModal(false)}
                className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-400 text-[11px] uppercase">B01 - CRÉDITO FISCAL:</span>
                  <span className="font-mono font-black text-purple-400">B0100008892</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-400 text-[11px] uppercase">B02 - CONSUMO FINAL:</span>
                  <span className="font-mono font-black text-purple-400">B0200003411</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-400 text-[11px] uppercase">B14 - RÉGIMEN ESPECIAL:</span>
                  <span className="font-mono font-black text-purple-400">B1400000219</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-400 text-[11px] uppercase">B15 - GUBERNAMENTAL:</span>
                  <span className="font-mono font-black text-purple-400">B1500000845</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 leading-normal">
                Las secuencias NCF se integran automáticamente en la exportación PDF oficial y en las cotizaciones enviadas por WhatsApp.
              </p>

              <button
                type="button"
                onClick={() => setQuickNcfModal(false)}
                className="w-full py-2 rounded-[3px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
