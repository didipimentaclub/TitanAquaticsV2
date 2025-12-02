
import React, { useState, useEffect } from 'react';
import { Plane, Calendar, Phone, FileText, Plus, Trash2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, TravelGuide, SubscriptionTier } from '../types';
// @ts-ignore
import { jsPDF } from 'jspdf';

interface ModoViagemProps {
  userId: string;
  aquariums?: Aquarium[];
  userTier?: SubscriptionTier;
}

export const ModoViagem: React.FC<ModoViagemProps> = ({ userId, aquariums: propAquariums, userTier = 'hobby' }) => {
  // BLOQUEIO INTERNO - Se for Hobby (e não admin/master, controlado via prop), mostra tela de bloqueio
  // Nota: A prop userTier passada pelo Dashboard já considera a lógica de admin
  if (userTier === 'hobby') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6 bg-[#1a1b3b]/20 border border-white/5 rounded-2xl">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 relative">
          <Lock size={40} className="text-amber-400" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping opacity-20"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Modo Viagem Premium</h2>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          Gere guias automáticos em PDF para cuidadores. Disponível a partir do plano <strong>Pro</strong>.
        </p>
        <button 
          onClick={() => window.location.href = '#planos'} // Ou usar um callback
          className="px-8 py-3 bg-gradient-to-r from-[#4fb7b3] to-emerald-500 text-black font-bold uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-[#4fb7b3]/20 transition-all hover:scale-105"
        >
          Fazer Upgrade
        </button>
      </div>
    );
  }

  const [guides, setGuides] = useState<TravelGuide[]>([]);
  const [aquariums, setAquariums] = useState<Aquarium[]>(propAquariums || []);
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
    if(userId) {
        fetchGuides();
        if (!propAquariums) fetchAquariums();
    }
  }, [userId, propAquariums]);

  const fetchGuides = async () => {
    const { data } = await supabase
      .from('travel_guides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setGuides(data);
  };

  const fetchAquariums = async () => {
    const { data } = await supabase.from('aquariums').select('*').eq('user_id', userId);
    if(data) setAquariums(data);
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
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("GUIA DE CUIDADOS - MODO VIAGEM", 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(guide.title, 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Período: ${new Date(guide.start_date).toLocaleDateString()} a ${new Date(guide.end_date).toLocaleDateString()}`, 20, 50);
    if(aquarium) doc.text(`Aquário: ${aquarium.name} (${aquarium.volume_liters}L)`, 20, 58);

    let y = 70;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text("ALIMENTAÇÃO", 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const feedLines = doc.splitTextToSize(guide.feeding_instructions, 170);
    doc.text(feedLines, 20, y + 8);
    y += 15 + (feedLines.length * 5);

    if(guide.dosing_instructions) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 150);
        doc.text("DOSAGEM & SUPLEMENTOS", 20, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        const doseLines = doc.splitTextToSize(guide.dosing_instructions, 170);
        doc.text(doseLines, 20, y + 8);
        y += 15 + (doseLines.length * 5);
    }

    if(guide.emergency_instructions) {
        doc.setFontSize(14);
        doc.setTextColor(150, 0, 0);
        doc.text("EMERGÊNCIAS", 20, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        const emergLines = doc.splitTextToSize(guide.emergency_instructions, 170);
        doc.text(emergLines, 20, y + 8);
        y += 15 + (emergLines.length * 5);
    }

    if(guide.general_notes) {
        doc.setFontSize(14);
        doc.text("OBSERVAÇÕES GERAIS", 20, y);
        doc.setFontSize(12);
        const noteLines = doc.splitTextToSize(guide.general_notes, 170);
        doc.text(noteLines, 20, y + 8);
        y += 15 + (noteLines.length * 5);
    }

    // Footer contact
    doc.setDrawColor(200);
    doc.line(20, 260, 190, 260);
    doc.setFontSize(10);
    doc.text(`Contato de Emergência: ${guide.emergency_contact_name} - ${guide.emergency_contact_phone}`, 105, 270, { align: 'center' });
    doc.text("Gerado por Titan Aquatics", 105, 275, { align: 'center' });

    doc.save(`guia-viagem-${guide.title.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white">Modo Viagem</h2>
          <p className="text-slate-400">Crie guias de cuidados para quando você estiver ausente.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white transition-colors text-xs uppercase tracking-widest"
        >
          <Plus size={16} /> Novo Guia
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
                  <FileText size={16} /> Baixar PDF
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
