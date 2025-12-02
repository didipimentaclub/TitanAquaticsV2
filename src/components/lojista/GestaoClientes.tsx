import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X, Save, ChevronRight, Fish } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { StoreClient, ClientAquarium, TankType } from '../../types';

interface GestaoClientesProps {
  userId: string;
}

const TANK_TYPES: TankType[] = ['Doce', 'Marinho', 'Reef', 'Plantado', 'Jumbo'];

const GestaoClientes: React.FC<GestaoClientesProps> = ({ userId }) => {
  const [clients, setClients] = useState<StoreClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<StoreClient | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Visualização de cliente
  const [selectedClient, setSelectedClient] = useState<StoreClient | null>(null);
  const [clientAquariums, setClientAquariums] = useState<ClientAquarium[]>([]);
  
  // Modal de aquário
  const [isAquariumModalOpen, setIsAquariumModalOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<ClientAquarium | null>(null);

  // Form do cliente
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Form do aquário
  const [aquariumForm, setAquariumForm] = useState({
    name: '',
    volume_liters: '',
    tank_type: 'Doce',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, [userId]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientAquariums(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_clients')
      .select('*')
      .eq('store_user_id', userId)
      .order('name');
    
    if (data) {
      // Buscar contagem de aquários para cada cliente
      const clientsWithCount = await Promise.all(
        data.map(async (client) => {
          const { count } = await supabase
            .from('client_aquariums')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);
          
          return { ...client, aquariums_count: count || 0 };
        })
      );
      setClients(clientsWithCount);
    }
    setLoading(false);
  };

  const fetchClientAquariums = async (clientId: string) => {
    const { data } = await supabase
      .from('client_aquariums')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (data) setClientAquariums(data);
  };

  // Filtrar clientes pela busca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  // Abrir modal para novo cliente
  const openNewClient = () => {
    setEditingClient(null);
    setClientForm({ name: '', email: '', phone: '', address: '', notes: '' });
    setIsClientModalOpen(true);
  };

  // Abrir modal para editar cliente
  const openEditClient = (client: StoreClient) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsClientModalOpen(true);
  };

  // Salvar cliente
  const saveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const clientData = {
        store_user_id: userId,
        name: clientForm.name,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
        address: clientForm.address || null,
        notes: clientForm.notes || null,
        updated_at: new Date().toISOString()
      };

      if (editingClient) {
        const { error } = await supabase
          .from('store_clients')
          .update(clientData)
          .eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_clients')
          .insert([clientData]);
        if (error) throw error;
      }

      await fetchClients();
      setIsClientModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
    setSaving(false);
  };

  // Excluir cliente
  const deleteClient = async (id: string) => {
    if (!confirm('Excluir este cliente e todos os seus aquários?')) return;
    
    await supabase.from('store_clients').delete().eq('id', id);
    await fetchClients();
    if (selectedClient?.id === id) setSelectedClient(null);
  };

  // Abrir modal para novo aquário
  const openNewAquarium = () => {
    setEditingAquarium(null);
    setAquariumForm({ name: '', volume_liters: '', tank_type: 'Doce', location: '', notes: '' });
    setIsAquariumModalOpen(true);
  };

  // Abrir modal para editar aquário
  const openEditAquarium = (aquarium: ClientAquarium) => {
    setEditingAquarium(aquarium);
    setAquariumForm({
      name: aquarium.name,
      volume_liters: aquarium.volume_liters?.toString() || '',
      tank_type: (aquarium.tank_type as string) || 'Doce',
      location: aquarium.location || '',
      notes: aquarium.notes || ''
    });
    setIsAquariumModalOpen(true);
  };

  // Salvar aquário
  const saveAquarium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSaving(true);

    try {
      const aquariumData = {
        client_id: selectedClient.id,
        store_user_id: userId,
        name: aquariumForm.name,
        volume_liters: aquariumForm.volume_liters ? parseFloat(aquariumForm.volume_liters) : null,
        tank_type: aquariumForm.tank_type,
        location: aquariumForm.location || null,
        notes: aquariumForm.notes || null
      };

      if (editingAquarium) {
        const { error } = await supabase
          .from('client_aquariums')
          .update(aquariumData)
          .eq('id', editingAquarium.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_aquariums')
          .insert([aquariumData]);
        if (error) throw error;
      }

      await fetchClientAquariums(selectedClient.id);
      await fetchClients();
      setIsAquariumModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
    setSaving(false);
  };

  // Excluir aquário
  const deleteAquarium = async (id: string) => {
    if (!confirm('Excluir este aquário?')) return;
    
    await supabase.from('client_aquariums').delete().eq('id', id);
    if (selectedClient) await fetchClientAquariums(selectedClient.id);
    await fetchClients();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Users className="text-[#4fb7b3]" />
            Gestão de Clientes
          </h1>
          <p className="text-slate-400">Gerencie seus clientes e seus aquários</p>
        </div>
        <button
          onClick={openNewClient}
          className="flex items-center gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold hover:bg-white transition-colors"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1">
          {/* Busca */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:border-[#4fb7b3] focus:outline-none"
            />
          </div>

          {/* Lista */}
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Carregando...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </div>
            ) : (
              filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedClient?.id === client.id
                      ? 'bg-[#4fb7b3]/20 border-[#4fb7b3]'
                      : 'bg-[#1a1b3b]/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{client.name}</h3>
                      {client.phone && (
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <Phone size={12} /> {client.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 text-slate-300 px-2 py-1 rounded">
                        🐠 {client.aquariums_count || 0}
                      </span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detalhes do Cliente */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6">
              {/* Header do Cliente */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                    {selectedClient.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {selectedClient.email}
                      </span>
                    )}
                    {selectedClient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {selectedClient.phone}
                      </span>
                    )}
                    {selectedClient.address && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {selectedClient.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditClient(selectedClient)}
                    className="p-2 bg-white/10 rounded-lg text-white hover:bg-[#4fb7b3] hover:text-black transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteClient(selectedClient.id)}
                    className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-300">{selectedClient.notes}</p>
                </div>
              )}

              {/* Aquários do Cliente */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Fish className="text-[#4fb7b3]" />
                    Aquários ({clientAquariums.length})
                  </h3>
                  <button
                    onClick={openNewAquarium}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#4fb7b3]/20 text-[#4fb7b3] rounded-lg text-sm font-bold hover:bg-[#4fb7b3] hover:text-black transition-colors"
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>

                {clientAquariums.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-white/10 rounded-lg">
                    Nenhum aquário cadastrado para este cliente
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {clientAquariums.map(aquarium => (
                      <div
                        key={aquarium.id}
                        className="bg-black/30 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-bold text-white">{aquarium.name}</h4>
                          <div className="flex gap-3 text-sm text-slate-400 mt-1">
                            <span>📊 {aquarium.volume_liters || '?'}L</span>
                            <span>🏷️ {aquarium.tank_type}</span>
                            {aquarium.location && <span>📍 {aquarium.location}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditAquarium(aquarium)}
                            className="p-2 bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteAquarium(aquarium.id)}
                            className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-xl p-6 flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center text-slate-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Selecione um cliente para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsClientModalOpen(false)} />
          <div className="relative bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setIsClientModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={saveClient} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Nome *</label>
                <input
                  required
                  value={clientForm.name}
                  onChange={e => setClientForm({...clientForm, name: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Email</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={e => setClientForm({...clientForm, email: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Telefone</label>
                  <input
                    value={clientForm.phone}
                    onChange={e => setClientForm({...clientForm, phone: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Endereço</label>
                <input
                  value={clientForm.address}
                  onChange={e => setClientForm({...clientForm, address: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Observações</label>
                <textarea
                  value={clientForm.notes}
                  onChange={e => setClientForm({...clientForm, notes: e.target.value})}
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
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

      {/* Modal de Aquário */}
      {isAquariumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsAquariumModalOpen(false)} />
          <div className="relative bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingAquarium ? 'Editar Aquário' : 'Novo Aquário'}
              </h2>
              <button onClick={() => setIsAquariumModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={saveAquarium} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Nome *</label>
                <input
                  required
                  value={aquariumForm.name}
                  onChange={e => setAquariumForm({...aquariumForm, name: e.target.value})}
                  placeholder="Ex: Aquário da Sala"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Volume (L)</label>
                  <input
                    type="number"
                    value={aquariumForm.volume_liters}
                    onChange={e => setAquariumForm({...aquariumForm, volume_liters: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#4fb7b3] uppercase font-bold">Tipo</label>
                  <select
                    value={aquariumForm.tank_type}
                    onChange={e => setAquariumForm({...aquariumForm, tank_type: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                  >
                    {TANK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Localização</label>
                <input
                  value={aquariumForm.location}
                  onChange={e => setAquariumForm({...aquariumForm, location: e.target.value})}
                  placeholder="Ex: Sala de estar, Escritório..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#4fb7b3] uppercase font-bold">Observações</label>
                <textarea
                  value={aquariumForm.notes}
                  onChange={e => setAquariumForm({...aquariumForm, notes: e.target.value})}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAquariumModalOpen(false)}
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

export default GestaoClientes;