import React, { useState, useRef, useEffect } from 'react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Phone,
  Wrench,
  Clock,
  RotateCcw,
  Minimize2,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Package,
  Layers,
  Bot
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
  actionLinks?: Array<{
    label: string;
    route?: string;
    action?: 'whatsapp' | 'call' | 'navigate';
  }>;
}

const FAQ_SUGGESTIONS = [
  {
    icon: Package,
    label: 'Filtros Donaldson y Fleetguard',
    query: '¿Tienen filtros Donaldson y Fleetguard en stock para entrega inmediata?'
  },
  {
    icon: Wrench,
    label: 'Servicio Móvil 24/7 en Campo',
    query: '¿Cómo funciona la unidad móvil de servicio técnico 24/7 en campo para emergencias?'
  },
  {
    icon: Layers,
    label: 'Repuestos para JCB 3CX',
    query: '¿Qué repuestos tienen disponibles para retroexcavadoras JCB 3CX?'
  },
  {
    icon: Clock,
    label: 'Tiempos de entrega en RD',
    query: '¿Cuáles son los tiempos de entrega y cobertura para Santo Domingo, Santiago y Punta Cana?'
  }
];

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-init-1',
  sender: 'assistant',
  text: '¡Hola! Soy el **Asistente Virtual TMD 24/7** con tecnología de Inteligencia Artificial Gemini.\n\nEstoy disponible las 24 horas para responder consultas sobre **repuestos genuinos** (filtros Donaldson, tren de rodaje, hidráulica, dientes) y coordinar **servicio técnico especializado** en taller central o en campo para maquinaria **LiuGong, JCB y LS Tractor**.\n\n¿En qué podemos colaborar con su operación hoy?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  actionLinks: [
    { label: 'Ver Repuestos', route: '#/parts', action: 'navigate' },
    { label: 'Ver Servicios Técnicos', route: '#/service', action: 'navigate' },
    { label: 'WhatsApp Directo 24/7', action: 'whatsapp' }
  ]
};

