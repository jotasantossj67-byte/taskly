import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Check, 
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { SmartAlert } from '../../types';
import { sounds } from '../../services/soundEffects';

interface SmartAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SmartAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onSelectTaskId: (taskId: string) => void;
}

export const SmartAlertsDrawer: React.FC<SmartAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectTaskId,
}) => {
  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.read).length;

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'deadline':
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case 'smart_suggestion':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4 text-indigo-400" />;
      case 'calendar':
        return <CalendarCheck className="h-4 w-4 text-emerald-400" />;
      case 'security':
        return <ShieldCheck className="h-4 w-4 text-purple-400" />;
      default:
        return <Bell className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
      >
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-['Outfit',sans-serif] text-base font-bold text-white">
                  Alertas Inteligentes Taskly
                </h3>
                <span className="text-xs text-slate-400">
                  {unreadCount} não {unreadCount === 1 ? 'lido' : 'lidos'}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Notificações em tempo real</span>
              <button
                onClick={() => {
                  onMarkAllAsRead();
                  sounds.playComplete();
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                Nenhum alerta ativo no momento. Tudo sob controle!
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    alert.read
                      ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                      : 'border-indigo-500/40 bg-slate-950 shadow-md shadow-indigo-950/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 rounded-lg bg-slate-900 p-1.5 border border-slate-800">
                      {getAlertIcon(alert.type)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-100">
                          {alert.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2">
                        {alert.taskId && (
                          <button
                            onClick={() => {
                              onSelectTaskId(alert.taskId!);
                              onClose();
                            }}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Abrir Tarefa Relacionada &rarr;
                          </button>
                        )}

                        {!alert.read && (
                          <button
                            onClick={() => {
                              onMarkAsRead(alert.id);
                              sounds.playComplete();
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-200 ml-auto"
                          >
                            Marcar como lido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Alertas integrados com Webhooks Slack e Google Calendar API.
        </div>

      </motion.div>
    </div>
  );
};
