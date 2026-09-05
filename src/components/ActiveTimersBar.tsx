import React from 'react';
import { ActiveTimer } from '../hooks/useCookTimer';
import { Play, Pause, RotateCcw, X, Plus, Bell, Timer } from 'lucide-react';
import { triggerHaptic } from '../utils/audioSynth';

interface ActiveTimersBarProps {
  timers: ActiveTimer[];
  onPause: (stepId: string) => void;
  onResume: (stepId: string) => void;
  onReset: (stepId: string) => void;
  onStop: (stepId: string) => void;
  onAddMinute: (stepId: string) => void;
  formatTime: (sec: number) => string;
}

export const ActiveTimersBar: React.FC<ActiveTimersBarProps> = ({
  timers,
  onPause,
  onResume,
  onReset,
  onStop,
  onAddMinute,
  formatTime,
}) => {
  if (timers.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto bg-[#2A1C15] text-[#FDFBF7] rounded-2xl p-3 shadow-2xl border border-[#D4AF37]/30 backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <span className="text-xs uppercase tracking-wider font-semibold text-[#E6C875]">
            Активные таймеры ({timers.length})
          </span>
        </div>
        <span className="text-[10px] text-amber-200/60 font-san-francisco">
          Фоновый отсчет
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {timers.map((timer) => {
          const isDone = timer.remainingSeconds === 0;
          const progressPercent = Math.max(
            0,
            Math.min(100, ((timer.initialSeconds - timer.remainingSeconds) / timer.initialSeconds) * 100)
          );

          return (
            <div
              key={timer.id}
              className={`p-2.5 rounded-xl transition-all ${
                isDone
                  ? 'bg-amber-600/30 border border-amber-400 animate-bounce'
                  : 'bg-[#3B291F] border border-amber-900/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#D4AF37] text-[#2A1C15] font-bold">
                      Шаг {timer.stepNumber}
                    </span>
                    <span className="text-xs font-medium text-amber-100 truncate">
                      {timer.recipeTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-base font-bold ${
                      isDone ? 'text-amber-300 animate-pulse' : 'text-amber-100'
                    }`}
                  >
                    {isDone ? (
                      <span className="flex items-center gap-1 text-xs text-amber-300">
                        <Bell className="w-3.5 h-3.5 animate-spin" /> Готово!
                      </span>
                    ) : (
                      formatTime(timer.remainingSeconds)
                    )}
                  </span>

                  {/* Timer Action Buttons */}
                  <div className="flex items-center gap-1">
                    {!isDone && (
                      <button
                        onClick={() => {
                          triggerHaptic(20);
                          timer.isRunning ? onPause(timer.stepId) : onResume(timer.stepId);
                        }}
                        className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 active:scale-95 transition"
                        title={timer.isRunning ? 'Пауза' : 'Старт'}
                      >
                        {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => onAddMinute(timer.stepId)}
                      className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[10px] font-bold active:scale-95 transition flex items-center gap-0.5"
                      title="+1 минута"
                    >
                      <Plus className="w-3 h-3" />1м
                    </button>

                    <button
                      onClick={() => onReset(timer.stepId)}
                      className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-300 active:scale-95 transition"
                      title="Сброс"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onStop(timer.stepId)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 active:scale-95 transition"
                      title="Закрыть"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 w-full bg-amber-950/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isDone ? 'bg-amber-400' : 'bg-[#D4AF37]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
