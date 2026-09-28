import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  FlaskConical, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Printer, 
  Calendar, 
  Sparkles,
  FileCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface OilSpectrometryModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SpectrometryMetal {
  symbol: string;
  name: string;
  measuredPpm: number;
  cautionThresholdPpm: number;
  criticalThresholdPpm: number;
  likelySource: string;
}

const WEAR_METALS: SpectrometryMetal[] = [
  { symbol: 'Fe', name: 'Hierro', measuredPpm: 24, cautionThresholdPpm: 75, criticalThresholdPpm: 120, likelySource: 'Camisas de cilindro, engranajes de distribución, cigüeñal' },
  { symbol: 'Cu', name: 'Cobre', measuredPpm: 9, cautionThresholdPpm: 30, criticalThresholdPpm: 50, likelySource: 'Bujes de pie de biela, enfriador de aceite, cojinetes' },
  { symbol: 'Al', name: 'Aluminio', measuredPpm: 7, cautionThresholdPpm: 25, criticalThresholdPpm: 40, likelySource: 'Faldas de pistón, carcasas de bombas de transferencia' },
  { symbol: 'Cr', name: 'Cromo', measuredPpm: 3, cautionThresholdPpm: 15, criticalThresholdPpm: 25, likelySource: 'Anillos de compresión, vástagos de válvulas' },
  { symbol: 'Pb', name: 'Plomo', measuredPpm: 8, cautionThresholdPpm: 28, criticalThresholdPpm: 45, likelySource: 'Material antifricción de casquillos de biela y bancada' },
  { symbol: 'Si', name: 'Silicio (Polvo/Tierra)', measuredPpm: 12, cautionThresholdPpm: 25, criticalThresholdPpm: 40, likelySource: 'Ingreso de polvo ambiental por filtro de aire o juntas defectuosas' }
];

