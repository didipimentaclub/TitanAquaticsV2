// @ts-nocheck
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
  Box,
  Thermometer,
  AlertTriangle
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { jsPDF } from 'jspdf';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, AquariumEvent, UserProfile, TankType } from '../types';
import { getEmbedUrl } from '../utils/videoHelpers';
import { analyzeParameter, formatDate } from '../utils/helpers';
import { useWaterTests } from '../hooks/useWaterTests';
import { useMaintenanceTasks } from '../hooks/useMaintenanceTasks';
import WaterTestForm from './WaterTestForm';
import { ParametersDashboard } from './ParameterChart';
import { MaintenanceTaskList, NewTaskForm } from './MaintenanceTaskList';
import { NewAquariumModal } from './NewAquariumModal';
import { FerramentasSection } from './Ferramentas';
import { ModoViagem } from './ModoViagem';
import { AdminPanel } from './AdminPanel';

// --- Componente Principal Dashboard ---

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // States
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'aquariums' | 'events' | 'tools' | 'account' | 'admin' | 'travel'>('overview');
  
  // Data States
  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [events, setEvents] = useState<AquariumEvent[]>([]);
  const [isLoadingAquariums, setIsLoadingAquariums] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Modals States
  const [isNewAquariumOpen, setIsNewAquariumOpen] = useState(false);
  const [isWaterTestFormOpen, setIsWaterTestFormOpen] = useState(false);
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Editing
  const [aquariumToDelete, setAquariumToDelete] = useState<string | null>(null);

  // Custom Hooks
  const { tests, addTest, latestTest, fetchTests } = useWaterTests(user?.id);
  const { tasks, addTask, completeTask, deleteTask, fetchTasks } = useMaintenanceTasks(user?.id);

  // --- Effects ---

  useEffect(() => {
    const checkAdminAndProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) setUserProfile(profile as any);

      // Simple admin check
      const email = user.email ? user.email.toLowerCase().trim() : '';
      if (email === 'kbludobarman@gmail.com') {
        setIsAdmin(true);
      } else {
        const { data: admin } = await supabase.from('admin_users').select('*').eq('email', email).single();
        setIsAdmin(!!admin);
      }
    };
    checkAdminAndProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      if (activeView === 'aquariums' || activeView === 'overview') fetchAquariums();
      if (activeView === 'events') fetchEvents();
    }
  }, [user, activeView]);

  // --- Fetchers ---

  const fetchAquariums = async () => {
    setIsLoadingAquariums(true);
    const { data, error } = await supabase.from('aquariums').select('*, volume:volume_liters, sump_volume:sump_volume_liters, type:tank_type').order('created_at', { ascending: false });
    if (!error) setMyAquariums(data || []);
    setIsLoadingAquariums(false);
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (!error) setEvents(data || []);
    setIsLoadingEvents(false);
  };

  // --- Handlers ---

  const handleDeleteAquarium = async () => {
    if (!aquariumToDelete) return;
    await supabase.from('aquariums').delete().eq('id', aquariumToDelete);
    fetchAquariums();
    setIsDeleteConfirmOpen(false);
  };

  // --- Render Helpers ---
  const getViewTitle = () => { switch(activeView) { case 'overview': return 'Visão Geral'; case 'aquariums': return 'Meus Aquários'; case 'events': return 'Eventos'; case 'tools': return 'Ferramentas'; case 'account': return 'Minha Conta'; case 'admin': return 'Admin'; case 'travel': return 'Modo Viagem'; default: return 'Dashboard'; } };

  // --- UI ---
  return (
    <div className="min-h-screen bg-[#05051a] text-white font-sans selection:bg-[#4fb7b3] selection:text-black overflow-hidden flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-[280px] flex-col bg-[#05051a] border-r border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] h-screen fixed left-0 top-0 z-20">
        <div className="p-8 pb-4"><div className="flex items-center gap-3 text-xl font-heading font-bold tracking-tighter text-white"><span className="text-[#4fb7b3]">●</span> TITAN SYSTEM v2.1</div></div>
        <nav className="flex-1 flex flex-col py-4 overflow-y-auto custom-scrollbar">
            {['overview', 'aquariums', 'events', 'tools'].map(v => (
                <button key={v} onClick={() => setActiveView(v as any)} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === v ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
                    {v === 'overview' && <LayoutDashboard size={18} className={activeView===v?'text-[#4fb7b3]':''} />}
                    {v === 'aquariums' && <Fish size={18} className={activeView===v?'text-[#4fb7b3]':''} />}
                    {v === 'events' && <CalendarDays size={18} className={activeView===v?'text-[#4fb7b3]':''} />}
                    {v === 'tools' && <Wrench size={18} className={activeView===v?'text-[#4fb7b3]':''} />}
                    <span className="text-xs font-bold uppercase tracking-widest">{v === 'overview' ? 'Visão Geral' : v === 'aquariums' ? 'Aquários' : v === 'events' ? 'Eventos' : 'Ferramentas'}</span>
                </button>
            ))}
            <button onClick={() => setActiveView('travel')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'travel' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}><Plane size={18} className={activeView==='travel'?'text-[#4fb7b3]':''} /><span className="text-xs font-bold uppercase tracking-widest">Modo Viagem</span></button>
            <button onClick={() => setActiveView('account')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'account' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}><User size={18} className={activeView==='account'?'text-[#4fb7b3]':''} /><span className="text-xs font-bold uppercase tracking-widest">Conta</span></button>
            {isAdmin && <button onClick={() => setActiveView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 ${activeView === 'admin' ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}><Settings size={18} className={activeView==='admin'?'text-[#4fb7b3]':''} /><span className="text-xs font-bold uppercase tracking-widest">Admin</span></button>}
        </nav>
        <div className="p-6 border-t border-white/5 space-y-4">
             <div className="flex items-center gap-2 mb-2 px-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[10px] font-mono text-emerald-300 tracking-wider">SYSTEM ONLINE</span></div>
             <button onClick={() => setIsLogoutConfirmOpen(true)} className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-xs font-bold uppercase tracking-widest px-2"><LogOut size={16} /><span>Sair</span></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] w-full bg-[#05051a]">
        <header className="h-20 border-b border-white/5 bg-[#05051a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0 md:hidden">
            <h1 className="text-lg font-heading font-bold text-white tracking-wide">{getViewTitle()}</h1>
            <button className="p-2 text-white" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {/* --- VISÃO GERAL --- */}
            {activeView === 'overview' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div>
                           <h2 className="text-3xl font-heading font-bold text-white">Visão Geral</h2>
                           <p className="text-slate-400 text-sm">Resumo do ecossistema principal.</p>
                        </div>
                        <button onClick={() => setIsWaterTestFormOpen(true)} className="bg-[#4fb7b3] text-[#05051a] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20 flex items-center gap-2">
                            <Plus size={16} /> Registrar Medição
                        </button>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Temperatura', val: latestTest?.temperature, unit: '°C', key: 'temperature', icon: Thermometer },
                            { label: 'pH', val: latestTest?.ph, unit: '', key: 'ph', icon: Droplets },
                            { label: 'Amônia', val: latestTest?.ammonia, unit: 'ppm', key: 'ammonia', icon: Activity },
                            { label: 'Nitrato', val: latestTest?.nitrate, unit: 'ppm', key: 'nitrate', icon: AlertTriangle },
                        ].map(stat => {
                            const analysis = analyzeParameter(stat.key, Number(stat.val || 0), myAquariums[0]?.type || 'Doce');
                            return (
                                <div key={stat.key} className="bg-[#1a1b3b]/60 border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-slate-400"><stat.icon size={18} /></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${analysis.bgColor} ${analysis.color}`}>{analysis.status === 'ideal' ? 'Ideal' : analysis.status === 'acceptable' ? 'Ok' : 'Atenção'}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">{stat.val ?? '-'} <span className="text-sm font-normal text-slate-500">{stat.unit}</span></div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             {/* CHART */}
                             {myAquariums.length > 0 && tests.length > 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 h-full">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-[#4fb7b3]"/> Histórico de Parâmetros</h3>
                                    <ParametersDashboard tests={tests} tankType={myAquariums[0]?.type || 'Doce'} />
                                </div>
                             ) : (
                                <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 h-full flex flex-col items-center justify-center text-center py-20">
                                    <Activity className="text-slate-600 mb-4" size={48} />
                                    <p className="text-slate-400">Registre seu primeiro teste para ver o gráfico.</p>
                                </div>
                             )}
                        </div>
                        <div>
                             {/* TASKS */}
                             <MaintenanceTaskList 
                                tasks={tasks} 
                                aquariums={myAquariums} 
                                onComplete={completeTask} 
                                onDelete={deleteTask}
                                onAddClick={() => setIsNewTaskFormOpen(true)}
                             />
                        </div>
                    </div>
                </div>
            )}

            {/* --- AQUÁRIOS --- */}
            {activeView === 'aquariums' && (
                <div className="space-y-6 max-w-7xl mx-auto">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div><h2 className="text-2xl font-heading font-bold text-white">Meus Aquários</h2><p className="text-sm text-slate-400">Gerencie seus tanques.</p></div>
                        <button onClick={() => setIsNewAquariumOpen(true)} className="bg-[#4fb7b3] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"><Plus size={16} /> Adicionar Aquário</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {myAquariums.map(tank => (
                            <div key={tank.id} className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 hover:border-[#4fb7b3]/30 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4"><div className="p-3 bg-[#4fb7b3]/10 text-[#4fb7b3] rounded-xl"><Droplets size={24} /></div><div className="flex gap-2"><button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Pencil size={16} /></button><button onClick={() => { setAquariumToDelete(tank.id); setIsDeleteConfirmOpen(true); }} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button></div></div>
                                <h3 className="text-xl font-bold text-white mb-1">{tank.name}</h3>
                                <span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-wider bg-[#4fb7b3]/10 px-2 py-1 rounded w-fit mb-4">{tank.type}</span>
                                <div className="space-y-3 flex-1 text-sm text-slate-300">
                                    <div className="flex justify-between py-2 border-b border-white/5"><span>Volume Total</span><span className="font-mono text-white">{tank.volume + (tank.sump_volume || 0)} L</span></div>
                                    <div className="flex justify-between py-2 border-b border-white/5"><span>Montagem</span><span className="font-mono text-white">{formatDate(tank.setup_date)}</span></div>
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
            )}

            {/* --- EVENTOS --- */}
            {activeView === 'events' && (
                <div className="space-y-6 max-w-5xl mx-auto">
                    <div className="bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-8 border border-white/10 text-center mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarDays size={120} /></div>
                        <div className="relative z-10"><CalendarDays size={48} className="mx-auto text-[#4fb7b3] mb-4" /><h2 className="text-2xl font-heading font-bold text-white mb-2">Mural de Eventos</h2></div>
                    </div>
                    <div className="space-y-4">
                        {events.map(evt => (
                             <div key={evt.id} className="flex flex-col md:flex-row gap-0 rounded-2xl bg-[#1a1b3b]/40 border border-white/5 hover:border-[#4fb7b3]/30 transition-colors overflow-hidden">
                                <div className="w-full md:w-64 bg-white/5 flex flex-col">
                                    {evt.video_url ? <div className="relative w-full pt-[56.25%] bg-black"><iframe src={getEmbedUrl(evt.video_url)!} className="absolute inset-0 w-full h-full" allowFullScreen /></div> : <div className="h-40 w-full bg-black/50 flex items-center justify-center"><Calendar size={24} className="text-slate-600"/></div>}
                                    <div className="flex-1 p-4 text-center"><span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">{evt.type}</span><div className="text-2xl font-bold text-white">{evt.date}</div></div>
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-white mb-2">{evt.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4"><MapPin size={14} /> {evt.location}</div>
                                    <p className="text-sm text-slate-300 mb-4">{evt.description}</p>
                                    {evt.link && <a href={evt.link} target="_blank" className="text-xs font-bold text-[#4fb7b3] uppercase flex items-center gap-1 hover:text-white">Saiba Mais <ExternalLink size={12} /></a>}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- FERRAMENTAS --- */}
            {activeView === 'tools' && (
                <FerramentasSection />
            )}

            {/* --- MODO VIAGEM --- */}
            {activeView === 'travel' && (
                <ModoViagem userId={user?.id} aquariums={myAquariums} />
            )}

            {/* --- ADMIN --- */}
            {activeView === 'admin' && isAdmin && (
                <AdminPanel userEmail={user?.email} />
            )}

            {activeView === 'account' && <div className="max-w-4xl mx-auto"><h2 className="text-2xl font-heading font-bold text-white mb-6">Minha Conta</h2><div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8"><p className="text-slate-400 text-sm uppercase font-bold mb-2">Email</p><p className="text-xl text-white font-mono">{user?.email}</p></div></div>}
        </div>
      </main>

      {/* --- MODALS --- */}
      <WaterTestForm isOpen={isWaterTestFormOpen} onClose={() => setIsWaterTestFormOpen(false)} onSubmit={addTest} aquariums={myAquariums} />
      <NewTaskForm isOpen={isNewTaskFormOpen} onClose={() => setIsNewTaskFormOpen(false)} onSubmit={addTask} aquariums={myAquariums} />
      
      <NewAquariumModal 
        isOpen={isNewAquariumOpen} 
        onClose={() => setIsNewAquariumOpen(false)} 
        userId={user?.id}
        userTier={userProfile?.subscription_tier || 'hobby'}
        currentAquariumCount={myAquariums.length}
        onSuccess={fetchAquariums}
      />
    </div>
  );
};

export default Dashboard;