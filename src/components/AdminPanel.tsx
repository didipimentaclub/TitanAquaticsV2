
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Settings, Shield, Plus, Trash2, Edit2, X, Save, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  userEmail?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  description?: string;
  link?: string;
  image?: string;
  video_url?: string;
  whatsapp_link?: string;
  created_at?: string;
}

// Tipos de evento incluindo Grupo WhatsApp
const EVENT_TYPES = [
  'Feira',
  'Encontro', 
  'Campeonato',
  'Workshop',
  'Loja',
  'Grupo WhatsApp',
  'Live/Transmissão',
  'Promoção'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ userEmail }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'settings'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Modal de Evento
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    location: '',
    type: 'Encontro',
    description: '',
    link: '',
    image: '',
    video_url: '',
    whatsapp_link: ''
  });

  useEffect(() => {
    checkAdmin();
  }, [userEmail]);

  const checkAdmin = async () => {
    if (!userEmail) return;

    // Acesso direto para o admin mestre
    if (userEmail.toLowerCase().trim() === 'kbludobarman@gmail.com') {
      setIsAdmin(true);
      fetchEvents();
      fetchUsers();
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', userEmail)
      .single();
    
    setIsAdmin(!!data);
    if (data) {
      fetchEvents();
      fetchUsers();
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    if (data) setEvents(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  // Abrir modal para NOVO evento
  const openNewEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      type: 'Encontro',
      description: '',
      link: '',
      image: '',
      video_url: '',
      whatsapp_link: ''
    });
    setIsEventModalOpen(true);
  };

  // Abrir modal para EDITAR evento
  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      location: event.location,
      type: event.type,
      description: event.description || '',
      link: event.link || '',
      image: event.image || '',
      video_url: event.video_url || '',
      whatsapp_link: event.whatsapp_link || ''
    });
    setIsEventModalOpen(true);
  };

  // Salvar evento (criar ou atualizar)
  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const eventData = {
        title: eventForm.title,
        date: eventForm.date,
        location: eventForm.location,
        type: eventForm.type,
        description: eventForm.description || null,
        link: eventForm.link || null,
        image: eventForm.image || null,
        video_url: eventForm.video_url || null,
        whatsapp_link: eventForm.whatsapp_link || null
      };

      if (editingEvent) {
        // ATUALIZAR evento existente
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
      } else {
        // CRIAR novo evento
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        
        if (error) throw error;
      }

      await fetchEvents();
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar: ' + err.message);
    }
    
    setSaving(false);
  };

  // Excluir evento
  const deleteEvent = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchEvents();
    }
  };

  // Atualizar plano do usuário
  const updateUserTier = async (userId: string, newTier: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: newTier })
      .eq('id', userId);
    
    if (!error) fetchUsers();
  };

  if (loading) {
    return <div className="p-6 text-white text-center">Verificando permissões...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-16 bg-[#1a1b3b]/60 rounded-2xl border border-white/10">
          <Shield size={48} className="mx-auto text-rose-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
          <p className="text-xs text-slate-500 mt-2">Email: {userEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-[#4fb7b3]/20">
          <Shield className="text-[#4fb7b3]" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Administração</h1>
          <p className="text-slate-400">Painel administrativo do Titan Aquatics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: 'events', label: 'Eventos', icon: Calendar, count: events.length },
          { id: 'users', label: 'Usuários', icon: Users, count: users.length },
          { id: 'settings', label: 'Config', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[#4fb7b3] text-black' : 'bg-white/5 text-white hover:bg-white/20'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-black/20' : 'bg-white/20'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Eventos */}
      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Gerenciar Eventos</h2>
            {/* BOTÃO NOVO EVENTO */}
            <button 
              onClick={openNewEvent}
              className="flex items-center gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white transition-colors"
            >
              <Plus size={18} /> Novo Evento
            </button>
          </div>
          
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-[#1a1b3b]/20 rounded-xl border border-dashed border-white/10">
                Nenhum evento cadastrado. Clique em "Novo Evento" para criar.
              </div>
            ) : (
              events.map(event => (
                <div 
                  key={event.id} 
                  className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-white/20 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {event.image && (
                      <img src={event.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        {event.title}
                        {event.type === 'Grupo WhatsApp' && <MessageCircle size={16} className="text-green-400" />}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        <span className="inline-block mr-2">📅 {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        <span className="inline-block mr-2 text-[#4fb7b3] font-bold uppercase text-[10px] bg-[#4fb7b3]/10 px-2 rounded">{event.type}</span>
                        <span className="inline-block">📍 {event.location}</span>
                      </p>
                      <div className="flex gap-3 mt-2 text-xs">
                        {event.link && <a href={event.link} target="_blank" className="text-slate-400 hover:text-white flex items-center gap-1"><ExternalLink size={10}/> Link</a>}
                        {event.whatsapp_link && <a href={event.whatsapp_link} target="_blank" className="text-green-400 hover:text-green-300 flex items-center gap-1"><MessageCircle size={10}/> WhatsApp</a>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto justify-end">
                    {/* BOTÃO EDITAR */}
                    <button 
                      onClick={() => openEditEvent(event)}
                      className="p-2 bg-white/10 rounded-lg text-white hover:bg-[#4fb7b3] hover:text-black transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    {/* BOTÃO EXCLUIR */}
                    <button 
                      onClick={() => deleteEvent(event.id)} 
                      className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Usuários */}
      {activeTab === 'users' && (
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-bold text-white mb-0">Base de Usuários ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase bg-black/20">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-mono text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-slate-300">{user.full_name || '-'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.subscription_tier || 'hobby'}
                        onChange={e => updateUserTier(user.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-bold uppercase bg-black/30 border border-white/10 outline-none cursor-pointer ${
                          user.subscription_tier === 'master' ? 'text-purple-300' :
                          user.subscription_tier === 'pro' ? 'text-[#4fb7b3]' :
                          'text-slate-400'
                        }`}
                      >
                        <option value="hobby">Hobby</option>
                        <option value="pro">Pro</option>
                        <option value="master">Master</option>
                        <option value="lojista">Lojista</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Config */}
      {activeTab === 'settings' && (
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Estatísticas do Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#4fb7b3]">{users.length}</p>
              <p className="text-xs text-slate-400">Usuários</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#4fb7b3]">{events.length}</p>
              <p className="text-xs text-slate-400">Eventos</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {users.filter(u => u.subscription_tier === 'pro' || u.subscription_tier === 'master').length}
              </p>
              <p className="text-xs text-slate-400">Assinantes</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {users.filter(u => u.subscription_tier === 'lojista').length}
              </p>
              <p className="text-xs text-slate-400">Lojistas</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EVENTO (Criar/Editar) */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsEventModalOpen(false)} />
          <div className="relative bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? '✏️ Editar Evento' : '➕ Novo Evento'}
              </h2>
              <button onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={saveEvent} className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Título *</label>
                <input
                  required
                  value={eventForm.title}
                  onChange={e => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="Nome do evento"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              {/* Data e Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Data *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={e => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Tipo *</label>
                  <select
                    value={eventForm.type}
                    onChange={e => setEventForm({...eventForm, type: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Local */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Local *</label>
                <input
                  required
                  value={eventForm.location}
                  onChange={e => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="Cidade, Estado ou Online"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Descrição</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                  placeholder="Detalhes do evento..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none resize-none"
                />
              </div>

              {/* Link do WhatsApp (mostrar se tipo for Grupo WhatsApp) */}
              <div className={`p-4 rounded-lg transition-colors border ${eventForm.type === 'Grupo WhatsApp' ? 'bg-green-500/10 border-green-500/30' : 'bg-transparent border-transparent'}`}>
                  <label className={`text-xs uppercase font-bold flex items-center gap-2 ${eventForm.type === 'Grupo WhatsApp' ? 'text-green-400' : 'text-[#4fb7b3]'}`}>
                    <MessageCircle size={12} /> Link do Grupo WhatsApp
                  </label>
                  <input
                    value={eventForm.whatsapp_link}
                    onChange={e => setEventForm({...eventForm, whatsapp_link: e.target.value})}
                    placeholder="https://chat.whatsapp.com/..."
                    className={`w-full bg-black/30 border rounded-lg px-4 py-3 text-white focus:outline-none mt-1 ${
                        eventForm.type === 'Grupo WhatsApp' 
                        ? 'border-green-500/30 focus:border-green-400' 
                        : 'border-white/10 focus:border-[#4fb7b3]'
                    }`}
                  />
                  {eventForm.type === 'Grupo WhatsApp' && <p className="text-[10px] text-green-300/70 mt-1">Este link criará um botão "Entrar no Grupo" no mural.</p>}
              </div>

              {/* Link externo */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Link externo (Site/Insta)</label>
                <input
                  type="url"
                  value={eventForm.link}
                  onChange={e => setEventForm({...eventForm, link: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              {/* URL da Imagem */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">URL da Imagem</label>
                <input
                  type="url"
                  value={eventForm.image}
                  onChange={e => setEventForm({...eventForm, image: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
                {eventForm.image && (
                  <img src={eventForm.image} alt="Preview" className="mt-2 h-20 rounded-lg object-cover border border-white/10" />
                )}
              </div>

              {/* URL do Vídeo */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">URL do Vídeo (YouTube)</label>
                <input
                  type="url"
                  value={eventForm.video_url}
                  onChange={e => setEventForm({...eventForm, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=... ou /shorts/..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">✅ Suporta links normais e Shorts</p>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Salvando...' : (editingEvent ? 'Atualizar' : 'Criar Evento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
