import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  initialTasks, 
  initialTeamMembers, 
  initialSmartAlerts 
} from './services/mockData.ts';
import { 
  Task, 
  TaskCategory, 
  TaskStatus, 
  SmartAlert, 
  TeamMember 
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HeaderHeroBanner } from './components/HeaderHeroBanner.tsx';
import { TaskBoardView } from './components/views/TaskBoardView.tsx';
import { StoreMarketplaceView } from './components/views/StoreMarketplaceView.tsx';
import { SalesAndPurchasesView } from './components/views/SalesAndPurchasesView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { IntegrationsView } from './components/views/IntegrationsView.tsx';
import { TeamSecurityView } from './components/views/TeamSecurityView.tsx';
import { CheckoutView } from './components/views/CheckoutView.tsx';
import { TaskDetailModal } from './components/modals/TaskDetailModal.tsx';
import { TaskCreateModal } from './components/modals/TaskCreateModal.tsx';
import { SmartAlertsDrawer } from './components/modals/SmartAlertsDrawer.tsx';
import { FocusPomodoroModal } from './components/modals/FocusPomodoroModal.tsx';
import { NanoBananaWidget } from './components/NanoBananaWidget.tsx';
import { NanoBananaModal } from './components/modals/NanoBananaModal.tsx';
import { sounds } from './services/soundEffects.ts';
import { useAuth } from './hooks/useAuth.tsx';
import { 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  CalendarCheck, 
  Sparkles, 
  X,
  ShoppingBag,
  TrendingUp,
  Database
} from 'lucide-react';

