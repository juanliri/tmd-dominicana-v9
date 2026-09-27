import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Megaphone, 
  PhoneCall, 
  Clock, 
  Tag, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Save, 
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { 
  getBusinessConfig, 
  updateBusinessConfig, 
  resetBusinessConfigToDefault, 
  MonthlyBusinessConfig 
} from '../../services/businessConfigService';

interface MonthlyBusinessConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
}

export const MonthlyBusinessConfigModal: React.FC<MonthlyBusinessConfigModalProps> = ({
  isOpen,
  onClose,
  adminName = 'Administrador TMD'
}) => {
  const [config, setConfig] = useState<MonthlyBusinessConfig>(getBusinessConfig());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getBusinessConfig());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(config, adminName);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de que desea restablecer los valores oficiales predeterminados?')) {
      const reset = resetBusinessConfigToDefault();
      setConfig(reset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[5px] w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
        
        {/* Header Bar */}
        <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  PANEL DE OPERACIONES & GERENCIA
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-[10px] font-mono text-zinc-300">
                  SIN REDESPLIEGUE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-tight">
                Gestor de Variables Mensuales & Promociones TMD
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-200">
          
          {savedSuccess && (
            <div className="p-3.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Variables guardadas exitosamente y propagadas en tiempo real a todo el sitio web y portales.</span>
            </div>
          )}

          {/* 1. SECCIÓN ECONÓMICA & TASAS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
              <DollarSign className="w-4 h-4" />
              <span>1. Variables Financieras & Divisas (DOP / USD)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Tasa Oficial DOP/USD
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-xs">RD$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="40"
                    max="100"
                    value={config.exchangeRateDopUsd}
                    onChange={(e) => setConfig({ ...config, exchangeRateDopUsd: parseFloat(e.target.value) || 60.50 })}
                    className="w-full pl-11 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block">Referencia BCRD para catálogo y cotizaciones</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Tasa Financiamiento (% Anual)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-xs">%</span>
                  <input
                    type="number"
                    step="0.05"
                    min="5"
                    max="25"
                    value={config.financingAnnualRatePct}
                    onChange={(e) => setConfig({ ...config, financingAnnualRatePct: parseFloat(e.target.value) || 9.95 })}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block">Tasa bancaria para calculadora de leasing</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Plazo Máximo Leasing (Meses)
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={config.leasingTermsMonthsMax}
                  onChange={(e) => setConfig({ ...config, leasingTermsMonthsMax: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-zinc-500 block">Meses máximos de amortización comercial</span>
              </div>
            </div>
          </div>

          {/* 2. CAMPAÑA PUBLICITARIA & MARQUESINA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-amber-400 font-bold">
                <Megaphone className="w-4 h-4" />
                <span>2. Campaña del Mes (Marquesina & Hero Banner)</span>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.topPromoActive}
                  onChange={(e) => setConfig({ ...config, topPromoActive: e.target.checked })}
                  className="accent-amber-400 rounded-[1px] w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-zinc-300 font-bold">Banner Activo</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Titular de Campaña Destacada
                </label>
                <input
                  type="text"
                  value={config.topPromoHeadline}
                  onChange={(e) => setConfig({ ...config, topPromoHeadline: e.target.value })}
                  placeholder="Ej: FERIA DE INFRAESTRUCTURA & MINERÍA RD 2026"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-display uppercase focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Subtítulo / Condiciones Especiales
                </label>
                <input
                  type="text"
                  value={config.topPromoSubtitle}
                  onChange={(e) => setConfig({ ...config, topPromoSubtitle: e.target.value })}
                  placeholder="Ej: 0% Inicial en excavadoras LiuGong 922E con entrega inmediata"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Enlace de Acción (Ruta del Sitio)
                </label>
                <input
                  type="text"
                  value={config.topPromoTargetRoute}
                  onChange={(e) => setConfig({ ...config, topPromoTargetRoute: e.target.value })}
                  placeholder="#/machinery o #/financing"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-amber-400 font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. BENEFICIOS PRO-MEMBER */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
              <Tag className="w-4 h-4" />
              <span>3. Beneficios & Cupones Club Pro-Member</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Cupón Activo del Mes
                </label>
                <input
                  type="text"
                  value={config.activeProDiscountCode}
                  onChange={(e) => setConfig({ ...config, activeProDiscountCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-amber-400 font-mono font-bold uppercase focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Descuento Repuestos (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.proPartsDiscountPct}
                  onChange={(e) => setConfig({ ...config, proPartsDiscountPct: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Descuento Taller (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={config.proLaborDiscountPct}
                  onChange={(e) => setConfig({ ...config, proLaborDiscountPct: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-sm text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. ATENCIÓN & CONTACTO OPERATIVO */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-display uppercase tracking-wider text-amber-400 font-bold border-b border-zinc-800 pb-1.5">
              <PhoneCall className="w-4 h-4" />
              <span>4. Horarios & Números de Emergencia 24/7</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Línea Auxilio Vial & Emergencias
                </label>
                <input
                  type="text"
                  value={config.emergencyHotline}
                  onChange={(e) => setConfig({ ...config, emergencyHotline: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  WhatsApp Despacho Comercial
                </label>
                <input
                  type="text"
                  value={config.whatsappCommercial}
                  onChange={(e) => setConfig({ ...config, whatsappCommercial: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 block font-bold">
                  Horarios de Atención en Patio Km 22 Autopista Duarte
                </label>
                <input
                  type="text"
                  value={config.patioOperationalHours}
                  onChange={(e) => setConfig({ ...config, patioOperationalHours: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Last Updated Signature */}
          <div className="p-3 rounded-[3px] bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Última modificación: <strong className="text-zinc-300">{new Date(config.lastUpdatedAt).toLocaleString('es-DO')}</strong></span>
            <span>Por: <strong className="text-amber-400">{config.lastUpdatedBy}</strong></span>
          </div>

          {/* Footer Form Actions */}
          <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-display uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Valores Base</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display uppercase tracking-wider text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black font-display uppercase tracking-wider text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Publicar en Todo el Sitio</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
