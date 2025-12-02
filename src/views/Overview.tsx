import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, AlertTriangle, TrendingUp, Clock, Plus, Fish } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Aquarium } from '../types';
import { useWaterTests } from '../hooks/useWaterTests';
import { useMaintenanceTasks } from '../hooks/useMaintenanceTasks';
import { analyzeParameter } from '../utils/helpers';
import { ParametersDashboard } from '../components/ParameterChart';
import { MaintenanceTaskList, NewTaskForm } from '../components/MaintenanceTaskList';
import WaterTestForm from '../components/WaterTestForm';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState<string | null>(null);
  
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
    const { data } = await supabase
      .from('aquariums')
      .select('*, volume:volume_liters, sump_volume:sump_volume_liters, type:tank_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setMyAquariums(data);
      if (data.length > 0) {
        setSelectedAquariumId(data[0].id);
      }
    }
  };

  const currentAquarium = myAquariums.find(t => t.id === selectedAquariumId) || myAquariums[0];
  const tankType = currentAquarium?.type || 'Doce';

  // Configuração dos Cards de KPI
  const kpiStats = [
    { label: 'Temperatura', val: latestTest?.temperature, unit: '°C', key: 'temperature', icon: Thermometer },
    { label: 'pH', val: latestTest?.ph, unit: '', key: 'ph', icon: Droplets },
    { label: 'Amônia', val: latestTest?.ammonia, unit: 'ppm', key: 'ammonia', icon: Activity },
    { label: 'Nitrato', val: latestTest?.nitrate, unit: 'ppm', key: 'nitrate', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white mb-1">Visão Geral</h2>
          <p className="text-slate-400 text-sm">
            {currentAquarium ? `Monitorando: ${currentAquarium.name}` : 'Resumo do ecossistema principal.'}
          </p>
        </div>
        
        <div className="flex gap-3">
          {myAquariums.length > 1 && (
            <select 
              value={selectedAquariumId || ''}
              onChange={(e) => setSelectedAquariumId(e.target.value)}
              className="bg-[#1a1b3b] border border-white/10 text-white text-xs font-bold uppercase rounded-lg px-4 py-2.5 focus:border-[#4fb7b3] outline-none"
            >
              {myAquariums.map(tank => (
                <option key={tank.id} value={tank.id}>{tank.name}</option>
              ))}
            </select>
          )}

          <button 
            onClick={() => setIsWaterTestFormOpen(true)}
            disabled={myAquariums.length === 0}
            className="bg-[#4fb7b3] text-[#05051a] px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Registrar Medição
          </button>
        </div>
      </div>

      {myAquariums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#1a1b3b]/20">
            <div className="p-4 bg-white/5 rounded-full mb-4 text-slate-500">
                <Fish size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum aquário encontrado</h3>
            <p className="text-slate-400 text-sm mb-6">Vá para a aba "Meus Aquários" para cadastrar seu primeiro tanque.</p>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiStats.map((stat, i) => {
              const analysis = analyzeParameter(stat.key, Number(stat.val || 0), tankType);
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1a1b3b]/60 border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-[#4fb7b3]/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-slate-400 group-hover:text-white transition-colors"><stat.icon size={18} /></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${analysis.bgColor} ${analysis.color}`}>
                      {stat.val === undefined ? 'Sem Dados' : (analysis.status === 'ideal' ? 'Ideal' : analysis.status === 'acceptable' ? 'Ok' : 'Atenção')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stat.val ?? '-'} <span className="text-sm font-normal text-slate-500">{stat.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">{stat.label}</div>
                  
                  {/* Barra de Status */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                    <div className={`h-full transition-all duration-500 ${
                       !stat.val ? 'w-0' :
                       analysis.status === 'ideal' ? 'bg-emerald-400 w-full' : 
                       analysis.status === 'warning' ? 'bg-amber-400 w-full' : 
                       analysis.status === 'critical' ? 'bg-rose-400 w-full' : 'bg-[#4fb7b3] w-3/4'
                    }`} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-[#4fb7b3]" size={20} />
                  Histórico de Parâmetros
                </h3>
              </div>
              
              <div className="flex-1 min-h-0">
                 {tests.length > 0 ? (
                    <ParametersDashboard tests={tests} tankType={tankType} />
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Activity className="text-slate-600 mb-4" size={48} />
                        <p className="text-slate-400">Registre seu primeiro teste para visualizar o gráfico.</p>
                    </div>
                 )}
              </div>
            </div>

            {/* Maintenance Tasks */}
            <div className="h-[400px]">
               <MaintenanceTaskList 
                  tasks={tasks}
                  aquariums={myAquariums}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onAddClick={() => setIsNewTaskFormOpen(true)}
               />
            </div>
          </div>
        </>
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