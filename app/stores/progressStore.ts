import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressState {
  currentLevelId: number;
  completions: Record<number, number>; // levelId → stars earned
  completeLevel: (id: number, stars: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      currentLevelId: 4,
      completions: { 1: 3, 2: 3, 3: 2 },
      completeLevel: (id, stars) =>
        set((s) => ({
          completions: {
            ...s.completions,
            [id]: Math.max(stars, s.completions[id] ?? 0), // keep best stars
          },
          currentLevelId: Math.max(s.currentLevelId, id + 1),
        })),
    }),
    {
      name: 'globemind-progress',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
