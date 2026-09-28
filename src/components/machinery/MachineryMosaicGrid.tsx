import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { 
  Scale, 
  RotateCw, 
  QrCode, 
  Sliders, 
  Calculator, 
  Check, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  HardHat,
  Truck,
  Download
} from 'lucide-react';
import { Machine } from '../../types';
import { downloadProductQrCode } from '../../utils/qrExporter';
import { LastScannedBadge } from '../common/LastScannedBadge';
import { RecentlyVerifiedBadge } from '../common/RecentlyVerifiedBadge';
import { AvailabilityBadge } from '../common/AvailabilityBadge';

export type MosaicLayoutMode = 'mosaic' | 'uniform';

const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.02,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface MachineCardProps {
  machine: Machine;
  comparing: boolean;
  isFeatured: boolean;
  toggleMachineCompare: (id: string) => void;
  handleOpenSpecs: (machine: Machine) => void;
  setActive360Machine: (machine: Machine) => void;
  setActive360Tab: (tab: '360' | 'video' | 'gallery' | 'dimensions') => void;
  setQrModalMachine: (machine: Machine) => void;
  setCustomizerMachine: (machine: Machine) => void;
  setCalculatorMachine: (machine: Machine) => void;
  addMachineToQuote: (machine: Machine) => void;
  onNavigate: (route: string) => void;
  formatEquiposPrice: (usd: number) => string;
  showMonthlyLeasing?: boolean;
  getMonthlyLeasingEstimate: (usd: number) => string;
}

export const MachineCard = React.memo<MachineCardProps>(({
  machine,
  comparing,
  isFeatured,
  toggleMachineCompare,
  handleOpenSpecs,
  setActive360Machine,
  setActive360Tab,
  setQrModalMachine,
  setCustomizerMachine,
  setCalculatorMachine,
  addMachineToQuote,
  onNavigate,
  formatEquiposPrice,
  showMonthlyLeasing = true,
  getMonthlyLeasingEstimate
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div
      className="perspective-1200 w-full"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        variants={cardVariants}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', machine.id);
          e.dataTransfer.setData('machine-id', machine.id);
        }}
        style={{
          transform: isHovered 
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.012, 1.012, 1.012)` 
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="relative bg-zinc-950 rounded-[5px] border border-zinc-800 hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 transition-colors duration-300 flex flex-col justify-between group overflow-hidden machinery-3d-tilt cursor-grab active:cursor-grabbing"
      >
        {/* Metallic Sheen Glare Reflection */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 rounded-[5px]"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(251, 191, 36, 0.12) 0%, rgba(255, 255, 255, 0.05) 35%, transparent 70%)`
            }}
          />
        )}
        {/* Top Image Container with Consistent Aspect Ratio */}
      <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden shrink-0">
        <img
          src={machine.image}
          alt={machine.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('tmd_coming_soon')) {
              target.src = '/images/tmd_coming_soon.jpg';
            }
          }}
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />

        {/* Top Left: Brand Pill & Year */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 font-mono flex-wrap max-w-[75%]">
          <span className="bg-zinc-950/95 backdrop-blur-md px-2 py-0.5 rounded-[4px] text-[10px] font-black text-amber-400 border border-zinc-700 shadow-md uppercase">
            {machine.brand}
          </span>
          <span className="bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-zinc-300 border border-zinc-800">
            {machine.year}
          </span>
          {isFeatured && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider shadow-md">
              <Zap className="w-2.5 h-2.5 fill-black" />
              <span>2026</span>
            </span>
          )}
          <RecentlyVerifiedBadge
            itemId={machine.id}
            itemCode={machine.modelCode}
            itemType="machinery"
            variant="card-badge"
          />
        </div>

        {/* Top Right: Category & Compare Action */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 font-mono">
          <span className="bg-zinc-900/90 backdrop-blur-md px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider text-zinc-300 border border-zinc-800 shadow-md truncate max-w-[120px]">
            {machine.category}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMachineCompare(machine.id);
            }}
            className={`backdrop-blur-md px-2 py-0.5 rounded-[4px] text-[10px] font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer ${
              comparing
                ? 'bg-amber-500 text-black font-black'
                : 'bg-zinc-950/90 text-zinc-200 hover:text-amber-400 border border-zinc-700'
            }`}
            title={comparing ? 'Remover de comparación' : 'Agregar a comparación técnica'}
          >
            <Scale className="w-3 h-3" />
            <span>{comparing ? '✓' : '+'}</span>
          </button>
        </div>

        {/* Bottom Left: 360° & Video View */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActive360Tab('360');
            setActive360Machine(machine);
          }}
          className="absolute bottom-2.5 left-2.5 bg-zinc-950/90 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-[4px] text-[10px] font-mono font-black uppercase tracking-wider border border-zinc-700 hover:border-amber-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-md z-10"
        >
          <RotateCw className="w-3 h-3 text-amber-400 animate-spin-slow" />
          <span>360° & VIDEO</span>
        </button>

        {/* Bottom Right: Stock Availability Tag */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 font-mono">
          <LastScannedBadge
            itemId={machine.id}
            itemCode={machine.modelCode}
            itemType="machinery"
            compact={true}
            showEmptyState={false}
          />
          <AvailabilityBadge
            status={machine.inStock ? 'immediate' : (machine.year >= 2025 ? 'transit' : 'factory_order')}
            variant="card-compact"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Model Code */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3 className="text-sm sm:text-base font-black font-display tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
              {machine.name}
            </h3>
            <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-[4px]">
              MOD. {machine.modelCode}
            </span>
          </div>

          {/* Real-time Recently Verified Status Indicator (<24h) */}
          <div className="mb-2">
            <RecentlyVerifiedBadge
              itemId={machine.id}
              itemCode={machine.modelCode}
              itemType="machinery"
              variant="pill"
            />
          </div>

          {/* Description */}
          <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {machine.description}
          </p>

          {/* Technical Specs Tags Strip */}
          <div className="grid grid-cols-2 gap-2 mb-3 font-mono">
            <div className="bg-zinc-900/90 p-2 rounded-[4px] text-center border border-zinc-800">
              <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">POTENCIA</span>
              <span className="text-xs font-black text-white">
                {machine.powerHp} HP
              </span>
            </div>
            <div className="bg-zinc-900/90 p-2 rounded-[4px] text-center border border-zinc-800">
              <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider">PESO OPERATIVO</span>
              <span className="text-xs font-black text-white">
                {machine.operatingWeightKg.toLocaleString()} KG
              </span>
            </div>
          </div>

          {/* Investment & Leasing Strip */}
          <div className="py-2.5 px-3 rounded-[4px] bg-zinc-900/95 border border-zinc-800 mb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold block">INVERSIÓN DESDE</span>
              <span className="font-extrabold text-sm sm:text-base text-white font-mono">
                {formatEquiposPrice(machine.basePriceUsd)}
              </span>
            </div>
            {showMonthlyLeasing && (
              <div className="text-right">
                <span className="text-[8px] text-zinc-400 font-mono font-bold uppercase tracking-wider block">LEASING RD</span>
                <span className="text-[11px] font-black font-mono text-amber-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[4px] inline-block">
                  {getMonthlyLeasingEstimate(machine.basePriceUsd)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Toolbar - Clean 2-Action Enterprise Layout (80% / 20%) */}
        <div className="pt-2.5 border-t border-zinc-800 flex items-center gap-2 font-display">
          <button
            type="button"
            onClick={() => handleOpenSpecs(machine)}
            className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-black font-black rounded-[4px] text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            title="Ver especificaciones técnicas completas, rotulado PDF, 360° y cotización"
          >
            <span>VER FICHA TÉCNICA</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => {
              addMachineToQuote(machine);
              onNavigate('#/checkout');
            }}
            className="py-2.5 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-white rounded-[4px] text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border border-zinc-800 shrink-0"
            title="Cotizar equipo inmediatamente"
          >
            COTIZAR
          </button>
        </div>
      </div>
    </motion.div>
  </div>
  );
});

