import React, { useState, useEffect } from 'react';
import { Plane, Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, TravelGuide } from '../types';

interface ModoViagemProps {
  userId: string;
  aquariums: Aquarium[];
}

export const ModoViagem: React.FC<ModoViagemProps> = ({ userId, aquariums }) => {
  const [guides, setGuides] = useState<TravelGuide[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    aquarium_id: '',
    start_date: '',
    end_date: '',
    feeding_instructions: '',
    dosing_instructions: '',
    emergency_instructions: '',
    general_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    fetchGuides();
  }, [userId]);

  const fetchGuides = async () => {
    const { data } = await supabase
      .from('travel_guides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setGuides(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('travel_guides').insert([{
      ...formData,
      user_id: userId,
      aquarium_id: formData.aquarium_id || null
    }]);
    if (!error) {
      fetchGuides();
      setIsCreating(false);
      setFormData({ title: '', aquarium_id: '', start_date: '', end_date: '', feeding_instructions: '', dosing_instructions: '', emergency_instructions: '', general_notes: '', emergency_contact_name: '', emergency_contact_phone: '' });
    }
  };

  const deleteGuide = async (id: string) => {
    if(!confirm("Excluir este guia?")) return;
    await supabase.from('travel_guides').delete().eq('id', id);
    fetchGuides();
  };

  const generatePDF = (guide: TravelGuide) => {
    const aquarium = aquariums.find(a => a.id === guide.aquarium_id);
    const content = `
GUIA DE CUIDADOS - MODO VIAGEM
==============================
${guide.title}
Período: ${guide.start_date} a ${guide.end_date}
${aquarium ? `Aquário: ${aquarium.name} (${aquarium.volume_liters}L - ${aquarium.tank_type})` : ''}

ALIMENTAÇÃO
-----------
${guide.feeding_instructions}

${guide.dosing_instructions ? `DOSAGEM\n-------\n${guide.dosing_instructions}\n` : ''}
${guide.emergency_instructions ? `EMERGÊNCIAS\n-----------\n${guide.emergency_instructions}\n` : ''}
${guide.general_notes ? `OBSERVAÇÕES\n-----------\n${guide.general_notes}\n` : ''}

CONTATO DE EMERGÊNCIA
---------------------
${guide.emergency_contact_name}: ${guide.emergency_contact_phone}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guia-viagem-${guide.title.replace(/\s+/g, '-')}.txt`;
    a.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Modo Viagem</h1>
          <p className="text-slate-400">Crie guias de cuidados para quando você estiver ausente.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white transition-colors"
        >
          <Plus size={20} /> Novo Guia
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 custom-scrollbar">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plane className="text-[#4fb7b3]" /> Novo Guia de Viagem
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                required
                placeholder="Título (ex: Viagem de Natal 2024)"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.aquarium_id}
                  onChange={e => setFormData({...formData, aquarium_id: e.target.value})}
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                >
                  <option value="">Todos os aquários</option>
                  {aquariums.map(aq => (
                    <option key={aq.id} value={aq.id}>{aq.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg px-2 py-3 text-white" />
                  <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="bg-black/30 border border-white/10 rounded-lg px-2 py-3 text-white" />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Instruções de Alimentação *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Alimentar 2x ao dia (manhã e noite). Uma pitada de ração. Não superalimentar..."
                  value={formData.feeding_instructions}
                  onChange={e => setFormData({...formData, feeding_instructions: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Dosagem (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Fertilizante 5ml/dia, CO2 ligado das 10h às 18h..."
                  value={formData.dosing_instructions}
                  onChange={e => setFormData({...formData, dosing_instructions: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Em caso de emergência</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Se a água ficar turva, fazer TPA de 20%. Se algum peixe parecer doente..."
                  value={formData.emergency_instructions}
                  onChange={e => setFormData({...formData, emergency_instructions: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Nome do contato de emergência"
                  value={formData.emergency_contact_name}
                  onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})}
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
                <input
                  placeholder="Telefone"
                  value={formData.emergency_contact_phone}
                  onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold hover:bg-white/5">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold hover:bg-white">Criar Guia</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {guides.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl bg-[#1a1b3b]/20">
          <Plane size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Nenhum guia de viagem</h3>
          <p className="text-slate-400">Crie um guia para deixar instruções quando viajar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map(guide => (
            <div key={guide.id} className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:border-[#4fb7b3]/30 transition-colors">
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{guide.title}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-2 mb-4">
                  <Calendar size={14} className="text-[#4fb7b3]" /> 
                  {new Date(guide.start_date).toLocaleDateString()} → {new Date(guide.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => generatePDF(guide)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-[#4fb7b3] hover:text-black transition-colors font-bold text-sm uppercase tracking-wider"
                >
                  <FileText size={16} /> Baixar
                </button>
                <button
                   onClick={() => deleteGuide(guide.id)}
                   className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                >
                   <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};