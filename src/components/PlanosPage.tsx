
import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Store } from 'lucide-react';
import { SubscriptionTier } from '../types';

interface PlanosPageProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (plan: string) => void;
}

const PLANS = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 0,
    description: 'Para iniciantes',
    icon: Star,
    features: ['1 aquário', 'Dashboard básico', 'Eventos', 'Calculadoras básicas'],
    color: 'slate'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24.90,
    description: 'Para entusiastas',
    icon: Zap,
    features: ['Até 5 aquários', 'Modo Viagem', 'Histórico completo', 'Gráficos de evolução', 'Suporte prioritário'],
    color: 'cyan',
    popular: true
  },
  {
    id: 'master',
    name: 'Master',
    price: 49.90,
    description: 'Para avançados',
    icon: Crown,
    features: ['Aquários ilimitados', 'Tudo do Pro', 'IA para diagnóstico', 'Alertas WhatsApp', 'Acesso antecipado'],
    color: 'amber'
  },
  {
    id: 'lojista',
    name: 'Lojista',
    price: 99.90,
    description: 'Para profissionais',
    icon: Store,
    features: ['Tudo do Master', 'Gestão de clientes', 'Agenda de visitas', 'Relatórios PDF', 'Multi-usuário (em breve)'],
    color: 'purple'
  }
];

const PlanosPage: React.FC<PlanosPageProps> = ({ currentTier, onSelectPlan }) => {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
          Escolha seu Plano
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Desbloqueie todo o potencial do Titan Aquatics
        </p>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentTier;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-5 md:p-6 transition-all ${
                plan.popular
                  ? 'border-[#4fb7b3] bg-[#4fb7b3]/10 scale-105'
                  : 'border-white/10 bg-[#1a1b3b]/60 hover:border-white/20'
              } ${isCurrentPlan ? 'ring-2 ring-[#4fb7b3]' : ''}`}
            >
              {/* Badge Popular */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4fb7b3] text-black">
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Ícone e Nome */}
              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-full mb-3 ${
                  plan.popular ? 'bg-[#4fb7b3]/20 text-[#4fb7b3]' : 'bg-white/10 text-white'
                }`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
              </div>

              {/* Preço */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-white">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                  </span>
                  {plan.price > 0 && <span className="text-slate-400">/mês</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-[#4fb7b3] mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Botão */}
              <button
                onClick={() => {
                  if (!isCurrentPlan) {
                    // Abrir WhatsApp para contato
                    const msg = `Olá! Quero assinar o plano ${plan.name} do Titan Aquatics`;
                    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
                  }
                }}
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  isCurrentPlan
                    ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-[#4fb7b3] text-black hover:bg-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isCurrentPlan ? '✓ Plano Atual' : 'Assinar'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 md:mt-12 p-6 bg-[#1a1b3b]/40 rounded-xl border border-white/5">
        <p className="text-slate-400">
          🔒 Pagamento seguro • 💳 Cancele quando quiser • 📧 Suporte em português
        </p>
      </div>
    </div>
  );
};

export default PlanosPage;
