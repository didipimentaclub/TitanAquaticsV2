import React, { useState, useEffect } from 'react';
import { Users, Calendar, Settings, Shield, Plus, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { AquariumEvent, UserProfile } from '../types';

interface AdminPanelProps {
  userEmail?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userEmail }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'settings'>('events');
  const [events, setEvents] = useState<AquariumEvent[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded master admin for safety + DB check
  const MASTER_ADMIN = 'kbludobarman@gmail.com';

  useEffect(() => {
    checkAdmin();
  }, [userEmail]);

  const checkAdmin = async () => {
    if (!userEmail) return;

    // Check if is hardcoded master
    if (userEmail === MASTER_ADMIN) {
        setIsAdmin(true);
        fetchEvents();
        fetchUsers();
        setLoading(false);
        return;
    }

    // Check DB
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
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as any);
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Excluir este evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  if (loading) {
    return <div className="p-6 text-white text-center">Verificando permissões...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-16 bg-[#1a1b3b]/60 rounded-2xl border border-rose-500/20">
          <Shield size={48} className="mx-auto text-rose-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
          <p className="text-xs text-slate-500 mt-2">Email: {userEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-[#4fb7b3]" size={28} />
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Administração</h1>
          <p className="text-slate-400">Painel administrativo do Titan Aquatics</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        {[
          { id: 'events', label: 'Eventos', icon: Calendar },
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'settings', label: 'Config', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === tab.id ? 'bg-[#4fb7b3] text-black' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Gerenciar Eventos ({events.length})</h2>
            {/* Note: In a real app, this would open a modal similar to Dashboard */}
            <div className="text-xs text-slate-400 italic">Use o painel de Eventos do Dashboard para adicionar/editar.</div>
          </div>
          
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:border-[#4fb7b3]/30 transition-colors">
                <div className="flex gap-4 items-center">
                    {event.image && <img src={event.image} alt="" className="w-12 h-12 rounded object-cover" />}
                    <div>
                        <h3 className="text-white font-bold">{event.title}</h3>
                        <p className="text-xs text-slate-400">{event.date} • {event.type} • {event.location}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => deleteEvent(event.id)} className="p-2 bg-rose-500/10 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Base de Usuários ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-400 uppercase bg-black/20">
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
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.subscription_tier === 'master' ? 'bg-purple-500/20 text-purple-300' :
                        user.subscription_tier === 'pro' ? 'bg-[#4fb7b3]/20 text-[#4fb7b3]' :
                        'bg-white/10 text-slate-400'
                      }`}>
                        {user.subscription_tier || 'hobby'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center py-20">
          <Settings size={48} className="text-slate-600 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Configurações do Sistema</h2>
          <p className="text-slate-400">Em desenvolvimento...</p>
        </div>
      )}
    </div>
  );
};