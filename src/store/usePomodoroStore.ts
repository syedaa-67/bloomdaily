import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';
import { PomodoroSession } from '@/types';

interface PomodoroState {
  sessions: PomodoroSession[];
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  setDurations: (focus: number, brk: number, longBreak: number, untilLong: number) => void;
  logCompletedFocusBlock: (taskId: string | null) => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      sessions: [],
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      sessionsUntilLongBreak: 4,

      setDurations: (focus, brk, longBreak, untilLong) =>
        set({ focusMinutes: focus, breakMinutes: brk, longBreakMinutes: longBreak, sessionsUntilLongBreak: untilLong }),

      logCompletedFocusBlock: (taskId) => {
        const today = get().sessions.find(
          (s) => s.taskId === taskId && s.startedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)
        );
        if (today) {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === today.id ? { ...s, completedFocusBlocks: s.completedFocusBlocks + 1 } : s
            ),
          }));
        } else {
          const session: PomodoroSession = {
            id: generateId(),
            taskId,
            focusMinutes: get().focusMinutes,
            breakMinutes: get().breakMinutes,
            completedFocusBlocks: 1,
            startedAt: new Date().toISOString(),
          };
          set((state) => ({ sessions: [...state.sessions, session] }));
        }
      },
    }),
    {
      name: 'bloomdaily-pomodoro',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
