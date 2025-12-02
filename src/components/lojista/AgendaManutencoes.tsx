
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { MaintenanceVisit, StoreClient, MAINTENANCE_TYPES } from '../../types';

interface AgendaManutencoesProps { userId: string; }

const AgendaManutencoes: React.FC<AgendaManutencoesProps> = ({ userId }) => {
  const [visits, setVisits] = useState<MaintenanceVisit[]>([]);
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ client_id: '', scheduled_date: '', scheduled_time: '09:00', type: 'Manutenção Geral', cost: '' });

  useEffect(() => { fetchVisits(); fetchClients(); }, [userId, currentDate]);

  const fetchVisits = async () => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
    const { data } = await supabase.from('maintenance_visits').select('*, client:store_clients(name)').eq('store_user_id', userId).gte('scheduled_date', start).lte('scheduled_date', end).order('scheduled_date');
    if (data) setVisits(data);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('store_clients').select('*').eq('store_user_id', userId);
    if (data) setClients(data);
  };

  const saveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('maintenance_visits').insert([{ ...form, store_user_id: userId, duration_minutes: 60 }]);
    fetchVisits(); setIsModalOpen(false);
  };

  const days = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-white flex gap-3"><Calendar className="text-[#4fb7b3]" /> Agenda</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold"><Plus size={18} /> Nova Visita</button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><ChevronLeft className="text-slate-400" /></button>
        <h2 className="text-xl font-bold text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><ChevronRight className="text-slate-400" /></button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden flex-1 border border-white/10">
        {days.map(day => {
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayVisits = visits.filter(v => v.scheduled_date === dateStr);
          return (
            <div key={day} className="bg-[#05051a] p-2 min-h-[100px] hover:bg-[#1a1b3b] transition-colors relative group">
              <span className="text-slate-500 font-bold text-sm absolute top-2 left-2">{day}</span>
              <div className="mt-6 space-y-1">
                {dayVisits.map(v => (
                  <div key={v.id} className="bg-[#4fb7b3]/20 text-[#4fb7b3] text-xs p-1 rounded truncate">
                    {v.scheduled_time?.slice(0, 5)} {v.client?.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1b3b] p-6 rounded-xl w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Agendar Visita</h2>
            <form onSubmit={saveVisit} className="space-y-4">
              <select required value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white">
                <option value="">Selecione o Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" required value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                <input type="time" required value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
              </div>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white">
                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Valor (R$)" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-white/10 rounded text-slate-300">Cancelar</button><button type="submit" className="flex-1 py-2 bg-[#4fb7b3] rounded text-black font-bold">Agendar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaManutencoes;
