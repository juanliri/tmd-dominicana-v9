import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Wrench, 
  Radio, 
  Package, 
  Plus, 
  QrCode, 
  Layers, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  X, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Truck,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Activity,
  Users,
  Zap,
  BookOpen
} from 'lucide-react';
import { PortalQuote, ServiceWorkOrder, RegisteredEquipment, CustomerPurchaseOrder } from '../../types';
import { INITIAL_PORTAL_QUOTES, INITIAL_PORTAL_WORK_ORDERS, INITIAL_REGISTERED_FLEET, INITIAL_PORTAL_PURCHASE_ORDERS } from '../../data/portalSeedData';

interface SpotlightResultItem {
  id: string;
  category: 'quote' | 'order' | 'fleet' | 'purchase' | 'action';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  action: () => void;
}

interface PortalSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenCreateQuote?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenQrScanner?: () => void;
  onSelectQuote?: (quote: PortalQuote) => void;
  quotes?: PortalQuote[];
  workOrders?: ServiceWorkOrder[];
  fleet?: RegisteredEquipment[];
  purchaseOrders?: CustomerPurchaseOrder[];
  onSignInAsRole?: (role: 'client' | 'staff' | 'admin', clientId?: string) => void;
}

export const PortalSpotlightModal: React.FC<PortalSpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onOpenQrScanner,
  onSelectQuote,
  quotes = INITIAL_PORTAL_QUOTES,
  workOrders = INITIAL_PORTAL_WORK_ORDERS,
  fleet = INITIAL_REGISTERED_FLEET,
  purchaseOrders = INITIAL_PORTAL_PURCHASE_ORDERS,
  onSignInAsRole
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build searchable items index
  const results = useMemo<SpotlightResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SpotlightResultItem[] = [];

    // 1. Fast Actions (Always included or filtered by query)
    const actions: SpotlightResultItem[] = [
      {
        id: 'act-new-quote',
        category: 'action',
        categoryLabel: 'Acción Rápida',
        title: 'Crear Nueva Cotización B01',
        subtitle: 'Generar proforma fiscal DGII con desglose de equipo y opciones',
        badge: 'Ctrl+N',
        badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        icon: Plus,
        action: () => {
          onClose();
          onOpenCreateQuote?.();
        }
      },
      {
        id: 'act-qr-scanner',
        category: 'action',
        categoryLabel: 'Acción Rápida',
        title: 'Escanear Código QR Industrial',
        subtitle: 'Apertura de cámara de garita Km 22, bahía o almacén',
        badge: 'QR Patio',
        badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        icon: QrCode,
        action: () => {
          onClose();
          onOpenQrScanner?.();
        }
      },
      {
        id: 'act-new-order',
        category: 'action',
        categoryLabel: 'Acción Rápida',
        title: 'Registrar Orden de Servicio',
        subtitle: 'Ingreso a taller Fullbay HD Km 22 (Preventivo o Correctivo)',
        badge: 'Taller',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        icon: Wrench,
        action: () => {
          onClose();
          onOpenNewOrderModal?.();
        }
      },
      {
        id: 'act-livelink',
        category: 'action',
        categoryLabel: 'Navegación',
        title: 'Ver Telemetría Satelital LiveLink™',
        subtitle: 'Monitoreo GPS en tiempo real, niveles de combustible y horómetros',
        badge: 'IoT',
        badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
        icon: Radio,
        action: () => {
          onClose();
          onSelectTab('livelink');
        }
      },
      {
        id: 'act-metrics',
        category: 'action',
        categoryLabel: 'ERP Fiscal',
        title: 'Métricas DGII 606 & 607 / Ingresos',
        subtitle: 'Panel ejecutivo fiscal, retenciones ITBIS y análisis de rentabilidad',
        badge: 'DGII NCF',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        icon: BarChart3,
        action: () => {
          onClose();
          onSelectTab('metrics');
        }
      },
      {
        id: 'act-patio',
        category: 'action',
        categoryLabel: 'Operaciones',
        title: 'Patio Km 22 GPS & Pistas de Prueba',
        subtitle: 'Inspección de lotes, pistas de dinámica pesada y coordenadas satelitales',
        badge: 'Km 22',
        badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        icon: MapPin,
        action: () => {
          onClose();
          onSelectTab('patio');
        }
      },
      {
        id: 'act-workflow',
        category: 'action',
        categoryLabel: 'Operaciones',
        title: 'Oficina & Pases de Garita Km 22',
        subtitle: 'Control de accesos de camiones camas bajas, autorizaciones de salida y flota',
        badge: 'Garita',
        badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        icon: Layers,
        action: () => {
          onClose();
          onSelectTab('workflow');
        }
      },
      {
        id: 'act-inventory',
        category: 'action',
        categoryLabel: 'Inventario',
        title: 'Stock de Repuestos & Escaneo QR',
        subtitle: 'Control de SKUs OEM, niveles mínimos de inventario y reposición',
        badge: 'Stock',
        badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        icon: Zap,
        action: () => {
          onClose();
          onSelectTab('inventory');
        }
      },
      {
        id: 'act-audit',
        category: 'action',
        categoryLabel: 'Ciberseguridad',
        title: 'Auditoría & Logs Ciberseguridad',
        subtitle: 'Trazabilidad de accesos, cambios de estado y registros inmutables',
        badge: 'SOC2 / NIST',
        badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40',
        icon: ShieldCheck,
        action: () => {
          onClose();
          onSelectTab('audit');
        }
      },
      {
        id: 'act-integrations',
        category: 'action',
        categoryLabel: 'Infraestructura',
        title: 'Integraciones ERP & APIs',
        subtitle: 'Salud de Supabase Cloud, Fullbay REST, BCRD Tasa Cambio y Vercel Edge',
        badge: 'Health',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        icon: Activity,
        action: () => {
          onClose();
          onSelectTab('integrations');
        }
      },
      {
        id: 'act-users',
        category: 'action',
        categoryLabel: 'Gobernanza',
        title: 'Gestión de Usuarios & Roles RBAC',
        subtitle: 'Administración de clientes, personal técnico, operadores y auditores',
        badge: 'RBAC',
        badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
        icon: Users,
        action: () => {
          onClose();
          onSelectTab('users');
        }
      },
      {
        id: 'act-docs',
        category: 'action',
        categoryLabel: 'Documentación',
        title: 'Bóveda Técnica OEM',
        subtitle: 'Manuales de servicio técnico, esquemáticos hidráulicos y tablas de torque',
        badge: 'Manuales',
        badgeColor: 'bg-zinc-700 text-zinc-300 border border-zinc-600',
        icon: BookOpen,
        action: () => {
          onClose();
          onSelectTab('docs');
        }
      }
    ];

    if (!q) {
      items.push(...actions);
    } else {
      items.push(...actions.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)));
    }

    // 2. Quotes Search
    quotes.forEach((quote) => {
      const matchNum = quote.quoteNumber.toLowerCase().includes(q);
      const matchClient = quote.clientName.toLowerCase().includes(q);
      const matchCompany = (quote.companyName || '').toLowerCase().includes(q);
      const matchMachine = (quote.itemsSummary || '').toLowerCase().includes(q);
      const matchRnc = (quote.rnc || '').toLowerCase().includes(q);

      if (!q || matchNum || matchClient || matchCompany || matchMachine || matchRnc) {
        items.push({
          id: `quote-${quote.id}`,
          category: 'quote',
          categoryLabel: 'Cotización B01',
          title: `${quote.quoteNumber} — ${quote.itemsSummary || 'Maquinaria TMD'}`,
          subtitle: `${quote.companyName || quote.clientName} · US$${quote.total.toLocaleString()} (NCF: ${quote.status === 'approved' ? 'Emitido' : 'Pendiente'})`,
          badge: quote.status.toUpperCase(),
          badgeColor: quote.status === 'approved' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : quote.status === 'rejected'
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          icon: FileText,
          action: () => {
            onClose();
            if (onSelectQuote) {
              onSelectQuote(quote);
            } else {
              onSelectTab('quotes');
            }
          }
        });
      }
    });

    // 3. Work Orders Search
    workOrders.forEach((wo) => {
      const matchNum = wo.orderNumber.toLowerCase().includes(q);
      const matchMachine = wo.machineModel.toLowerCase().includes(q);
      const matchSerial = (wo.machineSerial || '').toLowerCase().includes(q);
      const matchCustomer = (wo.clientName || '').toLowerCase().includes(q);
      const matchBay = (wo.workshopName || '').toLowerCase().includes(q);

      if (!q || matchNum || matchMachine || matchSerial || matchCustomer || matchBay) {
        items.push({
          id: `wo-${wo.id}`,
          category: 'order',
          categoryLabel: 'Orden de Taller',
          title: `${wo.orderNumber} — ${wo.machineModel}`,
          subtitle: `${wo.clientName} · ${wo.workshopName || 'Bahía General'} · ${wo.serviceType.replace('_', ' ').toUpperCase()}`,
          badge: wo.status.replace('_', ' ').toUpperCase(),
          badgeColor: wo.status === 'completed'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : wo.status === 'in_progress'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          icon: Wrench,
          action: () => {
            onClose();
            onSelectTab('orders');
          }
        });
      }
    });

    // 4. Fleet Equipment Search
    fleet.forEach((eq) => {
      const equipmentTitle = `${eq.brand} ${eq.model}`;
      const matchName = equipmentTitle.toLowerCase().includes(q);
      const matchModel = (eq.model || '').toLowerCase().includes(q);
      const matchSerial = (eq.serialNumber || '').toLowerCase().includes(q);
      const matchPlate = (eq.unitId || '').toLowerCase().includes(q);
      const matchCompany = (eq.companyName || '').toLowerCase().includes(q);

      if (!q || matchName || matchModel || matchSerial || matchPlate || matchCompany) {
        items.push({
          id: `fleet-${eq.id}`,
          category: 'fleet',
          categoryLabel: 'Flota & Telemetría',
          title: `${equipmentTitle} (${eq.unitId})`,
          subtitle: `${eq.companyName || 'Constructora'} · ${eq.jobsiteLocation || 'Obra'} · Horómetro: ${eq.currentHorometer || 0} hrs`,
          badge: eq.status === 'active' ? 'EN OPERACIÓN' : 'EN TALLER',
          badgeColor: eq.status === 'active' 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          icon: Radio,
          action: () => {
            onClose();
            onSelectTab('livelink');
          }
        });
      }
    });

    // 5. Purchase Orders Search
    purchaseOrders.forEach((po) => {
      const matchNum = po.orderNumber.toLowerCase().includes(q);
      const matchTrack = (po.trackingNumber || '').toLowerCase().includes(q);
      const matchNcf = (po.ncfNumber || '').toLowerCase().includes(q);
      const matchClient = po.clientName.toLowerCase().includes(q);
      const matchPart = po.items.some(i => i.name.toLowerCase().includes(q) || (i.partNumber || '').toLowerCase().includes(q));

      if (!q || matchNum || matchTrack || matchNcf || matchClient || matchPart) {
        items.push({
          id: `po-${po.id}`,
          category: 'purchase',
          categoryLabel: 'Pedido de Repuestos',
          title: `${po.orderNumber} — ${po.items[0]?.name || 'Repuestos'}`,
          subtitle: `${po.clientName} · US$${po.totalUsd.toLocaleString()} · ${po.deliveryMethod.replace('_', ' ')}`,
          badge: po.status.toUpperCase(),
          badgeColor: po.status === 'delivered'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
          icon: Package,
          action: () => {
            onClose();
            onSelectTab('purchases');
          }
        });
      }
    });

    return items.slice(0, 15);
  }, [query, quotes, workOrders, fleet, purchaseOrders, onClose, onOpenCreateQuote, onOpenNewOrderModal, onOpenQrScanner, onSelectQuote, onSelectTab]);

  // Keyboard navigation inside spotlight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Spotlight Window */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150">
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-900/60">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar cotizaciones, órdenes, flota, repuestos o acciones..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-900/80 p-1.5"
        >
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-400/10 border border-amber-400/30 text-white'
                      : 'hover:bg-zinc-900/70 border border-transparent text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? 'bg-amber-400 text-black shadow-sm' 
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                          {item.categoryLabel}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-zinc-800 text-zinc-300'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold truncate text-white mt-0.5">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3 flex items-center text-zinc-500">
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-400 font-bold">
                        <span>Abrir</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                No se encontraron resultados para "{query}"
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Pruebe buscando por modelo (JCB 3CX, LiuGong 856H), cliente (Tavares, Agregados), o código de orden.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">↑↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">↵</kbd>
              <span>Seleccionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[9px] text-zinc-300">ESC</kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Sede Km 22 · Sistema Integral</span>
          </div>
        </div>
      </div>
    </div>
  );
};
