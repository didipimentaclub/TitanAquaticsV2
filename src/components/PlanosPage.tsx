
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Store, X } from 'lucide-react';
import { PLANS, PlanInfo, SubscriptionTier } from '../types';

interface PlanosPageProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (plan: SubscriptionTier) => void;
}

const PlanosPage: React.FC<PlanosPageProps> = ({ currentTier, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'hobby': return <Star size={24} />;
      case 'pro': return <Zap size={24} />;
      case 'master': return <Crown size={24} />;
      case 'lojista': return <Store size={24} />;
      default: return <Star size={24} />;
    }
  };

  const getPrice = (plan: PlanInfo) => {
    if (plan.price === 0) return 'Grátis';
    const price = billingCycle === 'yearly' ? plan.priceYearly / 12 : plan.price;
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const getSavings = (plan: PlanInfo) => {
    if (plan.price === 0) return null;
    const monthlyTotal = plan.price * 12;
    const savings = monthlyTotal - plan.priceYearly;
    const percent = Math.round((savings / monthlyTotal) * 100);
    return percent > 0 ? `Economize ${percent}%` : null;
  };

  const handleSelectPlan = (planId: SubscriptionTier) => {
    if (planId === currentTier) return;
    setSelectedPlan(planId);
    setShowConfirmModal(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-heading font-bold text-white mb-4">Escolha seu Plano</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Desbloqueie todo o potencial do Titan Aquatics.</p>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Mensal</span>
          <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-[#4fb7b3]' : 'bg-slate-600'}`}>
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>Anual</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map(plan => {
          const isCurrentPlan = plan.id === currentTier;
          return (
            <div key={plan.id} className={`relative rounded-2xl border p-6 transition-all ${plan.highlighted ? 'border-[#4fb7b3] bg-[#4fb7b3]/10 scale-105' : 'border-white/10 bg-[#1a1b3b]/60'} ${isCurrentPlan ? 'ring-2 ring-[#4fb7b3]' : ''}`}>
              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-full mb-3 ${plan.highlighted ? 'bg-[#4fb7b3]/20 text-[#4fb7b3]' : 'bg-white/10 text-white'}`}>{getPlanIcon(plan.id)}</div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
              </div>
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1"><span className="text-3xl font-bold text-white">{getPrice(plan)}</span>{plan.price > 0 && <span className="text-slate-400">/mês</span>}</div>
                {billingCycle === 'yearly' && getSavings(plan) && <span className="text-xs text-emerald-400">{getSavings(plan)}</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (<li key={i} className="flex items-start gap-2 text-sm"><Check size={16} className="text-[#4fb7b3] mt-0.5 flex-shrink-0" /><span className="text-slate-300">{feature}</span></li>))}
              </ul>
              <button onClick={() => handleSelectPlan(plan.id)} disabled={isCurrentPlan} className={`w-full py-3 rounded-lg font-bold transition-colors ${isCurrentPlan ? 'bg-white/10 text-slate-400 cursor-not-allowed' : plan.highlighted ? 'bg-[#4fb7b3] text-black hover:bg-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isCurrentPlan ? 'Plano Atual' : 'Selecionar'}
              </button>
            </div>
          );
        })}
      </div>

      {showConfirmModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b3b] border border-white/10 rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Seleção</h2>
            <p className="text-slate-300 mb-6">Entre em contato para ativar o plano <strong className="text-[#4fb7b3]">{PLANS.find(p => p.id === selectedPlan)?.name}</strong>.</p>
            <a href="https://wa.me/5511999999999" target="_blank" className="block w-full py-3 bg-[#4fb7b3] text-black font-bold text-center rounded-lg hover:bg-white">Falar no WhatsApp</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanosPage;
