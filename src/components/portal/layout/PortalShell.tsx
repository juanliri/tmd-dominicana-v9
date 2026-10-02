import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Menu, 
  X,
  Search, 
  Radio, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Sun, 
  Moon,
  Plus,
  Wrench,
  Bell,
  HardHat,
  WifiOff,
  RefreshCw,
  LogOut,
  Sliders,
  DollarSign,
  FileText
} from 'lucide-react';
import { PortalSidebar } from './PortalSidebar';
import { PortalBottomBar } from './PortalBottomBar';
import { PortalBreadcrumbs, BreadcrumbItem } from './PortalBreadcrumbs';
import { SessionManager } from '../auth/SessionManager';
import { 
  PortalRole, 
  legacyRoleToPortalRole,
  PORTAL_ROLE_LABELS,
  PORTAL_ROLE_COLORS 
} from '../../../config/portalPermissions';
import { 
  UserProfile, 
  UserRole, 
  PortalQuote, 
  ServiceWorkOrder, 
  RegisteredEquipment, 
  CustomerPurchaseOrder 
} from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { useCart } from '../../../context/CartContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useOfflineSync } from '../../../context/OfflineSyncContext';
import { TMDLogo } from '../../common/BrandLogos';
import { PortalSpotlightModal } from '../PortalSpotlightModal';
import { PortalDetailDrawer, DrawerDetailItem } from '../PortalDetailDrawer';

interface PortalShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userProfile: UserProfile | null;
  role: UserRole;
  simulatedRole?: UserRole | null;
  onSetSimulatedRole?: (role: UserRole | null) => void;
  onSignInAsRole?: (role: 'client' | 'staff' | 'admin', clientId?: string) => Promise<void> | void;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate: (route: string) => void;
  onOpenCreateQuote?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenQrScanner?: () => void;
  onSignOut: () => void;
  quotesCount?: number;
  ordersCount?: number;
  quotes?: PortalQuote[];
  workOrders?: ServiceWorkOrder[];
  fleet?: RegisteredEquipment[];
  purchaseOrders?: CustomerPurchaseOrder[];
  onApproveQuote?: (quoteId: string) => void;
  onRejectQuote?: (quoteId: string) => void;
  drawerItem?: DrawerDetailItem | null;
  onSetDrawerItem?: (item: DrawerDetailItem | null) => void;
  children: React.ReactNode;
}

