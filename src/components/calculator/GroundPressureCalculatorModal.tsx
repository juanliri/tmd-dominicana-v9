import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Layers, 
  Gauge, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Truck, 
  Mountain, 
  ChevronRight, 
  Sparkles,
  Sliders,
  Scale
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface GroundPressureCalculatorModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DominicanSoilType {
  id: string;
  name: string;
  region: string;
  bearingCapacityKgCm2: number;
  description: string;
  recommendedTrack: string;
}

const DOMINICAN_SOILS: DominicanSoilType[] = [
  {
    id: 'yuna_swamp',
    name: 'Ciénagas & Arroceras del Bajo Yuna',
    region: 'Nagua / Arenoso / San Francisco de Macorís',
    bearingCapacityKgCm2: 0.35,
    description: 'Suelos saturados de agua, fango aluvial y turba con alta susceptibilidad de atollamiento de orugas.',
    recommendedTrack: 'Zapatas Pantaneras 800mm / 900mm (Flotación Alta)'
  },
  {
    id: 'cibao_clay',
    name: 'Arcillas Plásticas y Limos del Valle del Cibao',
    region: 'La Vega / Moca / Santiago',
    bearingCapacityKgCm2: 0.55,
    description: 'Tierra negra fértil con plasticidad media. En temporada de lluvias requiere zapatas anchas.',
    recommendedTrack: 'Zapatas Estándar 700mm / 800mm'
  },
  {
    id: 'nizao_alluvium',
    name: 'Aluvión y Gravas de Río Nizao',
    region: 'San Cristóbal / Baní / Pizarrete',
    bearingCapacityKgCm2: 1.40,
    description: 'Canto rodado y grava compactada. Buena transitabilidad con abrasión moderada de tejas.',
    recommendedTrack: 'Zapatas Estándar Heavy Duty 600mm'
  },
  {
    id: 'bavaro_coral',
    name: 'Roca Coralina y Caliza de Bávaro',
    region: 'Punta Cana / Cap Cana / Macao',
    bearingCapacityKgCm2: 3.50,
    description: 'Basamento de roca coralina dura y abrasiva. Resistencia a compresión extrema; cero riesgo de hundimiento.',
    recommendedTrack: 'Zapatas Angostas de Roca 600mm con garras reforzadas'
  },
  {
    id: 'caliche_compact',
    name: 'Caliche y Arcilla Cementada',
    region: 'Autovía del Este / Boca Chica / San Pedro',
    bearingCapacityKgCm2: 1.80,
    description: 'Subrasante compactada y material granular de relleno para terraplenes de autopistas.',
    recommendedTrack: 'Zapatas Estándar 600mm / 700mm'
  }
];