export const OilSpectrometryModal: React.FC<OilSpectrometryModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [sampleFolio] = useState(() => `SOS-2026-KM22-${Math.floor(1000 + Math.random() * 9000)}`);
  const [compartment, setCompartment] = useState<'motor' | 'hidraulico'>('motor');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen || !machine) return null;

  const sampleDate = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleExportPdf = async () => {
    triggerHaptic('heavyShud');
    setIsExportingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Amber Stripe
      doc.setFillColor(245, 158, 11);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // Top Dark Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 5, pageWidth, 28, 'F');

      // Logo TMD
      drawTmdOfficialLogoPdf(doc, 12, 8, 38, 14);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('INFORME ESPECTROMÉTRICO DE ANÁLISIS DE ACEITE (S.O.S.)', 55, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text('LABORATORIO DE TRIBOLOGÍA & DIAGNÓSTICO PREDICTIVO — KM 22', 55, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`FOLIO DE MUESTRA: ${sampleFolio} | FECHA DE ENSAYO: ${sampleDate.toUpperCase()}`, 55, 28);

      // Machine & Sample Info Grid
      autoTable(doc, {
        startY: 38,
        head: [['DATOS DEL EQUIPO & MUESTRA', 'RESULTADO DEL DICTAMEN DE LABORATORIO']],
        body: [
          [
            `Equipo: ${machine.name} (${machine.brand})\nModelo: Mod. ${machine.modelCode}\nCompartimiento: ${compartment === 'motor' ? 'Cárter de Motor Diésel (15W-40)' : 'Tanque Hidráulico (ISO VG 46)'}\nHoras de Aceite: 250 Horas | Horómetro Total: 1,480 h`,
            `Estado General: NORMAL (CONFORME ✓)\nViscosidad Cinemática @ 100°C: 14.1 cSt (Dentro de norma)\nDilución por Combustible: < 0.8% (Óptimo)\nHollín / Insoluble: 0.6% | TBN: 8.6 mg KOH/g`
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [15, 23, 42]
        },
        margin: { left: 12, right: 12 }
      });

      // Spectrometry Metals Table
      const metalRows = WEAR_METALS.map(m => {
        const isOk = m.measuredPpm < m.cautionThresholdPpm;
        return [
          `${m.name} (${m.symbol})`,
          `${m.measuredPpm} ppm`,
          `< ${m.cautionThresholdPpm} ppm`,
          `< ${m.criticalThresholdPpm} ppm`,
          isOk ? 'NORMAL ✓' : 'ALERTA ⚠',
          m.likelySource
        ];
      });

      // @ts-ignore
      const tableY = doc.lastAutoTable.finalY + 6;

      autoTable(doc, {
        startY: tableY,
        head: [['ELEMENTO METÁLICO', 'MEDICIÓN (PPM)', 'LÍMITE PRECAUCIÓN', 'LÍMITE CRÍTICO', 'ESTADO', 'COMPONENTE EN CONTACTO']],
        body: metalRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold' },
          1: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
          5: { cellWidth: 45 }
        },
        margin: { left: 12, right: 12 }
      });

      // Signatures
      // @ts-ignore
      const sigY = doc.lastAutoTable.finalY + 12;

      doc.setDrawColor(203, 213, 225);
      doc.line(16, sigY + 18, 75, sigY + 18);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('ING. QUÍMICO TRIBÓLOGO RESPONSABLE', 16, sigY + 23);
      doc.setFont('helvetica', 'normal');
      doc.text('Laboratorio Central S.O.S. TMD Km 22', 16, sigY + 27);

      // Lab Stamp
      doc.setDrawColor(245, 158, 11);
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(95, sigY + 5, 50, 22, 2, 2, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('LABORATORIO S.O.S. CERTIFICADO', 97, sigY + 12);
      doc.setFontSize(6.5);
      doc.text('TMD KM 22 — ESTADO NORMAL', 97, sigY + 17);
      doc.text('CALIDAD DE ACEITE APROBADA', 97, sigY + 22);

      doc.save(`Analisis_Aceite_SOS_${machine.brand}_${machine.modelCode}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating oil spectrometry PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono text-white">
        
        {/* Modal Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Análisis Espectrométrico de Aceite S.O.S.
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  ESTADO NORMAL (0 ALERTAS)
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                Folio: <strong className="text-amber-400 font-mono">{sampleFolio}</strong> • {machine.brand} {machine.name} (Mod. {machine.modelCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {/* Compartment Selector */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2px] p-0.5 flex items-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setCompartment('motor');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  compartment === 'motor' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Motor (15W-40)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setCompartment('hidraulico');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  compartment === 'hidraulico' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Hidráulico (VG 46)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generando...' : 'Descargar Informe'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Diagnostics Strip */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Viscosidad @ 100°C:</span>
            <span className="text-white font-mono font-bold text-xs">14.1 cSt (Normal)</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Dilución Diésel:</span>
            <span className="text-emerald-400 font-mono font-bold text-xs">&lt; 0.8% (Óptimo)</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Reserva TBN:</span>
            <span className="text-amber-400 font-mono font-bold text-xs">8.6 mg KOH/g</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Hollín / Cenizas:</span>
            <span className="text-zinc-300 font-mono font-bold text-xs">0.6% (Bajo)</span>
          </div>
        </div>

        {/* Wear Metals Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[11px] text-zinc-400 font-bold uppercase">
            <span>Espectrometría por Plasma ICP (Metales de Desgaste)</span>
            <span>Unidades: Partes por Millón (PPM)</span>
          </div>

          <div className="space-y-2">
            {WEAR_METALS.map(metal => {
              const percentOfCaution = Math.round((metal.measuredPpm / metal.cautionThresholdPpm) * 100);
              const isNormal = metal.measuredPpm < metal.cautionThresholdPpm;

              return (
                <div
                  key={metal.symbol}
                  className="p-3 rounded-[3px] bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-[2px] bg-zinc-950 border border-zinc-700 font-mono font-bold text-amber-400 flex items-center justify-center text-xs shrink-0">
                        {metal.symbol}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-tight">
                          {metal.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-sans">
                          {metal.likelySource}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    {/* Visual Bar */}
                    <div className="w-24 sm:w-32 hidden sm:block">
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-0.5">
                        <span>{metal.measuredPpm} ppm</span>
                        <span className="text-zinc-500">Lím: {metal.cautionThresholdPpm}</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isNormal ? 'bg-emerald-400' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(percentOfCaution, 100)}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-xs font-black text-white w-14 text-right">
                      {metal.measuredPpm} ppm
                    </span>

                    <span className="px-2 py-0.5 rounded-[2px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase w-20 text-center">
                      NORMAL ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verdict Box */}
          <div className="p-3.5 rounded-[3px] bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Dictamen Técnico del Laboratorio de Tribología TMD:
              </span>
              <p className="text-xs text-zinc-200 font-sans mt-0.5 leading-relaxed">
                Muestra de lubricante sin indicios de desgaste anormal en cojinetes, camisas o bujes. Estanqueidad del filtro de aire confirmada por bajo nivel de silicio (&lt; 15 ppm). El equipo puede continuar operando normalmente hasta su próximo servicio programado a las 500 horas.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Análisis avalado bajo norma ASTM D5185 por plasma de acoplamiento inductivo (ICP).</span>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Emitir Certificado S.O.S. (.PDF)</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
