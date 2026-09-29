import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Droplet, 
  Wrench, 
  Activity, 
  Download, 
  PlusCircle, 
  HelpCircle,
  FileCheck,
  Zap,
  X
} from 'lucide-react';
import { DEMO_OIL_REPORTS, WEAR_THRESHOLDS } from '../../data/oilLabData';
import { OilSampleReport, OilSeverity } from '../../types';
import { useCart } from '../../context/CartContext';

interface OilLabDiagnosticsViewProps {
  onNavigate?: (route: string) => void;
}

export const OilLabDiagnosticsView: React.FC<OilLabDiagnosticsViewProps> = ({ onNavigate }) => {
  const { showToast } = useCart();
  const [reports, setReports] = useState<OilSampleReport[]>(DEMO_OIL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<OilSampleReport>(DEMO_OIL_REPORTS[1]); // Default to Caution report for rich demonstration
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [newSampleModalOpen, setNewSampleModalOpen] = useState<boolean>(false);

  // Form for requesting / submitting new sample
  const [newUnitVin, setNewUnitVin] = useState<string>('');
  const [newCompartment, setNewCompartment] = useState<any>('Motor Diésel');
  const [newHorometer, setNewHorometer] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const filteredReports = reports.filter(rep => {
    const matchesSearch = 
      rep.sampleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.unitVin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.unitFicha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.customerCompany.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' || rep.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (sev: OilSeverity) => {
    switch (sev) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>NORMAL</span>
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold uppercase">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>PRECAUCIÓN</span>
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold uppercase">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>CRÍTICO</span>
          </span>
        );
    }
  };

  const handleRegisterSample = (e: React.FormEvent) => {
    e.preventDefault();
    const createdReport: OilSampleReport = {
      id: `rep-sos-${Date.now()}`,
      sampleNumber: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      unitFicha: 'FL-NUEVA',
      unitVin: newUnitVin || 'VIN-PENDIENTE-LAB',
      unitModel: 'Equipo en Registro',
      unitBrand: 'JCB / LiuGong',
      customerName: 'Cliente TMD Registrado',
      customerCompany: 'Flota Dominicana S.R.L.',
      compartment: newCompartment,
      oilBrandGrade: '15W-40 CK-4 Heavy Duty',
      fluidHours: 250,
      machineHorometer: parseInt(newHorometer) || 1200,
      samplingDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      severity: 'normal',
      wearMetals: {
        ironPpm: 12,
        copperPpm: 3,
        leadPpm: 1,
        chromiumPpm: 0,
        aluminumPpm: 2,
        tinPpm: 0
      },
      contaminants: {
        siliconPpm: 6,
        sootPercent: 0.3,
        waterPercent: 0.0,
        fuelDilutionPercent: 0.5
      },
      physicalProps: {
        viscosity100c: 14.5,
        tbn: 9.0
      },
      diagnosisSummary: 'Muestra ingresada a espectrometría ICP. Análisis preliminar libre de abrasión o dilución.',
      technicalRecommendation: 'Mantener protocolo de servicio estándar de 500 horas.',
      analystName: 'Ing. Carlos Medina - Director Laboratorio SOS TMD'
    };

    setReports([createdReport, ...reports]);
    setSelectedReport(createdReport);
    setSubmitSuccess(true);
    setTimeout(() => {
      setNewSampleModalOpen(false);
      setSubmitSuccess(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 transition-colors pb-24">
      {/* Header Banner - Compact Commercial Standard */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span>LABORATORIO DE FLUIDOS & TRIBOLOGÍA SOS TMD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-display text-white">
                DIAGNÓSTICO PREDICTIVO DE <span className="text-amber-400">ACEITES & DESGASTE</span>
              </h1>
              <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed mt-1">
                Espectrometría óptica (ICP-OES) para detectar micropartículas de desgaste antes de una falla catastrófica de motor, transmisión o sistema hidráulico.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 flex-wrap font-mono">
              <button
                type="button"
                onClick={() => setNewSampleModalOpen(true)}
                className="px-3.5 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 fill-black text-amber-500" />
                <span>INGRESAR MUESTRA</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('#/service')}
                  className="px-3.5 py-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-800"
                >
                  SERVICIO TALLER
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 mt-4 sm:mt-6">
        {/* Search & Filter Bar */}
        <div className="bg-zinc-950 rounded-[5px] p-3.5 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 font-mono">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="BUSCAR POR MUESTRA SOS, VIN O FICHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-[3px] bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['all', 'normal', 'caution', 'critical'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-[3px] text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  filterSeverity === sev
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
                }`}
              >
                {sev === 'all' ? 'TODOS LOS INFORMES' : sev === 'normal' ? 'NORMAL' : sev === 'caution' ? 'PRECAUCIÓN' : 'CRÍTICOS'}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Dashboard: Report List & In-Depth Diagnostic Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Sample Reports Index (4 cols) */}
          <div className="lg:col-span-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase px-1">
              <span>BITÁCORA DE MUESTRAS</span>
              <span>{filteredReports.length} REGISTROS</span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredReports.map(rep => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3.5 rounded-[5px] border transition-all cursor-pointer bg-zinc-950 ${
                      isSelected
                        ? 'border-amber-500 ring-1 ring-amber-500/30 bg-zinc-900/80'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase">
                          {rep.sampleNumber}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase font-display">
                          FICHA: {rep.unitFicha} • {rep.unitModel}
                        </h4>
                      </div>
                      {getSeverityBadge(rep.severity)}
                    </div>

                    <div className="text-[10px] text-zinc-400 uppercase space-y-0.5">
                      <div>COMPARTIMENTO: <strong className="text-zinc-200">{rep.compartment}</strong></div>
                      <div>HORAS FLUIDO: <strong className="text-zinc-200">{rep.fluidHours} HRS</strong> (HORÓMETRO: {rep.machineHorometer.toLocaleString()} H)</div>
                      <div>FECHA: {rep.reportDate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Diagnostic Lab Sheet (8 cols) */}
          <div className="lg:col-span-8">
            {selectedReport ? (
              <div className="bg-zinc-950 rounded-[5px] p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-5 font-mono text-white">
                
                {/* Header Sheet Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-amber-400">
                        {selectedReport.sampleNumber}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-bold text-zinc-400 uppercase">
                        LABORATORIO CENTRAL KM 22 DUARTE
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase font-display">
                      CERTIFICADO DE ESPECTROMETRÍA DE DESGASTE
                    </h2>
                    <p className="text-xs text-zinc-400 uppercase mt-0.5">
                      CLIENTE: <strong className="text-white">{selectedReport.customerCompany}</strong> • FICHA: <strong className="text-white">{selectedReport.unitFicha}</strong> • VIN: <strong className="text-white">{selectedReport.unitVin}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {getSeverityBadge(selectedReport.severity)}
                    <button
                      type="button"
                      onClick={() => showToast(`Certificado Oficial PDF para ${selectedReport.sampleNumber} listo para descarga.`)}
                      className="p-2 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer border border-zinc-800"
                      title="Descargar PDF de Laboratorio"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Machine and Fluid Meta Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs uppercase">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">COMPARTIMENTO</span>
                    <span className="font-bold text-white">{selectedReport.compartment}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">ACEITE / GRADO</span>
                    <span className="font-bold text-white">{selectedReport.oilBrandGrade}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">HORAS DE ACEITE</span>
                    <span className="font-bold text-amber-400">{selectedReport.fluidHours} HRS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">HORÓMETRO MÁQUINA</span>
                    <span className="font-bold text-white">{selectedReport.machineHorometer.toLocaleString()} H</span>
                  </div>
                </div>

                {/* Wear Metals Spectrometry (ICP-OES) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2 font-display">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span>METALES DE DESGASTE (PARTÍCULAS POR MILLÓN - PPM)</span>
                    </h3>
                    <span className="text-[10px] text-zinc-500 uppercase">NORMA ASTM D5185</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Iron (Fe) */}
                    <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                      <div className="flex justify-between font-bold mb-1 uppercase text-[11px]">
                        <span className="text-zinc-400">HIERRO (Fe)</span>
                        <span className={selectedReport.wearMetals.ironPpm > WEAR_THRESHOLDS.iron.caution ? 'text-rose-400 font-black' : 'text-white'}>
                          {selectedReport.wearMetals.ironPpm} PPM
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm ${selectedReport.wearMetals.ironPpm > WEAR_THRESHOLDS.iron.caution ? 'bg-rose-500' : selectedReport.wearMetals.ironPpm > WEAR_THRESHOLDS.iron.normal ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (selectedReport.wearMetals.ironPpm / 80) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block uppercase">LÍMITE: &gt;30 PPM</span>
                    </div>

                    {/* Copper (Cu) */}
                    <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                      <div className="flex justify-between font-bold mb-1 uppercase text-[11px]">
                        <span className="text-zinc-400">COBRE (Cu)</span>
                        <span className={selectedReport.wearMetals.copperPpm > WEAR_THRESHOLDS.copper.caution ? 'text-rose-400 font-black' : 'text-white'}>
                          {selectedReport.wearMetals.copperPpm} PPM
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm ${selectedReport.wearMetals.copperPpm > WEAR_THRESHOLDS.copper.caution ? 'bg-rose-500' : selectedReport.wearMetals.copperPpm > WEAR_THRESHOLDS.copper.normal ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (selectedReport.wearMetals.copperPpm / 50) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block uppercase">LÍMITE: &gt;15 PPM</span>
                    </div>

                    {/* Lead (Pb) */}
                    <div className="p-3 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                      <div className="flex justify-between font-bold mb-1 uppercase text-[11px]">
                        <span className="text-zinc-400">PLOMO (Pb)</span>
                        <span className={selectedReport.wearMetals.leadPpm > WEAR_THRESHOLDS.lead.caution ? 'text-rose-400 font-black' : 'text-white'}>
                          {selectedReport.wearMetals.leadPpm} PPM
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm ${selectedReport.wearMetals.leadPpm > WEAR_THRESHOLDS.lead.caution ? 'bg-rose-500' : selectedReport.wearMetals.leadPpm > WEAR_THRESHOLDS.lead.normal ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (selectedReport.wearMetals.leadPpm / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 mt-1 block uppercase">LÍMITE: &gt;10 PPM</span>
                    </div>
                  </div>
                </div>

                {/* Contamination & Physical Properties */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 uppercase">
                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">SILICIO (Si / POLVO)</span>
                    <span className={`text-sm font-black ${selectedReport.contaminants.siliconPpm > 30 ? 'text-amber-400' : 'text-white'}`}>
                      {selectedReport.contaminants.siliconPpm} PPM
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">INGRESO ABRASIVO</span>
                  </div>

                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">DILUCIÓN DIÉSEL</span>
                    <span className={`text-sm font-black ${selectedReport.contaminants.fuelDilutionPercent > 2.0 ? 'text-rose-400' : 'text-white'}`}>
                      {selectedReport.contaminants.fuelDilutionPercent}%
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">MÁX. ADM: 2.0%</span>
                  </div>

                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">VISCOSIDAD 100°C</span>
                    <span className="text-sm font-black text-white">
                      {selectedReport.physicalProps.viscosity100c} CST
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">CINEMÁTICO</span>
                  </div>

                  <div className="p-2.5 rounded-[4px] bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">RESERVA (TBN)</span>
                    <span className="text-sm font-black text-white">
                      {selectedReport.physicalProps.tbn} MG KOH/G
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">ANTIÁCIDA</span>
                  </div>
                </div>

                {/* Tribologist Diagnosis & Recommendations */}
                <div className={`p-4 rounded-[4px] border ${
                  selectedReport.severity === 'critical'
                    ? 'bg-zinc-900 border-rose-500/30'
                    : selectedReport.severity === 'caution'
                    ? 'bg-zinc-900 border-amber-500/30'
                    : 'bg-zinc-900 border-emerald-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedReport.severity === 'critical' ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : selectedReport.severity === 'caution' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-white mb-1 uppercase font-display">
                        DICTAMEN TÉCNICO DEL ANALISTA:
                      </h4>
                      <p className="text-zinc-300 leading-relaxed mb-3 uppercase text-[11px]">
                        {selectedReport.diagnosisSummary}
                      </p>

                      <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-zinc-800">
                        <span className="font-black text-amber-400 uppercase text-[9px] tracking-wider block mb-0.5 font-display">
                          ACCIÓN DE TALLER RECOMENDADA
                        </span>
                        <p className="font-bold text-white uppercase text-[11px]">
                          {selectedReport.technicalRecommendation}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-zinc-400 uppercase">
                        <span>ANALISTA: <strong className="text-white">{selectedReport.analystName}</strong></span>
                        {onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate('#/fullbay')}
                            className="text-amber-400 font-bold hover:underline flex items-center gap-1 mt-2 sm:mt-0 cursor-pointer"
                          >
                            <span>ORDEN FULLBAY</span>
                            <Zap className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-zinc-950 rounded-[5px] p-10 text-center text-zinc-500 border border-zinc-800 font-mono text-xs uppercase">
                SELECCIONE UN INFORME DE LA LISTA PARA INSPECCIONAR LOS DATOS ESPECTROMÉTRICOS.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Sample Submission Modal */}
      {newSampleModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 rounded-[5px] p-6 max-w-md w-full border border-zinc-800 shadow-2xl relative font-mono text-white">
            {submitSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-black uppercase text-white font-display">
                  ¡MUESTRA INGRESADA AL LABORATORIO!
                </h3>
                <p className="text-xs text-zinc-400 uppercase">
                  LA MUESTRA HA SIDO ASIGNADA A LA FILA DE ESPECTROMETRÍA ICP.
                </p>
                <button
                  type="button"
                  onClick={() => setNewSampleModalOpen(false)}
                  className="px-5 py-2 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer"
                >
                  CERRAR Y VER REPORTES
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3.5">
                  <h3 className="text-sm font-black uppercase text-white font-display">
                    INGRESAR MUESTRA DE FLUIDO SOS
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setNewSampleModalOpen(false)} 
                    aria-label="Cerrar modal"
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleRegisterSample} className="space-y-3 text-xs uppercase">
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      VIN O NÚMERO DE SERIE DEL EQUIPO
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="JCB-3CX-2024-8891"
                      value={newUnitVin}
                      onChange={(e) => setNewUnitVin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      COMPARTIMENTO MUESTREADO
                    </label>
                    <select
                      value={newCompartment}
                      onChange={(e) => setNewCompartment(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                    >
                      <option value="Motor Diésel">MOTOR DIÉSEL</option>
                      <option value="Sistema Hidráulico">SISTEMA HIDRÁULICO</option>
                      <option value="Transmisión PowerShift">TRANSMISIÓN POWERSHIFT</option>
                      <option value="Mandos Finales / Diferencial">MANDOS FINALES / DIFERENCIAL</option>
                      <option value="Refrigerante ELC">REFRIGERANTE ELC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">
                      HORÓMETRO ACTUAL DE LA UNIDAD
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="2450"
                      value={newHorometer}
                      onChange={(e) => setNewHorometer(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setNewSampleModalOpen(false)}
                      className="px-4 py-1.5 rounded-[3px] text-zinc-400 font-bold hover:bg-zinc-900 border border-zinc-800 cursor-pointer"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-[3px] bg-amber-500 hover:bg-amber-400 text-black font-black uppercase shadow-md cursor-pointer"
                    >
                      REGISTRAR EN ESPECTRÓMETRO
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
