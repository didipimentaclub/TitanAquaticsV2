
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, CreditCard, Shield, Award, 
  Settings, Edit2, Save, X, Bell, Moon, Smartphone, 
  CheckCircle, LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { UserProfile, AVAILABLE_BADGES, Aquarium } from '../types';

const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  // Mock de notificações para UI
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyReport: true
  });

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // Busca Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Busca contagem de aquários para lógica de badges
      const { data: tanksData } = await supabase
        .from('aquariums')
        .select('id')
        .eq('user_id', user.id);

      if (profileData) {
        setProfile(profileData);
        setNewName(profileData.full_name || '');
      }
      if (tanksData) {
        setAquariums(tanksData as any);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newName })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setIsEditing(false);
    }
    setSaving(false);
  };

  const getPlanColor = (tier?: string) => {
    switch (tier) {
      case 'master': return 'from-purple-500 to-indigo-600';
      case 'pro': return 'from-[#4fb7b3] to-emerald-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Lógica simples para desbloquear badges baseada em dados locais
  const unlockedBadges = AVAILABLE_BADGES.filter(badge => {
    if (badge.criteria.metric === 'aquariums' && aquariums.length >= badge.criteria.target) return true;
    return false; // Outros critérios seriam implementados com queries reais
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-heading font-bold text-white mb-2">Minha Conta</h2>
        <p className="text-slate-400 text-sm">Gerencie suas informações pessoais e assinatura.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Perfil e Preferências */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Cartão de Perfil */}
          <section className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4fb7b3] to-[#0d0e21] p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-[#05051a] flex items-center justify-center text-3xl font-heading font-bold text-white">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 w-full">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3] font-bold">Nome de Exibição</label>
                    {isEditing ? (
                      <div className="flex gap-2 max-w-md">
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 bg-black/30 border border-white/20 rounded px-3 py-2 text-white focus:border-[#4fb7b3] outline-none"
                          autoFocus
                        />
                        <button onClick={handleUpdateProfile} disabled={saving} className="p-2 bg-[#4fb7b3] text-black rounded hover:bg-white transition-colors">
                          <Save size={18} />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-white/10 text-white rounded hover:bg-white/20">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 group">
                        <h3 className="text-2xl font-bold text-white">
                          {profile?.full_name || 'Aquarista Sem Nome'}
                        </h3>
                        <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-[#4fb7b3] transition-colors opacity-0 group-hover:opacity-100">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                    <Mail size={16} className="text-[#4fb7b3]" />
                    <span className="text-sm truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                    <Calendar size={16} className="text-[#4fb7b3]" />
                    <span className="text-sm">Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preferências */}
          <section className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 md:p-8">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <Settings className="text-[#4fb7b3]" size={20} /> Preferências do Sistema
             </h3>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-300"><Bell size={18}/></div>
                      <div>
                        <p className="text-sm font-bold text-white">Alertas por Email</p>
                        <p className="text-xs text-slate-500">Receba avisos sobre tarefas atrasadas.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setNotifications(prev => ({...prev, email: !prev.email}))}
                     className={`w-12 h-6 rounded-full relative transition-colors ${notifications.email ? 'bg-[#4fb7b3]' : 'bg-slate-700'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.email ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-300"><Smartphone size={18}/></div>
                      <div>
                        <p className="text-sm font-bold text-white">Relatório Semanal</p>
                        <p className="text-xs text-slate-500">Resumo da saúde dos seus aquários.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setNotifications(prev => ({...prev, weeklyReport: !prev.weeklyReport}))}
                     className={`w-12 h-6 rounded-full relative transition-colors ${notifications.weeklyReport ? 'bg-[#4fb7b3]' : 'bg-slate-700'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.weeklyReport ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 opacity-50 cursor-not-allowed">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-300"><Moon size={18}/></div>
                      <div>
                        <p className="text-sm font-bold text-white">Tema do Sistema</p>
                        <p className="text-xs text-slate-500">Atualmente fixado em Dark Mode.</p>
                      </div>
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Fixo</span>
                </div>
             </div>
          </section>

          {/* Badges / Gamification */}
          <section className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 md:p-8">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-[#4fb7b3]" size={20} /> Conquistas
                </h3>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-slate-300">
                   {unlockedBadges.length} / {AVAILABLE_BADGES.length} Desbloqueados
                </span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {AVAILABLE_BADGES.map((badge) => {
                 const isUnlocked = unlockedBadges.find(b => b.id === badge.id);
                 return (
                   <div 
                    key={badge.id} 
                    className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isUnlocked 
                      ? 'bg-[#4fb7b3]/10 border-[#4fb7b3]/50 shadow-[0_0_15px_rgba(79,183,179,0.1)]' 
                      : 'bg-black/20 border-white/5 opacity-40 grayscale'
                    }`}
                   >
                     <div className="text-3xl mb-2">{badge.icon}</div>
                     <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                       {badge.name}
                     </p>
                     {isUnlocked && <span className="text-[10px] text-[#4fb7b3] font-mono">+{badge.points} XP</span>}
                   </div>
                 );
               })}
             </div>
          </section>
        </div>

        {/* Coluna Direita: Assinatura e Ações */}
        <div className="space-y-6">
           {/* Card do Plano */}
           <div className={`rounded-2xl p-1 bg-gradient-to-br ${getPlanColor(profile?.subscription_tier)} shadow-2xl`}>
              <div className="bg-[#0d0e21] rounded-xl p-6 h-full relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Shield size={120} />
                 </div>
                 
                 <div className="relative z-10 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">Plano Atual</p>
                    <h3 className="text-3xl font-heading font-bold text-white uppercase mb-1">
                      {profile?.subscription_tier || 'Hobby'}
                    </h3>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Ativo
                    </div>
                    
                    <div className="space-y-3 text-left mb-8">
                       {[
                         'Monitoramento de Parâmetros',
                         profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'master' ? 'Múltiplos Aquários' : '1 Aquário (Upgrade para +)',
                         profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'master' ? 'Modo Viagem' : 'Modo Viagem (Bloqueado)',
                         'Suporte IA Titan Copilot'
                       ].map((feat, i) => (
                         <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle size={14} className={feat.includes('Bloqueado') ? 'text-slate-600' : 'text-[#4fb7b3]'} />
                            <span className={feat.includes('Bloqueado') ? 'text-slate-600' : ''}>{feat}</span>
                         </div>
                       ))}
                    </div>

                    {(profile?.subscription_tier !== 'pro' && profile?.subscription_tier !== 'master') && (
                       <button className="w-full py-3 bg-gradient-to-r from-[#4fb7b3] to-emerald-500 text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-[#4fb7b3]/20 transition-all">
                         Fazer Upgrade Pro
                       </button>
                    )}
                 </div>
              </div>
           </div>

           {/* Danger Zone */}
           <div className="bg-[#1a1b3b]/60 border border-white/5 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Zona de Ações</h4>
              <button 
                onClick={() => signOut()} 
                className="w-full py-3 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={16} /> Sair da Conta
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
