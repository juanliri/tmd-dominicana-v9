import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  MessageCircle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Plus, 
  Sparkles,
  MapPin,
  HelpCircle,
  Copy,
  Check,
  FileDown
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { CustomerPurchaseOrder, OrderItemDetail, UserProfile } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';
import { getLocalOrders, generateDemoOrders, saveOrderToLocalStorage } from '../../services/orderService';
import { INITIAL_PORTAL_PURCHASE_ORDERS } from '../../data/portalSeedData';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { PARTS_DATA } from '../../data/parts';
import { downloadOrderInvoicePDF } from '../../utils/pdfGenerator';

interface CustomerOrdersTabProps {
  currentUser: { uid: string; email?: string | null; displayName?: string | null } | null;
  userProfile: UserProfile | null;
  isAdmin?: boolean;
  isStaff?: boolean;
  onNavigate: (route: string) => void;
}

export const CustomerOrdersTab: React.FC<CustomerOrdersTabProps> = ({
  currentUser,
  userProfile,
  isAdmin,
  isStaff,
  onNavigate
}) => {
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const [orders, setOrders] = useState<CustomerPurchaseOrder[]>(() => {
    const existing = getLocalOrders();
    if (existing.length > 0) return existing;
    return INITIAL_PORTAL_PURCHASE_ORDERS;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<CustomerPurchaseOrder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load orders in real-time from Firestore and local cache
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const local = getLocalOrders();
    if (local.length > 0) {
      setOrders(local);
    }

    const ordersCol = collection(db, 'orders');
    const q = isStaff || isAdmin || !currentUser
      ? query(ordersCol)
      : query(ordersCol, where('clientId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(safetyTimeout);
        const fetched: CustomerPurchaseOrder[] = [];
        snapshot.forEach((docSnap) => {
          fetched.push({ id: docSnap.id, ...docSnap.data() } as CustomerPurchaseOrder);
        });

        // Merge Firestore and LocalStorage (avoiding duplicate IDs)
        const combinedMap = new Map<string, CustomerPurchaseOrder>();
        local.forEach((o) => combinedMap.set(o.id || o.orderNumber, o));
        fetched.forEach((o) => combinedMap.set(o.id || o.orderNumber, o));

        const list = Array.from(combinedMap.values());
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        if (list.length > 0) {
          setOrders(list);
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(safetyTimeout);
        console.warn('Firestore orders notice (using local cache fallback):', error);
        setOrders((prev) => prev.length > 0 ? prev : (local.length > 0 ? local : []));
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, [currentUser, isStaff, isAdmin]);

  // Seed sample orders if user has no past purchases yet
  const handleSeedDemoOrders = () => {
    const uid = currentUser?.uid || 'client-demo-km22';
    const email = currentUser?.email || 'cliente@tmd.rd';
    const name = userProfile?.displayName || currentUser?.displayName || 'Ing. Manuel Tavares (Constructora Tavares S.R.L.)';
    const demo = generateDemoOrders(uid, email, name);
    demo.forEach((o) => saveOrderToLocalStorage(o));
    setOrders((prev) => {
      const existingIds = new Set(prev.map(p => p.id || p.orderNumber));
      const newItems = demo.filter(d => !existingIds.has(d.id || d.orderNumber));
      return [...newItems, ...prev];
    });
    setLoading(false);
  };

  // Re-order items back into shopping cart
  const handleReorderItems = (order: CustomerPurchaseOrder) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      if (item.type === 'part') {
        const matchingPart = PARTS_DATA.find((p) => p.partNumber === item.partNumber || p.id === item.id);
        if (matchingPart) {
          addToCart(matchingPart, item.quantity || 1);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      addNotification({
        type: 'order_status',
        title: 'Repuestos Añadidos al Carrito',
        message: `Se agregaron ${addedCount} ítem(s) de la orden ${order.orderNumber} a tu carrito de compras.`
      });
      onNavigate('#/checkout');
    } else {
      onNavigate('#/parts');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Status visual mapping
  const getStatusBadge = (status: CustomerPurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendiente de Confirmación</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Package className="w-3.5 h-3.5" />
            <span>En Preparación & Almacén</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Listo para Retiro en Sede</span>
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span>En Tránsito / Despachado</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entregado Satisfactoriamente</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Orden Cancelada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Client scoping: only show matching orders if not staff/admin
    if (!isAdmin && !isStaff && currentUser) {
      const matchesId = order.clientId && (order.clientId === currentUser.uid);
      const matchesEmail = order.clientEmail && currentUser.email && (order.clientEmail.toLowerCase() === currentUser.email.toLowerCase());
      if (!matchesId && !matchesEmail) {
        return false;
      }
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTrack = (order.trackingNumber || '').toLowerCase().includes(q);
      const matchNcf = (order.ncfNumber || '').toLowerCase().includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q) || (i.partNumber || '').toLowerCase().includes(q));
      return matchNum || matchTrack || matchNcf || matchItem;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Seed Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-5 rounded-[5px] border border-zinc-800">
        <div>
          <h3 className="text-base sm:text-lg font-display uppercase tracking-tight text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <span>Historial de Compras & Seguimiento de Pedidos</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Consulte el estado en tiempo real, guía de despacho, comprobantes fiscales NCF y desglose de repuestos de sus órdenes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {orders.length === 0 && (
            <button
              onClick={handleSeedDemoOrders}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider rounded-[2px] text-xs transition-all shadow-sm cursor-pointer font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Cargar Pedidos de Demostración</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('#/parts')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-display uppercase tracking-wider rounded-[2px] text-xs border border-zinc-700 transition-all cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nuevo Pedido de Repuestos</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900 p-4 rounded-[5px] border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por N° de orden, pieza, código OEM, guía de rastreo o NCF..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'processing', label: 'En Preparación' },
            { id: 'in_transit', label: 'En Tránsito' },
            { id: 'ready_for_pickup', label: 'En Sede' },
            { id: 'delivered', label: 'Entregados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-display uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-amber-400 text-black font-black shadow-sm'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 space-y-3">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-[2px] animate-spin mx-auto"></div>
          <p className="text-xs font-mono">Cargando compras y despachos...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-[3px] bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-display uppercase tracking-tight text-base text-white">
              No se encontraron pedidos registrados
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Aún no ha realizado compras de repuestos o maquinaria en línea con esta cuenta, o no hay registros con los filtros seleccionados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedDemoOrders}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider font-bold rounded-[2px] text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ver Ejemplo de Pedido con Rastreo</span>
            </button>
            <button
              onClick={() => onNavigate('#/parts')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-display uppercase tracking-wider font-bold rounded-[2px] text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-700"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Explorar Catálogo de Repuestos OEM</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('es-DO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id || order.orderNumber}
                className="bg-zinc-900 rounded-[3px] border border-zinc-800 p-5 sm:p-6 hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Header Row: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white font-mono">
                        {order.orderNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(order.orderNumber, order.orderNumber)}
                        title="Copiar Número de Orden"
                        className="p-1 hover:bg-zinc-800 rounded-[2px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        {copiedId === order.orderNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                        Total: <strong className="text-white font-mono">US$ {order.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> <span className="font-mono text-zinc-500">(RD$ {order.totalDop.toLocaleString('es-DO', { maximumFractionDigits: 0 })})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Detalles & Guía</span>
                    </button>

                    <button
                      onClick={() => handleReorderItems(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 font-display uppercase tracking-wider rounded-[2px] text-xs transition-colors cursor-pointer font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reordenar Piezas</span>
                    </button>
                  </div>
                </div>

                {/* Items Preview Strip */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Items list */}
                  <div className="md:col-span-8 space-y-2">
                    <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400 block">
                      Productos Comprados ({order.itemsCount} {order.itemsCount === 1 ? 'unidad' : 'unidades'})
                    </span>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-zinc-950 p-2.5 rounded-[3px] border border-zinc-800/80">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-[2px] object-cover bg-zinc-800 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {item.partNumber && (
                                <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-[2px]">
                                  {item.partNumber}
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-white truncate">
                                {item.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span>Marca: <strong className="text-zinc-300">{item.brand}</strong></span>
                              <span>•</span>
                              <span>Cant: <strong className="text-zinc-300">{item.quantity}</strong></span>
                              <span>•</span>
                              <span className="font-mono">Precio: US$ {item.priceUsd.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {order.items.length > 3 && (
                        <p className="text-[11px] font-bold text-amber-400 pl-2 font-mono">
                          + {order.items.length - 3} producto(s) adicional(es) en esta orden
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery & Fiscal Info Box */}
                  <div className="md:col-span-4 bg-zinc-950 p-3.5 rounded-[3px] border border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-display uppercase tracking-wider text-zinc-400">Despacho & Guía</span>
                      {order.trackingNumber && (
                        <span className="font-mono text-[10px] font-bold text-zinc-300">
                          {order.trackingNumber}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-300">
                      <div className="flex items-start gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{order.carrier || 'Entrega Estándar TMD Express'}</span>
                      </div>
                      {order.deliveryAddress && (
                        <div className="flex items-start gap-1.5 text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{order.deliveryAddress}</span>
                        </div>
                      )}
                    </div>

                    {order.ncfNumber && (
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-semibold">NCF Crédito Fiscal:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {order.ncfNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Order Modal */}
      {selectedOrder && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-900 w-full max-w-3xl rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-zinc-950 text-white flex items-center justify-between relative overflow-hidden border-b border-zinc-800">
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display uppercase text-amber-400 tracking-wider">
                    Detalle de Compra TMD
                  </span>
                  <span className="font-mono text-xs font-bold bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-[2px]">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
                <h3 className="text-xl font-black font-display uppercase tracking-tight text-white">
                  Orden de Pedido #{selectedOrder.orderNumber}
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-white bg-zinc-900">
              {/* Status and Tracking timeline */}
              <div className="bg-zinc-950 p-4 rounded-[3px] border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display uppercase tracking-wider text-zinc-400">Estado Actual:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="text-xs text-zinc-400 font-mono">
                      Guía: <strong className="text-white">{selectedOrder.trackingNumber}</strong>
                    </div>
                  )}
                </div>

                {/* Tracking Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="pt-3 border-t border-zinc-800 space-y-3">
                    <span className="text-[10px] font-display uppercase tracking-widest text-zinc-400 block">
                      Seguimiento Logístico en Tiempo Real
                    </span>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-[2px] bg-amber-400 text-black flex items-center justify-center text-xs font-black shrink-0 shadow-sm mt-0.5">
                            ✓
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-white">
                                {step.title}
                              </h5>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {new Date(step.timestamp).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-sans">
                              {step.description}
                            </p>
                            {step.location && (
                              <span className="inline-block text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-[2px]">
                                📍 {step.location}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="font-display text-xs uppercase tracking-wider text-zinc-400">
                  Desglose de Repuestos y Equipos
                </h4>
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-[3px] overflow-hidden">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3.5 flex items-center justify-between gap-4 bg-zinc-950">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-[2px] object-cover bg-zinc-800 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            {item.partNumber && (
                              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-[2px]">
                                {item.partNumber}
                              </span>
                            )}
                            <h5 className="font-bold text-xs text-white">
                              {item.name}
                            </h5>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Marca: {item.brand} • Cantidad: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-white block">
                          US$ {(item.priceUsd * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          (US$ {item.priceUsd.toFixed(2)} c/u)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals & Comprobante Fiscal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fiscal details */}
                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-display uppercase tracking-wider text-[11px]">Datos de Facturación Fiscal (DGII)</span>
                  </div>
                  <div className="space-y-1 text-zinc-400 text-[11px]">
                    <p>Tipo NCF: <strong className="text-zinc-200">{selectedOrder.ncfType || 'B02 Consumidor Final'}</strong></p>
                    {selectedOrder.ncfNumber && <p>Comprobante: <strong className="font-mono text-emerald-400">{selectedOrder.ncfNumber}</strong></p>}
                    {selectedOrder.rncOrCedula && <p>RNC / Cédula: <strong className="font-mono text-zinc-200">{selectedOrder.rncOrCedula}</strong></p>}
                    <p>Método de Pago: <strong className="text-zinc-200">{selectedOrder.paymentMethod === 'card' ? 'Tarjeta de Crédito / Débito' : selectedOrder.paymentMethod === 'transfer' ? 'Transferencia Bancaria (BPD / BHD)' : 'Pago contra Entrega'}</strong></p>
                  </div>
                </div>

                {/* Amount Totals */}
                <div className="p-4 rounded-[3px] bg-zinc-950 border border-zinc-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>US$ {selectedOrder.subtotalUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>ITBIS (18%):</span>
                    <span>US$ {selectedOrder.itbisUsd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Envío / Despacho:</span>
                    <span>{selectedOrder.shippingUsd > 0 ? `US$ ${selectedOrder.shippingUsd.toFixed(2)}` : 'Gratis (Retiro Sede)'}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between font-black text-sm text-white">
                    <span>Total Pagado:</span>
                    <span className="text-amber-400 font-mono">US$ {selectedOrder.totalUsd.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-[10px] text-zinc-500 font-mono">
                    Equivalente: RD$ {selectedOrder.totalDop.toLocaleString('es-DO', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/18095601234?text=Hola%20TMD%20Dominicana,%20deseo%20consultar%20el%20estado%20de%20mi%20orden%20${selectedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-display uppercase tracking-wider font-bold rounded-[2px] text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar por WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadOrderInvoicePDF(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-display uppercase tracking-wider font-bold rounded-[2px] text-xs transition-colors cursor-pointer border border-zinc-700"
                  title="Descargar Comprobante Fiscal en PDF"
                >
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>Descargar Factura PDF</span>
                </button>

                <button
                  onClick={() => {
                    handleReorderItems(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-display uppercase tracking-wider font-bold rounded-[2px] text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Volver a Comprar</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-display uppercase tracking-wider font-bold rounded-[2px] text-xs transition-colors cursor-pointer border border-zinc-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
