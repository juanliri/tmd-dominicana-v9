import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Phone, 
  MessageSquare, 
  FileText, 
  Wrench, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Share2, 
  Check, 
  Truck, 
  Activity, 
  Radio, 
  ChevronRight,
  Calculator,
  Send,
  Copy,
  CheckCircle2,
  X,
  Compass,
  Users,
  Video,
  Calendar,
  RotateCw,
  Sparkles,
  MapPin,
  Search,
  Zap,
  TrendingUp,
  Layers,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { USD_TO_DOP_RATE, MACHINES_DATA } from '../data/catalog';
import { PARTS_DATA } from '../data/parts';
import { triggerRfqCrmInquiryLogging } from '../services/crmService';
import { BioHeaderVideoPlayer } from './media/BioHeaderVideoPlayer';
import { trackBioLinkClick } from '../utils/bioAnalytics';
import { TMDLogo } from './common/BrandLogos';
import { BioGoldParticleCanvas } from './effects/BioGoldParticleCanvas';
import cinematicBgImg from '../assets/images/tmd_dealership_bg_1790439101712.jpg';
import { generateQrDataUrl } from '../utils/qrExporter';

interface BioLinkViewProps {
  onNavigate: (route: string) => void;
  onOpenQrScanner?: () => void;
}

// Tactile Audio Feedback
const playTactileSound = (type: 'click' | 'toggle' | 'flip' | 'success' = 'click') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'flip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'toggle' ? 440 : 750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch {
    // Audio fallback
  }
};

// Clean Social SVG Icons (Milton CAT layout style)
const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YouTubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const WazeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8zm-2 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
);

// Video Chapters for Fullscreen HD Modal
const VIDEO_CHAPTERS = [
  { id: 'ch1', title: 'Patio Principal Km 22', time: '0:00', seconds: 0 },
  { id: 'ch2', title: 'Flota JCB Oficial', time: '0:04', seconds: 4 },
  { id: 'ch3', title: 'Prueba Dinámica en Obra', time: '0:08', seconds: 8 },
  { id: 'ch4', title: 'Taller Central 18 Bahías', time: '0:13', seconds: 13 }
];

// High-Density Framer Motion Staggered Entry Variants
const iconGridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const iconGridItemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 16,
  },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 22,
      mass: 0.6,
    },
  },
};

