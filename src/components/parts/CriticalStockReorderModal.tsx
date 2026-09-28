import React, { useState } from 'react';
import { 
  X, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileText, 
  RefreshCw, 
  ShieldAlert, 
  Truck, 
  Clock, 
  Search,
  ShoppingCart,
  Send
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface CriticalStockItem {
  id: string;
  partNumber: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  unitCostUsd: number;
  leadTimeDays: number;
  supplier: string;
  status: 'critical' | 'reorder' | 'ok';
}

const CRITICAL_STOCK_DATA: CriticalStockItem[] = [
  {
    id: 'stk_01',
    partNumber: 'P550428',
    name: 'Filtro de Aceite Lubricante Motor Cummins',
    brand: 'Donaldson OEM',
    category: 'Filtros Motor',
    currentStock: 4,
    reorderPoint: 15,
    suggestedReorderQty: 40,
    unitCostUsd: 18.5,
    leadTimeDays: 7,
    supplier: 'Donaldson Latin America / Caucedo',
    status: 'critical'
  },
  {
    id: 'stk_02',
    partNumber: '32/925682',
    name: 'Filtro Separador de Combustible y Trampa de Agua',
    brand: 'JCB Genuine',
    category: 'Filtros Diésel',
    currentStock: 6,
    reorderPoint: 18,
    suggestedReorderQty: 50,
    unitCostUsd: 26.0,
    leadTimeDays: 10,
    supplier: 'JCB Parts Hub Miami',
    status: 'critical'
  },
  {
    id: 'stk_03',
    partNumber: 'HD-220-TOOTH',
    name: 'Diente de Balde Reforzado Tipo Tigre 20T',
    brand: 'LiuGong Genuine',
    category: 'Herramientas de Corte',
    currentStock: 12,
    reorderPoint: 25,
    suggestedReorderQty: 60,
    unitCostUsd: 32.0,
    leadTimeDays: 14,
    supplier: 'LiuGong Overseas Supply',
    status: 'reorder'
  },
  {
    id: 'stk_04',
    partNumber: 'BLD-450-EDGE',
    name: 'Cuchilla de Desgaste Apernada 450HB (Motoniveladora)',
    brand: 'Hardox Wearparts',
    category: 'Cuchillas',
    currentStock: 3,
    reorderPoint: 10,
    suggestedReorderQty: 20,
    unitCostUsd: 145.0,
    leadTimeDays: 12,
    supplier: 'Hardox Dominicana / Almacén Central',
    status: 'critical'
  },
  {
    id: 'stk_05',
    partNumber: 'HYD-SEAL-922',
    name: 'Kit de Sellos Cilindro de Brazo Excavadora 922E',
    brand: 'NOK Japan / OEM',
    category: 'Sellos Hidráulicos',
    currentStock: 8,
    reorderPoint: 12,
    suggestedReorderQty: 25,
    unitCostUsd: 78.0,
    leadTimeDays: 5,
    supplier: 'NOK Americas Corp',
    status: 'reorder'
  }
];

interface CriticalStockReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CriticalStockReorderModal: React.FC<CriticalStockReorderModalProps> = ({
  isOpen,
  onClose
}) => {
  const [items, setItems] = useState<CriticalStockItem[]>(CRITICAL_STOCK_DATA);
  const [filter, setFilter] = useState<'all' | 'critical' | 'reorder'>('all');
  const [poGenerated, setPoGenerated] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const totalInvestmentUsd = filteredItems.reduce(
    (sum, item) => sum + item.suggestedReorderQty * item.unitCostUsd, 
    0
  );
  const totalInvestmentDop = Math.round(totalInvestmentUsd * USD_TO_DOP_RATE);

  const handleExportPurchaseOrder = () => {
    const poNum = `PO-TMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const poText = `=====================================================
TMD DOMINICANA - ORDEN DE COMPRA DE REPUESTOS CRÍTICOS
=====================================================
No. Orden: ${poNum}
Destino: Almacén Central Km 22, Autopista Duarte, Santo Domingo
Fecha: ${new Date().toLocaleDateString('es-DO')}
Moneda: Dólares Estadounidenses (USD)

DETALLE DE REPUESTOS POR REORDENAR:
-----------------------------------------------------
${filteredItems.map(item => `SKU: ${item.partNumber} | ${item.name} (${item.brand})
  - Stock Actual: ${item.currentStock} und | Punto Mínimo: ${item.reorderPoint} und
  - Cantidad Solicitada: ${item.suggestedReorderQty} und @ US$ ${item.unitCostUsd.toFixed(2)}
  - Subtotal: US$ ${(item.suggestedReorderQty * item.unitCostUsd).toLocaleString()}
  - Proveedor: ${item.supplier} (Lead Time: ${item.leadTimeDays} días)`).join('\n\n')}
-----------------------------------------------------
INVERSIÓN TOTAL ESTIMADA: US$ ${totalInvestmentUsd.toLocaleString()} (~RD$ ${totalInvestmentDop.toLocaleString()})
Aprobado por: Departamento de Compras & Gestión de Inventarios TMD Dominicana.
`;

    const blob = new Blob([poText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TMD_Orden_Compra_${poNum}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setPoGenerated(true);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Gestión de Stock Crítico & Reorden (Task #92)
                </span>
                <span className="text-[10px] text-zinc-400">
                  Almacén Central Km 22
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Puntos de Reorden Automatizados de Repuestos
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPurchaseOrder}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              title="Descargar orden de compra formal para proveedores"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar PO (TXT)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Filtrar Estado:</span>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-[2px] border border-zinc-800">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Todos ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === 'critical' ? 'bg-rose-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔴 Stock Crítico (3)
              </button>
              <button
                type="button"
                onClick={() => setFilter('reorder')}
                className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === 'reorder' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🟡 En Punto de Reorden (2)
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase block">Inversión de Reposición:</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              US$ {totalInvestmentUsd.toLocaleString()} <span className="text-zinc-400 text-[10px] font-normal">(~RD$ {totalInvestmentDop.toLocaleString()})</span>
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {poGenerated && (
            <div className="p-3.5 rounded-[3px] bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Orden de Compra generada y descargada. Los números de solicitud han sido remitidos al departamento de compras.</span>
              </div>
            </div>
          )}

          {/* Table of Critical Stock */}
          <div className="bg-zinc-950 rounded-[3px] border border-zinc-800 overflow-x-auto shadow-inner">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase text-zinc-400 tracking-wider">
                  <th className="p-3">Código P/N</th>
                  <th className="p-3">Repuesto & Marca</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 text-center">Punto Mínimo</th>
                  <th className="p-3 text-center">Sugerido (PO)</th>
                  <th className="p-3 text-right">Costo Unit.</th>
                  <th className="p-3 text-right">Inversión</th>
                  <th className="p-3 text-center">Lead Time</th>
                  <th className="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredItems.map((item) => {
                  const isCrit = item.status === 'critical';
                  const rowSubtotal = item.suggestedReorderQty * item.unitCostUsd;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {item.partNumber}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white block uppercase text-[11px]">{item.name}</span>
                        <span className="text-[10px] text-zinc-500">{item.brand} • {item.supplier}</span>
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-[2px] font-black text-xs ${
                          isCrit ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-400/20 text-amber-400'
                        }`}>
                          {item.currentStock} und
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-zinc-400">
                        {item.reorderPoint} und
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-400">
                        +{item.suggestedReorderQty}
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-300">
                        US$ {item.unitCostUsd.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        US$ {rowSubtotal.toLocaleString()}
                      </td>
                      <td className="p-3 text-center font-mono text-zinc-400 whitespace-nowrap">
                        {item.leadTimeDays} días
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-[2px] border ${
                          isCrit
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-amber-400 text-black border-amber-400 font-bold'
                        }`}>
                          {isCrit ? 'CRÍTICO' : 'REORDEN'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                El algoritmo calcula el punto de reorden basado en el consumo histórico de las órdenes de taller del Km 22 y ventas de mostrador.
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportPurchaseOrder}
              className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Orden de Compra</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
          <span>Sistema de Abastecimiento Preventivo TMD Dominicana 2026.</span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
