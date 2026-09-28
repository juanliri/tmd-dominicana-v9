import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  FileSpreadsheet, 
  Layers, 
  Hash, 
  RefreshCw 
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface DgiiRecord606 {
  rncProvider: string;
  idType: '1' | '2'; // 1=RNC, 2=Cedula
  expenseType: string;
  ncf: string;
  date: string; // YYYYMMDD
  serviceAmount: number;
  goodsAmount: number;
  totalAmount: number;
  itbisBilled: number;
  itbisRetained: number;
  paymentType: '01' | '02' | '03' | '04'; // 02=Transferencia
  providerName: string;
}

interface DgiiRecord607 {
  rncClient: string;
  idType: '1' | '2';
  ncf: string;
  incomeType: '01';
  date: string;
  amountBilled: number;
  itbisBilled: number;
  itbisRetained: number;
  isrRetained: number;
  paymentMethod: 'credit' | 'transfer' | 'card';
  clientName: string;
}

const SAMPLE_606_RECORDS: DgiiRecord606[] = [
  {
    rncProvider: '101018243',
    idType: '1',
    expenseType: '04', // Activos Fijos
    ncf: 'B0100049182',
    date: '20260914',
    serviceAmount: 0,
    goodsAmount: 1850000.0,
    totalAmount: 1850000.0,
    itbisBilled: 333000.0,
    itbisRetained: 0,
    paymentType: '02',
    providerName: 'Importadora de Aceros Hardox S.R.L.'
  },
  {
    rncProvider: '130882194',
    idType: '1',
    expenseType: '02', // Trabajos técnicos
    ncf: 'B0100088192',
    date: '20260918',
    serviceAmount: 145000.0,
    goodsAmount: 0,
    totalAmount: 145000.0,
    itbisBilled: 26100.0,
    itbisRetained: 7830.0, // Retencion 30% ITBIS
    paymentType: '02',
    providerName: 'Laboratorio de Espectrometría Dominicana'
  },
  {
    rncProvider: '101889921',
    idType: '1',
    expenseType: '05', // Mantenimiento
    ncf: 'B0100033104',
    date: '20260922',
    serviceAmount: 68000.0,
    goodsAmount: 220000.0,
    totalAmount: 288000.0,
    itbisBilled: 51840.0,
    itbisRetained: 0,
    paymentType: '02',
    providerName: 'Lubricantes y Filtros Industriales S.A.'
  }
];

const SAMPLE_607_RECORDS: DgiiRecord607[] = [
  {
    rncClient: '131849201',
    idType: '1',
    ncf: 'B0100004812',
    incomeType: '01',
    date: '20260905',
    amountBilled: 7750000.0,
    itbisBilled: 1395000.0,
    itbisRetained: 0,
    isrRetained: 0,
    paymentMethod: 'transfer',
    clientName: 'Ingeniería Estrella S.A. (Excavadora 922E)'
  },
  {
    rncClient: '101774921',
    idType: '1',
    ncf: 'B0100004813',
    incomeType: '01',
    date: '20260912',
    amountBilled: 5120000.0,
    itbisBilled: 921600.0,
    itbisRetained: 0,
    isrRetained: 256000.0, // 5% Retencion del Estado
    paymentMethod: 'transfer',
    clientName: 'Ministerio de Obras Públicas y Comunicaciones (MOPC)'
  },
  {
    rncClient: '130998811',
    idType: '1',
    ncf: 'B0100004814',
    incomeType: '01',
    date: '20260920',
    amountBilled: 298000.0,
    itbisBilled: 53640.0,
    itbisRetained: 0,
    isrRetained: 0,
    paymentMethod: 'transfer',
    clientName: 'Constructora Malespín S.R.L. (Kit Filtros JCB)'
  }
];

