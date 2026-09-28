import React, { useState } from 'react';
import {
  BookOpen,
  QrCode,
  Download,
  Printer,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  FileText,
  X,
  Phone,
  Droplets,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CabinQrManualViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineName?: string;
  machineSerial?: string;
}

export const CabinQrManualViewerModal: React.FC<CabinQrManualViewerModalProps> = ({
  isOpen,
  onClose,
  machineName = 'LiuGong 922E HD Excavadora de Orugas',
  machineSerial = 'LG922E-DOM-2024-8841'
}) => {
  const [activeTab, setActiveTab] = useState<'lubrication' | 'fuses' | 'pressures' | 'dtc'>('lubrication');

  if (!isOpen) return null;

  const handlePrintDecal = () => {
    window.print();
  };

  const handleDownloadManualPdf = () => {
    const text = `=========================================================================\n` +
      `TECNOMAQUINARIAS DIESEL S.R.L. — MANUAL DIGITAL DEL OPERADOR EN ESPAÑOL\n` +
      `CALCOMANÍA QR DE CABINA OFICIAL & PROTOCOLO DE MANTENIMIENTO\n` +
      `=========================================================================\n\n` +
      `EQUIPO: ${machineName}\n` +
      `SERIE / CHASIS: ${machineSerial}\n` +
      `IDIOMA: Español (República Dominicana)\n\n` +
      `1. TABLA OFICIAL DE INTERVALOS DE LUBRICACIÓN:\n` +
      `- Cada 10 Horas (Diario): Engrase de balancín, pluma y cuchara con grasa litio EP2.\n` +
      `- Cada 250 Horas: Cambio de aceite de motor (15W-40 CK-4, 21 Litros) y filtro de aceite.\n` +
      `- Cada 500 Horas: Reemplazo de filtros de combustible (primario y secundario con trampa de agua).\n` +
      `- Cada 1,000 Horas: Cambio de aceite en reductores de traslación y corona de giro (85W-140).\n` +
      `- Cada 2,000 Horas: Reemplazo completo de aceite hidráulico ISO VG 46 (220 Litros) y filtro de retorno.\n\n` +
      `2. CAJA DE FUSIBLES PRINCIPAL (DEBAJO DEL ASIENTO DEL OPERADOR):\n` +
      `- F1 (10A): Display LCD de Instrumentos J1939\n` +
      `- F2 (15A): Faros de Trabajo LED Delanteros y Traseros\n` +
      `- F3 (20A): Solenoides de Bombas Hidráulicas y Freno de Giro\n` +
      `- F4 (25A): Motor del Limpiaparabrisas y Bomba de Lavado\n` +
      `- F5 (30A): Compresor y Ventilador del Aire Acondicionado\n\n` +
      `3. CALIBRACIÓN DE PRESIONES HIDRÁULICAS KAWASAKI:\n` +
      `- Presión de Alivio Principal (Main Relief): 343 bar (4,975 psi)\n` +
      `- Presión en Power Boost: 373 bar (5,410 psi)\n` +
      `- Presión del Circuito Piloto: 39 bar (565 psi)\n` +
      `- Presión de Alivio de Giro: 275 bar (3,988 psi)\n\n` +
      `4. ASISTENCIA TÉCNICA 24/7 TMD EN OBRA:\n` +
      `Centro de Despacho Móvil Km 22: (809) 560-1234 | soporte@tmd.do\n` +
      `=========================================================================\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TMD_MANUAL_CABINA_${machineSerial}_ES.txt`;
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  MANUAL DE CABINA QR
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Guía Oficial del Operador en Español
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Manual de Operación & Mantenimiento (OMM)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadManualPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Guía Rápida Oficial"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Descargar Manual</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Machine & Decal Header Card */}
        <div className="p-3.5 bg-zinc-900/60 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-[2px] flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-black" />
            </div>
            <div>
              <span className="text-white font-bold block">{machineName}</span>
              <span className="text-zinc-400 text-[10px] block">
                Chasis: <strong className="text-amber-400">{machineSerial}</strong> &bull; Calcomanía de Cabina QR
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrintDecal}
            className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            title="Imprimir Calcomanía Indeleble para pegar en la Cabina"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Calcomanía</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 text-xs shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('lubrication')}
            className={`px-4 py-2.5 font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'lubrication'
                ? 'border-amber-400 text-amber-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Lubricación & Fluidos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fuses')}
            className={`px-4 py-2.5 font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'fuses'
                ? 'border-amber-400 text-amber-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Caja de Fusibles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pressures')}
            className={`px-4 py-2.5 font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'pressures'
                ? 'border-amber-400 text-amber-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Presiones Hidráulicas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dtc')}
            className={`px-4 py-2.5 font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'dtc'
                ? 'border-amber-400 text-amber-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Códigos de Falla DTC</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs space-y-4">
          {activeTab === 'lubrication' && (
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Intervalos Oficiales de Cambio de Fluidos y Filtros:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-1">
                  <div className="flex justify-between font-bold text-amber-400">
                    <span>CADA 250 HORAS</span>
                    <span>MOTOR DIÉSEL</span>
                  </div>
                  <p className="text-white font-bold">Aceite de Motor 15W-40 CK-4 (21 Litros)</p>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    Reemplazar filtro de aceite original Cummins. Inspeccionar tensión de correas.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-1">
                  <div className="flex justify-between font-bold text-cyan-400">
                    <span>CADA 500 HORAS</span>
                    <span>COMBUSTIBLE</span>
                  </div>
                  <p className="text-white font-bold">Filtros de Diésel Primario & Secundario</p>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    Purgar sedimentador de agua diariamente. Reemplazar cartuchos separadores de 10 micras.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-1">
                  <div className="flex justify-between font-bold text-emerald-400">
                    <span>CADA 1,000 HORAS</span>
                    <span>MANDOS FINALES</span>
                  </div>
                  <p className="text-white font-bold">Aceite de Engranajes 85W-140 (12 Litros)</p>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    Drenar y rellenar mandos finales de traslación de orugas y reductor de giro.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px] space-y-1">
                  <div className="flex justify-between font-bold text-purple-400">
                    <span>CADA 2,000 HORAS</span>
                    <span>SISTEMA HIDRÁULICO</span>
                  </div>
                  <p className="text-white font-bold">Aceite Hidráulico ISO VG 46 (220 Litros)</p>
                  <p className="text-zinc-400 text-[11px] font-sans">
                    Reemplazar elemento filtrante de retorno y respirador de tanque hidráulico.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fuses' && (
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Esquema de Fusibles de Cabina (Ubicación: Bajo el Asiento):
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800 overflow-hidden">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-white">F1 (10 Amperios - Rojo)</span>
                  <span className="text-zinc-400">Pantalla Display LCD J1939 & Sensores de Cabina</span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-white">F2 (15 Amperios - Azul)</span>
                  <span className="text-zinc-400">Faros de Trabajo LED de Pluma y Techo</span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-white">F3 (20 Amperios - Amarillo)</span>
                  <span className="text-zinc-400">Válvulas Solenoides de Bombas Kawasaki y Freno de Giro</span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-white">F4 (25 Amperios - Blanco)</span>
                  <span className="text-zinc-400">Motor Limpiaparabrisas y Bocina</span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="font-bold text-white">F5 (30 Amperios - Verde)</span>
                  <span className="text-zinc-400">Compresor de Aire Acondicionado y Soplador de Cabina</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pressures' && (
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Presiones Hidráulicas Nominales de Calibración:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                  <span className="text-[10px] text-zinc-500 uppercase block">ALIVIO PRINCIPAL</span>
                  <span className="text-lg font-black text-amber-400">343 Bar</span>
                  <span className="text-[10px] text-zinc-500 block">4,975 PSI</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                  <span className="text-[10px] text-zinc-500 uppercase block">POWER BOOST</span>
                  <span className="text-lg font-black text-red-400">373 Bar</span>
                  <span className="text-[10px] text-zinc-500 block">5,410 PSI</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                  <span className="text-[10px] text-zinc-500 uppercase block">SISTEMA PILOTO</span>
                  <span className="text-lg font-black text-cyan-400">39 Bar</span>
                  <span className="text-[10px] text-zinc-500 block">565 PSI</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                  <span className="text-[10px] text-zinc-500 uppercase block">ALIVIO DE GIRO</span>
                  <span className="text-lg font-black text-emerald-400">275 Bar</span>
                  <span className="text-[10px] text-zinc-500 block">3,988 PSI</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dtc' && (
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                Códigos de Advertencia en Pantalla Más Frecuentes:
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] divide-y divide-zinc-800">
                <div className="p-3 flex items-start gap-3">
                  <div className="p-1.5 rounded-[2px] bg-red-500/20 text-red-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">SPN 110 / FMI 0: Alta Temperatura de Refrigerante</span>
                    <p className="text-zinc-400 text-[11px] font-sans mt-0.5">
                      Acción: Reducir carga a ralentí durante 3 minutos. Verificar si el radiador tiene polvo acumulado.
                    </p>
                  </div>
                </div>

                <div className="p-3 flex items-start gap-3">
                  <div className="p-1.5 rounded-[2px] bg-amber-500/20 text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">SPN 94 / FMI 1: Baja Presión de Suministro de Diésel</span>
                    <p className="text-zinc-400 text-[11px] font-sans mt-0.5">
                      Acción: Purgar sedimentador de agua y reemplazar filtro primario de combustible.
                    </p>
                  </div>
                </div>

                <div className="p-3 flex items-start gap-3">
                  <div className="p-1.5 rounded-[2px] bg-cyan-500/20 text-cyan-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">SPN 168 / FMI 1: Voltaje de Batería Bajo (&lt; 23.2V)</span>
                    <p className="text-zinc-400 text-[11px] font-sans mt-0.5">
                      Acción: Revisar bornes de acumuladores y tensión de faja de alternador de 24V.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Soporte 24/7 de Taller Km 22: (809) 560-1234
          </span>
          <span className="font-mono text-[10px]">TMD Cabin Documentation Core v9</span>
        </div>
      </div>
    </div>
  );
};
