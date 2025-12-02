import React, { useEffect, useState } from 'react';
import { Plus, Droplets, Pencil, Trash2, Fish } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { NewAquariumModal } from '../components/NewAquariumModal';

const Aquariums: React.FC = () => {
  const { user } = useAuth();
  const [tanks, setTanks] = useState<Aquarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchTanks();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if(data) setUserProfile(data as any);
  };

  const fetchTanks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aquariums')
        .select('*, volume:volume_liters, sump_volume:sump_volume_liters, type:tank_type')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTanks(data || []);
    } catch (error) {
      console.error('Error fetching tanks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir este aquário? Todos os dados serão perdidos.")) return;
    await supabase.from('aquariums').delete().eq('id', id);
    fetchTanks();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white mb-1">Meus Aquários</h2>
          <p className="text-slate-400 text-sm">Gerencie seus tanques, fauna e equipamentos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4fb7b3] text-[#05051a] px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20 flex items-center gap-2"
        >
          <Plus size={16} /> Novo Aquário
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="w-8 h-8 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-dashed border-white/10 rounded-2xl bg-[#1a1b3b]/20">
           <div className="p-4 bg-white/5 rounded-full mb-4 text-slate-500">
             <Fish size={48} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Nenhum aquário encontrado</h3>
           <p className="text-slate-400 text-sm mb-6">Comece cadastrando seu primeiro ecossistema.</p>
           <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest"
           >
             Cadastrar Agora
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tanks.map((tank) => (
            <motion.div
              key={tank.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1b3b] border border-white/5 rounded-2xl p-6 hover:border-[#4fb7b3]/30 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#4fb7b3]/10 text-[#4fb7b3] rounded-xl">
                  <Droplets size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                     <Pencil size={16} />
                   </button>
                   <button onClick={() => handleDelete(tank.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-1">{tank.name}</h3>
                <span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-wider bg-[#4fb7b3]/10 px-2 py-1 rounded">
                  {tank.tank_type}
                </span>
              </div>

              <div className="space-y-3 flex-1 text-sm text-slate-400">
                 <div className="flex justify-between py-2 border-b border-white/5">
                   <span>Volume</span>
                   <span className="text-white font-mono">{tank.volume_liters + (tank.sump_volume_liters || 0)} L</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-white/5">
                   <span>Montagem</span>
                   <span className="text-white font-mono">{tank.setup_date ? new Date(tank.setup_date).toLocaleDateString('pt-BR') : '-'}</span>
                 </div>
                 {tank.fauna && (
                   <div className="pt-2">
                     <span className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1">Fauna</span>
                     <p className="line-clamp-2 text-slate-300">{tank.fauna}</p>
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {user && (
        <NewAquariumModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            userId={user.id}
            userTier={userProfile?.subscription_tier || 'hobby'}
            currentAquariumCount={tanks.length}
            onSuccess={fetchTanks}
        />
      )}
    </div>
  );
};

export default Aquariums;