interface ChatbotWidgetProps {
  onNavigate?: (route: string) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onNavigate }) => {
  const { isScrollingDown } = useScrollDirection();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // Handle sending a message to backend /api/chat
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message along with brief recent history for conversational context
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const replyText: string = data.reply || 'Disculpe, no pudimos procesar la respuesta. Por favor contáctenos al WhatsApp +1 (809) 560-1234.';

      // Determine context-driven action links
      const links: ChatMessage['actionLinks'] = [];
      const lower = replyText.toLowerCase();

      if (lower.includes('repuesto') || lower.includes('filtro') || lower.includes('diente') || lower.includes('oruga')) {
        links.push({ label: 'Explorar Catálogo Repuestos', route: '#/parts', action: 'navigate' });
      }
      if (lower.includes('servicio') || lower.includes('móvil') || lower.includes('taller') || lower.includes('diagnóstico')) {
        links.push({ label: 'Solicitar Servicio Técnico', route: '#/service', action: 'navigate' });
      }
      links.push({ label: 'Escalar a Asesor Humano', action: 'whatsapp' });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback,
        actionLinks: links
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Error contacting /api/chat:', err);
      // Resilient local fallback in client if server network fails
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: 'En **TMD Dominicana** estamos disponibles 24/7 para asistirlo. Puede contactar de inmediato con nuestra central de repuestos y servicio técnico vía WhatsApp o llamada telefónica al **+1 (809) 560-1234**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
        actionLinks: [
          { label: 'Llamar a Servicio Técnico', action: 'call' },
          { label: 'Abrir WhatsApp 24/7', action: 'whatsapp' }
        ]
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
  };

  const handleActionClick = (link: NonNullable<ChatMessage['actionLinks']>[number], messageContext?: string) => {
    if (link.action === 'whatsapp') {
      const text = encodeURIComponent(`Hola TMD Dominicana, estoy en su portal web y requiero asistencia sobre: ${messageContext ? messageContext.slice(0, 100) : 'repuestos y servicio técnico'}`);
      window.open(`https://wa.me/18095601234?text=${text}`, '_blank');
    } else if (link.action === 'call') {
      window.open('tel:+18095601234');
    } else if (link.action === 'navigate' && link.route && onNavigate) {
      onNavigate(link.route);
      // If mobile, close or minimize to allow full view
      if (window.innerWidth < 640) {
        setIsMinimized(true);
      }
    }
  };

  // Helper to format basic markdown-style text with bolding and bullet points
  const renderFormattedText = (rawText: string) => {
    return rawText.split('\n').map((line, index) => {
      // Check if line is empty
      if (!line.trim()) {
        return <div key={index} className="h-1.5" />;
      }

      // Check if bullet line
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().replace(/^[•\-\*]\s*/, '') : line;

      // Parse bold segments **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-amber-400">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={index} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
            <span className="text-zinc-300 leading-relaxed text-xs">
              {formattedParts}
            </span>
          </div>
        );
      }

      return (
        <p key={index} className="text-zinc-300 leading-relaxed text-xs my-1">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-auto font-mono">
      {/* CHAT WINDOW MODAL / DRAWER */}
      {isOpen && (
        <div
          className={`w-[calc(100vw-32px)] sm:w-[420px] bg-zinc-900 border border-zinc-800 rounded-[5px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out mb-3 ${
            isMinimized ? 'h-14' : 'h-[550px] max-h-[82vh]'
          }`}
          style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7)' }}
        >
          {/* HEADER */}
          <div className="bg-zinc-950 text-white px-3.5 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-[2px] bg-amber-400 flex items-center justify-center text-black font-black">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-zinc-950 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase">
                    TMD Asistente 24/7
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-[2px] bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center gap-0.5 uppercase">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 uppercase">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  En línea • Km 22 Autopista Duarte
                </p>
              </div>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Reiniciar conversación"
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Maximizar' : 'Minimizar'}
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5 rotate-180" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                className="p-1 text-zinc-400 hover:text-white rounded-[2px] hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CHAT BODY (Only when not minimized) */}
          {!isMinimized && (
            <>
              {/* Emergency Banner Notice */}
              <div className="bg-zinc-950 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
                <span className="flex items-center gap-1.5 font-medium truncate uppercase">
                  <ShieldAlert className="w-3 h-3 shrink-0 text-amber-400" />
                  Móvil de emergencia en mina u obra 24/7.
                </span>
                <button
                  onClick={() => handleActionClick({ label: 'WhatsApp', action: 'whatsapp' })}
                  className="font-bold text-amber-400 hover:text-amber-300 shrink-0 ml-2 cursor-pointer uppercase text-[10px]"
                >
                  WhatsApp →
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-zinc-900">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[90%] rounded-[2px] p-3 text-xs shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-amber-400 text-black font-semibold'
                          : 'bg-zinc-950 text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {msg.sender === 'assistant' ? (
                        <div>
                          {renderFormattedText(msg.text)}
                          
                          {/* Context action buttons inside the bubble */}
                          {msg.actionLinks && msg.actionLinks.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap gap-1.5">
                              {msg.actionLinks.map((link, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleActionClick(link, msg.text)}
                                  className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer uppercase ${
                                    link.action === 'whatsapp'
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                                  }`}
                                >
                                  {link.action === 'whatsapp' && <Phone className="w-2.5 h-2.5" />}
                                  {link.action === 'navigate' && <ExternalLink className="w-2.5 h-2.5 text-amber-400" />}
                                  <span>{link.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] text-zinc-500 mt-0.5 px-1 font-mono uppercase">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs bg-zinc-950 border border-zinc-800 p-2.5 rounded-[2px] w-max shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="font-medium text-zinc-300 text-[11px] uppercase">
                      TMD Asistente respondiendo...
                    </span>
                    <span className="flex gap-1">
                      <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1 h-1 bg-amber-400 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTIONS (FAQ Chips) */}
              <div className="px-3 py-1.5 bg-zinc-950 border-t border-zinc-800 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1.5 w-max">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider pl-0.5">
                    Frecuentes:
                  </span>
                  {FAQ_SUGGESTIONS.map((faq, idx) => {
                    const Icon = faq.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(faq.query)}
                        disabled={isLoading}
                        className="px-2 py-0.5 rounded-[2px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-800 transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 uppercase"
                      >
                        <Icon className="w-2.5 h-2.5 text-amber-400" />
                        <span>{faq.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-1.5 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Pregunte sobre repuestos, servicios..."
                  disabled={isLoading}
                  className="flex-1 bg-zinc-900 text-zinc-100 text-xs rounded-[2px] px-3 py-2 border border-zinc-800 focus:outline-none focus:border-amber-400 transition-all placeholder:text-zinc-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 bg-amber-400 hover:bg-amber-300 text-black rounded-[2px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 uppercase"
                  title="Enviar consulta"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* COMPACT & UNIFIED FLOATING ACTION LAUNCHER */}
      <div 
        className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
          isScrollingDown && !isOpen
            ? 'translate-y-28 opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        {/* Chatbot Toggle Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
            setHasUnread(false);
          }}
          className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 rounded-[2px] font-bold text-xs shadow-xl transition-all cursor-pointer border uppercase tracking-wider ${
            isOpen
              ? 'bg-zinc-900 text-white border-zinc-700 shadow-zinc-900/40'
              : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-100 hover:text-white border-zinc-800 hover:border-amber-400/60 shadow-2xl backdrop-blur-md'
          }`}
          aria-label="Abrir Asistente Virtual 24/7"
        >
          {isOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Cerrar</span>
            </>
          ) : (
            <>
              <div className="relative text-amber-400">
                <Bot className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-400 border border-zinc-900 rounded-full animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline">Asistente TMD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
