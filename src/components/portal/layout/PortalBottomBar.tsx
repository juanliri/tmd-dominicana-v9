import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Radio, 
  Menu, 
  X, 
  Crown, 
  BookOpen, 
  Activity, 
  Package, 
  MapPin, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  LogOut, 
  QrCode, 
  PlusCircle 
} from 'lucide-react';
import { 
  PortalRole, 
  PORTAL_ROLE_LABELS, 
  PORTAL_ROLE_COLORS, 
  hasPermission 
} from '../../../config/portalPermissions';
import { UserProfile } from '../../../types';

interface PortalBottomBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentRole: PortalRole;
  userProfile: UserProfile | null;
  onOpenCreateQuote?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenQrScanner?: () => void;
  onSignOut: () => void;
  quotesCount?: number;
  ordersCount?: number;
}

export const PortalBottomBar: React.FC<PortalBottomBarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  userProfile,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onOpenQrScanner,
  onSignOut,
  quotesCount = 0,
  ordersCount = 0
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const roleStyle = PORTAL_ROLE_COLORS[currentRole] || PORTAL_ROLE_COLORS.client;
  const roleLabel = PORTAL_ROLE_LABELS[currentRole] || 'USUARIO';

  // Primary 4 items shown on bottom bar + "Más" drawer button
  const PRIMARY_TABS = [
    { id: 'overview', label: 'Inicio', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText, badge: quotesCount > 0 ? quotesCount : undefined },
    { id: 'orders', label: 'Servicios', icon: Wrench, badge: ordersCount > 0 ? ordersCount : undefined },
    { id: 'livelink', label: 'Mi Flota', icon: Radio }
  ];

  // Secondary tabs shown inside the "Más" drawer
  const SECONDARY_TABS = [
    { id: 'pro', label: 'Club Pro (Puntos)', icon: Crown, requiredPermission: 'canViewProMember' as const },
    { id: 'docs', label: 'Manuales y Fichas', icon: BookOpen, requiredPermission: 'canViewTechDocs' as const },
    { id: 'workflow', label: 'Despacho & Patio', icon: Package, requiredPermission: 'canAccessOfficeWorkflow' as const },
    { id: 'inventory', label: 'Inventario & Repuestos', icon: Package, requiredPermission: 'canViewInventory' as const },
    { id: 'patio', label: 'Control Pistas Km 22', icon: MapPin, requiredPermission: 'canAccessPatio' as const },
    { id: 'integrations', label: 'Conexiones & APIs', icon: Activity, requiredPermission: 'canAccessIntegrations' as const },
    { id: 'metrics', label: 'Reportes de Ventas', icon: BarChart3, requiredPermission: 'canViewRevenueMetrics' as const },
    { id: 'users', label: 'Equipo & Roles', icon: Users, requiredPermission: 'canManageUsers' as const },
    { id: 'audit', label: 'Seguridad & Logs', icon: ShieldCheck, requiredPermission: 'canAccessAuditLog' as const }
  ].filter(tab => !tab.requiredPermission || hasPermission(currentRole, tab.requiredPermission));

  const barContent = (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <nav 
        aria-label="Navegación Móvil del Portal"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/90 px-2 py-1.5 flex items-center justify-around font-mono"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        {PRIMARY_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectTab(tab.id);
                setIsDrawerOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 relative transition-colors cursor-pointer ${
                isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-0" />
              )}
            </button>
          );
        })}

        {/* Drawer Trigger ("Más") */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 relative transition-colors cursor-pointer ${
            isDrawerOpen ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Más</span>
        </button>
      </nav>

      {/* "Más" Drawer Overlay */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in font-mono">
          <div 
            className="bg-zinc-950 border-t border-zinc-800 rounded-t-[5px] p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[2px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                  TMD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Menú Completo del Portal
                  </h4>
                  <p className="text-[10px] text-zinc-400">
                    {userProfile?.displayName || 'Usuario'} · {roleLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              {onOpenCreateQuote && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenCreateQuote();
                  }}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Cotización</span>
                </button>
              )}

              {onOpenNewOrderModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenNewOrderModal();
                  }}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>+ Taller</span>
                </button>
              )}

              {onOpenQrScanner && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenQrScanner();
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 text-cyan-400 font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Escanear Código QR Industrial</span>
                </button>
              )}
            </div>

            {/* Secondary Modules Navigation */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 px-1 block">
                Módulos & Herramientas
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SECONDARY_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(tab.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-[2px] text-left text-xs font-semibold border cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-[2px] bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(barContent, document.body);
  }
  return barContent;
};
