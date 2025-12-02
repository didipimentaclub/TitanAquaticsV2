// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'label'>('default');
  
  // Inicializa fora da tela para evitar flash
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 20, stiffness: 300, mass: 0.1 }; 
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      
      // Prioridade: data-hover="true" > link/button > default
      const isLabelTarget = target.closest('[data-hover="true"]');
      const isClickable = target.closest('button') || target.closest('a') || target.closest('[role="button"]');
      
      if (isLabelTarget) {
        setCursorState('label');
      } else if (isClickable) {
        setCursorState('hover');
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference flex items-center justify-center hidden md:flex will-change-transform"
      style={{ x, y, translate: '-50% -50%' }}
    >
      <motion.div
        className="relative rounded-full flex items-center justify-center bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        animate={{
          width: cursorState === 'label' ? 100 : (cursorState === 'hover' ? 40 : 12),
          height: cursorState === 'label' ? 100 : (cursorState === 'hover' ? 40 : 12),
          opacity: cursorState === 'default' ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      >
        <AnimatePresence>
          {cursorState === 'label' && (
            <motion.span 
              key="cursor-text"
              className="z-10 text-black font-black uppercase tracking-widest text-[10px] whitespace-nowrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              Visualizar
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CustomCursor;