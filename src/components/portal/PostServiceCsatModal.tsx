import React, { useState } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  Send,
  ExternalLink,
  Award,
  Clock
} from 'lucide-react';

interface PostServiceCsatModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderNumber?: string;
  machineModel?: string;
  technicianName?: string;
}

export const PostServiceCsatModal: React.FC<PostServiceCsatModalProps> = ({
  isOpen,
  onClose,
  workOrderNumber = 'OT-8821 (Fullbay #49102)',
  machineModel = 'LiuGong 922E HD',
  technicianName = 'Manuel Santos (Especialista Hidráulico)'
}) => {
  const [csatRating, setCsatRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number>(10);
  const [punctuality, setPunctuality] = useState<'early' | 'on_time' | 'slight_delay' | 'unacceptable'>('on_time');
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2200);
  };

  const handleShareWhatsAppSurvey = () => {
    const text = encodeURIComponent(
      `Estimado cliente de TMD Dominicana: Por favor evalúe el servicio de su equipo ${machineModel} (Orden ${workOrderNumber}). Su opinión garantiza nuestra certificación ISO 9001. Califique aquí: https://tmd.com.do/csat/${workOrderNumber.split(' ')[0]}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[5px] shadow-2xl text-zinc-200 overflow-hidden font-mono flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-[3px] bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                  ISO 9001 • CALIDAD DE SERVICIO
                </span>
                <span className="text-xs text-zinc-400 font-sans">
                  Encuesta Post-Servicio Técnico & Taller
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-white mt-0.5">
                Evaluación de Satisfacción (CSAT & NPS)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[2px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Work Order Info Bar */}
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800 text-xs flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] block">ORDEN & EQUIPO:</span>
            <span className="text-white font-bold">{workOrderNumber} &bull; {machineModel}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 text-[10px] block">TÉCNICO A CARGO:</span>
            <span className="text-amber-400 font-bold">{technicianName}</span>
          </div>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white uppercase font-display">
              ¡Muchas Gracias por su Evaluación!
            </h3>
            <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
              Sus respuestas han sido registradas en el panel de aseguramiento de calidad de TMD Dominicana para auditorías ISO 9001 y mejora continua.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
            {/* 1. CSAT Star Rating */}
            <div className="space-y-2">
              <label className="block text-zinc-300 font-bold uppercase text-[11px]">
                1. ¿Cómo califica la calidad de la reparación recibida? *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCsatRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-zinc-600 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || csatRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-amber-400 font-mono">
                  {csatRating === 5 ? 'Excelente (5/5)' : csatRating === 4 ? 'Muy Bueno (4/5)' : csatRating === 3 ? 'Aceptable (3/5)' : 'Necesita Mejora'}
                </span>
              </div>
            </div>

            {/* 2. Punctuality and Response Time */}
            <div className="space-y-2">
              <label className="block text-zinc-300 font-bold uppercase text-[11px]">
                2. Puntualidad y Tiempo de Respuesta del Taller / Auxilio 4x4:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPunctuality('early')}
                  className={`p-2 rounded-[2px] border text-left cursor-pointer transition-all ${
                    punctuality === 'early'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚡ Antes del tiempo estimado
                </button>
                <button
                  type="button"
                  onClick={() => setPunctuality('on_time')}
                  className={`p-2 rounded-[2px] border text-left cursor-pointer transition-all ${
                    punctuality === 'on_time'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ✓ Exactamente a tiempo
                </button>
                <button
                  type="button"
                  onClick={() => setPunctuality('slight_delay')}
                  className={`p-2 rounded-[2px] border text-left cursor-pointer transition-all ${
                    punctuality === 'slight_delay'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ⏳ Demora justificada
                </button>
                <button
                  type="button"
                  onClick={() => setPunctuality('unacceptable')}
                  className={`p-2 rounded-[2px] border text-left cursor-pointer transition-all ${
                    punctuality === 'unacceptable'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚠️ Retraso excesivo
                </button>
              </div>
            </div>

            {/* 3. NPS Score (0-10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-zinc-300 font-bold uppercase text-[11px]">
                  3. ¿Qué tan probable es que recomiende TMD a otro contratista? (NPS)
                </label>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-[2px] ${
                  npsScore >= 9 ? 'bg-emerald-500/20 text-emerald-400' : npsScore >= 7 ? 'bg-amber-400/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {npsScore} / 10 • {npsScore >= 9 ? 'Promotor' : npsScore >= 7 ? 'Pasivo' : 'Detractor'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 pt-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setNpsScore(score)}
                    className={`flex-1 py-1.5 rounded-[2px] border text-xs font-mono font-bold transition-all cursor-pointer ${
                      npsScore === score
                        ? score >= 9 ? 'bg-emerald-500 text-black border-emerald-400' : score >= 7 ? 'bg-amber-400 text-black border-amber-300' : 'bg-rose-500 text-white border-rose-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>0 (Nada probable)</span>
                <span>10 (Definitivamente sí)</span>
              </div>
            </div>

            {/* 4. Comments */}
            <div className="space-y-1.5">
              <label className="block text-zinc-300 font-bold uppercase text-[11px]">
                Comentarios Adicionales o Sugerencias:
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Indique si el técnico explicó claramente la falla resuelta o cualquier sugerencia para la gerencia..."
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-[2px] text-white focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleShareWhatsAppSurvey}
                className="w-full sm:w-auto px-3 py-2 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                title="Generar enlace corto de encuesta para enviar por WhatsApp al cliente"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-[2px] bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Evaluación</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Certificación ISO 9001:2015 en Gestión de Servicios y Taller.
          </span>
          <span className="font-mono text-[10px]">TMD CSAT Engine v9</span>
        </div>
      </div>
    </div>
  );
};
