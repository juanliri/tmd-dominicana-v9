import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  ArrowRight,
  Truck,
  Wrench,
  Radio,
  FileText,
  Calculator,
  Shield,
  HelpCircle,
  X,
  Sparkles,
  Phone,
  Layers,
  ChevronRight
} from 'lucide-react';
import { MACHINES_DATA } from '../../data/catalog';
import { PARTS_CATALOG_410 } from '../../data/partsCatalog410';

interface GlobalCommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onSelectMachine?: (machineId: string) => void;
}

export const GlobalCommandPaletteModal: React.FC<GlobalCommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectMachine
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'actions' | 'machines' | 'parts'>('all');

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // System quick navigation actions
  const systemActions = [
    { id: 'nav-machinery', title: 'Catálogo de Maquinarias', subtitle: 'Excavadoras, Palas, Rodillos (Ctrl+M)', icon: Truck, route: '#/machinery' },
    { id: 'nav-parts', title: 'Catálogo de Repuestos OEM', subtitle: 'Filtros, Bombas, Rodajes (Ctrl+P)', icon: Wrench, route: '#/parts' },
    { id: 'nav-telematics', title: 'Telemetría LiveLink Satelital', subtitle: 'Rastreo GPS, J1939 y Horómetros (Ctrl+T)', icon: Radio, route: '#/telematics' },
    { id: 'nav-checkout', title: 'Nueva Proforma / Carrito', subtitle: 'Cotizador oficial con ITBIS y NCF (Ctrl+Q)', icon: FileText, route: '#/checkout' },
    { id: 'nav-admin', title: 'Panel de Administración TMD', subtitle: 'Gestión de inventario y pedidos', icon: Shield, route: '#/admin' },
    { id: 'nav-portal', title: 'Portal de Clientes & Flota', subtitle: 'Historial de órdenes y mantenimiento', icon: Layers, route: '#/portal' }
  ];

  // Filter matching machines
  const matchingMachines = MACHINES_DATA.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  // Filter matching parts
  const matchingParts = PARTS_CATALOG_410.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleActionClick = (route: string) => {
    onNavigate(route);
    onClose();
  };

  const handleMachineClick = (machineId: string) => {
    if (onSelectMachine) {
      onSelectMachine(machineId);
    } else {
      onNavigate('#/machinery');
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl overflow-hidden flex flex-col text-zinc-200 font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-zinc-800 bg-zinc-900/90">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipo, repuesto, comando (ej. LiuGong 922, filtro, telemetría)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-mono"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700">
            <span>ESC</span>
          </kbd>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex items-center gap-2 p-2.5 bg-zinc-900/40 border-b border-zinc-800/80 text-xs overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-[2px] uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              selectedCategory === 'all' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('actions')}
            className={`px-2.5 py-1 rounded-[2px] uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              selectedCategory === 'actions' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Acciones & Vistas
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('machines')}
            className={`px-2.5 py-1 rounded-[2px] uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              selectedCategory === 'machines' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Maquinaria ({matchingMachines.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('parts')}
            className={`px-2.5 py-1 rounded-[2px] uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              selectedCategory === 'parts' ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Repuestos ({matchingParts.length})
          </button>
        </div>

        {/* Search Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-zinc-850 text-xs">
          {/* Quick Actions Section */}
          {(selectedCategory === 'all' || selectedCategory === 'actions') && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block px-2 mb-1">
                Accesos Directos del Sistema:
              </span>
              {systemActions
                .filter(a => !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.route)}
                    className="w-full flex items-center justify-between p-2.5 rounded-[3px] hover:bg-zinc-900 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400 group-hover:border-amber-400/40">
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{action.title}</span>
                        <span className="text-[11px] text-zinc-400 block font-sans">{action.subtitle}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
            </div>
          )}

          {/* Machines Results Section */}
          {(selectedCategory === 'all' || selectedCategory === 'machines') && matchingMachines.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block px-2 mb-1">
                Maquinarias LiuGong & JCB:
              </span>
              {matchingMachines.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMachineClick(m.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-[3px] hover:bg-zinc-900 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-10 h-8 object-cover rounded-[1px] border border-zinc-800"
                    />
                    <div>
                      <span className="font-bold text-white block">{m.name}</span>
                      <span className="text-[10px] text-zinc-400 block">
                        {m.brand} &bull; {m.category} &bull; {m.operatingWeightKg ? `${(m.operatingWeightKg / 1000).toFixed(1)} Ton` : 'Pesado'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block">US$ {m.basePriceUsd.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500">Km 22 Stock</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Parts Results Section */}
          {(selectedCategory === 'all' || selectedCategory === 'parts') && matchingParts.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block px-2 mb-1">
                Repuestos OEM Fast-Moving:
              </span>
              {matchingParts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleActionClick('#/parts')}
                  className="w-full flex items-center justify-between p-2.5 rounded-[3px] hover:bg-zinc-900 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-amber-400">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        P/N: <strong className="text-amber-400">{p.partNumber}</strong> &bull; {p.brand}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold block">US$ {p.priceUsd.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400">{p.stockKm22} en almacén</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Hotkey Legend */}
        <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">K</kbd> Abrir Paleta</span>
            <span><kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">M</kbd> Maquinaria</span>
            <span><kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded-[2px] bg-zinc-800 border border-zinc-700 text-zinc-300">P</kbd> Repuestos</span>
          </div>
          <span className="text-amber-400">TMD Command Core v9</span>
        </div>
      </div>
    </div>
  );
};
