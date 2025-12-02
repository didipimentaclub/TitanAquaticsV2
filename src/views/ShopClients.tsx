
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, FileText, Edit2, Trash2, Droplets } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { StoreClient } from '../types';
import { useAuth } from '../context/AuthContext';

const ShopClients: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<StoreClient | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', aquarium_type: 'Doce', notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if(!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('store_clients')
      .select('*')
      .eq('shopkeeper_id', user.id)
      .order('created_at', { ascending: false });
    
    if(!error) setClients(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) return;

    if (editingClient) {
      await supabase.from('store_clients').update(formData).eq('id', editingClient.id);
    } else {
      await supabase.from('store_clients').insert([{ ...formData, shopkeeper_id: user.id }]);
    }
    
    fetchClients();
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', aquarium_type: 'Doce', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Remover cliente?")) return;
    await supabase.from('store_clients').delete().eq('id', id);
    fetchClients();
  };

  const openEdit = (client: StoreClient) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      aquarium_type: client.aquarium_type || 'Doce',
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white mb-1">Meus Clientes</h2>
          <p className="text-slate-400 text-sm">CRM simplificado para gestão de aquaristas.</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', aquarium_type: 'Doce', notes: '' }); setIsModalOpen(true); }}
          className="bg-[#4fb7b3] text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1b3b]/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando carteira de clientes...</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1b3b]/20 rounded-2xl border border-dashed border-white/10">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-[#1a1b3b] border border-white/5 rounded-xl p-6 hover:border-[#4fb7b3]/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-full text-[#4fb7b3] font-heading font-bold text-xl">
                  {client.name.charAt(0)}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(client)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{client.name}</h3>
              <div className="space-y-2 text-sm text-slate-400">
                {client.phone && <div className="flex items-center gap-2"><Phone size={14}/> {client.phone}</div>}
                {client.email && <div className="flex items-center gap-2"><Mail size={14}/> {client.email}</div>}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <Droplets size={14} className="text-[#4fb7b3]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-300">Perfil: {client.aquarium_type}</span>
                </div>
                {client.notes && (
                  <div className="mt-2 bg-black/20 p-2 rounded text-xs italic text-slate-500">
                    "{client.notes}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input required placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#4fb7b3]" />
              <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#4fb7b3]" />
              <input placeholder="Telefone / WhatsApp" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#4fb7b3]" />
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Aquário Principal</label>
                <select value={formData.aquarium_type} onChange={e => setFormData({...formData, aquarium_type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#4fb7b3] mt-1">
                  <option>Doce</option>
                  <option>Marinho</option>
                  <option>Plantado</option>
                  <option>Jumbo</option>
                  <option>Reef</option>
                </select>
              </div>

              <textarea placeholder="Notas sobre o cliente..." rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#4fb7b3]" />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold hover:bg-white/5">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopClients;
