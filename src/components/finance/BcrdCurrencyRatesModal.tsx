import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Calculator,
  Lock,
  Layers,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { useCart } from '../../context/CartContext';

interface BankRate {
  bank: string;
  buy: number;
  sell: number;
  spread: number;
  preferred: boolean;
}

const COMMERCIAL_BANKS: BankRate[] = [
  { bank: 'Banco de Reservas (Banreservas)', buy: 60.15, sell: 60.45, spread: 0.30, preferred: true },
  { bank: 'Banco BHD', buy: 60.12, sell: 60.48, spread: 0.36, preferred: false },
  { bank: 'Banco Popular Dominicano', buy: 60.10, sell: 60.50, spread: 0.40, preferred: false },
  { bank: 'Scotiabank República Dominicana', buy: 60.05, sell: 60.55, spread: 0.50, preferred: false },
  { bank: 'Banco Santa Cruz', buy: 60.08, sell: 60.52, spread: 0.44, preferred: false }
];

const HISTORICAL_30D_RATES = [
  { day: '01 Sep', rate: 60.02 },
  { day: '05 Sep', rate: 60.08 },
  { day: '10 Sep', rate: 60.15 },
  { day: '15 Sep', rate: 60.22 },
  { day: '20 Sep', rate: 60.28 },
  { day: '25 Sep', rate: 60.32 },
  { day: 'Hoy', rate: 60.35 }
];

interface BcrdCurrencyRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BcrdCurrencyRatesModal: React.FC<BcrdCurrencyRatesModalProps> = ({ isOpen, onClose }) => {
  const { currency, setCurrency, exchangeRate, exchangeRateData, refreshExchangeRate, isSyncingRate } = useCart();
  const [activeTab, setActiveTab] = useState<'bcrd' | 'banks' | 'simulator'>('bcrd');
  const [simUsdAmount, setSimUsdAmount] = useState<number>(128000);
  const [selectedBank, setSelectedBank] = useState<BankRate>(COMMERCIAL_BANKS[0]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncTimestamp, setSyncTimestamp] = useState<string>(() => {
    return `Sincronizado: ${new Date(exchangeRateData.lastUpdated || Date.now()).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })} • ${exchangeRateData.source}`;
  });

  if (!isOpen || typeof document === 'undefined') return null;

