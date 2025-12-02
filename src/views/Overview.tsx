import React from 'react';
import { Activity, Thermometer, Droplets, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Overview: React.FC = () => {
  const stats = [
    { label: 'Temperatura', value: '26.5°C', status: 'Ideal', color: 'text-emerald-400', icon: Thermometer },
    { label: 'pH', value: '6.8', status: 'Estável', color: 'text-emerald-400', icon: Droplets },
    { label: 'Amônia', value: '0.00 ppm', status: 'Seguro', color: 'text-emerald-400', icon: Activity },
    { label: 'Nitrato', value: '10 ppm', status: 'Atenção', color: 'text-amber-400', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white mb-1">Visão Geral</h2>
          <p className="text-slate-400 text-sm">Resumo dos parâmetros vitais do seu ecossistema.</p>
        </div>
        <button className="bg-[#4fb7b3] text-[#05051a] px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20">
          Registrar Medição
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1a1b3b] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-[#4fb7b3]/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-black/20 ${stat.color}`}>
                {stat.status}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-heading mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
              <div className={`h-full ${stat.status === 'Atenção' ? 'bg-amber-400 w-3/4' : 'bg-[#4fb7b3] w-full'}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section Placeholder */}
        <div className="lg:col-span-2 bg-[#1a1b3b] border border-white/5 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-[#4fb7b3]" size={20} />
              Histórico de Parâmetros
            </h3>
            <select className="bg-[#05051a] border border-white/10 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#4fb7b3]">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          
          <div className="h-64 w-full bg-[#05051a]/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
             {/* Fake Chart Lines */}
             <svg className="w-full h-full absolute inset-0 text-[#4fb7b3] opacity-20" preserveAspectRatio="none">
               <path d="M0,100 C150,150 300,50 450,100 S600,150 750,100 S900,50 1200,120" fill="none" stroke="currentColor" strokeWidth="2" />
               <path d="M0,120 C100,100 250,140 400,110 S650,80 800,130" fill="none" stroke="#637ab9" strokeWidth="2" style={{opacity: 0.5}} />
             </svg>
             <p className="text-slate-500 text-sm font-mono relative z-10 bg-[#1a1b3b]/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/5">
               Gráfico interativo será carregado aqui
             </p>
          </div>
        </div>

        {/* Alerts & Tasks */}
        <div className="bg-[#1a1b3b] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-[#4fb7b3]" size={20} />
            Próximas Tarefas
          </h3>
          
          <div className="space-y-4 flex-1">
             {[
               { title: 'TPA Semanal (20%)', date: 'Hoje', urgent: true },
               { title: 'Limpeza do Canister', date: 'Amanhã', urgent: false },
               { title: 'Testes de Nitrito', date: 'Em 3 dias', urgent: false },
             ].map((task, idx) => (
               <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.urgent ? 'border-[#4fb7b3] group-hover:bg-[#4fb7b3]' : 'border-slate-600'}`}>
                   {task.urgent && <div className="w-2 h-2 bg-[#4fb7b3] rounded-full group-hover:bg-[#05051a]" />}
                 </div>
                 <div className="flex-1">
                   <p className={`text-sm font-medium ${task.urgent ? 'text-white' : 'text-slate-400'}`}>{task.title}</p>
                   <p className="text-xs text-slate-500">{task.date}</p>
                 </div>
               </div>
             ))}
          </div>

          <button className="mt-6 w-full py-3 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            Ver Agenda Completa
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
