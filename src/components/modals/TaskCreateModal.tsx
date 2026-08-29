import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  User, 
  CalendarCheck, 
  MessageSquare,
  Zap
} from 'lucide-react';
import { Task, SubTask, Priority, TaskCategory, TeamMember } from '../../types';
import { generateSmartSubtasks } from '../../services/geminiService';
import { sounds } from '../../services/soundEffects';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progressPercent'>) => void;
  teamMembers: TeamMember[];
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  teamMembers,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Trabalho');
  const [priority, setPriority] = useState<Priority>('alta');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id || 'user-1');
  const [tagsInput, setTagsInput] = useState('Estratégico, SaaS');
  const [gcalSynced, setGcalSynced] = useState(true);
  const [slackSynced, setSlackSynced] = useState(true);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleAiBreakdown = async () => {
    if (!title.trim()) return;
    setIsGeneratingAi(true);
    try {
      const generated = await generateSmartSubtasks(title, description);
      const newItems: SubTask[] = generated.map((g, i) => ({
        id: `st-ai-${Date.now()}-${i}`,
        title: g.title,
        completed: false,
      }));
      setSubtasks(newItems);
      sounds.playComplete();
    } catch {
      // Ignore
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedMember = teamMembers.find(m => m.id === assigneeId) || teamMembers[0];
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'pendente',
      dueDate,
      dueTime,
      estimatedMinutes,
      spentMinutes: 0,
      tags,
      subtasks,
      assignee: assignedMember,
      attachments: [],
      recurrence: 'none',
      smartAlertScheduled: true,
      slackSynced,
      gcalSynced,
      gdriveLinked: false,
      urgencyScore: priority === 'urgente' ? 95 : priority === 'alta' ? 75 : 50,
    });

    sounds.playComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -24, filter: 'blur(3px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.95, y: -16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-['Outfit',sans-serif] text-lg font-bold text-white">Criar Nova Tarefa / Entrega</h3>
              <p className="text-xs text-slate-400">Marque o dever no Taskly para alertas preditivos e sincronização.</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">Título da Tarefa *</label>
              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={isGeneratingAi || !title.trim()}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 disabled:opacity-40"
              >
                <Sparkles className={`h-3 w-3 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Gerando etapas...' : 'Quebrar com IA Gemini'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Entregar relatório de auditoria e apresentar à diretoria"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Descrição / Escopo</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes, links e metas esperadas..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Subtasks Preview if generated */}
          {subtasks.length > 0 && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                Subtarefas sugeridas pela IA ({subtasks.length})
              </span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {subtasks.map((s, idx) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{s.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grid Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Trabalho">Trabalho</option>
                <option value="Projetos">Projetos</option>
                <option value="Entregas">Entregas</option>
                <option value="Finanças">Finanças</option>
                <option value="Estudos">Estudos</option>
                <option value="Saúde">Saúde</option>
                <option value="Pessoal">Pessoal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Prioridade:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="urgente">🔥 Urgente</option>
                <option value="alta">⚡ Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Responsável:</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Data Limite:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Horário:</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-400">Tags (separadas por vírgula):</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: TI, Q3, Urgente"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Sync checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={gcalSynced}
                onChange={(e) => setGcalSynced(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sincronizar no Google Calendar</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={slackSynced}
                onChange={(e) => setSlackSynced(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500 focus:ring-0"
              />
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>Notificar Canal Slack</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-new-task"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
            >
              Criar & Agendar Notificações
            </button>
          </div>

        </form>

      </motion.div>
    </div>
  );
};
