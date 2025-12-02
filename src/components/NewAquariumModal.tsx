import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fish } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TankType, SUBSCRIPTION_LIMITS } from '../types';

interface NewAquariumModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userTier: 'hobby' | 'pro' | 'master';
  currentAquariumCount: number;
  onSuccess: () => void;
}

const TANK_TYPES: TankType[] = ['Doce', 'Marinho', 'Reef', 'Plantado', 'Jumbo'];

export const NewAquariumModal: React.FC<NewAquariumModalProps> = ({
  isOpen, onClose, userId, userTier, currentAquariumCount, onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    volume_liters: '',
    sump_volume_liters: '',
    tank_type: 'Doce' as TankType,
    setup_date: new Date().toISOString().split('T')[0],
    fauna: '',
    equipment: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxAllowed = SUBSCRIPTION_LIMITS[userTier]?.maxAquariums || 1;
  const canAddMore = currentAquariumCount < maxAllowed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddMore) {
      setError(`Seu plano ${userTier} permite apenas ${maxAllowed} aquário(s). Faça upgrade para adicionar mais.`);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('aquariums').insert([{
        user_id: userId,
        name: formData.name,
        volume_liters: parseFloat(formData.volume_liters) || 0,
        sump_volume_liters: formData.sump_volume_liters ? parseFloat(formData.sump_volume_liters) : null,
        tank_type: formData.tank_type,
        setup_date: formData.setup_date || null,
        fauna: formData.fauna || null,
        equipment: formData.equipment || null,
        notes: formData.notes || null
      }]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setFormData({
        name: '', volume_liters: '', sump_volume_liters: '', tank_type: 'Doce',
        setup_date: new Date().toISOString().split('T')[0], fauna: '', equipment: '', notes: ''
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar aquário');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="fixed inset-0" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Fish className="text-[#4fb7b3]" size={24} />
              <h2 className="text-xl font-bold text-white">Novo Aquário</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!canAddMore && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-amber-200 text-sm">
                ⚠️ Você atingiu o limite de {maxAllowed} aquário(s) do plano {userTier}. 
                <button className="underline ml-1 text-[#4fb7b3]">Fazer upgrade</button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4fb7b3] uppercase">Nome do Aquário *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Reef Principal, Plantado Sala..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Volume (L) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.volume_liters}
                  onChange={e => setFormData(prev => ({ ...prev, volume_liters: e.target.value }))}
                  placeholder="100"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Sump (L)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sump_volume_liters}
                  onChange={e => setFormData(prev => ({ ...prev, sump_volume_liters: e.target.value }))}
                  placeholder="30"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Tipo *</label>
                <select
                  value={formData.tank_type}
                  onChange={e => setFormData(prev => ({ ...prev, tank_type: e.target.value as TankType }))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                >
                  {TANK_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Data de Montagem</label>
                <input
                  type="date"
                  value={formData.setup_date}
                  onChange={e => setFormData(prev => ({ ...prev, setup_date: e.target.value }))}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4fb7b3] uppercase">Fauna (peixes, corais, etc.)</label>
              <textarea
                value={formData.fauna}
                onChange={e => setFormData(prev => ({ ...prev, fauna: e.target.value }))}
                placeholder="Ex: 2x Neon, 1x Betta, 3x Corydora..."
                rows={2}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#4fb7b3] uppercase">Equipamentos</label>
              <textarea
                value={formData.equipment}
                onChange={e => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                placeholder="Ex: Filtro Canister, LED 50W, Termostato..."
                rows={2}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none resize-none"
              />
            </div>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/30 rounded-lg p-3 text-rose-200 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !canAddMore}
                className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Criar Aquário'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};