import React from 'react';
import { Home, HardHat, Cog, ShoppingBag, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate }) => {
  const { totalCartCount, totalQuotesCount } = useCart();
  const { isAdmin, isStaff } = useAuth();
  const totalItems = totalCartCount + totalQuotesCount;

  // Contextual check: Hide bottom nav in focused checkout, authenticated portal (which has its own PortalBottomBar), or specialized workspaces/admin consoles
  const isContextualWorkspaceOrAdmin = [
    '#/checkout',
    '#/admin',
    '#/admin-dashboard',
    '#/portal',
    '#/fullbay',
    '#/livelink'
  ].includes(currentRoute) || currentRoute.startsWith('#/portal') || currentRoute.startsWith('#/admin');

  if (isContextualWorkspaceOrAdmin) {
    return null;
  }

  const items = [
    { label: 'INICIO', route: '#/home', icon: Home },
    { label: 'EQUIPOS', route: '#/machinery', icon: HardHat },
    { label: 'REPUESTOS', route: '#/parts', icon: Cog },
    { 
      label: isAdmin ? 'ADMIN' : isStaff ? 'OFICINA' : 'PORTAL', 
      route: '#/portal', 
      icon: Shield 
    },
    { label: 'COTIZAR', route: '#/checkout', icon: ShoppingBag, badge: totalItems },
  ];

  return (
    <nav 
      aria-label="Navegación Móvil Principal"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.8)] font-display"
    >
      <div className="grid grid-cols-5 h-14 items-center px-2 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = currentRoute === item.route || (item.route === '#/home' && (currentRoute === '' || currentRoute === '#' || currentRoute === '#/'));
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`relative flex flex-col items-center justify-center w-full h-full pt-1 pb-1 select-none transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#e0a22a] font-black'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4.5 h-4.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5] text-[#e0a22a]' : 'stroke-[1.8]'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 bg-[#d99b26] text-black text-[10px] font-black rounded-[2px] flex items-center justify-center border border-black shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider mt-1 line-clamp-1">
                {item.label}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="mobileActiveNavPill"
                  className="absolute bottom-0 w-6 h-0.5 bg-[#e0a22a] rounded-t-[1px] shadow-[0_0_8px_rgba(224,162,42,0.8)]" 
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
