import React, { useState } from 'react';
import {
  ShieldCheck,
  Disc,
  BatteryCharging,
  Calendar,
  AlertCircle,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  Truck,
  Plus,
  Clock,
  Wrench
} from 'lucide-react';

interface TiresBatteriesWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
}

interface WarrantyItem {
  id: string;
  type: 'battery' | 'tire';
  brand: string;
  modelOrSize: string;
  serialOrDot: string;
  installDate: string;
  installHours: number;
  warrantyMonths: number;
  warrantyHours: number;
  status: 'active' | 'claim_pending' | 'expired';
}

export const TiresBatteriesWarrantyModal: React.FC<TiresBatteriesWarrantyModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 856H Pala Cargadora de Ruedas',
  machineSerial = 'LG856H-DOM-2024-4190'
}) => {
  const [items, setItems] = useState<WarrantyItem[]>([
    {
      id: 'bat-01',
      type: 'battery',
      brand: 'TMD Pro Heavy Duty 24V',
      modelOrSize: '2x 12V 1100 CCA Grp 31',
      serialOrDot: 'TMD-BAT-24V-99120',
      installDate: '2025-06-15',
      installHours: 850,
      warrantyMonths: 18,
      warrantyHours: 2500,
      status: 'active'
    },
    {
      id: 'tire-01',
      type: 'tire',
      brand: 'Triangle Radial HD',
      modelOrSize: '23.5R25 TL-538S L5 Roca',
      serialOrDot: 'DOT 8X4R 2324-0091',
      installDate: '2025-03-10',
      installHours: 420,
      warrantyMonths: 24,
      warrantyHours: 3500,
      status: 'active'
    },
    {
      id: 'tire-02',
      type: 'tire',
      brand: 'Triangle Radial HD',
      modelOrSize: '23.5R25 TL-538S L5 Roca',
      serialOrDot: 'DOT 8X4R 2324-0092',
      installDate: '2025-03-10',
      installHours: 420,
      warrantyMonths: 24,
      warrantyHours: 3500,
      status: 'active'
    }
  ]);

  if (!isOpen) return null;

  const handleExportClaimReport = (item: WarrantyItem) => {
    const text = `=========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — CERTIFICADO DE GARANTÍA DIRECTA DE FÁBRICA\n` +
      `CONTROL DE BATERÍAS & NEUMÁTICOS INDUSTRIALES (KM 22 DUARTE)\n` +
      `=========================================================================\n\n` +
      `EQUIPO: ${machineName}\n` +
      `CHASIS / SERIE: ${machineSerial}\n` +
      `COMPONENTE: ${item.type === 'battery' ? 'Acumulador de 24V' : 'Neumático OTR'}\n` +
      `MARCA: ${item.brand}\n` +
      `ESPECIFICACIÓN: ${item.modelOrSize}\n` +
      `SERIAL / CÓDIGO DOT: ${item.serialOrDot}\n` +
      `FECHA DE INSTALACIÓN: ${item.installDate}\n` +
      `HORÓMETRO DE INSTALACIÓN: ${item.installHours} h\n` +
      `COBERTURA PACTADA: ${item.warrantyMonths} Meses / ${item.warrantyHours} Horas\n` +
      `ESTADO ACTUAL: Cobertura Válida (Reemplazo Inmediato en Almacén Km 22)\n\n` +
      `Sello de Taller Autorizado TMD Dominicana • (809) 560-1234\n` +
      `=========================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_GARANTIA_${item.type.toUpperCase()}_${item.serialOrDot}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  CONTROL DE GARANTÍAS OEM
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Gestión ante Fabricantes de Cauchos y Baterías
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Garantías de Baterías & Neumáticos
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

        {/* Machine strip */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block font-bold">EQUIPO VINCULADO:</span>
            <span className="font-bold text-white text-xs">{machineName}</span>
          </div>
          <span className="text-amber-400 font-mono text-[11px]">{machineSerial}</span>
        </div>

        {/* Items List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[65vh] text-xs">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold px-1">
            <span>Componentes con Cobertura Vigente:</span>
            <span>Total: {items.length} Registros</span>
          </div>

          {items.map(item => (
            <div
              key={item.id}
              className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-[3px] space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[2px] border ${
                    item.type === 'battery'
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                      : 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
                  }`}>
                    {item.type === 'battery' ? <BatteryCharging className="w-4 h-4" /> : <Disc className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.brand}</span>
                      <span className="text-[10px] text-zinc-400">{item.modelOrSize}</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono block">
                      Serial/DOT: <strong>{item.serialOrDot}</strong>
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase">
                  Garantía Activa
                </span>
              </div>

              {/* Specs & Hours */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-[2px] border border-zinc-850">
                <div>
                  <span className="text-zinc-500 block">INSTALACIÓN:</span>
                  <span className="text-white font-mono">{item.installDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">HORÓMETRO INICIAL:</span>
                  <span className="text-white font-mono">{item.installHours} h</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">MESES PACTADOS:</span>
                  <span className="text-white font-mono">{item.warrantyMonths} meses</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">HORAS COBERTURA:</span>
                  <span className="text-white font-mono">{item.warrantyHours} h</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleExportClaimReport(item)}
                  className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1 border border-zinc-700"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>Dossier de Reclamo</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Almacén Km 22 • Stock de Baterías 24V y Gomas OTR en Entrega Inmediata
          </span>
          <span className="text-zinc-500 font-mono text-[10px]">TMD Workshop Core</span>
        </div>
      </div>
    </div>
  );
};