MachineCard.displayName = 'MachineCard';

interface MachineryMosaicGridProps {
  machines: Machine[];
  layoutMode?: MosaicLayoutMode;
  isComparing: (id: string) => boolean;
  toggleMachineCompare: (id: string) => void;
  handleOpenSpecs: (machine: Machine) => void;
  setActive360Machine: (machine: Machine) => void;
  setActive360Tab: (tab: '360' | 'video' | 'gallery' | 'dimensions') => void;
  setQrModalMachine: (machine: Machine) => void;
  setCustomizerMachine: (machine: Machine) => void;
  setCalculatorMachine: (machine: Machine) => void;
  addMachineToQuote: (machine: Machine) => void;
  onNavigate: (route: string) => void;
  formatEquiposPrice: (usd: number) => string;
  showMonthlyLeasing?: boolean;
  getMonthlyLeasingEstimate: (usd: number) => string;
}

export const MachineryMosaicGrid = React.memo<MachineryMosaicGridProps>(({
  machines,
  layoutMode = 'mosaic',
  isComparing,
  toggleMachineCompare,
  handleOpenSpecs,
  setActive360Machine,
  setActive360Tab,
  setQrModalMachine,
  setCustomizerMachine,
  setCalculatorMachine,
  addMachineToQuote,
  onNavigate,
  formatEquiposPrice,
  showMonthlyLeasing = true,
  getMonthlyLeasingEstimate
}) => {
  return (
    <motion.div 
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch"
    >
      {machines.map((machine) => (
        <MachineCard
          key={machine.id}
          machine={machine}
          comparing={isComparing(machine.id)}
          isFeatured={Boolean(machine.featured || machine.year >= 2025)}
          toggleMachineCompare={toggleMachineCompare}
          handleOpenSpecs={handleOpenSpecs}
          setActive360Machine={setActive360Machine}
          setActive360Tab={setActive360Tab}
          setQrModalMachine={setQrModalMachine}
          setCustomizerMachine={setCustomizerMachine}
          setCalculatorMachine={setCalculatorMachine}
          addMachineToQuote={addMachineToQuote}
          onNavigate={onNavigate}
          formatEquiposPrice={formatEquiposPrice}
          showMonthlyLeasing={showMonthlyLeasing}
          getMonthlyLeasingEstimate={getMonthlyLeasingEstimate}
        />
      ))}
    </motion.div>
  );
});

MachineryMosaicGrid.displayName = 'MachineryMosaicGrid';

