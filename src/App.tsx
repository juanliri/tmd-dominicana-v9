/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HomeView } from './components/HomeView';
import { MachineryView } from './components/MachineryView';
import { PartsView } from './components/PartsView';
import { ServicesView } from './components/ServicesView';
import { AboutView } from './components/AboutView';
import { CheckoutView } from './components/CheckoutView';
import { QuickSearchModal } from './components/QuickSearchModal';
import { GlobalCommandPaletteModal } from './components/common/GlobalCommandPaletteModal';
import { MachineComparisonModal } from './components/MachineComparisonModal';
import { ComparisonFloatingBar } from './components/ComparisonFloatingBar';
import { Footer } from './components/Footer';
import { PortalView } from './components/PortalView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToastBanner } from './components/NotificationToastBanner';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AmbientCanvas } from './components/AmbientCanvas';
import { SpotlightGlow } from './components/SpotlightGlow';
import { LiveLinkTelematicsDashboard } from './components/telematics/LiveLinkTelematicsDashboard';
import { FullbayShopManager } from './components/shop/FullbayShopManager';
import { RentalFleetView } from './components/rental/RentalFleetView';
import { OilLabDiagnosticsView } from './components/fluids/OilLabDiagnosticsView';
import { TechnicalDocsView } from './components/docs/TechnicalDocsView';
import { OperatorAcademyView } from './components/academy/OperatorAcademyView';
import { RemanCenterView } from './components/reman/RemanCenterView';
import { TradeInUsadosView } from './components/tradein/TradeInUsadosView';
import { TcoCalculatorView } from './components/calculator/TcoCalculatorView';
import { PmaContractsView } from './components/pma/PmaContractsView';
import { EmergencyDispatchView } from './components/emergency/EmergencyDispatchView';
import { CarbonFootprintView } from './components/carbon/CarbonFootprintView';
import { HelpSupportView } from './components/help/HelpSupportView';
import { BranchesContactView } from './components/branches/BranchesContactView';
import { FinancingLeasingView } from './components/financing/FinancingLeasingView';
import { OfficialWarrantyView } from './components/warranty/OfficialWarrantyView';
import { ProjectsCaseStudiesView } from './components/projects/ProjectsCaseStudiesView';
import { BioLinkView } from './components/BioLinkView';
import { OfflinePartsDocsManager } from './components/pwa/OfflinePartsDocsManager';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import { OfflineVaultModal } from './components/pwa/OfflineVaultModal';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { GuidedWalkthroughTour } from './components/tour/GuidedWalkthroughTour';
import { ProductQrScannerModal } from './components/ProductQrScannerModal';
import { FloatingActionOrchestrator } from './components/common/actions/FloatingActionOrchestrator';
import { IndustrialScrollProgressBar } from './components/effects/IndustrialScrollProgressBar';
import { MachineryHubView } from './components/hub/MachineryHubView';
import { PartsHubView } from './components/hub/PartsHubView';
import { RentalHubView } from './components/hub/RentalHubView';
import { ServicesHubView } from './components/hub/ServicesHubView';
import { BrandsDirectoryView } from './components/hub/BrandsDirectoryView';
import { useScrollReveal } from './hooks/useScrollReveal';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Sparkles } from 'lucide-react';
import { SiteNavigation } from './config';