export const PortalShell: React.FC<PortalShellProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  role,
  simulatedRole,
  onSetSimulatedRole,
  onSignInAsRole,
  breadcrumbs,
  onNavigate,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onOpenQrScanner,
  onSignOut,
  quotesCount = 0,
  ordersCount = 0,
  quotes,
  workOrders,
  fleet,
  purchaseOrders,
  onApproveQuote,
  onRejectQuote,
  drawerItem: drawerItemProp,
  onSetDrawerItem,
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [internalDrawerItem, setInternalDrawerItem] = useState<DrawerDetailItem | null>(null);
  const drawerItem = drawerItemProp !== undefined ? drawerItemProp : internalDrawerItem;
  const setDrawerItem = onSetDrawerItem || setInternalDrawerItem;
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCart();
  const { unreadCount, openNotificationPanel } = useNotifications();
  const { effectiveOnline, isSimulatedOffline, syncState, openVaultModal } = useOfflineSync();

  // Map legacy 3-role (or profile role) to 7-role portal model
  const effectiveLegacyRole: UserRole = simulatedRole || role || 'client';
  const currentPortalRole: PortalRole = legacyRoleToPortalRole(effectiveLegacyRole);
  const roleStyle = PORTAL_ROLE_COLORS[currentPortalRole] || PORTAL_ROLE_COLORS.client;
  const roleLabel = PORTAL_ROLE_LABELS[currentPortalRole] || 'USUARIO';

  // Global Keyboard Shortcuts (Apple / Microsoft Pro Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        onOpenCreateQuote?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && !isInput) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      } else if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenQrScanner, onOpenCreateQuote, isMobileMenuOpen]);

  // Default breadcrumbs based on active tab
  const getTabLabel = (tabId: string): string => {
    switch (tabId) {
      case 'overview': return 'Resumen de Cuenta';
      case 'quotes': return 'Mis Cotizaciones';
      case 'orders': return 'Servicios de Taller';
      case 'purchases': return 'Mis Pedidos';
      case 'livelink': return 'Mi Flota con GPS';
      case 'service': return 'Historial de Mantenimiento';
      case 'pro': return 'Club Pro';
      case 'docs': return 'Manuales y Fichas Técnicas';
      case 'profile': return 'Mis Datos';
      case 'command': return 'Centro de Control';
      case 'office':
      case 'workflow': return 'Despacho & Patio';
      case 'inventory': return 'Inventario & Repuestos';
      case 'patio': return 'Patio Km 22';
      case 'integrations': return 'Conexiones & APIs';
      case 'metrics': return 'Reportes de Ventas';
      case 'users': return 'Equipo & Permisos';
      case 'audit': return 'Seguridad & Logs';
      default: return tabId.toUpperCase();
    }
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: currentPortalRole === 'client' ? 'Mi Portal' : currentPortalRole === 'admin' ? 'Administración' : 'Operaciones' },
    { label: getTabLabel(activeTab), active: true }
  ];

  return (
    <SessionManager onSessionExpired={onSignOut}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-700 dark:selection:text-amber-200">
        
        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="absolute top-3 right-3 z-20">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  title="Cerrar Menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-2">
                <PortalSidebar
                  activeTab={activeTab}
                  onSelectTab={(tabId) => {
                    onSelectTab(tabId);
                    setIsMobileMenuOpen(false);
                  }}
                  userProfile={userProfile}
                  currentRole={currentPortalRole}
                  simulatedRole={simulatedRole}
                  onSetSimulatedRole={onSetSimulatedRole}
                  onSignInAsRole={onSignInAsRole}
                  onOpenCreateQuote={onOpenCreateQuote}
                  onOpenNewOrderModal={onOpenNewOrderModal}
                  onOpenQrScanner={onOpenQrScanner}
                  onSignOut={onSignOut}
                  isCollapsed={false}
                  quotesCount={quotesCount}
                  ordersCount={ordersCount}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 relative overflow-hidden">
          {/* Desktop & Tablet Sidebar */}
          <div className="hidden md:flex shrink-0">
            <PortalSidebar
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              userProfile={userProfile}
              currentRole={currentPortalRole}
              simulatedRole={simulatedRole}
              onSetSimulatedRole={onSetSimulatedRole}
              onSignInAsRole={onSignInAsRole}
              onOpenCreateQuote={onOpenCreateQuote}
              onOpenNewOrderModal={onOpenNewOrderModal}
              onOpenQrScanner={onOpenQrScanner}
              onSignOut={onSignOut}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              quotesCount={quotesCount}
              ordersCount={ordersCount}
            />
          </div>

          {/* Main Content Column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* UNIFIED SINGLE ENTERPRISE COMMAND BAR (56px) */}
            <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
              
              {/* Left Section: Mobile Menu, Brand, Role, Sede Status */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  title="Abrir Menú"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* TMD Brand & Portal Indicator */}
                <button
                  type="button"
                  onClick={() => onNavigate('#/home')}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="Ir al Showroom Público"
                >
                  <TMDLogo variant="icon-only" className="h-7 w-auto group-hover:scale-105 transition-transform" />
                  <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
                  <span className="hidden sm:inline font-black text-xs tracking-wider text-zinc-900 dark:text-white font-display">
                    PORTAL TMD
                  </span>
                </button>

                {/* Role Capsule Badge */}
                <div className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{roleLabel.split(' ')[0]}</span>
                </div>

                {/* Sede Indicator Pill */}
                <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300">Km 22 Duarte</span>
                  <span className="text-zinc-400">· Online</span>
                </div>
              </div>

              {/* Center Section: Global Command Search Trigger */}
              <div className="flex-1 max-w-md mx-2 hidden md:block">
                <div 
                  onClick={() => setIsSpotlightOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900/90 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer shadow-inner"
                  title="Búsqueda Rápida de Cotizaciones, Órdenes, Equipos y NCF (Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate flex-1 text-left">Buscar cotización, equipo, orden, NCF...</span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded border border-zinc-300 dark:border-zinc-700">
                    Ctrl+K
                  </kbd>
                </div>
              </div>

              {/* Right Section: Quick Actions, Currency, Vault, Notifications, Theme, User */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* QuickBooks-style Smart '+ Nuevo' Dropdown */}
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-xs cursor-pointer uppercase shrink-0"
                    title="Crear nuevo elemento"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nuevo</span>
                    <ChevronRight className="w-3 h-3 rotate-90 opacity-60" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                    {onOpenCreateQuote && (
                      <button
                        type="button"
                        onClick={onOpenCreateQuote}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer text-left"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="block">Nueva Proforma B01</span>
                          <span className="text-[10px] text-zinc-400 font-normal">Cotización DGII con NCF</span>
                        </div>
                      </button>
                    )}
                    {onOpenNewOrderModal && (
                      <button
                        type="button"
                        onClick={onOpenNewOrderModal}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer text-left"
                      >
                        <Wrench className="w-4 h-4 text-emerald-500" />
                        <div>
                          <span className="block">Orden de Taller</span>
                          <span className="text-[10px] text-zinc-400 font-normal">Servicio técnico Km 22</span>
                        </div>
                      </button>
                    )}
                    {onOpenQrScanner && (
                      <button
                        type="button"
                        onClick={onOpenQrScanner}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors cursor-pointer text-left border-t border-zinc-100 dark:border-zinc-800"
                      >
                        <Search className="w-4 h-4 text-cyan-500" />
                        <div>
                          <span className="block">Escanear QR</span>
                          <span className="text-[10px] text-zinc-400 font-normal">Maquinaria o repuesto</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="hidden sm:flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currency === 'USD' ? 'bg-amber-400 text-black shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    title="Valuaciones en Dólares USD"
                  >
                    USD
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('DOP')}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      currency === 'DOP' ? 'bg-amber-400 text-black shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                    title="Valuaciones en Pesos Dominicanos RD$"
                  >
                    DOP
                  </button>
                </div>

                {/* Offline PWA Vault */}
                <button
                  type="button"
                  onClick={openVaultModal}
                  className={`p-1.5 rounded border transition-colors cursor-pointer ${
                    !effectiveOnline || isSimulatedOffline
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                      : syncState === 'syncing'
                      ? 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-400'
                  }`}
                  title="Bóveda Técnica Offline PWA & Sincronización"
                >
                  {syncState === 'syncing' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : !effectiveOnline || isSimulatedOffline ? (
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <HardHat className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </button>



                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={openNotificationPanel}
                  className="relative p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Notificaciones Operativas"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>



                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Alternar tema claro/oscuro"
                  className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
                </button>

                {/* User Session Pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                  <div className="hidden lg:block text-right leading-none">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate max-w-[120px]">
                      {userProfile?.displayName || 'Usuario'}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">
                      {roleLabel.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="p-1.5 rounded bg-zinc-100 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Breadcrumb Row */}
            <div className="px-4 sm:px-6 lg:px-8 pt-3">
              <PortalBreadcrumbs
                items={defaultBreadcrumbs}
                currentRole={currentPortalRole}
                onNavigate={onNavigate}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 pb-24 md:pb-12 w-full max-w-[1780px] mx-auto space-y-4">
              {children}
            </main>

            {/* Portal Operational Footer */}
            <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 px-4 sm:px-8 py-3 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
              <p className="font-bold text-zinc-700 dark:text-zinc-400 tracking-wider">
                TECNOMAQUINARIAS DOMINICANA S.R.L. · RNC 1-31-88492-1
              </p>
              <p className="text-[11px]">
                Sede Central: Autopista Duarte Km 22, Santo Domingo Oeste · Soporte Técnico 24/7: +1 (829) 555-0192
              </p>
            </footer>
          </div>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <PortalBottomBar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          currentRole={currentPortalRole}
          userProfile={userProfile}
          onOpenCreateQuote={onOpenCreateQuote}
          onOpenNewOrderModal={onOpenNewOrderModal}
          onOpenQrScanner={onOpenQrScanner}
          onSignOut={onSignOut}
          quotesCount={quotesCount}
          ordersCount={ordersCount}
        />

        {/* Global Apple/Raycast Spotlight Command Palette (Ctrl+K) */}
        <PortalSpotlightModal
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          onSelectTab={onSelectTab}
          onOpenCreateQuote={onOpenCreateQuote}
          onOpenNewOrderModal={onOpenNewOrderModal}
          onOpenQrScanner={onOpenQrScanner}
          onSelectQuote={(q) => setDrawerItem({ type: 'quote', data: q })}
          quotes={quotes}
          workOrders={workOrders}
          fleet={fleet}
          purchaseOrders={purchaseOrders}
          onSignInAsRole={onSignInAsRole}
        />

        {/* Outlook 365 / Linear Style Side-Peek Detail Drawer */}
        <PortalDetailDrawer
          isOpen={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          item={drawerItem}
          onApproveQuote={onApproveQuote}
          onRejectQuote={onRejectQuote}
          isStaffOrAdmin={effectiveLegacyRole === 'staff' || effectiveLegacyRole === 'admin'}
        />
      </div>
    </SessionManager>
  );
};
