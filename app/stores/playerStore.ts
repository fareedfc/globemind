import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushPlayerState } from '../lib/sync';
import { getCurrentUserId } from '../lib/userId';

export const MAX_LIVES = 5;
export const FREE_DAILY_LEVELS = 3;
// TESTING TIP: temporarily set this to 60_000 (1 minute) to test lives refill
// and paywall "Go play" behaviour without waiting 30 mins. Change back before shipping.
export const REFILL_MS = 30 * 60 * 1000; // 30 minutes

interface PlayerState {
  score: number;
  lives: number;
  streak: number;
  lastPlayedDate: string | null;
  nextRefillAt: number | null;
  isPremium: boolean;
  dailyLevelsPlayed: number;
  dailyLevelsDate: string | null;
  addScore: (pts: number) => void;
  useLive: () => void;
  refillLive: () => void;
  recordPlay: () => void;
  setPremium: (val: boolean) => void;
  incrementDailyLevels: () => void;
  getDailyLevelsToday: () => number;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      score: 0,
      lives: 5,
      streak: 0,
      lastPlayedDate: null,
      nextRefillAt: null,
      isPremium: false,
      dailyLevelsPlayed: 0,
      dailyLevelsDate: null,

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
          if (s.isPremium) return {}; // premium: unlimited lives
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

      recordPlay: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          if (s.lastPlayedDate === today) return {};
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          const streak = s.lastPlayedDate === yesterday ? s.streak + 1 : 1;
          return { streak, lastPlayedDate: today };
        }),

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
