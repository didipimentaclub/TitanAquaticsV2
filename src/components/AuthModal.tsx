import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const getFriendlyErrorMessage = (error: any) => {
  // Normaliza a mensagem de erro
  const msg = (error?.message || error?.error_description || (typeof error === 'string' ? error : '')).toLowerCase();

  if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado. Tente fazer login.';
  if (msg.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
  if (msg.includes('email not confirmed')) return 'Por favor, confirme seu e-mail antes de entrar.';
  if (msg.includes('rate limit') || msg.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns instantes.';
  if (msg.includes('network request failed')) return 'Erro de conexão. Verifique sua internet.';
  
  return 'Ocorreu um erro. Verifique seus dados e tente novamente.';
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
        // Não fechar automaticamente para o usuário ver a mensagem
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={loading 
              ? { 
                  scale: [1, 1.01, 1], // Efeito sutil de respiração
                  y: 0,
                  boxShadow: [
                    "0 25px 50px -12px rgba(79, 183, 179, 0.2)", 
                    "0 0 30px rgba(79, 183, 179, 0.6)", // Brilho mais intenso no pico
                    "0 25px 50px -12px rgba(79, 183, 179, 0.2)"
                  ],
                  borderColor: [
                    "rgba(255, 255, 255, 0.1)",
                    "rgba(79, 183, 179, 0.5)", // Pulso na borda com a cor da marca
                    "rgba(255, 255, 255, 0.1)"
                  ]
                } 
              : { 
                  scale: 1, 
                  y: 0,
                  boxShadow: "0 25px 50px -12px rgba(79, 183, 179, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.1)"
                }
            }
            transition={{ 
              duration: loading ? 1.5 : 0.3, 
              repeat: loading ? Infinity : 0,
              ease: "easeInOut"
            }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1b3b]/90 border p-6 md:p-8 shadow-2xl overflow-hidden rounded-2xl mx-4"
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4fb7b3]/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#637ab9]/20 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <h2 className="text-3xl font-heading font-bold text-white mb-2">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Junte-se ao Titan'}
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {mode === 'login' ? 'Acesse seu dashboard aquático.' : 'Comece a gerenciar seu tanque com precisão de IA.'}
              </p>

              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#a8fbd3] transition-colors mb-6 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-white/30 uppercase tracking-widest">Ou</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#4fb7b3] font-mono uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#4fb7b3] transition-colors text-sm"
                      placeholder="aquarista@titan.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#4fb7b3] font-mono uppercase tracking-widest">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 py-3 pl-10 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#4fb7b3] transition-colors text-sm"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded text-red-200 text-xs overflow-hidden"
                    >
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 p-3 rounded text-green-200 text-xs overflow-hidden"
                    >
                      <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-400" />
                      <span>{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                  {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  {mode === 'login' ? "Não tem uma conta? " : "Já tem uma conta? "}
                  <button
                    onClick={switchMode}
                    className="text-white underline underline-offset-4 hover:text-[#4fb7b3] transition-colors"
                  >
                    {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;