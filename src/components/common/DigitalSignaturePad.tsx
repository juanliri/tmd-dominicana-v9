import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface DigitalSignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  signerName?: string;
  className?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSignatureChange,
  signerName = '',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState<'amber' | 'cyan' | 'white'>('amber');

  // Setup canvas with high DPI for crisp lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 500;
    const height = 150;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;

    handleClear();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Apply color
    ctx.strokeStyle = strokeColor === 'amber' ? '#fbbf24' : strokeColor === 'cyan' ? '#38bdf8' : '#ffffff';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  // Generate stylized signature demonstration for quick demo
  const handleAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleClear();

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const startX = width * 0.15;
    const startY = height * 0.65;
    ctx.moveTo(startX, startY);

    // Calligraphic flourish
    ctx.bezierCurveTo(startX + 30, startY - 50, startX + 50, startY - 40, startX + 80, startY);
    ctx.bezierCurveTo(startX + 110, startY + 20, startX + 130, startY - 30, startX + 170, startY - 10);
    ctx.bezierCurveTo(startX + 210, startY + 15, startX + 250, startY - 60, startX + 290, startY - 5);
    ctx.bezierCurveTo(startX + 320, startY + 25, startX + 340, startY + 10, startX + 370, startY - 20);

    // Horizontal underline flourish
    ctx.moveTo(startX - 10, startY + 18);
    ctx.lineTo(startX + 380, startY + 18);
    ctx.stroke();

    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {/* Top Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-300 uppercase flex items-center gap-1.5 text-[11px]">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>Firma Táctil en Pantalla (Dedo o Stylus) *</span>
          </span>
          {hasDrawn && (
            <span className="px-2 py-0.5 rounded-[2px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> CAPTURADA
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoSign}
            className="text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            title="Firmar automáticamente con trazo caligráfico demo"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Trazo Rápido Demo</span>
          </button>
          <span className="text-zinc-700">|</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Touch/Mouse Canvas Container */}
      <div className="relative bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[3px] overflow-hidden group hover:border-amber-400/40 transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[150px] cursor-crosshair touch-none"
        />

        {/* Guideline line */}
        <div className="absolute left-6 right-6 bottom-9 border-b border-zinc-800/80 pointer-events-none flex justify-between items-center text-[9px] text-zinc-600 font-mono">
          <span>X — Línea base de firma</span>
          <span>{signerName ? `Autorizado: ${signerName}` : 'Firma de apoderado o ingeniero de obra'}</span>
        </div>

        {/* Watermark notice */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-600 text-xs">
            <span className="flex items-center gap-1.5 opacity-60">
              <PenTool className="w-4 h-4 text-amber-400/60" />
              Dibuje su firma con el dedo, stylus o ratón aquí
            </span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-500 font-sans flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>Firma digital con estampa de tiempo y hash criptográfico vinculante para Proforma y Orden de Compra TMD.</span>
      </p>
    </div>
  );
};
