import React, { useState } from 'react';
import {
  Camera,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Upload,
  Clock,
  MapPin,
  X,
  AlertTriangle,
  Fuel,
  Download,
  Check,
  UserCheck
} from 'lucide-react';

interface WorkshopEquipmentIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineName?: string;
  defaultSerial?: string;
}

interface PhotoInspectionView {
  label: string;
  description: string;
  taken: boolean;
  notes: string;
}

export const WorkshopEquipmentIntakeModal: React.FC<WorkshopEquipmentIntakeModalProps> = ({
  isOpen,
  onClose,
  defaultMachineName = 'LiuGong 922E HD Excavadora',
  defaultSerial = 'LG922E-2024-88412'
}) => {
  const [machineName, setMachineName] = useState(defaultMachineName);
  const [serial, setSerial] = useState(defaultSerial);
  const [clientName, setClientName] = useState('Constructora Malespín S.R.L.');
  const [transporterName, setTransporterName] = useState('Transportes Cama Baja Dominicanos');
  const [horometer, setHorometer] = useState('3420');
  const [fuelLevel, setFuelLevel] = useState('45');
  const [intakeBay, setIntakeBay] = useState('Bahía 3 (Desarme Hidráulico)');

  const [views, setViews] = useState<PhotoInspectionView[]>([
    { label: 'Vista Frontal', description: 'Balde, cuchara, cilindros y pasadores delanteros', taken: true, notes: 'Desgaste normal en cuchilla. Sin roturas visibles.' },
    { label: 'Lateral Izquierdo', description: 'Tren de rodaje, tensión de oruga y rodillos inferiores', taken: true, notes: 'Oruga izquierda con 1 teja ligeramente desalineada.' },
    { label: 'Lateral Derecho', description: 'Cabina, cristales, espejos retrovisores y pasamanos', taken: true, notes: 'Vidrio panorámico sin fisuras. Espejo derecho intacto.' },
    { label: 'Vista Trasera', description: 'Contrapeso, rejilla de radiador y escape de motor', taken: true, notes: 'Rayón superficial de 15cm en pintura de contrapeso.' }
  ]);

  const [preExistingDamages, setPreExistingDamages] = useState<string[]>([
    'Rayón superficial en contrapeso trasero',
    'Fuga leve de grasa en acople rápido',
    'Desgaste en zapatas de tracción al 75% vida útil'
  ]);
  const [newDamage, setNewDamage] = useState('');
  const [intakeSaved, setIntakeSaved] = useState(false);

  if (!isOpen) return null;

  const handleAddDamage = () => {
    if (!newDamage.trim()) return;
    setPreExistingDamages([...preExistingDamages, newDamage.trim()]);
    setNewDamage('');
  };

  const handleSaveIntake = () => {
    setIntakeSaved(true);
  };

  const handleExportIntakeCertificate = () => {
    let text = `=========================================================================\n`;
    text += `TECNOMAQUINARIAS DIESEL S.R.L. — TALLER CENTRAL KM 22 AUTOPISTA DUARTE\n`;
    text += `ACTA PERICIAL DE RECEPCIÓN TÉCNICA E INSPECCIÓN FOTOGRÁFICA DE ENTRADA\n`;
    text += `NÚMERO DE INTAKE: ITK-2026-${Math.floor(1000 + Math.random() * 9000)}\n`;
    text += `FECHA & HORA: ${new Date().toLocaleString()}\n`;
    text += `=========================================================================\n\n`;

    text += `1. DATOS DEL EQUIPO & PROPIETARIO:\n`;
    text += `   - Equipo: ${machineName}\n`;
    text += `   - Número de Serie / Chasis: ${serial}\n`;
    text += `   - Propietario / Cliente: ${clientName}\n`;
    text += `   - Transportista Responsable: ${transporterName}\n`;
    text += `   - Horómetro de Entrada: ${horometer} Horas\n`;
    text += `   - Nivel de Combustible: ${fuelLevel}% Diésel\n`;
    text += `   - Bahía de Taller Asignada: ${intakeBay}\n\n`;

    text += `2. ESTADO DE LAS 4 VISTAS FOTOGRÁFICAS (COMPROBACIÓN VISUAL):\n`;
    views.forEach(v => {
      text += `   • [OK REGISTRADA] ${v.label}: ${v.notes}\n`;
    });

    text += `\n3. DAÑOS PREVIOS REGISTRADOS (DESCARGO DE RESPONSABILIDAD TMD):\n`;
    preExistingDamages.forEach((d, idx) => {
      text += `   ${idx + 1}. ${d}\n`;
    });

    text += `\nDECLARACIÓN DE CONFORMIDAD:\n`;
    text += `El transportista y el cliente aceptan que la maquinaria ingresa al taller con los daños\n`;
    text += `preexistentes arriba detallados y liberan a TMD Dominicana de reclamos por los mismos.\n\n`;
    text += `FIRMA RECEPCIONISTA TMD: _______________________\n`;
    text += `FIRMA TRANSPORTISTA / CLIENTE: ___________________\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TMD_ACTA_RECEPCION_${serial}.txt`;
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
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  TALLER KM 22 • INTAKE
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Inspección Fotográfica de Recepción
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Recepción Pericial de Maquinaria
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {/* General Data Card */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Maquinaria:</span>
              <span className="font-bold text-white text-xs">{machineName}</span>
              <span className="text-[10px] text-zinc-500 font-mono block">Serie: {serial}</span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Horómetro & Tanque:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-amber-400">{horometer} hrs</span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Fuel className="w-3 h-3" /> {fuelLevel}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-display">Bahía Asignada:</span>
              <span className="font-bold text-sky-400 text-xs">{intakeBay}</span>
            </div>
          </div>

          {/* 4 Photo Views Grid */}
          <div>
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display mb-2">
              4 Vistas Fotográficas de Registro Obligatorio:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {views.map((v, idx) => (
                <div key={idx} className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> {v.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                      FOTO CAPTURADA
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans">{v.description}</p>
                  <div className="p-2 bg-zinc-950 border border-zinc-850 rounded-[2px] text-[11px] text-zinc-300">
                    <span className="text-[10px] text-zinc-500 block uppercase">Observación visual:</span>
                    {v.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-existing Damages Checklist */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider block font-display">
              Daños y Golpes Preexistentes Detectados:
            </span>
            <div className="space-y-1.5">
              {preExistingDamages.map((dmg, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-850 rounded-[2px] text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-zinc-300 font-sans">{dmg}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">No atribuible a TMD</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Añadir otro detalle visual o golpe previo..."
                value={newDamage}
                onChange={e => setNewDamage(e.target.value)}
                className="flex-1 p-2 bg-zinc-950 border border-zinc-700 rounded-[2px] text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddDamage}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase rounded-[2px] cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Blindaje Jurídico ante Reclamos Previos</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportIntakeCertificate}
              className="px-4 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Acta Pericial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
