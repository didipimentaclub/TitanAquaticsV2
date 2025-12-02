import React, { useState, useEffect } from 'react';
import { 
  Activity, Thermometer, Droplets, AlertTriangle, TrendingUp, 
  Plus, Fish, Info, Calendar, Box, ArrowRight, HeartPulse 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Aquarium } from '../types';
import { useWaterTests } from '../hooks/useWaterTests';
import { useMaintenanceTasks } from '../hooks/useMaintenanceTasks';
import { analyzeParameter, calculateHealthScore, formatDate } from '../utils/helpers';
import { ParametersDashboard } from '../components/ParameterChart';
import { MaintenanceTaskList, NewTaskForm } from '../components/MaintenanceTaskList';
import WaterTestForm from '../components/WaterTestForm';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState<string | null>(null);
  const [loadingTanks, setLoadingTanks] = useState(true);
  
  // Modals
  const [isWaterTestFormOpen, setIsWaterTestFormOpen] = useState(false);
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);

  // Hooks de Dados
  const { tests, addTest, latestTest } = useWaterTests(user?.id, { aquariumId: selectedAquariumId });
  const { tasks, addTask, completeTask, deleteTask } = useMaintenanceTasks(user?.id);

  useEffect(() => {
    fetchAquariums();
  }, [user]);

  const fetchAquariums = async () => {
    if (!user) return;
    setLoadingTanks(true);
    const { data } = await supabase
      .from('aquariums')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setMyAquariums(data);
      if (data.length > 0) {
        setSelectedAquariumId(data[0].id);
      }
    }
    setLoadingTanks(false);
  };

  const currentAquarium = myAquariums.find(t => t.id === selectedAquariumId) || myAquariums[0];
  const tankType = currentAquarium?.tank_type || 'Doce';
  const health = calculateHealthScore(latestTest, tankType);
  const tankAge = currentAquarium?.setup_date 
    ? Math.floor((new Date().getTime() - new Date(currentAquarium.setup_date).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  // KPIs
  const kpiStats = [
    { label: 'Temperatura', val: latestTest?.temperature, unit: '°C', key: 'temperature', icon: Thermometer },
    { label: 'pH', val: latestTest?.ph, unit: '', key: 'ph', icon: Droplets },
    { label: 'Amônia', val: latestTest?.ammonia, unit: 'ppm', key: 'ammonia', icon: Activity },
    { label: 'Nitrato', val: latestTest?.nitrate, unit: 'ppm', key: 'nitrate', icon: AlertTriangle },
  ];

  if (loadingTanks) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#4fb7b3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white tracking-wide">
            DASHBOARD
          </h2>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Operacional
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {myAquariums.length > 0 && (
            <div className="relative group">
              <select 
                value={selectedAquariumId || ''}
                onChange={(e) => setSelectedAquariumId(e.target.value)}
                className="appearance-none bg-[#1a1b3b] border border-white/10 text-white text-xs font-bold uppercase rounded-lg pl-4 pr-10 py-3 focus:border-[#4fb7b3] outline-none cursor-pointer hover:bg-white/5 transition-colors min-w-[200px]"
              >
                {myAquariums.map(tank => (
                  <option key={tank.id} value={tank.id}>{tank.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Fish size={14} />
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsWaterTestFormOpen(true)}
            disabled={myAquariums.length === 0}
            className="bg-[#4fb7b3] text-[#05051a] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Nova Medição
          </button>
        </div>
      </div>

      {myAquariums.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 rounded-3xl bg-gradient-to-b from-[#1a1b3b]/40 to-transparent border border-white/5"
        >
            <div className="w-24 h-24 bg-[#1a1b3b] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#4fb7b3]/10 relative group">
                <div className="absolute inset-0 bg-[#4fb7b3]/20 rounded-full animate-ping opacity-20" />
                <Fish size={40} className="text-[#4fb7b3]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sistema Offline</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-md text-center leading-relaxed">
              Nenhum ecossistema detectado. Cadastre seu primeiro aquário para ativar os sensores de monitoramento e o Titan Copilot.
            </p>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-dashed border-white/10 text-xs text-slate-500 uppercase tracking-widest">
              Navegue para "Meus Aquários"
            </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Coluna Principal (Esquerda) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Health Card */}
              <div className="md:col-span-1 bg-gradient-to-br from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between h-36">
                 <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Saúde do Sistema</span>
                    <HeartPulse size={16} className={health.color} />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-baseline gap-2">
                       <span className={`text-4xl font-heading font-bold ${health.color}`}>{health.score}%</span>
                       <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 ${health.color}`}>{health.status}</span>
                    </div>
                    {latestTest && (
                       <p className="text-[10px] text-slate-500 mt-2">
                         Última leitura: {formatDate(latestTest.measured_at, 'relative')}
                       </p>
                    )}
                 </div>
                 {/* Background Chart Effect */}
                 <div className="absolute bottom-0 right-0 w-32 h-16 opacity-10">
                    <TrendingUp size={64} className="text-white transform translate-y-4 translate-x-4" />
                 </div>
              </div>

              {/* Tank Details Card */}
              <div className="md:col-span-2 bg-[#1a1b3b]/60 rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-36">
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {currentAquarium.name}
                        <span className="text-[10px] bg-[#4fb7b3]/10 text-[#4fb7b3] px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-[#4fb7b3]/20">
                          {currentAquarium.tank_type}
                        </span>
                      </h3>
                    </div>
                    <Info size={16} className="text-slate-500 hover:text-white transition-colors cursor-help" />
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                       <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Box size={10} /> Volume Total</p>
                       <p className="text-lg font-mono text-white">{(currentAquarium.volume_liters + (currentAquarium.sump_volume_liters || 0))} L</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                       <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={10} /> Idade</p>
                       <p className="text-lg font-mono text-white">{tankAge} dias</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center justify-center">
                       <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center mt-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> Ativo
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiStats.map((stat, i) => {
                const analysis = analyzeParameter(stat.key, Number(stat.val || 0), tankType);
                const hasData = stat.val !== undefined && stat.val !== null;
                
                return (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 group
                      ${hasData 
                        ? 'bg-[#1a1b3b]/60 border-white/5 hover:border-[#4fb7b3]/30' 
                        : 'bg-[#1a1b3b]/30 border-dashed border-white/5'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-1.5 rounded-lg ${hasData ? 'bg-white/5 text-slate-300 group-hover:text-white' : 'bg-transparent text-slate-600'}`}>
                        <stat.icon size={16} />
                      </div>
                      {hasData && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${analysis.bgColor} ${analysis.color}`}>
                          {analysis.status === 'ideal' ? 'Ideal' : analysis.status === 'acceptable' ? 'Ok' : 'Atenção'}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className={`text-2xl font-bold font-mono ${hasData ? 'text-white' : 'text-slate-600'}`}>
                        {hasData ? stat.val : '-'} 
                        <span className="text-xs font-sans font-normal text-slate-500 ml-1">{stat.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">{stat.label}</div>
                    </div>

                    {/* Barra de Progresso Visual */}
                    {hasData && (
                       <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20">
                          <div 
                             className={`h-full transition-all duration-1000 ease-out ${analysis.color.replace('text-', 'bg-')}`} 
                             style={{ width: analysis.status === 'ideal' ? '100%' : '60%' }}
                          />
                       </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 min-h-[400px] flex flex-col">
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="text-[#4fb7b3]" size={20} />
                      Laboratório de Parâmetros
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Análise histórica da qualidade da água.</p>
                  </div>
                  <button className="text-xs text-[#4fb7b3] hover:text-white transition-colors uppercase font-bold tracking-wider flex items-center gap-1">
                    Ver Relatório <ArrowRight size={12} />
                  </button>
               </div>
               
               <div className="flex-1 w-full min-h-0">
                  {tests.length > 0 ? (
                     <ParametersDashboard tests={tests} tankType={tankType} />
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                        <Activity className="text-slate-500 mb-4" size={48} />
                        <p className="text-slate-400 text-sm">Insira dados para visualizar os gráficos.</p>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Coluna Lateral (Direita) - Tarefas e Insights */}
          <div className="xl:col-span-1 space-y-6">
             <div className="h-full max-h-[800px] flex flex-col">
                <MaintenanceTaskList 
                    tasks={tasks}
                    aquariums={myAquariums}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    onAddClick={() => setIsNewTaskFormOpen(true)}
                />
                
                {/* Mini Insight Card (Placeholder para futura IA) */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#4fb7b3]/10 to-transparent border border-[#4fb7b3]/20">
                   <h4 className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#4fb7b3] animate-pulse"/> Titan Copilot
                   </h4>
                   <p className="text-xs text-slate-300 leading-relaxed">
                     {health.score < 50 
                       ? "Atenção necessária nos parâmetros. A qualidade da água está abaixo do ideal para este tipo de tanque."
                       : "Seu ecossistema está estável. Mantenha a rotina de TPA para garantir a longevidade da fauna."}
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <WaterTestForm 
        isOpen={isWaterTestFormOpen} 
        onClose={() => setIsWaterTestFormOpen(false)} 
        onSubmit={async (data) => { await addTest(data); }} 
        aquariums={myAquariums} 
      />
      <NewTaskForm 
        isOpen={isNewTaskFormOpen} 
        onClose={() => setIsNewTaskFormOpen(false)} 
        onSubmit={async (data) => { await addTask(data); }} 
        aquariums={myAquariums} 
      />
    </div>
  );
};

export default Overview;