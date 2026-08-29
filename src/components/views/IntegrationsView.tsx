import React, { useState } from 'react';
import { 
  Network, 
  Calendar, 
  MessageSquare, 
  HardDrive, 
  Sparkles, 
  Shield, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Send, 
  Key, 
  Lock, 
  Settings2,
  Bell,
  ArrowRight
} from 'lucide-react';
import { IntegrationConfig } from '../../types';
import { initialIntegrations } from '../../services/mockData';
import { sounds } from '../../services/soundEffects';

interface IntegrationsViewProps {
  onTriggerSlackTest: (channel: string, message: string) => void;
  onTriggerCalendarSync: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  onTriggerSlackTest,
  onTriggerCalendarSync,
}) => {
  const [config, setConfig] = useState<IntegrationConfig>(initialIntegrations);
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [sendingSlackTest, setSendingSlackTest] = useState(false);
  const [slackCustomMessage, setSlackCustomMessage] = useState('🔥 Nova entrega urgente atribuída no Taskly: "Revisão de Auditoria Q3". Prazo: Hoje às 18h.');
  const [driveBackingUp, setDriveBackingUp] = useState(false);

  const handleSyncCalendar = () => {
    setSyncingCalendar(true);
    setTimeout(() => {
      setSyncingCalendar(false);
      onTriggerCalendarSync();
      sounds.playComplete();
    }, 1000);
  };

  const handleTestSlack = () => {
    setSendingSlackTest(true);
    setTimeout(() => {
      setSendingSlackTest(false);
      onTriggerSlackTest(config.slack.channelName, slackCustomMessage);
      sounds.playAlert();
    }, 800);
  };

  const handleBackupDrive = () => {
    setDriveBackingUp(true);
    setTimeout(() => {
      setDriveBackingUp(false);
      sounds.playComplete();
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-semibold text-cyan-300 mb-2">
            <Network className="h-3.5 w-3.5" />
            <span>Sincronização Bidirecional & Webhooks Nativos</span>
          </div>
          <h2 className="font-['Outfit',sans-serif] text-xl sm:text-2xl font-bold text-white">
            Central de Integrações & Conectores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Conecte o Taskly aos aplicativos que seu time usa diariamente (Google Calendar, Slack, Google Drive e Gemini AI) para automatizar fluxos e eliminar retrabalho.
          </p>
        </div>

        <button
          onClick={handleSyncCalendar}
          disabled={syncingCalendar}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${syncingCalendar ? 'animate-spin' : ''}`} />
          <span>{syncingCalendar ? 'Sincronizando...' : 'Sincronizar Tudo Agora'}</span>
        </button>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GOOGLE CALENDAR */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Calendar API</h3>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Conectado & Ativo
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-400">
                v3 REST API
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              Exporta automaticamente suas tarefas e entregas como blocos de compromisso na sua agenda do Google com lembretes automáticos de 15 min e 1 hora antes do prazo.
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Calendário Alvo:</span>
                <span className="font-semibold text-cyan-300">{config.googleCalendar.selectedCalendar}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Última Sincronização:</span>
                <span className="text-slate-400">{config.googleCalendar.lastSyncTimestamp}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Lembrete Inteligente (Push):</span>
                <span className="text-emerald-400 font-semibold">Ativado (15m antes)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSyncCalendar}
              disabled={syncingCalendar}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingCalendar ? 'animate-spin' : ''}`} />
              <span>Forçar Sincronia de Prazos</span>
            </button>

            <span className="text-[11px] text-slate-500">OAuth 2.0 Autenticado</span>
          </div>
        </div>

        {/* SLACK REAL-TIME BOT */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Slack Workspace & Webhooks</h3>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Bot Ativo no canal {config.slack.channelName}
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-400">
                Webhooks v2
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              Dispara notificações inteligentes instantâneas para canais da equipe quando tarefas urgentes forem criadas, atrasos forem detectados ou entregas forem concluídas.
            </p>

            {/* Live interactive test dispatcher */}
            <div className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
              <label className="text-[11px] font-semibold text-slate-400">Simulador de Alerta no Slack:</label>
              <input
                type="text"
                value={slackCustomMessage}
                onChange={(e) => setSlackCustomMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleTestSlack}
              disabled={sendingSlackTest}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-all"
            >
              <Send className={`h-3.5 w-3.5 ${sendingSlackTest ? 'animate-bounce' : ''}`} />
              <span>{sendingSlackTest ? 'Enviando ao Slack...' : 'Disparar Teste de Webhook'}</span>
            </button>

            <span className="text-[11px] text-slate-500">Canal #taskly-produtividade</span>
          </div>
        </div>

        {/* GOOGLE DRIVE STORAGE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Drive Cloud Storage</h3>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Backups Automáticos
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-400">
                Drive v3
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              Anexe documentos, planilhas e relatórios de auditoria diretamente aos deveres e tarefas, com sincronização em nuvem criptografada e link direto.
            </p>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Pasta de Backup:</span>
                <span className="font-semibold text-emerald-300">{config.googleDrive.backupFolder}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Espaço Utilizado:</span>
                <span className="text-slate-400">4.8 GB de 50 GB (9.6%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleBackupDrive}
              disabled={driveBackingUp}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${driveBackingUp ? 'animate-spin' : ''}`} />
              <span>{driveBackingUp ? 'Gerando backup...' : 'Fazer Backup Imediato'}</span>
            </button>
            <span className="text-[11px] text-slate-500">Criptografia AES-256</span>
          </div>
        </div>

        {/* GEMINI AI AGENT */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-cyan-300 shadow-md shadow-indigo-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Gemini 2.5 Flash AI Engine</h3>
                  <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Produtividade Acelerada
                  </span>
                </div>
              </div>

              <span className="rounded-md bg-indigo-500/20 px-2 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                Nativo Google
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              Algoritmo preditivo que prevê riscos de atraso com antecedência, decompõe entregas complexas em subtarefas ágeis e gera diagnósticos semanais de produtividade.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800 flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Quebra Inteligente</span>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800 flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Alertas Preditivos</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">Inteligência Ativa em todas as tarefas</span>
            <span className="text-[11px] text-slate-500">Google GenAI SDK</span>
          </div>
        </div>

      </div>

    </div>
  );
};
