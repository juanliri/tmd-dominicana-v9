import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  DollarSign, 
  TrendingDown, 
  FileText,
  Building2,
  HelpCircle
} from 'lucide-react';

interface MarginGuardValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorize: (authorizedBy: string, justification: string) => void;
  machineModel: string;
  listPriceUsd: number;
  offeredPriceUsd: number;
  dealerCifCostUsd: number;
  calculatedMarginPercent: number;
}

const AUTHORIZED_PINS = ['GERENCIA-2026', 'TMD-DIR-2026', '2026', '84920'];

export const MarginGuardValidatorModal: React.FC<MarginGuardValidatorModalProps> = ({
  isOpen,
  onClose,
  onAuthorize,
  machineModel,
  listPriceUsd,
  offeredPriceUsd,
  dealerCifCostUsd,
  calculatedMarginPercent
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [justification, setJustification] = useState<string>('Licitación MOPC o compra de flota corporativa con compromiso de repuestos exclusivos');
  const [directorName, setDirectorName] = useState<string>('Dirección Comercial TMD Dominicana');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const grossProfitUsd = offeredPriceUsd - dealerCifCostUsd;
  const minimumPriceFor12Percent = Math.round(dealerCifCostUsd / (1 - 0.12));
  const deficitUsd = minimumPriceFor12Percent - offeredPriceUsd;

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPin = pinInput.trim();
    if (!AUTHORIZED_PINS.includes(cleanPin)) {
      setErrorMessage('PIN de Aprobación Gerencial Incorrecto. Consulte con el Director Comercial (Demo PIN: GERENCIA-2026 o 2026).');
      return;
    }

    if (!justification.trim() || justification.trim().length < 10) {
      setErrorMessage('Debe ingresar una justificación comercial de excepción con al menos 10 caracteres.');
      return;
    }

    onAuthorize(directorName, justification.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-rose-500/80 rounded-[5px] max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Alert Bar */}
        <div className="flex items-center justify-between p-4 border-b border-rose-500/30 bg-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-rose-600 text-white shadow-md">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Control de Márgenes Mínimos (Task #77)
                </span>
                <span className="text-[10px] text-rose-400 font-bold">
                  Umbral Mínimo: 12.0%
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Bloqueo de Cotización por Margen Crítico
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleValidateAndSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="p-3.5 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="uppercase text-[10px]">Equipo Ofertado:</span>
              <strong className="text-white uppercase font-display">{machineModel}</strong>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="uppercase text-[10px]">Precio de Lista Base:</span>
              <span className="text-zinc-300">US$ {listPriceUsd.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="uppercase text-[10px]">Costo Distribuidor CIF Caucedo:</span>
              <span className="text-zinc-300">US$ {dealerCifCostUsd.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
              <span className="uppercase text-[10px] text-amber-400">Precio Ofertado al Cliente:</span>
              <strong className="text-amber-400 text-sm">US$ {offeredPriceUsd.toLocaleString()}</strong>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
              <span className="uppercase text-[10px] font-bold text-rose-400">Margen Bruto Calculado:</span>
              <span className="text-rose-400 font-black text-sm px-2 py-0.5 bg-rose-500/20 rounded-[2px] border border-rose-500/40">
                {calculatedMarginPercent.toFixed(1)}% (Ganancia: US$ {grossProfitUsd.toLocaleString()})
              </span>
            </div>
          </div>

          {deficitUsd > 0 && (
            <div className="p-3 rounded-[3px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] leading-relaxed">
              <strong>Advertencia Comercial:</strong> El precio negociado se encuentra <strong>US$ {deficitUsd.toLocaleString()}</strong> por debajo del precio mínimo de viabilidad económica con margen del 12.0% (US$ {minimumPriceFor12Percent.toLocaleString()}).
            </div>
          )}

          {/* Manager Authentication Inputs */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>PIN de Autorización Gerencial *</span>
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingrese PIN Maestro (ej: GERENCIA-2026)"
                className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:border-amber-400 focus:outline-none tracking-widest"
                required
              />
              <span className="text-[10px] text-zinc-500 font-sans">
                Código demo para evaluación: <code className="text-amber-400">GERENCIA-2026</code> o <code className="text-amber-400">2026</code>
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Cargo / Director que Autoriza</span>
              </label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Justificación Comercial de Excepción (Auditoría) *</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-[2px] bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed"
                placeholder="Especifique motivo: cliente de volumen, licitación estatal, etc."
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-[2px] bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-[2px] bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Autorizar Excepción & Proceder</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
