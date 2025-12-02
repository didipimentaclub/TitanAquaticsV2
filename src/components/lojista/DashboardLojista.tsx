
import React, { useState, useEffect } from 'react';
import { Store, Users, Calendar, DollarSign, TrendingUp, Fish, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { StoreClient, MaintenanceVisit } from '../../types';

interface DashboardLojistaProps {
  userId: string;
  companyName?: string;
}

const DashboardLojista: React.FC<DashboardLojistaProps> = ({ userId, companyName }) => {
  const [stats, setStats] = useState({ totalClients: 0, totalAquariums: 0, visitsThisMonth: 0, visitsToday: 0, completedThisMonth: 0, revenueThisMonth: 0, pendingVisits: 0 });
  const [todayVisits, setTodayVisits] = useState<MaintenanceVisit[]>([]);
  const [recentClients, setRecentClients] = useState<StoreClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const { count: clientsCount } = await supabase.from('store_clients').select('*', { count: 'exact', head: true }).eq('store_user_id', userId);
      const { count: aquariumsCount } = await supabase.from('client_aquariums').select('*', { count: 'exact', head: true }).eq('store_user_id', userId);
      const { data: monthVisits } = await supabase.from('maintenance_visits').select('*').eq('store_user_id', userId).gte('scheduled_date', startOfMonth);
      const { data: todayData } = await supabase.from('maintenance_visits').select(`*, client:store_clients(id, name), aquarium:client_aquariums(id, name)`).eq('store_user_id', userId).eq('scheduled_date', today).order('scheduled_time');
      const { data: clients } = await supabase.from('store_clients').select('*').eq('store_user_id', userId).order('created_at', { ascending: false }).limit(5);

      const completedVisits = monthVisits?.filter(v => v.status === 'concluida') || [];
      const pendingVisits = monthVisits?.filter(v => v.status === 'agendada' || v.status === 'confirmada') || [];
      const revenue = completedVisits.reduce((sum, v) => sum + (v.cost || 0), 0);

      setStats({
        totalClients: clientsCount || 0,
        totalAquariums: aquariumsCount || 0,
        visitsThisMonth: monthVisits?.length || 0,
        visitsToday: todayData?.length || 0,
        completedThisMonth: completedVisits.length,
        revenueThisMonth: revenue,
        pendingVisits: pendingVisits.length
      });

      setTodayVisits(todayData || []);
      setRecentClients(clients || []);
      setLoading(false);
    };
    fetchDashboardData();
  }, [userId]);

  if (loading) return <div className="p-6 text-center text-white">Carregando dashboard...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-full bg-[#4fb7b3]/20"><Store className="text-[#4fb7b3]" size={32} /></div>
        <div><h1 className="text-3xl font-heading font-bold text-white">{companyName || 'Dashboard Lojista'}</h1><p className="text-slate-400">Visão geral do seu negócio</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-5"><div className="flex justify-between"><Users className="text-[#4fb7b3]" /><span className="text-xs text-[#4fb7b3] bg-[#4fb7b3]/20 px-2 py-1 rounded">Total</span></div><p className="text-3xl font-bold text-white mt-3">{stats.totalClients}</p><p className="text-sm text-slate-400">Clientes</p></div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-5"><div className="flex justify-between"><Fish className="text-blue-400" /><span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Total</span></div><p className="text-3xl font-bold text-white mt-3">{stats.totalAquariums}</p><p className="text-sm text-slate-400">Aquários</p></div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-5"><div className="flex justify-between"><Calendar className="text-amber-400" /><span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Mês</span></div><p className="text-3xl font-bold text-white mt-3">{stats.visitsThisMonth}</p><p className="text-sm text-slate-400">Visitas</p></div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-5"><div className="flex justify-between"><DollarSign className="text-emerald-400" /><span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">Mês</span></div><p className="text-3xl font-bold text-white mt-3">R$ {stats.revenueThisMonth.toFixed(0)}</p><p className="text-sm text-slate-400">Faturamento</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between mb-4"><h2 className="text-lg font-bold text-white flex gap-2"><Clock className="text-[#4fb7b3]" /> Agenda de Hoje</h2><span className="text-sm bg-[#4fb7b3]/20 text-[#4fb7b3] px-3 py-1 rounded-full">{stats.visitsToday} visita(s)</span></div>
          {todayVisits.length === 0 ? <div className="text-center py-8 text-slate-400">Nenhuma visita hoje.</div> : <div className="space-y-3">{todayVisits.map(v => (<div key={v.id} className="flex justify-between p-3 bg-black/30 rounded-lg"><div className="flex gap-3"><div className="text-lg font-bold text-white">{v.scheduled_time?.slice(0,5)}</div><div className="border-l border-white/10 pl-3"><p className="font-bold text-white">{v.client?.name}</p><p className="text-xs text-slate-400">{v.type}</p></div></div></div>))}</div>}
        </div>

        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white flex gap-2 mb-4"><TrendingUp className="text-[#4fb7b3]" /> Resumo do Mês</h2>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-slate-400">Concluídas</span><span className="text-white font-bold">{stats.completedThisMonth}</span></div>
            <div className="w-full bg-black/30 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.visitsThisMonth > 0 ? (stats.completedThisMonth / stats.visitsThisMonth) * 100 : 0}%` }} /></div>
            <div className="flex justify-between"><span className="text-slate-400">Pendentes</span><span className="text-amber-400 font-bold">{stats.pendingVisits}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLojista;
