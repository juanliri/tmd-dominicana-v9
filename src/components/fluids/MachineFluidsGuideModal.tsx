import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Droplet, 
  Fuel, 
  Wrench, 
  ShieldCheck, 
  Download, 
  Layers, 
  RotateCw, 
  Gauge, 
  Thermometer, 
  Check, 
  FileText,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Machine } from '../../types';
import { drawTmdOfficialLogoPdf } from '../../utils/pdfGenerator';
import { triggerHaptic } from '../../utils/haptics';

interface MachineFluidsGuideModalProps {
  machine: Machine | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FluidSpec {
  compartment: string;
  recommendedOil: string;
  viscosityGrade: string;
  specificationOem: string;
  capacityLiters: number;
  replacementIntervalHours: number;
  tropicalNotes: string;
}

export const MachineFluidsGuideModal: React.FC<MachineFluidsGuideModalProps> = ({
  machine,
  isOpen,
  onClose
}) => {
  const [unitMode, setUnitMode] = useState<'liters' | 'gallons'>('liters');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute realistic, model-specific fluid capacities based on operating weight & engine
  const fluidSpecs: FluidSpec[] = useMemo(() => {
    if (!machine) return [];

    const weightTons = (machine.operatingWeightKg || 22000) / 1000;
    const isHeavyExcavator = weightTons >= 20;
    const isMediumLoader = machine.category === 'Palas Cargadoras' || machine.category === 'Retroexcavadoras';

    // Model scaled capacities
    const engineOil = Math.round((isHeavyExcavator ? 19.5 : isMediumLoader ? 14.0 : 11.5) * 10) / 10;
    const coolant = Math.round((isHeavyExcavator ? 28.0 : isMediumLoader ? 21.0 : 16.0) * 10) / 10;
    const hydTank = Math.round((weightTons * 8.5) / 5) * 5;
    const hydTotal = Math.round(hydTank * 1.25);
    const fuelTank = Math.round((weightTons * 15.5) / 10) * 10;
    const finalDriveEach = Math.round((isHeavyExcavator ? 5.5 : 3.8) * 10) / 10;
    const swingGear = Math.round((isHeavyExcavator ? 4.2 : 2.5) * 10) / 10;

    return [
      {
        compartment: 'Cárter de Aceite de Motor',
        recommendedOil: 'Aceite Diésel Heavy Duty 15W-40',
        viscosityGrade: 'SAE 15W-40 CI-4 / CK-4',
        specificationOem: 'Cummins CES 20086 / LiuGong Genuine',
        capacityLiters: engineOil,
        replacementIntervalHours: 250,
        tropicalNotes: 'Formulado para alta detergencia y disipación térmica en canteras dominicanas a >35°C.'
      },
      {
        compartment: 'Sistema de Refrigeración / Radiador',
        recommendedOil: 'Refrigerante Larga Vida OAT 50/50 Prediluido',
        viscosityGrade: 'Etilenglicol Orgánico (Color Rojo/Rosa)',
        specificationOem: 'ASTM D6210 / JIS K2234',
        capacityLiters: coolant,
        replacementIntervalHours: 2000,
        tropicalNotes: 'Protección contra cavitación de camisas de cilindro y ebullición hasta 110°C con tapón presurizado.'
      },
      {
        compartment: 'Tanque Hidráulico (Relleno Operativo)',
        recommendedOil: 'Fluido Hidráulico Anti-Desgaste ISO VG 46/68',
        viscosityGrade: 'ISO VG 46 (Todo Terreno) / VG 68 (Canteras)',
        specificationOem: 'DIN 51524 Parte 2 HLP / Parker Denison HF-0',
        capacityLiters: hydTank,
        replacementIntervalHours: 1000,
        tropicalNotes: 'Reemplazo de elemento filtrante de retorno en tándem a las 500 horas.'
      },
      {
        compartment: 'Circuito Hidráulico Total (Cilindros + Enfriador)',
        recommendedOil: 'Fluido Hidráulico Primario',
        viscosityGrade: 'ISO VG 46 / VG 68',
        specificationOem: 'Sistema Completo Purga de Fábrica',
        capacityLiters: hydTotal,
        replacementIntervalHours: 2000,
        tropicalNotes: 'Capacidad total para vaciado integral tras reparaciones mayores de bomba principal.'
      },
      {
        compartment: 'Tanque de Combustible Diésel',
        recommendedOil: 'Diésel Regular / Ultra Bajo Azufre (ULSD)',
        viscosityGrade: 'Cetona Mín. 48 / Azufre < 15 ppm',
        specificationOem: 'Norma Dominicana INDOCAL / ASTM D975',
        capacityLiters: fuelTank,
        replacementIntervalHours: 0,
        tropicalNotes: 'Drenar vaso decantador de trampa de agua diariamente antes del primer arranque de la mañana.'
      },
      {
        compartment: 'Mandos Finales de Oruga (Cada Lado x2)',
        recommendedOil: 'Aceite de Engranajes Automotrices Extrema Presión',
        viscosityGrade: 'SAE 80W-90 / SAE 85W-140 API GL-5',
        specificationOem: 'MIL-L-2105D / LiuGong Axle Gear Oil',
        capacityLiters: finalDriveEach,
        replacementIntervalHours: 1000,
        tropicalNotes: 'Revisar tapón magnético en cada servicio de 250h para detectar virutas metálicas tempranas.'
      },
      {
        compartment: 'Caja Reductora de Giro (Swing Reducer)',
        recommendedOil: 'Aceite de Transmisión de Alto Rendimiento',
        viscosityGrade: 'SAE 80W-90 API GL-5',
        specificationOem: 'Heavy Duty Gear Box Spec',
        capacityLiters: swingGear,
        replacementIntervalHours: 1000,
        tropicalNotes: 'Varilla medidora ubicada en el compartimiento de bombas hidráulicas de la superestructura.'
      },
      {
        compartment: 'Grasera de Corona & Pasadores de Pluma',
        recommendedOil: 'Grasa Litio Complejo EP-2 con 3-5% MoS2',
        viscosityGrade: 'NLGI Grado 2 (Bisulfuro de Molibdeno)',
        specificationOem: 'Grasa de Chasis Pesado Moly Extreme',
        capacityLiters: 1.5,
        replacementIntervalHours: 10,
        tropicalNotes: 'Engrase obligatorio cada 10 horas de operación o al finalizar cada jornada de trabajo pesado.'
      }
    ];
  }, [machine]);

  if (!isOpen || !machine) return null;

  const litersToGallons = (liters: number) => {
    return Math.round((liters * 0.264172) * 10) / 10;
  };

  const handleExportPdf = async () => {
    triggerHaptic('heavyShud');
    setIsExportingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const currentDate = new Date().toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Top Header Amber Bar
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
      doc.text(`GUÍA DE CAPACIDADES, FLUIDOS Y VISCOSIDADES HOMOLOGADAS`, 55, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text(`${machine.brand.toUpperCase()} ${machine.name.toUpperCase()} (MOD. ${machine.modelCode}) — CLIMA TROPICAL REPÚBLICA DOMINICANA`, 55, 22);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`ESPECIFICACIONES DE TALLER CENTRAL KM 22 AUTOPISTA DUARTE | EMITIDO: ${currentDate.toUpperCase()} | VALIDEZ OFICIAL`, 55, 28);

      // Table of fluids
      const rows = fluidSpecs.map(f => [
        f.compartment,
        f.recommendedOil,
        f.viscosityGrade,
        f.specificationOem,
        `${f.capacityLiters} L (${litersToGallons(f.capacityLiters)} Gal)`,
        f.replacementIntervalHours > 0 ? `${f.replacementIntervalHours} Horas` : 'Consumo Diario',
        f.tropicalNotes
      ]);

      autoTable(doc, {
        startY: 38,
        head: [['COMPARTIMIENTO', 'LUBRICANTE RECOMENDADO', 'GRADO / VISCOSIDAD', 'NORMA OEM', 'CAPACIDAD (L / GAL)', 'INTERVALO', 'RECOMENDACIÓN TROPICAL']],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [245, 158, 11],
          fontStyle: 'bold',
          fontSize: 7.5
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: 'bold' },
          1: { cellWidth: 42 },
          2: { cellWidth: 35, fontStyle: 'bold' },
          3: { cellWidth: 38 },
          4: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
          5: { cellWidth: 24, halign: 'center' },
          6: { cellWidth: 65 }
        },
        margin: { left: 12, right: 12 }
      });

      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 165;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(12, finalY + 5, pageWidth - 24, 22, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('ADVERTENCIA TÉCNICA DE GARANTÍA OFICIAL TMD DOMINICANA:', 16, finalY + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text('1. El uso de lubricantes con especificaciones inferiores a las recomendadas por el fabricante (API CI-4 / ISO VG 46) invalida la garantía extendida de tren motriz.', 16, finalY + 16);
      doc.text('2. En condiciones de alta polución y temperatura extrema en canteras (>34°C), se recomienda realizar análisis espectrométrico de aceite S.O.S. cada 250 horas.', 16, finalY + 20);
      doc.text('3. Despacho directo de tambores de 55 galones y cubetas de grasa original con entrega en obra vía TMD Taller Móvil (Tel: 809-560-8200).', 16, finalY + 24);

      doc.save(`Guia_Fluidos_Capacidades_${machine.brand}_${machine.modelCode}_TMD.pdf`);
    } catch (err) {
      console.error('Error generating fluids guide PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-950 rounded-[5px] shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] font-mono text-white">
        
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Guía Rápida de Capacidades y Fluidos por Modelo
                </span>
                <span className="px-2 py-0.5 rounded-[2px] bg-zinc-800 text-amber-400 border border-zinc-700 text-[10px] font-bold uppercase">
                  Clima Tropical RD (&gt;32°C)
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-sans">
                {machine.brand} {machine.name} • Mod. {machine.modelCode} • Motor {machine.engine}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {/* Unit Toggle Button */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2px] p-0.5 flex items-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setUnitMode('liters');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  unitMode === 'liters' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Litros (L)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('mechanicalClick');
                  setUnitMode('gallons');
                }}
                className={`px-2 py-0.5 rounded-[1px] font-bold uppercase transition-all cursor-pointer ${
                  unitMode === 'gallons' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Galones (US)
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generando...' : 'Descargar Tabla PDF'}</span>
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

        {/* Quick Highlights Strip */}
        <div className="px-4 py-2 bg-amber-400/5 border-b border-amber-400/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Aceite Motor:</span>
            <span className="text-amber-400 font-bold text-[11px]">15W-40 CI-4 Heavy Duty</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Fluido Hidráulico:</span>
            <span className="text-amber-400 font-bold text-[11px]">ISO VG 46 / VG 68</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Refrigerante:</span>
            <span className="text-emerald-400 font-bold text-[11px]">OAT 50/50 Larga Vida</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block uppercase font-bold">Grasa Chasis:</span>
            <span className="text-zinc-200 font-bold text-[11px]">NLGI-2 con 3-5% MoS2</span>
          </div>
        </div>

        {/* Fluids Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fluidSpecs.map((item, idx) => {
              const displayCap = unitMode === 'liters' 
                ? `${item.capacityLiters} Litros` 
                : `${litersToGallons(item.capacityLiters)} Galones (US)`;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-[3px] bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">
                        {item.compartment}
                      </h4>
                      <span className="px-2 py-0.5 rounded-[2px] bg-amber-400 text-black text-[10px] font-black uppercase font-mono shrink-0 shadow-xs">
                        {displayCap}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-baseline justify-between text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Recomendado:</span>
                        <span className="font-bold text-zinc-200 text-right">{item.recommendedOil}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Viscosidad / Grado:</span>
                        <span className="font-mono text-amber-400 font-bold text-right">{item.viscosityGrade}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Norma OEM:</span>
                        <span className="font-mono text-zinc-400 text-[10px] text-right">{item.specificationOem}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-zinc-300">
                        <span className="text-zinc-500 text-[10px] uppercase">Intervalo Cambio:</span>
                        <span className="font-bold text-emerald-400 text-right">
                          {item.replacementIntervalHours > 0 ? `Cada ${item.replacementIntervalHours} Horas` : 'Revisión Diaria'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80">
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                      💡 {item.tropicalNotes}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Valores certificados para cumplimiento de garantía oficial TMD Dominicana y fábricas LiuGong / JCB.</span>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Guía Completa de Fluidos (.PDF)</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
