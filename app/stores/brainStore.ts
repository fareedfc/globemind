import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushBrainState } from '../lib/sync';
import { getCurrentUserId } from '../lib/userId';

export type GameType = 'memory' | 'logic' | 'speed' | 'pattern';

interface DomainScores {
  memory: number;
  logic: number;
  speed: number;
  pattern: number;
}

interface BrainState {
  domains: DomainScores;
  weeklyBaseline: number;
  weekStart: string;
  recordGame: (type: GameType, stars: number) => void;
  snapshotWeekIfNeeded: (currentScore: number) => void;
}

const STAR_DELTA: Record<number, number> = { 1: 3, 2: 6, 3: 10 };

function getWeekStart(): string {
  const d = new Date();
  const diff = d.getDate() - d.getDay();
  const sun = new Date(d.setDate(diff));
  return sun.toISOString().slice(0, 10);
}

export const useBrainStore = create<BrainState>()(
  persist(
    (set, get) => ({
      domains: { memory: 62, logic: 55, speed: 40, pattern: 38 },
      weeklyBaseline: 0,
      weekStart: getWeekStart(),

      recordGame: (type, stars) => {
        set((s) => ({
          domains: {
            ...s.domains,
            [type]: Math.min(100, s.domains[type] + (STAR_DELTA[stars] ?? 3)),
          },
        }));

        const userId = getCurrentUserId();
        if (userId) {
          const { domains, weeklyBaseline, weekStart } = get();
          pushBrainState(userId, { ...domains, weeklyBaseline, weekStart });
        }
      },

      snapshotWeekIfNeeded: (currentScore) =>
        set((s) => {
          const thisWeek = getWeekStart();
          if (s.weekStart === thisWeek) return {};
          return { weeklyBaseline: currentScore, weekStart: thisWeek };
        }),
    }),
    {
      name: 'thinkpop-brain',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
