import React from 'react';
import { 
  CheckSquare, 
  BarChart3, 
  Network, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Tag, 
  Sparkles, 
  FolderKanban,
  HardDrive,
  Users,
  Flame,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Task, TaskCategory } from '../types.ts';
import nanoBananaImg from '../assets/images/nano_banana_mascot_1787956938612.jpg';
import { useAuth } from '../hooks/useAuth.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: TaskCategory | 'Todas';
  setSelectedCategory: (cat: TaskCategory | 'Todas') => void;
  tasks: Task[];
  onOpenPomodoro: () => void;
  onOpenNanoBanana?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  tasks,
  onOpenPomodoro,
  onOpenNanoBanana,
}) => {
  const { user, dbUser } = useAuth();
  const pendingCount = tasks.filter(t => t.status !== 'concluida').length;

  const categories: Array<{ name: TaskCategory | 'Todas'; icon: string; count: number }> = [
    { name: 'Todas', icon: '⚡', count: tasks.length },
    { name: 'Trabalho', icon: '💼', count: tasks.filter(t => t.category === 'Trabalho').length },
    { name: 'Projetos', icon: '🚀', count: tasks.filter(t => t.category === 'Projetos').length },
    { name: 'Entregas', icon: '📦', count: tasks.filter(t => t.category === 'Entregas').length },
    { name: 'Vendas', icon: '🛍️', count: tasks.filter(t => t.category === 'Vendas').length },
    { name: 'Finanças', icon: '💰', count: tasks.filter(t => t.category === 'Finanças').length },
    { name: 'Estudos', icon: '📚', count: tasks.filter(t => t.category === 'Estudos').length },
    { name: 'Saúde', icon: '🧘', count: tasks.filter(t => t.category === 'Saúde').length },
  ];

  const navItems = [
    { id: 'tasks', label: 'Tarefas & Entregas', icon: CheckSquare, badge: pendingCount.toString(), badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'store', label: 'Loja & Marketplace', icon: ShoppingBag, badge: 'Postar', badgeColor: 'bg-amber-400/20 text-amber-300' },
    { id: 'my-sales', label: 'Minhas Vendas', icon: TrendingUp, badge: dbUser?.balance ? `R$ ${(dbUser.balance / 100).toFixed(0)}` : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'analytics', label: 'Métricas & IA Digest', icon: BarChart3, badge: 'Pro', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'integrations', label: 'Integrações (Slack, GCal)', icon: Network, badge: 'Ao Vivo', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
    { id: 'security', label: 'Equipe & Auditoria TI', icon: ShieldCheck, badge: 'AES-256', badgeColor: 'bg-purple-500/20 text-purple-300' },
    { id: 'checkout', label: 'Planos & Assinaturas', icon: CreditCard, badge: '-20%', badgeColor: 'bg-amber-500/20 text-amber-300' },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 p-4 border-r border-slate-800/80 bg-slate-950/60">
      
      {/* Primary Navigation */}
      <div className="space-y-1">
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navegação Principal
        </span>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Category Filter (Active when on Tasks view) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Categorias de Tarefas
          </span>
          <Tag className="h-3 w-3 text-slate-400" />
        </div>
        <div className="mt-2 space-y-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  if (activeTab !== 'tasks') setActiveTab('tasks');
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-400/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nano Banana AI Copilot Card */}
      {onOpenNanoBanana && (
        <div 
          onClick={onOpenNanoBanana}
          className="mt-auto group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 p-3.5 shadow-lg transition-all hover:border-amber-400/80 hover:shadow-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-amber-300 shadow-md">
              <img src={nanoBananaImg} alt="Nano Banana" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  Nano Banana
                </span>
                <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                  Foco IA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Assistente de Rotina
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-400 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* Focus & Productivity Widget */}
      <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-950/20 to-slate-900/60 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              Foco Pomodoro
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            25 min
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
          Ative blocos de foco com som ambiente para produzir e entregar sem distrações.
        </p>
        <button
          onClick={onOpenPomodoro}
          id="btn-sidebar-start-focus"
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 py-2 text-xs font-semibold text-amber-300 border border-amber-400/30 transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Iniciar Bloco de Foco</span>
        </button>
      </div>

    </aside>
  );
};
