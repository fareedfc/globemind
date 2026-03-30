import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAX_LIVES = 5;
// TESTING TIP: temporarily set this to 60_000 (1 minute) to test lives refill
// and paywall "Go play" behaviour without waiting 30 mins. Change back before shipping.
export const REFILL_MS = 30 * 60 * 1000; // 30 minutes

interface PlayerState {
  miles: number;
  lives: number;
  streak: number;
  lastPlayedDate: string | null;
  nextRefillAt: number | null;
  addMiles: (pts: number) => void;
  useLive: () => void;
  refillLive: () => void;
  recordPlay: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      miles: 0,
      lives: 5,
      streak: 0,
      lastPlayedDate: null,
      nextRefillAt: null,

      addMiles: (pts) => set((s) => ({ miles: s.miles + pts })),

      useLive: () =>
        set((s) => {
          const newLives = Math.max(0, s.lives - 1);
          const nextRefillAt =
            s.nextRefillAt ?? (newLives < MAX_LIVES ? Date.now() + REFILL_MS : null);
          return { lives: newLives, nextRefillAt };
        }),

      refillLive: () =>
        set((s) => {
          const newLives = Math.min(MAX_LIVES, s.lives + 1);
          const nextRefillAt = newLives < MAX_LIVES ? Date.now() + REFILL_MS : null;
          return { lives: newLives, nextRefillAt };
        }),

      recordPlay: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          if (s.lastPlayedDate === today) return {};
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          const streak = s.lastPlayedDate === yesterday ? s.streak + 1 : 1;
          return { streak, lastPlayedDate: today };
        }),
    }),
    {
      name: 'globemind-player',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
