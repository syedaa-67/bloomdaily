import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/id';
import { UserProfile } from '@/types';
import { isFirebaseConfigured, signInWithEmail, signOutFirebase, signUpWithEmail } from '@/services/firebase';
import { startSync, stopSync } from '@/services/syncEngine';

interface UserState {
  profile: UserProfile | null;
  isFirebaseAvailable: boolean;
  startGuestProfile: (displayName: string) => void;
  completeOnboarding: (goals: string[], userType: UserProfile['userType']) => void;
  updateDisplayName: (name: string) => void;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isFirebaseAvailable: isFirebaseConfigured,

      startGuestProfile: (displayName) => {
        set({
          profile: {
            id: generateId(),
            displayName: displayName || 'Friend',
            goals: [],
            userType: 'student',
            onboardingComplete: false,
            authMode: 'guest',
            email: null,
            createdAt: new Date().toISOString(),
          },
        });
      },

      completeOnboarding: (goals, userType) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, goals, userType, onboardingComplete: true } });
      },

      updateDisplayName: (name) => {
        const current = get().profile;
        if (!current) return;
        set({ profile: { ...current, displayName: name } });
      },

      signUp: async (email, password, displayName) => {
        const user = await signUpWithEmail(email, password);
        set({
          profile: {
            id: user.uid,
            displayName: displayName || 'Friend',
            goals: [],
            userType: 'student',
            onboardingComplete: false,
            authMode: 'firebase',
            email: user.email,
            createdAt: new Date().toISOString(),
          },
        });
        startSync(user.uid).catch(() => {});
      },

      signIn: async (email, password) => {
        const user = await signInWithEmail(email, password);
        const existing = get().profile;
        set({
          profile: {
            id: user.uid,
            displayName: existing?.displayName ?? 'Friend',
            goals: existing?.goals ?? [],
            userType: existing?.userType ?? 'student',
            onboardingComplete: existing?.onboardingComplete ?? false,
            authMode: 'firebase',
            email: user.email,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
          },
        });
        startSync(user.uid).catch(() => {});
      },

      signOut: async () => {
        const current = get().profile;
        if (current?.authMode === 'firebase') {
          await signOutFirebase().catch(() => {});
        }
        stopSync();
        set({ profile: null });
      },
    }),
    {
      name: 'bloomdaily-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
