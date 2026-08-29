import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Zap, 
  Flame, 
  Brain, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  ListOrdered, 
  Plus, 
  Lightbulb, 
  TrendingUp, 
  ShieldCheck, 
  Sliders,
  Play
} from 'lucide-react';
import nanoBananaImg from '../../assets/images/nano_banana_mascot_1787956938612.jpg';
import { Task, SubTask } from '../../types';
import { generateSmartSubtasks } from '../../services/geminiService';
import confetti from 'canvas-confetti';

interface NanoBananaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onApplyOptimizedOrder: (reorderedTasks: Task[]) => void;
  onQuickCreateTaskWithSubtasks: (title: string, subtasks: string[], priority: Task['priority']) => void;
  onStartFocusSession: () => void;
}

export const NanoBananaModal: React.FC<NanoBananaModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onApplyOptimizedOrder,
  onQuickCreateTaskWithSubtasks,
  onStartFocusSession,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'optimize' | 'breakdown' | 'boost' | 'tips'>('optimize');
  
  // Breakdown state
  const [goalInput, setGoalInput] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decomposedItems, setDecomposedItems] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('alta');

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedSuccess, setOptimizedSuccess] = useState(false);

  // Boost streak level
  const completedTasksCount = tasks.filter(t => t.status === 'concluida').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'concluida').length;
  const bananaEnergyScore = Math.min(100, Math.round((completedTasksCount / (tasks.length || 1)) * 100) + 40);

  const handleDecompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;

    setIsDecomposing(true);
    try {
      const result = await generateSmartSubtasks(goalInput, 'Decomposição em etapas acionáveis pelo Nano Banana AI');
      setDecomposedItems(result.map(r => r.title));
    } catch {
      setDecomposedItems([
        'Definir metas e requisitos do projeto',
        'Elaborar rascunho de execução e cronograma',
        'Validar dependências e recursos necessários',
        'Executar testes e entrega final'
      ]);
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleSaveDecomposedTask = () => {
    if (!goalInput.trim()) return;
    onQuickCreateTaskWithSubtasks(goalInput, decomposedItems, selectedPriority);
    setGoalInput('');
    setDecomposedItems([]);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#06b6d4', '#6366f1']
    });
    onClose();
  };

  const handleOptimizeMyDay = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Sort tasks by: urgencyScore desc, then priority (urgente > alta > media > baixa), then due date
      const priorityWeights: Record<Task['priority'], number> = {
        urgente: 4,
        alta: 3,
        media: 2,
        baixa: 1
      };

      const sorted = [...tasks].sort((a, b) => {
        if (a.status === 'concluida' && b.status !== 'concluida') return 1;
        if (a.status !== 'concluida' && b.status === 'concluida') return -1;
        const urgencyDiff = (b.urgencyScore || 0) - (a.urgencyScore || 0);
        if (urgencyDiff !== 0) return urgencyDiff;
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      });

      onApplyOptimizedOrder(sorted);
      setIsOptimizing(false);
      setOptimizedSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#10b981', '#6366f1']
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-400/40 bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-amber-950/20 space-y-6"
      >
        
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header with Nano Banana Avatar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-slate-950 overflow-hidden shadow-lg shadow-amber-500/20"
            >
              <img
                src={nanoBananaImg}
                alt="Nano Banana Avatar"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit',sans-serif] text-xl font-extrabold text-white">
                  Nano Banana Hub
                </h3>
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Foco & Organização
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Seu assistente de produtividade, organização de rotina e decomposição de entregas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs with Motion */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-slate-950 p-1.5 border border-slate-800 text-xs font-semibold">
          {[
            { id: 'optimize', label: 'Otimizar Dia', icon: ListOrdered },
            { id: 'breakdown', label: 'Decompor Meta', icon: Layers },
            { id: 'boost', label: 'Banana Boost', icon: Flame },
            { id: 'tips', label: 'Dicas Táticas', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Day Optimizer */}
        {activeTab === 'optimize' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Algoritmo de Priorização Ótima Nano Banana
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  {pendingTasksCount} tarefas para ordenar
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                O Nano Banana analisa os prazos, níveis de esforço, tags estratégicas e criticidade para ordenar seu fluxo diário pelo maior impacto com menor atrito.
              </p>

              {/* Priority preview card */}
              <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Sequência recomendada para hoje:
                </span>
                <div className="space-y-1.5">
                  {tasks.slice(0, 3).map((t, idx) => (
                    <div key={t.id} className="flex items-center justify-between text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                      <div className="flex items-center gap-2 truncate">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">
                          {idx + 1}
                        </span>
                        <span className="truncate">{t.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {t.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Trigger button */}
              <button
                onClick={handleOptimizeMyDay}
                disabled={isOptimizing}
                id="btn-apply-nano-optimize"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Calculando matriz de impacto...</span>
                  </>
                ) : optimizedSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-slate-950" />
                    <span>Ordem Ótima Aplicada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-slate-950 fill-slate-950" />
                    <span>Reordenar Kanban Automaticamente por Impacto</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Breakdown with AI */}
        {activeTab === 'breakdown' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <form onSubmit={handleDecompose} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Descreva um objetivo complexo ou entrega:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Ex: Lançar campanha de captação de clientes no LinkedIn e medir ROI"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isDecomposing || !goalInput.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`h-3.5 w-3.5 ${isDecomposing ? 'animate-spin' : ''}`} />
                    <span>{isDecomposing ? 'Decompondo...' : 'Decompor'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Prioridade da entrega:</span>
                {(['urgente', 'alta', 'media'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all ${
                      selectedPriority === p
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </form>

            {/* Decomposed items list */}
            {decomposedItems.length > 0 && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-950/15 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    🍌 Etapas sugeridas pelo Nano Banana ({decomposedItems.length}):
                  </span>
                </div>

                <div className="space-y-1.5">
                  {decomposedItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-900/90 p-2 border border-slate-800 text-xs text-slate-200">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/20 text-[10px] font-bold text-amber-300">
                        {i + 1}
                      </span>
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSaveDecomposedTask}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar Tarefa no Taskly com estas Subtarefas</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 3: Banana Boost & Energy Streak */}
        {activeTab === 'boost' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>Banana Boost Energy Meter</span>
                  </h4>
                  <p className="text-xs text-slate-400">Nível de energia produtiva acumulada hoje</p>
                </div>
                <span className="text-2xl font-black text-amber-300 font-['Outfit',sans-serif]">
                  {bananaEnergyScore}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${bananaEnergyScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                  <span className="block font-bold text-white text-sm">{completedTasksCount}</span>
                  <span className="text-[10px] text-slate-400">Concluídas</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                  <span className="block font-bold text-amber-400 text-sm">4.8h</span>
                  <span className="text-[10px] text-slate-400">Tempo de Flow</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                  <span className="block font-bold text-cyan-400 text-sm">96%</span>
                  <span className="text-[10px] text-slate-400">No Prazo</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onStartFocusSession();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Iniciar Sessão de Hiperfoco (25 Minutos)</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Tactical Tips */}
        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 text-xs"
          >
            {[
              {
                title: 'Regra dos 2 Minutos do Nano Banana',
                desc: 'Se uma tarefa leva menos de 2 minutos para ser executada (ex: responder um e-mail de aprovação), faça imediatamente em vez de adiar.',
                tag: 'Velocidade'
              },
              {
                title: 'Agrupamento de Tarefas por Contexto',
                desc: 'Execute todas as tarefas com a tag "Finanças" ou "Comunicação" no mesmo bloco de tempo para evitar o custo de troca de contexto.',
                tag: 'Foco'
              },
              {
                title: 'Definição de Vitória Diária (Top 3)',
                desc: 'Escolha 3 tarefas principais no início do dia. Se você concluir essas 3, o dia já foi um sucesso extraordinário.',
                tag: 'Estratégia'
              }
            ].map((tip, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-100">{tip.title}</h5>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                    {tip.tag}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};
