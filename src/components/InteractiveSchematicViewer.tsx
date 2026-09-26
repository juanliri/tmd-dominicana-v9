import React, { useState } from 'react';
import { 
  Crosshair, 
  Layers, 
  Wrench, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShoppingCart, 
  ShieldCheck, 
  SlidersHorizontal, 
  ArrowRight,
  X,
  Clock,
  CheckCircle2,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { SCHEMATIC_MACHINES, SchematicMachine } from '../data/schematics';
import { PARTS_DATA } from '../data/parts';
import { MachineAssembly, AssemblyType, Part } from '../types';
import { useCart } from '../context/CartContext';
import { SchematicSkeleton } from './skeletons/SchematicSkeleton';

interface InteractiveSchematicViewerProps {
  selectedAssemblyId: AssemblyType | null;
  onSelectAssembly: (assemblyId: AssemblyType | null) => void;
  onSelectPartDetail?: (part: Part) => void;
}

export const InteractiveSchematicViewer: React.FC<InteractiveSchematicViewerProps> = ({
  selectedAssemblyId,
  onSelectAssembly,
  onSelectPartDetail
}) => {
  const { addToCart, formatPrice } = useCart();
  const [selectedMachineId, setSelectedMachineId] = useState<string>('liugong-922e');
  const [hoveredAssemblyId, setHoveredAssemblyId] = useState<AssemblyType | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [addedPartId, setAddedPartId] = useState<string | null>(null);
  const [isLoadingBlueprint, setIsLoadingBlueprint] = useState<boolean>(false);

  const handleSelectMachine = (id: string) => {
    if (id === selectedMachineId) return;
    setIsLoadingBlueprint(true);
    setSelectedMachineId(id);
    onSelectAssembly(null);
    setTimeout(() => setIsLoadingBlueprint(false), 260);
  };

  if (isLoadingBlueprint) {
    return <SchematicSkeleton />;
  }

  const activeMachine: SchematicMachine = 
    SCHEMATIC_MACHINES.find(m => m.id === selectedMachineId) || SCHEMATIC_MACHINES[0];

  const activeAssembly: MachineAssembly | undefined = 
    activeMachine.assemblies.find(a => a.id === selectedAssemblyId);

  // Associated parts for the selected assembly
  const assemblyParts = activeAssembly 
    ? PARTS_DATA.filter(p => activeAssembly.associatedPartIds.includes(p.id) || p.assemblyId === activeAssembly.id)
    : [];

  const handleAddToCart = (e: React.MouseEvent, part: Part) => {
    e.stopPropagation();
    addToCart(part, 1);
    setAddedPartId(part.id);
    setTimeout(() => setAddedPartId(null), 1800);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(0.85, +(prev + delta).toFixed(2)), 1.4));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-xl overflow-hidden mb-8 transition-all font-mono">
      {/* Top Bar: Title & Machine Selector */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Crosshair className="w-3 h-3 text-amber-400" />
            <span>Visor Técnico Interactivo • Despiece OEM</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
            <span>Esquema Cinemático & Localizador de Ensambles</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[2px] bg-zinc-800 text-amber-400 border border-zinc-700">
              CAD 2D
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Haga clic sobre cualquier componente o número de llamada para filtrar repuestos compatibles y verificar stock en el Km 22.
          </p>
        </div>

        {/* Machine Switcher Dropdown / Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-zinc-400 uppercase">Equipo:</span>
          <div className="flex bg-zinc-950 p-1 rounded-[2px] border border-zinc-800 gap-1">
            {SCHEMATIC_MACHINES.map((machine) => {
              const isSelected = machine.id === selectedMachineId;
              return (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => handleSelectMachine(machine.id)}
                  className={`px-2.5 py-1 rounded-[2px] text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-400 text-black font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {machine.name.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assembly Navigation Strip */}
      <div className="px-4 sm:px-5 py-2 bg-zinc-950/80 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 shrink-0 uppercase">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Ensambles:</span>
        </span>

        <button
          type="button"
          onClick={() => onSelectAssembly(null)}
          className={`px-2.5 py-1 rounded-[2px] text-xs font-bold shrink-0 transition-colors cursor-pointer uppercase ${
            selectedAssemblyId === null
              ? 'bg-amber-400 text-black font-black'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
          }`}
        >
          Vista General (Todos)
        </button>

        {activeMachine.assemblies.map((assembly) => {
          const isSelected = selectedAssemblyId === assembly.id;
          const isHovered = hoveredAssemblyId === assembly.id;
          const partCount = PARTS_DATA.filter(
            p => assembly.associatedPartIds.includes(p.id) || p.assemblyId === assembly.id
          ).length;

          return (
            <button
              key={assembly.id}
              type="button"
              onClick={() => onSelectAssembly(isSelected ? null : assembly.id)}
              onMouseEnter={() => setHoveredAssemblyId(assembly.id)}
              onMouseLeave={() => setHoveredAssemblyId(null)}
              className={`px-2.5 py-1 rounded-[2px] text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer uppercase ${
                isSelected
                  ? 'bg-amber-400 text-black font-black'
                  : isHovered
                  ? 'bg-zinc-800 text-amber-400 border border-amber-400/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center text-[9px] font-mono font-bold ${
                isSelected ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {assembly.calloutNumber}
              </span>
              <span>{assembly.name}</span>
              <span className={`text-[9px] px-1 rounded-[2px] ${
                isSelected ? 'bg-black/20 text-black font-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {partCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Canvas & Schematic Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left: Schematic Blueprint Graphic */}
        <div className={`lg:col-span-8 p-4 sm:p-6 bg-zinc-950 text-white relative flex flex-col justify-between overflow-hidden min-h-[380px] sm:min-h-[460px] ${
          isExpanded ? 'lg:col-span-12' : ''
        }`}>
          {/* Subtle Technical Grid Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Blueprint Header / Specs watermark */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-200 font-bold">{activeMachine.name}</span>
              <span className="text-zinc-500 hidden sm:inline">• {activeMachine.modelCode}</span>
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-[2px] border border-zinc-800">
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                title="Aumentar Zoom"
                className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-1 font-mono text-zinc-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                title="Reducir Zoom"
                className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                title="Restablecer Escala"
                className="p-1 rounded-[2px] hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Contraer Visor' : 'Expandir Visor'}
                className="p-1 rounded-[2px] hover:bg-zinc-800 text-amber-400 hover:text-amber-300 cursor-pointer ml-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Diagram Canvas with Hotspots */}
          <div className="relative z-10 my-auto py-6 flex items-center justify-center overflow-hidden">
            <div 
              className="relative w-full max-w-2xl aspect-[16/9] transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Vector Blueprint Drawing */}
              {selectedMachineId === 'liugong-922e' && (
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full drop-shadow-2xl select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid Crosshairs */}
                  <line x1="20" y1="420" x2="780" y2="420" stroke="#52525b" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Ground Level */}
                  <line x1="10" y1="410" x2="790" y2="410" stroke="#3f3f46" strokeWidth="2" />

                  {/* UNDERCARRIAGE (Tren de Rodaje) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'undercarriage' ? null : 'undercarriage')}
                    onMouseEnter={() => setHoveredAssemblyId('undercarriage')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Track Frame & Shoes */}
                    <rect 
                      x="160" y="320" width="380" height="75" rx="36" 
                      fill="#18181b" 
                      stroke={selectedAssemblyId === 'undercarriage' ? '#f59e0b' : hoveredAssemblyId === 'undercarriage' ? '#fbbf24' : '#52525b'} 
                      strokeWidth={selectedAssemblyId === 'undercarriage' ? 3 : 2} 
                    />
                    {/* Track Chain segments */}
                    <path d="M 180 320 L 520 320" stroke="#71717a" strokeWidth="6" strokeDasharray="12 4" />
                    <path d="M 180 395 L 520 395" stroke="#71717a" strokeWidth="6" strokeDasharray="12 4" />
                    {/* Sprocket Rear */}
                    <circle cx="190" cy="358" r="28" fill="#27272a" stroke="#a1a1aa" strokeWidth="2" />
                    <circle cx="190" cy="358" r="10" fill="#f59e0b" />
                    {/* Idler Front */}
                    <circle cx="510" cy="358" r="28" fill="#27272a" stroke="#a1a1aa" strokeWidth="2" />
                    <circle cx="510" cy="358" r="10" fill="#71717a" />
                    {/* Bottom Rollers */}
                    <circle cx="260" cy="378" r="14" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                    <circle cx="320" cy="378" r="14" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                    <circle cx="380" cy="378" r="14" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                    <circle cx="440" cy="378" r="14" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                    {/* Top Carrier Rollers */}
                    <circle cx="300" cy="330" r="10" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                    <circle cx="400" cy="330" r="10" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
                  </g>

                  {/* UPPERSTRUCTURE / SWING TABLE */}
                  <rect x="220" y="300" width="220" height="24" rx="4" fill="#27272a" stroke="#71717a" strokeWidth="1.5" />

                  {/* COUNTERWEIGHT & ENGINE COMPARTMENT (Powertrain) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'powertrain' ? null : 'powertrain')}
                    onMouseEnter={() => setHoveredAssemblyId('powertrain')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Counterweight rear */}
                    <path 
                      d="M 140 300 L 140 210 Q 150 180 190 180 L 260 180 L 260 300 Z" 
                      fill="#27272a" 
                      stroke={selectedAssemblyId === 'powertrain' ? '#f59e0b' : hoveredAssemblyId === 'powertrain' ? '#fbbf24' : '#71717a'} 
                      strokeWidth={selectedAssemblyId === 'powertrain' ? 3 : 2} 
                    />
                    {/* Engine Hood Louvers */}
                    <line x1="165" y1="205" x2="235" y2="205" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="165" y1="215" x2="235" y2="215" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="165" y1="225" x2="235" y2="225" stroke="#f59e0b" strokeWidth="2" />
                    {/* Exhaust Pipe Stack */}
                    <rect x="200" y="145" width="12" height="36" rx="2" fill="#71717a" stroke="#a1a1aa" strokeWidth="1.5" />
                    <line x1="195" y1="145" x2="217" y2="145" stroke="#e4e4e7" strokeWidth="2" />
                  </g>

                  {/* HYDRAULIC MAIN PUMPS & VALVE BLOCK (Hydraulics) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'hydraulics' ? null : 'hydraulics')}
                    onMouseEnter={() => setHoveredAssemblyId('hydraulics')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Center body module */}
                    <rect 
                      x="260" y="200" width="85" height="100" rx="6" 
                      fill="#18181b" 
                      stroke={selectedAssemblyId === 'hydraulics' ? '#f59e0b' : hoveredAssemblyId === 'hydraulics' ? '#fbbf24' : '#71717a'} 
                      strokeWidth={selectedAssemblyId === 'hydraulics' ? 3 : 2} 
                    />
                    {/* Hydraulic pump symbols / lines */}
                    <circle cx="302" cy="245" r="16" fill="#27272a" stroke="#38bdf8" strokeWidth="2" />
                    <path d="M 292 245 L 312 245 M 302 235 L 302 255" stroke="#38bdf8" strokeWidth="2" />
                    {/* Hydraulic hoses */}
                    <path d="M 315 235 Q 360 190 400 170" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                  </g>

                  {/* OPERATOR CABIN (Cab & Electric) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'cab_electric' ? null : 'cab_electric')}
                    onMouseEnter={() => setHoveredAssemblyId('cab_electric')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Cab structure */}
                    <path 
                      d="M 345 300 L 345 150 Q 350 140 370 140 L 415 140 L 435 190 L 435 300 Z" 
                      fill="#27272a" 
                      stroke={selectedAssemblyId === 'cab_electric' ? '#f59e0b' : hoveredAssemblyId === 'cab_electric' ? '#fbbf24' : '#71717a'} 
                      strokeWidth={selectedAssemblyId === 'cab_electric' ? 3 : 2} 
                    />
                    {/* Cab Window Glass */}
                    <path 
                      d="M 360 155 L 405 155 L 422 195 L 360 195 Z" 
                      fill="#0284c7" 
                      fillOpacity="0.35" 
                      stroke="#38bdf8" 
                      strokeWidth="1.5" 
                    />
                    {/* Operator seat & joystick silhouette */}
                    <rect x="370" y="210" width="14" height="25" rx="3" fill="#52525b" />
                    <line x1="390" y1="215" x2="390" y2="230" stroke="#f59e0b" strokeWidth="2" />
                  </g>

                  {/* BOOM, ARM & BUCKET (Desgaste y Balde) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'boom_bucket' ? null : 'boom_bucket')}
                    onMouseEnter={() => setHoveredAssemblyId('boom_bucket')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Main Curved Boom */}
                    <path 
                      d="M 410 270 Q 480 120 590 100 Q 560 135 440 290 Z" 
                      fill="#d97706" 
                      stroke={selectedAssemblyId === 'boom_bucket' ? '#f59e0b' : hoveredAssemblyId === 'boom_bucket' ? '#fbbf24' : '#b45309'} 
                      strokeWidth={selectedAssemblyId === 'boom_bucket' ? 3 : 2} 
                    />
                    {/* Boom Pivot Pin */}
                    <circle cx="420" cy="275" r="7" fill="#18181b" stroke="#e4e4e7" strokeWidth="2" />

                    {/* Boom Hydraulic Cylinder */}
                    <line x1="390" y1="290" x2="480" y2="170" stroke="#e4e4e7" strokeWidth="7" strokeLinecap="round" />
                    <line x1="480" y1="170" x2="520" y2="120" stroke="#71717a" strokeWidth="4" strokeLinecap="round" />

                    {/* Stick / Dipper Arm */}
                    <path 
                      d="M 590 100 L 680 230 L 660 240 L 575 115 Z" 
                      fill="#d97706" 
                      stroke={selectedAssemblyId === 'boom_bucket' ? '#f59e0b' : hoveredAssemblyId === 'boom_bucket' ? '#fbbf24' : '#b45309'} 
                      strokeWidth="2" 
                    />
                    {/* Stick Joint Pin */}
                    <circle cx="585" cy="108" r="6" fill="#18181b" stroke="#e4e4e7" strokeWidth="2" />

                    {/* Bucket Cylinder */}
                    <line x1="560" y1="110" x2="635" y2="175" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
                    <line x1="635" y1="175" x2="665" y2="205" stroke="#71717a" strokeWidth="3" strokeLinecap="round" />

                    {/* Excavator Bucket */}
                    <path 
                      d="M 680 230 Q 725 240 735 295 Q 675 320 645 270 Z" 
                      fill="#27272a" 
                      stroke={selectedAssemblyId === 'boom_bucket' ? '#f59e0b' : hoveredAssemblyId === 'boom_bucket' ? '#fbbf24' : '#a1a1aa'} 
                      strokeWidth={selectedAssemblyId === 'boom_bucket' ? 3 : 2} 
                    />
                    {/* Heavy Duty Bucket Teeth (Puntas HD) */}
                    <polygon points="735,295 765,305 745,315" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                    <polygon points="730,285 760,295 740,305" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                    <polygon points="725,275 755,285 735,295" fill="#f59e0b" stroke="#000" strokeWidth="1" />
                  </g>
                </svg>
              )}

              {/* Vector Blueprint Drawing: JCB 3CX Eco */}
              {selectedMachineId === 'jcb-3cx' && (
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full drop-shadow-2xl select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="10" y1="410" x2="790" y2="410" stroke="#3f3f46" strokeWidth="2" />

                  {/* Rear Backhoe Boom & Bucket */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'boom_bucket' ? null : 'boom_bucket')}
                    onMouseEnter={() => setHoveredAssemblyId('boom_bucket')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Kingpost pivot */}
                    <rect x="230" y="270" width="25" height="50" rx="4" fill="#27272a" stroke="#71717a" strokeWidth="2" />
                    {/* Curved backhoe boom */}
                    <path 
                      d="M 235 280 Q 140 220 120 120 Q 150 140 230 300 Z" 
                      fill="#d97706" 
                      stroke={selectedAssemblyId === 'boom_bucket' ? '#f59e0b' : '#b45309'} 
                      strokeWidth={selectedAssemblyId === 'boom_bucket' ? 3 : 2} 
                    />
                    {/* Dipper stick */}
                    <path d="M 120 120 L 80 230 L 100 240 L 135 135 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                    {/* Trencher bucket */}
                    <path d="M 80 230 Q 50 250 50 290 Q 90 295 100 255 Z" fill="#27272a" stroke="#f59e0b" strokeWidth="2" />
                    {/* Teeth */}
                    <polygon points="50,290 35,305 55,305" fill="#f59e0b" />
                    <polygon points="60,292 48,308 68,308" fill="#f59e0b" />
                  </g>

                  {/* Chassis & Transmission 4WD */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'transmission' ? null : 'transmission')}
                    onMouseEnter={() => setHoveredAssemblyId('transmission')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <rect x="250" y="290" width="280" height="35" rx="6" fill="#18181b" stroke="#71717a" strokeWidth="2" />
                    {/* Rear Large Wheel */}
                    <circle cx="295" cy="340" r="65" fill="#27272a" stroke="#52525b" strokeWidth="4" />
                    <circle cx="295" cy="340" r="32" fill="#f59e0b" stroke="#18181b" strokeWidth="3" />
                    {/* Front Wheel */}
                    <circle cx="510" cy="355" r="50" fill="#27272a" stroke="#52525b" strokeWidth="4" />
                    <circle cx="510" cy="355" r="24" fill="#f59e0b" stroke="#18181b" strokeWidth="3" />
                  </g>

                  {/* Engine Hood & Filters */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'powertrain' ? null : 'powertrain')}
                    onMouseEnter={() => setHoveredAssemblyId('powertrain')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <path 
                      d="M 430 290 L 430 220 Q 480 220 550 255 L 550 290 Z" 
                      fill="#d97706" 
                      stroke={selectedAssemblyId === 'powertrain' ? '#f59e0b' : '#b45309'} 
                      strokeWidth="2" 
                    />
                    <line x1="450" y1="240" x2="520" y2="240" stroke="#18181b" strokeWidth="2" />
                    <line x1="455" y1="250" x2="525" y2="250" stroke="#18181b" strokeWidth="2" />
                    {/* Exhaust stack */}
                    <rect x="440" y="170" width="10" height="50" rx="2" fill="#71717a" />
                  </g>

                  {/* Cab Center */}
                  <path d="M 330 290 L 330 160 Q 370 150 430 150 L 430 290 Z" fill="#27272a" stroke="#71717a" strokeWidth="2" />
                  <rect x="345" y="170" width="70" height="55" rx="4" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" />

                  {/* Front Loader Arms & Hydraulics */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'hydraulics' ? null : 'hydraulics')}
                    onMouseEnter={() => setHoveredAssemblyId('hydraulics')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <path d="M 380 260 L 590 280 L 640 330 L 610 340 L 380 275 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="420" y1="280" x2="540" y2="270" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
                    {/* 4 in 1 Clam Front Bucket */}
                    <path d="M 640 310 Q 720 315 710 380 Q 640 385 635 340 Z" fill="#27272a" stroke="#f59e0b" strokeWidth="2" />
                  </g>
                </svg>
              )}

              {/* Vector Blueprint Drawing: LiuGong CLG856H Wheel Loader */}
              {selectedMachineId === 'liugong-856h' && (
                <svg
                  viewBox="0 0 800 450"
                  className="w-full h-full drop-shadow-2xl select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="10" y1="410" x2="790" y2="410" stroke="#3f3f46" strokeWidth="2" />

                  {/* Rear Engine Compartment (Powertrain) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'powertrain' ? null : 'powertrain')}
                    onMouseEnter={() => setHoveredAssemblyId('powertrain')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <path 
                      d="M 140 310 L 140 215 Q 160 185 240 185 L 320 185 L 320 310 Z" 
                      fill="#27272a" 
                      stroke={selectedAssemblyId === 'powertrain' ? '#f59e0b' : '#71717a'} 
                      strokeWidth={selectedAssemblyId === 'powertrain' ? 3 : 2} 
                    />
                    <line x1="160" y1="210" x2="220" y2="210" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="160" y1="220" x2="220" y2="220" stroke="#f59e0b" strokeWidth="2" />
                    <rect x="250" y="145" width="14" height="40" rx="3" fill="#71717a" />
                  </g>

                  {/* Transmission ZF & Articulated Chassis */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'transmission' ? null : 'transmission')}
                    onMouseEnter={() => setHoveredAssemblyId('transmission')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    {/* Rear Wheel */}
                    <circle cx="230" cy="335" r="70" fill="#27272a" stroke="#52525b" strokeWidth="5" />
                    <circle cx="230" cy="335" r="35" fill="#f59e0b" stroke="#18181b" strokeWidth="4" />
                    {/* Front Wheel */}
                    <circle cx="490" cy="335" r="70" fill="#27272a" stroke="#52525b" strokeWidth="5" />
                    <circle cx="490" cy="335" r="35" fill="#f59e0b" stroke="#18181b" strokeWidth="4" />
                    {/* Center Articulation Joint */}
                    <rect x="345" y="270" width="30" height="45" rx="5" fill="#d97706" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="360" cy="292" r="7" fill="#18181b" stroke="#e4e4e7" strokeWidth="2" />
                  </g>

                  {/* Operator Cab */}
                  <path d="M 310 270 L 320 150 Q 350 140 400 140 L 415 270 Z" fill="#27272a" stroke="#71717a" strokeWidth="2" />
                  <polygon points="330,160 395,160 405,215 330,215" fill="#0284c7" fillOpacity="0.35" stroke="#38bdf8" />

                  {/* Front Lift Arms, Z-Bar Linkage & Hydraulics */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'hydraulics' ? null : 'hydraulics')}
                    onMouseEnter={() => setHoveredAssemblyId('hydraulics')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <line x1="410" y1="280" x2="560" y2="240" stroke="#d97706" strokeWidth="16" strokeLinecap="round" />
                    <line x1="440" y1="290" x2="530" y2="250" stroke="#e4e4e7" strokeWidth="7" strokeLinecap="round" />
                  </g>

                  {/* Quarry Bucket 3.0m³ (Boom & Bucket) */}
                  <g 
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => onSelectAssembly(selectedAssemblyId === 'boom_bucket' ? null : 'boom_bucket')}
                    onMouseEnter={() => setHoveredAssemblyId('boom_bucket')}
                    onMouseLeave={() => setHoveredAssemblyId(null)}
                  >
                    <path 
                      d="M 590 250 L 690 265 Q 730 275 735 345 L 615 365 Q 580 320 590 250 Z" 
                      fill="#27272a" 
                      stroke={selectedAssemblyId === 'boom_bucket' ? '#f59e0b' : '#a1a1aa'} 
                      strokeWidth={selectedAssemblyId === 'boom_bucket' ? 3 : 2} 
                    />
                    {/* Bolt-on Edge / Bucket Teeth */}
                    <polygon points="735,345 765,355 745,365" fill="#f59e0b" />
                    <polygon points="730,335 760,345 740,355" fill="#f59e0b" />
                  </g>
                </svg>
              )}

              {/* INTERACTIVE HOTSPOT PINS */}
              {activeMachine.assemblies.map((assembly) => {
                const isSelected = selectedAssemblyId === assembly.id;
                const isHovered = hoveredAssemblyId === assembly.id;

                return (
                  <div
                    key={assembly.id}
                    style={{
                      left: `${assembly.hotspot.x}%`,
                      top: `${assembly.hotspot.y}%`
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                  >
                    {/* Pulsing Beacon Circle */}
                    <div
                      onClick={() => onSelectAssembly(isSelected ? null : assembly.id)}
                      onMouseEnter={() => setHoveredAssemblyId(assembly.id)}
                      onMouseLeave={() => setHoveredAssemblyId(null)}
                      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-[2px] flex items-center justify-center cursor-pointer transition-transform duration-200 border ${
                        isSelected
                          ? 'scale-110 border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-black'
                          : isHovered
                          ? 'scale-105 border-amber-400 bg-zinc-900 text-amber-400'
                          : 'bg-zinc-950 text-amber-400 border-zinc-700 hover:border-amber-400 hover:bg-zinc-900'
                      }`}
                    >
                      {/* Pulse effect */}
                      {!isSelected && (
                        <span className="absolute inset-0 rounded-[2px] bg-amber-400/20 animate-ping pointer-events-none" />
                      )}
                      <span className="font-mono font-black text-xs">
                        {String(assembly.calloutNumber).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Floating Tooltip preview on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30 font-mono">
                      <div className="bg-zinc-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-[2px] border border-amber-400/40 shadow-xl flex items-center gap-1.5 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{assembly.name}</span>
                        <span className="text-zinc-500 font-normal">
                          ({assembly.associatedPartIds.length} repuestos)
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-zinc-950 border-r border-b border-amber-400/40 rotate-45 -mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blueprint Footer Strip */}
          <div className="relative z-10 pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 uppercase">
                <span className="w-2 h-2 rounded-[1px] bg-amber-400 inline-block" />
                <strong className="text-zinc-200">Pins Activos:</strong> Clic para aislar ensamble
              </span>
              <span className="hidden sm:inline text-zinc-700">•</span>
              <span className="hidden sm:inline uppercase text-[10px] text-zinc-500">
                Certificación ISO 9001 / Estándares OEM
              </span>
            </div>

            {selectedAssemblyId && (
              <button
                type="button"
                onClick={() => onSelectAssembly(null)}
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold cursor-pointer uppercase text-[11px]"
              >
                <X className="w-3.5 h-3.5" />
                <span>Restablecer componentes</span>
              </button>
            )}
          </div>
        </div>

        {/* Right / Exploded Assembly Detail Drawer */}
        <div className={`lg:col-span-4 p-4 sm:p-5 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between font-mono ${
          isExpanded ? 'hidden' : ''
        }`}>
          {activeAssembly ? (
            <div className="space-y-4">
              {/* Assembly Header Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[10px] font-mono font-bold uppercase">
                    <span>CALLOUT #{activeAssembly.calloutNumber}</span>
                    <span>•</span>
                    <span>{activeAssembly.category}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectAssembly(null)}
                    className="p-1 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 cursor-pointer"
                    title="Cerrar filtro de ensamble"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight uppercase">
                  {activeAssembly.name}
                </h3>
              </div>

              {/* Assembly Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">
                {activeAssembly.description}
              </p>

              {/* Maintenance Specs Mini-Box */}
              <div className="bg-zinc-900 p-3 rounded-[2px] border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-200 block uppercase text-[10px]">Intervalo de Servicio:</span>
                    <span className="text-zinc-400 text-xs">{activeAssembly.maintenanceInterval}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1.5 border-t border-zinc-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-200 block uppercase text-[10px]">Pauta de Inspección en Obra:</span>
                    <span className="text-zinc-400 text-xs">{activeAssembly.recommendedInspection}</span>
                  </div>
                </div>
              </div>

              {/* Assembly Parts List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Repuestos Asociados ({assemblyParts.length}):
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                    Stock en Km 22
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {assemblyParts.map((part) => {
                    const isAdded = addedPartId === part.id;
                    return (
                      <div
                        key={part.id}
                        onClick={() => onSelectPartDetail && onSelectPartDetail(part)}
                        className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 hover:border-amber-400/60 transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={part.image}
                            alt={part.name}
                            className="w-10 h-10 rounded-[2px] object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                          />
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono font-bold text-amber-400 uppercase">
                              {part.partNumber}
                            </div>
                            <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-amber-400 transition-colors uppercase">
                              {part.name}
                            </div>
                            <div className="text-[11px] font-bold text-white">
                              {formatPrice(part.priceUsd)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, part)}
                          className={`p-1.5 rounded-[2px] shrink-0 transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-400 hover:bg-amber-300 text-black font-bold'
                          }`}
                          title="Agregar al Carrito"
                        >
                          {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <div className="w-12 h-12 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center mb-3">
                <Crosshair className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase mb-1">
                Seleccione un Ensamble en el Esquema
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-4">
                Toque cualquiera de los marcadores numerados del plano técnico ({activeMachine.assemblies.map(a => `#${a.calloutNumber}`).join(', ')}) para ver el desglose mecánico y filtrar sus partes OEM.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {activeMachine.assemblies.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelectAssembly(a.id)}
                    className="text-[10px] px-2 py-0.5 rounded-[2px] bg-zinc-900 text-zinc-300 hover:bg-amber-400 hover:text-black font-bold uppercase transition-colors cursor-pointer border border-zinc-800"
                  >
                    #{a.calloutNumber} {a.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Support / Parts Desk Info */}
          <div className="mt-4 pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 uppercase">
            <span>¿Dudas con el P/N?</span>
            <a
              href="https://wa.me/18095601234?text=Hola%20TMD,%20necesito%20identificar%20un%20repuesto%20por%20número%20de%20serie"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-bold hover:underline"
            >
              Consultar Técnico →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
