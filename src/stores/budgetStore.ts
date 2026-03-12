// src/stores/budgetStore.ts
// Ported from web budgetStore.ts — adapted for AsyncStorage persistence.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PAY_FREQS = ['monthly', 'semi-monthly', 'biweekly', 'weekly'] as const;
export type PayFrequency = (typeof PAY_FREQS)[number];

export const PAY_FREQ_LABELS: Record<PayFrequency, string> = {
  monthly: 'Monthly',
  'semi-monthly': 'Semi-monthly',
  biweekly: 'Biweekly',
  weekly: 'Weekly',
};

export type Expense = {
  id: string;
  name: string;
  amount: number;
};

const asNumber = (v: unknown): number => {
  const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const normalizeMonthly = (paycheck: number, freq: PayFrequency): number => {
  const amt = asNumber(paycheck);
  switch (freq) {
    case 'monthly': return amt;
    case 'semi-monthly': return amt * 2;
    case 'biweekly': return (amt * 26) / 12;
    case 'weekly': return (amt * 52) / 12;
    default: return amt;
  }
};

interface BudgetState {
  payFrequency: PayFrequency;
  takeHomePerPaycheck: number;

  hasSecondIncome: boolean;
  payFrequency2: PayFrequency;
  takeHomePerPaycheck2: number;

  expenses: Expense[];

  setPayFrequency: (freq: PayFrequency) => void;
  setTakeHomePerPaycheck: (amount: number) => void;
  setHasSecondIncome: (has: boolean) => void;
  setPayFrequency2: (freq: PayFrequency) => void;
  setTakeHomePerPaycheck2: (amount: number) => void;

  addExpense: (name: string, amount: number) => void;
  updateExpense: (id: string, data: Partial<{ name: string; amount: number | string }>) => void;
  removeExpense: (id: string) => void;

  monthlyIncome: () => number;
  monthlyExpenses: () => number;
  sparePerMonth: () => number;

  resetBudget: () => void;
}

const initialData = {
  payFrequency: 'monthly' as PayFrequency,
  takeHomePerPaycheck: 0,
  hasSecondIncome: false,
  payFrequency2: 'monthly' as PayFrequency,
  takeHomePerPaycheck2: 0,
  expenses: [] as Expense[],
};

const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setPayFrequency: (freq) => set({ payFrequency: freq }),
      setTakeHomePerPaycheck: (amount) => set({ takeHomePerPaycheck: asNumber(amount) }),
      setHasSecondIncome: (has) => set({ hasSecondIncome: has }),
      setPayFrequency2: (freq) => set({ payFrequency2: freq }),
      setTakeHomePerPaycheck2: (amount) => set({ takeHomePerPaycheck2: asNumber(amount) }),

      addExpense: (name, amount) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name,
              amount: asNumber(amount),
            },
          ],
        })),

      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...(data.name !== undefined ? { name: data.name } : {}),
                  ...(data.amount !== undefined ? { amount: asNumber(data.amount) } : {}),
                }
              : e,
          ),
        })),

      removeExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      monthlyIncome: () => {
        const s = get();
        const primary = normalizeMonthly(s.takeHomePerPaycheck, s.payFrequency);
        const secondary = s.hasSecondIncome
          ? normalizeMonthly(s.takeHomePerPaycheck2, s.payFrequency2)
          : 0;
        return primary + secondary;
      },

      monthlyExpenses: () => {
        const { expenses } = get();
        return expenses.reduce((sum, e) => sum + asNumber(e.amount), 0);
      },

      sparePerMonth: () => {
        return get().monthlyIncome() - get().monthlyExpenses();
      },

      resetBudget: () => set({ ...initialData }),
    }),
    {
      name: 'savr-budget-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        payFrequency: state.payFrequency,
        takeHomePerPaycheck: state.takeHomePerPaycheck,
        hasSecondIncome: state.hasSecondIncome,
        payFrequency2: state.payFrequency2,
        takeHomePerPaycheck2: state.takeHomePerPaycheck2,
        expenses: state.expenses,
      }),
    },
  ),
);

export default useBudgetStore;
