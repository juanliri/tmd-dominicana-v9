import React, { useState } from 'react';
import { 
  Building2, 
  Menu, 
  Search, 
  Radio, 
  ExternalLink, 
  ShieldCheck, 
  Maximize2,
  ChevronRight,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { PortalSidebar } from './PortalSidebar';
import { PortalBottomBar } from './PortalBottomBar';
import { PortalBreadcrumbs, BreadcrumbItem } from './PortalBreadcrumbs';
import { SessionManager } from '../auth/SessionManager';
import { PortalRole, legacyRoleToPortalRole } from '../../../config/portalPermissions';
import { UserProfile, UserRole } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';

interface PortalShellProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  userProfile: UserProfile | null;
  role: UserRole;
  simulatedRole?: UserRole | null;
  onSetSimulatedRole?: (role: UserRole | null) => void;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate: (route: string) => void;
  onOpenCreateQuote?: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenQrScanner?: () => void;
  onSignOut: () => void;
  quotesCount?: number;
  ordersCount?: number;
  children: React.ReactNode;
}

export const PortalShell: React.FC<PortalShellProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  role,
  simulatedRole,
  onSetSimulatedRole,
  breadcrumbs,
  onNavigate,
  onOpenCreateQuote,
  onOpenNewOrderModal,
  onOpenQrScanner,
  onSignOut,
  quotesCount = 0,
  ordersCount = 0,
  children
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Map legacy 3-role (or profile role) to 7-role portal model
  const effectiveLegacyRole: UserRole = simulatedRole || role || 'client';
  const currentPortalRole: PortalRole = legacyRoleToPortalRole(effectiveLegacyRole);

  // Default breadcrumbs based on active tab
  const getTabLabel = (tabId: string): string => {
    switch (tabId) {
      case 'overview': return 'Panel Resumen';
      case 'quotes': return 'Cotizaciones B01';
      case 'orders': return 'Órdenes de Servicio';
      case 'purchases': return 'Historial de Compras';
      case 'livelink': return 'Telemetría Flota LiveLink™';
      case 'service': return 'Historial de Taller Km 22';
      case 'pro': return 'Club Pro TMD';
      case 'docs': return 'Bóveda Técnica';
      case 'profile': return 'Perfil Corporativo';
      case 'command': return 'Centro de Mando';
      case 'office':
      case 'workflow': return 'Oficina & Facturas NCF';
      case 'inventory': return 'Inventario & Repuestos';
      case 'patio': return 'Patio Km 22 GPS';
      case 'metrics': return 'Métricas Financieras DGII';
      case 'users': return 'Gestión RBAC';
      case 'audit': return 'Auditoría de Seguridad';
      default: return tabId.toUpperCase();
    }
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = breadcrumbs || [
    { label: currentPortalRole === 'client' ? 'Cliente' : currentPortalRole === 'admin' ? 'Admin HQ' : 'Operaciones' },
    { label: getTabLabel(activeTab), active: true }
  ];

  return (
    <SessionManager onSessionExpired={onSignOut}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-700 dark:selection:text-amber-200">
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
            {/* Top Compact Bar */}
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  title="Abrir Menú"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Sede Indicator Pill */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-zinc-900 dark:text-white">Km 22 Duarte</span>
                  <span className="text-zinc-500 dark:text-zinc-400">· Taller HD Activo</span>
                </div>
              </div>

              {/* Top Actions: Public Showroom Return + Theme Toggle + Quick Contact */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Alternar tema claro/oscuro"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('#/home')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  title="Volver al Catálogo Público"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="hidden sm:inline">Showroom</span>
                </button>

                {onOpenQrScanner && (
                  <button
                    type="button"
                    onClick={onOpenQrScanner}
                    className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 transition-colors cursor-pointer"
                    title="Escanear Código QR"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
            </header>

            {/* Breadcrumb Row */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4">
              <PortalBreadcrumbs
                items={defaultBreadcrumbs}
                currentRole={currentPortalRole}
                onNavigate={onNavigate}
              />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 px-4 sm:px-6 lg:px-10 xl:px-12 py-5 pb-24 md:pb-12 w-full max-w-[1780px] mx-auto space-y-6">
              {children}
            </main>

            {/* Portal Operational Footer */}
            <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 px-4 sm:px-8 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
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
      </div>
    </SessionManager>
  );
};
