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
import { CANONICAL_CLIENT_ACCOUNTS } from '../../../data/pinAuthAccounts';

export interface PortalNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  requiredPermission?: keyof import('../../../config/portalPermissions').PortalPermissions;
  targetSubpath?: string;
  category: 'core' | 'sales' | 'ops' | 'fleet' | 'admin';
}

interface PortalSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userProfile: UserProfile | null;
  currentRole: PortalRole;
  simulatedRole?: UserRole | null;
  onSetSimulatedRole?: (role: UserRole | null) => void;
  onSignInAsRole?: (role: 'client' | 'staff' | 'admin', clientId?: string) => Promise<void> | void;
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
  onSignInAsRole,
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

  // Navigation Items Registry — 4 Enterprise Departments
  const NAV_ITEMS: PortalNavItem[] = [
    // 1. Core / General
    {
      id: 'overview',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      category: 'core'
    },
    // 2. Ventas & CRM
    {
      id: 'quotes',
      label: 'Cotizaciones B01',
      icon: FileText,
      badge: quotesCount > 0 ? quotesCount : undefined,
      requiredPermission: 'canViewOwnQuotes',
      category: 'sales'
    },
    {
      id: 'purchases',
      label: 'Historial Pedidos',
      icon: Package,
      requiredPermission: 'canViewOwnOrders',
      category: 'sales'
    },
    {
      id: 'pro',
      label: 'Club Pro TMD',
      icon: Crown,
      requiredPermission: 'canViewProMember',
      category: 'sales'
    },
    // 3. Taller & Operaciones (Km 22)
    {
      id: 'orders',
      label: 'Órdenes de Servicio',
      icon: Wrench,
      badge: ordersCount > 0 ? ordersCount : undefined,
      requiredPermission: 'canViewOwnOrders',
      category: 'ops'
    },
    {
      id: 'workflow',
      label: 'Oficina & Pases Garita',
      icon: Layers,
      requiredPermission: 'canAccessOfficeWorkflow',
      category: 'ops'
    },
    {
      id: 'inventory',
      label: 'Stock & Repuestos',
      icon: Zap,
      requiredPermission: 'canViewInventory',
      category: 'ops'
    },
    {
      id: 'docs',
      label: 'Bóveda Técnica OEM',
      icon: BookOpen,
      requiredPermission: 'canViewTechDocs',
      category: 'ops'
    },
    // 4. Flota & Telemetría IoT
    {
      id: 'livelink',
      label: 'LiveLink™ Satelital',
      icon: Radio,
      requiredPermission: 'canViewOwnFleet',
      category: 'fleet'
    },
    {
      id: 'patio',
      label: 'Patio Km 22 GPS',
      icon: MapPin,
      requiredPermission: 'canAccessPatio',
      category: 'fleet'
    },
    // 5. Finanzas & Administración ERP
    {
      id: 'integrations',
      label: 'Integraciones ERP',
      icon: Activity,
      requiredPermission: 'canAccessIntegrations',
      category: 'admin'
    },
    {
      id: 'metrics',
      label: 'Métricas DGII 606',
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
    { key: 'sales', label: 'Ventas & CRM' },
    { key: 'ops', label: 'Taller & Operaciones' },
    { key: 'fleet', label: 'Flota & Telemetría' },
    { key: 'admin', label: 'Finanzas & Administración' }
  ];

  const allRoles: PortalRole[] = ['client', 'dealer', 'mechanic', 'sales', 'warehouse', 'finance', 'admin'];

  return (
    <aside 
      className={`bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-full md:w-64'
      } min-h-full text-zinc-700 dark:text-zinc-300 font-sans`}
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

            {/* Role Simulator & Client Account Switcher Dropdown */}
            {showRoleSelector && (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in">
                {/* Global Role Buttons */}
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block px-1 mb-1 font-semibold">
                    Simular Perfil:
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {allRoles.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          if (onSignInAsRole) {
                            onSignInAsRole(r as 'client' | 'staff' | 'admin');
                          } else if (onSetSimulatedRole) {
                            onSetSimulatedRole(r === currentRole ? null : (r as any));
                          }
                          setShowRoleSelector(false);
                        }}
                        className={`px-1 py-1 rounded text-center truncate cursor-pointer transition-colors ${
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

                {/* Canonical Client Accounts Selection */}
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 dark:text-amber-400 block px-1 mb-1 font-bold">
                    Cuentas Clientes (Demo):
                  </span>
                  <div className="space-y-1">
                    {CANONICAL_CLIENT_ACCOUNTS.map((acc) => {
                      const isSelected = userProfile?.id === acc.uid;
                      return (
                        <button
                          key={acc.uid}
                          type="button"
                          onClick={() => {
                            if (onSignInAsRole) {
                              onSignInAsRole('client', acc.uid);
                            } else if (onSetSimulatedRole) {
                              onSetSimulatedRole('client');
                            }
                            setShowRoleSelector(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                              : 'bg-white/50 dark:bg-zinc-950/70 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="min-w-0 pr-1">
                            <p className="text-[11px] font-bold text-zinc-900 dark:text-white truncate flex items-center gap-1">
                              <span>{acc.name}</span>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                            </p>
                            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">
                              {acc.companyName}
                            </p>
                          </div>
                          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                            PIN {acc.pin}
                          </span>
                        </button>
                      );
                    })}
                  </div>
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
                      className={`relative group w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
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

                      {/* Floating Tooltip when collapsed */}
                      {isCollapsed && (
                        <div className="fixed left-16 ml-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-750 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl pointer-events-none">
                          {item.label}
                          {item.badge !== undefined && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-bold">
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


      </div>
    </aside>
  );
};
