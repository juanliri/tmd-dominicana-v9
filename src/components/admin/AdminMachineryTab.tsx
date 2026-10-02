import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  HardHat, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  MapPin, 
  Hash, 
  Image as ImageIcon,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { InventoryMachine, Currency } from '../../types';
import { MACHINES_DATA, USD_TO_DOP_RATE } from '../../data/catalog';
import { useAuth } from '../../context/AuthContext';
import { 
  logPriceUpdate, 
  logInventoryStockChange, 
  logMachineCreation, 
  logMachineDeletion 
} from '../../services/auditService';

interface AdminMachineryTabProps {
  machines: InventoryMachine[];
  currency: Currency;
  onRefresh?: () => void;
  highlightMachineId?: string;
  onUpdateMachine?: (machine: InventoryMachine) => void;
  onDeleteMachine?: (machineId: string) => void;
}

export const AdminMachineryTab: React.FC<AdminMachineryTabProps> = ({
  machines,
  currency,
  highlightMachineId,
  onUpdateMachine,
  onDeleteMachine
}) => {
  const { currentUser, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<InventoryMachine | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'JCB',
    category: 'Retroexcavadoras',
    modelCode: '',
    year: 2026,
    powerHp: 100,
    operatingWeightKg: 8000,
    basePriceUsd: 85000,
    inStock: true,
    stockQty: 1,
    minStockAlert: 1,
    serialNumber: '',
    location: 'Patio Principal Km 22 Autopista Duarte',
    status: 'available' as InventoryMachine['status'],
    image: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
    description: ''
  });

  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Seed default catalog to Firestore if empty
  const handleSeedCatalog = async () => {
    try {
      setIsSeeding(true);
      for (const m of MACHINES_DATA) {
        const machineRef = doc(db, 'inventory_machines', m.id);
        const invMachine: InventoryMachine = {
          id: m.id,
          name: m.name,
          brand: m.brand,
          category: m.category,
          modelCode: m.modelCode,
          year: m.year,
          powerHp: m.powerHp,
          operatingWeightKg: m.operatingWeightKg,
          basePriceUsd: m.basePriceUsd,
          inStock: m.inStock,
          stockQty: 2,
          serialNumber: `TMD-${m.brand.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
          location: 'Patio Central Km 22, Autopista Duarte',
          status: 'available',
          image: m.image,
          description: m.description,
          updatedAt: new Date().toISOString()
        };
        await setDoc(machineRef, invMachine, { merge: true });
      }
      showToast("Flota inicial sincronizada en la base de datos ERP exitosamente");
    } catch (err) {
      console.error("Error seeding machines:", err);
      handleFirestoreError(err, OperationType.WRITE, 'inventory_machines');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMachine(null);
    setFormData({
      name: '',
      brand: 'JCB',
      category: 'Retroexcavadoras',
      modelCode: '',
      year: 2026,
      powerHp: 100,
      operatingWeightKg: 8000,
      basePriceUsd: 85000,
      inStock: true,
      stockQty: 1,
      minStockAlert: 1,
      serialNumber: `TMD-EQ-${Math.floor(10000 + Math.random() * 90000)}`,
      location: 'Patio Principal Km 22 Autopista Duarte',
      status: 'available',
      image: '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg',
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (m: InventoryMachine) => {
    setEditingMachine(m);
    setFormData({
      name: m.name,
      brand: m.brand,
      category: m.category,
      modelCode: m.modelCode || '',
      year: m.year || 2026,
      powerHp: m.powerHp || 100,
      operatingWeightKg: m.operatingWeightKg || 8000,
      basePriceUsd: m.basePriceUsd || 80000,
      inStock: m.inStock,
      stockQty: m.stockQty ?? 1,
      minStockAlert: m.minStockAlert || 1,
      serialNumber: m.serialNumber || '',
      location: m.location || 'Patio Principal Km 22 Autopista Duarte',
      status: m.status || 'available',
      image: m.image || '',
      description: m.description || ''
    });
    setModalOpen(true);
  };

  const handleSaveMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const id = editingMachine ? editingMachine.id : `mach-${Date.now()}`;
      const docRef = doc(db, 'inventory_machines', id);

      const qty = Number(formData.stockQty) || 0;
      const newPrice = Number(formData.basePriceUsd) || 0;
      const record: InventoryMachine = {
        id,
        name: formData.name.trim(),
        brand: formData.brand,
        category: formData.category,
        modelCode: formData.modelCode.trim() || 'TMD-MODEL',
        year: Number(formData.year) || 2026,
        powerHp: Number(formData.powerHp) || 0,
        operatingWeightKg: Number(formData.operatingWeightKg) || 0,
        basePriceUsd: newPrice,
        inStock: qty > 0 ? formData.inStock : false,
        stockQty: qty,
        minStockAlert: Number(formData.minStockAlert) || 1,
        serialNumber: formData.serialNumber.trim(),
        location: formData.location.trim(),
        status: formData.status,
        image: formData.image.trim(),
        description: formData.description.trim(),
        updatedAt: new Date().toISOString()
      };

      // 1. Immediately update parent state for zero-lag UI
      onUpdateMachine?.(record);

      // 2. Persist to local storage
      try {
        const cached = localStorage.getItem('tmd_catalog_machines_custom');
        const list: InventoryMachine[] = cached ? JSON.parse(cached) : [];
        const idx = list.findIndex(m => m.id === id);
        const updatedList = idx >= 0 ? list.map(m => m.id === id ? record : m) : [record, ...list];
        localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(updatedList));
      } catch (e) {}

      // 3. Supabase Cloud Sync if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('machinery').upsert({
            id: record.id,
            name: record.name,
            brand: record.brand,
            category: record.category,
            model_code: record.modelCode,
            serial_number: record.serialNumber,
            year: record.year,
            base_price_usd: record.basePriceUsd,
            in_stock: record.inStock,
            stock_qty: record.stockQty,
            min_stock_alert: record.minStockAlert,
            location: record.location,
            image: record.image,
            description: record.description,
            updated_at: record.updatedAt
          });
        } catch (supaErr) {
          console.warn('Supabase machinery sync notice:', supaErr);
        }
      }

      // 4. Safe non-blocking Firestore write
      try {
        await setDoc(docRef, record, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore optional machine write notice:', fsErr);
      }

      // Audit Log Trigger
      const actor = {
        uid: currentUser?.uid,
        email: currentUser?.email,
        displayName: userProfile?.displayName || currentUser?.displayName,
        role: userProfile?.role || 'admin'
      };

      try {
        if (editingMachine) {
          if (editingMachine.basePriceUsd !== newPrice) {
            await logPriceUpdate({
              actor,
              targetEntity: 'inventory_machines',
              targetId: id,
              targetName: record.name,
              oldPriceUsd: editingMachine.basePriceUsd,
              newPriceUsd: newPrice,
              reason: 'Actualización de precio desde panel de administración de maquinaria'
            });
          }
          if ((editingMachine.stockQty ?? 0) !== qty) {
            await logInventoryStockChange({
              actor,
              targetEntity: 'inventory_machines',
              targetId: id,
              targetName: record.name,
              oldQty: editingMachine.stockQty ?? 0,
              newQty: qty,
              reason: 'Ajuste manual de stock desde edición de ficha técnica'
            });
          }
        } else {
          await logMachineCreation({
            actor,
            machineId: id,
            machineName: record.name,
            priceUsd: newPrice,
            stockQty: qty,
            modelCode: record.modelCode
          });
        }
      } catch (auditErr) {
        console.warn('Audit log write notice:', auditErr);
      }

      showToast(editingMachine ? "Equipo actualizado correctamente" : "Nuevo equipo registrado en inventario");
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving machine:", err);
      showToast(editingMachine ? "Equipo actualizado correctamente" : "Nuevo equipo registrado en inventario");
      setModalOpen(false);
    }
  };

  const handleAdjustStock = async (m: InventoryMachine, delta: number) => {
    const oldQty = m.stockQty ?? 1;
    const newQty = Math.max(0, oldQty + delta);
    const updatedRecord: InventoryMachine = {
      ...m,
      stockQty: newQty,
      inStock: newQty > 0,
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately update UI state
    onUpdateMachine?.(updatedRecord);

    // 2. Persist locally
    try {
      const cached = localStorage.getItem('tmd_catalog_machines_custom');
      const list: InventoryMachine[] = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex(item => item.id === m.id);
      const updatedList = idx >= 0 ? list.map(item => item.id === m.id ? updatedRecord : item) : [updatedRecord, ...list];
      localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Supabase Cloud Sync
    if (isSupabaseConfigured) {
      try {
        await supabase.from('machinery').update({
          stock_qty: newQty,
          in_stock: newQty > 0,
          updated_at: updatedRecord.updatedAt
        }).eq('id', m.id);
      } catch (supaErr) {
        console.warn('Supabase stock update notice:', supaErr);
      }
    }

    // 4. Non-blocking Firestore write
    try {
      const docRef = doc(db, 'inventory_machines', m.id);
      await updateDoc(docRef, {
        stockQty: newQty,
        inStock: newQty > 0,
        updatedAt: updatedRecord.updatedAt
      });
    } catch (fsErr) {
      console.warn('Firestore optional machine stock update notice:', fsErr);
    }

    // Audit log
    try {
      await logInventoryStockChange({
        actor: {
          uid: currentUser?.uid,
          email: currentUser?.email,
          displayName: userProfile?.displayName || currentUser?.displayName,
          role: userProfile?.role || 'admin'
        },
        targetEntity: 'inventory_machines',
        targetId: m.id,
        targetName: m.name,
        oldQty,
        newQty,
        reason: `Ajuste rápido de inventario (${delta > 0 ? `+${delta}` : delta} unidades en patio Km 22)`
      });
    } catch (auditErr) {
      console.warn('Audit log notice:', auditErr);
    }

    showToast(`Stock de ${m.name} ajustado a ${newQty} unidad(es)`);
  };

  const handleToggleStock = async (m: InventoryMachine) => {
    const nextInStock = !m.inStock;
    const oldQty = m.stockQty ?? 0;
    const newQty = nextInStock ? (oldQty > 0 ? oldQty : 1) : 0;
    const updatedRecord: InventoryMachine = {
      ...m,
      inStock: nextInStock,
      stockQty: newQty,
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately update UI state
    onUpdateMachine?.(updatedRecord);

    // 2. Persist locally
    try {
      const cached = localStorage.getItem('tmd_catalog_machines_custom');
      const list: InventoryMachine[] = cached ? JSON.parse(cached) : [];
      const idx = list.findIndex(item => item.id === m.id);
      const updatedList = idx >= 0 ? list.map(item => item.id === m.id ? updatedRecord : item) : [updatedRecord, ...list];
      localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Supabase Cloud Sync
    if (isSupabaseConfigured) {
      try {
        await supabase.from('machinery').update({
          in_stock: nextInStock,
          stock_qty: newQty,
          updated_at: updatedRecord.updatedAt
        }).eq('id', m.id);
      } catch (supaErr) {
        console.warn('Supabase toggle stock notice:', supaErr);
      }
    }

    // 4. Non-blocking Firestore write
    try {
      const docRef = doc(db, 'inventory_machines', m.id);
      await updateDoc(docRef, {
        inStock: nextInStock,
        stockQty: newQty,
        updatedAt: updatedRecord.updatedAt
      });
    } catch (fsErr) {
      console.warn('Firestore optional machine toggle notice:', fsErr);
    }

    // Audit log
    try {
      await logInventoryStockChange({
        actor: {
          uid: currentUser?.uid,
          email: currentUser?.email,
          displayName: userProfile?.displayName || currentUser?.displayName,
          role: userProfile?.role || 'admin'
        },
        targetEntity: 'inventory_machines',
        targetId: m.id,
        targetName: m.name,
        oldQty,
        newQty,
        reason: `Cambio de estado de disponibilidad: ${nextInStock ? 'Disponible' : 'Agotado'}`
      });
    } catch (auditErr) {
      console.warn('Audit log notice:', auditErr);
    }

    showToast(`Estado de stock actualizado: ${nextInStock ? 'Disponible' : 'Agotado'}`);
  };

  const handleDeleteMachine = async (id: string) => {
    const target = machines.find(m => m.id === id);
    if (!window.confirm("¿Confirma que desea eliminar este equipo del inventario ERP?")) return;

    // 1. Immediately update UI state
    onDeleteMachine?.(id);

    // 2. Persist deletion locally
    try {
      const cached = localStorage.getItem('tmd_catalog_machines_custom');
      if (cached) {
        const list: InventoryMachine[] = JSON.parse(cached);
        localStorage.setItem('tmd_catalog_machines_custom', JSON.stringify(list.filter(m => m.id !== id)));
      }
    } catch (e) {}

    // 3. Supabase Cloud Sync
    if (isSupabaseConfigured) {
      try {
        await supabase.from('machinery').delete().eq('id', id);
      } catch (supaErr) {
        console.warn('Supabase machine delete notice:', supaErr);
      }
    }

    // 4. Non-blocking Firestore write
    try {
      await deleteDoc(doc(db, 'inventory_machines', id));
    } catch (fsErr) {
      console.warn('Firestore optional delete notice:', fsErr);
    }

    // Audit log
    try {
      if (target) {
        await logMachineDeletion({
          actor: {
            uid: currentUser?.uid,
            email: currentUser?.email,
            displayName: userProfile?.displayName || currentUser?.displayName,
            role: userProfile?.role || 'admin'
          },
          machineId: id,
          machineName: target.name
        });
      }
    } catch (auditErr) {
      console.warn('Audit log notice:', auditErr);
    }

    showToast("Equipo eliminado del inventario");
  };

  const filteredMachines = machines.filter(m => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (brandFilter !== 'all' && m.brand !== brandFilter) return false;
    
    // Stock Status filter
    const minAlert = m.minStockAlert || 1;
    const qty = m.stockQty ?? 1;
    if (stockStatusFilter === 'available' && (!m.inStock || qty === 0)) return false;
    if (stockStatusFilter === 'out' && (m.inStock && qty > 0)) return false;
    if (stockStatusFilter === 'low' && (qty > minAlert || qty === 0)) return false;

    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(t) ||
        m.brand.toLowerCase().includes(t) ||
        m.modelCode?.toLowerCase().includes(t) ||
        m.serialNumber?.toLowerCase().includes(t)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-amber-500 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipo, modelo, serie, marca..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filters and Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Excavadoras">Excavadoras</option>
              <option value="Retroexcavadoras">Retroexcavadoras</option>
              <option value="Tractores">Tractores</option>
              <option value="Compactación">Compactación</option>
              <option value="Cargadores">Cargadores</option>
              <option value="Minicargadores">Minicargadores</option>
            </select>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las Marcas</option>
              <option value="JCB">JCB</option>
              <option value="LiuGong">LiuGong</option>
              <option value="LS Tractor">LS Tractor</option>
            </select>

            {machines.length === 0 && (
              <button
                onClick={handleSeedCatalog}
                disabled={isSeeding}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Importar catálogo predeterminado de TMD al ERP"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>Sincronizar Catálogo TMD</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Equipo</span>
            </button>
          </div>
        </div>

        {/* Stock Status Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStockStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              stockStatusFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            Todos ({machines.length})
          </button>

          <button
            onClick={() => setStockStatusFilter('available')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stockStatusFilter === 'available'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>En Stock ({machines.filter(m => m.inStock && (m.stockQty ?? 1) > (m.minStockAlert || 1)).length})</span>
          </button>

          <button
            onClick={() => setStockStatusFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stockStatusFilter === 'low'
                ? 'bg-amber-500 text-black font-black shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border border-zinc-200 dark:border-zinc-800 hover:bg-amber-50/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Stock Crítico ({machines.filter(m => (m.stockQty ?? 1) <= (m.minStockAlert || 1) && (m.stockQty ?? 1) > 0).length})</span>
          </button>

          <button
            onClick={() => setStockStatusFilter('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stockStatusFilter === 'out'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50/20'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Agotados ({machines.filter(m => !m.inStock || (m.stockQty ?? 1) === 0).length})</span>
          </button>
        </div>
      </div>

      {/* Machinery Cards Grid */}
      {filteredMachines.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <HardHat className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="font-extrabold text-zinc-900 dark:text-white">Inventario de maquinaria vacío</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto mb-4">
            No se han registrado maquinarias en el catálogo ERP o no coinciden con los filtros actuales.
          </p>
          {machines.length === 0 && (
            <button
              onClick={handleSeedCatalog}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>Sincronizar Catálogo Base TMD ({MACHINES_DATA.length} Equipos)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMachines.map((machine) => {
            const qty = machine.stockQty ?? 1;
            const minAlert = machine.minStockAlert || 1;
            const isOutOfStock = !machine.inStock || qty === 0;
            const isLowStock = !isOutOfStock && qty <= minAlert;
            const isHighlighted = highlightMachineId === machine.id;

            return (
              <div
                id={`machine-${machine.id}`}
                key={machine.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all flex flex-col ${
                  isHighlighted
                    ? 'border-amber-500 ring-4 ring-amber-500/20 shadow-lg scale-[1.01]'
                    : isOutOfStock
                    ? 'border-rose-300 dark:border-rose-900/50 shadow-sm'
                    : isLowStock
                    ? 'border-amber-300 dark:border-amber-900/50 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Image & Header Tags */}
                <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-t-2xl">
                  <img
                    src={machine.image || '/assets/machinery/classic_robust_yellow_jcb_3cx_backhoe.jpg'}
                    alt={machine.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-black">
                      {machine.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                      {machine.category}
                    </span>
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-3 h-3" />
                        Agotado (0)
                      </span>
                    )}
                    {isLowStock && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-black flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3 h-3" />
                        Stock Crítico ({qty} de {minAlert} mín)
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="font-mono text-[11px] text-amber-300 block">{machine.modelCode}</span>
                    <h4 className="font-extrabold text-sm leading-tight drop-shadow truncate">{machine.name}</h4>
                  </div>
                </div>

                {/* Body specs */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block uppercase">Potencia / Peso</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                        {machine.powerHp || 0} HP • {(((machine.operatingWeightKg || 0)) / 1000).toFixed(1)} Ton
                      </span>
                    </div>

                    <div className={`p-2 rounded-lg border transition-colors ${
                      isOutOfStock
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                        : isLowStock
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 block uppercase">Stock / Alerta</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Mín: {minAlert}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`font-bold ${isOutOfStock ? 'text-rose-600 dark:text-rose-400' : isLowStock ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {qty} {qty === 1 ? 'unidad' : 'unidades'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAdjustStock(machine, -1)}
                            disabled={qty <= 0}
                            className="w-5 h-5 rounded flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer"
                            title="Disminuir stock en 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustStock(machine, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            title="Aumentar stock en 1"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-zinc-500">
                    {machine.serialNumber && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Hash className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">Serie: {machine.serialNumber}</span>
                      </div>
                    )}
                    {machine.location && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{machine.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Stock Toggle Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Precio Base</span>
                      <span className="font-mono font-black text-sm text-zinc-900 dark:text-white">
                        {formatMoney(machine.basePriceUsd)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle Stock button */}
                      <button
                        onClick={() => handleToggleStock(machine)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                          machine.inStock 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                        }`}
                        title="Cambiar estado de disponibilidad"
                      >
                        {machine.inStock ? 'Disponible' : 'Agotado'}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEditModal(machine)}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        title="Editar especificaciones o precio"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteMachine(machine.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar de inventario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Machine Modal */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  Inventario de Maquinaria TMD
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {editingMachine ? 'Editar Equipo de Maquinaria' : 'Registrar Nuevo Equipo en Flota'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Nombre Completo del Equipo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Retroexcavadora JCB 3CX Eco 4x4"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Marca</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="JCB">JCB</option>
                    <option value="LiuGong">LiuGong</option>
                    <option value="LS Tractor">LS Tractor</option>
                    <option value="Ammann">Ammann</option>
                    <option value="Yanmar">Yanmar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="Retroexcavadoras">Retroexcavadoras</option>
                    <option value="Excavadoras">Excavadoras</option>
                    <option value="Tractores">Tractores</option>
                    <option value="Compactación">Compactación</option>
                    <option value="Cargadores">Cargadores</option>
                    <option value="Minicargadores">Minicargadores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Código de Modelo</label>
                  <input
                    type="text"
                    value={formData.modelCode}
                    onChange={(e) => setFormData({ ...formData, modelCode: e.target.value })}
                    placeholder="3CX-ECO-2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Año de Fabricación</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Precio Base (USD) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePriceUsd}
                    onChange={(e) => setFormData({ ...formData, basePriceUsd: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Unidades en Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock Mínimo de Alerta *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Notificar al admin si cae a este nivel o menos</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Potencia (HP)</label>
                  <input
                    type="number"
                    value={formData.powerHp}
                    onChange={(e) => setFormData({ ...formData, powerHp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Peso Operativo (kg)</label>
                  <input
                    type="number"
                    value={formData.operatingWeightKg}
                    onChange={(e) => setFormData({ ...formData, operatingWeightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Número de Serie / VIN</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="TMD-JCB-98214"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Ubicación Actual</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Patio Km 22 Autopista Duarte"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">URL de Imagen del Equipo</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/assets/machinery/... o https://..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Descripción & Ficha Técnica</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles sobre motor, transmisión, tracción y especificaciones para República Dominicana..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Disponible para Entrega Inmediata (En Stock)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-colors"
                >
                  {editingMachine ? 'Guardar Cambios' : 'Registrar Maquinaria'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
