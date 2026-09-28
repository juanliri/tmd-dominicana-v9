import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  User,
  Clock,
  Building2,
  Lock
} from 'lucide-react';

interface PatioGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  itemSummary?: string;
  recipientName?: string;
  recipientCedula?: string;
  vehiclePlate?: string;
}

export const PatioGatePassModal: React.FC<PatioGatePassModalProps> = ({
  isOpen,
  onClose,
  orderNumber = 'ORD-2026-8812',
  itemSummary = 'LiuGong 922E HD (Chasis: LG922E-DOM-2024-8841) + Cuchara Reforzada',
  recipientName = 'Carlos Manuel Bautista',
  recipientCedula = '001-0941204-8',
  vehiclePlate = 'L-390412 (Cama Baja Kenworth T800)'
}) => {
  const [driverName, setDriverName] = useState(recipientName);
  const [driverCedula, setDriverCedula] = useState(recipientCedula);
  const [truckPlate, setTruckPlate] = useState(vehiclePlate);
  const [isGateValidated, setIsGateValidated] = useState(false);

  if (!isOpen) return null;

  const passNumber = `GATE-2026-${orderNumber.replace(/[^0-9]/g, '').slice(-4) || '9041'}`;
  const issueTime = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  const expirationTime = new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateGuardScan = () => {
    setIsGateValidated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  SEGURIDAD FÍSICA PATIO KM 22
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Garita de Salida Autopista Duarte
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Pase de Puerta Digital (Gate Pass)
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

        {/* Gate Pass Printable Card */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          <div className="bg-white text-black p-5 rounded-[4px] border-2 border-dashed border-zinc-400 shadow-md space-y-4">
            {/* Top Pass Title & QR Code */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-300 pb-3">
              <div>
                <span className="text-[10px] text-zinc-600 uppercase font-bold block">PASE DE SALIDA AUTORIZADA:</span>
                <h3 className="text-lg font-black tracking-tight text-zinc-900">{passNumber}</h3>
                <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">
                  TECNOMAQUINARIAS DIESEL S.R.L. &bull; RNC: 1-01-84920-1
                </span>
              </div>

              {/* Pseudo QR Code Box */}
              <div className="w-20 h-20 bg-black p-1.5 rounded-[2px] flex flex-col justify-between shrink-0 shadow-xs">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white" />
                  </div>
                  <div className="w-4 h-4 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white" />
                  </div>
                </div>
                <div className="text-[7px] text-zinc-300 text-center font-bold">GARITA KM 22</div>
                <div className="flex justify-start">
                  <div className="w-4 h-4 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="space-y-1 text-[11px] leading-tight font-mono">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">DESCRIPCIÓN DE CARGA / EQUIPO:</span>
              <p className="font-bold text-zinc-900 text-xs">{itemSummary}</p>
              <span className="text-[10px] text-zinc-600 block">Proforma / Orden Ref: <strong>{orderNumber}</strong></span>
            </div>

            {/* Driver & Transport Info */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 text-[11px] font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">CHOFER AUTORIZADO:</span>
                <span className="font-bold text-zinc-900 block">{driverName}</span>
                <span className="text-zinc-600 text-[10px]">Céd: {driverCedula}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">TRANSPORTE / PLACA:</span>
                <span className="font-bold text-zinc-900 block">{truckPlate}</span>
                <span className="text-zinc-600 text-[10px]">Destino Nacional</span>
              </div>
            </div>

            {/* Time Window Validity */}
            <div className="p-2.5 bg-zinc-100 rounded-[2px] border border-zinc-300 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-zinc-500 block">EMISIÓN:</span>
                <span className="font-bold text-zinc-800">{issueTime}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">VENCE (VENTANA 4H):</span>
                <span className="font-bold text-red-600">{expirationTime}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">DESPACHADOR:</span>
                <span className="font-bold text-zinc-800">Almacén Central</span>
              </div>
            </div>

            {/* Validation Stamp Status */}
            {isGateValidated ? (
              <div className="p-2 rounded-[2px] bg-emerald-100 border border-emerald-400 text-emerald-800 text-center font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SALIDA REGISTRADA Y AUTORIZADA EN GARITA 1</span>
              </div>
            ) : (
              <div className="text-center text-[10px] text-zinc-500">
                Presentar este ticket en pantalla o impreso al oficial de garita antes de salir.
              </div>
            )}
          </div>

          {/* Quick Edit Inputs */}
          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-[3px] space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
              Editar Datos de Transportista para el Pase:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                placeholder="Nombre del Chofer..."
                className="p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={driverCedula}
                onChange={e => setDriverCedula(e.target.value)}
                placeholder="Cédula..."
                className="p-2 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 uppercase font-bold text-[11px] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Imprimir Ticket</span>
          </button>

          {!isGateValidated ? (
            <button
              type="button"
              onClick={handleSimulateGuardScan}
              className="px-4 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-[11px] shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validar en Garita (Simular)</span>
            </button>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Garita Abierta
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
