import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Droplets,
  Wrench,
  Plane,
  User,
  LogOut,
  Activity,
  Calendar,
  Settings,
  X,
  Save,
  Download,
  ShieldCheck,
  Menu,
  Pencil,
  Loader2,
  Plus,
  Trash2,
  Fish,
  CalendarDays,
  MapPin,
  ExternalLink,
  Calculator,
  ArrowRightLeft,
  Stethoscope,
  Image as ImageIcon,
  Youtube,
  Megaphone,
  Upload,
  CheckCircle,
  Clock,
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Layers,
  Wind,
  Zap,
  Box
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { jsPDF } from 'jspdf';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, AquariumEvent } from '../types';

// --- Interfaces Auxiliares ---

interface WaterParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
}

interface TravelPlan {
  startDate: string;
  endDate: string;
  foodInstructions: string;
  dosingInstructions: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  subscription_tier?: 'hobby' | 'pro' | 'master';
  created_at: string;
}

// --- Componente AdminPanel ---
interface AdminPanelProps {
  isMaster: boolean;
  events: AquariumEvent[];
  onAddEvent: (event: Partial<AquariumEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isMaster, events, onAddEvent, onDeleteEvent }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'clients'>('overview');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<AquariumEvent>>({
    title: '',
    date: '',
    location: '',
    type: 'Feira',
    description: '',
    link: '',
    image: '',
    video_url: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Estados para métricas reais
  const [stats, setStats] = useState({ clients: 0, aquariums: 0, revenue: 0, proCount: 0 });
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'clients') fetchClients();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { count: clientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: tanksCount } = await supabase.from('aquariums').select('*', { count: 'exact', head: true });
      const { count: proCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro');
      const estimatedRevenue = (proCount || 0) * 49.98;

      setStats({
        clients: clientsCount || 0,
        aquariums: tanksCount || 0,
        revenue: estimatedRevenue,
        proCount: proCount || 0
      });
    } catch (e) {
      console.error("Erro ao carregar stats", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) console.error("Erro ao buscar clientes:", error);
    if (data) setClients(data as any);
  };

  const handleOpenForm = (event?: AquariumEvent) => {
    if (event) {
      setEditingEventId(event.id);
      setNewEvent({ ...event });
    } else {
      setEditingEventId(null);
      setNewEvent({ title: '', date: '', location: '', type: 'Feira', description: '', link: '', image: '', video_url: '' });
    }
    setIsEventFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (editingEventId) {
           await onAddEvent({ ...newEvent, id: editingEventId });
        } else {
           await onAddEvent(newEvent);
        }
        setIsEventFormOpen(false);
        setEditingEventId(null);
        setNewEvent({ title: '', date: '', location: '', type: 'Feira', description: '', link: '', image: '', video_url: '' });
    } catch (error) {
        alert("Erro ao salvar evento");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h2 className="font-heading text-2xl font-semibold text-white">
            {isMaster ? 'Painel Master' : 'Painel Admin'}
            </h2>
            <p className="text-slate-400 text-sm">Gestão completa do ecossistema Titan.</p>
        </div>
        <div className="flex bg-[#1a1b3b] p-1 rounded-lg border border-white/10">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${activeTab === 'overview' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Visão Geral</button>
            <button onClick={() => setActiveTab('events')} className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${activeTab === 'events' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Eventos</button>
            <button onClick={() => setActiveTab('clients')} className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${activeTab === 'clients' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Clientes</button>
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-[#1a1b3b]/60 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={64} /></div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Clientes Totais</p>
                <p className="mt-2 text-3xl font-bold text-white">{loadingStats ? '...' : stats.clients}</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold"><TrendingUp size={14} /> Base de Usuários</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#1a1b3b]/60 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Fish size={64} /></div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Aquários Monitorados</p>
                <p className="mt-2 text-3xl font-bold text-white">{loadingStats ? '...' : stats.aquariums}</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold"><Activity size={14} /> Ecossistemas Ativos</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#1a1b3b]/60 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={64} /></div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Receita Mensal (Est.)</p>
                <p className="mt-2 text-3xl font-bold text-[#4fb7b3]">R$ {loadingStats ? '...' : stats.revenue.toFixed(2)}</p>
                <div className="mt-4 text-slate-500 text-xs">
                    {stats.proCount} Assinantes Pro (R$ 49,98)
                </div>
            </div>
          </div>
      )}

      {activeTab === 'clients' && (
          <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Base de Usuários (Tabela Profiles)</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-black/20 text-xs uppercase font-bold text-white">
                          <tr>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Plano</th>
                              <th className="px-6 py-4">Cadastro</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {clients.length === 0 ? (
                             <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-500">Nenhum perfil encontrado na tabela 'profiles'.</td></tr>
                          ) : (
                             clients.map(client => (
                                <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                      {client.email || client.full_name || 'Email não disponível'}
                                    </td>
                                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${client.subscription_tier === 'pro' || client.subscription_tier === 'master' ? 'bg-[#4fb7b3]/20 text-[#4fb7b3]' : 'bg-white/10 text-slate-300'}`}>{client.subscription_tier?.toUpperCase() || 'HOBBY'}</span></td>
                                    <td className="px-6 py-4">{client.created_at ? new Date(client.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                                </tr>
                             ))
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'events' && (
        <div className="rounded-2xl border border-white/5 bg-[#1a1b3b]/60 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Megaphone size={16} className="text-[#4fb7b3]" /> Lista de Eventos Ativos
                </h3>
                <button 
                onClick={() => handleOpenForm()}
                className="text-xs font-bold uppercase tracking-widest bg-[#4fb7b3] text-black px-4 py-2 rounded hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20"
                >
                Novo Evento
                </button>
            </div>

            {events.length === 0 ? (
            <p className="text-sm text-slate-500 italic text-center py-10 border border-dashed border-white/10 rounded-xl">Nenhum evento cadastrado no sistema.</p>
            ) : (
            <div className="space-y-3">
                {events.map(evt => (
                <div key={evt.id} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-[#4fb7b3]/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                            {evt.image ? <img src={evt.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600"><Calendar size={20} /></div>}
                        </div>
                        <div>
                        <p className="text-sm font-bold text-white">{evt.title}</p>
                        <p className="text-xs text-slate-400">{evt.date} • {evt.type}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleOpenForm(evt)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => onDeleteEvent(evt.id)} className="p-2 bg-rose-500/10 rounded-lg text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      )}

      <AnimatePresence>
        {isEventFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="fixed inset-0" onClick={() => setIsEventFormOpen(false)} />
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="relative bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
             >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">{editingEventId ? 'Editar Evento' : 'Novo Evento'}</h3>
                  <button onClick={() => setIsEventFormOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Título</label>
                     <input type="text" required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase">Data</label>
                        <input 
                          type="date" 
                          required 
                          className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none text-slate-300" 
                          value={newEvent.date} 
                          onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase">Tipo</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} >
                          <option value="Feira">Feira</option>
                          <option value="Encontro">Encontro</option>
                          <option value="Campeonato">Campeonato</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Loja">Loja</option>
                        </select>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Local</label>
                     <input type="text" required placeholder="Cidade - Local" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase flex items-center gap-2"><ImageIcon size={14} /> Imagem de Capa</label>
                     <div className="flex gap-2 mt-1 mb-2">
                       <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-[#4fb7b3] rounded p-2 cursor-pointer transition-colors">
                          <Upload size={14} /><span className="text-xs">Carregar Arquivo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                       </label>
                     </div>
                     <input type="text" placeholder="Ou cole a URL da imagem aqui" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-[#4fb7b3] outline-none" value={newEvent.image || ''} onChange={e => setNewEvent({...newEvent, image: e.target.value})} />
                     {newEvent.image && <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/50"><img src={newEvent.image} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>}
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase flex items-center gap-2"><Youtube size={14} /> Vídeo (YouTube)</label>
                     <div className="flex gap-2 mt-1">
                       <input 
                         type="text" 
                         placeholder="https://www.youtube.com/watch?v=..." 
                         className="flex-1 bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-[#4fb7b3] outline-none" 
                         value={newEvent.video_url || ''} 
                         onChange={e => setNewEvent({...newEvent, video_url: e.target.value})} 
                       />
                       {newEvent.video_url && (
                         <a 
                           href={newEvent.video_url} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                           title="Abrir link"
                         >
                           <ExternalLink size={18} />
                         </a>
                       )}
                     </div>
                   </div>
                   <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Link Externo</label><input type="text" placeholder="Site do evento" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" value={newEvent.link || ''} onChange={e => setNewEvent({...newEvent, link: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Descrição</label><textarea className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 h-20 focus:border-[#4fb7b3] outline-none" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} /></div>
                   <button type="submit" disabled={loading} className="w-full py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors mt-4">{loading ? 'Salvando...' : (editingEventId ? 'Atualizar Evento' : 'Cadastrar Evento')}</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Componente Principal Dashboard ---

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [userPlan, setUserPlan] = useState<'hobby' | 'pro' | 'master'>('hobby');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'aquariums' | 'events' | 'tools' | 'account' | 'admin'>('overview');
  
  // Tools States
  const [activeTool, setActiveTool] = useState<'calc' | 'conv' | 'diag' | 'substrate' | 'co2' | 'energy' | null>(null);

  // Calc Volume State
  const [calcType, setCalcType] = useState<'rect' | 'cylinder'>('rect');
  const [calcDims, setCalcDims] = useState({ length: 0, width: 0, height: 0, radius: 0 });
  const [calcSumpDims, setCalcSumpDims] = useState({ length: 0, width: 0, height: 0 });
  const [calcHasSump, setCalcHasSump] = useState(false);
  
  // Substrate Calc State
  const [subDims, setSubDims] = useState({ length: 60, width: 30, depth: 5 });
  const [subType, setSubType] = useState<'sand' | 'soil' | 'gravel'>('sand');

  // CO2 Calc State
  const [co2Params, setCo2Params] = useState({ ph: 7.0, kh: 4 });

  // Energy Calc State
  const [energyParams, setEnergyParams] = useState({ watts: 50, hours: 8, costKwh: 0.85 });

  // Converter State
  const [convCategory, setConvCategory] = useState<'temp' | 'vol' | 'len' | 'gh'>('temp');
  const [convValue, setConvValue] = useState<string>('');
  
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [aquariumToDelete, setAquariumToDelete] = useState<string | null>(null);

  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [isAquariumFormOpen, setIsAquariumFormOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [isLoadingAquariums, setIsLoadingAquariums] = useState(false);
  const [hasSump, setHasSump] = useState(false);
  
  const [events, setEvents] = useState<AquariumEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const [aquariumFormData, setAquariumFormData] = useState<Partial<Aquarium>>({
    name: '',
    volume: undefined,
    sump_volume: 0,
    type: 'Doce',
    setup_date: '',
    fauna: '',
    equipment: ''
  });

  const [parameters, setParameters] = useState<WaterParameter[]>([
    { id: 'temp', name: 'Temperatura', value: 26.5, unit: '°C', min: 24, max: 28, step: 0.5 },
    { id: 'ph', name: 'pH', value: 6.8, unit: '', min: 6.5, max: 7.5, step: 0.1 },
    { id: 'ammonia', name: 'Amônia', value: 0.25, unit: 'ppm', min: 0, max: 0.05, step: 0.05 },
    { id: 'nitrate', name: 'Nitrato', value: 10, unit: 'ppm', min: 0, max: 40, step: 5 },
  ]);

  const [travelPlan, setTravelPlan] = useState<TravelPlan>({
    startDate: '',
    endDate: '',
    foodInstructions: '',
    dosingInstructions: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  useEffect(() => {
    const checkAdminAndProfile = async () => {
      if (!user) return;
      const email = user.email ? user.email.toLowerCase().trim() : '';
      
      // Hardcode Master access
      if (email === 'kbludobarman@gmail.com') {
        setIsAdmin(true);
        setIsMaster(true);
        setUserPlan('master');
      } else {
        // Fetch Profile for normal users
        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
        if (profile && profile.subscription_tier) {
            setUserPlan(profile.subscription_tier as any);
        }
      }
    };
    checkAdminAndProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      if (activeView === 'aquariums') fetchAquariums();
      if (activeView === 'events' || activeView === 'admin') fetchEvents();
      if (activeView !== 'tools') setActiveTool(null);
    }
  }, [user, activeView]);

  const fetchAquariums = async () => {
    setIsLoadingAquariums(true);
    // MAPEAMENTO CORRETO PARA LEITURA:
    // O banco tem volume_liters, sump_volume_liters, tank_type
    const { data, error } = await supabase
      .from('aquariums')
      .select('*, volume:volume_liters, sump_volume:sump_volume_liters, type:tank_type')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Erro aquariums:', error);
    }
    else {
      setMyAquariums(data || []);
    }
    setIsLoadingAquariums(false);
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (!error) setEvents(data || []);
    setIsLoadingEvents(false);
  };

  const handleOpenAquariumForm = (aquarium?: Aquarium) => {
    if (aquarium) {
      setEditingAquarium(aquarium);
      const tankHasSump = !!(aquarium.sump_volume && aquarium.sump_volume > 0);
      setHasSump(tankHasSump);
      setAquariumFormData({
        name: aquarium.name,
        volume: aquarium.volume,
        sump_volume: aquarium.sump_volume || 0,
        type: aquarium.type,
        setup_date: aquarium.setup_date,
        fauna: aquarium.fauna,
        equipment: aquarium.equipment
      });
    } else {
      setEditingAquarium(null);
      setHasSump(false);
      setAquariumFormData({ name: '', volume: undefined, sump_volume: 0, type: 'Doce', setup_date: '', fauna: '', equipment: '' });
    }
    setIsAquariumFormOpen(true);
  };

  const handleSaveAquarium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
        if (!aquariumFormData.name?.trim()) {
            throw new Error('O nome do aquário é obrigatório.');
        }
        
        const volStr = String(aquariumFormData.volume || '').replace(',', '.').trim();
        const volume = parseFloat(volStr);
        
        if (isNaN(volume) || volume <= 0) {
            throw new Error('Volume deve ser um número maior que zero.');
        }

        const sumpStr = String(aquariumFormData.sump_volume || '').replace(',', '.').trim();
        const sump_volume = hasSump ? parseFloat(sumpStr) : 0;
        
        // Data null se vazia para evitar erro de formato
        const setup_date = aquariumFormData.setup_date && aquariumFormData.setup_date.trim() !== '' 
            ? aquariumFormData.setup_date 
            : null;

        // MAPEAMENTO PARA ESCRITA (Payload):
        // As chaves devem ser EXATAMENTE como no banco de dados.
        // volume_liters, sump_volume_liters, tank_type
        const payload = {
          name: aquariumFormData.name,
          volume_liters: volume, 
          sump_volume_liters: isNaN(sump_volume) ? 0 : sump_volume,
          tank_type: aquariumFormData.type, 
          setup_date, 
          fauna: aquariumFormData.fauna,
          equipment: aquariumFormData.equipment,
          user_id: user.id
        };

        let error;
        if (editingAquarium) {
          const { error: updateError } = await supabase.from('aquariums').update(payload).eq('id', editingAquarium.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase.from('aquariums').insert([payload]);
          error = insertError;
        }

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(`Erro do Banco: ${error.message} (Código: ${error.code})`);
        } else {
            alert(editingAquarium ? 'Aquário atualizado com sucesso!' : 'Aquário cadastrado com sucesso!');
            setIsAquariumFormOpen(false);
            fetchAquariums();
        }
    } catch (err: any) {
        alert('Falha ao salvar: ' + err.message);
    }
  };

  const confirmDeleteAquarium = (id: string) => {
    setAquariumToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAquarium = async () => {
    if (!aquariumToDelete) return;
    const { error } = await supabase.from('aquariums').delete().eq('id', aquariumToDelete);
    if (error) alert('Erro ao excluir: ' + error.message);
    else fetchAquariums();
    setIsDeleteConfirmOpen(false);
    setAquariumToDelete(null);
  };

  const handleSaveEvent = async (event: Partial<AquariumEvent>) => {
    if (!user) return;
    if (event.id) {
       const { error } = await supabase.from('events').update(event).eq('id', event.id);
       if (error) throw error;
    } else {
       const { error } = await supabase.from('events').insert([event]);
       if (error) throw error;
    }
    fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    if(!confirm('Excluir evento?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert('Erro: ' + error.message);
    else fetchEvents();
  };
  
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : null;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
       let videoId = '';
       if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
       else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
       return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const generateTravelGuide = () => {
    const doc = new jsPDF();
    doc.text('Guia do Cuidador - TitanAquatics', 20, 20);
    doc.text(`Período: ${travelPlan.startDate} até ${travelPlan.endDate}`, 20, 35);
    doc.text(travelPlan.foodInstructions || 'Sem dados.', 20, 60);
    doc.save('Guia_Titan.pdf');
    setIsTravelModalOpen(false);
  };

  // --- Logic for New Tools ---

  const calculateVolume = () => {
    let displayVol = 0;
    if (calcType === 'rect') {
      displayVol = (calcDims.length * calcDims.width * calcDims.height) / 1000;
    } else {
      // Cylinder: pi * r^2 * h
      displayVol = (Math.PI * Math.pow(calcDims.radius, 2) * calcDims.height) / 1000;
    }
    const sumpVol = calcHasSump ? (calcSumpDims.length * calcSumpDims.width * calcSumpDims.height) / 1000 : 0;
    const total = displayVol + sumpVol;
    // Peso aproximado (água + vidro estimado + substrato base 10%)
    const weight = total + (total * 0.15); 
    return { display: displayVol, sump: sumpVol, total, weight };
  };

  const calculateSubstrate = () => {
    // Volume em litros do substrato = (C * L * Altura) / 1000
    const volSub = (subDims.length * subDims.width * subDims.depth) / 1000;
    // Densidade aprox: Areia (1.6 kg/L), Solo (1.0 kg/L), Cascalho (1.5 kg/L)
    let density = 1.5;
    if (subType === 'soil') density = 1.0;
    if (subType === 'sand') density = 1.6;
    
    return (volSub * density).toFixed(1);
  };

  const calculateCO2 = () => {
    // Formula: CO2 = 3 * KH * 10^(7-pH)
    const co2 = 3 * co2Params.kh * Math.pow(10, 7 - co2Params.ph);
    let status = 'Baixo (Algas)';
    let color = 'text-yellow-400';
    
    if (co2 >= 15 && co2 <= 30) {
      status = 'Ideal (Plantas)';
      color = 'text-emerald-400';
    } else if (co2 > 30) {
      status = 'Alto (Perigo Peixes)';
      color = 'text-rose-400';
    }
    return { val: co2.toFixed(1), status, color };
  };

  const calculateEnergy = () => {
    // (Watts * Horas * 30 dias) / 1000 = kWh mensal
    const kwhMonth = (energyParams.watts * energyParams.hours * 30) / 1000;
    const cost = kwhMonth * energyParams.costKwh;
    return { kwh: kwhMonth.toFixed(1), cost: cost.toFixed(2) };
  };

  const calculateConversion = () => {
    const val = parseFloat(convValue);
    if (isNaN(val)) return { val1: '-', val2: '-' };
    if (convCategory === 'temp') return { val1: `${((val * 9/5) + 32).toFixed(1)} °F`, val2: `${((val - 32) * 5/9).toFixed(1)} °C` };
    if (convCategory === 'vol') return { val1: `${(val * 0.264172).toFixed(1)} Gal`, val2: `${(val * 3.78541).toFixed(1)} L` };
    if (convCategory === 'len') return { val1: `${(val * 0.393701).toFixed(2)} in`, val2: `${(val * 2.54).toFixed(1)} cm` };
    if (convCategory === 'gh') return { val1: `${(val * 17.8).toFixed(0)} ppm`, val2: `${(val * 0.056).toFixed(1)} dGH` };
    return { val1: '-', val2: '-' };
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return 'Visão Geral';
      case 'aquariums': return 'Meus Aquários';
      case 'events': return 'Mural de Eventos';
      case 'tools': return 'Ferramentas';
      case 'account': return 'Minha Conta';
      case 'admin': return isMaster ? 'Painel Master' : 'Administração';
      default: return 'Dashboard';
    }
  };

  const renderNavItems = () => (
    <>
      <div className="space-y-2">
        <button onClick={() => { setActiveView('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'overview' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={18} className={activeView === 'overview' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Visão Geral</span>
        </button>
        <button onClick={() => { setActiveView('aquariums'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'aquariums' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Fish size={18} className={activeView === 'aquariums' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Meus Aquários</span>
        </button>
        <button onClick={() => { setActiveView('events'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'events' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <CalendarDays size={18} className={activeView === 'events' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Eventos</span>
        </button>
        <button onClick={() => { setActiveView('tools'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'tools' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Wrench size={18} className={activeView === 'tools' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Ferramentas</span>
        </button>
        <button onClick={() => { setIsTravelModalOpen(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left border-r-2 border-transparent">
          <Plane size={18} /><span className="text-xs font-bold uppercase tracking-widest">Modo Viagem</span>
        </button>
        <button onClick={() => { setActiveView('account'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'account' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <User size={18} className={activeView === 'account' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Conta</span>
        </button>
        {isAdmin && (
          <button onClick={() => { setActiveView('admin'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'admin' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Settings size={18} className={activeView === 'admin' ? 'text-[#4fb7b3]' : ''} /><span className="text-xs font-bold uppercase tracking-widest">Admin</span>
          </button>
        )}
      </div>
      <div className="mt-auto p-6 border-t border-white/5 space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-[#1a1b3b] to-[#0d0e21] p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[#4fb7b3]/20"><Activity size={16} className="text-[#4fb7b3]" /></div>
            <span className="text-xs font-bold text-white">Status do Plano</span>
          </div>
          <div className="text-xs text-slate-400">
            {userPlan === 'master' ? <>Plano Master <span className="text-[#4fb7b3]">(Unlimited)</span></> : 
             userPlan === 'pro' ? <>Plano Profissional <span className="text-[#4fb7b3]">(Pro)</span></> : 
             <>Plano Hobby <span className="text-[#4fb7b3]">(Free)</span></>}
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-[#4fb7b3] rounded-full ${userPlan === 'master' ? 'w-full' : userPlan === 'pro' ? 'w-2/3' : 'w-1/3'}`} /></div>
        </div>
        <button onClick={() => setIsLogoutConfirmOpen(true)} className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-xs font-bold uppercase tracking-widest px-2"><LogOut size={16} /><span>Sair</span></button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#05051a] text-white font-sans selection:bg-[#4fb7b3] selection:text-black overflow-hidden flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-[280px] flex-col bg-[#05051a] border-r border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] h-screen fixed left-0 top-0 z-20">
        <div className="p-8 pb-4"><div className="flex items-center gap-3 text-xl font-heading font-bold tracking-tighter text-white"><span className="text-[#4fb7b3]">●</span> TITAN SYSTEM v5.1</div></div>
        <nav className="flex-1 flex flex-col py-4 overflow-y-auto custom-scrollbar">{renderNavItems()}</nav>
      </aside>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="relative z-50 flex h-full w-[280px] flex-col bg-[#05051a] border-r border-white/10">
              <div className="p-8 pb-4"><div className="flex items-center gap-3 text-xl font-heading font-bold tracking-tighter text-white"><span className="text-[#4fb7b3]">●</span> TITAN SYSTEM v5.1</div></div>
              <nav className="flex-1 flex flex-col py-4 overflow-y-auto">{renderNavItems()}</nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] w-full">
        <header className="h-20 border-b border-white/5 bg-[#05051a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button type="button" className="inline-flex items-center justify-center rounded-lg bg-white/5 p-2 text-slate-100 hover:bg-white/10 md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
            <h1 className="text-lg md:text-xl font-heading font-bold text-white tracking-wide">{getViewTitle()}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-xs font-mono text-emerald-300 tracking-wider">SYSTEM ONLINE</span></div>
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4fb7b3] to-[#31326f] p-[2px]"><div className="w-full h-full rounded-full bg-[#05051a] flex items-center justify-center"><User size={18} className="text-[#4fb7b3]" /></div></div></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeView === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-7xl mx-auto">
              <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CheckCircle size={100} /></div>
                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2"><span className="text-[#4fb7b3]">●</span> Resumo Diário</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" /><div><span className="block font-bold text-white text-sm">Status Geral: Estável</span><span className="text-xs text-slate-400">Parâmetros dentro da faixa ideal.</span></div></div>
                  <div className="flex items-start gap-3"><Clock className="w-5 h-5 text-amber-400 mt-0.5" /><div><span className="block font-bold text-white text-sm">Próxima Manutenção</span><span className="text-xs text-slate-400">TPA agendada para 2 dias.</span></div></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {parameters.map((param) => (
                    <div key={param.id} className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4"><span className="text-xs font-bold uppercase tracking-widest text-slate-400">{param.name}</span></div>
                      <div className="flex items-baseline gap-1"><span className="text-4xl font-bold tracking-tighter text-white">{param.value}</span><span className="text-sm text-slate-500 font-mono">{param.unit}</span></div>
                      <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#4fb7b3]" style={{ width: '60%' }} /></div>
                    </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'aquariums' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h2 className="text-2xl font-heading font-bold text-white">Gerenciar Aquários</h2><p className="text-sm text-slate-400">Adicione e controle seus tanques.</p></div>
                <button onClick={() => handleOpenAquariumForm()} className="bg-[#4fb7b3] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-[#4fb7b3]/20"><Plus size={16} /> Adicionar Aquário</button>
              </div>
              {isLoadingAquariums ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#4fb7b3] animate-spin" /></div> : myAquariums.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center">
                  <Fish size={48} className="text-[#4fb7b3] mb-4" /><h3 className="text-xl font-heading text-white mb-2">Nenhum aquário encontrado</h3>
                  <button onClick={() => handleOpenAquariumForm()} className="text-[#4fb7b3] border border-[#4fb7b3] px-6 py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#4fb7b3] hover:text-black transition-colors mt-4">Cadastrar agora</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAquariums.map((tank) => (
                    <div key={tank.id} className="group relative rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-all flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4"><div className="p-3 rounded-full bg-[#4fb7b3]/10 text-[#4fb7b3]"><Droplets size={24} /></div><div className="flex gap-2"><button onClick={() => handleOpenAquariumForm(tank)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><Pencil size={16} /></button><button onClick={() => confirmDeleteAquarium(tank.id)} className="p-2 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button></div></div>
                      <h3 className="text-xl font-bold text-white mb-1">{tank.name}</h3><p className="text-sm text-[#4fb7b3] font-medium mb-4 uppercase tracking-wider">{tank.type}</p>
                      <div className="space-y-3 text-sm text-slate-300 flex-1">
                        <div className="flex justify-between py-2 border-b border-white/5"><span>Volume Total</span><span className="font-mono text-white">{tank.sump_volume && tank.sump_volume > 0 ? `${tank.volume + tank.sump_volume} L` : `${tank.volume} L`}</span></div>
                        <div className="flex justify-between py-2 border-b border-white/5"><span>Montagem</span><span className="font-mono text-white">{tank.setup_date ? new Date(tank.setup_date).toLocaleDateString('pt-BR') : '-'}</span></div>
                        {tank.fauna && <div className="py-2 border-b border-white/5"><span className="block text-xs uppercase text-slate-500 mb-1">Fauna</span><p className="line-clamp-2 text-xs">{tank.fauna}</p></div>}
                        {tank.equipment && <div className="py-2"><span className="block text-xs uppercase text-slate-500 mb-1">Equipamentos</span><p className="line-clamp-2 text-xs">{tank.equipment}</p></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'events' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-8 border border-white/10 text-center mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarDays size={120} /></div>
                <div className="relative z-10"><CalendarDays size={48} className="mx-auto text-[#4fb7b3] mb-4" /><h2 className="text-2xl font-heading font-bold text-white mb-2">Mural de Eventos</h2><p className="text-slate-400 max-w-xl mx-auto">Fique por dentro das principais feiras, encontros e workshops.</p></div>
              </div>
              {isLoadingEvents ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#4fb7b3]" /></div> : events.length === 0 ? <p className="text-center text-slate-500 py-10">Nenhum evento agendado.</p> : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="group flex flex-col md:flex-row gap-0 rounded-2xl bg-[#1a1b3b]/40 border border-white/5 hover:border-[#4fb7b3]/30 transition-colors overflow-hidden">
                      <div className="flex-shrink-0 w-full md:w-64 bg-white/5 flex flex-col">
                        {event.video_url ? <div className="relative w-full pt-[56.25%] bg-black"><iframe src={getEmbedUrl(event.video_url)!} className="absolute inset-0 w-full h-full" allowFullScreen title={event.title} /></div> : event.image ? <div className="h-40 w-full"><img src={event.image} alt={event.title} className="w-full h-full object-cover" /></div> : null}
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest mb-1">{event.type}</span><span className="text-4xl font-bold text-white leading-none">{event.date.includes('-') ? event.date.split('-')[2] : event.date.split('/')[0]}</span></div>
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-heading font-bold text-white mb-2">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4"><MapPin size={14} />{event.location}</div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">{event.description}</p>
                        {event.link && <a href={event.link} target="_blank" rel="noopener noreferrer" className="self-start text-xs font-bold text-[#4fb7b3] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">Saiba Mais <ExternalLink size={12} /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'tools' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto">
              {!activeTool ? (
                <>
                  <div className="text-center mb-8"><h2 className="text-2xl font-heading font-bold text-white">Laboratório de Ferramentas</h2><p className="text-slate-400 text-sm">Utilitários essenciais para manutenção e planejamento.</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'calc', name: 'Calculadora de Volume', icon: Calculator, desc: 'Calcule o volume de tanques retangulares e cilíndricos, incluindo sump.' },
                      { id: 'substrate', name: 'Calculadora de Substrato', icon: Layers, desc: 'Descubra a quantidade exata de areia ou solo fértil para seu projeto.' },
                      { id: 'co2', name: 'Tabela de CO2', icon: Wind, desc: 'Verifique a concentração de CO2 baseada na relação pH x KH.' },
                      { id: 'energy', name: 'Custo de Energia', icon: Zap, desc: 'Estime o consumo elétrico mensal dos seus equipamentos.' },
                      { id: 'conv', name: 'Conversor de Medidas', icon: ArrowRightLeft, desc: 'Converta Galões/Litros, Graus, Dureza (dGH/ppm).' },
                      { id: 'diag', name: 'Diagnóstico IA', icon: Stethoscope, desc: 'Identifique doenças e receba tratamentos com a IA.' }
                    ].map((tool) => (
                      <button key={tool.id} onClick={() => setActiveTool(tool.id as any)} className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-[#1a1b3b]/60 hover:bg-[#1a1b3b] hover:border-[#4fb7b3]/50 transition-all group">
                        <div className="p-4 rounded-full bg-white/5 text-white mb-4 group-hover:bg-[#4fb7b3] group-hover:text-black transition-colors"><tool.icon size={32} /></div>
                        <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3><p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                   <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold mb-4"><ArrowLeft size={16} /> Voltar para Ferramentas</button>
                   
                   {/* CALCULADORA DE VOLUME */}
                   {activeTool === 'calc' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2"><Calculator size={24} className="text-[#4fb7b3]" /> Calculadora de Volume</h3>
                        <div className="space-y-6">
                           <div className="flex bg-black/30 p-1 rounded-lg mb-4 w-fit">
                              <button onClick={() => setCalcType('rect')} className={`px-4 py-2 text-xs font-bold uppercase rounded ${calcType === 'rect' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400'}`}>Retangular</button>
                              <button onClick={() => setCalcType('cylinder')} className={`px-4 py-2 text-xs font-bold uppercase rounded ${calcType === 'cylinder' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400'}`}>Cilíndrico</button>
                           </div>
                           
                           {calcType === 'rect' ? (
                             <div className="grid grid-cols-3 gap-4">
                                {['length', 'width', 'height'].map(d => <div key={d}><label className="text-xs font-bold text-[#4fb7b3] uppercase">{d === 'length' ? 'Comp.' : d === 'width' ? 'Larg.' : 'Alt.'} (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={(calcDims as any)[d] || ''} onChange={e => setCalcDims({...calcDims, [d]: parseFloat(e.target.value)})} /></div>)}
                             </div>
                           ) : (
                             <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Raio (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={calcDims.radius || ''} onChange={e => setCalcDims({...calcDims, radius: parseFloat(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Altura (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={calcDims.height || ''} onChange={e => setCalcDims({...calcDims, height: parseFloat(e.target.value)})} /></div>
                             </div>
                           )}

                           <div className="flex items-center gap-2"><input type="checkbox" id="calcSump" className="w-4 h-4" checked={calcHasSump} onChange={e => setCalcHasSump(e.target.checked)} /><label htmlFor="calcSump" className="text-sm text-white font-bold cursor-pointer">Incluir Sump (Retangular)?</label></div>
                           {calcHasSump && <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">{['length', 'width', 'height'].map(d => <div key={d}><label className="text-xs font-bold text-[#4fb7b3] uppercase">{d === 'length' ? 'Comp.' : d === 'width' ? 'Larg.' : 'Alt.'}</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 text-sm" value={(calcSumpDims as any)[d] || ''} onChange={e => setCalcSumpDims({...calcSumpDims, [d]: parseFloat(e.target.value)})} /></div>)}</div>}
                           
                           <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-8 text-center">
                              <div><p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Volume Total</p><p className="text-4xl font-bold text-white font-heading">{calculateVolume().total.toFixed(0)} <span className="text-lg text-[#4fb7b3]">Litros</span></p></div>
                              <div><p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Peso Aprox. (Água)</p><p className="text-4xl font-bold text-white font-heading">{calculateVolume().weight.toFixed(0)} <span className="text-lg text-[#4fb7b3]">kg</span></p></div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* CALCULADORA DE SUBSTRATO */}
                   {activeTool === 'substrate' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2"><Layers size={24} className="text-[#4fb7b3]" /> Calculadora de Substrato</h3>
                        <div className="space-y-6">
                           <div className="grid grid-cols-3 gap-4">
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Comp. Tanque (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={subDims.length} onChange={e => setSubDims({...subDims, length: parseFloat(e.target.value)})} /></div>
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Larg. Tanque (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={subDims.width} onChange={e => setSubDims({...subDims, width: parseFloat(e.target.value)})} /></div>
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Altura Camada (cm)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={subDims.depth} onChange={e => setSubDims({...subDims, depth: parseFloat(e.target.value)})} /></div>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-[#4fb7b3] uppercase">Tipo de Material</label>
                              <select className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={subType} onChange={e => setSubType(e.target.value as any)}>
                                <option value="sand">Areia (Fina/Média)</option>
                                <option value="gravel">Cascalho / Pedrisco</option>
                                <option value="soil">Solo Fértil / Amazônia</option>
                              </select>
                           </div>
                           <div className="mt-8 pt-6 border-t border-white/10 text-center">
                              <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Quantidade Necessária</p>
                              <p className="text-5xl font-bold text-white font-heading">{calculateSubstrate()} <span className="text-xl text-[#4fb7b3]">kg</span></p>
                              <p className="text-xs text-slate-500 mt-2">Estimativa baseada na densidade média do material.</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* CALCULADORA CO2 */}
                   {activeTool === 'co2' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2"><Wind size={24} className="text-[#4fb7b3]" /> Nível de CO2 (pH x KH)</h3>
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-6">
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">pH da Água</label><input type="number" step="0.1" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={co2Params.ph} onChange={e => setCo2Params({...co2Params, ph: parseFloat(e.target.value)})} /></div>
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Reserva Alcalina (KH)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={co2Params.kh} onChange={e => setCo2Params({...co2Params, kh: parseFloat(e.target.value)})} /></div>
                           </div>
                           <div className="mt-8 pt-6 border-t border-white/10 text-center">
                              <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Concentração Estimada</p>
                              <p className={`text-5xl font-bold font-heading ${calculateCO2().color}`}>{calculateCO2().val} <span className="text-xl">ppm</span></p>
                              <p className={`text-sm font-bold uppercase tracking-widest mt-2 ${calculateCO2().color}`}>{calculateCO2().status}</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* CALCULADORA ENERGIA */}
                   {activeTool === 'energy' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2"><Zap size={24} className="text-[#4fb7b3]" /> Custo de Energia</h3>
                        <div className="space-y-6">
                           <div className="grid grid-cols-3 gap-4">
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Potência Total (W)</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={energyParams.watts} onChange={e => setEnergyParams({...energyParams, watts: parseFloat(e.target.value)})} /></div>
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Horas Ligado/Dia</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={energyParams.hours} onChange={e => setEnergyParams({...energyParams, hours: parseFloat(e.target.value)})} /></div>
                              <div><label className="text-xs font-bold text-[#4fb7b3] uppercase">R$ por kWh</label><input type="number" step="0.01" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" value={energyParams.costKwh} onChange={e => setEnergyParams({...energyParams, costKwh: parseFloat(e.target.value)})} /></div>
                           </div>
                           <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-8 text-center">
                              <div><p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Consumo Mensal</p><p className="text-3xl font-bold text-white font-heading">{calculateEnergy().kwh} <span className="text-lg text-[#4fb7b3]">kWh</span></p></div>
                              <div><p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Custo Mensal</p><p className="text-3xl font-bold text-white font-heading">R$ {calculateEnergy().cost}</p></div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* CONVERSOR */}
                   {activeTool === 'conv' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2"><ArrowRightLeft size={24} className="text-[#4fb7b3]" /> Conversor</h3>
                        <div className="flex bg-black/30 p-1 rounded-lg mb-6 flex-wrap gap-2">
                          {['temp', 'vol', 'len', 'gh'].map(c => (
                            <button key={c} onClick={() => setConvCategory(c as any)} className={`flex-1 py-2 px-2 text-xs font-bold uppercase rounded ${convCategory === c ? 'bg-[#4fb7b3] text-black' : 'text-slate-400'}`}>
                              {c === 'temp' ? 'Temp' : c === 'vol' ? 'Vol' : c === 'len' ? 'Comp' : 'Dureza'}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-6"><div><label className="text-xs font-bold text-[#4fb7b3] uppercase">Valor de Entrada</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded p-4 text-white mt-2 text-xl" value={convValue} onChange={e => setConvValue(e.target.value)} /></div>
                           <div className="grid grid-cols-2 gap-4 mt-4"><div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{calculateConversion().val1}</p></div><div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{calculateConversion().val2}</p></div></div>
                        </div>
                     </div>
                   )}

                   {/* DIAGNÓSTICO */}
                   {activeTool === 'diag' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto text-center">
                        <Stethoscope size={64} className="text-[#4fb7b3] mx-auto mb-6" /><h3 className="text-2xl font-heading font-bold text-white mb-4">Diagnóstico com IA</h3>
                        <p className="text-slate-300 mb-8">Use o chat Titan Copilot (canto inferior) para descrever os sintomas. Ele foi treinado para identificar as principais doenças de peixes e problemas de algas.</p>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'account' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-white mb-6">Minha Conta</h2>
              <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-8"><h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><User size={20} className="text-[#4fb7b3]"/> Dados</h3><input type="text" value={user?.email} disabled className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-slate-300 text-sm" /></div>
            </motion.div>
          )}

          {activeView === 'admin' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
              <AdminPanel isMaster={isMaster} events={events} onAddEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} />
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isAquariumFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
              <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10"><h2 className="text-xl font-heading font-bold text-white">{editingAquarium ? 'Editar Aquário' : 'Novo Aquário'}</h2><button onClick={() => setIsAquariumFormOpen(false)}><X size={20} className="text-slate-400 hover:text-white" /></button></div>
              <form onSubmit={handleSaveAquarium} className="p-6 space-y-6">
                <div className="space-y-2"><label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Nome</label><input type="text" value={aquariumFormData.name} onChange={e => setAquariumFormData({...aquariumFormData, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors" placeholder="Ex: Principal da Sala" required /></div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Tipo</label><select value={aquariumFormData.type} onChange={e => setAquariumFormData({...aquariumFormData, type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"><option value="Doce">Água Doce</option><option value="Marinho">Marinho</option><option value="Reef">Reef</option><option value="Jumbo">Jumbo / Predadores</option><option value="Plantado">Plantado</option></select></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Volume (L)</label><input type="number" value={aquariumFormData.volume || ''} onChange={e => setAquariumFormData({...aquariumFormData, volume: parseFloat(e.target.value) || undefined})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors" placeholder="0" /></div>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <input type="checkbox" id="checkSump" checked={hasSump} onChange={e => { setHasSump(e.target.checked); if(!e.target.checked) setAquariumFormData({...aquariumFormData, sump_volume: 0}); }} className="w-4 h-4 rounded border-gray-600 text-[#4fb7b3] focus:ring-[#4fb7b3]" />
                        <label htmlFor="checkSump" className="text-xs font-bold text-[#4fb7b3] uppercase cursor-pointer">Possui Sump?</label>
                    </div>
                    {hasSump && (
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase">Volume do Sump (L)</label>
                            <input type="number" placeholder="Volume Sump" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors" value={aquariumFormData.sump_volume || ''} onChange={e => setAquariumFormData({...aquariumFormData, sump_volume: parseFloat(e.target.value) || 0})} />
                        </div>
                    )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Data de Montagem</label>
                  <input 
                    type="date" 
                    value={aquariumFormData.setup_date || ''} 
                    onChange={e => setAquariumFormData({...aquariumFormData, setup_date: e.target.value})} 
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors" 
                  />
                </div>

                <div className="space-y-2"><label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Fauna Principal</label><textarea value={aquariumFormData.fauna || ''} onChange={e => setAquariumFormData({...aquariumFormData, fauna: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white h-24 focus:border-[#4fb7b3] outline-none transition-colors" placeholder="Ex: 2 Oscars, 1 Cascudo..." /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Equipamentos</label><textarea value={aquariumFormData.equipment || ''} onChange={e => setAquariumFormData({...aquariumFormData, equipment: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white h-24 focus:border-[#4fb7b3] outline-none transition-colors" placeholder="Ex: Canister 2000L/h, Termostato 300W..." /></div>
                
                <div className="flex gap-4 pt-6 border-t border-white/10"><button type="button" onClick={() => setIsAquariumFormOpen(false)} className="flex-1 py-4 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-4 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20">Salvar Aquário</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTravelModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21]"><div className="flex items-center gap-3"><Plane className="text-[#4fb7b3]" /><h2 className="text-xl font-heading font-bold text-white">Modo Viagem</h2></div><button onClick={() => setIsTravelModalOpen(false)}><X className="text-slate-400 hover:text-white" /></button></div>
              <div className="p-6 space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-[#4fb7b3] font-bold uppercase">Saída</label><input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" value={travelPlan.startDate} onChange={e => setTravelPlan({...travelPlan, startDate: e.target.value})} /></div><div><label className="text-xs text-[#4fb7b3] font-bold uppercase">Volta</label><input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" value={travelPlan.endDate} onChange={e => setTravelPlan({...travelPlan, endDate: e.target.value})} /></div></div><div><label className="text-xs text-[#4fb7b3] font-bold uppercase">Instruções</label><textarea className="w-full bg-black/30 border border-white/10 rounded p-3 text-white h-24" value={travelPlan.foodInstructions} onChange={e => setTravelPlan({...travelPlan, foodInstructions: e.target.value})} /></div></div>
              <div className="p-6 border-t border-white/10 bg-[#0d0e21]"><button onClick={generateTravelGuide} className="w-full py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"><Download size={16} /> Gerar PDF</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1a1b3b] border border-rose-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">Excluir Aquário?</h3><p className="text-slate-400 text-sm mb-6">Ação irreversível.</p>
              <div className="flex gap-4"><button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase">Cancelar</button><button onClick={handleDeleteAquarium} className="flex-1 py-3 bg-rose-500 rounded-lg text-white font-bold uppercase">Excluir</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">Sair do Titan?</h3>
              <div className="flex gap-4 mt-6"><button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase">Cancelar</button><button onClick={() => signOut()} className="flex-1 py-3 bg-rose-500 rounded-lg text-white font-bold uppercase">Sair</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;