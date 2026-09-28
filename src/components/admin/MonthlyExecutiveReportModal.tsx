import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  X,
  Building2,
  PieChart,
  BarChart3,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react';

interface MonthlyExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportMonth?: string;
  reportYear?: number;
}

export const MonthlyExecutiveReportModal: React.FC<MonthlyExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  reportMonth = 'Marzo',
  reportYear = 2026
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(`${reportMonth} ${reportYear}`);

  if (!isOpen) return null;

  // Key Executive Metrics
  const metrics = {
    totalRevenueUsd: 1485600,
    totalRevenueDop: 89136000,
    machineryRevenueUsd: 1140000,
    partsRevenueUsd: 228400,
    workshopLaborUsd: 117200,
    grossMarginPercent: 21.4,
    machinesDelivered: 12,
    workshopBilledHours: 1480,
    technicianEfficiencyPercent: 94.2,
    csatScore: 4.88,
    topModels: [
      { model: 'LiuGong 922E HD Excavadora', units: 5, revenueUsd: 645000 },
      { model: 'JCB 3DX Super Retroexcavadora', units: 4, revenueUsd: 316000 },
      { model: 'Ammann ASC 110 Compactador', units: 3, revenueUsd: 179000 }
    ],
    topParts: [
      { code: 'FLT-LG-922-OIL', name: 'Filtro Aceite Motor Cummins 6BTA', qty: 142, revenueUsd: 8236 },
      { code: 'HYD-SEAL-BOOM-922', name: 'Kit Sellos Cilindro Pluma Kawasaki', qty: 38, revenueUsd: 11210 },
      { code: 'GET-TOOTH-1U3352', name: 'Punta de Balde Servicio Pesado HD', qty: 280, revenueUsd: 13440 }
    ]
  };

  const handleExportExecutivePdf = () => {
    let text = `=========================================================================\n`;
    text += `TECNOMAQUINARIAS DIESEL S.R.L. (TMD DOMINICANA)\n`;
    text += `INFORME EJECUTIVO MENSUAL DE OPERACIONES & DIRECCIÓN GENERAL\n`;
    text += `PERÍODO: ${selectedPeriod.toUpperCase()} • SEDE CENTRAL KM 22 AUTOPISTA DUARTE\n`;
    text += `GENERADO: ${new Date().toLocaleString()}\n`;
    text += `=========================================================================\n\n`;

    text += `1. RESUMEN FINANCIERO CONSOLIDADO:\n`;
    text += `   - Facturación Total: US$ ${metrics.totalRevenueUsd.toLocaleString()} (RD$ ${metrics.totalRevenueDop.toLocaleString()})\n`;
    text += `   - Venta Maquinaria Nueva: US$ ${metrics.machineryRevenueUsd.toLocaleString()} (${metrics.machinesDelivered} unidades entregadas)\n`;
    text += `   - Venta Mostrador Repuestos: US$ ${metrics.partsRevenueUsd.toLocaleString()}\n`;
    text += `   - Taller de Servicio & Campo: US$ ${metrics.workshopLaborUsd.toLocaleString()} (${metrics.workshopBilledHours} horas facturadas)\n`;
    text += `   - Margen Bruto Promedio: ${metrics.grossMarginPercent}%\n\n`;

    text += `2. EQUIPOS DE MAYOR FACTURACIÓN:\n`;
    metrics.topModels.forEach(m => {
      text += `   • ${m.model}: ${m.units} Uds | US$ ${m.revenueUsd.toLocaleString()}\n`;
    });

    text += `\n3. REPUESTOS DE ALTA ROTACIÓN ALMACÉN KM 22:\n`;
    metrics.topParts.forEach(p => {
      text += `   • ${p.code} (${p.name}): ${p.qty} Uds | US$ ${p.revenueUsd.toLocaleString()}\n`;
    });

    text += `\n4. INDICADORES DE TALLER & CALIDAD:\n`;
    text += `   - Eficiencia Operativa de Mecánicos: ${metrics.technicianEfficiencyPercent}%\n`;
    text += `   - Índice de Satisfacción de Clientes (CSAT): ${metrics.csatScore}/5.00\n`;
    text += `   - Tiempo Medio de Estadía en Bahía: 2.1 días hábiles\n\n`;

    text += `FIRMA DE DIRECCIÓN GENERAL: ___________________________________\n`;
    text += `Ing. Director General / Vicepresidencia TMD Dominicana\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_INFORME_EJECUTIVO_${selectedPeriod.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  JUNTA DIRECTIVA • CFO REPORT
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  {selectedPeriod}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Informe Ejecutivo Mensual de Operaciones
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {/* Revenue KPI Banner */}
          <div className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-amber-950/20 border border-amber-400/20 rounded-[3px]">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-display">
              Facturación Consolidada del Mes
            </span>
            <div className="flex flex-wrap items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                US$ {metrics.totalRevenueUsd.toLocaleString()}
              </span>
              <span className="text-sm text-zinc-400 font-mono">
                (≈ RD$ {metrics.totalRevenueDop.toLocaleString()})
              </span>
              <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] ml-auto">
                +14.8% vs Mes Anterior
              </span>
            </div>
          </div>

          {/* Revenue Breakdown by Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Venta de Equipos</span>
              <span className="text-base font-black text-white font-mono block mt-1">
                US$ {metrics.machineryRevenueUsd.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
                {metrics.machinesDelivered} maquinarias entregadas
              </span>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Repuestos & Mostrador</span>
              <span className="text-base font-black text-amber-400 font-mono block mt-1">
                US$ {metrics.partsRevenueUsd.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
                Almacén Central Km 22
              </span>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Taller & Campo 4x4</span>
              <span className="text-base font-black text-emerald-400 font-mono block mt-1">
                US$ {metrics.workshopLaborUsd.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
                {metrics.workshopBilledHours} horas facturadas
              </span>
            </div>
          </div>

          {/* Top Selling Equipment */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-[3px] space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display">
              Maquinarias Líderes en Facturación:
            </span>
            <div className="space-y-1.5">
              {metrics.topModels.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-zinc-950/70 border border-zinc-850 rounded-[2px] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[1px] bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-zinc-200">{item.model}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono text-[11px]">{item.units} Uds</span>
                    <span className="font-mono font-bold text-white">US$ {item.revenueUsd.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workshop & Service Health */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Satisfacción CSAT</span>
                <span className="font-bold text-white font-mono">{metrics.csatScore} / 5.00</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Eficiencia Taller</span>
                <span className="font-bold text-white font-mono">{metrics.technicianEfficiencyPercent}%</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Margen Bruto</span>
                <span className="font-bold text-white font-mono">{metrics.grossMarginPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] text-zinc-500 font-mono">
            Auditoría Fiscal DGII & NIIF Compliant
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExecutivePdf}
              className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Informe Formal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
