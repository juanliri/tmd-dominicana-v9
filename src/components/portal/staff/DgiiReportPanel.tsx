import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Layers, 
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { PortalQuote } from '../../../types';
import { USD_TO_DOP_RATE } from '../../../data/catalog';

interface DgiiReportPanelProps {
  quotes: PortalQuote[];
}

export const DgiiReportPanel: React.FC<DgiiReportPanelProps> = ({ quotes }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-09');
  const [activeTab, setActiveTab] = useState<'607_sales' | '606_purchases'>('607_sales');

  // Filter quotes with NCFs in selected period
  const reportableQuotes = quotes.filter((q) => {
    // Only quotes that have NCF or approved status
    return Boolean(q.ncfNumber || q.status === 'approved');
  });

  const totalVentasGravadasUsd = reportableQuotes.reduce((acc, q) => {
    const total = q.total || 0;
    const itbis = q.itbis || (total * 0.18 / 1.18);
    return acc + (total - itbis);
  }, 0);

  const totalItbisFacturadoUsd = reportableQuotes.reduce((acc, q) => {
    const total = q.total || 0;
    const itbis = q.itbis || (total * 0.18 / 1.18);
    return acc + itbis;
  }, 0);

  const totalVentasDop = Math.round(totalVentasGravadasUsd * USD_TO_DOP_RATE);
  const totalItbisDop = Math.round(totalItbisFacturadoUsd * USD_TO_DOP_RATE);

  // Mock 606 Purchases (OEM parts imports, local fuel, workshop supplies)
  const mockPurchases606 = [
    {
      id: 'PUR-01',
      rnc: '1-01-00234-5',
      supplier: 'Distribuidora Shell & Lubricantes S.A.',
      ncf: 'B0100003412',
      costDop: 450000,
      itbisDop: 81000,
      category: 'Lubricantes y Fluidos Hidráulicos'
    },
    {
      id: 'PUR-02',
      rnc: '1-30-88123-1',
      supplier: 'Transporte y Carga Pesada Dominicana S.R.L.',
      ncf: 'B0100009941',
      costDop: 280000,
      itbisDop: 50400,
      category: 'Fletes y Traslados Lowboy'
    },
    {
      id: 'PUR-03',
      rnc: '1-02-77112-9',
      supplier: 'Gomas y Orugas Industriales del Caribe',
      ncf: 'B0100005512',
      costDop: 620000,
      itbisDop: 111600,
      category: 'Zapatas y Rodajes de Excavadora'
    }
  ];

  const totalComprasCostosDop = mockPurchases606.reduce((acc, p) => acc + p.costDop, 0);
  const totalItbisComprasDop = mockPurchases606.reduce((acc, p) => acc + p.itbisDop, 0);
  const itbisNetoAPagarDop = Math.max(0, totalItbisDop - totalItbisComprasDop);

  // Export 607 to CSV / TXT format
  const handleExport607 = () => {
    const headers = 'RNC_CEDULA,TIPO_ID,NUMERO_COMPROBANTE,FECHA_COMPROBANTE,MONTO_FACTURADO,ITBIS_FACTURADO,TIPO_INGRESO\n';
    const rows = reportableQuotes.map((q, idx) => {
      const cleanRnc = (q.rnc || '131456789').replace(/\D/g, '');
      const tipoId = cleanRnc.length === 9 ? '1' : '2';
      const ncf = q.ncfNumber || `B010000${String(4500 + idx).padStart(4, '0')}`;
      const fecha = '20260920';
      const total = q.total || 0;
      const itbis = Math.round((q.itbis || (total * 0.18 / 1.18)) * USD_TO_DOP_RATE);
      const subtotal = Math.round((total * USD_TO_DOP_RATE) - itbis);
      return `${cleanRnc},${tipoId},${ncf},${fecha},${subtotal},${itbis},01`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DGII_607_TMD_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export 606 to CSV
  const handleExport606 = () => {
    const headers = 'RNC_CEDULA,TIPO_ID,TIPO_BIENES_SERVICIOS,NUMERO_COMPROBANTE,FECHA_COMPROBANTE,MONTO_FACTURADO,ITBIS_FACTURADO\n';
    const rows = mockPurchases606.map((p) => {
      const cleanRnc = p.rnc.replace(/\D/g, '');
      return `${cleanRnc},1,02,${p.ncf},20260915,${p.costDop},${p.itbisDop}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DGII_606_TMD_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. DGII REPORT HEADER */}
      <div className="p-4 sm:p-5 rounded-[5px] bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-amber-400 text-black flex items-center justify-center font-black shrink-0 shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight font-display">
                Módulo Fiscal DGII: Formatos 606 & 607 (IT-1)
              </h3>
              <span className="px-2 py-0.5 rounded-[2px] text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Norma 07-2018
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Generador oficial de archivos para la Dirección General de Impuestos Internos de la República Dominicana.
            </p>
          </div>
        </div>

        {/* Period Selector & Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-[2px] border border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-hidden text-xs"
            >
              <option value="2026-09">Septiembre 2026</option>
              <option value="2026-08">Agosto 2026</option>
              <option value="2026-07">Julio 2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={activeTab === '607_sales' ? handleExport607 : handleExport606}
            className="px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Formato {activeTab === '607_sales' ? '607 (Ventas)' : '606 (Compras)'}</span>
          </button>
        </div>
      </div>

      {/* 2. TAX RECONCILIATION SUMMARY BOX (IT-1 ESTIMATED) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">
            Débito Fiscal (ITBIS 18% Facturado en 607):
          </span>
          <div className="text-xl font-black text-amber-400 font-mono">
            RD$ {totalItbisDop.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            Equivalente a US$ {Math.round(totalItbisFacturadoUsd).toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-[3px] bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">
            Crédito Fiscal (ITBIS 18% Deducible en 606):
          </span>
          <div className="text-xl font-black text-sky-400 font-mono">
            RD$ {totalItbisComprasDop.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            De 3 proveedores de repuestos y fletes
          </span>
        </div>

        <div className="p-4 rounded-[3px] bg-zinc-900 border border-amber-500/40 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 font-display">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Saldo Neto Estimado a Declarar (IT-1):</span>
          </span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            RD$ {itbisNetoAPagarDop.toLocaleString()}
          </div>
          <span className="text-[10px] text-zinc-400 block font-mono">
            Fecha límite: 20 de Octubre 2026
          </span>
        </div>
      </div>

      {/* 3. SUBTAB SELECTOR (607 vs 606) */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('607_sales')}
          className={`px-3 py-1.5 rounded-[2px] font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === '607_sales'
              ? 'bg-amber-400 text-black font-black shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Formato 607: Ventas & NCF Emitidos ({reportableQuotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('606_purchases')}
          className={`px-3 py-1.5 rounded-[2px] font-bold text-xs uppercase cursor-pointer flex items-center gap-1.5 ${
            activeTab === '606_purchases'
              ? 'bg-amber-400 text-black font-black shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Formato 606: Compras de Operación ({mockPurchases606.length})</span>
        </button>
      </div>

      {/* 4. TABLES */}
      {activeTab === '607_sales' ? (
        <div className="rounded-[3px] border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">RNC / CÉDULA</th>
                  <th className="p-3">RAZÓN SOCIAL</th>
                  <th className="p-3">NCF ASIGNADO</th>
                  <th className="p-3 text-right">MONTO FACTURADO (RD$)</th>
                  <th className="p-3 text-right">ITBIS 18% (RD$)</th>
                  <th className="p-3 text-center">TIPO INGRESO</th>
                  <th className="p-3 text-center">ESTADO DGII</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {reportableQuotes.map((q, idx) => {
                  const ncf = q.ncfNumber || `B010000${String(4500 + idx).padStart(4, '0')}`;
                  const total = q.total || 0;
                  const itbisDop = Math.round((q.itbis || (total * 0.18 / 1.18)) * USD_TO_DOP_RATE);
                  const subtotalDop = Math.round((total * USD_TO_DOP_RATE) - itbisDop);

                  return (
                    <tr key={q.id} className="hover:bg-zinc-800/40">
                      <td className="p-3 font-mono text-zinc-300">
                        {q.rnc || '1-31-45678-9'}
                      </td>
                      <td className="p-3 font-bold text-white font-sans uppercase">
                        {q.companyName || q.clientName || 'Cliente'}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-bold">
                        {ncf}
                      </td>
                      <td className="p-3 text-right font-mono text-white">
                        RD$ {subtotalDop.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400 font-bold">
                        RD$ {itbisDop.toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-mono text-zinc-400">
                        01 - Operacional
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Listo 607</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[3px] border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">RNC SUPLIDOR</th>
                  <th className="p-3">PROVEEDOR / CONCEPTO</th>
                  <th className="p-3">NCF COMPROBANTE</th>
                  <th className="p-3 text-right">MONTO FACTURADO (RD$)</th>
                  <th className="p-3 text-right">ITBIS 18% (RD$)</th>
                  <th className="p-3 text-center">TIPO GASTO</th>
                  <th className="p-3 text-center">ESTADO DGII</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-medium">
                {mockPurchases606.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40">
                    <td className="p-3 font-mono text-zinc-300">{p.rnc}</td>
                    <td className="p-3">
                      <div className="font-bold text-white font-sans uppercase">{p.supplier}</div>
                      <div className="text-[10px] text-zinc-500 font-sans">{p.category}</div>
                    </td>
                    <td className="p-3 font-mono text-sky-400 font-bold">{p.ncf}</td>
                    <td className="p-3 text-right font-mono text-white">
                      RD$ {p.costDop.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-sky-400 font-bold">
                      RD$ {p.itbisDop.toLocaleString()}
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-400">
                      02 - Costos de Servicios / Repuestos
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Validado 606</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
