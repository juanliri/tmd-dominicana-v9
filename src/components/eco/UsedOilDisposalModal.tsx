import React, { useState } from 'react';
import {
  Droplets,
  ShieldCheck,
  FileText,
  Download,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Building2,
  Truck,
  Plus,
  X,
  Scale,
  Leaf,
  Layers
} from 'lucide-react';

interface OilStorageTank {
  id: string;
  name: string;
  type: 'engine_oil' | 'hydraulic_oil' | 'gear_oil' | 'oil_filters';
  currentGallons: number;
  capacityGallons: number;
  lastEmptiedDate: string;
  containmentArea: string;
}

interface EcologicalManifestRecord {
  id: string;
  manifestNumber: string;
  date: string;
  gallonsDispatched: number;
  oilType: string;
  certifiedRecycler: string;
  mambientePermit: string;
  truckPlate: string;
  driverName: string;
  status: 'CERTIFIED_COLLECTED' | 'IN_TREATMENT' | 'CERTIFICATE_ISSUED';
}

const INITIAL_TANKS: OilStorageTank[] = [
  {
    id: 'TNK-01',
    name: 'Tanque 01: Aceite de Motor Residual 15W-40',
    type: 'engine_oil',
    currentGallons: 1180,
    capacityGallons: 1500,
    lastEmptiedDate: '2026-08-14',
    containmentArea: 'Dique Secundario Hormigón Patio Km 22 (Área Norte)'
  },
  {
    id: 'TNK-02',
    name: 'Tanque 02: Aceite Hidráulico Residual ISO 46/68',
    type: 'hydraulic_oil',
    currentGallons: 740,
    capacityGallons: 1200,
    lastEmptiedDate: '2026-08-28',
    containmentArea: 'Dique Secundario Hormigón Patio Km 22 (Área Norte)'
  },
  {
    id: 'TNK-03',
    name: 'Tanque 03: Valvulina & Transmisión 80W-90 / TO-4',
    type: 'gear_oil',
    currentGallons: 390,
    capacityGallons: 800,
    lastEmptiedDate: '2026-07-20',
    containmentArea: 'Dique Secundario Hormigón Patio Km 22 (Área Central)'
  },
  {
    id: 'TNK-04',
    name: 'Área 04: Tambores de Filtros de Aceite Drenados & Compactados',
    type: 'oil_filters',
    currentGallons: 440,
    capacityGallons: 660,
    lastEmptiedDate: '2026-09-02',
    containmentArea: 'Depósito Cerrado de Desechos Sólidos Peligrosos Km 22'
  }
];

const INITIAL_MANIFESTS: EcologicalManifestRecord[] = [
  {
    id: 'MAN-2026-0901',
    manifestNumber: 'MIMARENA-DISP-2026-8812',
    date: '2026-09-02',
    gallonsDispatched: 1450,
    oilType: 'Aceite de Motor 15W-40 & Hidráulico',
    certifiedRecycler: 'L&R Commercial S.R.L. (Planta Haina)',
    mambientePermit: 'RES-PEL-2024-00492',
    truckPlate: 'L-399401',
    driverName: 'Eusebio Rosario',
    status: 'CERTIFICATE_ISSUED'
  },
  {
    id: 'MAN-2026-0814',
    manifestNumber: 'MIMARENA-DISP-2026-8140',
    date: '2026-08-14',
    gallonsDispatched: 1200,
    oilType: 'Aceite de Motor 15W-40',
    certifiedRecycler: 'L&R Commercial S.R.L. (Planta Haina)',
    mambientePermit: 'RES-PEL-2024-00492',
    truckPlate: 'L-399401',
    driverName: 'Eusebio Rosario',
    status: 'CERTIFICATE_ISSUED'
  },
  {
    id: 'MAN-2026-0720',
    manifestNumber: 'MIMARENA-DISP-2026-7220',
    date: '2026-07-20',
    gallonsDispatched: 1350,
    oilType: 'Aceite Hidráulico & Valvulina TO-4',
    certifiedRecycler: 'Rensa Dominicana Soluciones Verdes',
    mambientePermit: 'RES-PEL-2023-00891',
    truckPlate: 'L-210492',
    driverName: 'Juan Carlos Morales',
    status: 'CERTIFICATE_ISSUED'
  }
];