function AppContent() {
  const parseUrlState = () => {
    if (typeof window === 'undefined') return { route: '#/home', machineId: null, partId: null };
    
    const fullHash = window.location.hash || '#/home';
    const [routePath, queryString] = fullHash.split('?');
    const searchParams = new URLSearchParams(queryString || (typeof window !== 'undefined' ? window.location.search : ''));
    
    let mId = searchParams.get('id') || searchParams.get('productId') || searchParams.get('machineId');
    let pId = searchParams.get('id') || searchParams.get('productId') || searchParams.get('partId');

    if (routePath.startsWith('#/machinery/')) {
      mId = routePath.replace('#/machinery/', '');
    } else if (routePath.startsWith('#/parts/')) {
      pId = routePath.replace('#/parts/', '');
    }

    const resolved = SiteNavigation.resolve(routePath);

    return {
      route: resolved.canonicalPath,
      machineId: mId,
      partId: pId
    };
  };

  const initialUrlState = parseUrlState();
  const [currentRoute, setCurrentRoute] = useState<string>(initialUrlState.route);
  
  // Global IntersectionObserver scroll reveal for content come-up animations across mobile/desktop
  useScrollReveal(currentRoute);

  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(initialUrlState.machineId);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(initialUrlState.partId);
  const [selectedFullbayOrderId, setSelectedFullbayOrderId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const { notification, dismissNotification } = useCart();

  // Dynamic route resolution using typed registry
  const currentRouteDef = SiteNavigation.resolve(currentRoute);
  const activeRoute = currentRouteDef.canonicalPath;
  const viewId = currentRouteDef.id;
  const isBioView = viewId === 'bio' || currentRoute === '#/bio' || currentRoute === '#/links';
  const isCheckoutView = viewId === 'checkout';
  const isAdminView = currentRouteDef.category === 'admin';
  const isWorkspaceView = currentRouteDef.category === 'operations' && ['livelink', 'fullbay'].includes(viewId);
  const isPortalView = viewId === 'portal';
  const isComparisonEligible = Boolean(currentRouteDef.isEligibleForComparison) && !isBioView;
  const isPublicShowroom = !isCheckoutView && !isAdminView && !isWorkspaceView && !isPortalView && !isBioView;

  // Single-source render engine guaranteeing mutually exclusive view rendering
  const renderCurrentView = () => {
    switch (viewId) {
      case 'machinery':
        return (
          <MachineryView
            onNavigate={navigateTo}
            selectedMachineId={selectedMachineId}
            onClearSelectedMachine={() => setSelectedMachineId(null)}
          />
        );
      case 'machinery-hub':
        return <MachineryHubView onNavigate={navigateTo} />;
      case 'parts-hub':
        return <PartsHubView onNavigate={navigateTo} />;
      case 'rental-hub':
        return <RentalHubView onNavigate={navigateTo} />;
      case 'services-hub':
        return <ServicesHubView onNavigate={navigateTo} />;
      case 'brands-directory':
        return <BrandsDirectoryView onNavigate={navigateTo} />;
      case 'parts':
        return (
          <PartsView
            onNavigate={navigateTo}
            selectedPartId={selectedPartId}
            onClearSelectedPart={() => setSelectedPartId(null)}
          />
        );
      case 'livelink':
        return (
          <ProtectedRoute requiredRole="staff" onNavigate={navigateTo}>
            <LiveLinkTelematicsDashboard 
              onOpenFullbayWorkOrder={(orderId) => {
                if (orderId) setSelectedFullbayOrderId(orderId);
                navigateTo('#/fullbay');
              }} 
            />
          </ProtectedRoute>
        );
      case 'fullbay':
        return (
          <ProtectedRoute requiredRole="staff" onNavigate={navigateTo}>
            <FullbayShopManager 
              initialSelectedOrderId={selectedFullbayOrderId || undefined}
              onNavigateToLiveLink={() => {
                navigateTo('#/livelink');
              }}
            />
          </ProtectedRoute>
        );
      case 'service':
        return <ServicesView onNavigate={navigateTo} />;
      case 'rental':
        return <RentalFleetView onNavigate={navigateTo} />;
      case 'oil-lab':
        return <OilLabDiagnosticsView onNavigate={navigateTo} />;
      case 'tech-docs':
        return <TechnicalDocsView onNavigate={navigateTo} />;
      case 'academy':
        return <OperatorAcademyView onNavigate={navigateTo} />;
      case 'reman':
        return <RemanCenterView onNavigate={navigateTo} />;
      case 'trade-in':
        return <TradeInUsadosView onNavigate={navigateTo} />;
      case 'tco':
        return <TcoCalculatorView onNavigate={navigateTo} />;
      case 'pma-contracts':
        return <PmaContractsView onNavigate={navigateTo} />;
      case 'emergency':
        return <EmergencyDispatchView onNavigate={navigateTo} />;
      case 'carbon-footprint':
        return <CarbonFootprintView onNavigate={navigateTo} />;
      case 'help':
        return <HelpSupportView onNavigate={navigateTo} />;
      case 'about':
        return <AboutView onNavigate={navigateTo} />;
      case 'branches':
        return <BranchesContactView onNavigate={navigateTo} />;
      case 'financing':
        return <FinancingLeasingView onNavigate={navigateTo} />;
      case 'warranty':
        return <OfficialWarrantyView onNavigate={navigateTo} />;
      case 'projects':
        return <ProjectsCaseStudiesView onNavigate={navigateTo} />;
      case 'bio':
        return (
          <BioLinkView 
            onNavigate={navigateTo} 
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        );
      case 'checkout':
        return <CheckoutView onNavigate={navigateTo} />;
      case 'portal':
        return (
          <PortalView
            onNavigate={navigateTo}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        );
      case 'ops':
      case 'staff':
        return (
          <ProtectedRoute requiredRole="staff" onNavigate={navigateTo}>
            <PortalView
              onNavigate={navigateTo}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
          </ProtectedRoute>
        );
      case 'admin':
      case 'admin-dashboard':
        return (
          <ProtectedRoute requiredRole="admin" onNavigate={navigateTo}>
            <AdminDashboardView onNavigate={navigateTo} />
          </ProtectedRoute>
        );
      case 'offline-vault':
        return <OfflinePartsDocsManager />;
      case 'home':
      default:
        return (
          <HomeView
            onNavigate={navigateTo}
            onSelectMachine={handleSelectMachine}
          />
        );
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseUrlState();
      setCurrentRoute(parsed.route);
      if (parsed.machineId) {
        setSelectedMachineId(parsed.machineId);
      }
      if (parsed.partId) {
        setSelectedPartId(parsed.partId);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Shortcuts: Cmd+K (Search), Cmd+Shift+Q (QR), Cmd+M (Machinery), Cmd+P (Parts), Cmd+T (Service), Cmd+Q (Checkout), Cmd+L (Portal), Esc (Close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes open modals first
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsQrScannerOpen(false);
        setIsTourOpen(false);
        return;
      }

      // Check if user is typing in an active text input or editable element
      const target = e.target as HTMLElement | null;
      const isInputFocused = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Search and QR scanner can be triggered anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setIsQrScannerOpen((prev) => !prev);
        return;
      }

      // If typing inside an input field, do not hijack normal typing shortcuts
      if (isInputFocused) return;

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            navigateTo('#/machinery');
            break;
          case 'p':
            e.preventDefault();
            navigateTo('#/parts');
            break;
          case 't':
            e.preventDefault();
            navigateTo('#/service');
            break;
          case 'q':
            e.preventDefault();
            navigateTo('#/checkout');
            break;
          case 'l':
            e.preventDefault();
            navigateTo('#/portal');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (route: string) => {
    if (route === '#official-company-video' || route === '#/about#official-company-video') {
      window.location.hash = '#/about';
      setCurrentRoute('#/about');
      setTimeout(() => {
        const el = document.getElementById('official-company-video');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return;
    }

    const [routePath, queryString] = route.split('?');
    let mId: string | null = null;
    let pId: string | null = null;

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      mId = searchParams.get('id') || searchParams.get('productId') || searchParams.get('machineId');
      pId = searchParams.get('id') || searchParams.get('productId') || searchParams.get('partId');
    }

    if (routePath.startsWith('#/machinery/')) {
      mId = routePath.replace('#/machinery/', '');
    } else if (routePath.startsWith('#/parts/')) {
      pId = routePath.replace('#/parts/', '');
    }

    const resolved = SiteNavigation.resolve(routePath);
    const normalized = resolved.canonicalPath;

    if (mId) setSelectedMachineId(mId);
    if (pId) setSelectedPartId(pId);

    window.location.hash = route;
    setCurrentRoute(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    navigateTo('#/machinery');
  };

  const handleSelectPart = (partId: string) => {
    setSelectedPartId(partId);
    navigateTo('#/parts');
  };

  const handleNavigateToScannedProduct = (type: 'machinery' | 'part', id: string) => {
    if (type === 'machinery') {
      handleSelectMachine(id);
    } else {
      handleSelectPart(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-zinc-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Top Telemetry Scroll Progress Bar (Gold #FFB800) */}
      <IndustrialScrollProgressBar />

      {/* Heavy Engineering Ambient Particle Background Canvas */}
      <AmbientCanvas />

      {/* Industrial Luxury Spotlight Glow Layer */}
      <SpotlightGlow />

      {/* Top Header with Contextual Modes (Public vs Focus/Checkout vs Workspace/Portal vs Bio Link Standalone) */}
      {!isBioView && (
        <Header
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {/* Main Viewport Content with Smooth Page Transitions */}
      <main className="flex-1 w-full relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-full will-change-transform"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Progressive Web App Install Banner (Public & Portal only; hidden in Bio view) */}
      {!isAdminView && !isCheckoutView && !isBioView && <PwaInstallPrompt />}

      {/* PWA Offline Technical Vault Modal */}
      <OfflineVaultModal />

      {/* Toast Notification Alert */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 py-2.5 px-3.5 rounded-[5px] bg-zinc-900 text-zinc-100 shadow-2xl border border-zinc-800 animate-in slide-in-from-top duration-200 text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
          <button
            type="button"
            onClick={dismissNotification}
            className="p-1 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer text-xs ml-1"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigateTo}
        onSelectMachine={handleSelectMachine}
        onSelectPart={handleSelectPart}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />

      {/* Task #1: Global Power User Command Palette Modal */}
      <GlobalCommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigateTo}
        onSelectMachine={handleSelectMachine}
      />

      {/* Industrial QR Code Scanner Modal for Staff & Yard Operations */}
      <ProductQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onNavigateToProduct={handleNavigateToScannedProduct}
      />

      {/* Side-by-Side Machinery Comparison Modal */}
      <MachineComparisonModal onNavigate={navigateTo} />

      {/* Real-time Push & In-App Toast Banner */}
      <NotificationToastBanner onNavigate={navigateTo} />

      {/* Floating Active Comparison Dock (Rendered contextually on catalog views) */}
      {isComparisonEligible && <ComparisonFloatingBar />}

      {/* Floating 24/7 Gemini Chatbot & Support Dock (Public Showroom only; suppressed in Portal, Workspaces, Admin, Checkout and Bio) */}
      {isPublicShowroom && <ChatbotWidget onNavigate={navigateTo} />}

      {/* Floating Action Layer Orchestrator (Public Showroom only; suppressed in Portal, Workspaces, Admin, Checkout and Bio) */}
      {isPublicShowroom && (
        <FloatingActionOrchestrator
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />
      )}

      {/* Adaptive Useful Footer (Hidden on Bio Link, Portal and Admin views) */}
      {!isBioView && !isPortalView && !isAdminView && <Footer onNavigate={navigateTo} currentRoute={currentRoute} />}

      {/* Guided Walkthrough Tour Modal (Controlled via menu/help, no intrusive floating bubble) */}
      <GuidedWalkthroughTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Ergonomic Mobile Bottom Nav Bar (Contextually hidden in Checkout, Admin, Bio and heavy Workspaces) */}
      {!isBioView && (
        <MobileNav
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ComparisonProvider>
            <NotificationProvider>
              <OfflineSyncProvider>
                <AppContent />
              </OfflineSyncProvider>
            </NotificationProvider>
          </ComparisonProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
