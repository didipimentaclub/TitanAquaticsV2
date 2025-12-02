
import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, ExternalLink, Calendar, MessageCircle, Video } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AquariumEvent } from '../types';
import { getEmbedUrl } from '../utils/videoHelpers';

const Events: React.FC = () => {
  const [events, setEvents] = useState<AquariumEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false }); // Ordenar por data do evento, não criação
      
      if (!error) setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8">
        <div className="bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-8 border border-white/10 text-center mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarDays size={120} /></div>
            <div className="relative z-10">
                <CalendarDays size={48} className="mx-auto text-[#4fb7b3] mb-4" />
                <h2 className="text-3xl font-heading font-bold text-white mb-2">Mural de Eventos</h2>
                <p className="text-slate-400">Fique por dentro de feiras, encontros e grupos exclusivos.</p>
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                 <div className="w-10 h-10 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
             </div>
        ) : events.length === 0 ? (
             <div className="text-center py-20 bg-[#1a1b3b]/20 rounded-2xl border border-dashed border-white/10">
                 <p className="text-slate-500">Nenhum evento programado no momento.</p>
             </div>
        ) : (
            <div className="space-y-6">
                {events.map(evt => (
                    <div key={evt.id} className="flex flex-col md:flex-row gap-0 rounded-2xl bg-[#1a1b3b]/60 border border-white/5 hover:border-[#4fb7b3]/30 transition-all duration-300 overflow-hidden shadow-lg group">
                        {/* Mídia (Vídeo ou Imagem) */}
                        <div className="w-full md:w-80 bg-black flex flex-col shrink-0 relative">
                            {evt.video_url ? (
                                <div className="relative w-full pt-[56.25%] bg-black h-full">
                                    <iframe 
                                        src={getEmbedUrl(evt.video_url)!} 
                                        className="absolute inset-0 w-full h-full" 
                                        allowFullScreen 
                                        title={evt.title}
                                    />
                                </div>
                            ) : evt.image ? (
                                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover min-h-[200px]" />
                            ) : (
                                <div className="h-full min-h-[200px] w-full bg-white/5 flex items-center justify-center text-slate-600">
                                    {evt.type === 'Grupo WhatsApp' ? <MessageCircle size={32} /> : <Calendar size={32} />}
                                </div>
                            )}
                            
                            {/* Overlay de Tipo na Imagem (Mobile) */}
                            <div className="absolute top-2 left-2 md:hidden">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-sm ${
                                    evt.type === 'Grupo WhatsApp' ? 'bg-green-500 text-black' : 'bg-[#4fb7b3] text-black'
                                }`}>
                                    {evt.type}
                                </span>
                            </div>
                        </div>
                        
                        {/* Conteúdo */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded hidden md:inline-block ${
                                    evt.type === 'Grupo WhatsApp' ? 'bg-green-500/10 text-green-400' : 'bg-[#4fb7b3]/10 text-[#4fb7b3]'
                                }`}>
                                    {evt.type}
                                </span>
                                <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-400" />
                                    {new Date(evt.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-3 font-heading group-hover:text-[#4fb7b3] transition-colors">
                                {evt.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                                <MapPin size={16} className={evt.type === 'Grupo WhatsApp' ? 'text-green-400' : 'text-[#4fb7b3]'} /> 
                                {evt.location}
                            </div>
                            
                            <p className="text-sm text-slate-300 mb-6 flex-1 leading-relaxed whitespace-pre-line">
                                {evt.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-3">
                                {evt.whatsapp_link && (
                                    <a 
                                        href={evt.whatsapp_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-white bg-green-600 px-6 py-3 rounded-lg uppercase tracking-widest flex items-center gap-2 hover:bg-green-500 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <MessageCircle size={16} fill="white" /> Entrar no Grupo
                                    </a>
                                )}
                                
                                {evt.link && (
                                    <a 
                                        href={evt.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-black bg-white px-4 py-3 rounded-lg uppercase tracking-widest flex items-center gap-2 hover:bg-[#4fb7b3] transition-colors"
                                    >
                                        Saiba Mais <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Events;