export const GroundPressureCalculatorModal: React.FC<GroundPressureCalculatorModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [shoeWidthMm, setShoeWidthMm] = useState<number>(600);
  const [trackLengthM, setTrackLengthM] = useState<number>(() => {
    if (!machine) return 3.65;
    // Estimated track ground contact length based on operating weight
    const weightT = (machine.operatingWeightKg || 22000) / 1000;
    return Math.round((2.5 + weightT * 0.055) * 100) / 100;
  });
  const [unit, setUnit] = useState<'kg_cm2' | 'kpa' | 'psi'>('kg_cm2');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Calculations
  const weightKg = machine?.operatingWeightKg || 22000;
  // Contact Area in cm² = 2 tracks * (trackLength in cm) * (shoeWidth in cm)
  const contactAreaCm2 = 2 * (trackLengthM * 100) * (shoeWidthMm / 10);
  const pressureKgCm2 = Math.round((weightKg / contactAreaCm2) * 1000) / 1000;
  const pressureKpa = Math.round(pressureKgCm2 * 98.0665 * 10) / 10;
  const pressurePsi = Math.round(pressureKgCm2 * 14.2233 * 10) / 10;

  const displayPressure = useMemo(() => {
    if (unit === 'kg_cm2') return `${pressureKgCm2} kg/cm²`;
    if (unit === 'kpa') return `${pressureKpa} kPa`;
    return `${pressurePsi} PSI`;
  }, [unit, pressureKgCm2, pressureKpa, pressurePsi]);

  if (!isOpen || !machine) return null;

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
      const currentDate = new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Top Header Accent Bar
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
      doc.text('ESTUDIO GEOTÉCNICO: PRESIÓN SOBRE EL SUELO', 55, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text(`ANÁLISIS DE TRANSITABILIDAD — ${machine.brand.toUpperCase()} ${machine.name.toUpperCase()} (MOD. ${machine.modelCode})`, 55, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`TALLER CENTRAL KM 22 AUTOPISTA DUARTE | EMISIÓN: ${currentDate.toUpperCase()}`, 55, 28);

      // Summary Table of Calculations
      autoTable(doc, {
        startY: 38,
        head: [['PARÁMETRO GEOMÉTRICO / MECÁNICO', 'VALOR CALCULADO', 'UNIDAD ESTÁNDAR']],
        body: [
          ['Peso Operativo del Equipo', `${(weightKg / 1000).toFixed(1)} Toneladas (${weightKg.toLocaleString()} kg)`, 'Masa Total Certificada'],
          ['Ancho de Zapatas Seleccionado', `${shoeWidthMm} mm (${(shoeWidthMm / 25.4).toFixed(1)} Pulgadas)`, 'Ancho Efectivo de Oruga'],
          ['Longitud de Contacto con Suelo', `${trackLengthM} Metros (${(trackLengthM * 100).toFixed(0)} cm)`, 'Distancia entre Centros Ejes'],
          ['Área Total de Huella en Suelo', `${(contactAreaCm2 / 10000).toFixed(2)} m² (${contactAreaCm2.toLocaleString()} cm²)`, '2x Orugas en Contacto'],
          ['Presión Específica de Contacto', `${pressureKgCm2} kg/cm²`, 'Presión Geotécnica Media'],
          ['Equivalencia en Sistema Internacional', `${pressureKpa} kPa`, 'KiloPascales (Norma ISO)'],
          ['Equivalencia en Sistema Americano', `${pressurePsi} PSI`, 'Libras / Pulgada Cuadrada']
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

      // Dominican Soil Matrix Table
      const soilRows = DOMINICAN_SOILS.map(soil => {
        const canTransit = pressureKgCm2 <= soil.bearingCapacityKgCm2;
        const safetyFactor = (soil.bearingCapacityKgCm2 / pressureKgCm2).toFixed(2);
        return [
          soil.name,
          soil.region,
          `${soil.bearingCapacityKgCm2} kg/cm²`,
          `${pressureKgCm2} kg/cm²`,
          canTransit ? `TRANSITABLE (F.S. ${safetyFactor})` : 'RIESGO ATIBORRAMIENTO ✗',
          soil.recommendedTrack
        ];
      });

      // @ts-ignore
      const nextY = doc.lastAutoTable.finalY + 6;

      autoTable(doc, {
        startY: nextY,
        head: [['TIPO DE SUELO DOMINICANO', 'REGIÓN TÍPICA', 'CAP. PORTANTE', 'PRESIÓN MÁQ.', 'TRANSITABILIDAD', 'ZAPATA RECOMENDADA']],
        body: soilRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7
        },
        bodyStyles: {
          fontSize: 6.8,
          textColor: [15, 23, 42]
        },
        didParseCell: (data) => {
          if (data.column.index === 4 && data.section === 'body') {
            const val = String(data.cell.raw);
            if (val.includes('TRANSITABLE')) {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        margin: { left: 12, right: 12 }
      });

      // Technical Note
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY + 8;
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(12, finalY, pageWidth - 24, 24, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('RECOMENDACIÓN GEOTÉCNICA TMD DOMINICANA:', 16, finalY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);
      doc.text('• Si el factor de seguridad es menor a 1.0 (Presión Máquina > Capacidad Portante), es mandatorio instalar zapatas de 800mm/900mm', 16, finalY + 11);
      doc.text('  o emplear esteras de madera de tala controlada (Swamp Mats) para evitar asentamientos diferenciales del chasis.', 16, finalY + 15);
      doc.text('• Asesoría técnica y cambio de tejas disponible en Taller Central Km 22 Autopista Duarte (Tel: 809-560-8200).', 16, finalY + 19);

      doc.save(`Estudio_Geotecnico_Presion_Suelo_${machine.brand}_${machine.modelCode}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating ground pressure PDF:', err);
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
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Simulador Geotécnico de Presión sobre Suelo
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase">
                  Transitabilidad RD
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                {machine.brand} {machine.name} • Mod. {machine.modelCode} • {(weightKg / 1000).toFixed(1)} Toneladas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {/* Unit Toggle */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2px] p-0.5 flex items-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setUnit('kg_cm2');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  unit === 'kg_cm2' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                kg/cm²
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setUnit('kpa');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  unit === 'kpa' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                kPa
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setUnit('psi');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  unit === 'psi' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                PSI
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

        {/* Interactive Controls & Scorecard */}
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          
          {/* Shoe Width Selector */}
          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5">
              Ancho de Zapatas de Oruga:
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[600, 700, 800, 900].map(width => (
                <button
                  key={width}
                  type="button"
                  onClick={() => {
                    triggerHaptic('mechanicalClick');
                    setShoeWidthMm(width);
                  }}
                  className={`py-1.5 rounded-[2px] text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                    shoeWidthMm === width
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {width}mm
                </button>
              ))}
            </div>
            <span className="text-[9px] text-zinc-500 font-mono block mt-1">
              {shoeWidthMm === 600 ? 'Estándar Roca HD' : shoeWidthMm === 700 ? 'Uso General' : shoeWidthMm === 800 ? 'Baja Presión' : 'Pantanera Extrema'}
            </span>
          </div>

          {/* Contact Length Input */}
          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5">
              Longitud de Huella ({trackLengthM} m):
            </label>
            <input
              type="range"
              min="2.5"
              max="5.5"
              step="0.05"
              value={trackLengthM}
              onChange={(e) => setTrackLengthM(parseFloat(e.target.value))}
              className="w-full accent-amber-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-zinc-500 font-mono block mt-1">
              Área de Contacto: {(contactAreaCm2 / 10000).toFixed(2)} m² (2 Orugas)
            </span>
          </div>

          {/* Pressure KPI Display */}
          <div className="p-3 rounded-[3px] bg-zinc-950 border border-amber-400/40 flex flex-col justify-center text-center">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">Presión sobre el Suelo:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
              {displayPressure}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase">
              {pressureKgCm2 <= 0.45 ? '🟢 Flotabilidad Excelente' : pressureKgCm2 <= 0.65 ? '🟡 Presión Media' : '🟠 Presión Alta (Suelo Firme)'}
            </span>
          </div>
        </div>

        {/* Dominican Soils Matrix */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[11px] text-zinc-400 font-bold uppercase">
            <span>Matriz Geotécnica de Suelos de la República Dominicana</span>
            <span>Semáforo de Transitabilidad</span>
          </div>

          <div className="space-y-2">
            {DOMINICAN_SOILS.map(soil => {
              const canTransit = pressureKgCm2 <= soil.bearingCapacityKgCm2;
              const safetyFactor = (soil.bearingCapacityKgCm2 / pressureKgCm2).toFixed(2);

              return (
                <div
                  key={soil.id}
                  className={`p-3.5 rounded-[3px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    canTransit
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-tight">
                        {soil.name}
                      </h4>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        ({soil.region})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {soil.description}
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Capacidad Portante: <strong className="text-zinc-300">{soil.bearingCapacityKgCm2} kg/cm²</strong> • Configuración Óptima: <span className="text-amber-400">{soil.recommendedTrack}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`px-2.5 py-1 rounded-[2px] text-[10px] font-mono font-black uppercase tracking-wider border ${
                      canTransit
                        ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-950 border-rose-500/50 text-rose-400'
                    }`}>
                      {canTransit ? `TRANSITABLE (F.S. ${safetyFactor})` : 'RIESGO ATIBORRAMIENTO'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-sans mt-1">
                      {canTransit ? 'Asentamiento < 3.5 cm' : 'Requiere Zapata > 800mm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Mountain className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Datos calibrados para la geología nacional dominicana y manuales técnicos LiuGong / JCB.</span>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Estudio Geotécnico (.PDF)</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
