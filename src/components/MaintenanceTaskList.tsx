// @ts-nocheck
import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Trash2, Plus, Calendar } from 'lucide-react';
import { MaintenanceTask, Aquarium } from '../types';
import { formatDate } from '../utils/helpers';

interface MaintenanceTaskListProps {
  tasks: MaintenanceTask[];
  aquariums: Aquarium[];
  onComplete: (id: string, status: boolean) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
}

export const MaintenanceTaskList: React.FC<MaintenanceTaskListProps> = ({ 
  tasks, aquariums, onComplete, onDelete, onAddClick 
}) => {
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  
  const filteredTasks = tasks.filter(t => filter === 'all' || !t.is_completed);

  return (
    <div className="bg-[#1a1b3b] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="text-[#4fb7b3]" size={20} />
                Manutenção
            </h3>
            <button 
                onClick={onAddClick}
                className="p-2 bg-white/5 hover:bg-[#4fb7b3]/20 hover:text-[#4fb7b3] rounded-lg transition-colors"
                title="Nova Tarefa"
            >
                <Plus size={16} />
            </button>
        </div>

        <div className="flex gap-2 mb-4">
             <button onClick={() => setFilter('pending')} className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${filter === 'pending' ? 'bg-[#4fb7b3] text-black' : 'text-slate-500 hover:text-white'}`}>Pendentes</button>
             <button onClick={() => setFilter('all')} className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${filter === 'all' ? 'bg-[#4fb7b3] text-black' : 'text-slate-500 hover:text-white'}`}>Todas</button>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                    Nenhuma tarefa encontrada.
                </div>
            ) : (
                filteredTasks.map(task => {
                    const isOverdue = !task.is_completed && new Date(task.scheduled_date) < new Date(new Date().setHours(0,0,0,0));
                    const tankName = aquariums.find(a => a.id === task.aquarium_id)?.name || 'Geral';

                    return (
                        <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${task.is_completed ? 'bg-white/5 border-transparent opacity-50' : isOverdue ? 'bg-rose-500/10 border-rose-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                            <button onClick={() => onComplete(task.id, !task.is_completed)} className="flex-shrink-0">
                                {task.is_completed ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className={`w-5 h-5 ${isOverdue ? 'text-rose-400' : 'text-slate-400 group-hover:text-[#4fb7b3]'}`} />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${task.is_completed ? 'line-through text-slate-500' : 'text-white'}`}>{task.title}</p>
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
                                    <span className="text-slate-500">{tankName}</span>
                                    <span className="text-slate-600">•</span>
                                    <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>{formatDate(task.scheduled_date)}</span>
                                </div>
                            </div>
                            <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};

interface NewTaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    aquariums: Aquarium[];
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ isOpen, onClose, onSubmit, aquariums }) => {
    const [formData, setFormData] = useState({
        title: '',
        aquarium_id: aquariums[0]?.id || '',
        scheduled_date: new Date().toISOString().split('T')[0],
        frequency: 'unica',
        type: 'TPA'
    });

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Nova Tarefa</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Título da Tarefa" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-[#4fb7b3] outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    <select className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-[#4fb7b3] outline-none" value={formData.aquarium_id} onChange={e => setFormData({...formData, aquarium_id: e.target.value})}>
                        {aquariums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input type="date" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-[#4fb7b3] outline-none" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} />
                    <select className="w-full bg-black/30 border border-white/10 rounded p-3 text-white focus:border-[#4fb7b3] outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="TPA">TPA</option>
                        <option value="Limpeza Filtro">Limpeza Filtro</option>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Teste Água">Teste Água</option>
                        <option value="Outro">Outro</option>
                    </select>
                    <div className="flex gap-2 pt-4">
                        <button onClick={onClose} className="flex-1 py-2 border border-white/10 rounded text-slate-300 hover:text-white">Cancelar</button>
                        <button onClick={() => { onSubmit(formData); onClose(); }} className="flex-1 py-2 bg-[#4fb7b3] text-black font-bold rounded hover:bg-white">Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}