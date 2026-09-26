import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, BookOpen, ShieldCheck, Download, Award, Wrench } from 'lucide-react';
import { Machine } from '../../types';

interface IndustrialPageFlipReaderModalProps {
  machine: Machine;
  onClose: () => void;
  onDownloadPdf?: () => void;
}

export const IndustrialPageFlipReaderModal: React.FC<IndustrialPageFlipReaderModalProps> = ({
  machine,
  onClose,
  onDownloadPdf
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    // Page 0: Cover / Ficha Técnica Portada
    {
      title: 'PORTADA OFICIAL DE ESPECIFICACIONES TÉCNICAS',
      tag: 'TMD DOC-2026-HQ',
      content: (
        <div className="flex flex-col h-full justify-between p-6 bg-zinc-950 text-white font-mono">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-amber-400 font-bold text-xs">TECNOMAQUINARIAS DIESEL S.R.L.</span>
              <span className="text-[10px] text-zinc-400">RNC 1-31-89024-5</span>
            </div>
            
            <div className="text-center my-6">
              <span className="px-2.5 py-1 rounded-[2px] bg-amber-400 text-black font-black text-xs uppercase tracking-wider">
                {machine.brand} · DISTRIBUIDOR OFICIAL
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-3 font-display">
                {machine.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Modelo: {machine.modelCode} · Categoría: {machine.category}
              </p>
            </div>

            <div className="w-full h-44 bg-zinc-900 rounded-[4px] overflow-hidden border border-zinc-800 flex items-center justify-center p-2 mb-4">
              <img 
                src={machine.image} 
                alt={machine.name}
                className="max-h-full object-contain"
              />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Sede Central: Km 22, Autopista Duarte</span>
            <span className="text-amber-400 font-bold">Página 1 de 4</span>
          </div>
        </div>
      )
    },
    // Page 1: Power & Hydraulics
    {
      title: 'TREN MOTRIZ & SISTEMA HIDRÁULICO DE ALTA PRESIÓN',
      tag: 'ESPECIFICACIONES OEM',
      content: (
        <div className="flex flex-col h-full justify-between p-6 bg-zinc-950 text-white font-mono">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-4">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase">MOTOR & CAUDAL HIDRÁULICO</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">POTENCIA BRUTA DE MOTOR:</span>
                <span className="text-lg font-black text-amber-400">{machine.powerHp} HP @ 2,200 RPM</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Certificación de emisiones Tier 3 / Tier 4 Final</p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">PESO OPERATIVO / CAPACIDAD:</span>
                <span className="text-base font-black text-white">{machine.operatingWeightKg?.toLocaleString() || '14,500'} KG</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Cucharón estándar: {machine.bucketCapacityM3 || 0.9} m³ HD</p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">SISTEMA HIDRÁULICO PRINCIPAL:</span>
                <span className="text-sm font-bold text-white">Bomba de pistones axiales Kawasaki K3V (350 Bar)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Homologado para canteras y minería en R.D.</span>
            <span className="text-amber-400 font-bold">Página 2 de 4</span>
          </div>
        </div>
      )
    },
    // Page 2: Financial & Warranty
    {
      title: 'GARANTÍA TMD & CORRIDA BANCARIA ESTIMADA',
      tag: 'CONDICIONES COMERCIALES',
      content: (
        <div className="flex flex-col h-full justify-between p-6 bg-zinc-950 text-white font-mono">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black text-white uppercase">GARANTÍA & CONDICIONES</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">VALOR DE VENTA BASE:</span>
                <span className="text-xl font-black text-amber-400">US$ {machine.basePriceUsd.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Incluye flete e importación nacional</span>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">COBERTURA DE GARANTÍA OFICIAL:</span>
                <span className="text-sm font-bold text-emerald-400">{machine.warrantyMonths ? `${machine.warrantyMonths} Meses de Garantía` : '2 Años o 3,000 Horas'}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">Respaldado por el Taller Central Km 22 y guardia móvil</p>
              </div>

              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-[3px]">
                <span className="text-[10px] text-zinc-400 block">BANCOS ASOCIADOS PARA LEASING:</span>
                <span className="text-xs font-bold text-white">Banco Popular · BHD León · Banco Agrícola</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Comprobante Fiscal B01 disponible</span>
            <span className="text-amber-400 font-bold">Página 3 de 4</span>
          </div>
        </div>
      )
    },
    // Page 3: Telematics & Dispatch
    {
      title: 'TELEMETRÍA SATELITAL & CENTRO DE ATENCIÓN',
      tag: 'SOPORTE 24/7',
      content: (
        <div className="flex flex-col h-full justify-between p-6 bg-zinc-950 text-white font-mono text-center">
          <div>
            <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-black text-white uppercase font-display">TMD LIVE TELEMATICS</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Cada unidad cuenta con módulo GPS/Cellular para monitoreo remoto de consumo y alertas predictivas.
            </p>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-[4px] text-left text-xs space-y-2 mb-4">
              <p><span className="text-zinc-400 font-bold">Teléfono PBX:</span> +1 (809) 560-1234</p>
              <p><span className="text-zinc-400 font-bold">WhatsApp Ventas:</span> +1 (809) 560-1234</p>
              <p><span className="text-zinc-400 font-bold">Ubicación:</span> Km 22, Autopista Duarte, Sto. Dgo. Oeste</p>
            </div>
          </div>

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-[3px] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>DESCARGAR DOSSIER FORMAL EN PDF</span>
            </button>
          )}

          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
            <span>Tecnomaquinarias Diesel S.R.L.</span>
            <span className="text-amber-400 font-bold">Página 4 de 4</span>
          </div>
        </div>
      )
    }
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-mono select-none">
      <div className="relative w-full max-w-xl h-[560px] bg-zinc-900 border-2 border-zinc-700 rounded-[6px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-white uppercase font-display">
              VISOR 3D FOLLETO TÉCNICO · {machine.brand}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[3px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Page View Container */}
        <div className="flex-1 relative overflow-hidden bg-black" style={{ perspective: '1200px' }}>
          <div 
            key={currentPage}
            className="w-full h-full transition-all duration-500 transform-gpu animate-in fade-in"
          >
            {pages[currentPage].content}
          </div>
        </div>

        {/* Bottom Page Navigation Bar */}
        <div className="flex items-center justify-between bg-zinc-950 px-4 py-2.5 border-t border-zinc-800 text-xs">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ANTERIOR</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentPage === idx ? 'w-5 bg-amber-400' : 'bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
            disabled={currentPage === pages.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors cursor-pointer"
          >
            <span>SIGUIENTE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
