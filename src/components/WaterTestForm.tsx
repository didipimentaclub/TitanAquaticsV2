// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Beaker } from 'lucide-react';
import { Aquarium, TankType } from '../types';

interface WaterTestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  aquariums: Aquarium[];
}

const WaterTestForm: React.FC<WaterTestFormProps> = ({ isOpen, onClose, onSubmit, aquariums }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    aquarium_id: aquariums[0]?.id || '',
    temperature: '',
    ph: '',
    ammonia: '',
    nitrite: '',
    nitrate: '',
    alkalinity: '',
    calcium: '',
    magnesium: '',
    phosphate: '',
    salinity: '',
    measured_at: new Date().toISOString().slice(0, 16)
  });

  const selectedTank = aquariums.find(t => t.id === formData.aquarium_id);
  const isMarine = selectedTank?.type === 'Marinho' || selectedTank?.type === 'Reef';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean empty strings to null/undefined
    const cleanData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
    );

    await onSubmit(cleanData);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.95, opacity: 0 }} 
            className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
          >
            <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#4fb7b3]/20 rounded-lg text-[#4fb7b3]"><Beaker size={20} /></div>
                 <h2 className="text-xl font-heading font-bold text-white">Registrar Medição</h2>
              </div>
              <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Seleção de Aquário e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Aquário</label>
                        <select 
                            value={formData.aquarium_id} 
                            onChange={e => setFormData({...formData, aquarium_id: e.target.value})} 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white mt-1 focus:border-[#4fb7b3] outline-none"
                            required
                        >
                            <option value="" disabled>Selecione...</option>
                            {aquariums.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Data/Hora</label>
                        <input 
                            type="datetime-local" 
                            value={formData.measured_at} 
                            onChange={e => setFormData({...formData, measured_at: e.target.value})} 
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white mt-1 focus:border-[#4fb7b3] outline-none"
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5 w-full my-2" />

                {/* Parâmetros Básicos */}
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Parâmetros Básicos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Temp (°C)', key: 'temperature', ph: '26.5' },
                        { label: 'pH', key: 'ph', ph: '7.0' },
                        { label: 'Amônia (ppm)', key: 'ammonia', ph: '0.00' },
                        { label: 'Nitrito (ppm)', key: 'nitrite', ph: '0.00' },
                        { label: 'Nitrato (ppm)', key: 'nitrate', ph: '10' },
                    ].map(field => (
                        <div key={field.key}>
                            <label className="text-[10px] text-slate-400 uppercase font-bold">{field.label}</label>
                            <input 
                                type="number" step="0.01" 
                                value={formData[field.key as keyof typeof formData]} 
                                onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                                placeholder={field.ph}
                                className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 focus:border-[#4fb7b3] outline-none"
                            />
                        </div>
                    ))}
                </div>

                {isMarine && (
                    <>
                    <div className="h-px bg-white/5 w-full my-2" />
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Parâmetros Marinhos/Reef</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Salinidade (sg)', key: 'salinity', ph: '1.025' },
                            { label: 'Alcalinidade (dKH)', key: 'alkalinity', ph: '8.5' },
                            { label: 'Cálcio (ppm)', key: 'calcium', ph: '420' },
                            { label: 'Magnésio (ppm)', key: 'magnesium', ph: '1350' },
                            { label: 'Fosfato (ppm)', key: 'phosphate', ph: '0.03' },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="text-[10px] text-slate-400 uppercase font-bold">{field.label}</label>
                                <input 
                                    type="number" step="0.001" 
                                    value={formData[field.key as keyof typeof formData]} 
                                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                                    placeholder={field.ph}
                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 focus:border-blue-400 outline-none"
                                />
                            </div>
                        ))}
                    </div>
                    </>
                )}

                <div className="pt-4 flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20 flex items-center justify-center gap-2">
                        {loading ? 'Salvando...' : <><Save size={18} /> Salvar Registro</>}
                    </button>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WaterTestForm;