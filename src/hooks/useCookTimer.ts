import { useState, useEffect, useCallback, useRef } from 'react';
import { playTimerCompletionSound, triggerHaptic } from '../utils/audioSynth';

export interface ActiveTimer {
  id: string; // unique timer instance id
  stepId: string;
  stepNumber: number;
  recipeTitle: string;
  initialSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  endTimeTimestamp: number | null; // For Date.now() delta computation in background
}

export function useCookTimer() {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Core timer tick listener checking background delta via Date.now()
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setActiveTimers((prevTimers) => {
        let hasChanges = false;
        const now = Date.now();

        const updated = prevTimers.map((timer) => {
          if (!timer.isRunning || !timer.endTimeTimestamp) return timer;

          const diffMs = timer.endTimeTimestamp - now;
          const remainingSec = Math.max(0, Math.ceil(diffMs / 1000));

          if (remainingSec !== timer.remainingSeconds) {
            hasChanges = true;
          }

          if (remainingSec === 0 && timer.remainingSeconds > 0) {
            // Sound the alert chime when timer completes!
            playTimerCompletionSound();
            return {
              ...timer,
              remainingSeconds: 0,
              isRunning: false,
              endTimeTimestamp: null,
            };
          }

          return {
            ...timer,
            remainingSeconds: remainingSec,
          };
        });

        return hasChanges ? updated : prevTimers;
      });
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = useCallback((stepId: string, stepNumber: number, recipeTitle: string, durationSeconds: number) => {
    triggerHaptic(40);
    setActiveTimers((prev) => {
      const existingIdx = prev.findIndex((t) => t.stepId === stepId);
      const now = Date.now();
      const endTime = now + durationSeconds * 1000;

      const newTimer: ActiveTimer = {
        id: `timer_${stepId}`,
        stepId,
        stepNumber,
        recipeTitle,
        initialSeconds: durationSeconds,
        remainingSeconds: durationSeconds,
        isRunning: true,
        endTimeTimestamp: endTime,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newTimer;
        return copy;
      }
      return [...prev, newTimer];
    });
  }, []);

  const pauseTimer = useCallback((stepId: string) => {
    triggerHaptic(30);
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.stepId === stepId && t.isRunning) {
          return {
            ...t,
            isRunning: false,
            endTimeTimestamp: null,
          };
        }
        return t;
      })
    );
  }, []);

  const resumeTimer = useCallback((stepId: string) => {
    triggerHaptic(30);
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.stepId === stepId && !t.isRunning && t.remainingSeconds > 0) {
          const now = Date.now();
          return {
            ...t,
            isRunning: true,
            endTimeTimestamp: now + t.remainingSeconds * 1000,
          };
        }
        return t;
      })
    );
  }, []);

  const resetTimer = useCallback((stepId: string) => {
    triggerHaptic(30);
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.stepId === stepId) {
          const now = Date.now();
          return {
            ...t,
            remainingSeconds: t.initialSeconds,
            isRunning: true,
            endTimeTimestamp: now + t.initialSeconds * 1000,
          };
        }
        return t;
      })
    );
  }, []);

  const stopTimer = useCallback((stepId: string) => {
    triggerHaptic(30);
    setActiveTimers((prev) => prev.filter((t) => t.stepId !== stepId));
  }, []);

  const addExtraMinute = useCallback((stepId: string) => {
    triggerHaptic(30);
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.stepId === stepId) {
          const newRemaining = t.remainingSeconds + 60;
          const newEndTime = t.isRunning ? Date.now() + newRemaining * 1000 : null;
          return {
            ...t,
            initialSeconds: t.initialSeconds + 60,
            remainingSeconds: newRemaining,
            endTimeTimestamp: newEndTime,
          };
        }
        return t;
      })
    );
  }, []);

  const formatTime = useCallback((totalSeconds: number): string => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    activeTimers,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    addExtraMinute,
    formatTime,
  };
}
