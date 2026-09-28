import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Leaf, 
  ShieldCheck, 
  Trees, 
  Flame, 
  TrendingDown, 
  Download, 
  Award, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface CarbonFootprintAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFleetSize?: number;
}

export const CarbonFootprintAuditModal: React.FC<CarbonFootprintAuditModalProps> = ({
  isOpen,
  onClose,
  defaultFleetSize = 4
}) => {
  const [fleetSize, setFleetSize] = useState<number>(defaultFleetSize);
  const [operatingHoursPerYear, setOperatingHoursPerYear] = useState<number>(1800);
  const [companyName, setCompanyName] = useState<string>('Constructora del Caribe S.R.L.');
  const [engineTier, setEngineTier] = useState<'tier3' | 'tier4f'>('tier3');

  if (!isOpen || typeof document === 'undefined') return null;

  // Consumption benchmark in Liters/hour:
  // Legacy Tier 1/2 engine: 22.5 L/hr
  // Modern Tier 3: 15.2 L/hr (savings: 7.3 L/hr)
  // Modern Tier 4F: 13.8 L/hr (savings: 8.7 L/hr)
  const legacyConsumption = 22.5;
  const modernConsumption = engineTier === 'tier4f' ? 13.8 : 15.2;
  const savingsPerHr = legacyConsumption - modernConsumption;

  // Annual Totals
  const totalFleetHours = fleetSize * operatingHoursPerYear;
  const totalLitersSaved = totalFleetHours * savingsPerHr;
  const totalGallonsSaved = totalLitersSaved / 3.78541;

  // CO2 Emissions: 2.68 kg CO2 per liter of diesel (GHG Protocol EPA standard)
  const co2AvoidedKg = totalLitersSaved * 2.68;
  const co2AvoidedTons = co2AvoidedKg / 1000;

  // Equivalencies
  const treesEquivalent = Math.round(co2AvoidedTons * 45); // ~45 trees absorb 1 ton CO2/year
  const vehiclesEquivalent = (co2AvoidedTons / 4.6).toFixed(1); // Avg passenger car emits ~4.6 tons CO2/year

  // Financial Savings
  const dieselPriceDopPerGallon = 242.0; // Precio oficial Diésel Óptimo MICM RD
  const totalSavingsDop = totalGallonsSaved * dieselPriceDopPerGallon;
  const totalSavingsUsd = totalSavingsDop / USD_TO_DOP_RATE;

  const certificateId = `ISO14001-TMD-2026-${Math.round(co2AvoidedTons * 10)}`;

  const handleDownloadCertificate = () => {
    let report = `========================================================================\n`;
    report += `TMD DOMINICANA - AUDITORÍA TÉCNICA DE HUELLA DE CARBONO (ISO 14001:2015)\n`;
    report += `CERTIFICADO OFICIAL DE EFICIENCIA ENERGÉTICA & DESCARBONIZACIÓN\n`;
    report += `Fecha de Emisión: ${new Date().toLocaleString('es-DO')} | Certificado ID: ${certificateId}\n`;
    report += `Conforme al Protocolo de Gases de Efecto Invernadero (GHG Protocol / EPA)\n`;
    report += `========================================================================\n\n`;

    report += `1. DATOS DE LA EMPRESA AUDITADA:\n`;
    report += `• Razón Social: ${companyName}\n`;
    report += `• Flota de Maquinaria Pesada: ${fleetSize} Unidades Activas (LiuGong / JCB)\n`;
    report += `• Régimen Operativo Anual: ${operatingHoursPerYear.toLocaleString()} Horas / Unidad\n`;
    report += `• Total Horas de Operación Flota: ${totalFleetHours.toLocaleString()} Horas / Año\n`;
    report += `• Tecnología Motriz: Motores Electrónicos Common Rail ${engineTier === 'tier4f' ? 'Tier 4 Final / Etapa V' : 'Tier 3 Cummins/Perkins'}\n\n`;

    report += `2. BALANCE DE AHORRO DE COMBUSTIBLE DIÉSEL:\n`;
    report += `• Consumo Flota Tradicional (Línea Base Pre-Tier): ${(legacyConsumption * totalFleetHours).toLocaleString('es-DO', { maximumFractionDigits: 0 })} Litros\n`;
    report += `• Consumo Flota TMD Dominicana Optimizada: ${(modernConsumption * totalFleetHours).toLocaleString('es-DO', { maximumFractionDigits: 0 })} Litros\n`;
    report += `• COMBUSTIBLE AHORRADO ANUALMENTE: ${totalLitersSaved.toLocaleString('es-DO', { maximumFractionDigits: 0 })} Litros (${totalGallonsSaved.toLocaleString('es-DO', { maximumFractionDigits: 0 })} Galones)\n`;
    report += `• Tasa de Reducción de Consumo: ${((savingsPerHr / legacyConsumption) * 100).toFixed(1)}% de Ahorro Directo\n\n`;

    report += `3. IMPACTO DE DESCARBONIZACIÓN & HUELLA DE CARBONO:\n`;
    report += `• Factor de Emisión EPA ULSD: 2.68 kg CO2e por litro de diésel\n`;
    report += `• EMISIONES DE CO2 EVITADAS A LA ATMÓSFERA: ${co2AvoidedTons.toFixed(2)} TONELADAS DE CO2e / AÑO\n`;
    report += `• Equivalencia en Reforestación: ${treesEquivalent.toLocaleString()} Árboles Adultos Creciendo 10 Años\n`;
    report += `• Equivalencia en Tráfico: ${vehiclesEquivalent} Vehículos de Pasajeros Retirados de Circulación\n\n`;

    report += `4. RETORNO FINANCIERO ESTIMADO (ROI VERDE):\n`;
    report += `• Ahorro Financiero Anual en Combustible: RD$ ${totalSavingsDop.toLocaleString('es-DO', { minimumFractionDigits: 2 })} (US$ ${totalSavingsUsd.toLocaleString('es-DO', { minimumFractionDigits: 2 })})\n\n`;

    report += `VÁLIDO PARA REPORTES DE SOSTENIBILIDAD ESG, LICITACIONES DEL ESTADO Y CERTIFICACIÓN ISO 14001.\n`;
    report += `Firma Autorizada: Departamento de Sostenibilidad y Transición Energética - TMD Dominicana S.R.L.\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificado_Huella_Carbono_${certificateId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-950 rounded-[5px] border border-zinc-800 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[94vh] flex flex-col overflow-hidden font-mono text-zinc-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-display">
                  Sostenibilidad & Eficiencia Energética • ESG
                </span>
                <span className="px-1.5 py-0.2 rounded-[2px] bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  NORMA ISO 14001:2015
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display">
                Auditoría de Huella de Carbono y Ahorro CO2
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCertificate}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>CERTIFICADO OFICIAL TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlight Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-[3px] p-4 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Emisiones de CO2 Evitadas
            </span>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {co2AvoidedTons.toFixed(1)} <span className="text-sm font-normal text-emerald-400">Ton CO2e/año</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              - {((savingsPerHr / legacyConsumption) * 100).toFixed(0)}% frente a motores mecánicos antiguos
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Diésel Ahorrado Anual
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1">
              {totalGallonsSaved.toLocaleString('es-DO', { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-zinc-500">Gal</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              {totalLitersSaved.toLocaleString('es-DO', { maximumFractionDigits: 0 })} Litros no consumidos
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-4 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Ahorro Financiero Directo
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
              RD$ {(totalSavingsDop / 1000000).toFixed(2)}M
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              ≈ US$ {totalSavingsUsd.toLocaleString('es-DO', { maximumFractionDigits: 0 })} ahorrados al año
            </p>
          </div>
        </div>

        {/* Configuration Sliders & Form */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block font-display">
              Parámetros Operativos de su Proyecto
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Nombre de la Empresa / Concesión Minera
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Estándar de Emisión del Motor
                </label>
                <select
                  value={engineTier}
                  onChange={(e) => setEngineTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="tier3">Tier 3 / Etapa III (Cummins QSB 6.7 Common Rail)</option>
                  <option value="tier4f">Tier 4 Final / Etapa V (Ultra Eficiente DEF / AdBlue)</option>
                </select>
              </div>
            </div>

            {/* Slider 1: Fleet Size */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-zinc-300 uppercase">Cantidad de Maquinarias en Flota:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{fleetSize} Unidades</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>1 Máquina</span>
                <span>15 Máquinas</span>
                <span>30 Máquinas</span>
                <span>50 Máquinas</span>
              </div>
            </div>

            {/* Slider 2: Operating Hours */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-zinc-300 uppercase">Horas Anuales de Trabajo por Máquina:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{operatingHoursPerYear} Horas/Año</span>
              </div>
              <input
                type="range"
                min="500"
                max="3500"
                step="50"
                value={operatingHoursPerYear}
                onChange={(e) => setOperatingHoursPerYear(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>500h (Uso Ligero)</span>
                <span>1,800h (Cantera Promedio)</span>
                <span>3,500h (2 Turnos Mineros 24/7)</span>
              </div>
            </div>
          </div>

          {/* Environmental Equivalencies Strip */}
          <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-4 space-y-3">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block font-display">
              Equivalencias Ambientales Certificadas (GHG Protocol EPA)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 rounded-[2px] border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[2px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Trees className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">Reforestación Equivalente</span>
                  <span className="text-base font-black text-white font-mono">
                    {treesEquivalent.toLocaleString()} árboles adultos
                  </span>
                  <span className="text-[10px] text-zinc-500 block">absorbiendo CO2 durante 10 años</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-[2px] border border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[2px] bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block">Tráfico Retirado de Vías</span>
                  <span className="text-base font-black text-white font-mono">
                    {vehiclesEquivalent} vehículos ligeros
                  </span>
                  <span className="text-[10px] text-zinc-500 block">fuera de circulación por 1 año</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[10px] font-mono">
            Certificado Oficial: {certificateId}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCertificate}
              className="px-3.5 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Certificado TXT</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] cursor-pointer"
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
