import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { generateId } from '@/utils/id';
import {
  CycleLogEntry,
  CyclePhase,
  CycleSettings,
  Habit,
  JournalEntry,
  MoodCheckIn,
  Category,
} from '@/types';

const todayKey = (d: Date = new Date()) => format(d, 'yyyy-MM-dd');

interface WellnessState {
  habits: Habit[];
  addHabit: (name: string, emoji: string, category: Category, targetDaysPerWeek: number) => void;
  removeHabit: (id: string) => void;
  toggleHabitToday: (id: string) => void;
  getHabitStreak: (id: string) => number;

  moodCheckIns: MoodCheckIn[];
  logMoodCheckIn: (moodIndex: number, energyIndex: number, note?: string) => void;
  getTodayMoodCheckIn: () => MoodCheckIn | undefined;

  journalEntries: JournalEntry[];
  addJournalEntry: (prompt: string, response: string) => void;

  cycleSettings: CycleSettings;
  setCycleSettings: (s: Partial<CycleSettings>) => void;
  cycleLogs: CycleLogEntry[];
  logCycleDay: (entry: Omit<CycleLogEntry, 'id'>) => void;
  getCurrentCyclePhase: () => CyclePhase | null;
  getCycleAwareSuggestion: () => string | null;
}

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (name, emoji, category, targetDaysPerWeek) => {
        const habit: Habit = {
          id: generateId(),
          name: name.trim(),
          emoji,
          category,
          createdAt: new Date().toISOString(),
          completedDates: [],
          targetDaysPerWeek,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },
      removeHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
      toggleHabitToday: (id) => {
        const key = todayKey();
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== id) return h;
            const has = h.completedDates.includes(key);
            return {
              ...h,
              completedDates: has
                ? h.completedDates.filter((d) => d !== key)
                : [...h.completedDates, key],
            };
          }),
        }));
      },
      getHabitStreak: (id) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return 0;
        const dates = new Set(habit.completedDates);
        let streak = 0;
        let cursor = new Date();
        // If today isn't done yet, start counting from yesterday so an
        // in-progress day doesn't zero out an otherwise-intact streak.
        if (!dates.has(todayKey(cursor))) cursor = addDays(cursor, -1);
        while (dates.has(todayKey(cursor))) {
          streak += 1;
          cursor = addDays(cursor, -1);
        }
        return streak;
      },

      moodCheckIns: [],
      logMoodCheckIn: (moodIndex, energyIndex, note) => {
        const key = todayKey();
        const entry: MoodCheckIn = {
          id: generateId(),
          date: key,
          moodIndex,
          energyIndex,
          note,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          moodCheckIns: [...state.moodCheckIns.filter((m) => m.date !== key), entry],
        }));
      },
      getTodayMoodCheckIn: () => get().moodCheckIns.find((m) => m.date === todayKey()),

      journalEntries: [],
      addJournalEntry: (prompt, response) => {
        const entry: JournalEntry = {
          id: generateId(),
          date: todayKey(),
          prompt,
          response: response.trim(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ journalEntries: [...state.journalEntries, entry] }));
      },

      cycleSettings: {
        isEnabled: false,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        lastPeriodStartDate: null,
      },
      setCycleSettings: (s) => set((state) => ({ cycleSettings: { ...state.cycleSettings, ...s } })),

      cycleLogs: [],
      logCycleDay: (entry) => {
        const withId: CycleLogEntry = { ...entry, id: generateId() };
        set((state) => ({
          cycleLogs: [...state.cycleLogs.filter((c) => c.date !== entry.date), withId],
        }));
      },

      getCurrentCyclePhase: () => {
        const { isEnabled, lastPeriodStartDate, averageCycleLength, averagePeriodLength } =
          get().cycleSettings;
        if (!isEnabled || !lastPeriodStartDate) return null;
        const dayInCycle =
          (differenceInCalendarDays(new Date(), new Date(lastPeriodStartDate)) %
            averageCycleLength +
            averageCycleLength) %
          averageCycleLength;

        if (dayInCycle < averagePeriodLength) return 'menstrual';
        if (dayInCycle < averageCycleLength / 2 - 1) return 'follicular';
        if (dayInCycle < averageCycleLength / 2 + 2) return 'ovulation';
        return 'luteal';
      },

      getCycleAwareSuggestion: () => {
        const phase = get().getCurrentCyclePhase();
        if (!phase) return null;
        const suggestions: Record<CyclePhase, string> = {
          menstrual:
            'Lower-energy phase — good day for lighter tasks, gentle movement, and extra rest if you need it.',
          follicular:
            "Energy tends to build here — a great window to start new projects or tackle harder tasks.",
          ovulation:
            'Often a high-energy, social phase — good for presentations, collaboration, or big pushes.',
          luteal:
            'Energy may start to dip — consider wrapping up loose ends and being extra kind to yourself.',
        };
        return suggestions[phase];
      },
    }),
    {
      name: 'bloomdaily-wellness',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
