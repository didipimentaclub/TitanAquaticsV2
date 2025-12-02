import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: number;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ 
  className = '', 
  children, 
  onClick, 
  rippleColor = 'rgba(255, 255, 255, 0.35)',
  duration = 0.6,
  ...props 
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

  useEffect(() => {
    // Limpar ripples antigos para evitar vazamento de memória
    const timeouts = ripples.map(r => setTimeout(() => {
       setRipples(prev => prev.filter(i => i.id !== r.id));
    }, duration * 1000));
    return () => timeouts.forEach(clearTimeout);
  }, [ripples, duration]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    setRipples(prev => [...prev, { x, y, size, id: Date.now() }]);
    
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`relative overflow-hidden isolate ${className}`} 
      onClick={addRipple} 
      {...props}
    >
      {/* O conteúdo do botão precisa estar acima do ripple */}
      <span className="relative z-10 pointer-events-none flex items-center justify-center gap-2 w-full h-full">
        {children}
      </span>
      
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration, ease: "easeOut" }}
            style={{ 
              position: 'absolute', 
              top: ripple.y, 
              left: ripple.x, 
              width: ripple.size, 
              height: ripple.size, 
              backgroundColor: rippleColor,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 0 
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};

export default RippleButton;