export const BioLinkView: React.FC<BioLinkViewProps> = ({ onNavigate, onOpenQrScanner }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogType, setCatalogType] = useState<'machinery' | 'tools' | 'parts'>('machinery');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Top Scroll Progress Bar
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileQrUrl, setMobileQrUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      generateQrDataUrl(window.location.href, 180).then(setMobileQrUrl).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Forms
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadNeed, setLeadNeed] = useState('Cotización Maquinaria');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const [careerName, setCareerName] = useState('');
  const [careerPhone, setCareerPhone] = useState('');
  const [careerRole, setCareerRole] = useState('Técnico Mecánico Diésel');
  const [careerSubmitted, setCareerSubmitted] = useState(false);

  // Leasing Calculator
  const [calcAmountUsd, setCalcAmountUsd] = useState(65000);
  const [calcTermMonths, setCalcTermMonths] = useState(36);
  const [calcDownPercent, setCalcDownPercent] = useState(20);
  const [selectedBank, setSelectedBank] = useState<'popular' | 'bhd' | 'reservas' | 'tmd'>('popular');

  const handleCardFlip = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileSound('flip');
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleOpenVideoTheater = () => {
    playTactileSound('success');
    trackBioLinkClick('Video Header Km 22 Theater Modal', 'video_showcase');
    setShowVideoModal(true);
  };

  const handleCopyLink = () => {
    playTactileSound('success');
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = async () => {
    playTactileSound('click');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TMD Dominicana | Maquinaria Pesada & Repuestos OEM',
          text: 'Distribuidor Oficial JCB, LiuGong, Kubota, LS Tractor, Donaldson en República Dominicana.',
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadVCard = () => {
    playTactileSound('success');
    trackBioLinkClick('Guardar VCard Oficial', 'quick_action');
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:López;Eduardo;;Ing.;
FN:Ing. Eduardo López (TMD Dominicana)
ORG:Tecnomaquinarias Diesel S.R.L. (TMD)
TITLE:Director de Operaciones
TEL;TYPE=WORK,VOICE:+18095601234
TEL;TYPE=CELL,VOICE,WHATSAPP:+18095601234
EMAIL;TYPE=WORK:ventas@tmd.rd
URL:https://ais-dev-3s3ie2nc7ohx53sxh65rsd-869667323763.us-east1.run.app/#/bio
ADR;TYPE=WORK:;;Km 22, Autopista Duarte;Santo Domingo Oeste;;;República Dominicana
NOTE:Distribuidor Oficial Maquinaria Pesada LiuGong, JCB, LS Tractor, Kubota & Donaldson. Sede Km 22 Duarte.
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TMD_Dominicana_Contacto.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;
    playTactileSound('success');

    try {
      await triggerRfqCrmInquiryLogging(
        {
          id: `bio-lead-${Date.now()}`,
          quoteNumber: `RFQ-BIO-${Math.floor(1000 + Math.random() * 9000)}`,
          clientId: 'social-guest',
          clientEmail: 'lead.social@tmd.rd',
          clientName: leadName,
          companyName: 'Lead Bio Link',
          phone: leadPhone,
          status: 'submitted',
          currency: 'USD',
          subtotal: 50000,
          itbis: 9000,
          total: 59000,
          itemsCount: 1,
          itemsSummary: leadNeed,
          notes: `Origen: Bio-Link Icon-Grid. Interés: ${leadNeed}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          source: 'direct_inquiry',
          equipmentInterested: leadNeed,
          equipmentCategory: 'Maquinaria Pesada'
        }
      );
    } catch {
      // Graceful fallback
    }

    setLeadSubmitted(true);
    setTimeout(() => {
      const msg = encodeURIComponent(
        `👋 Hola TMD Dominicana, solicito atención desde su Bio Link:\n\n👤 *Nombre:* ${leadName}\n📱 *Teléfono:* ${leadPhone}\n🚜 *Interés:* ${leadNeed}`
      );
      window.open(`https://wa.me/18095601234?text=${msg}`, '_blank');
      setShowInquiryModal(false);
      setLeadSubmitted(false);
    }, 1200);
  };

  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerName || !careerPhone) return;
    playTactileSound('success');
    setCareerSubmitted(true);
    setTimeout(() => {
      const msg = encodeURIComponent(
        `👋 Hola Gestión Humana TMD, deseo postularme a:\n\n💼 *Puesto:* ${careerRole}\n👤 *Nombre:* ${careerName}\n📱 *Teléfono:* ${careerPhone}`
      );
      window.open(`https://wa.me/18095601234?text=${msg}`, '_blank');
      setShowCareerModal(false);
      setCareerSubmitted(false);
    }, 1200);
  };

  // Financing calculation
  const bankRates = {
    popular: { name: 'Banco Popular', rate: 0.0925 },
    bhd: { name: 'Banco BHD', rate: 0.0950 },
    reservas: { name: 'Banreservas', rate: 0.0900 },
    tmd: { name: 'TMD Directo', rate: 0.0850 }
  };

  const downPaymentUsd = (calcAmountUsd * calcDownPercent) / 100;
  const principal = calcAmountUsd - downPaymentUsd;
  const monthlyRate = bankRates[selectedBank].rate / 12;
  const monthlyPaymentUsd = (principal * (monthlyRate * Math.pow(1 + monthlyRate, calcTermMonths))) / (Math.pow(1 + monthlyRate, calcTermMonths) - 1);
  const monthlyPaymentDop = monthlyPaymentUsd * USD_TO_DOP_RATE;

  // Real Equipment Catalog Items (Official JCB & LiuGong)
  const realMachines = MACHINES_DATA.slice(0, 4).map(m => ({
    id: m.id,
    name: m.name,
    brand: m.brand,
    type: m.category,
    power: `${m.powerHp || 100} HP`,
    priceUsd: m.basePriceUsd || 65000,
    image: m.image,
    specs: m.specs?.slice(0, 3).map(s => `${s.label}: ${s.value}`) || [
      'Garantía Oficial TMD 2,000 Horas',
      'Disponibilidad en Patio Km 22',
      'Servicio Técnico Móvil Especializado'
    ]
  }));

  // Real Work Tools & Hydraulic Breakers
  const realWorkTools = [
    {
      id: 'tool-jcb-hm380',
      name: 'Martillo Hidráulico JCB Hammer Master 380',
      category: 'Demolición para Retroexcavadoras 3CX / 4CX',
      priceUsd: 8900,
      image: '/assets/machinery/JCB_Site_breakers.jpg',
      specs: ['Caudal Óptimo: 70-100 L/min', 'Energía de Impacto: 1,250 Joules', 'Incluye 2 Picas y Kit N2']
    },
    {
      id: 'tool-hardox-bucket',
      name: 'Cucharón de Roca Reforzada Hardox® 450',
      category: 'Excavadoras 20T - 25T (1.2 m³)',
      priceUsd: 4500,
      image: '/assets/machinery/JCB_Heavy_duty_bucket.jpg',
      specs: ['Acero Hardox® 450 Anti-desgaste', 'Dientes Escarificadores Tipo Garra', 'Pasadores Forjados Grado 8']
    }
  ];

  // Real Genuine OEM Parts
  const realParts = PARTS_DATA.slice(0, 2).map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    partNumber: p.partNumber,
    priceUsd: p.priceUsd,
    image: p.image,
    specs: [
      `Ubicación: ${p.warehouseLocation || 'Almacén Km 22'}`,
      `Stock Disponible: ${p.stockQty || 12} unidades`,
      `Despacho Express: ${p.deliveryTimeHours || 4} Horas`
    ]
  }));

  // High-Density Bento Grid Items with Solid Obsidian Theme & Gold Accents
  const highDensityGridItems = [
    {
      id: 'machinery',
      title: 'Maquinaria 0km',
      tag: 'JCB · LiuGong',
      icon: Truck,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'STOCK KM 22',
      onClick: () => {
        playTactileSound('click');
        setCatalogType('machinery');
        setShowCatalogModal(true);
      }
    },
    {
      id: 'work_tools',
      title: 'Work Tools',
      tag: 'Martillos & Baldes',
      icon: Wrench,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'SPECIAL',
      onClick: () => {
        playTactileSound('click');
        setCatalogType('tools');
        setShowCatalogModal(true);
      }
    },
    {
      id: 'quote',
      title: 'Cotizar Proforma',
      tag: 'Proforma DGII',
      icon: FileText,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'EN 15 MIN',
      onClick: () => {
        playTactileSound('click');
        setShowInquiryModal(true);
      }
    },
    {
      id: 'emergency',
      title: 'Auxilio 24/7',
      tag: 'Guardia en Obra',
      icon: Radio,
      accentBg: 'bg-black text-emerald-400 border border-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-black',
      badge: '<2H EN CAMPO',
      pulsing: true,
      onClick: () => {
        playTactileSound('click');
        trackBioLinkClick('Auxilio Tecnico 24/7 Hotkey', 'emergency_hotline');
        window.open('https://wa.me/18095601234?text=Hola%20TMD%20Dominicana%2C%20requiero%20auxilio%20técnico%20de%20emergencia%2024%2F7%20en%20campo.', '_blank');
      }
    },
    {
      id: 'parts',
      title: 'Repuestos OEM',
      tag: 'Donaldson / JCB',
      icon: Search,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'GENUINOS',
      onClick: () => {
        playTactileSound('click');
        setCatalogType('parts');
        setShowCatalogModal(true);
      }
    },
    {
      id: 'leasing',
      title: 'Leasing RD',
      tag: 'Popular & BHD',
      icon: Calculator,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'SIMULAR',
      onClick: () => {
        playTactileSound('click');
        setShowCalcModal(true);
      }
    },
    {
      id: 'livelink',
      title: 'LiveLink™ GPS',
      tag: 'Telemetría Satelital',
      icon: Activity,
      accentBg: 'bg-black text-amber-400 border border-amber-500/50 group-hover:bg-amber-500 group-hover:text-black',
      badge: 'TELEMETRÍA',
      onClick: () => {
        playTactileSound('click');
        trackBioLinkClick('JCB LiveLink', 'navigation');
        onNavigate('#/livelink');
      }
    },
    {
      id: 'careers',
      title: 'Empleo TMD',
      tag: 'Técnicos Diésel',
      icon: Users,
      accentBg: 'bg-black text-emerald-400 border border-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-black',
      badge: 'CONTRATANDO',
      onClick: () => {
        playTactileSound('click');
        setShowCareerModal(true);
      }
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start py-4 sm:py-8 px-3 relative overflow-x-hidden font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Top Gold Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-amber-400 z-[1000] shadow-[0_0_8px_rgba(245,158,11,0.9)]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Solid Black Parallax Backdrop with Authentic 1:1 Camera Dealership Photo */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-black">
        <img 
          src={cinematicBgImg} 
          alt="TMD Dealership Km 22" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter contrast-125 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/85" />
      </div>

      {/* Atmospheric Gold Particles Floating Over Background */}
      <BioGoldParticleCanvas />

      {/* ========================================================================= */}
      {/* HIGH-DENSITY SOLID OBSIDIAN SMARTPHONE CONTAINER                          */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[430px] rounded-[28px] overflow-hidden bg-[#0c0c10] border border-amber-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.95)] relative z-10 flex flex-col">
        
        {/* TALL PORTRAIT ACTION VIDEO HEADER */}
        <div className="w-full h-[320px] sm:h-[350px] relative overflow-hidden bg-black border-b border-white/10">
          
          <BioHeaderVideoPlayer
            src="/videos/tmd-patio-km22.mp4"
            poster="/images/video_ch1_patio.jpg"
            title="RECORRIDO HD SEDE CENTRAL KM 22"
            location="Autopista Duarte Km 22 · 15,000 m²"
            onOpenTheater={handleOpenVideoTheater}
            onPlayFeedback={() => playTactileSound('click')}
            className="w-full h-full"
          />

          {/* Floating Top Nav Controls with Homepage TMD Logo in the Middle Top */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-30 pointer-events-auto">
            <button
              onClick={() => {
                playTactileSound('click');
                onNavigate('#/home');
              }}
              title="Abrir Portal TMD Completo"
              className="w-9 h-9 rounded-full bg-black hover:bg-neutral-900 text-amber-400 border border-amber-500/40 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            {/* HOMEPAGE OFFICIAL TMD LOGO IN THE MIDDLE TOP */}
            <div 
              onClick={() => {
                playTactileSound('click');
                onNavigate('#/home');
              }}
              className="cursor-pointer px-3 py-1 rounded-full bg-black border border-amber-500/50 shadow-md hover:scale-105 transition-all flex items-center justify-center"
            >
              <TMDLogo className="h-6" variant="official" />
            </div>

            {/* Right Action Cluster: QR Scanner Trigger & Native Share */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playTactileSound('click');
                  trackBioLinkClick('QR Scanner Trigger Header', 'quick_action');
                  if (onOpenQrScanner) {
                    onOpenQrScanner();
                  } else {
                    setShowQrModal(true);
                  }
                }}
                title="Escanear Código QR"
                className="w-9 h-9 rounded-full bg-black hover:bg-neutral-900 text-amber-400 border border-amber-500/40 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={handleShareNative}
                title="Compartir Perfil"
                className="w-9 h-9 rounded-full bg-black hover:bg-neutral-900 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE SECTION OVER VIDEO TRANSITION */}
        <div className="px-4.5 pt-3 pb-4 flex flex-col items-center text-center relative z-20 bg-[#0c0c10]">
          
          {/* SEMANTIC ACCESSIBLE TITLE */}
          <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display mb-1.5">
            TECNOMAQUINARIAS DIESEL DOMINICANA
          </h1>

          {/* VERIFIED DISTRIBUTOR BADGE */}
          <div className="mb-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black border border-amber-500/50 text-[9.5px] font-bold text-amber-400 tracking-wider font-mono shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>DISTRIBUIDOR OFICIAL JCB · LIUGONG</span>
          </div>

          {/* MINIMAL SOCIAL ICONS ROW WITH 3D TILT GESTURES */}
          <div className="flex items-center justify-center gap-4 text-amber-400 mb-3.5">
            <motion.a 
              href="https://facebook.com/tmddominicana" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="Facebook"
            >
              <FacebookIcon className="w-4.5 h-4.5" />
            </motion.a>
            <motion.a 
              href="https://instagram.com/tmddominicana" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="Instagram"
            >
              <InstagramIcon className="w-4.5 h-4.5" />
            </motion.a>
            <motion.a 
              href="https://youtube.com/@tmddominicana" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="YouTube"
            >
              <YouTubeIcon className="w-4.5 h-4.5" />
            </motion.a>
            <motion.a 
              href="https://linkedin.com/company/tmddominicana" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-4.5 h-4.5" />
            </motion.a>
            <motion.a 
              href="https://tiktok.com/@tmddominicana" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="TikTok"
            >
              <TikTokIcon className="w-4.5 h-4.5" />
            </motion.a>
            <motion.a 
              href="https://maps.google.com/?q=TMD+Dominicana+Km+22+Autopista+Duarte" 
              target="_blank" 
              rel="noopener noreferrer" 
              whileHover={{ scale: 1.18, y: -2, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
              className="hover-tilt-card hover:text-white transition-colors cursor-pointer p-1"
              title="Waze / Google Maps"
            >
              <WazeIcon className="w-4.5 h-4.5" />
            </motion.a>
          </div>

          {/* ========================================================================= */}
          {/* HIGH-DENSITY SOLID BLACK ICON-GRID WITH 3D HOVER TILT                    */}
          {/* ========================================================================= */}
          <motion.div 
            className="w-full grid grid-cols-2 gap-2"
            variants={iconGridContainerVariants}
            initial="hidden"
            animate="show"
          >
            {highDensityGridItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  variants={iconGridItemVariants}
                  whileHover={{ 
                    scale: 1.04, 
                    y: -3,
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={item.onClick}
                  className="hover-tilt-card p-3 rounded-[16px] bg-[#14141c] hover:bg-[#1c1c24] border border-white/10 hover:border-amber-400 transition-all flex flex-col justify-between cursor-pointer group text-left shadow-sm min-h-[96px] relative overflow-hidden"
                >
                  {/* Top Bar: Icon with Halo + Mini Badge */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all ${item.accentBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1">
                      {item.pulsing && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                      <span className="text-[7.5px] font-bold tracking-wider px-1.5 py-0.5 rounded-[4px] bg-black border border-white/10 text-zinc-300 font-mono uppercase">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Text: Title & Tag */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight font-sans">
                        {item.title}
                      </h3>
                      <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-[9.5px] text-zinc-400 truncate mt-0.5 font-medium">
                      {item.tag}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Quick Dual Action Footer */}
          <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/10">
            <button
              onClick={handleDownloadVCard}
              className="py-2.5 px-3 rounded-[12px] bg-[#14141c] hover:bg-[#1c1c24] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Guardar VCard</span>
            </button>

            <a
              href="https://wa.me/18095601234?text=Hola%20TMD%20Dominicana%2C%20deseo%20atenci%C3%B3n%20comercial."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-[12px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>

          <p className="text-[8.5px] text-zinc-400 font-mono mt-2.5">
            TMD TECNOMAQUINARIAS DIESEL S.R.L. · KM 22 DUARTE
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP FLOATING "VIEW ON MOBILE" QR CODE WIDGET                         */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-50 flex-col items-center bg-[#0c0c10] p-3 rounded-[16px] border border-amber-500/40 shadow-2xl">
        <span className="text-[10px] font-bold text-zinc-200 mb-1.5 font-mono">View on mobile</span>
        <div className="p-1.5 bg-white rounded-[8px] shadow-md flex items-center justify-center min-w-[72px] min-h-[72px]">
          {mobileQrUrl ? (
            <img 
              src={mobileQrUrl} 
              alt="QR Code" 
              className="w-18 h-18 object-contain"
            />
          ) : (
            <div className="w-18 h-18 bg-zinc-200 animate-pulse rounded" />
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. MODAL: SHOWROOM 3D (Real Official Products)       */}
      {/* ==================================================== */}
      {showCatalogModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#0c0c10] border border-amber-500/40 rounded-[24px] p-5 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                playTactileSound('click');
                setShowCatalogModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-[6px] bg-black border border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-[6px] bg-amber-400 text-black">
                {catalogType === 'machinery' ? <Truck className="w-4 h-4" /> : catalogType === 'tools' ? <Wrench className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </div>
              <h3 className="text-sm font-black text-white uppercase font-display">
                {catalogType === 'machinery' ? 'MAQUINARIA EN STOCK' : catalogType === 'tools' ? 'WORK TOOLS & ADITAMENTOS' : 'REPUESTOS GENUINOS OEM'}
              </h3>
            </div>
            <p className="text-[10px] text-zinc-400 mb-3">Toca cualquier ficha para girar en 3D y ver especificaciones.</p>

            {/* 3D CARDS GRID WITH REAL IMAGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(catalogType === 'machinery' ? realMachines : catalogType === 'tools' ? realWorkTools : realParts).map((item: any) => {
                const isFlipped = Boolean(flippedCards[item.id]);
                return (
                  <div 
                    key={item.id}
                    className="w-full h-52 [perspective:1000px] cursor-pointer"
                    onClick={(e) => handleCardFlip(item.id, e)}
                  >
                    <div className={`w-full h-full relative transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      
                      {/* FRONT */}
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-[#14141c] border border-white/10 hover:border-amber-400 rounded-[14px] p-2.5 flex flex-col justify-between shadow-lg">
                        <div className="relative w-full h-24 rounded-[8px] overflow-hidden bg-black flex items-center justify-center p-1">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-amber-400 text-black font-bold text-[10px] rounded flex items-center gap-0.5">
                            <RotateCw className="w-2 h-2" />
                            <span>Ficha 3D</span>
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <p className="text-[10px] text-zinc-400">{item.power || item.category || item.partNumber}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                          <span className="font-bold text-amber-400">US$ {item.priceUsd.toLocaleString()}</span>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">STOCK KM 22</span>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] bg-black border border-amber-400 rounded-[14px] p-3 flex flex-col justify-between shadow-xl">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">{item.name}</span>
                            <span className="text-[10px] text-zinc-400">↺ Girar</span>
                          </div>
                          <div className="space-y-1 my-1">
                            {item.specs.map((sp: string, i: number) => (
                              <div key={i} className="text-[10px] text-zinc-300 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{sp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/18095601234?text=${encodeURIComponent(`Hola TMD, deseo cotizar: ${item.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 rounded-[8px] bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] uppercase flex items-center justify-center gap-1 shadow-md"
                        >
                          <MessageSquare className="w-3 h-3 fill-current" />
                          <span>COTIZAR ESTO</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* 2. MODAL: COTIZACIÓN RÁPIDA / REQUEST A DEMO        */}
      {/* ==================================================== */}
      {showInquiryModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#0c0c10] border border-amber-500/40 rounded-[24px] p-5 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                playTactileSound('click');
                setShowInquiryModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-[6px] bg-black border border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-[6px] bg-amber-400 text-black">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase font-display">REQUEST A DEMO / COTIZAR</h3>
            </div>
            <p className="text-[10px] text-zinc-400 mb-3">
              Reciba su cotización formal DGII o agende su prueba en obra.
            </p>

            {leadSubmitted ? (
              <div className="p-4 bg-black border border-emerald-500/50 rounded-[12px] text-center my-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1 animate-bounce" />
                <h4 className="text-xs font-bold text-emerald-400 uppercase">¡SOLICITUD ENVIADA!</h4>
                <p className="text-[9px] text-zinc-300 mt-1">Abriendo WhatsApp con un asesor...</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Nombre / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ing. Carlos Rodríguez"
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-3 text-xs text-white outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="809-560-1234"
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-3 text-xs text-white outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Interés</label>
                  <select
                    value={leadNeed}
                    onChange={(e) => setLeadNeed(e.target.value)}
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-2 text-[11px] text-white outline-hidden"
                  >
                    <option value="Maquinaria 0 Km">Maquinaria 0 Km (JCB / LiuGong)</option>
                    <option value="Work Tools / Martillos">Work Tools & Martillos Hidráulicos</option>
                    <option value="Repuestos y Filtros OEM">Repuestos & Filtros OEM</option>
                    <option value="Financiamiento Leasing">Financiamiento Leasing</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-[8px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SOLICITAR POR WHATSAPP</span>
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* 3. MODAL: LEASING CALCULATOR                         */}
      {/* ==================================================== */}
      {showCalcModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#0c0c10] border border-amber-500/40 rounded-[24px] p-5 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                playTactileSound('click');
                setShowCalcModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-[6px] bg-black border border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-[6px] bg-amber-400 text-black">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase font-display">LEASING RD</h3>
            </div>
            
            <div className="grid grid-cols-4 gap-1 mb-3">
              {[
                { id: 'popular', name: 'Popular', rate: '9.25%' },
                { id: 'bhd', name: 'BHD', rate: '9.50%' },
                { id: 'reservas', name: 'Reservas', rate: '9.00%' },
                { id: 'tmd', name: 'TMD', rate: '8.50%' }
              ].map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    playTactileSound('click');
                    setSelectedBank(b.id as any);
                  }}
                  className={`p-1.5 rounded-[6px] text-center border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    selectedBank === b.id
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-black text-zinc-400 border-white/10'
                  }`}
                >
                  <div>{b.name}</div>
                  <div className="font-mono">{b.rate}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2.5 bg-black p-3 rounded-[12px] border border-white/10 mb-3 text-xs">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-zinc-400">Equipo:</span>
                  <span className="font-bold text-amber-400">US$ {calcAmountUsd.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="200000"
                  step="5000"
                  value={calcAmountUsd}
                  onChange={(e) => setCalcAmountUsd(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-zinc-400">Inicial ({calcDownPercent}%):</span>
                  <span className="font-bold text-white">US$ {downPaymentUsd.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={calcDownPercent}
                  onChange={(e) => setCalcDownPercent(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-zinc-400">Plazo:</span>
                  <span className="font-bold text-white">{calcTermMonths} Meses</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[24, 36, 48].map(months => (
                    <button
                      key={months}
                      onClick={() => {
                        playTactileSound('click');
                        setCalcTermMonths(months);
                      }}
                      className={`py-1 text-[9px] font-bold rounded-[6px] cursor-pointer transition-colors ${
                        calcTermMonths === months ? 'bg-amber-400 text-black' : 'bg-neutral-900 text-zinc-400'
                      }`}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-black border border-amber-500/40 rounded-[12px] text-center mb-3">
              <span className="text-[9px] text-zinc-400 uppercase font-bold">Cuota Mensual</span>
              <div className="text-base font-black text-amber-400 tracking-tight">
                US$ {Math.round(monthlyPaymentUsd).toLocaleString()} / mes
              </div>
              <span className="text-[9px] text-zinc-300">
                ≈ RD$ {Math.round(monthlyPaymentDop).toLocaleString()} / mes
              </span>
            </div>

            <a
              href={`https://wa.me/18095601234?text=${encodeURIComponent(
                `Hola TMD, solicito PRE-CALIFICACIÓN (${bankRates[selectedBank].name}) para US$ ${calcAmountUsd.toLocaleString()} a ${calcTermMonths} meses.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTactileSound('click')}
              className="w-full py-2.5 rounded-[8px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md"
            >
              <span>PRE-CALIFICAR {bankRates[selectedBank].name}</span>
            </a>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* 4. MODAL: THEATER HD VIDEO                           */}
      {/* ==================================================== */}
      {showVideoModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#0c0c10] border border-amber-500/40 rounded-[24px] p-4 sm:p-5 max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                playTactileSound('click');
                setShowVideoModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-[6px] bg-black border border-white/20 cursor-pointer z-30"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-[6px] bg-amber-400 text-black">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase font-display">SEDE CENTRAL KM 22</h3>
            </div>

            <div className="w-full aspect-video bg-black rounded-[12px] overflow-hidden relative border border-white/10 mb-3 shadow-lg">
              <video
                ref={modalVideoRef}
                src="/videos/tmd-patio-km22.mp4"
                poster="/images/video_ch1_patio.jpg"
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Chapters */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {VIDEO_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    playTactileSound('click');
                    setActiveChapterIndex(idx);
                    if (modalVideoRef.current) {
                      modalVideoRef.current.currentTime = ch.seconds;
                      modalVideoRef.current.play();
                    }
                  }}
                  className={`p-2 rounded-[8px] text-left border text-[9px] transition-all cursor-pointer flex items-center justify-between ${
                    activeChapterIndex === idx
                      ? 'bg-amber-400/20 border-amber-400 text-white'
                      : 'bg-black border-white/10 text-zinc-400'
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  <span className="font-bold text-amber-400 font-mono ml-1">{ch.time}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://maps.google.com/?q=TMD+Dominicana+Km+22+Autopista+Duarte"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playTactileSound('click')}
                className="py-2.5 px-3 rounded-[8px] bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase flex items-center justify-center gap-1 border border-white/20"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>RUTA GPS</span>
              </a>

              <a
                href={`https://wa.me/18095601234?text=${encodeURIComponent('Hola TMD, deseo agendar una visita al Patio Km 22.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playTactileSound('click')}
                className="py-2.5 px-3 rounded-[8px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-md"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>AGENDAR VISITA</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================================================== */}
      {/* 5. MODAL: CAREERS                                    */}
      {/* ==================================================== */}
      {showCareerModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-3 font-mono">
          <div className="bg-[#0c0c10] border border-amber-500/40 rounded-[24px] p-5 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                playTactileSound('click');
                setShowCareerModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-[6px] bg-black border border-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-[6px] bg-emerald-400 text-black">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase font-display">BOLSA DE EMPLEO TMD</h3>
            </div>
            <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">
              Únete al equipo técnico en Sede Central Km 22.
            </p>

            {careerSubmitted ? (
              <div className="p-4 bg-black border border-emerald-500/50 rounded-[12px] text-center my-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1 animate-bounce" />
                <h4 className="text-xs font-bold text-emerald-400 uppercase">¡POSTULACIÓN ENVIADA!</h4>
                <p className="text-[9px] text-zinc-300 mt-1">Abriendo WhatsApp...</p>
              </div>
            ) : (
              <form onSubmit={handleCareerSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={careerName}
                    onChange={(e) => setCareerName(e.target.value)}
                    placeholder="Ing. Juan Pérez"
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-3 text-xs text-white outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={careerPhone}
                    onChange={(e) => setCareerPhone(e.target.value)}
                    placeholder="809-560-1234"
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-3 text-xs text-white outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-300 uppercase mb-1">Puesto</label>
                  <select
                    value={careerRole}
                    onChange={(e) => setCareerRole(e.target.value)}
                    className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-[8px] py-2 px-2 text-[11px] text-white outline-hidden"
                  >
                    <option value="Técnico Mecánico Diésel">Técnico Mecánico Diésel</option>
                    <option value="Especialista Hidráulico">Especialista Hidráulico</option>
                    <option value="Asesor Comercial Repuestos">Asesor Repuestos OEM</option>
                    <option value="Pasantía Técnica ITLA/INFOTEP">Pasantía Técnica ITLA/INFOTEP</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-[8px] bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ENVIAR POSTULACIÓN</span>
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
