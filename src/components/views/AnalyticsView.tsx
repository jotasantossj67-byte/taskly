import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  Clock, 
  Download, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { AnalyticsPeriod, Task } from '../../types';
import { analyticsData } from '../../services/mockData';
import { generateProductivityDigest } from '../../services/geminiService';
import { sounds } from '../../services/soundEffects';

interface AnalyticsViewProps {
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('semanal');
  const [aiDigest, setAiDigest] = useState<string>('');
  const [loadingDigest, setLoadingDigest] = useState(false);

  const completedTasks = tasks.filter(t => t.status === 'concluida').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleGenerateAiDigest = async () => {
    setLoadingDigest(true);
    try {
      const digest = await generateProductivityDigest(tasks);
      setAiDigest(digest);
      sounds.playComplete();
    } catch {
      setAiDigest('Mantenha o foco nas tarefas de alta prioridade marcadas para hoje!');
    } finally {
      setLoadingDigest(false);
    }
  };

  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Periodo,Concluidas,TaxaSucesso,FocoHoras\n"
      + analyticsData.semanal.map(e => `${e.period},${e.concluidas},${e.taxa}%,${e.focoHoras}h`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Taskly_Relatorio_Desempenho_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sounds.playComplete();
  };

  interface ChartPoint {
    name: string;
    Concluídas: number;
    FocoMinutos?: number;
    Score?: number;
    Pendentes?: number;
    Taxa?: number;
    FocoHoras?: number;
    NoPrazo?: number;
    Velocity?: number;
  }

  const getChartData = (): ChartPoint[] => {
    switch (period) {
      case 'diario':
        return analyticsData.diario.map(d => ({ name: d.time, Concluídas: d.concluidas, FocoMinutos: d.focoMinutos, Score: d.score }));
      case 'semanal':
        return analyticsData.semanal.map(d => ({ name: d.period, Concluídas: d.concluidas, Pendentes: d.pendentes, Taxa: d.taxa, FocoHoras: d.focoHoras }));
      case 'mensal':
        return analyticsData.mensal.map(d => ({ name: d.period, Concluídas: d.concluidas, Taxa: d.taxa, NoPrazo: d.entregasNoPrazo }));
      case 'trimestral':
        return analyticsData.trimestral.map(d => ({ name: d.period, Concluídas: d.concluidas, Taxa: d.taxa, Velocity: d.velocity }));
      case 'anual':
        return analyticsData.anual.map(d => ({ name: d.period, Concluídas: d.concluidas, Taxa: d.taxa }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header & Period Selector (Diário, Semanal, Mensal, Trimestral, Anual) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <h2 className="font-['Outfit',sans-serif] text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <span>Métricas & Gráficos de Desempenho</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o cumprimento de prazos, velocidade de execução e volume de entregas.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
          {(['diario', 'semanal', 'mensal', 'trimestral', 'anual'] as AnalyticsPeriod[]).map((p) => {
            const labels: Record<AnalyticsPeriod, string> = {
              diario: 'Diário',
              semanal: 'Semanal',
              mensal: 'Mensal',
              trimestral: 'Trimestral',
              anual: 'Anual'
            };
            const isSelected = period === p;
            return (
              <button
                key={p}
                id={`btn-period-${p}`}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Taxa de Conclusão</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              {completionRate}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> +12%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {completedTasks} de {totalTasks} tarefas finalizadas
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Score de Produtividade</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              91.4
            </span>
            <span className="text-[11px] font-semibold text-indigo-300">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Excelente consistência de fluxo
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Horas em Foco Profundo</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              38.5h
            </span>
            <span className="text-[11px] font-semibold text-cyan-400 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> +4.2h
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Média de 7.7h por dia útil
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Entregas no Prazo</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
              96.8%
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">0 atrasos graves</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Otimizado via Alertas Inteligentes
          </span>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress & Completion Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Evolução de Entregas & Foco ({period.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-400">Volume de tarefas concluídas vs metas do período</p>
            </div>
            <button
              onClick={handleExportReport}
              id="btn-export-analytics-csv"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFoco" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Concluídas" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConcluidas)" />
                {period === 'diario' && <Area type="monotone" dataKey="Score" stroke="#10b981" strokeWidth={2} fillOpacity={0.4} fill="#10b981" />}
                {period === 'semanal' && <Area type="monotone" dataKey="Pendentes" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.3} fill="#f59e0b" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Distribuição por Categoria</h3>
            <p className="text-xs text-slate-400">Onde seu tempo e energia foram alocados</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analyticsData.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            {analyticsData.categoryBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate">{c.name}: {c.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Row: Skills Radar & AI Predictive Digest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Radar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="font-semibold text-slate-100 text-sm">Métricas de Competência & Fluxo</h3>
          <p className="text-xs text-slate-400">Equilíbrio operacional em 6 dimensões estratégicas</p>
          
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analyticsData.skillsRadar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                <Radar name="Performance" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gemini AI Predictive Digest */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Taskly AI • Resumo Preditivo</h3>
                  <span className="text-[10px] text-cyan-300 font-semibold">Gemini 2.5 Flash Engine</span>
                </div>
              </div>
              <button
                onClick={handleGenerateAiDigest}
                disabled={loadingDigest}
                id="btn-refresh-ai-digest"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingDigest ? 'animate-spin' : ''}`} />
                <span>Atualizar Diagnóstico</span>
              </button>
            </div>

            <div className="rounded-xl border border-indigo-500/20 bg-slate-950/60 p-4 text-xs text-slate-200 leading-relaxed min-h-[140px] flex items-center">
              {loadingDigest ? (
                <div className="flex items-center gap-3 text-cyan-300">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Analisando prazos, histórico de conclusões e riscos com Gemini AI...</span>
                </div>
              ) : aiDigest ? (
                <div className="whitespace-pre-line">{aiDigest}</div>
              ) : (
                <p className="text-slate-400">
                  Clique no botão para gerar uma análise personalizada com base nas suas tarefas ativas, histórico de conclusões e prazos críticos da semana.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Dica de ouro: Blocos de foco pela manhã aumentam em 40% a taxa de conclusão.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
