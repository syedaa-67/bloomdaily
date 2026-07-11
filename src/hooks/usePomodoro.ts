import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { usePomodoroStore } from '@/store/usePomodoroStore';

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak' | 'idle';

export function usePomodoro(taskId: string | null) {
  const { focusMinutes, breakMinutes, longBreakMinutes, sessionsUntilLongBreak, logCompletedFocusBlock } =
    usePomodoroStore();

  const [phase, setPhase] = useState<PomodoroPhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationFor = useCallback(
    (p: PomodoroPhase) => {
      if (p === 'focus') return focusMinutes * 60;
      if (p === 'shortBreak') return breakMinutes * 60;
      if (p === 'longBreak') return longBreakMinutes * 60;
      return focusMinutes * 60;
    },
    [focusMinutes, breakMinutes, longBreakMinutes]
  );

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phase]);

  function handlePhaseComplete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (phase === 'focus') {
      const nextCompleted = completedBlocks + 1;
      setCompletedBlocks(nextCompleted);
      logCompletedFocusBlock(taskId);
      const goLong = nextCompleted % sessionsUntilLongBreak === 0;
      const nextPhase: PomodoroPhase = goLong ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setSecondsLeft(durationFor(nextPhase));
    } else {
      setPhase('focus');
      setSecondsLeft(durationFor('focus'));
    }
  }

  const start = useCallback(() => {
    if (phase === 'idle') {
      setPhase('focus');
      setSecondsLeft(durationFor('focus'));
    }
    setIsRunning(true);
  }, [phase, durationFor]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('idle');
    setCompletedBlocks(0);
    setSecondsLeft(durationFor('focus'));
  }, [durationFor]);

  const skip = useCallback(() => {
    handlePhaseComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, completedBlocks]);

  const progress = 1 - secondsLeft / durationFor(phase === 'idle' ? 'focus' : phase);

  return { phase, secondsLeft, isRunning, completedBlocks, progress, start, pause, reset, skip };
}
