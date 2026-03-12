// src/stores/store.ts
// Main store: debts, EF, 401k checkpoint.
// Adapted from web store.ts — uses AsyncStorage instead of localStorage.
// monthlyCash removed: always derived from useBudgetStore().sparePerMonth().

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const asNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export type DebtItem = {
  name: string;
  balance: number;
  apr: number;
};

type StoreState = {
  debtItems: DebtItem[];
  emergencyFundCurrent: number;
  k401Acknowledged: boolean;

  activeDebtsSorted: () => DebtItem[];
  highestAprDebt: () => DebtItem | null;

  setEmergencyFundCurrent: (v: number | string) => void;
  setDebtItems: (next: DebtItem[]) => void;
  updateDebt: (idx: number, patch: Partial<DebtItem>) => void;
  addDebt: () => void;
  removeDebt: (idx: number) => void;
  setK401Acknowledged: (v: boolean) => void;
  resetAll: () => void;
};

const initialState = {
  debtItems: [] as DebtItem[],
  emergencyFundCurrent: 0,
  k401Acknowledged: false,
};

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      activeDebtsSorted() {
        return (get().debtItems || [])
          .map((d) => ({
            name: String(d?.name ?? 'Debt'),
            apr: Math.max(0, asNum(d?.apr)),
            balance: Math.max(0, asNum(d?.balance)),
          }))
          .filter((d) => d.balance > 0)
          .sort((a, b) => b.apr - a.apr || b.balance - a.balance);
      },

      highestAprDebt() {
        return get().activeDebtsSorted()[0] || null;
      },

      setEmergencyFundCurrent(v) {
        set({ emergencyFundCurrent: asNum(v) });
      },

      setDebtItems(next) {
        set({ debtItems: Array.isArray(next) ? next : [] });
      },

      updateDebt(idx, patch) {
        const list = [...(get().debtItems || [])];
        const d = { ...(list[idx] || {}) };
        if (patch.name !== undefined) d.name = patch.name;
        if (patch.balance !== undefined) d.balance = asNum(patch.balance);
        if (patch.apr !== undefined) d.apr = asNum(patch.apr);
        list[idx] = d as DebtItem;
        set({ debtItems: list });
      },

      addDebt() {
        const list = [...(get().debtItems || [])];
        list.push({ name: `CC ${list.length + 1}`, balance: 0, apr: 0 });
        set({ debtItems: list });
      },

      removeDebt(idx) {
        const list = (get().debtItems || []).filter((_, i) => i !== idx);
        set({ debtItems: list });
      },

      setK401Acknowledged(v) {
        set({ k401Acknowledged: !!v });
      },

      resetAll() {
        set({ ...initialState });
      },
    }),
    {
      name: 'savr-store-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: async (state: unknown, _version) => {
        const s: Record<string, unknown> = (state as Record<string, unknown>) || {};
        return {
          ...initialState,
          ...s,
          debtItems: Array.isArray(s.debtItems) ? s.debtItems : [],
          k401Acknowledged: !!s.k401Acknowledged,
        };
      },
      partialize: (s) => ({
        debtItems: s.debtItems,
        emergencyFundCurrent: s.emergencyFundCurrent,
        k401Acknowledged: s.k401Acknowledged,
      }),
    },
  ),
);

export default useStore;
