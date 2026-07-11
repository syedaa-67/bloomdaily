import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuietHours, ThemePreference } from '@/types';
import {
  cancelDailyEveningCheckIn,
  scheduleDailyEveningCheckIn,
} from '@/services/notificationService';

interface SettingsState {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;

  quietHours: QuietHours;
  setQuietHours: (q: QuietHours) => void;

  eveningCheckInEnabled: boolean;
  eveningCheckInHour: number;
  eveningCheckInMinute: number;
  setEveningCheckIn: (enabled: boolean, hour?: number, minute?: number) => Promise<void>;

  focusModeAmbientSound: 'none' | 'rain' | 'lofi' | 'whitenoise';
  setFocusModeAmbientSound: (v: SettingsState['focusModeAmbientSound']) => void;

  defaultReminderMinutesBefore: number;
  setDefaultReminderMinutesBefore: (n: number) => void;

  analyticsOptIn: boolean;
  setAnalyticsOptIn: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themePreference: 'system',
      setThemePreference: (pref) => set({ themePreference: pref }),

      quietHours: { isEnabled: false, startHour: 22, endHour: 7 },
      setQuietHours: (q) => set({ quietHours: q }),

      eveningCheckInEnabled: true,
      eveningCheckInHour: 20,
      eveningCheckInMinute: 0,
      setEveningCheckIn: async (enabled, hour, minute) => {
        const h = hour ?? get().eveningCheckInHour;
        const m = minute ?? get().eveningCheckInMinute;
        if (enabled) {
          await scheduleDailyEveningCheckIn(h, m).catch(() => {});
        } else {
          await cancelDailyEveningCheckIn().catch(() => {});
        }
        set({ eveningCheckInEnabled: enabled, eveningCheckInHour: h, eveningCheckInMinute: m });
      },

      focusModeAmbientSound: 'none',
      setFocusModeAmbientSound: (v) => set({ focusModeAmbientSound: v }),

      defaultReminderMinutesBefore: 0,
      setDefaultReminderMinutesBefore: (n) => set({ defaultReminderMinutesBefore: n }),

      analyticsOptIn: false,
      setAnalyticsOptIn: (v) => set({ analyticsOptIn: v }),
    }),
    {
      name: 'bloomdaily-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