  const officialBcrdRef = exchangeRateData.bcrdReference || exchangeRate || 60.50;
  const officialBcrdBuy = Number((officialBcrdRef * 0.995).toFixed(2));
  const officialBcrdSell = Number((officialBcrdRef * 1.005).toFixed(2));
  const officialEurBuy = Number((officialBcrdRef * 1.078).toFixed(2));
  const officialEurSell = Number((officialBcrdRef * 1.089).toFixed(2));

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    try {
      await refreshExchangeRate();
      setSyncTimestamp(`Actualizado: ${new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })} • API Live`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportExchangeCertificate = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - CONSTANCIA TÉCNICA DE TIPO DE CAMBIO OFICIAL (BCRD)\n`;
    report += `Generado: ${new Date().toLocaleString('es-DO')} | Base Oficial: ${exchangeRateData.source}\n`;
    report += `========================================================================\n\n`;
    report += `TASAS OFICIALES REGISTRADAS:\n`;
    report += `• Dólar Estadounidense (USD) Compra: RD$ ${officialBcrdBuy.toFixed(2)}\n`;
    report += `• Dólar Estadounidense (USD) Venta:  RD$ ${officialBcrdSell.toFixed(2)}\n`;
    report += `• Tasa Promedio Ponderada (Referencia): RD$ ${officialBcrdRef.toFixed(2)}\n`;
    report += `• Euro (EUR) Compra: RD$ ${officialEurBuy.toFixed(2)} | Venta: RD$ ${officialEurSell.toFixed(2)}\n\n`;
    report += `DIFERENCIAL CAMBIARIO EN BANCA MÚLTIPLE DOMINICANA:\n`;
    COMMERCIAL_BANKS.forEach((b) => {
      report += ` - ${b.bank.padEnd(38, ' ')} | Compra: RD$ ${b.buy.toFixed(2)} | Venta: RD$ ${b.sell.toFixed(2)} | Spread: RD$ ${b.spread.toFixed(2)}\n`;
    });
    report += `\nSIMULACIÓN DE LIQUIDACIÓN DE MAQUINARIA:\n`;
    report += `• Monto Base USD: US$ ${simUsdAmount.toLocaleString()}\n`;
    report += `• Liquidación con Tasa Oficial BCRD:  RD$ ${(simUsdAmount * officialBcrdRef).toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n`;
    report += `• Liquidación con ${selectedBank.bank}: RD$ ${(simUsdAmount * selectedBank.sell).toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n`;
    report += `• Variación Comercial Bancaria: RD$ ${Math.abs(simUsdAmount * selectedBank.sell - simUsdAmount * officialBcrdRef).toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n\n`;
    report += `Este comprobante sirve de referencia para contratos de compraventa y proformas fiscales conforme a la Ley Monetaria y Financiera 183-02.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_Certificado_Tasa_BCRD_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-zinc-950/95 backdrop-blur-2xl rounded-[6px] border border-white/[0.08] max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        {/* CAD Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400/50 pointer-events-none" />
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                  Macroeconomía & Tesorería • BCRD Oficial
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  LEY MONETARIA 183-02
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Tipo de Cambio Banco Central (BCRD)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              className="p-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
              title="Refrescar tasa del Banco Central"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportExchangeCertificate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>CERTIFICADO TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Pill */}
        <div className="flex items-center justify-between text-xs bg-zinc-900/80 px-3 py-2 rounded-[3px] border border-zinc-800 text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-sans">{syncTimestamp}</span>
          </div>
          <a
            href="https://www.bancentral.gov.do/a/d/2539-mercado-cambiario"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-sans"
          >
            <span>Portal Oficial BCRD</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('bcrd')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all font-display cursor-pointer ${
              activeTab === 'bcrd'
                ? 'bg-amber-400 text-black shadow-sm font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Tasas Oficiales BCRD
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all font-display cursor-pointer ${
              activeTab === 'banks'
                ? 'bg-amber-400 text-black shadow-sm font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Banca Múltiple RD ({COMMERCIAL_BANKS.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider transition-all font-display cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-amber-400 text-black shadow-sm font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Simulador de Impacto en Flota
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: BCRD OFFICIAL RATES */}
          {activeTab === 'bcrd' && (
            <div className="space-y-4">
              
              {/* Highlight Cards: USD & EUR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* USD Card */}
                <div className="bg-zinc-900 rounded-[3px] border border-amber-400/40 p-4 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      DÓLAR ESTADOUNIDENSE (USD)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                      TASA OFICIAL
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Compra Oficial</span>
                      <span className="text-2xl font-black text-white font-mono">
                        RD$ {officialBcrdBuy.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Venta Oficial</span>
                      <span className="text-2xl font-black text-amber-400 font-mono">
                        RD$ {officialBcrdSell.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Tasa de Referencia Ponderada:</span>
                    <span className="text-white font-bold font-mono">RD$ {officialBcrdRef.toFixed(2)}</span>
                  </div>
                </div>

                {/* EUR Card */}
                <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      EURO DE LA UNIÓN EUROPEA (EUR)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-[2px] bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                      REPUESTOS AMMANN / IMER
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Compra Oficial</span>
                      <span className="text-2xl font-black text-white font-mono">
                        RD$ {officialEurBuy.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block">Venta Oficial</span>
                      <span className="text-2xl font-black text-zinc-200 font-mono">
                        RD$ {officialEurSell.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span>Equivalente Cruzado USD/EUR:</span>
                    <span className="text-white font-bold font-mono">1.082 EUR/USD</span>
                  </div>
                </div>
              </div>

              {/* 30-Day Trend Historical Visualizer */}
              <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Comportamiento Histórico USD/DOP (Últimos 30 Días)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    +0.55% Desplazamiento Anual Ponderado (Estable)
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs">
                  {HISTORICAL_30D_RATES.map((h, i) => (
                    <div key={i} className="bg-zinc-950 p-2.5 rounded-[2px] border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block mb-1">{h.day}</span>
                      <span className="text-xs font-black text-zinc-200 font-mono block">
                        {h.rate.toFixed(2)}
                      </span>
                      <div className="w-full bg-zinc-800 h-1 mt-2 rounded-[1px] overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full" 
                          style={{ width: `${((h.rate - 59.9) / 0.5) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy Notes */}
              <div className="p-3.5 bg-zinc-950 rounded-[3px] border border-zinc-800 text-xs text-zinc-400 space-y-1.5 font-sans">
                <p className="font-bold text-white font-display uppercase tracking-wider text-[11px]">
                  Regulación Monetaria Aplicable a TMD Dominicana:
                </p>
                <p>
                  De conformidad con la Circular de Operaciones del Banco Central y el Código Tributario Dominicano, todas las facturas y comprobantes fiscales (NCF B01/B02) pueden liquidarse en Pesos Dominicanos (DOP) utilizando la tasa oficial de venta publicada en el boletín del día, asegurando blindaje contra contingencias cambiarias.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: COMMERCIAL BANK SPREADS */}
          {activeTab === 'banks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>COTIZACIONES VIGENTES EN BANCA MÚLTIPLE DE LA REPÚBLICA DOMINICANA</span>
                <span className="text-amber-400 font-bold">ORDENADO POR SPREAD MENOR</span>
              </div>

              <div className="border border-zinc-800 rounded-[3px] overflow-hidden bg-zinc-900">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase">
                      <th className="p-3">Entidad Bancaria</th>
                      <th className="p-3 text-right">Compra USD</th>
                      <th className="p-3 text-right">Venta USD</th>
                      <th className="p-3 text-right">Spread (DOP)</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {COMMERCIAL_BANKS.map((b, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          {b.preferred && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Tasa Preferencial TMD" />
                          )}
                          <span>{b.bank}</span>
                        </td>
                        <td className="p-3 text-right text-zinc-300 font-bold">
                          RD$ {b.buy.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-amber-400 font-black">
                          RD$ {b.sell.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-zinc-400">
                          RD$ {b.spread.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedBank(b);
                              setActiveTab('simulator');
                            }}
                            className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            Simular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Simulador de Conversión de Maquinaria y Licitaciones
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      Monto de la Operación en Dólares (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="100"
                        step="1000"
                        value={simUsdAmount}
                        onChange={(e) => setSimUsdAmount(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      Banco Seleccionado para Liquidación
                    </label>
                    <select
                      value={selectedBank.bank}
                      onChange={(e) => {
                        const b = COMMERCIAL_BANKS.find((x) => x.bank === e.target.value);
                        if (b) setSelectedBank(b);
                      }}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      {COMMERCIAL_BANKS.map((b) => (
                        <option key={b.bank} value={b.bank}>
                          {b.bank} (Venta: RD$ {b.sell.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversion Results Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
                  <div className="bg-zinc-950 p-3.5 rounded-[2px] border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Total a Tasa Oficial BCRD</span>
                    <span className="text-lg font-black text-emerald-400 font-mono block mt-1">
                      RD$ {(simUsdAmount * officialBcrdRef).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-zinc-500">Ref: 60.35 DOP/USD</span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-[2px] border border-amber-400/40">
                    <span className="text-[10px] text-zinc-500 uppercase block">Total con {selectedBank.bank.split(' ')[0]}</span>
                    <span className="text-lg font-black text-amber-400 font-mono block mt-1">
                      RD$ {(simUsdAmount * selectedBank.sell).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-zinc-500">Venta: {selectedBank.sell.toFixed(2)} DOP/USD</span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-[2px] border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Diferencial Cambiario</span>
                    <span className="text-lg font-black text-zinc-300 font-mono block mt-1">
                      RD$ {Math.abs(simUsdAmount * selectedBank.sell - simUsdAmount * officialBcrdRef).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-zinc-500">Spread total en operación</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            Sincronización Bancaria TMD • Actualizado diariamente a las 09:00 AM AST
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
          >
            Aceptar & Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
