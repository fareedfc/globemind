import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushCompletion, pushCurrentLevel } from '../lib/sync';
import { getCurrentUserId } from '../lib/userId';
import { getPermissionStatus, scheduleNotifications } from '../lib/notifications';

interface ProgressState {
  currentLevelId: number;
  completions: Record<number, number>;   // levelId → best stars earned
  lastPlayedAt: Record<number, number>;  // levelId → timestamp (ms)
  completeLevel: (id: number, stars: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentLevelId: 1,
      completions: {},
      lastPlayedAt: {},

      completeLevel: (id, stars) => {
        set((s) => ({
          completions: {
            ...s.completions,
            [id]: Math.max(stars, s.completions[id] ?? 0),
          },
          lastPlayedAt: {
            ...s.lastPlayedAt,
            [id]: Date.now(),
          },
          currentLevelId: Math.max(s.currentLevelId, id + 1),
        }));

        const userId = getCurrentUserId();
        if (userId) {
          pushCompletion(userId, id, stars);
          pushCurrentLevel(userId, get().currentLevelId);
        }

        // Keep streak notification copy current after each play
        getPermissionStatus().then(status => {
          if (status === 'granted') {
            const { streak } = require('./playerStore').usePlayerStore.getState();
            scheduleNotifications(streak);
          }
        });
      },
    }),
    {
      name: 'thinkpop-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
