import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  BellRing, 
  CalendarCheck, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  Target,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { generateSmartSubtasks } from '../services/geminiService';
import { sounds } from '../services/soundEffects';
import { useScrollDirection } from '../hooks/useScrollDirection';
import nanoBananaImg from '../assets/images/nano_banana_mascot_1787956938612.jpg';

interface HeaderHeroBannerProps {
  onQuickCreateTask: (title: string, subtasks?: string[]) => void;
  pendingCount: number;
  urgentCount: number;
  onOpenAlerts: () => void;
  onOpenNanoBanana?: () => void;
}

export const HeaderHeroBanner: React.FC<HeaderHeroBannerProps> = ({
  onQuickCreateTask,
  pendingCount,
  urgentCount,
  onOpenAlerts,
  onOpenNanoBanana,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);
  const [activeCardTab, setActiveCardTab] = useState<'outcomes' | 'decisions' | 'actions' | 'automations'>('outcomes');
  const [cardRow1Checked, setCardRow1Checked] = useState(true);
  const [cardRow2Checked, setCardRow2Checked] = useState(false);

  const { isVisible, scrollY } = useScrollDirection(12);
  
  // Hide gently when user scrolls down deep into the Kanban board
  const isAutoHidden = scrollY > 200 && !isVisible;

  const presets = [
    { label: '🎯 Sprint Semanal', prompt: 'Planejar Sprint Semanal com revisão de metas e entregáveis' },
    { label: '📊 Relatório Financeiro', prompt: 'Finalizar conciliação contábil do mês e enviar balanço' },
    { label: '⚡ Apresentação Executiva', prompt: 'Preparar slides de apresentação para a diretoria' },
  ];

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateSmartSubtasks(quickInput, '');
      const subtaskTitles = generated.map(g => g.title);
      onQuickCreateTask(quickInput, subtaskTitles);
      setQuickInput('');
      sounds.playComplete();
    } catch {
      onQuickCreateTask(quickInput);
      setQuickInput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPreset = (prompt: string, label: string) => {
    setQuickInput(prompt);
    setCopiedPreset(label);
    setTimeout(() => setCopiedPreset(null), 1800);
  };

  return (
    <motion.section
      aria-label="Apresentação e Captura Rápida"
      initial={{ opacity: 0, y: -24, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 180, 
        damping: 24, 
        mass: 0.8 
      }}
      className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md transition-all"
    >
      {/* Subtle Ambient Backing Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center text-center gap-6">
        
        {/* Minimalist Live Status Eyebrow with Gentle Drop */}
        <motion.div 
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-[500] text-slate-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Taskly Workspace • {pendingCount} tarefas ativas</span>
          </span>

          {onOpenNanoBanana && (
            <button
              onClick={onOpenNanoBanana}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition-all hover:scale-105"
            >
              <span className="text-xs">🍌</span>
              <span>Nano Banana Assistente</span>
            </button>
          )}
        </motion.div>

        {/* Two-Line High-Impact Headline with Smooth Fluid Descent */}
        <motion.h1 
          initial={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          className="font-['Figtree',sans-serif] text-2xl sm:text-4xl lg:text-[42px] font-[577] text-white t-display max-w-3xl whitespace-pre-line leading-[1.18]"
        >
          Está cansado de marcar tarefas e esquecer?{'\n'}
          <span className="text-amber-400">Esse é o Taskly</span>: marca tudo e te notifica quando for preciso.
        </motion.h1>

        {/* Subcopy with Soft Float */}
        <motion.p 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
          className="font-['Figtree',sans-serif] text-sm sm:text-base text-slate-400 t-body max-w-2xl whitespace-pre-line leading-[1.5]"
        >
          Centralize deveres, prazos e entregas em uma interface rápida e sem distrações.{'\n'}
          Receba alertas pontuais e sincronize com Slack, Google Calendar e Google Drive.
        </motion.p>

        {/* Quick Capture Input with Smooth Rise & Spring */}
        <motion.div 
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="w-full max-w-xl space-y-2.5"
        >
          <form onSubmit={handleQuickSubmit} className="relative flex items-center shadow-xl">
            <input
              type="text"
              id="hero-quick-task-input"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Digitar tarefa rápida (ex: Entregar relatório amanhã às 14h)..."
              className="w-full rounded-full border border-slate-700 bg-slate-900/95 py-3 pl-5 pr-36 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all font-['Figtree',sans-serif]"
            />
            
            <button
              type="submit"
              id="btn-hero-create-ai"
              disabled={isGenerating || !quickInput.trim()}
              className="absolute right-1.5 rounded-full bg-white px-4 py-2 text-xs font-[577] tracking-[-0.02em] text-black hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 animate-spin text-black" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <span>Marcar Tarefa</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Target className="h-3 w-3 text-amber-400" />
              <span>Sugestões:</span>
            </span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.prompt, p.label)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 hover:border-amber-400/60 hover:text-amber-300 hover:scale-105 transition-all"
              >
                <span>{p.label}</span>
                {copiedPreset === p.label && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quantum²-Inspired Product Mockup Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full max-w-lg mt-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 sm:p-5 text-left shadow-2xl backdrop-blur-xl transition-all hover:border-slate-700">
                
                {/* Card Header & Metadata */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      # Sprint 42 • Sincronização de Metas
                    </span>
                    <h2 className="text-base sm:text-lg font-[577] text-white mt-0.5 tracking-[-0.02em]">
                      Revisão de Entregas & Prazos
                    </h2>
                  </div>

                  {/* Overlapping Team Avatars */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <img 
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                      alt="Avatar 1" 
                    />
                    <img 
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                      alt="Avatar 2" 
                    />
                    <img 
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
                      alt="Avatar 3" 
                    />
                  </div>
                </div>

                {/* Clock & Status Meta */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hoje às 10:30 • 45 min • <strong className="text-emerald-400 font-medium">Sincronizado GCal</strong></span>
                </div>

                {/* Card Tabs */}
                <div className="flex items-center gap-1 mt-4 border-b border-slate-800 pb-2 text-xs">
                  <button
                    onClick={() => setActiveCardTab('outcomes')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      activeCardTab === 'outcomes' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Entregas Principais
                  </button>
                  <button
                    onClick={() => setActiveCardTab('decisions')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      activeCardTab === 'decisions' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Decisões
                  </button>
                  <button
                    onClick={() => setActiveCardTab('actions')}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                      activeCardTab === 'actions' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ações Pendentes
                  </button>
                </div>

                {/* Card Task Rows */}
                <div className="mt-3 space-y-2">
                  <div 
                    onClick={() => setCardRow1Checked(!cardRow1Checked)}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 cursor-pointer hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                        cardRow1Checked ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {cardRow1Checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${cardRow1Checked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          Alinhar métricas de sucesso para o lançamento Q3
                        </p>
                        <span className="text-[10px] text-slate-500">Responsável: Tech Lead • Slack OK</span>
                      </div>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      Concluído
                    </span>
                  </div>

                  <div 
                    onClick={() => setCardRow2Checked(!cardRow2Checked)}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 cursor-pointer hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all ${
                        cardRow2Checked ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {cardRow2Checked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${cardRow2Checked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          Refinar estratégia de produto e aprovação final
                        </p>
                        <span className="text-[10px] text-slate-500">Responsável: Gestor de Marketing</span>
                      </div>
                    </div>
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                      Em Foco
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </motion.section>
  );
};
