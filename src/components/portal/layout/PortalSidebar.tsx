import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Radio, 
  Crown, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  QrCode, 
  PlusCircle, 
  LogOut, 
  ChevronDown, 
  ChevronRight, 
  Sliders, 
  HardHat, 
  Building2, 
  MapPin, 
  Zap,
  Package,
  Settings,
  Shield,
  Activity,
  UserCheck
} from 'lucide-react';
import { 
  PortalRole, 
  PORTAL_ROLE_LABELS, 
  PORTAL_ROLE_COLORS,
  hasPermission
} from '../../../config/portalPermissions';
import { UserProfile, UserRole } from '../../../types';

export interface PortalNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  requiredPermission?: keyof import('../../../config/portalPermissions').PortalPermissions;
  targetSubpath?: string;
  category: 'core' | 'commercial' | 'ops' | 'admin';
}

interface PortalSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userProfile: UserProfile | null;
  currentRole: PortalRole;
  simulatedRole?: UserRole | null;
  onSetSimulatedRole?: (role: UserRole | null) => void;
  onOpenCreateQuote?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenQrScanner?: () => void;
  onSignOut: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  quotesCount?: number;
  ordersCount?: number;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  currentRole,
  simulatedRole,
  onSetSimulatedRole,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onOpenQrScanner,
  onSignOut,
  isCollapsed = false,
  onToggleCollapse,
  quotesCount = 0,
  ordersCount = 0
}) => {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const roleStyle = PORTAL_ROLE_COLORS[currentRole] || PORTAL_ROLE_COLORS.client;
  const roleLabel = PORTAL_ROLE_LABELS[currentRole] || 'USUARIO';

  // Navigation Items Registry
  const NAV_ITEMS: PortalNavItem[] = [
    // Core
    {
      id: 'overview',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      category: 'core'
    },
    // Commercial
    {
      id: 'quotes',
      label: 'Cotizaciones B01',
      icon: FileText,
      badge: quotesCount > 0 ? quotesCount : undefined,
      requiredPermission: 'canViewOwnQuotes',
      category: 'commercial'
    },
    {
      id: 'orders',
      label: 'Órdenes de Taller',
      icon: Wrench,
      badge: ordersCount > 0 ? ordersCount : undefined,
      requiredPermission: 'canViewOwnOrders',
      category: 'commercial'
    },
    {
      id: 'livelink',
      label: 'Flota & LiveLink™',
      icon: Radio,
      requiredPermission: 'canViewOwnFleet',
      category: 'commercial'
    },
    {
      id: 'pro',
      label: 'Club Pro TMD',
      icon: Crown,
      requiredPermission: 'canViewProMember',
      category: 'commercial'
    },
    {
      id: 'docs',
      label: 'Bóveda Técnica',
      icon: BookOpen,
      requiredPermission: 'canViewTechDocs',
      category: 'commercial'
    },
    // Ops & Workshop
    {
      id: 'command',
      label: 'Command Center',
      icon: Activity,
      requiredPermission: 'canAssignOrders',
      category: 'ops'
    },
    {
      id: 'workflow',
      label: 'Oficina & NCF DGII',
      icon: Layers,
      requiredPermission: 'canGenerateNcf',
      category: 'ops'
    },
    {
      id: 'inventory',
      label: 'Inventario & Stock',
      icon: Package,
      requiredPermission: 'canViewInventory',
      category: 'ops'
    },
    // Admin & Executive
    {
      id: 'patio',
      label: 'Patio Km 22 GPS',
      icon: MapPin,
      requiredPermission: 'canAccessPatio',
      category: 'admin'
    },
    {
      id: 'metrics',
      label: 'Métricas & DGII',
      icon: BarChart3,
      requiredPermission: 'canViewRevenueMetrics',
      category: 'admin'
    },
    {
      id: 'users',
      label: 'Usuarios & RBAC',
      icon: Users,
      requiredPermission: 'canManageUsers',
      category: 'admin'
    },
    {
      id: 'audit',
      label: 'Auditoría & Logs',
      icon: ShieldCheck,
      requiredPermission: 'canAccessAuditLog',
      category: 'admin'
    }
  ];

  // Filter items by role permissions
  const availableItems = NAV_ITEMS.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(currentRole, item.requiredPermission);
  });

  const categories = [
    { key: 'core', label: 'General' },
    { key: 'commercial', label: 'Comercial & Flota' },
    { key: 'ops', label: 'Operaciones Km 22' },
    { key: 'admin', label: 'Dirección & Control' }
  ];

  const allRoles: PortalRole[] = ['client', 'dealer', 'mechanic', 'sales', 'warehouse', 'finance', 'admin'];

  return (
    <aside 
      className={`bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen text-zinc-700 dark:text-zinc-300 font-sans`}
    >
      {/* Top Header & User Profile */}
      <div className="p-3 space-y-4">
        {/* Brand Bar */}
        <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-200 dark:border-zinc-800/80">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xs">
                TMD
              </div>
              <div>
                <span className="text-xs font-black text-zinc-900 dark:text-white tracking-widest block font-display">
                  PORTAL TMD
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wider">
                  INDUSTRIAL v9.0
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xs">
              TMD
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              title={isCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
          )}
        </div>

        {/* User Capsule */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-zinc-950 font-bold text-xs shrink-0 shadow-sm">
                {(userProfile?.displayName || 'TMD')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {userProfile?.displayName || 'Usuario TMD'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {userProfile?.companyName || 'Tecnomaquinarias'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
              >
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="truncate max-w-[130px]">{roleLabel}</span>
              </div>

              {onSetSimulatedRole && (
                <button
                  type="button"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 cursor-pointer p-0.5"
                  title="Simulador de Roles"
                >
                  <Sliders className="w-3 h-3" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Role Simulator Dropdown */}
            {showRoleSelector && onSetSimulatedRole && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1 animate-in fade-in">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block px-1">
                  Vista Previa por Rol:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {allRoles.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onSetSimulatedRole(r === currentRole ? null : (r as any));
                        setShowRoleSelector(false);
                      }}
                      className={`px-1.5 py-1 rounded text-left truncate cursor-pointer transition-colors ${
                        currentRole === r 
                          ? 'bg-amber-400 text-black font-bold' 
                          : 'bg-white dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {PORTAL_ROLE_LABELS[r].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <div 
              className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs"
              title={`${userProfile?.displayName || 'Usuario'} (${roleLabel})`}
            >
              {(userProfile?.displayName || 'T')[0].toUpperCase()}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1">
            {onOpenCreateQuote && hasPermission(currentRole, 'canCreateQuotes') && (
              <button
                type="button"
                onClick={onOpenCreateQuote}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>NUEVA COTIZACIÓN</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              {onOpenNewOrderModal && hasPermission(currentRole, 'canCreateOrders') && (
                <button
                  type="button"
                  onClick={onOpenNewOrderModal}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                  title="Solicitar Taller"
                >
                  <Wrench className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">+ Taller</span>
                </button>
              )}

              {onOpenQrScanner && (
                <button
                  type="button"
                  onClick={onOpenQrScanner}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                  title="Escanear QR de Maquinaria / Repuesto"
                >
                  <QrCode className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                  <span className="truncate">Scan QR</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Categories and Items */}
        <nav className="space-y-4 pt-2">
          {categories.map(cat => {
            const catItems = availableItems.filter(item => item.category === cat.key);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-1">
                {!isCollapsed && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-400 px-2.5 block">
                    {cat.label}
                  </span>
                )}
                {catItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-400 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
                      } ${isCollapsed ? 'justify-center px-1' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                      
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="ml-auto px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-3">
        {/* Km 22 Facility Status Capsule */}
        {!isCollapsed ? (
          <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 text-[10px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700 dark:text-zinc-400 font-bold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                SEDE CENTRAL KM 22
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 truncate">
              Autopista Duarte Km 22 · 6 Bahías HD
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Sede Km 22 Online">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={onSignOut}
          title="Cerrar Sesión"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
