import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const TitanCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou o Titan Copilot 🐠. Posso ajudar com parâmetros da água, compatibilidade de fauna ou diagnósticos. Como posso ser útil?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    try {
      const responseText = await sendMessageToGemini(input);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, perdi a conexão com o servidor central. Tente novamente.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-auto font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[90vw] md:w-96 bg-[#0d0e21] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-[#4fb7b3]/10 flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1a1b3b] p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#4fb7b3]/20 rounded-lg">
                  <Bot className="w-4 h-4 text-[#4fb7b3]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white tracking-wide text-sm">TITAN COPILOT</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-80 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[#05051a]/50"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#4fb7b3] text-[#05051a] font-medium rounded-2xl rounded-tr-none'
                        : 'bg-[#1a1b3b] text-slate-300 border border-white/5 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1b3b] p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-[#4fb7b3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#4fb7b3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#4fb7b3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-[#1a1b3b] border-t border-white/5">
              <div className="flex gap-2 bg-[#05051a] p-1.5 rounded-xl border border-white/10 focus-within:border-[#4fb7b3]/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Pergunte sobre seu aquário..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm px-3 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#4fb7b3] p-2 rounded-lg hover:bg-[#a8fbd3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-[#05051a]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#4fb7b3] flex items-center justify-center shadow-lg shadow-[#4fb7b3]/20 hover:bg-[#a8fbd3] transition-colors border-2 border-[#05051a] z-50 group relative"
      >
        <span className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 pointer-events-none"></span>
        {isOpen ? (
          <X className="w-6 h-6 text-[#05051a]" />
        ) : (
          <Sparkles className="w-6 h-6 text-[#05051a]" />
        )}
      </motion.button>
    </div>
  );
};

export default TitanCopilot;
