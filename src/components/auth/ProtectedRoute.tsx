import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn, RefreshCw, UserCheck, Shield, ArrowRight, Lock, Home, ChevronRight, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../types';

export type RequiredRoleType = 
  | 'client' 
  | 'staff' 
  | 'admin' 
  | 'staff_or_admin' 
  | 'CLIENT' 
  | 'STAFF' 
  | 'ADMIN' 
  | UserRole[];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RequiredRoleType;
  fallbackRoute?: string;
  autoRedirect?: boolean;
  onNavigate?: (route: string) => void;
  customDeniedMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'staff_or_admin',
  fallbackRoute = '#/portal',
  autoRedirect = false,
  onNavigate,
  customDeniedMessage
}) => {
  const { currentUser, role, isStaff, isAdmin, isClient, hasRole, loading, signInWithGoogle, setSimulatedRole } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Calculate permission based on requested role
  const checkHasPermission = (): boolean => {
    if (!currentUser) return false;

    if (Array.isArray(requiredRole)) {
      return hasRole(requiredRole);
    }

    const norm = (requiredRole || 'staff_or_admin').toLowerCase();
    if (norm === 'admin') {
      return isAdmin;
    }
    if (norm === 'staff' || norm === 'staff_or_admin') {
      return isStaff || isAdmin;
    }
    if (norm === 'client') {
      return isClient || isStaff || isAdmin;
    }

    return false;
  };

  const hasPermission = checkHasPermission();

  // Handle auto-redirect if configured
  useEffect(() => {
    if (!loading && currentUser && !hasPermission && autoRedirect && onNavigate) {
      setRedirectCountdown(5);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onNavigate(fallbackRoute);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, currentUser, hasPermission, autoRedirect, fallbackRoute, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            Validando Credenciales
          </h3>
          <p className="text-xs text-zinc-500">Comprobando jerarquía y permisos de rol...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Autenticación Requerida
            </span>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Inicio de Sesión Requerido
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Debe autenticarse con su cuenta institucional o corporativa de TMD Dominicana para acceder a este módulo operativo.
            </p>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión con Google</span>
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('#/home')}
              className="text-[11px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Volver a la página principal</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Permission Denied for Authenticated User
  if (!hasPermission) {
    const requiredLabel = 
      typeof requiredRole === 'string' && (requiredRole.toLowerCase() === 'admin') 
        ? 'Administrador TMD HQ' 
        : 'Personal Técnico & Comercial TMD (Staff)';

    const userRoleDisplay = (role || 'client').toUpperCase();

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                Acceso Restringido a Staff TMD
              </span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Permiso Insuficiente
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {customDeniedMessage || (
                <>
                  Su cuenta <strong className="text-zinc-800 dark:text-zinc-200">{currentUser.email}</strong> está identificada con el rol de <strong className="font-mono text-rose-600 dark:text-rose-400">{userRoleDisplay}</strong>. Este panel operativo, el centro de comando y la administración interna están reservados exclusivamente para el rol <strong className="text-zinc-800 dark:text-zinc-200">{requiredLabel}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Diagnostic Role Matrix */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-left space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-semibold">Tu cuenta actual:</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-semibold">Rol activo detectado:</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {userRoleDisplay}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-semibold">Rol mínimo requerido:</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {requiredLabel}
              </span>
            </div>
          </div>

          {/* Action and Navigation Buttons */}
          <div className="space-y-2.5 pt-1">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate(fallbackRoute)}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {redirectCountdown !== null && redirectCountdown > 0 
                    ? `Redirigiendo a Portal de Clientes (${redirectCountdown}s)...` 
                    : 'Ir al Portal de Clientes'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('#/machinery')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explorar Catálogo de Maquinaria</span>
              </button>
            )}

            {/* Role Demo Simulator Switcher (Restricted to genuine Admins or Local Dev Environment) */}
            {(realRole === 'admin' || import.meta.env.DEV) && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Simulador de Roles (Entorno Demo):
                  </span>
                  <span className="text-[9px] font-bold text-amber-500">Pruebas en vivo</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('client')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-black transition-colors cursor-pointer text-center ${
                      role === 'client' ? 'bg-amber-500 text-black shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    CLIENTE
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('staff')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-black transition-colors cursor-pointer text-center ${
                      role === 'staff' ? 'bg-amber-500 text-black shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    STAFF TMD
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedRole('admin')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-black transition-colors cursor-pointer text-center ${
                      role === 'admin' ? 'bg-amber-500 text-black shadow-xs' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    ADMIN HQ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
