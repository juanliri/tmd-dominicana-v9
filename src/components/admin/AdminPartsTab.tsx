import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Cog, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  AlertTriangle, 
  DollarSign, 
  Box, 
  Copy, 
  Check, 
  Layers
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { InventoryPart, Currency } from '../../types';
import { PARTS_DATA } from '../../data/parts';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { useAuth } from '../../context/AuthContext';
import {
  logPriceUpdate,
  logInventoryStockChange,
  logPartCreation,
  logPartDeletion
} from '../../services/auditService';

interface AdminPartsTabProps {
  parts: InventoryPart[];
  currency: Currency;
  onRefresh?: () => void;
  highlightPartId?: string;
}

export const AdminPartsTab: React.FC<AdminPartsTabProps> = ({
  parts,
  currency,
  highlightPartId
}) => {
  const { currentUser, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryPart | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedPartNumber, setCopiedPartNumber] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    brand: 'JCB OEM Genuine',
    category: 'Filtros',
    priceUsd: 150,
    stockQty: 10,
    minStockAlert: 3,
    locationBin: 'Pasillo A - Estante 01',
    isOem: true,
    compatibleModels: 'JCB 3CX, LiuGong 922E',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    description: '',
    deliveryTimeHours: 4
  });

  const formatMoney = (amountUsd: number) => {
    if (currency === 'DOP') {
      const dop = amountUsd * USD_TO_DOP_RATE;
      return `RD$ ${dop.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`;
    }
    return `$${amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPartNumber(text);
    setTimeout(() => setCopiedPartNumber(null), 2000);
  };

  // Seed default catalog to Firestore if empty
  const handleSeedParts = async () => {
    try {
      setIsSeeding(true);
      for (const p of PARTS_DATA) {
        const partRef = doc(db, 'inventory_parts', p.id);
        const invPart: InventoryPart = {
          id: p.id,
          partNumber: p.partNumber,
          name: p.name,
          brand: p.brand,
          category: p.category,
          priceUsd: p.priceUsd,
          stockQty: p.stockQty,
          minStockAlert: 3,
          locationBin: `Estante ${p.category.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          isOem: p.isOem,
          compatibleModels: p.compatibleModels,
          image: p.image,
          description: p.description,
          deliveryTimeHours: p.deliveryTimeHours,
          updatedAt: new Date().toISOString()
        };
        await setDoc(partRef, invPart, { merge: true });
      }
      showToast(`Se sincronizaron ${PARTS_DATA.length} repuestos OEM en Firestore`);
    } catch (err) {
      console.error("Error seeding parts:", err);
      handleFirestoreError(err, OperationType.WRITE, 'inventory_parts');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPart(null);
    setFormData({
      partNumber: `OEM-${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      brand: 'JCB OEM Genuine',
      category: 'Filtros',
      priceUsd: 120,
      stockQty: 10,
      minStockAlert: 3,
      locationBin: 'Pasillo A - Estante 01',
      isOem: true,
      compatibleModels: 'JCB 3CX Eco, LiuGong 922E',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      description: '',
      deliveryTimeHours: 4
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: InventoryPart) => {
    setEditingPart(p);
    setFormData({
      partNumber: p.partNumber,
      name: p.name,
      brand: p.brand || 'OEM Genuine',
      category: p.category || 'Filtros',
      priceUsd: p.priceUsd,
      stockQty: p.stockQty,
      minStockAlert: p.minStockAlert || 3,
      locationBin: p.locationBin || 'Almacén Central Km 22',
      isOem: p.isOem ?? true,
      compatibleModels: (p.compatibleModels || []).join(', '),
      image: p.image || '',
      description: p.description || '',
      deliveryTimeHours: p.deliveryTimeHours || 4
    });
    setModalOpen(true);
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partNumber.trim() || !formData.name.trim()) return;

    try {
      const id = editingPart ? editingPart.id : `part-${Date.now()}`;
      const docRef = doc(db, 'inventory_parts', id);

      const modelsArray = formData.compatibleModels
        .split(',')
        .map(m => m.trim())
        .filter(Boolean);

      const price = Number(formData.priceUsd) || 0;
      const qty = Number(formData.stockQty) || 0;

      const record: InventoryPart = {
        id,
        partNumber: formData.partNumber.trim().toUpperCase(),
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        priceUsd: price,
        stockQty: qty,
        minStockAlert: Number(formData.minStockAlert) || 3,
        locationBin: formData.locationBin.trim(),
        isOem: formData.isOem,
        compatibleModels: modelsArray,
        image: formData.image.trim(),
        description: formData.description.trim(),
        deliveryTimeHours: Number(formData.deliveryTimeHours) || 4,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, record, { merge: true });

      // Audit Log Trigger
      const actor = {
        uid: currentUser?.uid,
        email: currentUser?.email,
        displayName: userProfile?.displayName || currentUser?.displayName,
        role: userProfile?.role || 'admin'
      };

      if (editingPart) {
        if (editingPart.priceUsd !== price) {
          await logPriceUpdate({
            actor,
            targetEntity: 'inventory_parts',
            targetId: id,
            targetName: `${record.partNumber} - ${record.name}`,
            oldPriceUsd: editingPart.priceUsd,
            newPriceUsd: price,
            reason: 'Actualización de tarifa de repuesto OEM desde panel administrativo'
          });
        }
        if (editingPart.stockQty !== qty) {
          await logInventoryStockChange({
            actor,
            targetEntity: 'inventory_parts',
            targetId: id,
            targetName: `${record.partNumber} - ${record.name}`,
            oldQty: editingPart.stockQty,
            newQty: qty,
            reason: 'Ajuste de inventario en almacén desde formulario'
          });
        }
      } else {
        await logPartCreation({
          actor,
          partId: id,
          partName: record.name,
          partNumber: record.partNumber,
          priceUsd: price,
          stockQty: qty
        });
      }

      showToast(editingPart ? "Repuesto actualizado en inventario" : "Nuevo repuesto registrado en almacén");
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving part:", err);
      handleFirestoreError(err, OperationType.WRITE, `inventory_parts/${editingPart?.id || 'new'}`);
    }
  };

  const handleAdjustStock = async (part: InventoryPart, delta: number) => {
    const oldQty = part.stockQty;
    const newQty = Math.max(0, oldQty + delta);
    try {
      const docRef = doc(db, 'inventory_parts', part.id);
      await updateDoc(docRef, {
        stockQty: newQty,
        updatedAt: new Date().toISOString()
      });

      // Audit Log
      await logInventoryStockChange({
        actor: {
          uid: currentUser?.uid,
          email: currentUser?.email,
          displayName: userProfile?.displayName || currentUser?.displayName,
          role: userProfile?.role || 'admin'
        },
        targetEntity: 'inventory_parts',
        targetId: part.id,
        targetName: `${part.partNumber} - ${part.name}`,
        oldQty,
        newQty,
        reason: `Ajuste rápido de existencias (${delta > 0 ? `+${delta}` : delta} unidades en almacén Km 22)`
      });

      showToast(`Stock de ${part.partNumber} ajustado a ${newQty} unidades`);
    } catch (err) {
      console.error("Error adjusting stock:", err);
      handleFirestoreError(err, OperationType.UPDATE, `inventory_parts/${part.id}`);
    }
  };

  const handleDeletePart = async (id: string) => {
    const target = parts.find(p => p.id === id);
    if (!window.confirm("¿Confirma que desea eliminar este repuesto de la base de datos Firestore?")) return;
    try {
      await deleteDoc(doc(db, 'inventory_parts', id));

      // Audit Log
      if (target) {
        await logPartDeletion({
          actor: {
            uid: currentUser?.uid,
            email: currentUser?.email,
            displayName: userProfile?.displayName || currentUser?.displayName,
            role: userProfile?.role || 'admin'
          },
          partId: id,
          partName: target.name,
          partNumber: target.partNumber
        });
      }

      showToast("Repuesto eliminado del inventario");
    } catch (err) {
      console.error("Error deleting part:", err);
      handleFirestoreError(err, OperationType.DELETE, `inventory_parts/${id}`);
    }
  };

  const filteredParts = parts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (stockStatusFilter === 'low' && (p.stockQty > (p.minStockAlert || 3) || p.stockQty === 0)) return false;
    if (stockStatusFilter === 'out' && p.stockQty !== 0) return false;

    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      return (
        p.partNumber.toLowerCase().includes(t) ||
        p.name.toLowerCase().includes(t) ||
        p.brand?.toLowerCase().includes(t) ||
        (p.compatibleModels || []).some(m => m.toLowerCase().includes(t))
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
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por OEM #, descripción, marca, modelo compatible..."
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
            <option value="Filtros">Filtros</option>
            <option value="Hidráulica">Hidráulica</option>
            <option value="Motor Diesel">Motor Diesel</option>
            <option value="Tren de Rodaje">Tren de Rodaje</option>
            <option value="Desgaste y Balde">Desgaste y Balde</option>
            <option value="Lubricantes">Lubricantes</option>
          </select>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                stockStatusFilter === 'all' 
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                stockStatusFilter === 'low' 
                  ? 'bg-amber-500 text-black shadow-xs' 
                  : 'text-zinc-500 hover:text-amber-500'
              }`}
            >
              Stock Bajo
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                stockStatusFilter === 'out' 
                  ? 'bg-rose-500 text-white shadow-xs' 
                  : 'text-zinc-500 hover:text-rose-500'
              }`}
            >
              Sin Stock
            </button>
          </div>

          {parts.length === 0 && (
            <button
              onClick={handleSeedParts}
              disabled={isSeeding}
              className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-400 border border-blue-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Importar catálogo inicial de repuestos a Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>Sincronizar Repuestos</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Repuesto</span>
          </button>
        </div>
      </div>

      {/* Parts Table / List */}
      {filteredParts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Cog className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="font-extrabold text-zinc-900 dark:text-white">Almacén de repuestos sin resultados</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto mb-4">
            No se han registrado repuestos en Firestore o ningún artículo coincide con los filtros aplicados.
          </p>
          {parts.length === 0 && (
            <button
              onClick={handleSeedParts}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>Sincronizar Repuestos OEM TMD ({PARTS_DATA.length} Artículos)</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Código OEM / Repuesto</th>
                  <th className="px-4 py-3">Categoría & Marca</th>
                  <th className="px-4 py-3">Ubicación Almacén</th>
                  <th className="px-4 py-3">Precio Unitario</th>
                  <th className="px-4 py-3 text-center">Stock Actual</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredParts.map((part) => {
                  const isLow = part.stockQty <= (part.minStockAlert || 3) && part.stockQty > 0;
                  const isOut = part.stockQty === 0;
                  const isHighlighted = highlightPartId === part.id;

                  return (
                    <tr 
                      id={`part-${part.id}`}
                      key={part.id}
                      className={`transition-all ${
                        isHighlighted 
                          ? 'bg-amber-500/15 ring-2 ring-amber-500' 
                          : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Code & Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {part.image && (
                            <img
                              src={part.image}
                              alt={part.name}
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                                {part.partNumber}
                              </span>
                              <button
                                onClick={() => copyToClipboard(part.partNumber)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                title="Copiar código OEM"
                              >
                                {copiedPartNumber === part.partNumber ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white block truncate max-w-xs">
                              {part.name}
                            </span>
                            {part.compatibleModels && part.compatibleModels.length > 0 && (
                              <span className="text-[10px] text-zinc-400 block truncate max-w-xs">
                                Compatible: {part.compatibleModels.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                          {part.category}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          {part.brand} {part.isOem && '• OEM Genuino'}
                        </span>
                      </td>

                      {/* Location Bin */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                          <Box className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-[11px]">{part.locationBin || 'Almacén Central Km 22'}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-black text-zinc-900 dark:text-white block">
                          {formatMoney(part.priceUsd)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Entrega ~{part.deliveryTimeHours || 4}h
                        </span>
                      </td>

                      {/* Stock Adjuster */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleAdjustStock(part, -1)}
                              disabled={part.stockQty <= 0}
                              className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-black text-xs disabled:opacity-30"
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-sm w-10 text-center text-zinc-900 dark:text-white">
                              {part.stockQty}
                            </span>
                            <button
                              onClick={() => handleAdjustStock(part, 1)}
                              className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-black text-xs"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleAdjustStock(part, 5)}
                              className="px-1.5 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 font-bold text-[10px]"
                              title="Sumar caja de 5 unidades"
                            >
                              +5
                            </button>
                          </div>

                          {/* Status Tag */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isOut 
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                              : isLow 
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isOut ? 'Agotado' : isLow ? 'Stock Crítico' : 'Disponible'}
                          </span>
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(part)}
                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                            title="Editar repuesto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePart(part.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Eliminar del almacén"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Part Modal */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">
                  Almacén Central de Repuestos Genuinos
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                  {editingPart ? 'Editar Ficha de Repuesto' : 'Registrar Nuevo Repuesto OEM'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Número de Parte OEM *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    placeholder="JCB-320/07155"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="Filtros">Filtros</option>
                    <option value="Hidráulica">Hidráulica</option>
                    <option value="Motor Diesel">Motor Diesel</option>
                    <option value="Tren de Rodaje">Tren de Rodaje</option>
                    <option value="Desgaste y Balde">Desgaste y Balde</option>
                    <option value="Lubricantes">Lubricantes</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nombre o Descripción del Repuesto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Kit de Filtros de Mantenimiento 500H JCB 3CX"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="JCB OEM Genuine"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Precio Unitario (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceUsd}
                    onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stock en Almacén *
                  </label>
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
                    Alerta de Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Estante / Ubicación Bin
                  </label>
                  <input
                    type="text"
                    value={formData.locationBin}
                    onChange={(e) => setFormData({ ...formData, locationBin: e.target.value })}
                    placeholder="Pasillo A - Estante 02"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tiempo de Entrega (Horas)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryTimeHours}
                    onChange={(e) => setFormData({ ...formData, deliveryTimeHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Modelos Compatibles (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.compatibleModels}
                    onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
                    placeholder="JCB 3CX Eco, JCB 4CX, LiuGong 922E"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    URL de Foto del Repuesto
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
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
                  {editingPart ? 'Actualizar Repuesto' : 'Registrar en Almacén'}
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
