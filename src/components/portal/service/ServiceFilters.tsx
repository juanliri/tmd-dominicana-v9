import React from 'react';
import { Search, Filter, Printer, Download, Plus } from 'lucide-react';
import { RegisteredEquipment } from '../../../types';

interface ServiceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedEquipmentId: string;
  onEquipmentSelect: (id: string) => void;
  fleet: RegisteredEquipment[];
  onOpenNewServiceModal: () => void;
  onPrint: () => void;
}

export const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedEquipmentId,
  onEquipmentSelect,
  fleet,
  onOpenNewServiceModal,
  onPrint
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-950/80 rounded-[5px] border border-zinc-800 font-mono text-xs">
      <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por orden, falla o técnico..."
            className="w-full pl-9 pr-3 py-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 text-xs focus:outline-hidden focus:border-amber-400/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-2.5 py-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer focus:outline-hidden font-mono"
          >
            <option value="all">Todos los Estados</option>
            <option value="in_progress">En Taller</option>
            <option value="scheduled">Programado</option>
            <option value="completed">Completado</option>
            <option value="requested">Solicitado</option>
          </select>
        </div>

        {/* Equipment Filter */}
        {fleet.length > 0 && (
          <select
            value={selectedEquipmentId}
            onChange={(e) => onEquipmentSelect(e.target.value)}
            className="px-2.5 py-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer focus:outline-hidden max-w-[160px] truncate font-mono"
          >
            <option value="all">Toda la Flota</option>
            {fleet.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.unitId} · {eq.model}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onPrint}
          className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Imprimir Registro de Taller"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenNewServiceModal}
          className="px-3.5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black font-display uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Solicitar Servicio</span>
        </button>
      </div>
    </div>
  );
};
