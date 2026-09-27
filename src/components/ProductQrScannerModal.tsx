import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import jsQR from 'jsqr';
import {
  QrCode,
  X,
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  Upload,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  HardHat,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ShoppingCart,
  Copy,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Maximize2
} from 'lucide-react';
import { Machine, Part } from '../types';
import { getUnifiedStoreMachinery, getUnifiedStoreParts } from '../services/cdnCatalogLoader';
import { USD_TO_DOP_RATE } from '../data/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  recordInventoryScanLog, 
  getCurrentDeviceLocation, 
  KNOWN_YARD_ZONES, 
  TMD_FACILITIES 
} from '../services/inventoryLogService';
import { MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ScannedProductResult {
  type: 'machinery' | 'part';
  item: Machine | Part;
  rawCode: string;
  scannedAt: number;
}

export interface RecentScanEntry {
  id: string;
  type: 'machinery' | 'part';
  name: string;
  brand: string;
  code: string;
  image: string;
  priceUsd: number;
  timestamp: number;
}

interface ProductQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProduct: (type: 'machinery' | 'part', id: string) => void;
}

// Audio beep feedback using Web Audio API synthesis (zero network audio files needed)
function playScanChirp() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // AudioContext blocked or not supported; silent fallback
  }
}

const STORAGE_KEY_RECENT_SCANS = 'tmd_recent_qr_scans_v1';

