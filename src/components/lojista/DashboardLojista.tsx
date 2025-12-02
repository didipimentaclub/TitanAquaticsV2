
import React, { useState, useEffect } from 'react';
import { 
  Store, Users, Calendar, DollarSign, TrendingUp,
  Fish, Clock, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { StoreClient, MaintenanceVisit } from '../../types';

interface DashboardLojistaProps {
  userId: string;
  companyName?: string;
}

const DashboardLojista: React.FC<DashboardLojistaProps> = ({ userId, companyName }) => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAquariums: 0,
    visitsThisMonth: 0,
    visitsToday: 0,
    completedThisMonth: 0,
    revenueThisMonth: 0,
    pendingVisits: 0
  });
  const [todayVisits, setTodayVisits] = useState<MaintenanceVisit[]>([]);
  const [recentClients, setRecentClients] = useState<StoreClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Total de clientes
    const { count: clientsCount } = await supabase
      .from('store_clients')
      .select('*', { count: 'exact', head: true })
      .eq('store_user_id', userId);

    // Total de aquários
    const { count: aquariumsCount } = await supabase
      .from('client_aquariums')
      .select('*', { count: 'exact', head: true })
      .eq('store_user_id', userId);

    // Visitas do mês
    const { data: monthVisits } = await supabase
      .from('maintenance_visits')
      .select('*')
      .eq('store_user_id', userId)
      .gte('scheduled_date', startOfMonth);

    // Visitas de hoje
    const { data: todayData } = await supabase
      .from('maintenance_visits')
      .select(`
        *,
        client:store_clients(id, name, phone, address),
        aquarium:client_aquariums(id, name)
      `)
      .eq('store_user_id', userId)
      .eq('scheduled_date', today)
      .order('scheduled_time');

    // Clientes recentes
    const { data: clients } = await supabase
      .from('store_clients')
      .select('*')
      .eq('store_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calcular estatísticas
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-white">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-full bg-[#4fb7b3]/20">
          <Store className="text-[#4fb7b3]" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">
            {companyName || 'Dashboard Lojista'}
          </h1>
          <p className="text-slate-400">Visão geral do seu negócio</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#4fb7b3]/20 to-[#4fb7b3]/5 border border-[#4fb7b3]/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Users className="text-[#4fb7b3]" size={24} />
            <span className="text-xs text-[#4fb7b3] bg-[#4fb7b3]/20 px-2 py-1 rounded">Total</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3">{stats.totalClients}</p>
          <p className="text-sm text-slate-400">Clientes</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Fish className="text-blue-400" size={24} />
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Total</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3">{stats.totalAquariums}</p>
          <p className="text-sm text-slate-400">Aquários gerenciados</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Calendar className="text-amber-400" size={24} />
            <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Mês</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3">{stats.visitsThisMonth}</p>
          <p className="text-sm text-slate-400">Visitas agendadas</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <DollarSign className="text-emerald-400" size={24} />
            <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">Mês</span>
          </div>
          <p className="text-3xl font-bold text-white mt-3">
            R$ {stats.revenueThisMonth.toFixed(0)}
          </p>
          <p className="text-sm text-slate-400">Faturamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitas de Hoje */}
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="text-[#4fb7b3]" />
              Agenda de Hoje
            </h2>
            <span className="text-sm bg-[#4fb7b3]/20 text-[#4fb7b3] px-3 py-1 rounded-full">
              {stats.visitsToday} visita(s)
            </span>
          </div>

          {todayVisits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-50" />
              <p>Nenhuma visita agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayVisits.map(visit => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[50px]">
                      <p className="text-lg font-bold text-white">
                        {visit.scheduled_time?.slice(0, 5)}
                      </p>
                    </div>
                    <div className="border-l border-white/10 pl-3">
                      <p className="font-bold text-white">{visit.client?.name}</p>
                      <p className="text-xs text-slate-400">{visit.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {visit.status === 'concluida' ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Mensal */}
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#4fb7b3]" />
            Resumo do Mês
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Visitas concluídas</span>
              <span className="text-white font-bold">{stats.completedThisMonth}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${stats.visitsThisMonth > 0 ? (stats.completedThisMonth / stats.visitsThisMonth) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Visitas pendentes</span>
              <span className="text-amber-400 font-bold">{stats.pendingVisits}</span>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ticket médio</span>
                <span className="text-[#4fb7b3] font-bold">
                  R$ {stats.completedThisMonth > 0 
                    ? (stats.revenueThisMonth / stats.completedThisMonth).toFixed(2).replace('.', ',')
                    : '0,00'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clientes Recentes */}
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="text-[#4fb7b3]" />
              Clientes Recentes
            </h2>
            <button className="text-sm text-[#4fb7b3] hover:text-white flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </button>
          </div>

          {recentClients.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum cliente cadastrado ainda
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentClients.map(client => (
                <div
                  key={client.id}
                  className="p-4 bg-black/30 rounded-lg hover:bg-black/40 transition-colors"
                >
                  <h3 className="font-bold text-white">{client.name}</h3>
                  {client.phone && (
                    <p className="text-sm text-slate-400 mt-1">📱 {client.phone}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLojista;
