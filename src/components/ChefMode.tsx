import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { ActiveTimer } from '../hooks/useCookTimer';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Bell,
  Sparkles,
  Volume2
} from 'lucide-react';
import { triggerHaptic, playClickSound } from '../utils/audioSynth';

interface ChefModeProps {
  recipe: Recipe;
  onClose: () => void;
  activeTimers: ActiveTimer[];
  onStartTimer: (stepId: string, stepNumber: number, recipeTitle: string, durationSeconds: number) => void;
  onPauseTimer: (stepId: string) => void;
  onResumeTimer: (stepId: string) => void;
  onResetTimer: (stepId: string) => void;
  onStopTimer: (stepId: string) => void;
  formatTime: (sec: number) => string;
}

export const ChefMode: React.FC<ChefModeProps> = ({
  recipe,
  onClose,
  activeTimers,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onStopTimer,
  formatTime,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const currentStep = recipe.steps[currentStepIndex];
  const activeTimerForCurrentStep = activeTimers.find((t) => t.stepId === currentStep?.id);

  // Swipe gesture support
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentStepIndex < recipe.steps.length - 1) {
        // Swipe left -> Next step
        triggerHaptic(20);
        setCurrentStepIndex((i) => i + 1);
      } else if (diff < 0 && currentStepIndex > 0) {
        // Swipe right -> Prev step
        triggerHaptic(20);
        setCurrentStepIndex((i) => i - 1);
      }
    }
    setTouchStartX(null);
  };

  const toggleStepCompleted = (stepId: string) => {
    triggerHaptic(30);
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-[#120B08] text-[#FDFBF7] flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden font-san-francisco"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-[#120B08] font-bold text-xs uppercase tracking-wider">
              Режим Шеф-повар
            </span>
            <span className="text-xs text-amber-200/60">
              Шаг {currentStepIndex + 1} из {recipe.steps.length}
            </span>
          </div>
          <h2 className="font-serif-title text-lg sm:text-2xl font-bold text-amber-100 truncate mt-1">
            {recipe.title}
          </h2>
        </div>

        <button
          onClick={() => {
            playClickSound();
            triggerHaptic(30);
            onClose();
          }}
          className="p-2.5 rounded-full bg-amber-950 hover:bg-amber-900 text-amber-200 active:scale-95 transition"
          title="Выйти из режима Шеф-повар"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main High-Contrast Large Step Card */}
      <div className="flex-1 my-6 flex flex-col justify-center items-center max-w-3xl mx-auto w-full text-center space-y-6 px-2">
        {/* Step Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/60 border border-amber-600/40 text-amber-300 font-bold text-base">
          <span>Этап {currentStep.stepNumber}</span>
          {completedSteps[currentStep.id] && (
            <span className="text-emerald-400 flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Выполнено
            </span>
          )}
        </div>

        {/* Step Instruction Text (Large high-contrast font for arm's length reading) */}
        <p
          className={`text-xl sm:text-3xl md:text-4xl font-semibold leading-relaxed sm:leading-relaxed text-amber-50 transition-all ${
            completedSteps[currentStep.id] ? 'line-through opacity-50' : ''
          }`}
        >
          {currentStep.instruction}
        </p>

        {/* Step Tip */}
        {currentStep.tips && (
          <div className="p-3 sm:p-4 rounded-2xl bg-amber-950/70 border border-amber-700/50 text-amber-200/90 text-sm sm:text-base max-w-xl">
            💡 <strong>Совет шефа:</strong> {currentStep.tips}
          </div>
        )}

        {/* Step Photo */}
        {currentStep.photoBase64 && (
          <div className="rounded-2xl overflow-hidden border border-amber-900/50 max-h-60 max-w-md shadow-2xl">
            <img src={currentStep.photoBase64} alt={`Шаг ${currentStep.stepNumber}`} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Integrated Circular / Linear Step Timer */}
        {currentStep.timerDurationSeconds && currentStep.timerDurationSeconds > 0 && (
          <div className="w-full max-w-md bg-[#241610] p-4 rounded-2xl border border-amber-800/50 shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-amber-400" />
                Таймер для этого шага
              </span>
              <span>{Math.round(currentStep.timerDurationSeconds / 60)} мин</span>
            </div>

            {activeTimerForCurrentStep ? (
              <div className="space-y-3">
                <div className="text-4xl sm:text-5xl font-mono font-bold text-amber-200 tracking-wider">
                  {formatTime(activeTimerForCurrentStep.remainingSeconds)}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      activeTimerForCurrentStep.isRunning
                        ? onPauseTimer(currentStep.id)
                        : onResumeTimer(currentStep.id);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#120B08] font-bold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition"
                  >
                    {activeTimerForCurrentStep.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{activeTimerForCurrentStep.isRunning ? 'Пауза' : 'Продолжить'}</span>
                  </button>

                  <button
                    onClick={() => onResetTimer(currentStep.id)}
                    className="p-2.5 rounded-xl bg-amber-900/80 text-amber-200 hover:bg-amber-800 active:scale-95 transition"
                    title="Перезапустить"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onStopTimer(currentStep.id)}
                    className="px-3 py-2.5 rounded-xl bg-red-950 text-red-300 hover:bg-red-900 font-bold text-xs active:scale-95 transition"
                  >
                    Сброс
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  onStartTimer(
                    currentStep.id,
                    currentStep.stepNumber,
                    recipe.title,
                    currentStep.timerDurationSeconds!
                  );
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-[#120B08] font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Запустить таймер ({Math.round(currentStep.timerDurationSeconds / 60)} мин)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Step Progress & Swipe Navigation Bar */}
      <div className="space-y-4 border-t border-amber-900/40 pt-4">
        {/* Progress Bar */}
        <div className="w-full bg-amber-950/80 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            disabled={currentStepIndex === 0}
            onClick={() => {
              triggerHaptic(20);
              setCurrentStepIndex((i) => Math.max(0, i - 1));
            }}
            className="px-4 py-3 rounded-2xl bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold text-sm disabled:opacity-30 flex items-center gap-1 active:scale-95 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>

          {/* Mark Step Completed Toggle */}
          <button
            onClick={() => toggleStepCompleted(currentStep.id)}
            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 ${
              completedSteps[currentStep.id]
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{completedSteps[currentStep.id] ? 'Выполнено' : 'Отметить шаг'}</span>
          </button>

          <button
            disabled={currentStepIndex === recipe.steps.length - 1}
            onClick={() => {
              triggerHaptic(20);
              setCurrentStepIndex((i) => Math.min(recipe.steps.length - 1, i + 1));
            }}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-[#120B08] font-bold text-sm disabled:opacity-30 flex items-center gap-1 active:scale-95 transition"
          >
            <span>Вперед</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
