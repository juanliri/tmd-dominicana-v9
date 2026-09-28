import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  ShieldCheck,
  X,
  Wrench,
  Check,
  Award,
  UserCheck
} from 'lucide-react';

interface PdiSection {
  title: string;
  items: { id: string; label: string; checked: boolean }[];
}

interface PreDeliveryInspectionPdiModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
  clientName?: string;
}

export const PreDeliveryInspectionPdiModal: React.FC<PreDeliveryInspectionPdiModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora 22 Ton',
  machineSerial = 'LG922E-DOM-2024-8841',
  clientName = 'Constructora Malespín S.A.S.'
}) => {
  const [inspectorName, setInspectorName] = useState('Ing. Manuel Santos');
  const [sections, setSections] = useState<PdiSection[]>([
    {
      title: '1. MOTOR DIÉSEL CUMMINS & FLUIDOS',
      items: [
        { id: 'm1', label: 'Nivel y viscosidad de aceite de motor (15W-40 CK-4)', checked: true },
        { id: 'm2', label: 'Nivel y concentración de refrigerante de larga duración (OAT)', checked: true },
        { id: 'm3', label: 'Tensión y alineación de correa de alternador / ventilador', checked: true },
        { id: 'm4', label: 'Drenado y verificación de sedimentador de agua en diésel', checked: true },
        { id: 'm5', label: 'Ausencia total de fugas en mangueras de turbo e intercooler', checked: true }
      ]
    },
    {
      title: '2. SISTEMA HIDRÁULICO KAWASAKI',
      items: [
        { id: 'h1', label: 'Nivel de aceite hidráulico ISO VG 46 en mirilla de tanque', checked: true },
        { id: 'h2', label: 'Presión de alivio de válvula principal calibrada a 343 bar', checked: true },
        { id: 'h3', label: 'Prueba de ciclos pluma, brazo y cuchara sin ruidos anómalos', checked: true },
        { id: 'h4', label: 'Inspección de retenes y vástagos de cilindros sin rayaduras', checked: true }
      ]
    },
    {
      title: '3. TREN DE RODAJE & ESTRUCTURA',
      items: [
        { id: 't1', label: 'Tensión de orugas con grasa verificada (pandeo 320–340 mm)', checked: true },
        { id: 't2', label: 'Torque de pernos de zapatas verificado con torquímetro (1,000 Nm)', checked: true },
        { id: 't3', label: 'Engrase completo de pasadores de pluma, balancín y cuchara con grasa EP2', checked: true },
        { id: 't4', label: 'Inspección visual de corona de giro y engranajes de tornamesa', checked: true }
      ]
    },
    {
      title: '4. CABINA DE OPERADOR, DISPLAY & TELEMETRÍA',
      items: [
        { id: 'c1', label: 'Estructura ROPS/FOPS con placa de homologación intacta', checked: true },
        { id: 'c2', label: 'Aire acondicionado y calefacción probados (<18°C en rejillas)', checked: true },
        { id: 'c3', label: 'Display digital LCD sin códigos DTC de falla activos', checked: true },
        { id: 'c4', label: 'Módem telemático LiveLink J1939 transmitiendo GPS y horómetro', checked: true }
      ]
    },
    {
      title: '5. SEGURIDAD, EXTINTOR AFEX & ILUMINACIÓN',
      items: [
        { id: 's1', label: 'Alarma de retroceso audible superior a 95 dB', checked: true },
        { id: 's2', label: 'Baliza estroboscópica y faros LED de trabajo 360° operativos', checked: true },
        { id: 's3', label: 'Extintor de incendios contra fuegos ABC inspeccionado y cargado', checked: true },
        { id: 's4', label: 'Cinturón de seguridad retráctil de 3 puntos en perfecto estado', checked: true }
      ]
    },
    {
      title: '6. DOCUMENTACIÓN, LLAVES & CALCOMANÍAS',
      items: [
        { id: 'd1', label: 'Manual de Operación y Mantenimiento oficial en español entregado', checked: true },
        { id: 'd2', label: 'Juego de 2 llaves maestras originales LiuGong / JCB', checked: true },
        { id: 'd3', label: 'Calcomanía QR de cabina para escaneo rápido de soporte adherida', checked: true },
        { id: 'd4', label: 'Certificado de Póliza TMD Care 24 Meses / 4,000 Horas firmado', checked: true }
      ]
    }
  ]);

  if (!isOpen) return null;

  const totalPoints = sections.reduce((acc, s) => acc + s.items.length, 0);
  const checkedPoints = sections.reduce((acc, s) => acc + s.items.filter(i => i.checked).length, 0);
  const pdiPercentage = Math.round((checkedPoints / totalPoints) * 100);

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    setSections(prev => {
      const copy = [...prev];
      copy[sectionIdx].items[itemIdx].checked = !copy[sectionIdx].items[itemIdx].checked;
      return copy;
    });
  };

  const handleCheckAll = () => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => ({ ...i, checked: true }))
    })));
  };

  const handleExportPdi = () => {
    let doc = `========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — ACTA OFICIAL DE INSPECCIÓN PRE-ENTREGA (PDI)\n` +
      `CERTIFICACIÓN DE CALIDAD DE FÁBRICA & LIBERACIÓN DE PATIO KM 22\n` +
      `========================================================================\n\n` +
      `MAQUINARIA: ${machineName}\n` +
      `NÚMERO DE SERIE / CHASIS: ${machineSerial}\n` +
      `CLIENTE RECEPTOR: ${clientName}\n` +
      `INSPECTOR TÉCNICO: ${inspectorName}\n` +
      `FECHA DE INSPECCIÓN: ${new Date().toLocaleDateString('es-DO')}\n` +
      `PUNTAJE PDI ALCANZADO: ${pdiPercentage}% (${checkedPoints} de ${totalPoints} Puntos Auditados)\n` +
      `ESTADO: ${pdiPercentage === 100 ? 'APROBADO PARA ENTREGA INMEDIATA' : 'PENDIENTE DE CORRECCIÓN'}\n\n` +
      `DETALLE DE PUNTOS VERIFICADOS:\n`;

    sections.forEach(s => {
      doc += `\n[${s.title}]\n`;
      s.items.forEach(i => {
        doc += `  ${i.checked ? '[X]' : '[ ]'} ${i.label}\n`;
      });
    });

    doc += `\n========================================================================\n` +
      `FIRMA DEL INSPECTOR: ___________________________ (${inspectorName})\n` +
      `FIRMA DEL CLIENTE / RECEPTOR: __________________ (${clientName})\n` +
      `Sede Central Km 22 Autopista Duarte, Santo Domingo Oeste, R.D.\n`;

    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_ACTA_PDI_${machineSerial}_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  PROTOCOLO OFICIAL DE TALLER
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Lista de Verificación de Inspección Pre-Entrega (PDI)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Auditoría PDI de Maquinaria Nueva (85 Puntos)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Acta Oficial PDI Firmada"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Acta</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Machine & Progress Bar */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          <div>
            <span className="text-zinc-500 text-[10px] block">EQUIPO:</span>
            <span className="text-white font-bold">{machineName}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">SERIAL CHASIS:</span>
            <span className="text-zinc-300 font-mono">{machineSerial}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">ESTADO DE APROBACIÓN:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              pdiPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {pdiPercentage}% ({checkedPoints}/{totalPoints} Puntos Conformes)
            </span>
          </div>
        </div>

        {/* Action strip to check all */}
        <div className="p-3 bg-zinc-900/20 border-b border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[10px] uppercase">Inspector Certificado:</span>
            <input
              type="text"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
              className="p-1 px-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white text-xs w-48 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleCheckAll}
            className="px-2.5 py-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            ✓ Marcar Todos Conformes
          </button>
        </div>

        {/* Checklist Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden">
              <div className="p-2.5 bg-zinc-900/90 border-b border-zinc-800 font-bold uppercase text-[11px] text-amber-400 flex items-center justify-between">
                <span>{sec.title}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {sec.items.filter(i => i.checked).length} / {sec.items.length} Conformes
                </span>
              </div>

              <div className="p-3 space-y-2">
                {sec.items.map((item, iIdx) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-1.5 rounded-[2px] hover:bg-zinc-850/60 cursor-pointer select-none text-zinc-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(sIdx, iIdx)}
                      className="w-4 h-4 rounded-[2px] bg-zinc-950 border-zinc-700 text-amber-400 focus:ring-0"
                    />
                    <span className={`text-[11px] ${item.checked ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Certificado PDI avalado por LiuGong Machinery Corp & JCB Service Protocol.
          </span>
          <span className="font-mono text-[10px]">TMD Workshop Quality v9</span>
        </div>
      </div>
    </div>
  );
};
