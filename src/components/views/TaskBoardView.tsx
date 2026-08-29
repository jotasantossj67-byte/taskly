import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Paperclip, 
  MessageSquare, 
  CalendarCheck, 
  Sparkles, 
  Filter, 
  ArrowUpDown,
  Tag,
  Flame,
  Check,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Task, TaskCategory, TaskStatus, Priority, TeamMember } from '../../types';
import { sounds } from '../../services/soundEffects';
import confetti from 'canvas-confetti';

interface TaskBoardViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal: () => void;
  selectedCategory: TaskCategory | 'Todas';
  searchQuery: string;
  teamMembers: TeamMember[];
}

type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline';

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  onSelectTask,
  onUpdateTaskStatus,
  onOpenNewTaskModal,
  selectedCategory,
  searchQuery,
  teamMembers,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [onlyDueToday, setOnlyDueToday] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'Todas' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (onlyDueToday && t.dueDate !== todayStr) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchTags = t.tags.some(tag => tag.toLowerCase().includes(q));
      const matchAssignee = t.assignee.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchAssignee) return false;
    }
    return true;
  });

  const columns: Array<{ id: TaskStatus; label: string; color: string; badgeBg: string }> = [
    { id: 'pendente', label: 'A Fazer / Pendentes', color: 'border-slate-700', badgeBg: 'bg-slate-800 text-slate-300' },
    { id: 'em_progresso', label: 'Em Execução', color: 'border-indigo-500/40', badgeBg: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'revisao', label: 'Revisão & Aprovação', color: 'border-cyan-500/40', badgeBg: 'bg-cyan-500/20 text-cyan-300' },
    { id: 'concluida', label: 'Entregas Concluídas', color: 'border-emerald-500/40', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
  ];

  const handleToggleComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (task.status === 'concluida') {
      onUpdateTaskStatus(task.id, 'pendente');
    } else {
      onUpdateTaskStatus(task.id, 'concluida');
      sounds.playComplete();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b']
      });
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgente':
        return <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">🔥 Urgente</span>;
      case 'alta':
        return <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">⚡ Alta</span>;
      case 'media':
        return <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Média</span>;
      case 'baixa':
        return <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">Baixa</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Toolbar: View switcher, filters, and counter stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
        
        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            id="view-mode-kanban"
            onClick={() => setViewMode('kanban')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Quadro Kanban</span>
          </button>
          <button
            id="view-mode-list"
            onClick={() => setViewMode('list')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Lista Detalhada</span>
          </button>
          <button
            id="view-mode-calendar"
            onClick={() => setViewMode('calendar')}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Agenda / Calendário</span>
          </button>
        </div>

        {/* Priority Filter & Due Today quick button */}
        <div className="flex flex-wrap items-center gap-2">
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOnlyDueToday(!onlyDueToday)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
              onlyDueToday 
                ? 'border-amber-500 bg-amber-500/20 text-amber-300' 
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Vence Hoje</span>
          </motion.button>

          <div className="flex items-center gap-1 rounded-xl bg-slate-950 px-2 py-1 border border-slate-800 text-xs text-slate-400">
            <span>Prioridade:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Todas</option>
              <option value="urgente" className="bg-slate-900 text-rose-400">Urgente 🔥</option>
              <option value="alta" className="bg-slate-900 text-amber-400">Alta ⚡</option>
              <option value="media" className="bg-slate-900 text-indigo-400">Média</option>
              <option value="baixa" className="bg-slate-900 text-slate-400">Baixa</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenNewTaskModal}
            id="btn-add-task-board"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Adicionar Tarefa</span>
          </motion.button>

        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {columns.map((col, colIdx) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: colIdx * 0.06 }}
                className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {col.label}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-600 text-xs">
                      <Circle className="h-8 w-8 stroke-1 mb-2 opacity-40" />
                      <span>Nenhuma tarefa aqui</span>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {colTasks.map((task) => {
                        const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                        const totalSubtasks = task.subtasks.length;
                        const subtaskRatio = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
                        const isOverdue = task.dueDate < todayStr && task.status !== 'concluida';

                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 8 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            key={task.id}
                            id={`task-card-${task.id}`}
                            onClick={() => onSelectTask(task)}
                            className="group relative flex flex-col gap-3 rounded-xl border border-slate-800/90 bg-slate-900/90 p-4 shadow-sm hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-md hover:shadow-indigo-500/10 cursor-pointer transition-all active:scale-[0.99]"
                          >
                            {/* Priority, Category & Quick status toggle */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {getPriorityBadge(task.priority)}
                                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                  {task.category}
                                </span>
                              </div>

                              <button
                                onClick={(e) => handleToggleComplete(e, task)}
                                title={task.status === 'concluida' ? 'Marcar como pendente' : 'Concluir tarefa'}
                                className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                                  task.status === 'concluida'
                                    ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </button>
                            </div>

                            {/* Title & Description */}
                            <div>
                              <h3 className={`text-sm font-semibold leading-snug transition-colors group-hover:text-indigo-300 ${
                                task.status === 'concluida' ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Subtasks Progress Bar if available */}
                            {totalSubtasks > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span>Subtarefas ({completedSubtasks}/{totalSubtasks})</span>
                                  <span className="font-semibold text-slate-300">{Math.round(subtaskRatio)}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                                    style={{ width: `${subtaskRatio}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Footer: Due date, tags, integrations and Assignee */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                              
                              {/* Due Date Indicator */}
                              <div className={`flex items-center gap-1 font-medium ${
                                isOverdue ? 'text-rose-400' : task.dueDate === todayStr ? 'text-amber-400' : 'text-slate-400'
                              }`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-[11px]">
                                  {task.dueDate === todayStr ? `Hoje às ${task.dueTime}` : task.dueDate}
                                </span>
                              </div>

                              {/* Integrations Badges & Assignee */}
                              <div className="flex items-center gap-1.5">
                                {task.gcalSynced && (
                                  <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" title="Sincronizado no Google Calendar" />
                                )}
                                {task.slackSynced && (
                                  <MessageSquare className="h-3.5 w-3.5 text-indigo-400" title="Notificado no Slack" />
                                )}
                                {task.attachments.length > 0 && (
                                  <div className="flex items-center gap-0.5 text-slate-400 text-[10px]">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{task.attachments.length}</span>
                                  </div>
                                )}
                                
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  title={`Responsável: ${task.assignee.name} (${task.assignee.role})`}
                                  className="h-6 w-6 rounded-full border border-indigo-500/40 object-cover ml-1"
                                />
                              </div>

                            </div>

                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* DETAILED LIST VIEW */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                <tr>
                  <th className="py-3.5 pl-4 pr-2 w-10">Status</th>
                  <th className="py-3.5 px-3">Tarefa / Entrega</th>
                  <th className="py-3.5 px-3">Categoria</th>
                  <th className="py-3.5 px-3">Prioridade</th>
                  <th className="py-3.5 px-3">Prazo & Horário</th>
                  <th className="py-3.5 px-3">Subtarefas</th>
                  <th className="py-3.5 px-3">Responsável</th>
                  <th className="py-3.5 pr-4 pl-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTasks.map((task) => {
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
                  const totalSubtasks = task.subtasks.length;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-4 pr-2" onClick={(e) => handleToggleComplete(e, task)}>
                        <button className={`flex h-5 w-5 items-center justify-center rounded border ${
                          task.status === 'concluida'
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                            : 'border-slate-700 bg-slate-800 text-transparent hover:border-emerald-500'
                        }`}>
                          <Check className="h-3 w-3 stroke-[3]" />
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={task.status === 'concluida' ? 'line-through text-slate-500' : ''}>
                            {task.title}
                          </span>
                          {task.gcalSynced && <CalendarCheck className="h-3 w-3 text-emerald-400 shrink-0" />}
                          {task.slackSynced && <MessageSquare className="h-3 w-3 text-indigo-400 shrink-0" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">{task.category}</td>
                      <td className="py-3.5 px-3">{getPriorityBadge(task.priority)}</td>
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        {task.dueDate} às {task.dueTime}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} (${Math.round((completedSubtasks/totalSubtasks)*100)}%)` : '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <img src={task.assignee.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                          <span className="text-xs truncate max-w-[100px]">{task.assignee.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 pl-2 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CALENDAR & AGENDA VIEW */}
      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-100">Visão de Prazos do Calendário</h3>
              <p className="text-xs text-slate-400">Sincronizado automaticamente com Google Calendar e alertas preditivos.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Sincronização Ativa (Hoje às 15:10)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {['Hoje', 'Amanhã', 'Esta Semana'].map((timeframe, idx) => {
              const items = idx === 0 
                ? filteredTasks.filter(t => t.dueDate === todayStr)
                : idx === 1 
                ? filteredTasks.filter(t => t.dueDate > todayStr)
                : filteredTasks;

              return (
                <div key={timeframe} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">{timeframe}</span>
                    <span className="text-xs text-slate-400 font-medium">{items.length} entregas</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-indigo-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{t.title}</span>
                          {getPriorityBadge(t.priority)}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Horário: {t.dueTime}</span>
                          <span className="capitalize">{t.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