export default function App() {
  const { user, dbUser, getAuthHeaders, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [alerts, setAlerts] = useState<SmartAlert[]>(initialSmartAlerts);
  const [currentUser, setCurrentUser] = useState<TeamMember>(initialTeamMembers[0]);
  
  // Navigation & filtering state
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);

  // Live Toast state
  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: 'slack' | 'calendar' | 'success' | 'sale' } | null>(null);

  const showToast = (title: string, message: string, type: 'slack' | 'calendar' | 'success' | 'sale' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 4500);
  };

  // Sync tasks with PostgreSQL when logged in
  useEffect(() => {
    if (!user || !token) {
      setTasks(initialTasks);
      return;
    }

    const fetchDatabaseTasks = async () => {
      try {
        const res = await fetch('/api/tasks', {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tasks && data.tasks.length > 0) {
            const mappedTasks: Task[] = data.tasks.map((dbT: any) => ({
              id: dbT.id.toString(),
              title: dbT.title,
              description: dbT.description || '',
              category: (dbT.category as TaskCategory) || 'Geral',
              priority: dbT.priority || 'media',
              status: dbT.status || 'pendente',
              dueDate: dbT.dueDate || new Date().toISOString().split('T')[0],
              dueTime: dbT.dueTime || '18:00',
              estimatedMinutes: 60,
              spentMinutes: 0,
              tags: dbT.tags ? dbT.tags.split(',').filter(Boolean) : ['Nuvem'],
              subtasks: [],
              assignee: {
                id: user.uid,
                name: user.displayName || 'Você',
                role: 'Super Admin',
                avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                email: user.email || '',
                department: 'Liderança',
                status: 'online',
                permissions: {
                  canManageTasks: true,
                  canViewAnalytics: true,
                  canManageIntegrations: true,
                  canAccessAuditLogs: true,
                  canManageBilling: true,
                },
              },
              attachments: [],
              recurrence: 'none',
              smartAlertScheduled: true,
              slackSynced: true,
              gcalSynced: true,
              gdriveLinked: false,
              createdAt: dbT.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: dbT.completedAt,
              progressPercent: dbT.status === 'concluida' ? 100 : 0,
            }));
            setTasks(mappedTasks);
          } else {
            // First time user: initialize initial tasks in postgres
            for (const sample of initialTasks.slice(0, 3)) {
              await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...getAuthHeaders(),
                },
                body: JSON.stringify({
                  title: sample.title,
                  description: sample.description,
                  category: sample.category,
                  priority: sample.priority,
                  status: sample.status,
                  dueDate: sample.dueDate,
                  dueTime: sample.dueTime,
                  tags: sample.tags.join(','),
                }),
              });
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar tarefas do PostgreSQL:', err);
      }
    };

    fetchDatabaseTasks();
  }, [user, token]);

  const handleApplyOptimizedOrder = (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    showToast(
      'Ordem Ótima Aplicada!',
      'Suas tarefas foram reorganizadas pelo Nano Banana para maximizar impacto e cumprimento de prazos.',
      'success'
    );
  };

  const handleQuickCreateTaskWithSubtasks = (title: string, subtasksList: string[], priority: Task['priority']) => {
    const today = new Date().toISOString().split('T')[0];
    const subtasks = subtasksList.map((st, i) => ({
      id: `st-nano-${Date.now()}-${i}`,
      title: st,
      completed: false,
    }));

    handleCreateTask({
      title,
      description: 'Gerado e decomposto pelo copiloto Nano Banana AI.',
      category: 'Projetos',
      priority: priority || 'alta',
      status: 'pendente',
      dueDate: today,
      dueTime: '18:00',
      estimatedMinutes: subtasksList.length * 30 || 90,
      spentMinutes: 0,
      tags: ['NanoBanana', 'Otimizado'],
      subtasks,
      assignee: currentUser,
      attachments: [],
      recurrence: 'none',
      smartAlertScheduled: true,
      slackSynced: true,
      gcalSynced: true,
      gdriveLinked: false,
    });
  };

  // Task operations (synced with PostgreSQL if authenticated)
  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progressPercent'>) => {
    let id = `task-${Date.now()}`;
    
    // Save to PostgreSQL if logged in
    if (user && token) {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            title: newTaskData.title,
            description: newTaskData.description,
            category: newTaskData.category,
            priority: newTaskData.priority,
            status: newTaskData.status,
            dueDate: newTaskData.dueDate,
            dueTime: newTaskData.dueTime,
            tags: newTaskData.tags?.join(','),
          }),
        });
        if (res.ok) {
          const d = await res.json();
          id = d.task.id.toString();
        }
      } catch (err) {
        console.error('Erro ao salvar tarefa no banco:', err);
      }
    }

    const newTask: Task = {
      ...newTaskData,
      id,
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);

    if (newTask.smartAlertScheduled) {
      const newAlert: SmartAlert = {
        id: `alert-${Date.now()}`,
        title: `🔔 Prazo Agendado: ${newTask.title}`,
        message: `Entrega marcada para ${newTask.dueDate} às ${newTask.dueTime}. Alerta ativo no Taskly.`,
        type: 'deadline',
        severity: newTask.priority === 'urgente' ? 'critical' : 'info',
        timestamp: 'Agora mesmo',
        read: false,
        taskId: id,
        actionLabel: 'Abrir Tarefa'
      };
      setAlerts([newAlert, ...alerts]);
    }

    showToast(
      'Tarefa Salva com Sucesso!',
      `"${newTask.title}" registrada com persistência e alertas ativos.`,
      'success'
    );
  };

  const handleQuickCreateFromHero = (title: string, subtasksList?: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    const subtasks = subtasksList ? subtasksList.map((st, i) => ({
      id: `st-quick-${Date.now()}-${i}`,
      title: st,
      completed: false
    })) : [];

    handleCreateTask({
      title,
      description: 'Criado via entrada rápida do Taskly AI com análise preditiva.',
      category: 'Trabalho',
      priority: 'alta',
      status: 'pendente',
      dueDate: today,
      dueTime: '18:00',
      estimatedMinutes: 60,
      spentMinutes: 0,
      tags: ['IA', 'SaaS', 'Prioritário'],
      subtasks,
      assignee: currentUser,
      attachments: [],
      recurrence: 'none',
      smartAlertScheduled: true,
      slackSynced: true,
      gcalSynced: true,
      gdriveLinked: false,
      urgencyScore: 85
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          progressPercent: newStatus === 'concluida' ? 100 : t.progressPercent,
          completedAt: newStatus === 'concluida' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    }));

    if (user && token && !isNaN(parseInt(taskId, 10))) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            status: newStatus,
            completedAt: newStatus === 'concluida' ? new Date().toISOString() : null,
          }),
        });
      } catch (err) {
        console.warn('Erro ao sincronizar status no banco:', err);
      }
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(null);

    if (user && token && !isNaN(parseInt(updatedTask.id, 10))) {
      try {
        await fetch(`/api/tasks/${updatedTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            title: updatedTask.title,
            description: updatedTask.description,
            priority: updatedTask.priority,
            category: updatedTask.category,
            status: updatedTask.status,
            dueDate: updatedTask.dueDate,
            dueTime: updatedTask.dueTime,
            tags: updatedTask.tags.join(','),
          }),
        });
      } catch (err) {
        console.warn('Erro ao atualizar tarefa no banco:', err);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
    sounds.playComplete();

    if (user && token && !isNaN(parseInt(taskId, 10))) {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch (err) {
        console.warn('Erro ao excluir no banco:', err);
      }
    }
  };

  // Alerts operations
  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleSelectTaskIdFromAlert = (taskId: string) => {
    const found = tasks.find(t => t.id === taskId);
    if (found) {
      setSelectedTask(found);
    }
  };

  // Integration callbacks
  const handleTriggerSlackTest = (channel: string, message: string) => {
    showToast(
      `Slack (${channel})`,
      message,
      'slack'
    );
  };

  const handleTriggerCalendarSync = () => {
    showToast(
      'Google Calendar Sincronizado',
      `${tasks.length} tarefas e prazos atualizados na sua agenda principal com lembretes automáticos.`,
      'calendar'
    );
  };

  const handlePlanUpgraded = (planName: string) => {
    showToast(
      'Plano Atualizado!',
      `Parabéns! Seu workspace agora possui acesso ao plano ${planName}.`,
      'success'
    );
  };

  const pendingCount = tasks.filter(t => t.status !== 'concluida').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgente' && t.status !== 'concluida').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Figtree',sans-serif] antialiased">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        alerts={alerts}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenCheckout={() => setActiveTab('checkout')}
        onOpenNanoBanana={() => setIsNanoBananaOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tasks={tasks}
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          onOpenNanoBanana={() => setIsNanoBananaOpen(true)}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Marketing banner & AI quick capture */}
                <HeaderHeroBanner
                  onQuickCreateTask={handleQuickCreateFromHero}
                  pendingCount={pendingCount}
                  urgentCount={urgentCount}
                  onOpenAlerts={() => setIsAlertsOpen(true)}
                  onOpenNanoBanana={() => setIsNanoBananaOpen(true)}
                />

                {/* TAB 1: Tasks Board & Grid */}
                <TaskBoardView
                  tasks={tasks}
                  onSelectTask={setSelectedTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                  teamMembers={teamMembers}
                />
              </motion.div>
            )}

            {/* TAB 2: Store & Marketplace (Postar e Vender) */}
            {activeTab === 'store' && (
              <motion.div
                key="store-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <StoreMarketplaceView onGoToSales={() => setActiveTab('my-sales')} />
              </motion.div>
            )}

            {/* TAB 3: Sales Dashboard & Purchases */}
            {activeTab === 'my-sales' && (
              <motion.div
                key="sales-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <SalesAndPurchasesView />
              </motion.div>
            )}

            {/* TAB 4: Performance Analytics & Recharts */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <AnalyticsView tasks={tasks} />
              </motion.div>
            )}

            {/* TAB 5: Integrations (Slack, GCal, GDrive, AI) */}
            {activeTab === 'integrations' && (
              <motion.div
                key="integrations-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <IntegrationsView
                  onTriggerSlackTest={handleTriggerSlackTest}
                  onTriggerCalendarSync={handleTriggerCalendarSync}
                />
              </motion.div>
            )}

            {/* TAB 6: Team, RBAC & Security Audit Logs */}
            {activeTab === 'security' && (
              <motion.div
                key="security-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <TeamSecurityView teamMembers={teamMembers} />
              </motion.div>
            )}

            {/* TAB 7: Plans & Crypto Payment Gateway */}
            {activeTab === 'checkout' && (
              <motion.div
                key="checkout-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <CheckoutView onPlanUpgraded={handlePlanUpgraded} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Interactive Modals & Drawers */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        teamMembers={teamMembers}
      />

      <TaskCreateModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        teamMembers={teamMembers}
      />

      <SmartAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectTaskId={handleSelectTaskIdFromAlert}
      />

      <FocusPomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      {/* Nano Banana Mascot Hub Modal */}
      <NanoBananaModal
        isOpen={isNanoBananaOpen}
        onClose={() => setIsNanoBananaOpen(false)}
        tasks={tasks}
        onApplyOptimizedOrder={handleApplyOptimizedOrder}
        onQuickCreateTaskWithSubtasks={handleQuickCreateTaskWithSubtasks}
        onStartFocusSession={() => setIsPomodoroOpen(true)}
      />

      {/* Floating Nano Banana Companion with Motion */}
      <NanoBananaWidget
        onOpenNanoHub={() => setIsNanoBananaOpen(true)}
        pendingTasksCount={pendingCount}
        urgentTasksCount={urgentCount}
        onQuickOptimize={() => setIsNanoBananaOpen(true)}
      />

      {/* Real-time Dynamic Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
          <div className="mt-0.5 shrink-0">
            {toast.type === 'slack' ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            ) : toast.type === 'calendar' ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <CalendarCheck className="h-4 w-4" />
              </div>
            ) : toast.type === 'sale' ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1 text-xs">
            <h4 className="font-bold text-white">{toast.title}</h4>
            <p className="text-slate-300 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
