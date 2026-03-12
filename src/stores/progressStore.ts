// src/stores/progressStore.ts
// Debt & EF milestone tracking — ported from web progressStore.ts.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProgressState = {
  debtBaselineStartTotal: number;
  debtBaselineStartDate: string | null;
  debtBaselineActive: boolean;
  debtCompletedDate: string | null;
  efCompletedDate: string | null;

  rebaselineDebt: (currentTotal?: number) => void;
  markDebtCompleted: () => void;
  markEfCompleted: () => void;
  resetAllProgress: () => void;

  debtProgressPct: (currentTotal?: number) => number;
};

const initialState = {
  debtBaselineStartTotal: 0,
  debtBaselineStartDate: null as string | null,
  debtBaselineActive: false,
  debtCompletedDate: null as string | null,
  efCompletedDate: null as string | null,
};

const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      rebaselineDebt: (currentTotal = 0) =>
        set({
          debtBaselineStartTotal: Number(currentTotal) || 0,
          debtBaselineStartDate: new Date().toISOString(),
          debtBaselineActive: (Number(currentTotal) || 0) > 0,
        }),

      markDebtCompleted: () =>
        set({
          debtBaselineActive: false,
          debtCompletedDate: new Date().toISOString(),
        }),

      markEfCompleted: () => {
        const { efCompletedDate } = get();
        if (!efCompletedDate) set({ efCompletedDate: new Date().toISOString() });
      },

      resetAllProgress: () => set({ ...initialState }),

      debtProgressPct: (currentTotal = 0) => {
        const { debtBaselineStartTotal, debtBaselineActive, debtCompletedDate } = get();
        const start = Number(debtBaselineStartTotal) || 0;
        const cur = Math.max(0, Number(currentTotal) || 0);
        if (!start && cur === 0 && debtCompletedDate) return 100;
        if (!debtBaselineActive || start <= 0) return 0;
        const paid = Math.max(0, start - cur);
        return Math.max(0, Math.min(100, (paid / start) * 100));
      },
    }),
    {
      name: 'savr-progress-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        debtBaselineStartTotal: s.debtBaselineStartTotal,
        debtBaselineStartDate: s.debtBaselineStartDate,
        debtBaselineActive: s.debtBaselineActive,
        debtCompletedDate: s.debtCompletedDate,
        efCompletedDate: s.efCompletedDate,
      }),
    },
  ),
);

export default useProgressStore;
