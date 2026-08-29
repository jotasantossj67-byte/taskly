import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Clock, 
  Paperclip, 
  MessageSquare, 
  CalendarCheck, 
  HardDrive, 
  Plus, 
  User, 
  Tag, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Task, SubTask, TaskStatus, Priority, TaskCategory, TeamMember } from '../../types';
import { generateSmartSubtasks } from '../../services/geminiService';
import { sounds } from '../../services/soundEffects';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  teamMembers: TeamMember[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
  teamMembers,
}) => {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime);
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState(task.assignee.id);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [slackSynced, setSlackSynced] = useState(task.slackSynced);
  const [gcalSynced, setGcalSynced] = useState(task.gcalSynced);

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    sounds.playComplete();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAiBreakdown = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await generateSmartSubtasks(title, description);
      const newItems: SubTask[] = generated.map((g, i) => ({
        id: `st-ai-${Date.now()}-${i}`,
        title: g.title,
        completed: false,
      }));
      setSubtasks([...subtasks, ...newItems]);
      sounds.playComplete();
    } catch {
      // Ignore
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = () => {
    const assignedMember = teamMembers.find(m => m.id === assigneeId) || task.assignee;
    const completedCount = subtasks.filter(s => s.completed).length;
    const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : (status === 'concluida' ? 100 : 0);

    const updated: Task = {
      ...task,
      title,
      description,
      category,
      priority,
      status,
      dueDate,
      dueTime,
      subtasks,
      assignee: assignedMember,
      slackSynced,
      gcalSynced,
      progressPercent,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'concluida' && !task.completedAt ? new Date().toISOString() : task.completedAt,
    };

    onUpdateTask(updated);
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6"
      >
        
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300">
              {category}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
              priority === 'urgente' ? 'bg-rose-500/20 text-rose-300' :
              priority === 'alta' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
            }`}>
              Prioridade: {priority.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Título da Tarefa / Entrega</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-base sm:text-lg font-bold text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Descrição & Detalhes Operacionais</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione detalhes, diretrizes e contexto para a entrega..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs sm:text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Meta Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Status do Fluxo:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="pendente">A Fazer (Pendente)</option>
              <option value="em_progresso">Em Execução</option>
              <option value="revisao">Em Revisão</option>
              <option value="concluida">Concluída ✅</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Data Limite (Prazo):</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Horário Alerta:</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Categoria:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
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
            <label className="text-slate-400 font-semibold">Nível de Prioridade:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="urgente">🔥 Urgente (Alerta Máximo)</option>
              <option value="alta">⚡ Alta Prioridade</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Responsável:</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>

        </div>

        {/* Subtasks Checklist with AI Generator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Checklist de Subtarefas ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </span>
            </div>

            <button
              type="button"
              onClick={handleAiBreakdown}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-indigo-500/30 transition-colors"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Gerando...' : 'Quebrar com IA Gemini'}</span>
            </button>
          </div>

          {/* Subtask list */}
          <div className="space-y-2">
            {subtasks.map((sub) => (
              <div 
                key={sub.id} 
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/80 p-2.5 border border-slate-800"
              >
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => handleToggleSubtask(sub.id)}
                    className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                    {sub.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(sub.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask input */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Adicionar nova etapa da tarefa..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Integration Toggles & Attachments */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={gcalSynced}
                onChange={(e) => setGcalSynced(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sincronizar no Google Calendar</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={slackSynced}
                onChange={(e) => setSlackSynced(e.target.checked)}
                className="rounded border-slate-700 text-indigo-500 focus:ring-0"
              />
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>Notificar no Slack</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                onDeleteTask(task.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Excluir Tarefa</span>
          </button>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
          >
            Salvar Alterações
          </button>
        </div>

      </motion.div>
    </div>
  );
};
