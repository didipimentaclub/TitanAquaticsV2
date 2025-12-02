
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Clock, User, Fish, MapPin,
  Check, X, Edit2, Trash2, ChevronLeft, ChevronRight,
  Save, FileText, DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { MaintenanceVisit, StoreClient, ClientAquarium, MAINTENANCE_TYPES, VISIT_STATUS } from '../../types';

interface AgendaManutencoesProps {
  userId: string;
}

const AgendaManutencoes: React.FC<AgendaManutencoesProps> = ({ userId }) => {
  const [visits, setVisits] = useState<MaintenanceVisit[]>([]);
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navegação do calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<MaintenanceVisit | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Aquários do cliente selecionado
  const [clientAquariums, setClientAquariums] = useState<ClientAquarium[]>([]);

  // Form
  const [form, setForm] = useState({
    client_id: '',
    aquarium_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    duration_minutes: '60',
    type: 'Manutenção Geral',
    notes: '',
    cost: ''
  });

  useEffect(() => {
    fetchVisits();
    fetchClients();
  }, [userId, currentDate]);

  const fetchVisits = async () => {
    setLoading(true);
    
    // Buscar visitas do mês atual
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('maintenance_visits')
      .select(`
        *,
        client:store_clients(id, name, phone, address),
        aquarium:client_aquariums(id, name, tank_type)
      `)
      .eq('store_user_id', userId)
      .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
      .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
      .order('scheduled_date')
      .order('scheduled_time');
    
    if (data) setVisits(data);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase
      .from('store_clients')
      .select('*')
      .eq('store_user_id', userId)
      .order('name');
    
    if (data) setClients(data);
  };

  const fetchClientAquariums = async (clientId: string) => {
    const { data } = await supabase
      .from('client_aquariums')
      .select('*')
      .eq('client_id', clientId);
    
    if (data) setClientAquariums(data);
  };

  // Navegação do calendário
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay();
    const days: (number | null)[] = [];
    
    // Dias em branco antes do mês
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
    
    return days;
  };

  // Visitas de um dia específico
  const getVisitsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return visits.filter(v => v.scheduled_date === dateStr);
  };

  // Abrir modal para nova visita
  const openNewVisit = (date?: string) => {
    setEditingVisit(null);
    setClientAquariums([]);
    setForm({
      client_id: '',
      aquarium_id: '',
      scheduled_date: date || new Date().toISOString().split('T')[0],
      scheduled_time: '09:00',
      duration_minutes: '60',
      type: 'Manutenção Geral',
      notes: '',
      cost: ''
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const openEditVisit = (visit: MaintenanceVisit) => {
    setEditingVisit(visit);
    fetchClientAquariums(visit.client_id);
    setForm({
      client_id: visit.client_id,
      aquarium_id: visit.aquarium_id || '',
      scheduled_date: visit.scheduled_date,
      scheduled_time: visit.scheduled_time || '09:00',
      duration_minutes: visit.duration_minutes.toString(),
      type: visit.type,
      notes: visit.notes || '',
      cost: visit.cost?.toString() || ''
    });
    setIsModalOpen(true);
  };

  // Salvar visita
  const saveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const visitData = {
        store_user_id: userId,
        client_id: form.client_id,
        aquarium_id: form.aquarium_id || null,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        duration_minutes: parseInt(form.duration_minutes),
        type: form.type,
        notes: form.notes || null,
        cost: form.cost ? parseFloat(form.cost) : null
      };

      if (editingVisit) {
        const { error } = await supabase
          .from('maintenance_visits')
          .update(visitData)
          .eq('id', editingVisit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('maintenance_visits')
          .insert([visitData]);
        if (error) throw error;
      }

      await fetchVisits();
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
    setSaving(false);
  };

  // Atualizar status
  const updateStatus = async (visitId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'concluida') {
      updates.completed_at = new Date().toISOString();
    }

    await supabase
      .from('maintenance_visits')
      .update(updates)
      .eq('id', visitId);
    
    await fetchVisits();
  };

  // Excluir visita
  const deleteVisit = async (id: string) => {
    if (!confirm('Excluir esta visita?')) return;
    
    await supabase.from('maintenance_visits').delete().eq('id', id);
    await fetchVisits();
  };

  // Formatar mês/ano
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  // Estatísticas do mês
  const stats = {
    total: visits.length,
    agendadas: visits.filter(v => v.status === 'agendada' || v.status === 'confirmada').length,
    concluidas: visits.filter(v => v.status === 'concluida').length,
    faturamento: visits.filter(v => v.status === 'concluida').reduce((sum, v) => sum + (v.cost || 0), 0)
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Calendar className="text-[#4fb7b3]" />
            Agenda de Manutenções
          </h1>
          <p className="text-slate-400">Gerencie suas visitas e manutenções agendadas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20"
          >
            {viewMode === 'calendar' ? '📋 Lista' : '📅 Calendário'}
          </button>
          <button
            onClick={() => openNewVisit()}
            className="flex items-center gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> Nova Visita
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Total do mês</p>
        </div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.agendadas}</p>
          <p className="text-xs text-slate-400">Agendadas</p>
        </div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-emerald-400">{stats.concluidas}</p>
          <p className="text-xs text-slate-400">Concluídas</p>
        </div>
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4">
          <p className="text-2xl font-bold text-[#4fb7b3]">
            R$ {stats.faturamento.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs text-slate-400">Faturamento</p>
        </div>
      </div>

      {/* Navegação do Calendário */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg">
            <ChevronLeft className="text-slate-400" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg">
            <ChevronRight className="text-slate-400" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
        >
          Hoje
        </button>
      </div>

      {/* Calendário */}
      {viewMode === 'calendar' ? (
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl overflow-hidden">
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 bg-black/30">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold text-slate-400 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Grid dos dias */}
          <div className="grid grid-cols-7">
            {generateCalendarDays().map((day, index) => {
              const dayVisits = day ? getVisitsForDay(day) : [];
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] border-t border-r border-white/5 p-2 ${
                    day === null ? 'bg-black/20' : 'hover:bg-white/5 cursor-pointer'
                  }`}
                  onClick={() => day && openNewVisit(
                    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  )}
                >
                  {day && (
                    <>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                        isToday(day)
                          ? 'bg-[#4fb7b3] text-black font-bold'
                          : 'text-slate-300'
                      }`}>
                        {day}
                      </span>
                      
                      <div className="mt-1 space-y-1">
                        {dayVisits.slice(0, 3).map(visit => (
                          <button
                            key={visit.id}
                            onClick={(e) => { e.stopPropagation(); openEditVisit(visit); }}
                            className={`w-full text-left text-xs p-1 rounded truncate ${
                              VISIT_STATUS[visit.status as keyof typeof VISIT_STATUS]?.color || 'bg-white/10 text-white'
                            }`}
                          >
                            {visit.scheduled_time?.slice(0, 5)} {visit.client?.name}
                          </button>
                        ))}
                        {dayVisits.length > 3 && (
                          <span className="text-xs text-slate-500">+{dayVisits.length - 3} mais</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Visualização em Lista */
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Nenhuma visita neste mês</div>
          ) : (
            visits.map(visit => (
              <div
                key={visit.id}
                className="bg-[#1a1b3b]/60 border border-white/10 rounded-lg p-4 flex justify-between items-center hover:border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {new Date(visit.scheduled_date + 'T00:00:00').getDate()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {monthNames[new Date(visit.scheduled_date + 'T00:00:00').getMonth()].slice(0, 3)}
                    </p>
                  </div>
                  
                  <div className="border-l border-white/10 pl-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        VISIT_STATUS[visit.status as keyof typeof VISIT_STATUS]?.color
                      }`}>
                        {VISIT_STATUS[visit.status as keyof typeof VISIT_STATUS]?.label}
                      </span>
                      <span className="text-sm text-slate-400">
                        <Clock size={12} className="inline mr-1" />
                        {visit.scheduled_time?.slice(0, 5)}
                      </span>
                    </div>
                    <h3 className="font-bold text-white mt-1">
                      <User size={14} className="inline mr-1 text-[#4fb7b3]" />
                      {visit.client?.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {visit.type}
                      {visit.aquarium && ` • ${visit.aquarium.name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {visit.cost && (
                    <span className="text-sm text-[#4fb7b3] font-bold">
                      R$ {visit.cost.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  
                  {visit.status !== 'concluida' && visit.status !== 'cancelada' && (
                    <button
                      onClick={() => updateStatus(visit.id, 'concluida')}
                      className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/30"
                      title="Marcar como concluída"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => openEditVisit(visit)}
                    className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    onClick={() => deleteVisit(visit.id)}
                    className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Visita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white">
                {editingVisit ? 'Editar Visita' : 'Nova Visita'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={saveVisit} className="p-6 space-y-4">
              {/* Cliente */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Cliente *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={e => {
                    setForm({...form, client_id: e.target.value, aquarium_id: ''});
                    if (e.target.value) fetchClientAquariums(e.target.value);
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Aquário (opcional) */}
              {clientAquariums.length > 0 && (
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Aquário</label>
                  <select
                    value={form.aquarium_id}
                    onChange={e => setForm({...form, aquarium_id: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  >
                    <option value="">Todos os aquários</option>
                    {clientAquariums.map(aq => (
                      <option key={aq.id} value={aq.id}>{aq.name} ({aq.tank_type})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Data *</label>
                  <input
                    type="date"
                    required
                    value={form.scheduled_date}
                    onChange={e => setForm({...form, scheduled_date: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Hora *</label>
                  <input
                    type="time"
                    required
                    value={form.scheduled_time}
                    onChange={e => setForm({...form, scheduled_time: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tipo e Duração */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Tipo de Serviço</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Duração (min)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={e => setForm({...form, duration_minutes: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cost}
                  onChange={e => setForm({...form, cost: e.target.value})}
                  placeholder="0,00"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  rows={3}
                  placeholder="Detalhes do serviço..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none resize-none"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaManutencoes;
