import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Flame, 
  ArrowRight, 
  X, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import nanoBananaImg from '../assets/images/nano_banana_mascot_1787956938612.jpg';

interface NanoBananaWidgetProps {
  onOpenNanoHub: () => void;
  pendingTasksCount: number;
  urgentTasksCount: number;
  onQuickOptimize: () => void;
}

export const NanoBananaWidget: React.FC<NanoBananaWidgetProps> = ({
  onOpenNanoHub,
  pendingTasksCount,
  urgentTasksCount,
  onQuickOptimize,
}) => {
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [speechIndex, setSpeechIndex] = useState(0);
  const { isVisible, scrollY } = useScrollDirection(15);

  const speechLines = [
    urgentTasksCount > 0 
      ? `Atenção! Você tem ${urgentTasksCount} dever(es) urgente(s) hoje. Que tal priorizar a ordem de execução?`
      : `Você tem ${pendingTasksCount} tarefas ativas. Produtividade em dia!`,
    "Dica: Dividir metas grandes em subtarefas de 25 minutos facilita a entrega no prazo.",
    "Bloco de foco pronto: clique para abrir o painel de produtividade.",
    "Priorizador inteligente disponível: 1 clique para organizar seu dia por urgência."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % speechLines.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [speechLines.length]);

  return (
    <motion.aside 
      aria-label="Assistente Nano Banana" 
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isVisible || scrollY < 100 ? 1 : 0.8,
        y: isVisible || scrollY < 100 ? 0 : 16,
        scale: isVisible || scrollY < 100 ? 1 : 0.95
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none"
    >
      
      {/* Speech Bubble with Motion */}
      <AnimatePresence>
        {bubbleVisible && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto relative max-w-xs rounded-2xl border border-slate-700/90 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-slate-200"
          >
            {/* Close bubble button */}
            <button
              onClick={() => setBubbleVisible(false)}
              className="absolute top-2 right-2 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              title="Minimizar mensagem"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Bubble Header */}
            <div className="flex items-center gap-1.5 pb-1">
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
              <span className="font-['Outfit',sans-serif] font-bold text-amber-300 text-[11px] uppercase tracking-wider">
                Nano Banana • Assistente
              </span>
            </div>

            {/* Speech message */}
            <p className="text-slate-200 text-xs leading-relaxed pr-3 font-normal">
              {speechLines[speechIndex]}
            </p>

            {/* Quick Actions in Bubble */}
            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onQuickOptimize();
                }}
                className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors"
              >
                <Zap className="h-3 w-3 text-amber-400" />
                <span>Organizar Dia</span>
              </button>

              <button
                onClick={() => {
                  onOpenNanoHub();
                }}
                className="flex items-center gap-1 rounded-lg bg-indigo-600/30 px-2 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/40 transition-colors ml-auto"
              >
                <span>Abrir Painel</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 right-6 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Nano Banana Mascot Trigger */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        onClick={() => {
          onOpenNanoHub();
        }}
        className="pointer-events-auto relative group flex items-center justify-center cursor-pointer"
      >
        {/* Subtle Glow Ring */}
        <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm group-hover:bg-amber-400/50 transition-colors" />
        
        {/* Mascot Avatar Container */}
        <div className="relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center overflow-hidden rounded-full border-2 border-amber-300/80 bg-slate-950 shadow-xl ring-2 ring-slate-800">
          <img
            src={nanoBananaImg}
            alt="Nano Banana Mascot"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Active online pulse badge */}
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
        </div>

        {/* Floating Tooltip Label */}
        <div className="absolute right-full mr-3 hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-900/95 px-3 py-1 text-xs font-semibold text-white shadow-xl border border-slate-800 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span>Abrir Assistente Nano Banana</span>
        </div>
      </motion.div>

    </motion.aside>
  );
};
