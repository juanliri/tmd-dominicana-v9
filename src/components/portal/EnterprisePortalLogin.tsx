import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Fingerprint, 
  LogIn, 
  Activity, 
  Wrench, 
  FileText, 
  Lock, 
  Radio, 
  HardHat, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../../types';
import { TMDLogo } from '../common/BrandLogos';
import portalBgMachinery from '../../assets/images/portal_bg_machinery_1790441100418.jpg';

interface EnterprisePortalLoginProps {
  onSignInWithGoogle: () => Promise<void>;
  onOpenBiometrics: () => void;
  loading: boolean;
  storedBiometricKeysCount: number;
  onNavigate: (route: string) => void;
  onQuickAccess?: (role: UserRole) => void;
}

// =========================================================================
// HARDWARE-ACCELERATED AMBER EMBER ENGINE (RESPONSIVE FOR MOBILE & TABLET)
// =========================================================================
interface AmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}

const PortalParticleCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const particles: AmberParticle[] = [];
    // Adaptive count: Fewer particles on smaller screens to ensure 60fps scrolling
    const count = width < 640 ? 18 : width < 1024 ? 30 : 48;
    const palette = ['#fbbf24', '#f59e0b', '#d97706', '#fef3c7', '#ffffff'];

    const createParticle = (): AmberParticle => {
      const maxLife = 160 + Math.random() * 200;
      return {
        x: Math.random() * width,
        y: height + Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.35 + Math.random() * 0.75), // Gentle upward drift
        size: 0.8 + Math.random() * 2.0,
        alpha: 0,
        maxAlpha: 0.18 + Math.random() * 0.35,
        life: 0,
        maxLife,
        color: palette[Math.floor(Math.random() * palette.length)]
      };
    };

    for (let i = 0; i < count; i++) {
      const p = createParticle();
      p.y = Math.random() * (height || 800);
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.8) {
          p.alpha = ((1 - progress) / 0.2) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      style={{ mixBlendMode: 'screen', touchAction: 'none' }}
    />
  );
};

