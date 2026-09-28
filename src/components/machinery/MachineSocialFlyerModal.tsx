import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Smartphone, 
  Square, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  QrCode, 
  Truck, 
  Building2, 
  DollarSign,
  Fuel,
  Gauge
} from 'lucide-react';
import { Machine } from '../../types';
import { USD_TO_DOP_RATE } from '../../data/catalog';

interface MachineSocialFlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine | null;
}

export const MachineSocialFlyerModal: React.FC<MachineSocialFlyerModalProps> = ({
  isOpen,
  onClose,
  machine
}) => {
  const [format, setFormat] = useState<'story' | 'square'>('story'); // 9:16 or 1:1
  const [theme, setTheme] = useState<'dark' | 'gold'>('dark');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !machine) return null;

  const basePriceUsd = machine.basePriceUsd || 89500;
  const basePriceDop = Math.round(basePriceUsd * USD_TO_DOP_RATE);

  const handleCopyCaption = () => {
    const caption = `🚜 ¡DISPONIBLE EN PATIO CENTRAL KM 22!
${machine.brand.toUpperCase()} ${machine.name.toUpperCase()}

⚡ Potencia: ${machine.powerHp || '173'} HP
⚖️ Peso Operativo: ${machine.operatingWeightKg ? (machine.operatingWeightKg / 1000).toFixed(1) + ' Ton' : '22.0 Ton'}
🛡️ Garantía: 3 Años / 4,500 Horas TMD Care
💳 Financiamiento: Leasing Disponible con Banca Dominicana (Popular / BHD / Banreservas)

📍 Entrega Inmediata en República Dominicana
📲 Cotizaciones: +1 (809) 560-1234
🌐 TMD Dominicana | tmd.com.do`;

    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFlyer = () => {
    setIsGenerating(true);

    // Create an offscreen HTML5 canvas to export high-resolution flyer
    const canvas = document.createElement('canvas');
    const width = format === 'story' ? 1080 : 1080;
    const height = format === 'story' ? 1920 : 1080;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (theme === 'dark') {
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#18181b');
      bgGrad.addColorStop(1, '#000000');
    } else {
      bgGrad.addColorStop(0, '#18181b');
      bgGrad.addColorStop(0.7, '#27272a');
      bgGrad.addColorStop(1, '#1c1917');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Accent header border
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, width, 16);

    // Header Branding
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('TMD DOMINICANA', 60, 90);

    ctx.font = '22px monospace';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('DISTRIBUIDOR OFICIAL MAQUINARIA PESADA RD', 60, 130);

    // Brand and Model
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${machine.brand.toUpperCase()} ${machine.name.toUpperCase()}`, 60, 220);

    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`COD: ${machine.modelCode || 'MOD-2026'} • DISPONIBILIDAD INMEDIATA KM 22`, 60, 270);

    // Image Drawing
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imgHeight = format === 'story' ? 820 : 420;
      ctx.drawImage(img, 60, 310, width - 120, imgHeight);

      // Specs Container
      const specsY = 310 + imgHeight + 50;
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.fillRect(60, specsY, width - 120, 280);
      ctx.strokeRect(60, specsY, width - 120, 280);

      // Specs entries
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`POTENCIA: ${machine.powerHp || '173'} HP`, 100, specsY + 70);
      ctx.fillText(`PESO: ${machine.operatingWeightKg ? (machine.operatingWeightKg / 1000).toFixed(1) + ' Ton' : '22.0 Ton'}`, 580, specsY + 70);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`MOTOR: CUMMINS / PERKINS TIER 3`, 100, specsY + 145);
      ctx.fillText(`CABINA: ROPS / FOPS CLIMATIZADA`, 100, specsY + 220);

      // Price Banner
      const priceY = specsY + 330;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(60, priceY, width - 120, 160);

      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#000000';
      ctx.fillText('INVERSIÓN REFERENCIAL:', 100, priceY + 55);

      ctx.font = 'bold 64px monospace';
      ctx.fillText(`US$ ${basePriceUsd.toLocaleString()}`, 100, priceY + 125);

      ctx.font = 'bold 34px monospace';
      ctx.fillText(`(~RD$ ${basePriceDop.toLocaleString()})`, 620, priceY + 125);

      // Footer Contact
      const footerY = height - 90;
      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PATIO CENTRAL: KM 22 AUTOPISTA DUARTE • WHATSAPP: +1 (809) 560-1234', 60, footerY);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `TMD_Flyer_${machine.name.replace(/\s+/g, '_')}_${format}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsGenerating(false);
    };

    img.onerror = () => {
      // Fallback without image
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `TMD_Flyer_${machine.name.replace(/\s+/g, '_')}_${format}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsGenerating(false);
    };

    img.src = machine.image;
  };

  const shareWhatsAppUrl = `https://wa.me/18095601234?text=${encodeURIComponent(
    `Hola TMD Dominicana, deseo cotizar la unidad ${machine.brand} ${machine.name} vista en el Flyer Comercial Social. Inversión US$ ${basePriceUsd.toLocaleString()}.`
  )}`;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-[5px] max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[2px] bg-amber-400 text-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  Marketing Social & Flyers HD (Task #17)
                </span>
                <span className="text-[10px] text-zinc-400">
                  Exportación 1080px
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight mt-0.5 font-display">
                Generador de Flyer Social: {machine.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Formato de Imagen:</span>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-[2px] border border-zinc-800">
              <button
                type="button"
                onClick={() => setFormat('story')}
                className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  format === 'story' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Historia / Estado (9:16)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('square')}
                className={`px-3 py-1 rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  format === 'square' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Post Cuadrado (1:1)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCaption}
              className="px-3 py-1.5 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? '¡Texto Copiado!' : 'Copiar Texto Redes'}</span>
            </button>

            <a
              href={shareWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Flyer Live Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-zinc-950/50">
          <div
            ref={flyerRef}
            className={`bg-zinc-950 border-2 border-amber-400/80 rounded-[4px] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${
              format === 'story' ? 'w-[320px] sm:w-[360px] min-h-[580px]' : 'w-[340px] sm:w-[420px] min-h-[420px]'
            }`}
          >
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />

            {/* Header Brand */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div>
                  <span className="text-amber-400 font-black text-sm tracking-wider block font-display">
                    TMD DOMINICANA
                  </span>
                  <span className="text-[9px] text-zinc-400 tracking-tight block">
                    Distribuidores Oficiales • Km 22 Aut. Duarte
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30 uppercase">
                  Entrega Inmediata
                </span>
              </div>

              {/* Machine Title & Category */}
              <div className="pt-2">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                  {machine.brand} Heavy Duty
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase leading-tight font-display">
                  {machine.name}
                </h3>
              </div>
            </div>

            {/* Machine Hero Photo */}
            <div className="relative my-3 rounded-[3px] overflow-hidden border border-zinc-800 bg-zinc-900 aspect-video">
              <img
                src={machine.image}
                alt={machine.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[2px] bg-black/80 backdrop-blur-sm text-[10px] text-amber-400 font-bold border border-amber-400/30">
                PDI Certificado 85 Puntos
              </div>
            </div>

            {/* Specs & Pricing Deck */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block">Potencia</span>
                  <span className="font-bold text-white text-xs">{machine.powerHp || '173'} HP</span>
                </div>
                <div className="p-2 rounded-[2px] bg-zinc-900 border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 uppercase block">Peso Operativo</span>
                  <span className="font-bold text-white text-xs">
                    {machine.operatingWeightKg ? (machine.operatingWeightKg / 1000).toFixed(1) + ' Ton' : '22.0 Ton'}
                  </span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="p-2.5 rounded-[3px] bg-amber-400 text-black flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider block">
                    Inversión Referencial
                  </span>
                  <span className="text-lg font-black font-mono leading-none block">
                    US$ {basePriceUsd.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold font-mono">
                  ~RD$ {basePriceDop.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer QR & Contact */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[9px] text-zinc-400">
              <div className="space-y-0.5">
                <span className="text-white font-bold block">Garantía Oficial 3 Años TMD Care</span>
                <span>WhatsApp: +1 (809) 560-1234 • tmd.com.do</span>
              </div>
              <div className="p-1 rounded-[2px] bg-white text-black shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] hidden sm:inline">
            Formato optimizado con proporciones exactas para Instagram Stories y estados corporativos.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleDownloadFlyer}
              disabled={isGenerating}
              className="px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PNG...' : 'Descargar Flyer PNG (HD)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
