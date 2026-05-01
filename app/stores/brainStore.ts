import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushBrainState } from '../lib/sync';
import { getCurrentUserId } from '../lib/userId';
import { calcStrengthDelta } from '../utils/scoring';

export type GameType = 'memory' | 'logic' | 'speed' | 'pattern';

interface DomainScores {
  memory: number;
  logic: number;
  speed: number;
  pattern: number;
}

interface BrainState {
  domains: DomainScores;
  prevDomains: DomainScores;
  weeklyBaseline: number;
  weekStart: string;
  weeklyGamesPlayed: DomainScores;
  weeklyPlayDays: string[];
  recordGame: (
    type: GameType,
    stars: number,
    levelId: number,
    isFirstClear: boolean,
    lastPlayedAt?: number,
  ) => void;
  recordFail: (type: GameType) => void;
  snapshotWeekIfNeeded: (currentScore: number) => void;
}

function getWeekStart(): string {
  const d = new Date();
  const diff = d.getDate() - d.getDay();
  const sun = new Date(d.setDate(diff));
  return sun.toISOString().slice(0, 10);
}

const ZERO_DOMAINS: DomainScores = { memory: 0, logic: 0, speed: 0, pattern: 0 };

export const useBrainStore = create<BrainState>()(
  persist(
    (set, get) => ({
      domains: { memory: 15, logic: 15, speed: 15, pattern: 15 },
      prevDomains: { memory: 15, logic: 15, speed: 15, pattern: 15 },
      weeklyBaseline: 0,
      weekStart: getWeekStart(),
      weeklyGamesPlayed: { ...ZERO_DOMAINS },
      weeklyPlayDays: [],

      recordGame: (type, stars, levelId, isFirstClear, lastPlayedAt) => {
        const delta = calcStrengthDelta(stars, levelId, isFirstClear, lastPlayedAt);
        const today = new Date().toISOString().slice(0, 10);
        set((s) => ({
          domains: {
            ...s.domains,
            [type]: Math.min(100, s.domains[type] + delta),
          },
          weeklyGamesPlayed: {
            ...s.weeklyGamesPlayed,
            [type]: s.weeklyGamesPlayed[type] + 1,
          },
          weeklyPlayDays: s.weeklyPlayDays.includes(today)
            ? s.weeklyPlayDays
            : [...s.weeklyPlayDays, today],
        }));

        const userId = getCurrentUserId();
        if (userId) {
          const { domains, weeklyBaseline, weekStart } = get();
          pushBrainState(userId, { ...domains, weeklyBaseline, weekStart });
        }
      },

      recordFail: (type) => {
        set((s) => ({
          domains: {
            ...s.domains,
            [type]: Math.max(0, s.domains[type] - 1),
          },
        }));
      },

      snapshotWeekIfNeeded: (currentScore) =>
        set((s) => {
          const thisWeek = getWeekStart();
          if (s.weekStart === thisWeek) return {};
          return {
            weeklyBaseline: currentScore,
            weekStart: thisWeek,
            prevDomains: { ...s.domains },
            weeklyGamesPlayed: { ...ZERO_DOMAINS },
            weeklyPlayDays: [],
          };
        }),
    }),
    {
      name: 'thinkpop-brain',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
