// src/stores/progressStore.ts
// Debt & EF milestone tracking.
//
// debtPeakTotal = the highest total debt ever recorded.
// Progress is automatically computed when balances drop below the peak —
// no manual rebaseline needed. Calling updateDebtPeak() on every debt
// change ensures the peak only ever goes up.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProgressState = {
  debtPeakTotal: number;
  debtCompletedDate: string | null;
  efCompletedDate: string | null;

  // Call whenever totalDebt changes — updates peak if current total is higher
  updateDebtPeak: (total: number) => void;
  markDebtCompleted: () => void;
  markEfCompleted: () => void;
  resetAllProgress: () => void;

  // Returns 0–100. Pass current totalDebt.
  debtProgressPct: (currentTotal?: number) => number;
};

const initialState = {
  debtPeakTotal: 0,
  debtCompletedDate: null as string | null,
  efCompletedDate: null as string | null,
};

const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateDebtPeak: (total: number) =>
        set((s) => ({ debtPeakTotal: Math.max(s.debtPeakTotal, Math.max(0, total)) })),

      markDebtCompleted: () => {
        const { debtCompletedDate } = get();
        if (!debtCompletedDate) set({ debtCompletedDate: new Date().toISOString() });
      },

      markEfCompleted: () => {
        const { efCompletedDate } = get();
        if (!efCompletedDate) set({ efCompletedDate: new Date().toISOString() });
      },

      resetAllProgress: () => set({ ...initialState }),

      debtProgressPct: (currentTotal = 0) => {
        const { debtPeakTotal, debtCompletedDate } = get();
        const peak = debtPeakTotal;
        const cur = Math.max(0, Number(currentTotal) || 0);
        if (peak <= 0) return cur === 0 && debtCompletedDate ? 100 : 0;
        if (cur <= 0) return 100;
        return Math.max(0, Math.min(100, (1 - cur / peak) * 100));
      },
    }),
    {
      name: 'savr-progress-v2',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        debtPeakTotal: s.debtPeakTotal,
        debtCompletedDate: s.debtCompletedDate,
        efCompletedDate: s.efCompletedDate,
      }),
    },
  ),
);

export default useProgressStore;
