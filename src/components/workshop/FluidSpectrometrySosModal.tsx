import React, { useState } from 'react';
import {
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
  X,
  FileText,
  Search,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  FlaskConical
} from 'lucide-react';

interface FluidSpectrometrySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
}

interface SpectrometryMetal {
  symbol: string;
  name: string;
  currentPpm: number;
  maxNormalPpm: number;
  originComponent: string;
  status: 'normal' | 'warning' | 'critical';
}

export const FluidSpectrometrySosModal: React.FC<FluidSpectrometrySosModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora',
  machineSerial = 'LG922E-2024-88412'
}) => {
  const [fluidType, setFluidType] = useState<'engine' | 'hydraulic' | 'transmission'>('engine');
  const [sampleDate, setSampleDate] = useState('2026-03-22');
  const [sampleHours, setSampleHours] = useState('3250');
  const [labNumber, setLabNumber] = useState('SOS-LAB-2026-0491');

  // Spectrometry wear metals (PPM)
  const metals: SpectrometryMetal[] = [
    { symbol: 'Cu', name: 'Cobre', currentPpm: 12, maxNormalPpm: 25, originComponent: 'Cojinetes de biela y casquillos de bancada', status: 'normal' },
    { symbol: 'Fe', name: 'Hierro', currentPpm: 68, maxNormalPpm: 100, originComponent: 'Camisas de cilindros y engranajes de distribución', status: 'normal' },
    { symbol: 'Si', name: 'Silicio (Polvo)', currentPpm: 8, maxNormalPpm: 15, originComponent: 'Contaminación externa por sello de filtro de aire', status: 'normal' },
    { symbol: 'Cr', name: 'Cromo', currentPpm: 4, maxNormalPpm: 10, originComponent: 'Anillos de compresión de pistones', status: 'normal' },
    { symbol: 'Pb', name: 'Plomo', currentPpm: 9, maxNormalPpm: 20, originComponent: 'Revestimiento antifricción de rodamientos', status: 'normal' },
    { symbol: 'Al', name: 'Aluminio', currentPpm: 7, maxNormalPpm: 18, originComponent: 'Falda de pistones y carcasas de bombas', status: 'normal' }
  ];

  // Fluid physical properties
  const physicalProps = {
    viscosityCst: 14.2, // 15W-40 nominal ~12.5-16.3
    viscosityStatus: 'En Rango (15W-40 Heavy Duty)',
    fuelDilutionPercent: 0.8, // Max < 2.5%
    waterPercent: 0.05, // Max < 0.1%
    sootPercent: 0.6, // Max < 1.5%
    oxidationAbsCm: 11, // Max < 25
    overallHealth: 'EXCELENTE / OPERACIÓN SEGURA'
  };

  if (!isOpen) return null;

  const handleExportLabReport = () => {
    let text = `=========================================================================\n`;
    text += `TECNOMAQUINARIAS DIESEL S.R.L. — LABORATORIO ESPECTROMETRÍA S.O.S.\n`;
    text += `INFORME OFICIAL DE ANÁLISIS DE FLUIDOS & TRIBOLOGÍA PREDICTIVA\n`;
    text += `MUESTRA: ${labNumber} • FECHA: ${sampleDate}\n`;
    text += `EQUIPO: ${machineName} • SERIE: ${machineSerial}\n`;
    text += `COMPARTIMIENTO: ${fluidType.toUpperCase()} • HORÓMETRO: ${sampleHours} HORAS\n`;
    text += `=========================================================================\n\n`;

    text += `1. ESPECTROMETRÍA POR EMISIÓN ÓPTICA (METALES DE DESGASTE PPM):\n`;
    metals.forEach(m => {
      text += `   • ${m.name} (${m.symbol}): ${m.currentPpm} PPM (Límite: <${m.maxNormalPpm} PPM) — ESTADO: ${m.status.toUpperCase()}\n`;
      text += `     Origen: ${m.originComponent}\n`;
    });

    text += `\n2. PROPIEDADES FÍSICO-QUÍMICAS:\n`;
    text += `   - Viscosidad Cinemática a 100°C: ${physicalProps.viscosityCst} cSt (${physicalProps.viscosityStatus})\n`;
    text += `   - Dilución por Diésel: ${physicalProps.fuelDilutionPercent}% (Normal < 2.5%)\n`;
    text += `   - Presencia de Agua: ${physicalProps.waterPercent}% (Normal < 0.1%)\n`;
    text += `   - Nivel de Hollín (Soot): ${physicalProps.sootPercent}% (Normal < 1.5%)\n`;
    text += `   - Oxidación Infrarroja: ${physicalProps.oxidationAbsCm} abs/cm (Normal < 25)\n\n`;

    text += `3. DIAGNÓSTICO DEL INGENIERO TRIBÓLOGO:\n`;
    text += `   Aceite en condiciones óptimas. Desgaste de metales muy por debajo de los umbrales de alerta.\n`;
    text += `   Se recomienda mantener intervalo de recambio a las 500 horas de motor.\n\n`;
    text += `CERTIFICADO EXPEDIDO POR: Ing. Laboratorio S.O.S. TMD Dominicana\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_SOS_LAB_${labNumber}.txt`;
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
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  S.O.S. LAB • TRIBOLOGÍA
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Espectrometría de Aceites
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Análisis Espectrométrico de Fluidos
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

        {/* Toolbar Compartment Selector */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 uppercase">Circuito Analizado:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFluidType('engine')}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-bold uppercase transition-colors cursor-pointer ${
                  fluidType === 'engine'
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Motor Diésel
              </button>
              <button
                onClick={() => setFluidType('hydraulic')}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-bold uppercase transition-colors cursor-pointer ${
                  fluidType === 'hydraulic'
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Hidráulico 350 Bar
              </button>
              <button
                onClick={() => setFluidType('transmission')}
                className={`px-2.5 py-1 rounded-[2px] text-xs font-bold uppercase transition-colors cursor-pointer ${
                  fluidType === 'transmission'
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Mandos Finales
              </button>
            </div>
          </div>

          <span className="text-[11px] text-zinc-400 font-mono">
            Lab ID: <strong className="text-white">{labNumber}</strong>
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {/* Machine Header */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Equipo Evaluado:</span>
              <span className="font-bold text-white text-xs">{machineName}</span>
              <span className="text-[10px] text-zinc-500 font-mono block">Chasis: {machineSerial}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Horómetro Muestra:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{sampleHours} horas</span>
              <span className="text-[10px] text-emerald-400 block font-bold">Diagnóstico: {physicalProps.overallHealth}</span>
            </div>
          </div>

          {/* Metals PPM Grid */}
          <div>
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display mb-2">
              Concentración de Metales de Fricción (Espectrometría ICP-OES):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {metals.map((m, idx) => {
                const percentOfMax = Math.round((m.currentPpm / m.maxNormalPpm) * 100);
                return (
                  <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-[2px] bg-zinc-800 text-amber-400 font-bold flex items-center justify-center text-[11px]">
                          {m.symbol}
                        </span>
                        <span className="font-bold text-white text-xs">{m.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {m.currentPpm} <span className="text-[9px] text-zinc-500">PPM</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${percentOfMax}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Límite: &lt;{m.maxNormalPpm} PPM</span>
                      <span className="text-emerald-400 font-bold">{percentOfMax}% del máx</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical & Chemical Indicators */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display">
              Contaminación & Propiedades Físicas:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-[2px]">
                <span className="text-[10px] text-zinc-400 block uppercase">Viscosidad cSt</span>
                <span className="font-bold text-white font-mono text-sm">{physicalProps.viscosityCst}</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Óptimo (15W-40)</span>
              </div>

              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-[2px]">
                <span className="text-[10px] text-zinc-400 block uppercase">Diésel en Aceite</span>
                <span className="font-bold text-white font-mono text-sm">{physicalProps.fuelDilutionPercent}%</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">&lt; 2.5% Seguro</span>
              </div>

              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-[2px]">
                <span className="text-[10px] text-zinc-400 block uppercase">Humedad / Agua</span>
                <span className="font-bold text-white font-mono text-sm">{physicalProps.waterPercent}%</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Sin emulsión</span>
              </div>

              <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-[2px]">
                <span className="text-[10px] text-zinc-400 block uppercase">Hollín Motor</span>
                <span className="font-bold text-white font-mono text-sm">{physicalProps.sootPercent}%</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">&lt; 1.5% Normal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Muestra Certificada con Trazabilidad ISO 4406</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLabReport}
              className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Informe S.O.S.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
