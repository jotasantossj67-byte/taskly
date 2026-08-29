import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Coffee,
  Brain
} from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface FocusPomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusPomodoroModal: React.FC<FocusPomodoroModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(3);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'whiteNoise'>('none');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sounds.playFocusBell();
      if (mode === 'focus') {
        setCompletedSessions(prev => prev + 1);
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const handleModeChange = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: -24, filter: 'blur(3px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.94, y: -16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 via-indigo-950/30 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
            <h3 className="font-['Outfit',sans-serif] text-lg font-bold text-white">
              Sessão de Foco Taskly
            </h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 p-1.5 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => handleModeChange('focus')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all ${
              mode === 'focus' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>Foco (25m)</span>
          </button>

          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all ${
              mode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="h-3.5 w-3.5" />
            <span>Pausa Curta (5m)</span>
          </button>

          <button
            onClick={() => handleModeChange('longBreak')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all ${
              mode === 'longBreak' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Pausa Longa (15m)</span>
          </button>
        </div>

        {/* Circular Display / Countdown */}
        <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950/80 shadow-inner">
          <div 
            className="absolute inset-0 rounded-full border-4 border-indigo-500 transition-all duration-1000"
            style={{
              clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent}% -50%, ${progressPercent}% 150%, -50% 150%)`,
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <span className="font-['Outfit',sans-serif] text-4xl sm:text-5xl font-extrabold text-white tracking-wider">
              {formatTime(timeLeft)}
            </span>
            <span className="mt-1 text-xs font-semibold text-indigo-300">
              {mode === 'focus' ? 'Produtividade Ativa' : 'Hora de Relaxar'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              if (!isRunning) sounds.playComplete();
            }}
            id="btn-pomodoro-toggle"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 active:scale-95 transition-all"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{isRunning ? 'Pausar' : 'Iniciar Foco'}</span>
          </button>

          <button
            onClick={handleReset}
            title="Reiniciar Timer"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Stats summary */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sessões concluídas hoje: <strong className="text-white">{completedSessions}</strong></span>
          </div>
          <span className="text-cyan-300 font-semibold">{(completedSessions * 25) / 60}h em Flow</span>
        </div>

      </motion.div>
    </div>
  );
};