export const EnterprisePortalLogin: React.FC<EnterprisePortalLoginProps> = ({
  onSignInWithGoogle,
  onOpenBiometrics,
  loading,
  storedBiometricKeysCount,
  onNavigate,
  onQuickAccess
}) => {
  // Ambient Particles & Deep Frosted Glass
  const [particlesAndGlass, setParticlesAndGlass] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role toggle: Contractor vs Staff
  const [activeRoleTab, setActiveRoleTab] = useState<'contractor' | 'staff'>('contractor');

  // Network latency monitor
  const [liveLatency, setLiveLatency] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLatency(12 + Math.floor(Math.random() * 5));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError('Por favor ingrese su correo corporativo o ID de cliente.');
      return;
    }

    setIsSubmitting(true);

    const lowerEmail = email.toLowerCase().trim();
    if (lowerEmail.includes('admin') || lowerEmail.includes('jliriano') || lowerEmail.includes('jayh') || lowerEmail.includes('todobuild')) {
      if (onQuickAccess) {
        onQuickAccess('admin');
        setIsSubmitting(false);
        return;
      }
    } else if (lowerEmail.includes('staff') || lowerEmail.includes('tecnico') || lowerEmail.includes('taller')) {
      if (onQuickAccess) {
        onQuickAccess('staff');
        setIsSubmitting(false);
        return;
      }
    } else if (lowerEmail.length > 3) {
      if (onQuickAccess) {
        onQuickAccess('client');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSignInWithGoogle();
    } catch {
      setFormError('Verificación no completada. Puede utilizar el Acceso Biométrico o Google SSO.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (role: 'client' | 'staff' | 'admin') => {
    if (role === 'client') {
      setEmail('operaciones@constructora-rd.com');
      setPassword('••••••••••••');
      setActiveRoleTab('contractor');
    } else if (role === 'staff') {
      setEmail('tecnico.taller@tmd.com.do');
      setPassword('••••••••••••');
      setActiveRoleTab('staff');
    } else {
      setEmail('gerencia@tmd.com.do');
      setPassword('••••••••••••');
      setActiveRoleTab('staff');
    }
    setFormError(null);
  };

  const [activeMobileView, setActiveMobileView] = useState<'terminal' | 'info'>('terminal');

  return (
    <div className="w-full flex-1 h-[calc(100dvh-60px)] lg:h-[calc(100vh-60px)] max-h-screen bg-zinc-950 text-white font-mono flex flex-col relative selection:bg-amber-400 selection:text-black overflow-hidden">
      
      {/* Cinematic Heavy Machinery Background Image (No text, pure industrial power) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 brightness-110 contrast-105"
        style={{ backgroundImage: `url(${portalBgMachinery})` }}
      >
        {/* Balanced cinematic atmospheric gradient - machinery is vivid & clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-zinc-950/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/35" />
      </div>

      {/* Hardware-Accelerated Ambient Ember Particle Canvas */}
      <PortalParticleCanvas active={particlesAndGlass} />

      {/* Ambient Volumetric Radial Spotlight Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-amber-400/8 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Mobile/Tablet Ergonomic Top Switcher (Visible only on < lg) */}
      <div className="lg:hidden relative z-30 w-full px-3 py-1.5 flex items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
          <button
            type="button"
            onClick={() => setActiveMobileView('terminal')}
            className={`px-3 py-1 rounded-[3px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
              activeMobileView === 'terminal'
                ? 'bg-amber-400 text-black font-black shadow-sm'
                : 'bg-zinc-900/90 text-zinc-300 border border-white/10'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>TERMINAL ACCESO</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('info')}
            className={`px-3 py-1 rounded-[3px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
              activeMobileView === 'info'
                ? 'bg-amber-400 text-black font-black shadow-sm'
                : 'bg-zinc-900/90 text-zinc-300 border border-white/10'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>OPERACIONES RD</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setParticlesAndGlass(!particlesAndGlass)}
          className={`p-1.5 rounded-[3px] border transition-all touch-manipulation cursor-pointer ${
            particlesAndGlass 
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-400' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}
          title="Alternar atmósfera"
        >
          <Flame className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container - Full height, No scrolling */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative z-10 overflow-hidden h-[calc(100%-42px)] lg:h-full">

        {/* =====================================================================
            LEFT PANEL: ENTERPRISE INFO & OPERATIONAL PILLARS (Desktop & Mobile View)
            ===================================================================== */}
        <div 
          className={`relative w-full lg:w-[54%] p-3.5 sm:p-5 lg:p-6 xl:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-transparent z-10 h-full overflow-hidden ${
            activeMobileView === 'info' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top Header: Official Certification & Title */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PORTAL DE CLIENTES & CONTRATISTAS</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono uppercase inline-block px-1.5 py-0.5 rounded bg-zinc-900/60 border border-white/10">
                RNC 1-31-89421-5 • DGII B01
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-2xl xl:text-3xl font-black text-white uppercase tracking-tight font-display leading-tight">
                CENTRO DE OPERACIONES & TELEMETRÍA
                <span className="block text-amber-400 text-xs sm:text-base font-bold mt-0.5 tracking-normal font-sans">
                  Soporte Central, Telemetría Satelital & Facturación Fiscal en RD
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-300 font-sans leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
                Acceso unificado para contratistas viales, empresas constructoras y operadores de minería. Monitoree su flota de maquinaria pesada, descargue comprobantes fiscales DGII B01 y gestione servicios de taller desde un solo lugar.
              </p>
            </div>
          </div>

          {/* Middle Section: 4-Pillar Enterprise Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 my-auto max-w-2xl">
            {/* Feature 1: LiveLink Telemetry */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/70 backdrop-blur-xl border border-white/10 hover:border-amber-400/30 transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] sm:text-xs uppercase tracking-wide">
                <div className="p-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span>Telemetría LiveLink™</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 font-sans leading-snug">
                Monitoreo satelital de horómetros en tiempo real, alertas de diagnóstico y geolocalización en obra.
              </p>
            </div>

            {/* Feature 2: Fiscal Invoicing B01 */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/70 backdrop-blur-xl border border-white/10 hover:border-amber-400/30 transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] sm:text-xs uppercase tracking-wide">
                <div className="p-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>Facturación Fiscal B01</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 font-sans leading-snug">
                Descarga de cotizaciones formales, comprobantes DGII y estados de cuenta al instante.
              </p>
            </div>

            {/* Feature 3: Central Workshop Km 22 */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/70 backdrop-blur-xl border border-white/10 hover:border-amber-400/30 transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] sm:text-xs uppercase tracking-wide">
                <div className="p-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span>Taller Km 22 & Campo</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 font-sans leading-snug">
                Pruebas hidráulicas a 350 bar, banco de carga y despacho de cuadrillas técnicas 4x4.
              </p>
            </div>

            {/* Feature 4: S.O.S. Lab & OEM Parts */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/70 backdrop-blur-xl border border-white/10 hover:border-amber-400/30 transition-all space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] sm:text-xs uppercase tracking-wide">
                <div className="p-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span>Laboratorio S.O.S. & OEM</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-300 font-sans leading-snug">
                Análisis espectrométrico de fluidos ISO 4406 y repuestos genuinos certificados.
              </p>
            </div>
          </div>

          {/* Bottom Security & Hotline Strip */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-zinc-400 font-sans">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Patio Km 22 Autopista Duarte • Mesa de Ayuda: <a href="tel:18095601234" className="text-amber-400 font-bold hover:underline">+1 (809) 560-1234</a></span>
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] text-zinc-500">TLS 1.3 • AES-256</span>
          </div>
        </div>

        {/* =====================================================================
            RIGHT PANEL: HIGH-DENSITY FROSTED GLASS OBSIDIAN VAULT CONSOLE (Single Screen)
            ===================================================================== */}
        <div 
          className={`w-full lg:w-[46%] flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-4 xl:p-6 relative z-20 bg-transparent h-full overflow-hidden ${
            activeMobileView === 'terminal' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Frosted Glassmorphic Vault Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-[420px] sm:max-w-[450px] md:max-w-[460px] lg:max-w-[430px] xl:max-w-[460px] rounded-[8px] p-3 sm:p-4 md:p-5 lg:p-4 xl:p-5 space-y-2 sm:space-y-2.5 md:space-y-3 relative overflow-hidden transition-all my-auto ${
              particlesAndGlass
                ? 'bg-zinc-950/85 backdrop-blur-2xl border border-white/20 ring-1 ring-amber-400/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_25px_80px_rgba(0,0,0,0.95)]'
                : 'bg-zinc-900 border border-zinc-800 shadow-2xl'
            }`}
          >
            {/* Top Amber Illumination Accent Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-0 left-0" />

            {/* Terminal Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <TMDLogo variant="responsive" className="h-7 sm:h-8" />
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CONEXIÓN SEGURA</span>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight font-display leading-tight drop-shadow-md">
                  TERMINAL DE ACCESO <span className="text-amber-400">CLIENTES & STAFF</span>
                </h2>
                <p className="text-[10px] sm:text-[11px] text-zinc-300 font-sans leading-tight">
                  Acceda a órdenes de servicio, telemetría o facturación DGII.
                </p>
              </div>
            </div>

            {/* Role Switcher Tabs (Contractor vs Staff) */}
            <div className="flex items-center p-0.5 rounded-[4px] bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveRoleTab('contractor'); fillQuickDemo('client'); }}
                className={`flex-1 py-1.5 min-h-[32px] sm:min-h-[36px] text-center text-[10px] sm:text-[11px] font-bold uppercase transition-all rounded-[3px] cursor-pointer touch-manipulation active:scale-[0.98] ${
                  activeRoleTab === 'contractor'
                    ? 'bg-amber-400 text-black font-black shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                CONTRATISTAS / FLOTAS
              </button>
              <button
                type="button"
                onClick={() => { setActiveRoleTab('staff'); fillQuickDemo('staff'); }}
                className={`flex-1 py-1.5 min-h-[32px] sm:min-h-[36px] text-center text-[10px] sm:text-[11px] font-bold uppercase transition-all rounded-[3px] cursor-pointer touch-manipulation active:scale-[0.98] ${
                  activeRoleTab === 'staff'
                    ? 'bg-amber-400 text-black font-black shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                STAFF KM 22
              </button>
            </div>

            {/* Primary High-Impact Biometric Passkey Action */}
            <button
              type="button"
              onClick={onOpenBiometrics}
              className="w-full p-2 sm:p-2.5 rounded-[5px] bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-[0_8px_24px_rgba(251,191,36,0.3)] flex items-center justify-between group cursor-pointer min-h-[40px] sm:min-h-[44px] touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
                  <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                </div>
                <div className="text-left font-mono">
                  <span className="block text-[10px] sm:text-[11px] font-black leading-tight">DESBLOQUEO BIOMÉTRICO FIDO2</span>
                  <span className="block text-[8px] sm:text-[9px] text-black/80 font-bold">Touch ID, Face ID o Windows Hello</span>
                </div>
              </div>
              {storedBiometricKeysCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-[3px] bg-black/20 text-black text-[8px] sm:text-[9px] font-bold shrink-0">
                  {storedBiometricKeysCount} LLAVE(S)
                </span>
              ) : (
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
              )}
            </button>

            {/* Error Banner */}
            {formError && (
              <div className="p-2 rounded-[4px] bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[10px] sm:text-xs flex items-start gap-1.5 font-sans backdrop-blur-md">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleFormSubmit} className="space-y-1.5 sm:space-y-2">
              <div className="space-y-0.5">
                <label className="text-[9px] sm:text-[10px] font-bold text-zinc-300 uppercase">
                  CORREO O IDENTIFICADOR CORPORATIVO
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@constructora.com.do"
                  className="w-full px-2.5 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-[4px] bg-black/70 backdrop-blur-xl border border-white/15 text-white placeholder-zinc-500 text-xs font-mono focus:border-amber-400 focus:bg-black/90 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] sm:text-[10px] font-bold text-zinc-300 uppercase">
                    CONTRASEÑA O PIN DE SEGURIDAD
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormError('Comuníquese con soporte Km 22 o use Acceso Biométrico / Google SSO.')}
                    className="text-[8px] sm:text-[9px] text-amber-400 hover:underline uppercase font-bold cursor-pointer touch-manipulation"
                  >
                    ¿Olvidó clave?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-2.5 py-1.5 min-h-[34px] sm:min-h-[38px] rounded-[4px] bg-black/70 backdrop-blur-xl border border-white/15 text-white placeholder-zinc-500 text-xs font-mono focus:border-amber-400 focus:bg-black/90 focus:ring-1 focus:ring-amber-400/50 outline-none transition-all pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer p-1 touch-manipulation"
                    aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-300 hover:text-white touch-manipulation">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-[2px] bg-black border-zinc-700 text-amber-400 focus:ring-0 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[9px] sm:text-[10px] font-sans">Recordar terminal</span>
                </label>
                <span className="text-[8px] sm:text-[9px] text-zinc-400 uppercase">SESIÓN AUDITADA</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="py-1.5 px-2 min-h-[34px] sm:min-h-[38px] rounded-[4px] bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-white/15 hover:border-amber-400/60 text-white font-bold text-[11px] sm:text-xs uppercase transition-all cursor-pointer disabled:opacity-50 text-center touch-manipulation shadow-md"
                >
                  {isSubmitting || loading ? 'AUTENTICANDO...' : 'ENTRAR CON CLAVE'}
                </button>

                <button
                  type="button"
                  onClick={onSignInWithGoogle}
                  disabled={loading}
                  className="py-1.5 px-2 min-h-[34px] sm:min-h-[38px] rounded-[4px] bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-white/15 hover:border-amber-400/60 text-white font-bold text-[11px] sm:text-xs uppercase flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 touch-manipulation shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>GOOGLE SSO</span>
                </button>
              </div>
            </form>

            {/* 1-Click Evaluation Shortcuts */}
            <div className="pt-1.5 border-t border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase">
                <span>ACCESO RÁPIDO PARA EVALUACIÓN:</span>
                <span className="text-amber-400 font-mono font-bold">1-CLICK</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('client')}
                  className="py-1 px-1 min-h-[28px] sm:min-h-[30px] rounded-[3px] bg-black/60 border border-white/10 hover:border-amber-400 active:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] sm:text-[10px] uppercase font-bold text-center transition-all cursor-pointer touch-manipulation"
                >
                  CLIENTE
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('staff')}
                  className="py-1 px-1 min-h-[28px] sm:min-h-[30px] rounded-[3px] bg-black/60 border border-white/10 hover:border-amber-400 active:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] sm:text-[10px] uppercase font-bold text-center transition-all cursor-pointer touch-manipulation"
                >
                  STAFF
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin')}
                  className="py-1 px-1 min-h-[28px] sm:min-h-[30px] rounded-[3px] bg-black/60 border border-white/10 hover:border-amber-400 active:bg-zinc-800 text-zinc-300 hover:text-white text-[9px] sm:text-[10px] uppercase font-bold text-center transition-all cursor-pointer touch-manipulation"
                >
                  ADMIN
                </button>
              </div>
            </div>

            {/* Footer Cryptographic Status */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-400 font-mono">
              <div className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                <span>ENCLAVE FIDO2 ACTIVO</span>
              </div>
              <span>LATENCIA: {liveLatency}ms</span>
            </div>

          </motion.div>
        </div>

      </div>

    </div>
  );
};
