
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Fish, CalendarDays, Wrench, Plane, User, Settings, LogOut, Activity, Lock, Users, Store, Crown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { SubscriptionTier } from '../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  userTier?: SubscriptionTier;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, mobileOpen, setMobileOpen, userTier = 'hobby' }) => {
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) return;
      
      const email = user.email.toLowerCase().trim();
      
      // Hardcode para o Admin Mestre - GARANTIA DE ACESSO
      if (email === 'kbludobarman@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // Verificação no banco para outros admins
      const { data } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();
      
      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [user]);

  // Se for admin, considera como lojista para liberar menus
  const effectiveTier = isAdmin ? 'lojista' : userTier;

  const handleNav = (view: string) => {
    onViewChange(view);
    if (setMobileOpen) setMobileOpen(false);
  };

  const NavItem = ({ view, icon: Icon, label, locked }: { view: string; icon: any; label: string, locked?: boolean }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => handleNav(view)}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-l-2 mb-1 group relative overflow-hidden ${
          isActive 
            ? 'border-[#4fb7b3] text-white bg-white/5' 
            : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon size={18} className={`transition-colors ${isActive ? 'text-[#4fb7b3]' : 'group-hover:text-[#4fb7b3]'}`} />
        <span className="text-xs font-bold uppercase tracking-widest relative z-10 flex-1">{label}</span>
        {locked && <Lock size={14} className="text-slate-600" />}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#4fb7b3]/10 to-transparent pointer-events-none" />
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0d0e21] border-r border-white/5">
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
            <span className="text-[#4fb7b3] text-2xl">●</span>
            <div>
                <h1 className="text-xl font-heading font-bold tracking-tighter text-white leading-none">TITAN</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Aquatics 2.0</p>
            </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-4 mb-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Menu Principal</div>
        <NavItem view="overview" icon={LayoutDashboard} label="Visão Geral" />
        <NavItem view="aquariums" icon={Fish} label="Meus Aquários" />
        <NavItem view="events" icon={CalendarDays} label="Eventos" />
        <NavItem view="tools" icon={Wrench} label="Ferramentas" />
        
        <div className="px-4 mt-6 mb-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Pessoal</div>
        
        {/* Clients CRM for Shopkeepers or Admins */}
        {(effectiveTier === 'lojista' || isAdmin) && (
           <>
             <NavItem view="dashboard-lojista" icon={Store} label="Dashboard Loja" />
             <NavItem view="clients" icon={Users} label="Gestão de Clientes" />
             <NavItem view="agenda" icon={Calendar} label="Agenda Visitas" />
           </>
        )}

        <NavItem view="travel" icon={Plane} label="Modo Viagem" locked={effectiveTier === 'hobby' && !isAdmin} />
        <NavItem view="account" icon={User} label="Minha Conta" />
        <NavItem view="planos" icon={Crown} label="Planos" />
        
        {/* Menu Admin - Visível APENAS se isAdmin for true */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="px-4 mb-2 text-[10px] text-[#4fb7b3] font-bold uppercase tracking-widest">Administração</div>
            <NavItem view="admin" icon={Settings} label="Painel Master" />
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#05051a]/50">
        <div className="rounded-xl bg-[#1a1b3b] p-4 border border-white/5 mb-3 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded-lg bg-[#4fb7b3]/10 text-[#4fb7b3]">
              <Activity size={14} />
            </div>
            <span className="text-xs font-bold text-white">Status do Sistema</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Online • v2.2.2
          </div>
        </div>

        <button 
          onClick={() => signOut()} 
          className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-white hover:bg-rose-500/10 transition-colors text-xs font-bold uppercase tracking-widest py-3 rounded-lg border border-transparent hover:border-rose-500/20"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setMobileOpen && setMobileOpen(false)} 
            />
            <motion.aside 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-50 w-[280px] h-full shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
