// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Globe, Zap, Menu, X, Calendar, ChevronLeft, ChevronRight, Droplets, Activity, Fish, ShieldCheck, Plane, BookOpen, ChevronDown, CheckCircle, Info, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import FluidBackground from './FluidBackground';
import GradientText from './GlitchText';
import CustomCursor from './CustomCursor';
import AIChat from './AIChat';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { RippleButton } from './RippleButton';

// Types adapted for Features
interface Feature {
  id: string;
  name: string;
  category: string;
  tag: string;
  image: string;
  description: string;
  icon: any;
}

const FEATURES: Feature[] = [
  { 
    id: '1', 
    name: 'Dashboard Inteligente', 
    category: 'Monitoramento', 
    tag: 'LIVE', 
    // Optimized: w=640, q=75
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=75&w=640',
    description: 'Uma visão global da saúde do seu tanque. Status em tempo real do ciclo do nitrogênio, estabilidade da temperatura e próximas tarefas.',
    icon: Activity
  },
  { 
    id: '2', 
    name: 'Validador de Fauna', 
    category: 'Análise IA', 
    tag: 'IA', 
    // Replaced with underwater fish school image & Optimized
    image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&q=75&w=640',
    description: 'Evite agressão e estresse. Nossa IA analisa a compatibilidade das espécies, tamanho dos cardumes e capacidade de carga biológica por litro.',
    icon: Fish
  },
  { 
    id: '3', 
    name: 'Laboratório de Água', 
    category: 'Química', 
    tag: 'LAB', 
    // Optimized: w=640, q=75
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=75&w=640',
    description: 'Registre pH, amônia, nitrito e nitrato. Gráficos visuais rastreiam a estabilidade ao longo do tempo e alertam sobre picos perigosos.',
    icon: Droplets
  },
  { 
    id: '4', 
    name: 'Manutenção 2.0', 
    category: 'Agenda', 
    tag: 'TASK', 
    // Optimized: w=640, q=75
    image: 'https://images.unsplash.com/photo-1584621645331-c775a6669913?auto=format&fit=crop&q=75&w=640',
    description: 'Nunca perca uma TPA novamente. Agendamento inteligente para limpeza de filtro, dosagem e alimentação com rastreamento de sequência.',
    icon: Calendar
  },
  { 
    id: '5', 
    name: 'Modo Viagem', 
    category: 'Automação', 
    tag: 'AUTO', 
    // Optimized: w=640, q=75
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=75&w=640',
    description: 'Vai sair? Gere um guia PDF simplificado para quem vai cuidar do aquário, com dosagens exatas e contatos de emergência.',
    icon: Plane
  },
  { 
    id: '6', 
    name: 'Enciclopédia Titan', 
    category: 'Banco de Dados', 
    tag: 'DATA', 
    // Optimized: w=640, q=75
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&q=75&w=640',
    description: 'Banco de dados abrangente de peixes, plantas e corais. Filtre por dificuldade, temperamento e requisitos de água.',
    icon: BookOpen
  },
];

const FAQS = [
  { q: "Preciso ser um especialista para usar o Titan?", a: "De jeito nenhum. O Titan foi projetado para guiar iniciantes desde o primeiro dia, oferecendo também ferramentas de dados profundos para profissionais." },
  { q: "Funciona para aquários marinhos/reef?", a: "Sim. Oferecemos suporte para perfis de Água Doce (Plantado, Ciclídeos, Comunitário) e Água Salgada (FOWLR, Reef)." },
  { q: "Qual a diferença entre o plano Hobby e o Profissional?", a: "O Hobby foca em um único ecossistema, enquanto o Profissional permite múltiplos tanques e oferece ferramentas avançadas como Modo Viagem e Backup Nuvem." },
  { q: "Posso cancelar minha assinatura a qualquer momento?", a: "Sim, o cancelamento é simples e você mantém o acesso até o fim do período cobrado." },
];

