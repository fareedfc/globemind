import { create } from 'zustand';

interface UIState {
  worldIdx: number;
  setWorldIdx: (idx: number) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  worldIdx: 0,
  setWorldIdx: (idx) => set({ worldIdx: idx }),
}));