interface UsedOilDisposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsedOilDisposalModal: React.FC<UsedOilDisposalModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tanks, setTanks] = useState<OilStorageTank[]>(INITIAL_TANKS);
  const [manifests, setManifests] = useState<EcologicalManifestRecord[]>(INITIAL_MANIFESTS);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New Dispatch Form State
  const [selectedTankId, setSelectedTankId] = useState('TNK-01');
  const [dispatchGallons, setDispatchGallons] = useState('800');
  const [recycler, setRecycler] = useState('L&R Commercial S.R.L. (Planta Haina)');
  const [truckPlate, setTruckPlate] = useState('L-399401');
  const [driverName, setDriverName] = useState('Eusebio Rosario');

  if (!isOpen) return null;

  const totalGallonsStored = tanks.reduce((sum, t) => sum + t.currentGallons, 0);
  const totalCapacity = tanks.reduce((sum, t) => sum + t.capacityGallons, 0);
  const globalCapacityPercent = Math.round((totalGallonsStored / totalCapacity) * 100);
  const totalGallonsRecycledYear = manifests.reduce((sum, m) => sum + m.gallonsDispatched, 0);

  const handleRegisterDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const gallonsNum = Number(dispatchGallons) || 500;

    // Update tanks
    const updatedTanks = tanks.map(t => {
      if (t.id === selectedTankId) {
        return {
          ...t,
          currentGallons: Math.max(0, t.currentGallons - gallonsNum),
          lastEmptiedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return t;
    });

    const newManifest: EcologicalManifestRecord = {
      id: `MAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      manifestNumber: `MIMARENA-DISP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 10),
      gallonsDispatched: gallonsNum,
      oilType: tanks.find(t => t.id === selectedTankId)?.name.split(':')[1] || 'Aceite Residual',
      certifiedRecycler: recycler,
      mambientePermit: 'RES-PEL-2024-00492',
      truckPlate: truckPlate.trim().toUpperCase(),
      driverName: driverName.trim(),
      status: 'CERTIFICATE_ISSUED'
    };

    setTanks(updatedTanks);
    setManifests([newManifest, ...manifests]);
    setIsRegisterOpen(false);
  };

  const handleExportCsv = () => {
    const headers = 'MANIFIESTO,FECHA,GALONES,TIPO_LUBRICANTE,GESTOR_AMBIENTAL,PERMISO_MEDIO_AMBIENTE,FICHA_CAMION,CONDUCTOR,ESTADO\n';
    const rows = manifests.map(m => 
      `"${m.manifestNumber}","${m.date}","${m.gallonsDispatched}","${m.oilType}","${m.certifiedRecycler}","${m.mambientePermit}","${m.truckPlate}","${m.driverName}","${m.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_BITACORA_ACEITES_USADOS_MIMARENA_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500 text-black uppercase tracking-wider">
                  LEY 64-00 • MIMARENA
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Gestión Ambiental de Residuos Peligrosos Taller Km 22
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Control de Aceites Usados & Disposición Ecológica
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Bitácora Oficial en Formato CSV para Inspectores MIMARENA"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar Manifiestos</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">VOLUMEN ACTUAL EN PATIO KM 22:</span>
            <div className="text-lg font-black text-amber-400">
              {totalGallonsStored.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">/ {totalCapacity.toLocaleString()} Galones</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-[1px] overflow-hidden mt-1">
              <div 
                className={`h-full ${globalCapacityPercent > 80 ? 'bg-rose-500' : 'bg-amber-400'}`} 
                style={{ width: `${globalCapacityPercent}%` }} 
              />
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">RECICLADO CERTIFICADO (AÑO 2026):</span>
            <div className="text-lg font-black text-emerald-400">
              {totalGallonsRecycledYear.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">Galones</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              100% entregado a plantas de re-refinación autorizadas
            </p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-[3px] border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">HUELLA DE CARBONO EVITADA:</span>
            <div className="text-lg font-black text-cyan-400">
              {(totalGallonsRecycledYear * 0.0094).toFixed(1)} <span className="text-xs text-zinc-500 font-normal">Toneladas CO₂</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-sans">
              Por sustitución de combustóleo fósil virgen
            </p>
          </div>
        </div>

        {/* Content: Tanks Grid & Manifests */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Tanks Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-emerald-400" /> Tanques de Almacenamiento & Diques Secundarios
              </h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-3 py-1.5 rounded-[2px] bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Recolección / Salida</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tanks.map(tank => {
                const percent = Math.round((tank.currentGallons / tank.capacityGallons) * 100);
                const isNearFull = percent >= 80;

                return (
                  <div key={tank.id} className="bg-zinc-900 border border-zinc-800 rounded-[3px] p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white block">{tank.name}</span>
                        <span className="text-[10px] text-zinc-500 font-sans">{tank.containmentArea}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold ${
                        isNearFull 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : 'bg-zinc-950 text-zinc-300 border border-zinc-800'
                      }`}>
                        {percent}%
                      </span>
                    </div>

                    <div className="h-2 bg-zinc-950 rounded-[1px] overflow-hidden border border-zinc-800">
                      <div 
                        className={`h-full transition-all duration-300 ${isNearFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{tank.currentGallons} Gal / {tank.capacityGallons} Gal</span>
                      <span className="text-[10px] text-zinc-500">Último retiro: {tank.lastEmptiedDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Manifests Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Registro de Manifiestos de Entrega MIMARENA
            </h3>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden divide-y divide-zinc-800">
              {manifests.map(m => (
                <div key={m.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {m.manifestNumber}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">{m.date}</span>
                    </div>
                    <div className="text-white font-bold">
                      {m.gallonsDispatched} Galones • <span className="text-zinc-300 font-normal">{m.oilType}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans">
                      Gestor: <strong className="text-zinc-200">{m.certifiedRecycler}</strong> (Permiso: {m.mambientePermit})
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-zinc-400 space-y-1">
                    <div>Camión cisterna: <span className="text-white font-mono font-bold">{m.truckPlate}</span></div>
                    <div>Conductor: {m.driverName}</div>
                    <div className="text-emerald-400 font-bold text-[10px] flex items-center sm:justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Certificado Verde Emitido
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Sub-Dialog: New Manifest Registration */}
        {isRegisterOpen && (
          <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <form 
              onSubmit={handleRegisterDispatch}
              className="bg-zinc-900 border border-emerald-500/40 rounded-[4px] p-5 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5 font-display">
                  <Leaf className="w-3.5 h-3.5" /> Registrar Despacho Ecológico a Planta
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Tanque de Origen:</label>
                  <select
                    value={selectedTankId}
                    onChange={e => setSelectedTankId(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-emerald-400"
                  >
                    {tanks.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.currentGallons} Gal)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Galones Despachados:</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={2000}
                    value={dispatchGallons}
                    onChange={e => setDispatchGallons(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Gestor Ambiental Autorizado:</label>
                  <select
                    value={recycler}
                    onChange={e => setRecycler(e.target.value)}
                    className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="L&R Commercial S.R.L. (Planta Haina)">L&R Commercial S.R.L. (Planta Haina - Permiso RES-PEL-2024-00492)</option>
                    <option value="Rensa Dominicana Soluciones Verdes">Rensa Dominicana Soluciones Verdes (Permiso RES-PEL-2023-00891)</option>
                    <option value="Ecoservicios del Caribe S.A.">Ecoservicios del Caribe S.A. (Permiso RES-PEL-2024-00104)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Placa Camión:</label>
                    <input
                      type="text"
                      required
                      value={truckPlate}
                      onChange={e => setTruckPlate(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white font-mono uppercase focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-mono uppercase text-[10px]">Conductor Certificado:</label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[2px] text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-[2px] text-xs uppercase shadow-sm cursor-pointer"
                >
                  Emitir Manifiesto Oficial
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cumplimiento estricto Norma Dominicana para Manejo de Desechos Peligrosos NORDOM 684.
          </span>
          <span className="font-mono text-[10px]">TMD Eco-Audit v9</span>
        </div>
      </div>
    </div>
  );
};