const PLANS = [
  { 
    name: 'Hobby', 
    price: 'R$ 29,98', 
    period: '/mês',
    color: 'white', 
    accent: 'bg-white/5',
    features: [
      { text: '1 Aquário Ativo', detail: 'Gerenciamento completo de um único ecossistema.' },
      { text: 'Histórico de 30 Dias', detail: 'Acesse logs de parâmetros e manutenção do último mês.' },
      { text: 'Agendamento Básico', detail: 'Lembretes para TPA, alimentação e limpeza de filtro.' },
      { text: 'Acesso à Enciclopédia', detail: 'Banco de dados completo de peixes e plantas.' },
      { text: 'Titan Copilot (Standard)', detail: 'Assistente IA para dúvidas rápidas e diagnósticos simples.' }
    ]
  },
  { 
    name: 'Profissional', 
    price: 'R$ 49,98', 
    period: '/mês',
    color: 'teal', 
    accent: 'bg-[#4fb7b3]/10 border-[#4fb7b3]/50',
    features: [
      { text: 'Aquários Ilimitados', detail: 'Gerencie múltiplos tanques em um único painel.' },
      { text: 'Histórico Vitalício', detail: 'Armazenamento permanente de todos os seus dados.' },
      { text: 'Backup na Nuvem', detail: 'Segurança total dos seus registros e configurações.' },
      { text: 'Copilot IA Avançado', detail: 'Análises complexas, diagnósticos de doenças e sugestões de fauna.' },
      { text: 'Prioridade em Novos Recursos', detail: 'Acesso antecipado a ferramentas beta.' },
      { text: 'Modo Viagem', detail: 'Gere guias PDF automáticos para cuidadores quando você estiver fora.' }
    ]
  },
];

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const { user } = useAuth(); // Keeping user check just for header logic if needed, although mostly unused since App handles routing
  
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<number | null>(null);
  const [activePlanFeature, setActivePlanFeature] = useState<string | null>(null);
  const [isTaskAnimating, setIsTaskAnimating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFeature) return;
      if (e.key === 'ArrowLeft') navigateFeature('prev');
      if (e.key === 'ArrowRight') navigateFeature('next');
      if (e.key === 'Escape') setSelectedFeature(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFeature]);

  useEffect(() => {
    setIsTaskAnimating(false);
  }, [selectedFeature]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navigateFeature = (direction: 'next' | 'prev') => {
    if (!selectedFeature) return;
    const currentIndex = FEATURES.findIndex(f => f.id === selectedFeature.id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % FEATURES.length;
    } else {
      nextIndex = (currentIndex - 1 + FEATURES.length) % FEATURES.length;
    }
    setSelectedFeature(FEATURES[nextIndex]);
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleSimulateTask = () => {
    setIsTaskAnimating(true);
    setTimeout(() => setIsTaskAnimating(false), 2000);
  };
  
  return (
    <div className="relative min-h-screen text-white selection:bg-[#4fb7b3] selection:text-black cursor-auto md:cursor-none overflow-x-hidden">
      <CustomCursor />
      <FluidBackground />
      <AIChat />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8 py-6 mix-blend-difference">
        <div className="font-heading text-xl md:text-2xl font-bold tracking-tighter text-white cursor-default z-50 flex items-center gap-2">
           <span className="text-[#4fb7b3]">●</span> TITAN AQUATICS
        </div>
        
        <div className="hidden md:flex gap-10 text-sm font-bold tracking-widest uppercase items-center">
          {[
            { id: 'features', label: 'Recursos' },
            { id: 'solutions', label: 'Soluções' },
            { id: 'pricing', label: 'Planos' },
            { id: 'faq', label: 'FAQ' }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => scrollToSection(item.id)}
              className="hover:text-[#a8fbd3] transition-colors text-white cursor-pointer bg-transparent border-none"
              data-hover="true"
            >
              {item.label}
            </button>
          ))}
          
          <div className="flex gap-4 ml-4">
            <button 
              onClick={() => openAuth('login')}
              className="text-white hover:text-[#4fb7b3] transition-colors"
              data-hover="true"
            >
              Entrar
            </button>
            <RippleButton 
              onClick={() => openAuth('signup')}
              className="border border-white px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 text-white cursor-pointer bg-transparent"
              data-hover="true"
            >
              Começar
            </RippleButton>
          </div>
        </div>

        <button 
          className="md:hidden text-white z-50 relative w-10 h-10 flex items-center justify-center bg-transparent border-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#31326f]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {[
              { id: 'features', label: 'Recursos' },
              { id: 'solutions', label: 'Soluções' },
              { id: 'pricing', label: 'Planos' },
              { id: 'faq', label: 'FAQ' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-3xl font-heading font-bold text-white hover:text-[#a8fbd3] transition-colors uppercase bg-transparent border-none"
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex flex-col gap-4 mt-8 w-full px-8 max-w-sm">
              <RippleButton 
                onClick={() => openAuth('login')}
                className="w-full py-4 text-base font-bold tracking-widest uppercase text-white border border-white/20 hover:bg-white/10"
              >
                Entrar
              </RippleButton>
              <RippleButton 
                onClick={() => openAuth('signup')}
                className="w-full py-4 text-base font-bold tracking-widest uppercase bg-gradient-to-r from-[#4fb7b3] to-[#a8fbd3] text-[#05051a] shadow-lg hover:shadow-[#4fb7b3]/40 transition-all group"
                rippleColor="rgba(255,255,255,0.4)"
              >
                <span className="flex items-center justify-center gap-2">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform animate-pulse" />
                </span>
              </RippleButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      {/* Alterado de h-[100svh] fixo para min-h-[100svh] py-20 para permitir crescimento e evitar sobreposição */}
      <header className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        <motion.div 
          style={{ y, opacity }}
          className="z-10 text-center flex flex-col items-center w-full max-w-6xl pb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs md:text-sm font-mono text-[#a8fbd3] tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/5"
          >
            <span className="flex items-center gap-2"><Globe size={12}/> Monitoramento Global</span>
            <span className="hidden md:inline w-1.5 h-1.5 bg-[#4fb7b3] rounded-full animate-pulse"/>
            <span className="flex items-center gap-2"><Zap size={12}/> Inteligência Artificial</span>
          </motion.div>

          <div className="relative w-full flex flex-col justify-center items-center">
            <h1 className="text-[10vw] md:text-[8vw] leading-[0.9] font-black tracking-tighter text-center font-heading">
              AQUARISMO <br/>
              <GradientText text="DE PRECISÃO" />
            </h1>
            <motion.div 
               className="absolute -z-20 w-[50vw] h-[50vw] bg-[#4fb7b3]/10 blur-[60px] rounded-full pointer-events-none will-change-transform"
               animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
               transition={{ duration: 8, repeat: Infinity }}
               style={{ transform: 'translateZ(0)' }}
            />
          </div>
          
          <motion.div
             initial={{ scaleX: 0 }}
             animate={{ scaleX: 1 }}
             transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
             className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#4fb7b3]/50 to-transparent mt-4 md:mt-8 mb-6 md:mb-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-base md:text-xl font-light max-w-2xl mx-auto text-white/90 leading-relaxed drop-shadow-lg px-4 mb-8"
          >
            Monitore parâmetros da água, gerencie a vida no tanque e automatize a manutenção com ferramentas de laboratório precisas.
          </motion.p>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             className="flex gap-4"
          >
            <RippleButton 
              onClick={() => openAuth('signup')}
              className="px-8 py-4 bg-gradient-to-r from-[#4fb7b3] to-[#637ab9] hover:from-[#a8fbd3] hover:to-[#4fb7b3] text-[#05051a] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(79,183,179,0.3)] hover:shadow-[0_0_35px_rgba(79,183,179,0.6)] transition-all duration-300 group"
              data-hover="true"
              rippleColor="rgba(255,255,255,0.4)"
            >
              <span className="flex items-center gap-2">
                Começar Agora
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </span>
            </RippleButton>
            <RippleButton 
              onClick={() => openAuth('login')}
              className="px-8 py-4 border border-white/20 bg-black/30 backdrop-blur-md text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
              data-hover="true"
            >
              Entrar
            </RippleButton>
          </motion.div>
        </motion.div>

        {/* Faixa ECOSSISTEMA - Fluxo Relativo (não absoluto) para empurrar o conteúdo e não cobrir botões */}
        <div className="w-full px-4 md:px-6 mt-12 md:mt-16 z-20">
          <div className="relative max-w-6xl mx-auto border-y-4 border-black bg-white/90 shadow-[0_18px_0_rgba(0,0,0,1)]">
            <div className="relative flex items-center justify-center overflow-hidden">
              <motion.div
                className="flex items-center py-3 md:py-4 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                {/* Texto duplicado para loop perfeito */}
                {[0, 1].map((key) => (
                  <div key={key} className="flex whitespace-nowrap shrink-0">
                    <p className="text-xl md:text-2xl font-black tracking-[0.25em] uppercase px-4 text-black">
                      ECOSSISTEMA · TITAN AQUATICS · CONTROL · 
                    </p>
                    <p className="text-xl md:text-2xl font-black tracking-[0.25em] uppercase px-4 text-black">
                      ECOSSISTEMA · TITAN AQUATICS · CONTROL · 
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="relative z-10 py-20 md:py-32 bg-black/20 backdrop-blur-sm border-t border-white/10 overflow-hidden">
        <div className="absolute top-1/2 right-[-20%] w-[50vw] h-[50vw] bg-[#4fb7b3]/20 rounded-full blur-[40px] pointer-events-none will-change-transform" style={{ transform: 'translateZ(0)' }} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <h2 className="text-4xl md:text-7xl font-heading font-bold mb-6 md:mb-8 leading-tight">
                Para Todo <br/> <GradientText text="AQUARISTA" className="text-5xl md:text-7xl" />
              </h2>
              <p className="text-lg md:text-xl text-gray-200 mb-8 md:mb-12 font-light leading-relaxed drop-shadow-md">
                Seja combatendo algas em um aquário plantado ou mantendo a alcalinidade estável em um reef misto, o Titan se adapta às necessidades do seu ecossistema.
              </p>
              
              <div className="space-y-6 md:space-y-8">
                {[
                  { icon: ShieldCheck, title: 'Iniciantes e Hobbistas', desc: 'Evite a "Síndrome do Aquário Novo" e pare de adivinhar parâmetros.' },
                  { icon: Activity, title: 'Jumbo e Predadores', desc: 'Gerencie altas cargas biológicas e compatibilidade agressiva.' },
                  { icon: Droplets, title: 'Reef e Marinhos', desc: 'Registro de precisão para Cálcio, Alcalinidade e Magnésio.' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-6">
                    <div 
                      className="relative p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/5 cursor-help"
                      onMouseEnter={() => setHoveredSolution(i)}
                      onMouseLeave={() => setHoveredSolution(null)}
                    >
                      <feature.icon className="w-6 h-6 text-[#a8fbd3]" />
                      <AnimatePresence>
                        {hoveredSolution === i && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: -5, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-[#4fb7b3]/30 rounded-lg text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                          >
                            {feature.title}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/80" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 font-heading">{feature.title}</h4>
                      <p className="text-sm text-gray-300">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 relative h-[400px] md:h-[700px] w-full order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#637ab9] to-[#4fb7b3] rounded-3xl rotate-3 opacity-30 blur-xl" />
              <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
                {/* Optimized: w=1000, q=75 */}
                <img 
                  src="https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&q=75&w=1000" 
                  alt="Aquarium" 
                  className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 will-change-transform" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  <div className="text-5xl md:text-8xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/0 opacity-50">
                    24/7
                  </div>
                  <div className="text-lg md:text-xl font-bold tracking-widest uppercase mt-2 text-white">
                    Monitoramento Ativo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-10 py-20 md:py-32">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 px-4">
             <h2 className="text-5xl md:text-8xl font-heading font-bold uppercase leading-[0.9] drop-shadow-lg break-words w-full md:w-auto">
              Módulos <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a8fbd3] to-[#4fb7b3]">do Sistema</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10 bg-black/20 backdrop-blur-sm">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.id}
                className="group relative h-[400px] md:h-[500px] w-full overflow-hidden border-b md:border-r border-white/10 bg-black cursor-pointer"
                initial="rest"
                whileHover="hover"
                whileTap="hover"
                animate="rest"
                data-hover="true"
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img 
                    src={feature.image} 
                    alt={feature.name} 
                    className="h-full w-full object-cover grayscale will-change-transform"
                    variants={{
                      rest: { scale: 1, opacity: 0.6, filter: 'grayscale(100%)' },
                      hover: { scale: 1.05, opacity: 0.9, filter: 'grayscale(0%)' }
                    }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-[#4fb7b3]/20 transition-colors duration-500" />
                </div>

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                     <span className="text-xs font-mono border border-white/30 px-2 py-1 rounded-full backdrop-blur-md">
                       {feature.tag}
                     </span>
                     <motion.div
                       variants={{
                         rest: { opacity: 0, x: 20, y: -20 },
                         hover: { opacity: 1, x: 0, y: 0 }
                       }}
                       className="bg-white text-black rounded-full p-2"
                     >
                       <feature.icon className="w-6 h-6" />
                     </motion.div>
                  </div>

                  <div>
                    <motion.h3 
                      className="font-heading text-3xl md:text-4xl font-bold uppercase text-white mix-blend-difference"
                      variants={{
                        rest: { y: 0 },
                        hover: { y: -5 }
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {feature.name}
                    </motion.h3>
                    <motion.p 
                      className="text-sm font-medium uppercase tracking-widest text-[#4fb7b3] mt-2"
                      variants={{
                        rest: { opacity: 0, y: 10 },
                        hover: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {feature.category}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative z-10 py-20 md:py-32 px-4 md:px-6 bg-black/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
             <h2 className="text-5xl md:text-9xl font-heading font-bold opacity-20 text-white">
               PLANOS
             </h2>
             <p className="text-[#a8fbd3] font-mono uppercase tracking-widest -mt-3 md:-mt-8 relative z-10 text-sm md:text-base">
               Escolha seu nível de controle
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const isProfessional = plan.name === 'Profissional';
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className={`relative p-8 md:p-12 border border-white/10 backdrop-blur-md flex flex-col min-h-[500px] transition-colors duration-300 ${plan.accent}`}
                  data-hover="true"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-8 md:mb-10">
                       <span className={`text-4xl md:text-5xl font-bold tracking-tighter ${plan.color === 'white' ? 'text-white' : 'text-[#4fb7b3]'}`}>
                        {plan.price}
                      </span>
                      <span className="text-white/50 text-sm font-mono uppercase">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-4 md:space-y-6 text-sm text-gray-200">
                      {plan.features.map((feature, idx) => {
                        const featureKey = `${i}-${idx}`;
                        const isActive = activePlanFeature === featureKey;
                        
                        return (
                          <li key={idx} className="flex items-start gap-3 relative group/feature">
                            <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${i === 1 ? 'text-[#a8fbd3]' : 'text-gray-400'}`} /> 
                            
                            {/* Feature Text */}
                            <div 
                              className={`relative flex-1 ${isProfessional ? 'cursor-pointer' : 'cursor-help'}`}
                              onMouseEnter={() => !isProfessional && setActivePlanFeature(featureKey)}
                              onMouseLeave={() => !isProfessional && setActivePlanFeature(null)}
                              onClick={() => isProfessional && setActivePlanFeature(isActive ? null : featureKey)}
                            >
                              <span className={`border-b transition-colors ${isActive && isProfessional ? 'border-[#4fb7b3] text-[#4fb7b3]' : 'border-white/10 group-hover/feature:border-white/50'}`}>
                                {feature.text}
                              </span>

                              {/* Unified Tooltip */}
                              <AnimatePresence>
                                {isActive && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: -5, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-black/90 border border-white/20 rounded-xl backdrop-blur-xl z-30 shadow-2xl"
                                  >
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      {feature.detail}
                                    </p>
                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-black/90" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            <Info className={`w-3 h-3 text-white/20 mt-1 transition-opacity ml-auto ${isProfessional ? 'opacity-50 group-hover/feature:opacity-100' : 'opacity-0 group-hover/feature:opacity-100'}`} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <RippleButton 
                    onClick={() => openAuth('signup')}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-[0.2em] border border-white/20 transition-all duration-300 mt-8 group overflow-hidden relative text-white cursor-pointer hover:bg-white hover:text-black`}
                    rippleColor={isProfessional ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.4)"}
                  >
                    Assinar Agora
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out -z-10" />
                  </RippleButton>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-12 text-center">FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-white/10 bg-black/40 backdrop-blur-sm">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  data-hover="true"
                >
                  <span className="font-bold text-lg md:text-xl">{faq.q}</span>
                  <ChevronDown className={`transform transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-12 md:py-16 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
             <div className="font-heading text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-white">TITAN AQUATICS</div>
             <div className="flex gap-2 text-xs font-mono text-gray-400">
               <span>&copy; 2025 Titan Labs. Todos os direitos reservados.</span>
             </div>
          </div>
          
          <div className="flex gap-6 md:gap-8 flex-wrap">
            <a href="#" className="text-gray-400 hover:text-[#4fb7b3] transition-colors cursor-pointer" data-hover="true" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#c13584] transition-colors cursor-pointer" data-hover="true" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#0077b5] transition-colors cursor-pointer" data-hover="true" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#ff0000] transition-colors cursor-pointer" data-hover="true" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeature(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md cursor-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[#1a1b3b] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-[#4fb7b3]/10 group/modal"
            >
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
                data-hover="true"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateFeature('prev'); }}
                className="absolute left-4 bottom-4 translate-y-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors border border-white/10 backdrop-blur-sm"
                data-hover="true"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigateFeature('next'); }}
                className="absolute right-4 bottom-4 translate-y-0 md:top-1/2 md:bottom-auto md:-translate-y-1/2 z-20 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors border border-white/10 backdrop-blur-sm md:right-8"
                data-hover="true"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={selectedFeature.id}
                    src={selectedFeature.image} 
                    alt={selectedFeature.name} 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b3b] via-transparent to-transparent md:bg-gradient-to-r" />
              </div>

              <div className="w-full md:w-1/2 p-8 pb-24 md:p-12 flex flex-col justify-center relative">
                <motion.div
                  key={selectedFeature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 text-[#4fb7b3] mb-4">
                     <motion.div
                       animate={selectedFeature.id === '4' && isTaskAnimating ? { 
                         scale: [1, 1.5, 1.2, 1], 
                         rotate: [0, -10, 10, -5, 5, 0],
                         filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
                       } : {}}
                       transition={{ duration: 0.6, ease: "easeInOut" }}
                     >
                        <selectedFeature.icon className="w-4 h-4" />
                     </motion.div>
                     <span className="font-mono text-sm tracking-widest uppercase">{selectedFeature.tag}</span>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-heading font-bold uppercase leading-none mb-2 text-white">
                    {selectedFeature.name}
                  </h3>
                  
                  <p className="text-lg text-[#a8fbd3] font-medium tracking-widest uppercase mb-6">
                    {selectedFeature.category}
                  </p>
                  
                  <div className="h-px w-20 bg-white/20 mb-6" />
                  
                  <p className="text-gray-300 leading-relaxed text-lg font-light mb-8">
                    {selectedFeature.description}
                  </p>

                  {selectedFeature.id === '4' ? (
                    <div className="flex flex-col gap-3">
                        <RippleButton 
                            onClick={handleSimulateTask}
                            disabled={isTaskAnimating}
                            className="self-start border-b border-[#4fb7b3] text-[#4fb7b3] uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors flex items-center gap-2 bg-transparent"
                            rippleColor="rgba(79, 183, 179, 0.2)"
                        >
                        {isTaskAnimating ? 'Adicionando...' : 'Simular Agendamento TPA'}
                        </RippleButton>
                        <AnimatePresence>
                            {isTaskAnimating && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-xs text-[#a8fbd3]"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Tarefa adicionada com sucesso!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  ) : (
                    <RippleButton 
                       onClick={() => openAuth('signup')}
                       className="self-start border-b border-[#4fb7b3] text-[#4fb7b3] uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors bg-transparent"
                       rippleColor="rgba(255,255,255,0.2)"
                    >
                      Testar Recurso
                    </RippleButton>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;