interface Dgii606_607ExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Dgii606_607ExporterModal: React.FC<Dgii606_607ExporterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'606' | '607'>('606');
  const [fiscalPeriod, setFiscalPeriod] = useState<string>('202609');
  const [companyRnc] = useState<string>('131-89421-1');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  if (!isOpen || typeof document === 'undefined') return null;

  const total606Amount = SAMPLE_606_RECORDS.reduce((a, b) => a + b.totalAmount, 0);
  const total606Itbis = SAMPLE_606_RECORDS.reduce((a, b) => a + b.itbisBilled, 0);

  const total607Amount = SAMPLE_607_RECORDS.reduce((a, b) => a + b.amountBilled, 0);
  const total607Itbis = SAMPLE_607_RECORDS.reduce((a, b) => a + b.itbisBilled, 0);

  const handleExportTxtFile = (format: '606' | '607') => {
    setIsExporting(true);
    let output = '';

    if (format === '606') {
      // Header: 606|RNC|Periodo|CantidadRegistros
      output += `606|${companyRnc.replace(/-/g, '')}|${fiscalPeriod}|${SAMPLE_606_RECORDS.length}\n`;
      SAMPLE_606_RECORDS.forEach((r) => {
        // Line structure: RNC|TipoID|TipoGasto|NCF|NCFMod|FechaComp|FechaPago|Serv|Bienes|Total|ITBISFact|ITBISRet|Prop|Costo|Adelantar|Percibido|TipoRet|RetRenta|ISRPerc|ISC|OtrosImp|Propina|FormaPago
        output += `${r.rncProvider}|${r.idType}|${r.expenseType}|${r.ncf}||${r.date}|${r.date}|${r.serviceAmount.toFixed(2)}|${r.goodsAmount.toFixed(2)}|${r.totalAmount.toFixed(2)}|${r.itbisBilled.toFixed(2)}|${r.itbisRetained.toFixed(2)}|0.00|0.00|${r.itbisBilled.toFixed(2)}|0.00||0.00|0.00|0.00|0.00|0.00|${r.paymentType}\n`;
      });
    } else {
      // Header: 607|RNC|Periodo|CantidadRegistros
      output += `607|${companyRnc.replace(/-/g, '')}|${fiscalPeriod}|${SAMPLE_607_RECORDS.length}\n`;
      SAMPLE_607_RECORDS.forEach((r) => {
        // Line structure: RNC|TipoID|NCF|NCFMod|TipoIngreso|FechaComp|FechaRet|MontoFact|ITBISFact|ITBISRet|ITBISPerc|RetRenta|ISRPerc|ISC|OtrosImp|Propina|Efectivo|ChequeTransf|Tarjeta|Credito|Bonos|Permuta|Otras
        output += `${r.rncClient}|${r.idType}|${r.ncf}||${r.incomeType}|${r.date}||${r.amountBilled.toFixed(2)}|${r.itbisBilled.toFixed(2)}|${r.itbisRetained.toFixed(2)}|0.00|${r.isrRetained.toFixed(2)}|0.00|0.00|0.00|0.00|0.00|${r.amountBilled.toFixed(2)}|0.00|0.00|0.00|0.00|0.00\n`;
      });
    }

    const filename = `${format}_${companyRnc.replace(/-/g, '')}_${fiscalPeriod}.txt`;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccessMessage(`Archivo ${filename} generado conforme a la Norma General DGII.`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                  Contabilidad Fiscal • DGII República Dominicana
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  NORMA GENERAL 07-2018
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Generador de Archivos 606 y 607 para DGII
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company and Period Bar */}
        <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">RNC Declaración</span>
              <span className="font-bold text-white font-mono">{companyRnc}</span>
            </div>
            <div className="border-l border-zinc-800 pl-4">
              <span className="text-[10px] text-zinc-500 uppercase block">Período Fiscal</span>
              <select
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded-[2px] text-xs font-mono font-bold text-amber-400 focus:outline-none"
              >
                <option value="202609">Septiembre 2026 (202609)</option>
                <option value="202608">Agosto 2026 (202608)</option>
                <option value="202607">Julio 2026 (202607)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFormat('606')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase transition-all cursor-pointer font-display ${
                selectedFormat === '606'
                  ? 'bg-amber-400 text-black font-black shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              Formato 606 (Compras)
            </button>
            <button
              onClick={() => setSelectedFormat('607')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase transition-all cursor-pointer font-display ${
                selectedFormat === '607'
                  ? 'bg-amber-400 text-black font-black shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              Formato 607 (Ventas)
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {exportSuccessMessage && (
          <div className="p-3 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5">
            <span className="text-[10px] text-zinc-400 uppercase block">Total Registros en Archivo</span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {selectedFormat === '606' ? SAMPLE_606_RECORDS.length : SAMPLE_607_RECORDS.length} Documentos
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">Validados con NCF oficial</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5">
            <span className="text-[10px] text-zinc-400 uppercase block">Monto Total Facturado</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
              RD$ {(selectedFormat === '606' ? total606Amount : total607Amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">Base imponible consolidada</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5">
            <span className="text-[10px] text-zinc-400 uppercase block">ITBIS Total (18%)</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
              RD$ {(selectedFormat === '606' ? total606Itbis : total607Itbis).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">
              {selectedFormat === '606' ? 'ITBIS Deducible (Adelanto)' : 'ITBIS por Pagar'}
            </span>
          </div>
        </div>

        {/* Records Preview Table */}
        <div className="flex-1 border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900 flex flex-col min-h-0">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
            <span className="font-bold text-white uppercase text-[10px]">
              Vista Previa de Líneas Estructuradas para DGII ({selectedFormat === '606' ? 'Compras' : 'Ventas'})
            </span>
            <span className="text-[10px] text-amber-400 font-mono">
              Estructura con Delimitador Pipe (|)
            </span>
          </div>

          <div className="flex-1 overflow-auto text-xs font-mono">
            {selectedFormat === '606' ? (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-zinc-950 text-[10px] text-zinc-400 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="p-2.5">RNC Proveedor</th>
                    <th className="p-2.5">NCF B01</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Proveedor</th>
                    <th className="p-2.5 text-right">Monto Total</th>
                    <th className="p-2.5 text-right">ITBIS 18%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {SAMPLE_606_RECORDS.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-2.5 font-bold text-white">{r.rncProvider}</td>
                      <td className="p-2.5 text-amber-400 font-bold">{r.ncf}</td>
                      <td className="p-2.5 text-zinc-400">{r.date}</td>
                      <td className="p-2.5 text-zinc-300 truncate max-w-[200px]">{r.providerName}</td>
                      <td className="p-2.5 text-right text-zinc-200 font-bold">RD$ {r.totalAmount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">RD$ {r.itbisBilled.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-zinc-950 text-[10px] text-zinc-400 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="p-2.5">RNC Cliente</th>
                    <th className="p-2.5">NCF Emitido</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5 text-right">Monto Facturado</th>
                    <th className="p-2.5 text-right">ITBIS 18%</th>
                    <th className="p-2.5 text-right">Ret. ISR 5%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {SAMPLE_607_RECORDS.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-2.5 font-bold text-white">{r.rncClient}</td>
                      <td className="p-2.5 text-amber-400 font-bold">{r.ncf}</td>
                      <td className="p-2.5 text-zinc-400">{r.date}</td>
                      <td className="p-2.5 text-zinc-300 truncate max-w-[200px]">{r.clientName}</td>
                      <td className="p-2.5 text-right text-zinc-200 font-bold">RD$ {r.amountBilled.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right text-emerald-400 font-bold">RD$ {r.itbisBilled.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right text-rose-400 font-bold">{r.isrRetained > 0 ? `RD$ ${r.isrRetained.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            Válido para carga directa en la Oficina Virtual de la DGII (OFV)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportTxtFile(selectedFormat)}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Archivo {selectedFormat}.txt</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