export const ProductQrScannerModal: React.FC<ProductQrScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProduct
}) => {
  const { addToCart, addMachineToQuote } = useCart();
  const { currentUser, userProfile, isStaff, isAdmin } = useAuth();

  // Active view tab: camera live scanner, image file upload, or manual code input
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual' | 'history'>('camera');

  // Staff Yard Location state
  const [selectedYardZone, setSelectedYardZone] = useState<string>(KNOWN_YARD_ZONES[0]);
  const [lastLoggedScanId, setLastLoggedScanId] = useState<string | null>(null);
  const [isLoggingToFirestore, setIsLoggingToFirestore] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Km 22 Autopista Duarte');

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Scanned item detection state
  const [scannedResult, setScannedResult] = useState<ScannedProductResult | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);
  const [autoNavCountdown, setAutoNavCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToCartToast, setAddedToCartToast] = useState(false);

  // Manual search code input
  const [manualCode, setManualCode] = useState('');

  // Recent scans history
  const [recentScans, setRecentScans] = useState<RecentScanEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_SCANS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track stream reference to stop tracks cleanly
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopIntervalRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save recent scans
  const saveRecentScan = useCallback((entry: RecentScanEntry) => {
    setRecentScans((prev) => {
      const filtered = prev.filter((item) => !(item.type === entry.type && item.id === entry.id));
      const updated = [entry, ...filtered].slice(0, 12);
      try {
        localStorage.setItem(STORAGE_KEY_RECENT_SCANS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent scan to localStorage', e);
      }
      return updated;
    });
  }, []);

  // Intelligent Code Matching Engine
  const resolveScannedCode = useCallback((rawInput: string): ScannedProductResult | null => {
    if (!rawInput) return null;
    const cleanInput = rawInput.trim();

    const allMachines = getUnifiedStoreMachinery();
    const allParts = getUnifiedStoreParts();

    let targetId: string | null = null;
    let hintType: 'machinery' | 'part' | null = null;

    // Check 1: Is it a TMD URL with hash routing?
    // e.g. https://.../#/machinery?id=jcb-3cx-eco or #/parts?id=part-01
    // or https://.../#/machinery/jcb-3cx-eco
    if (cleanInput.includes('#/machinery') || cleanInput.includes('/machinery')) {
      hintType = 'machinery';
      try {
        const hashPart = cleanInput.includes('#') ? cleanInput.split('#')[1] : cleanInput;
        const [path, query] = hashPart.split('?');
        if (path.includes('/machinery/')) {
          targetId = path.split('/machinery/')[1]?.split('/')[0] || null;
        } else if (query) {
          const params = new URLSearchParams(query);
          targetId = params.get('id') || params.get('productId') || params.get('machineId');
        }
      } catch (e) {
        console.error('URL parse error:', e);
      }
    } else if (cleanInput.includes('#/parts') || cleanInput.includes('/parts')) {
      hintType = 'part';
      try {
        const hashPart = cleanInput.includes('#') ? cleanInput.split('#')[1] : cleanInput;
        const [path, query] = hashPart.split('?');
        if (path.includes('/parts/')) {
          targetId = path.split('/parts/')[1]?.split('/')[0] || null;
        } else if (query) {
          const params = new URLSearchParams(query);
          targetId = params.get('id') || params.get('productId') || params.get('partId');
        }
      } catch (e) {
        console.error('URL parse error:', e);
      }
    }

    const normalizedCode = (targetId || cleanInput).toLowerCase();

    // Check Machinery
    if (hintType === 'machinery' || !hintType) {
      const matchMachine = allMachines.find((m) => {
        const mId = m.id.toLowerCase();
        const mCode = (m.modelCode || '').toLowerCase();
        const mName = m.name.toLowerCase();
        return (
          mId === normalizedCode ||
          mCode === normalizedCode ||
          mCode.replace(/[^a-z0-9]/g, '') === normalizedCode.replace(/[^a-z0-9]/g, '') ||
          normalizedCode.includes(mId) ||
          mName === normalizedCode
        );
      });

      if (matchMachine) {
        return {
          type: 'machinery',
          item: matchMachine,
          rawCode: cleanInput,
          scannedAt: Date.now()
        };
      }
    }

    // Check Parts
    if (hintType === 'part' || !hintType) {
      const matchPart = allParts.find((p) => {
        const pId = p.id.toLowerCase();
        const pNum = p.partNumber.toLowerCase();
        const pNumClean = pNum.replace(/[^a-z0-9]/g, '');
        const normClean = normalizedCode.replace(/[^a-z0-9]/g, '');
        const hasCrossMatch = p.crossReferences?.some(
          (cr) => cr.toLowerCase() === normalizedCode || cr.toLowerCase().includes(normalizedCode)
        );

        return (
          pId === normalizedCode ||
          pNum === normalizedCode ||
          (pNumClean.length >= 4 && normClean.length >= 4 && (pNumClean === normClean || pNumClean.includes(normClean) || normClean.includes(pNumClean))) ||
          hasCrossMatch
        );
      });

      if (matchPart) {
        return {
          type: 'part',
          item: matchPart,
          rawCode: cleanInput,
          scannedAt: Date.now()
        };
      }
    }

    // Partial/Fuzzy search fallback across machinery
    const fuzzyMachine = allMachines.find((m) => {
      const words = normalizedCode.split(/[\s-_/]+/);
      return words.every((w) => w.length > 2 && (m.name.toLowerCase().includes(w) || (m.modelCode || '').toLowerCase().includes(w)));
    });
    if (fuzzyMachine) {
      return {
        type: 'machinery',
        item: fuzzyMachine,
        rawCode: cleanInput,
        scannedAt: Date.now()
      };
    }

    // Partial/Fuzzy search fallback across parts
    const fuzzyPart = allParts.find((p) => {
      const words = normalizedCode.split(/[\s-_/]+/);
      return words.every((w) => w.length > 2 && (p.name.toLowerCase().includes(w) || p.partNumber.toLowerCase().includes(w)));
    });
    if (fuzzyPart) {
      return {
        type: 'part',
        item: fuzzyPart,
        rawCode: cleanInput,
        scannedAt: Date.now()
      };
    }

    return null;
  }, []);

  // Process a successfully decoded string from camera or file
  const handleDecodedString = useCallback(
    async (codeText: string, methodOverride?: 'camera' | 'upload' | 'manual') => {
      if (!codeText || isPaused) return;

      playScanChirp();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }

      setIsPaused(true);

      const matched = resolveScannedCode(codeText);
      if (matched) {
        setScannedResult(matched);
        setUnrecognizedCode(null);
        setShowSuccessAnimation(true);

        const isMach = matched.type === 'machinery';
        const machine = isMach ? (matched.item as Machine) : null;
        const part = !isMach ? (matched.item as Part) : null;
        const itemCode = isMach ? machine?.modelCode || matched.item.id : part?.partNumber || matched.item.id;

        saveRecentScan({
          id: matched.item.id,
          type: matched.type,
          name: matched.item.name,
          brand: matched.item.brand,
          code: itemCode,
          image: matched.item.image,
          priceUsd: isMach ? machine?.basePriceUsd || 0 : part?.priceUsd || 0,
          timestamp: Date.now()
        });

        // =========================================================================
        // STAFF AUDIT LOG: Record 'scanned-at' & location metadata to Firestore 'inventory_logs'
        // =========================================================================
        if (currentUser && (isStaff || isAdmin || userProfile?.role === 'staff' || userProfile?.role === 'admin')) {
          setIsLoggingToFirestore(true);
          try {
            // Obtain current device location with GPS or fallback to Km 22 yard zone
            const locationMeta = await getCurrentDeviceLocation(selectedYardZone);
            setLocationStatus(
              locationMeta.source === 'gps'
                ? `GPS: ${locationMeta.latitude?.toFixed(4)}, ${locationMeta.longitude?.toFixed(4)}`
                : `${locationMeta.zoneName} (${locationMeta.facility})`
            );

            const scanLogResult = await recordInventoryScanLog({
              scannedAt: new Date().toISOString(),
              timestamp: Date.now(),
              staffUid: currentUser.uid,
              staffEmail: currentUser.email || 'staff@tmd.rd',
              staffName: userProfile?.displayName || currentUser.displayName || 'Técnico TMD Km 22',
              staffRole: isAdmin ? 'admin' : 'staff',
              itemType: matched.type,
              itemId: matched.item.id,
              itemName: matched.item.name,
              itemBrand: matched.item.brand,
              itemCode: itemCode,
              rawCode: codeText,
              scanMethod: methodOverride || (activeTab === 'upload' ? 'upload' : activeTab === 'manual' ? 'manual' : 'camera'),
              location: locationMeta,
              deviceInfo: {
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                platform: typeof navigator !== 'undefined' ? navigator.platform : ''
              }
            });

            setLastLoggedScanId(scanLogResult.id);
          } catch (logErr) {
            console.warn('[QR Scanner] Error logging scan to Firestore inventory_logs:', logErr);
          } finally {
            setIsLoggingToFirestore(false);
          }
        }

        // Start a 3-second auto-navigate countdown
        setAutoNavCountdown(3);
      } else {
        setScannedResult(null);
        setShowSuccessAnimation(false);
        setUnrecognizedCode(codeText);
      }
    },
    [isPaused, resolveScannedCode, saveRecentScan, currentUser, isStaff, isAdmin, userProfile, selectedYardZone, activeTab]
  );

  // Auto-navigate countdown effect
  useEffect(() => {
    if (autoNavCountdown === null) return;
    if (autoNavCountdown <= 0) {
      if (scannedResult) {
        onNavigateToProduct(scannedResult.type, scannedResult.item.id);
        onClose();
      }
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      setAutoNavCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [autoNavCountdown, scannedResult, onNavigateToProduct, onClose]);

  // Clean up camera stream
  const stopCameraStream = useCallback(() => {
    if (scanLoopIntervalRef.current) {
      clearInterval(scanLoopIntervalRef.current);
      scanLoopIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Initialize camera stream
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission('unsupported');
      setCameraError('El navegador actual no soporta acceso a la cámara o no está en un contexto seguro HTTPS.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission('granted');

      // Check for torch capability on mobile devices
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as { torch?: boolean };
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Start continuous scan loop
      scanLoopIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !canvasRef.current || isPaused) return;

        const video = videoRef.current;
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Scale canvas to video frame size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          handleDecodedString(code.data);
        }
      }, 140);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const errObj = err as Error;
      if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setCameraError('Permiso de cámara denegado. Permite el acceso a la cámara en la barra del navegador.');
      } else {
        setCameraPermission('denied');
        setCameraError(`No se pudo acceder a la cámara: ${errObj.message || 'Dispositivo no disponible'}`);
      }
    }
  }, [facingMode, isPaused, stopCameraStream, handleDecodedString]);

  // Handle Torch Toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.error('Failed to toggle torch', e);
    }
  };

  // Flip Camera Front / Back
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process Static Image File Upload (QR Image decode)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          handleDecodedString(code.data, 'upload');
        } else {
          setUnrecognizedCode('No se detectó ningún código QR en la imagen cargada.');
          setScannedResult(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manual Code Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedString(manualCode.trim(), 'manual');
  };

  // Reset current scan to scan again
  const handleScanAgain = () => {
    setScannedResult(null);
    setShowSuccessAnimation(false);
    setUnrecognizedCode(null);
    setAutoNavCountdown(null);
    setIsPaused(false);
  };

  // Navigate immediately
  const handleNavigateImmediate = () => {
    if (!scannedResult) return;
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    onNavigateToProduct(scannedResult.type, scannedResult.item.id);
    onClose();
  };

  // Add to cart or proforma from scanner
  const handleAddToCart = () => {
    if (!scannedResult) return;
    if (scannedResult.type === 'machinery') {
      const m = scannedResult.item as Machine;
      addMachineToQuote(m);
    } else {
      const p = scannedResult.item as Part;
      addToCart(p, 1);
    }
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2200);
  };

  // Copy Direct Link
  const handleCopyLink = () => {
    if (!scannedResult) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/#/${scannedResult.type === 'machinery' ? 'machinery' : 'parts'}?id=${encodeURIComponent(scannedResult.item.id)}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Manage Stream Lifecycle when Modal Opens / Closes or Tab Changes
  useEffect(() => {
    if (isOpen) {
      setShowSuccessAnimation(false);
      if (activeTab === 'camera') {
        startCameraStream();
      }
    } else {
      stopCameraStream();
      setShowSuccessAnimation(false);
    }

    return () => {
      stopCameraStream();
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [isOpen, activeTab, startCameraStream, stopCameraStream]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      id="product-qr-scanner-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-qr-scanner-card"
        className="relative w-full max-w-xl bg-zinc-900 rounded-[5px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] font-mono text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Engineering Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[3px] bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white uppercase tracking-wider font-display">
                  Escáner QR Industrial
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded-[2px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Patio Km 22, almacén y lectura de placas de identificación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[2px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar escáner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-4 sm:px-6 pt-2 pb-2 border-b border-zinc-800 flex items-center justify-between gap-1 bg-zinc-950/40 text-xs overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setIsPaused(false);
              }}
              className={`px-3 py-1.5 rounded-[2px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cámara</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-[2px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Foto / Archivo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-[2px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-400 text-black shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Código Manual</span>
            </button>
          </div>

          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1.5 rounded-[2px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'history'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Historial</span>
              <span className="w-4 h-4 rounded-[2px] bg-zinc-800 text-[10px] text-amber-400 font-bold flex items-center justify-center">
                {recentScans.length}
              </span>
            </button>
          )}
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* STAFF METADATA SELECTOR BAR (Shows when authenticated as staff or admin) */}
          {currentUser && (isStaff || isAdmin || userProfile?.role === 'staff' || userProfile?.role === 'admin') && (
            <div className="p-2.5 rounded-[3px] bg-zinc-950 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  Zona Patio / Almacén:
                </span>
                <select
                  value={selectedYardZone}
                  onChange={(e) => setSelectedYardZone(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-[2px] text-amber-400 font-bold text-[11px] px-2 py-0.5 focus:outline-hidden focus:border-amber-400"
                >
                  {KNOWN_YARD_ZONES.map((zone) => (
                    <option key={zone} value={zone} className="bg-zinc-900 text-white">
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate max-w-[200px]" title={locationStatus}>
                  {locationStatus}
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-[4px] overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center">
                {/* Hidden canvas for offscreen image decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* HTML5 Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Camera Permission / Error Fallback */}
                {cameraPermission !== 'granted' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 z-20 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/30 animate-pulse">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="font-bold text-sm text-white uppercase tracking-wide">
                        {cameraPermission === 'denied' ? 'Acceso a Cámara Bloqueado' : 'Conectando Sensor de Video...'}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        {cameraError || 'Solicitando permisos al navegador para activar la cámara de alta velocidad.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={startCameraStream}
                        className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-colors cursor-pointer"
                      >
                        Reintentar Cámara
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase transition-colors cursor-pointer"
                      >
                        Ingresar Código
                      </button>
                    </div>
                  </div>
                )}

                {/* Industrial Viewfinder Reticle Overlay (Laser scan effect) */}
                {cameraPermission === 'granted' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    {/* Darkened Vignette */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Scanner Framing Box */}
                    <div className={`relative w-64 h-64 sm:w-72 sm:h-72 border-2 rounded-[4px] bg-transparent transition-colors duration-300 ${
                      showSuccessAnimation 
                        ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' 
                        : 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    }`}>
                      {/* Corner Target Markers */}
                      <span className={`absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 transition-colors duration-300 ${showSuccessAnimation ? 'border-emerald-400' : 'border-amber-400'}`} />
                      <span className={`absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 transition-colors duration-300 ${showSuccessAnimation ? 'border-emerald-400' : 'border-amber-400'}`} />
                      <span className={`absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 transition-colors duration-300 ${showSuccessAnimation ? 'border-emerald-400' : 'border-amber-400'}`} />
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 transition-colors duration-300 ${showSuccessAnimation ? 'border-emerald-400' : 'border-amber-400'}`} />

                      {/* Center Crosshair Target */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className={`w-6 h-0.5 ${showSuccessAnimation ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div className={`h-6 w-0.5 absolute ${showSuccessAnimation ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      </div>

                      {/* Animated Laser Scanning Line */}
                      {!isPaused && !showSuccessAnimation && (
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-[bounce_2s_infinite]" />
                      )}

                      {/* FRAMER-MOTION SUCCESS ANIMATION OVERLAY (Green Ring Pulse & Checkmark) */}
                      <AnimatePresence>
                        {showSuccessAnimation && (
                          <motion.div
                            key="scan-success-animation"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[3px] bg-emerald-950/30 backdrop-blur-[1.5px]"
                          >
                            {/* Expanding Subtle Green Ring Pulse 1 */}
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0.8 }}
                              animate={{ scale: 1.4, opacity: 0 }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                              className="absolute w-36 h-36 rounded-full border-2 border-emerald-400/80 pointer-events-none"
                            />
                            {/* Expanding Subtle Green Ring Pulse 2 (Staggered) */}
                            <motion.div
                              initial={{ scale: 0.6, opacity: 0.6 }}
                              animate={{ scale: 1.8, opacity: 0 }}
                              transition={{ duration: 1.4, repeat: Infinity, delay: 0.35, ease: 'easeOut' }}
                              className="absolute w-36 h-36 rounded-full border border-emerald-300/60 pointer-events-none"
                            />

                            {/* Centered Checkmark Badge with spring entry */}
                            <motion.div
                              initial={{ scale: 0, rotate: -25 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                              className="relative z-10 w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.7)]"
                            >
                              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                            </motion.div>

                            <motion.span
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 }}
                              className="relative z-10 mt-3 px-2.5 py-0.5 rounded-[2px] bg-black/80 border border-emerald-400/60 text-emerald-300 text-[11px] font-black uppercase tracking-wider font-mono shadow-md"
                            >
                              CÓDIGO CONFIRMADO
                            </motion.span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Subtitle Inside Reticle */}
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-amber-300/90 whitespace-nowrap bg-black/75 px-2 py-0.5 rounded-[2px] border border-amber-400/30">
                        {showSuccessAnimation ? '¡Lectura exitosa!' : 'Apunta al código QR o rótulo'}
                      </div>
                    </div>
                  </div>
                )}

                {/* In-View Controls (Torch, Camera Switch, Pause) */}
                {cameraPermission === 'granted' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-[2px] transition-all cursor-pointer shadow-md ${
                          isTorchOn ? 'bg-amber-400 text-black' : 'bg-zinc-900/80 text-white hover:bg-zinc-800'
                        }`}
                        title={isTorchOn ? 'Apagar linterna' : 'Encender linterna'}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4 fill-black" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={flipCamera}
                      className="p-2 rounded-[2px] bg-zinc-900/80 hover:bg-zinc-800 text-white transition-all cursor-pointer shadow-md"
                      title="Alternar cámara trasera / frontal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Reconocimiento óptico activo</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaused(!isPaused);
                  }}
                  className="text-amber-400 hover:underline cursor-pointer uppercase font-bold"
                >
                  {isPaused ? 'Reanudar Escáner' : 'Pausar'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STATIC FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-[4px] bg-zinc-950 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-zinc-950/80 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-[3px] bg-zinc-900 text-amber-400 group-hover:scale-110 flex items-center justify-center border border-zinc-800 transition-transform mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wide">
                  Arrastra o selecciona una foto con código QR
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Compatible con capturas de pantalla, fotos tomadas en el patio con WhatsApp o rótulos de almacén.
                </p>
                <span className="mt-4 px-3 py-1 rounded-[2px] bg-zinc-800 text-amber-400 text-xs font-bold uppercase border border-zinc-700">
                  Explorar Archivos...
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL INPUT */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Ingresa Código, Modelo o Número de Parte OEM:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ej. JCB 3CX, 922E-HD, 332/F8114, 02/200010..."
                    className="flex-1 px-3 py-2.5 rounded-[2px] bg-zinc-950 border border-zinc-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-mono text-xs uppercase"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase transition-colors cursor-pointer shrink-0"
                  >
                    Buscar Ficha
                  </button>
                </div>
              </div>

              {/* Instant suggestions quick-bar */}
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                  Ejemplos Frecuentes en Patio y Taller:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['JCB-3CX-ECO', 'LIUGONG-922E', 'AMMANN-ASC100', '332/F8114', '02/200010', 'P550388'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setManualCode(code);
                        handleDecodedString(code);
                      }}
                      className="px-2 py-1 rounded-[2px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: RECENT SCANS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Historial de Escaneos Recientes ({recentScans.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY_RECENT_SCANS);
                    setRecentScans([]);
                  }}
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer uppercase font-bold"
                >
                  Limpiar Historial
                </button>
              </div>

              {recentScans.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No hay lecturas registradas aún en este dispositivo.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentScans.map((scan) => (
                    <div
                      key={`${scan.type}-${scan.id}-${scan.timestamp}`}
                      onClick={() => {
                        onNavigateToProduct(scan.type, scan.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-400/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={scan.image}
                          alt={scan.name}
                          className="w-10 h-10 rounded-[2px] object-cover bg-black border border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1 py-0.2 rounded-[2px] text-[8px] font-black uppercase bg-amber-400 text-black">
                              {scan.brand}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {scan.code}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-white truncate uppercase group-hover:text-amber-400 transition-colors">
                            {scan.name}
                          </h5>
                          <span className="text-[10px] font-mono text-zinc-500">
                            US${scan.priceUsd.toLocaleString()} • RD${Math.round(scan.priceUsd * USD_TO_DOP_RATE).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-amber-400 shrink-0 text-xs font-bold uppercase">
                        <span>Ver</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETECTED PRODUCT CARD BANNER */}
          <AnimatePresence>
            {scannedResult && (
              <motion.div
                key={`scanned-card-${scannedResult.item.id}`}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative p-4 rounded-[4px] bg-zinc-950 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)] space-y-3 overflow-hidden"
              >
                {/* Subtle Ambient Green Pulse Backdrop Glow */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.2, 0.45, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent pointer-events-none"
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    <span>
                      ¡{scannedResult.type === 'machinery' ? 'Maquinaria' : 'Repuesto OEM'} Reconocido!
                    </span>
                  </div>

                  {autoNavCountdown !== null && (
                    <motion.span 
                      key={autoNavCountdown}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-[2px] border border-amber-400/30"
                    >
                      Redirigiendo en {autoNavCountdown}s...
                    </motion.span>
                  )}
                </div>

              {/* Product Info Row */}
              <div className="flex items-start gap-3 p-2.5 rounded-[3px] bg-zinc-900 border border-zinc-800">
                <img
                  src={scannedResult.item.image}
                  alt={scannedResult.item.name}
                  className="w-16 h-16 rounded-[2px] object-cover bg-black shrink-0 border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-black uppercase tracking-wider bg-amber-400 text-black">
                      {scannedResult.item.brand}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-zinc-300">
                      {scannedResult.type === 'machinery'
                        ? `MOD. ${(scannedResult.item as Machine).modelCode || scannedResult.item.id}`
                        : `P/N: ${(scannedResult.item as Part).partNumber || scannedResult.item.id}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white truncate uppercase">
                    {scannedResult.item.name}
                  </h4>
                  <p className="text-xs font-mono font-black text-amber-400 mt-0.5">
                    US$
                    {(scannedResult.type === 'machinery'
                      ? (scannedResult.item as Machine).basePriceUsd
                      : (scannedResult.item as Part).priceUsd
                    ).toLocaleString()}{' '}
                    • RD$
                    {Math.round(
                      (scannedResult.type === 'machinery'
                        ? (scannedResult.item as Machine).basePriceUsd
                        : (scannedResult.item as Part).priceUsd) * USD_TO_DOP_RATE
                    ).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-1">
                    {scannedResult.item.description}
                  </p>
                </div>
              </div>

              {/* Staff Inventory Log Sincronization Notification */}
              {lastLoggedScanId && (
                <div className="p-2 rounded-[2px] bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Registrado en Firestore <strong className="text-white">inventory_logs</strong> ({lastLoggedScanId.slice(0, 16)}...)
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 hidden sm:inline">
                    {locationStatus}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleNavigateImmediate}
                  className="p-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer uppercase col-span-2 sm:col-span-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                  <span>{addedToCartToast ? '¡Agregado!' : 'Cotizar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar URL'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="p-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escanear Otro</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* UNRECOGNIZED QR CODE FALLBACK BANNER */}
          {unrecognizedCode && !scannedResult && (
            <div className="p-3.5 rounded-[4px] bg-zinc-950 border border-amber-500/40 space-y-2.5 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Código Detectado No Catalogado Directamente</span>
              </div>
              <p className="text-zinc-400 font-mono text-[11px] break-all bg-black/60 p-2 rounded-[2px] border border-zinc-800">
                {unrecognizedCode}
              </p>
              <p className="text-zinc-400 text-[11px]">
                El código leído no coincide con un identificador exacto de maquinaria ni repuesto en la base de datos de TMD Dominicana. Puedes copiarlo o buscarlo en el catálogo general.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(unrecognizedCode);
                  }}
                  className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Copiar Texto
                </button>
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="px-3 py-1.5 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase cursor-pointer"
                >
                  Escanear de Nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            <HardHat className="w-3.5 h-3.5 text-amber-400" />
            <span>TMD Dominicana • Sede Central Km 22</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
