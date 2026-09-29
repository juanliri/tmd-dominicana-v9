import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  HardHat, 
  Quote, 
  ChevronRight, 
  ChevronLeft,
  ThumbsUp,
  X,
  Send,
  PlusCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { CONTRACTOR_TESTIMONIALS, CONTRACTOR_STATS } from '../data/testimonials';
import { ContractorTestimonial } from '../types';

interface ContractorTestimonialsProps {
  onNavigate?: (route: string) => void;
  onSelectMachineByName?: (machineName: string) => void;
}

export const ContractorTestimonials: React.FC<ContractorTestimonialsProps> = ({
  onNavigate,
  onSelectMachineByName
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [testimonialsList, setTestimonialsList] = useState<ContractorTestimonial[]>(CONTRACTOR_TESTIMONIALS);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({
    'test-1': 24,
    'test-2': 19,
    'test-3': 31,
    'test-4': 15,
    'test-5': 18,
    'test-6': 22
  });

  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [selectedRefContractor, setSelectedRefContractor] = useState<ContractorTestimonial | null>(null);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);

  const [referenceForm, setReferenceForm] = useState({
    name: '',
    company: '',
    phone: '',
    province: 'La Altagracia',
    interestedEquipment: 'JCB 3CX Eco'
  });
  const [referenceSent, setReferenceSent] = useState(false);

  const [newReviewForm, setNewReviewForm] = useState({
    author: '',
    role: 'Ingeniero Residente',
    company: '',
    province: 'Santo Domingo',
    sector: 'Construcción y Edificaciones',
    project: '',
    equipmentUsed: 'JCB 3CX Eco',
    rating: 5,
    review: ''
  });
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 360;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleLike = (id: string) => {
    const isLiked = likedReviews[id];
    setLikedReviews(prev => ({ ...prev, [id]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + (isLiked ? -1 : 1)
    }));
  };

  const handleOpenReferenceModal = (testimonial?: ContractorTestimonial) => {
    if (testimonial) {
      setSelectedRefContractor(testimonial);
      setReferenceForm(prev => ({
        ...prev,
        province: testimonial.province,
        interestedEquipment: testimonial.equipmentUsed[0] || 'JCB 3CX Eco'
      }));
    }
    setShowReferenceModal(true);
  };

  const handleSendReferenceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setReferenceSent(true);
    setTimeout(() => {
      const text = encodeURIComponent(
        `*Solicitud de Referencias Técnicas - TMD*\n` +
        `Nombre: ${referenceForm.name}\n` +
        `Empresa: ${referenceForm.company}\n` +
        `Teléfono: ${referenceForm.phone}\n` +
        `Provincia: ${referenceForm.province}\n` +
        `Equipo: ${referenceForm.interestedEquipment}`
      );
      window.open(`https://wa.me/18095601234?text=${text}`, '_blank');
      setShowReferenceModal(false);
      setReferenceSent(false);
    }, 600);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.author || !newReviewForm.company || !newReviewForm.review) return;

    const newTestimonial: ContractorTestimonial = {
      id: `user-rev-${Date.now()}`,
      author: newReviewForm.author,
      role: newReviewForm.role,
      company: newReviewForm.company,
      city: newReviewForm.province,
      province: newReviewForm.province,
      region: 'Gran Santo Domingo',
      sector: newReviewForm.sector as ContractorTestimonial['sector'],
      project: newReviewForm.project || 'Proyecto de Infraestructura Nacional',
      rating: newReviewForm.rating,
      date: 'Reciente',
      equipmentUsed: [newReviewForm.equipmentUsed],
      review: newReviewForm.review,
      highlightMetric: {
        value: '+1,500 hrs',
        label: 'Operación continua'
      },
      verifiedContractor: true
    };

    setTestimonialsList(prev => [newTestimonial, ...prev]);
    setReviewSubmittedSuccess(true);
    setTimeout(() => {
      setShowAddReviewModal(false);
      setReviewSubmittedSuccess(false);
      setNewReviewForm({
        author: '',
        role: 'Ingeniero Residente',
        company: '',
        province: 'Santo Domingo',
        sector: 'Construcción y Edificaciones',
        project: '',
        equipmentUsed: 'JCB 3CX Eco',
        rating: 5,
        review: ''
      });
    }, 1000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 font-mono" id="testimonios-contratistas">
      <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 p-4 sm:p-5 shadow-xl">
        
        {/* Compact Header with Stats & Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/30 text-amber-400 type-badge">
                FAENA REAL EN RD
              </span>
              <div className="flex items-center gap-1 type-badge text-zinc-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="type-metric text-white">{CONTRACTOR_STATS.averageRating}</span>
                <span className="text-zinc-500 font-normal">({CONTRACTOR_STATS.totalReviews} RESEÑAS)</span>
              </div>
            </div>
            <h2 className="text-base sm:text-lg type-card-title text-white">
              TESTIMONIOS DE CONTRATISTAS LOCALES
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddReviewModal(true)}
              className="px-2.5 py-1 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>DEJAR RESEÑA</span>
            </button>

            <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer border border-zinc-800"
                title="Ver anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-[3px] bg-zinc-950 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer border border-zinc-800"
                title="Ver siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Horizontal Slider */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-3.5 overflow-x-auto pt-3.5 pb-1 scrollbar-none snap-x"
        >
          {testimonialsList.map((item) => (
            <div
              key={item.id}
              className="w-[290px] sm:w-[330px] lg:w-[360px] shrink-0 snap-start p-3.5 rounded-[5px] bg-zinc-950 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-1.5 py-0.5 rounded-[3px] bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase">
                    {item.sector}
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 uppercase font-bold">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{item.province}</span>
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white line-clamp-1 mb-1 uppercase font-display">
                  {item.project}
                </h4>

                {item.highlightMetric && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-zinc-900 border border-zinc-800 text-amber-400 text-[10px] font-bold font-mono mb-2 uppercase">
                    <span>{item.highlightMetric.value}</span>
                    <span className="text-zinc-400 text-[10px] font-bold">• {item.highlightMetric.label}</span>
                  </div>
                )}

                <p className="text-[11px] text-zinc-300 italic line-clamp-3 leading-relaxed mb-3">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <h5 className="font-bold text-[11px] text-white leading-tight uppercase">
                    {item.author}
                  </h5>
                  <p className="text-[10px] text-zinc-500 truncate max-w-[150px] uppercase">
                    {item.company}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(item.id)}
                    className="p-1 text-[10px] font-bold text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <ThumbsUp className={`w-3 h-3 ${likedReviews[item.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{likeCounts[item.id] || 12}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReferenceModal(item)}
                    className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer uppercase"
                  >
                    REFERENCIA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Modal */}
      {showReferenceModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-mono">
          <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xs font-black text-white uppercase font-display">
                  CONTACTO DE REFERENCIA EN ZONA
                </h3>
                <p className="text-[10px] text-zinc-400 uppercase">
                  Coordinamos contacto con contratistas en su provincia.
                </p>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReferenceRequest} className="space-y-2 text-xs">
              <input
                type="text"
                required
                value={referenceForm.name}
                onChange={(e) => setReferenceForm({ ...referenceForm, name: e.target.value })}
                placeholder="SU NOMBRE / EMPRESA *"
                className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
              />
              <input
                type="tel"
                required
                value={referenceForm.phone}
                onChange={(e) => setReferenceForm({ ...referenceForm, phone: e.target.value })}
                placeholder="TELÉFONO WHATSAPP *"
                className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase rounded-[3px] text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>CONTACTAR POR WHATSAPP</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-mono">
          <div className="bg-zinc-900 rounded-[5px] border border-zinc-800 max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-xs font-black text-white uppercase font-display">
                PUBLICAR RESEÑA DE OBRA
              </h3>
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmittedSuccess ? (
              <div className="py-4 text-center text-xs text-emerald-400 font-bold uppercase">
                ¡RESEÑA REGISTRADA CON ÉXITO!
              </div>
            ) : (
              <form onSubmit={handleAddReviewSubmit} className="space-y-2 text-xs">
                <input
                  type="text"
                  required
                  value={newReviewForm.author}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                  placeholder="NOMBRE Y APELLIDO *"
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  required
                  value={newReviewForm.company}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, company: e.target.value })}
                  placeholder="EMPRESA / CONSTRUCTORA *"
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                />
                <textarea
                  required
                  rows={3}
                  value={newReviewForm.review}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, review: e.target.value })}
                  placeholder="DESCRIBA EL RENDIMIENTO DE SU MAQUINARIA..."
                  className="w-full px-2.5 py-1.5 rounded-[3px] bg-zinc-950 border border-zinc-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase rounded-[3px] text-xs transition-all cursor-pointer shadow-xs"
                >
                  PUBLICAR RESEÑA
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
