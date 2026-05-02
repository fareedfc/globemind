import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushPlayerState } from '../lib/sync';
import { getCurrentUserId } from '../lib/userId';

export const MAX_LIVES = 10;
export const DAILY_START_LIVES = 5;
export const FREE_DAILY_LEVELS = 10;
// TESTING TIP: temporarily set this to 60_000 (1 minute) to test lives refill
// and paywall "Go play" behaviour without waiting 30 mins. Change back before shipping.
export const REFILL_MS = 15 * 60 * 1000; // 15 minutes

interface PlayerState {
  score: number;
  lives: number;
  streak: number;
  lastPlayedDate: string | null;
  livesResetDate: string | null;
  nextRefillAt: number | null;
  isPremium: boolean;
  dailyLevelsPlayed: number;
  dailyLevelsDate: string | null;
  hapticsEnabled: boolean;
  addScore: (pts: number) => void;
  toggleHaptics: () => void;
  useLive: () => void;
  refillLive: () => void;
  recordPlay: () => void;
  checkDailyLivesReset: () => void;
  setPremium: (val: boolean) => void;
  incrementDailyLevels: () => void;
  getDailyLevelsToday: () => number;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      score: 0,
      lives: 99, // TESTING — revert to DAILY_START_LIVES before shipping
      streak: 0,
      lastPlayedDate: null,
      livesResetDate: null,
      nextRefillAt: null,
      isPremium: false,
      dailyLevelsPlayed: 0,
      dailyLevelsDate: null,
      hapticsEnabled: true,

      addScore: (pts) => {
        set((s) => ({ score: s.score + pts }));
        const userId = getCurrentUserId();
        if (userId) {
          const s = usePlayerStore.getState();
          pushPlayerState(userId, {
            score: s.score, lives: s.lives, streak: s.streak,
            lastPlayedDate: s.lastPlayedDate, nextRefillAt: s.nextRefillAt,
            isPremium: s.isPremium, dailyCount: s.dailyLevelsPlayed, dailyDate: s.dailyLevelsDate,
          });
        }
      },

      useLive: () =>
        set((s) => {
          if (s.isPremium) return {};
          const newLives = Math.max(0, s.lives - 1);
          const nextRefillAt =
            s.nextRefillAt ?? (newLives < MAX_LIVES ? Date.now() + REFILL_MS : null);
          return { lives: newLives, nextRefillAt };
        }),

      refillLive: () =>
        set((s) => {
          if (s.isPremium) return {};
          const newLives = Math.min(MAX_LIVES, s.lives + 1);
          const nextRefillAt = newLives < MAX_LIVES ? Date.now() + REFILL_MS : null;
          return { lives: newLives, nextRefillAt };
        }),

      // Resets lives to DAILY_START_LIVES each new day and starts refill timer immediately.
      checkDailyLivesReset: () =>
        set((s) => {
          if (s.isPremium) return {};
          const today = new Date().toISOString().slice(0, 10);
          if (s.livesResetDate === today) return {};
          return {
            lives: DAILY_START_LIVES,
            nextRefillAt: Date.now() + REFILL_MS,
            livesResetDate: today,
          };
        }),

      recordPlay: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          if (s.lastPlayedDate === today) return {};
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          const streak = s.lastPlayedDate === yesterday ? s.streak + 1 : 1;
          return { streak, lastPlayedDate: today };
        }),

      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),

      setPremium: (val) => {
        set({ isPremium: val });
        const userId = getCurrentUserId();
        if (userId) {
          const s = usePlayerStore.getState();
          pushPlayerState(userId, {
            score: s.score, lives: s.lives, streak: s.streak,
            lastPlayedDate: s.lastPlayedDate, nextRefillAt: s.nextRefillAt,
            isPremium: val, dailyCount: s.dailyLevelsPlayed, dailyDate: s.dailyLevelsDate,
          });
        }
      },

      incrementDailyLevels: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          if (s.dailyLevelsDate !== today) {
            return { dailyLevelsPlayed: 1, dailyLevelsDate: today };
          }
          return { dailyLevelsPlayed: s.dailyLevelsPlayed + 1 };
        }),

      getDailyLevelsToday: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        return s.dailyLevelsDate === today ? s.dailyLevelsPlayed : 0;
      },
    }),
    {
      name: 'thinkpop-player',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
