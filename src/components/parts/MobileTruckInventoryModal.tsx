import React, { useState } from 'react';
import {
  Truck,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Download,
  X,
  MapPin,
  User,
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';

interface MobileUnitInventoryItem {
  id: string;
  partNumber: string;
  name: string;
  category: 'hoses' | 'filters' | 'electrical' | 'belts' | 'lubricants';
  currentQty: number;
  targetQuota: number;
  unit: string;
  centralWarehouseQty: number;
}

interface MobileServiceTruck {
  id: string;
  plate: string;
  model: string;
  region: string;
  currentZone: string;
  assignedTechnician: string;
  technicianPhone: string;
  lastStockSync: string;
  inventory: MobileUnitInventoryItem[];
}

const INITIAL_TRUCKS: MobileServiceTruck[] = [
  {
    id: 'TRK-01',
    plate: 'L-409182',
    model: 'Toyota Hilux 4x4 Heavy Duty Service Bed',
    region: 'Región Sur (Baní, Azua, Barahona)',
    currentZone: 'Cantera San Cristóbal / Baní',
    assignedTechnician: 'Dionicio Báez (Técnico Senior)',
    technicianPhone: '(809) 555-0182',
    lastStockSync: '2026-09-27 18:30',
    inventory: [
      {
        id: 'M-01',
        partNumber: 'HOSE-2SN-08-3000',
        name: 'Manguera Hidráulica 1/2" 2SN 3,000 PSI x 2m c/ Terminares JIC',
        category: 'hoses',
        currentQty: 2,
        targetQuota: 5,
        unit: 'Pzas',
        centralWarehouseQty: 48
      },
      {
        id: 'M-02',
        partNumber: 'FILT-53C0053',
        name: 'Filtro Separador de Agua Genuino LiuGong (Fleetguard FS19732)',
        category: 'filters',
        currentQty: 3,
        targetQuota: 6,
        unit: 'Und',
        centralWarehouseQty: 85
      },
      {
        id: 'M-03',
        partNumber: 'REL-24V-70A',
        name: 'Relé de Arranque Sellado Heavy Duty 24V 70A',
        category: 'electrical',
        currentQty: 4,
        targetQuota: 4,
        unit: 'Pzas',
        centralWarehouseQty: 120
      },
      {
        id: 'M-04',
        partNumber: 'BLT-8PK-1580',
        name: 'Correa Serpentina Cummins QSB 6.7 (8PK1580)',
        category: 'belts',
        currentQty: 1,
        targetQuota: 3,
        unit: 'Pzas',
        centralWarehouseQty: 32
      },
      {
        id: 'M-05',
        partNumber: 'GRS-LIT-EP2',
        name: 'Tubo de Grasa Complejo de Litio EP2 Alta Adhesión (400g)',
        category: 'lubricants',
        currentQty: 6,
        targetQuota: 10,
        unit: 'Tubos',
        centralWarehouseQty: 240
      }
    ]
  },
  {
    id: 'TRK-02',
    plate: 'L-388204',
    model: 'Toyota Land Cruiser 79 4x4 Workshop Body',
    region: 'Región Norte / Cibao (Santiago, Bonao, La Vega)',
    currentZone: 'Mina Cerro Maimón / Bonao',
    assignedTechnician: 'Junior Alcántara (Técnico Hidráulico)',
    technicianPhone: '(809) 555-0194',
    lastStockSync: '2026-09-28 06:45',
    inventory: [
      {
        id: 'M-01',
        partNumber: 'HOSE-4SP-12-5000',
        name: 'Manguera Hidráulica 3/4" 4SP 5,000 PSI x 2.5m ORFS',
        category: 'hoses',
        currentQty: 4,
        targetQuota: 4,
        unit: 'Pzas',
        centralWarehouseQty: 36
      },
      {
        id: 'M-02',
        partNumber: 'FILT-53C0053',
        name: 'Filtro Separador de Agua Genuino LiuGong (Fleetguard FS19732)',
        category: 'filters',
        currentQty: 5,
        targetQuota: 6,
        unit: 'Und',
        centralWarehouseQty: 85
      },
      {
        id: 'M-03',
        partNumber: 'REL-24V-70A',
        name: 'Relé de Arranque Sellado Heavy Duty 24V 70A',
        category: 'electrical',
        currentQty: 2,
        targetQuota: 4,
        unit: 'Pzas',
        centralWarehouseQty: 120
      },
      {
        id: 'M-04',
        partNumber: 'BLT-8PK-1580',
        name: 'Correa Serpentina Cummins QSB 6.7 (8PK1580)',
        category: 'belts',
        currentQty: 3,
        targetQuota: 3,
        unit: 'Pzas',
        centralWarehouseQty: 32
      },
      {
        id: 'M-05',
        partNumber: 'GRS-LIT-EP2',
        name: 'Tubo de Grasa Complejo de Litio EP2 Alta Adhesión (400g)',
        category: 'lubricants',
        currentQty: 9,
        targetQuota: 10,
        unit: 'Tubos',
        centralWarehouseQty: 240
      }
    ]
  },
  {
    id: 'TRK-03',
    plate: 'L-412099',
    model: 'Isuzu D-Max 4x4 High-Ride Service Box',
    region: 'Región Este (Boca Chica, San Pedro, Punta Cana)',
    currentZone: 'Autovía del Este / La Romana',
    assignedTechnician: 'Miguel Rosario (Especialista CAN-Bus)',
    technicianPhone: '(809) 555-0210',
    lastStockSync: '2026-09-27 20:10',
    inventory: [
      {
        id: 'M-01',
        partNumber: 'HOSE-2SN-08-3000',
        name: 'Manguera Hidráulica 1/2" 2SN 3,000 PSI x 2m c/ Terminares JIC',
        category: 'hoses',
        currentQty: 5,
        targetQuota: 5,
        unit: 'Pzas',
        centralWarehouseQty: 48
      },
      {
        id: 'M-02',
        partNumber: 'FILT-53C0053',
        name: 'Filtro Separador de Agua Genuino LiuGong (Fleetguard FS19732)',
        category: 'filters',
        currentQty: 2,
        targetQuota: 6,
        unit: 'Und',
        centralWarehouseQty: 85
      },
      {
        id: 'M-03',
        partNumber: 'REL-24V-70A',
        name: 'Relé de Arranque Sellado Heavy Duty 24V 70A',
        category: 'electrical',
        currentQty: 4,
        targetQuota: 4,
        unit: 'Pzas',
        centralWarehouseQty: 120
      },
      {
        id: 'M-04',
        partNumber: 'BLT-8PK-1580',
        name: 'Correa Serpentina Cummins QSB 6.7 (8PK1580)',
        category: 'belts',
        currentQty: 2,
        targetQuota: 3,
        unit: 'Pzas',
        centralWarehouseQty: 32
      },
      {
        id: 'M-05',
        partNumber: 'GRS-LIT-EP2',
        name: 'Tubo de Grasa Complejo de Litio EP2 Alta Adhesión (400g)',
        category: 'lubricants',
        currentQty: 4,
        targetQuota: 10,
        unit: 'Tubos',
        centralWarehouseQty: 240
      }
    ]
  }
];

interface MobileTruckInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileTruckInventoryModal: React.FC<MobileTruckInventoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [trucks, setTrucks] = useState<MobileServiceTruck[]>(INITIAL_TRUCKS);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('TRK-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTruck = trucks.find(t => t.id === selectedTruckId) || trucks[0];

  // Restock single item to target quota from Central Warehouse Km 22
  const handleRestockItem = (itemId: string) => {
    const updated = trucks.map(t => {
      if (t.id === currentTruck.id) {
        return {
          ...t,
          lastStockSync: new Date().toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' }),
          inventory: t.inventory.map(item => {
            if (item.id === itemId) {
              const diff = item.targetQuota - item.currentQty;
              return {
                ...item,
                currentQty: item.targetQuota,
                centralWarehouseQty: Math.max(0, item.centralWarehouseQty - diff)
              };
            }
            return item;
          })
        };
      }
      return t;
    });

    setTrucks(updated);
    setFeedbackMessage('Ítem reabastecido desde Almacén Central Km 22.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Reabastecer Camioneta Completa
  const handleRestockEntireTruck = () => {
    const updated = trucks.map(t => {
      if (t.id === currentTruck.id) {
        return {
          ...t,
          lastStockSync: new Date().toLocaleDateString('es-DO', { hour: '2-digit', minute: '2-digit' }),
          inventory: t.inventory.map(item => {
            const diff = item.targetQuota - item.currentQty;
            return {
              ...item,
              currentQty: item.targetQuota,
              centralWarehouseQty: Math.max(0, item.centralWarehouseQty - diff)
            };
          })
        };
      }
      return t;
    });

    setTrucks(updated);
    setFeedbackMessage(`Carga completa transferida a ${currentTruck.plate} (${currentTruck.assignedTechnician}).`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Descontar uso de pieza en obra
  const handleConsumeItem = (itemId: string) => {
    const updated = trucks.map(t => {
      if (t.id === currentTruck.id) {
        return {
          ...t,
          inventory: t.inventory.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                currentQty: Math.max(0, item.currentQty - 1)
              };
            }
            return item;
          })
        };
      }
      return t;
    });

    setTrucks(updated);
  };

  // Export Conduce Móvil CSV
  const handleExportCsv = () => {
    const headers = 'UNIDAD,PLACA,REGION,TECNICO,NUMERO_PARTE,REPUESTO,CATEGORIA,CANTIDAD_ABORDADA,CUOTA_OBJETIVO,STOCK_KM22\n';
    const rows = currentTruck.inventory.map(i => 
      `"${currentTruck.id}","${currentTruck.plate}","${currentTruck.region}","${currentTruck.assignedTechnician}","${i.partNumber}","${i.name}","${i.category}","${i.currentQty}","${i.targetQuota}","${i.centralWarehouseQty}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CONDUCE_INVENTARIO_CAMIONETA_${currentTruck.plate}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredInventory = currentTruck.inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalTruckItems = currentTruck.inventory.reduce((sum, i) => sum + i.currentQty, 0);
  const totalTargetQuota = currentTruck.inventory.reduce((sum, i) => sum + i.targetQuota, 0);
  const replenishmentPercent = Math.round((totalTruckItems / totalTargetQuota) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  AUXILIO VIAL 4x4
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Sincronización de Stock Km 22 vs. Unidades Móviles
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Control de Inventario de Camionetas Móviles
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase transition-all cursor-pointer border border-zinc-700"
              title="Descargar Conduce de Carga Móvil en CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Exportar Conduce</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback alert toast */}
        {feedbackMessage && (
          <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Truck Selector Tabs */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {trucks.map(truck => {
            const isSelected = truck.id === selectedTruckId;
            const itemsCount = truck.inventory.reduce((s, i) => s + i.currentQty, 0);
            const targetCount = truck.inventory.reduce((s, i) => s + i.targetQuota, 0);
            const pct = Math.round((itemsCount / targetCount) * 100);

            return (
              <button
                key={truck.id}
                type="button"
                onClick={() => setSelectedTruckId(truck.id)}
                className={`p-3 rounded-[3px] border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-400 text-white shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-amber-400">
                    {truck.id} • {truck.plate}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] ${
                    pct >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {pct}% Lleno
                  </span>
                </div>
                <div className="text-xs font-bold text-zinc-200 mt-1 line-clamp-1">{truck.assignedTechnician}</div>
                <div className="text-[10px] text-zinc-500 font-sans mt-0.5 line-clamp-1">{truck.region}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Truck Detail Bar */}
        <div className="p-4 bg-zinc-900/30 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-zinc-300 font-bold">{currentTruck.currentZone}</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-zinc-400 font-sans">{currentTruck.model}</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Técnico: <strong className="text-zinc-300">{currentTruck.assignedTechnician}</strong> {currentTruck.technicianPhone} • Sincronización: {currentTruck.lastStockSync}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestockEntireTruck}
              className="px-3.5 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Cargar todas las piezas faltantes hasta la cuota desde Almacén Km 22"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reabastecer Camioneta</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-zinc-900/20 border-b border-zinc-800 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por manguera, filtro, relé, número de parte..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">Todas las Categorías</option>
            <option value="hoses">Mangueras Hidráulicas</option>
            <option value="filters">Filtros de Emergencia</option>
            <option value="electrical">Relés & Fusibles 24V</option>
            <option value="belts">Correas Motor</option>
            <option value="lubricants">Grasa & Lubricantes</option>
          </select>
        </div>

        {/* Content: Inventory Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3px] overflow-hidden divide-y divide-zinc-800">
            {filteredInventory.map(item => {
              const isLow = item.currentQty < item.targetQuota * 0.5;

              return (
                <div key={item.id} className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-zinc-950 border border-zinc-800 text-amber-400">
                        {item.partNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-sans">
                        {item.category}
                      </span>
                      {isLow && (
                        <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> STOCK CRÍTICO
                        </span>
                      )}
                    </div>

                    <h4 className="text-white font-bold text-xs">{item.name}</h4>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span>Stock en Camioneta: <strong className={isLow ? 'text-rose-400' : 'text-emerald-400'}>{item.currentQty} / {item.targetQuota} {item.unit}</strong></span>
                      <span className="text-zinc-600">&bull;</span>
                      <span>Disponible en Sede Km 22: <strong className="text-zinc-200">{item.centralWarehouseQty} {item.unit}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleConsumeItem(item.id)}
                      disabled={item.currentQty === 0}
                      className="px-2.5 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold uppercase transition-colors cursor-pointer border border-zinc-700 disabled:opacity-40"
                      title="Registrar consumo de 1 unidad en auxilio de campo"
                    >
                      <Minus className="w-3 h-3 inline mr-1" /> Usar en Obra
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRestockItem(item.id)}
                      disabled={item.currentQty >= item.targetQuota}
                      className="px-3 py-1.5 rounded-[2px] bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[11px] font-bold uppercase transition-colors cursor-pointer border border-amber-400/30 disabled:opacity-40"
                      title="Rellenar cuota desde almacén central Km 22"
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" /> Reabastecer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Integrado con Fullbay Mobile Counter Sale y Despachos Km 22.
          </span>
          <span className="font-mono text-[10px]">TMD Mobile Logistics v9</span>
        </div>
      </div>
    </div>
  );
};
