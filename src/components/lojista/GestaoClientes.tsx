
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Save, ChevronRight, Fish } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { StoreClient, ClientAquarium, TankType } from '../../types';

interface GestaoClientesProps { userId: string; }
const TANK_TYPES: TankType[] = ['Doce', 'Marinho', 'Reef', 'Plantado', 'Jumbo'];

const GestaoClientes: React.FC<GestaoClientesProps> = ({ userId }) => {
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<StoreClient | null>(null);
  const [clientAquariums, setClientAquariums] = useState<ClientAquarium[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAquariumModalOpen, setIsAquariumModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<StoreClient | null>(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [aquariumForm, setAquariumForm] = useState({ name: '', volume_liters: '', tank_type: 'Doce', location: '', notes: '' });

  useEffect(() => { fetchClients(); }, [userId]);
  useEffect(() => { if (selectedClient) fetchClientAquariums(selectedClient.id); }, [selectedClient]);

  const fetchClients = async () => {
    const { data } = await supabase.from('store_clients').select('*').eq('store_user_id', userId).order('name');
    if (data) setClients(data);
  };

  const fetchClientAquariums = async (clientId: string) => {
    const { data } = await supabase.from('client_aquariums').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (data) setClientAquariums(data);
  };

  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...clientForm, store_user_id: userId };
    if (editingClient) await supabase.from('store_clients').update(payload).eq('id', editingClient.id);
    else await supabase.from('store_clients').insert([payload]);
    fetchClients(); setIsClientModalOpen(false);
  };

  const saveAquarium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const payload = { ...aquariumForm, client_id: selectedClient.id, store_user_id: userId };
    await supabase.from('client_aquariums').insert([payload]);
    fetchClientAquariums(selectedClient.id); setIsAquariumModalOpen(false);
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-white flex gap-3"><Users className="text-[#4fb7b3]" /> Gestão de Clientes</h1>
        <button onClick={() => { setEditingClient(null); setClientForm({ name: '', email: '', phone: '', address: '', notes: '' }); setIsClientModalOpen(true); }} className="flex gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold"><Plus size={18} /> Novo Cliente</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10"><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar cliente..." className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4fb7b3]" /></div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
              <button key={client.id} onClick={() => setSelectedClient(client)} className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedClient?.id === client.id ? 'bg-[#4fb7b3]/20 border-[#4fb7b3]' : 'bg-transparent border-white/10 hover:bg-white/5'}`}>
                <h3 className="font-bold text-white">{client.name}</h3>
                {client.phone && <p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><Phone size={12} /> {client.phone}</p>}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 overflow-y-auto">
          {selectedClient ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2><div className="flex gap-4 mt-2 text-sm text-slate-400">{selectedClient.phone && <span>📞 {selectedClient.phone}</span>}{selectedClient.email && <span>✉️ {selectedClient.email}</span>}</div></div>
                <button onClick={() => { if(confirm('Excluir cliente?')) { supabase.from('store_clients').delete().eq('id', selectedClient.id).then(() => { setSelectedClient(null); fetchClients(); }); } }} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded"><Trash2 size={20}/></button>
              </div>
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between mb-4"><h3 className="text-lg font-bold text-white flex gap-2"><Fish className="text-[#4fb7b3]" /> Aquários</h3><button onClick={() => { setAquariumForm({ name: '', volume_liters: '', tank_type: 'Doce', location: '', notes: '' }); setIsAquariumModalOpen(true); }} className="px-3 py-1 bg-[#4fb7b3]/20 text-[#4fb7b3] rounded font-bold text-sm">+ Adicionar</button></div>
                <div className="space-y-3">{clientAquariums.map(aq => (<div key={aq.id} className="bg-black/30 p-4 rounded-lg flex justify-between"><div><h4 className="font-bold text-white">{aq.name}</h4><div className="text-sm text-slate-400 mt-1">{aq.volume_liters}L • {aq.tank_type}</div></div></div>))}</div>
              </div>
            </>
          ) : <div className="h-full flex items-center justify-center text-slate-500">Selecione um cliente para ver detalhes</div>}
        </div>
      </div>

      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1b3b] p-6 rounded-xl w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Novo Cliente</h2>
            <form onSubmit={saveClient} className="space-y-4">
              <input required placeholder="Nome" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <input placeholder="Email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <input placeholder="Telefone" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsClientModalOpen(false)} className="flex-1 py-2 border border-white/10 rounded text-slate-300">Cancelar</button><button type="submit" className="flex-1 py-2 bg-[#4fb7b3] rounded text-black font-bold">Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {isAquariumModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1b3b] p-6 rounded-xl w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Novo Aquário</h2>
            <form onSubmit={saveAquarium} className="space-y-4">
              <input required placeholder="Nome do Aquário" value={aquariumForm.name} onChange={e => setAquariumForm({...aquariumForm, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <input type="number" placeholder="Volume (L)" value={aquariumForm.volume_liters} onChange={e => setAquariumForm({...aquariumForm, volume_liters: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" />
              <select value={aquariumForm.tank_type} onChange={e => setAquariumForm({...aquariumForm, tank_type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded p-2 text-white">{TANK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsAquariumModalOpen(false)} className="flex-1 py-2 border border-white/10 rounded text-slate-300">Cancelar</button><button type="submit" className="flex-1 py-2 bg-[#4fb7b3] rounded text-black font-bold">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoClientes;
