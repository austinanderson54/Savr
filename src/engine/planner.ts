// src/engine/planner.ts
// Core SAVR planning engine — ported from planEngine.ts (web).
// Pure TypeScript. Zero React/UI dependencies.

export type PlanDebtItem = {
  name: string;
  apr: number;   // % APR, e.g. 19.99
  balance: number;
};

export type ComputePlanInput = {
  monthlyCash?: number;         // spare per month from Budget
  monthlyExpenses?: number;
  debtItems?: PlanDebtItem[];
  emergencyFundCurrent?: number;
  ack401k?: boolean;
};

export type PlanPhase = 'debt' | 'ef' | '401k' | 'invest';

export type PlanNextAction = {
  title: string;
  details: string;
  cta?: string;
};

export type PlanTimelines = {
  monthlyCash: number;
  monthlyExpenses?: number;
  debtFreeMonthsExact: number;
  debtFreeMonths: number;
  efTarget: number;
  efCurrent: number;
  autoInterest: number;
  autoMinPrincipal: number;
};

export type PlanResult = {
  phase: PlanPhase;
  nextAction: PlanNextAction;
  timelines: PlanTimelines;
};

export function computePlan(input: ComputePlanInput): PlanResult {
  const {
    monthlyCash = 0,
    monthlyExpenses = 0,
    debtItems = [],
    emergencyFundCurrent = 0,
    ack401k = false,
  } = input;

  const debts: PlanDebtItem[] = (debtItems || [])
    .map((d) => ({
      name: String(d?.name ?? 'Debt'),
      apr: num(d?.apr),
      balance: Math.max(0, num(d?.balance)),
    }))
    .filter((d) => d.balance > 0);

  const efFullTarget = Math.max(0, 3 * num(monthlyExpenses));
  const starterEfTarget = Math.max(0, 0.25 * num(monthlyExpenses));
  const efTarget = efFullTarget;
  const efCurrent = Math.max(0, num(emergencyFundCurrent));

  const baselineInterest = sumMonthlyInterest(debts);
  const baselineMinPrincipal = sumMonthlyRequiredPrincipal(debts);
  const minPaymentsTotal = baselineInterest + baselineMinPrincipal;

  const hasDebt = debts.length > 0;

  // ----- STARTER EF PHASE -----
  const hasStarterTarget = starterEfTarget > 0;
  if (hasStarterTarget && efCurrent < starterEfTarget) {
    const remainingStarter = Math.max(0, starterEfTarget - efCurrent);
    const efContribution = Math.max(0, monthlyCash - minPaymentsTotal);

    let monthsExactStarter = Infinity;
    if (efContribution > 0 && remainingStarter > 0) {
      monthsExactStarter = remainingStarter / efContribution;
    }

    const hasMeaningfulProgress =
      Number.isFinite(monthsExactStarter) && monthsExactStarter > 0;

    const baseDetails = `Before attacking high-APR debt, build a starter emergency fund of about ${fmtCurrency(starterEfTarget)} (≈ 25% of your monthly expenses).`;

    const details = hasMeaningfulProgress
      ? `${baseDetails} After covering an estimated ${fmtCurrency(minPaymentsTotal)} in interest + minimum payments each month, you have about ${fmtCurrency(efContribution)} left to save. At that pace, you'll reach this starter fund in roughly ${monthsExactStarter.toFixed(1)} months.`
      : `${baseDetails} Right now your spare (${fmtCurrency(monthlyCash)}/mo) is roughly consumed by an estimated ${fmtCurrency(minPaymentsTotal)} in interest + minimums on your debts. Trim expenses or increase income to free up cash.`;

    return {
      phase: 'ef',
      nextAction: { title: 'Build a starter Emergency Fund', details },
      timelines: {
        monthlyCash,
        monthlyExpenses,
        debtFreeMonthsExact: 0,
        debtFreeMonths: 0,
        efTarget,
        efCurrent,
        autoInterest: baselineInterest,
        autoMinPrincipal: baselineMinPrincipal,
      },
    };
  }

  // ----- DEBT PHASE -----
  if (hasDebt) {
    const paymentBudget = Math.max(0, monthlyCash);
    const { monthsExact } = simulateAvalancheConstantPayment(debts, paymentBudget, 1200);

    return {
      phase: 'debt',
      nextAction: {
        title: 'Pay high-APR debt',
        details:
          'Use your spare per month to first cover interest + issuer-like minimums, then attack your highest-APR balance.',
      },
      timelines: {
        monthlyCash,
        monthlyExpenses,
        debtFreeMonthsExact: monthsExact,
        debtFreeMonths: Number.isFinite(monthsExact) ? Math.ceil(monthsExact) : Infinity,
        efTarget,
        efCurrent,
        autoInterest: baselineInterest,
        autoMinPrincipal: baselineMinPrincipal,
      },
    };
  }

  // ----- FULL EF PHASE -----
  if (efCurrent < efTarget) {
    return {
      phase: 'ef',
      nextAction: {
        title: 'Build your Emergency Fund',
        details: `Save ${fmtCurrency(monthlyCash)} this month toward your ${fmtCurrency(efTarget)} target.`,
      },
      timelines: {
        monthlyCash,
        monthlyExpenses,
        debtFreeMonthsExact: 0,
        debtFreeMonths: 0,
        efTarget,
        efCurrent,
        autoInterest: baselineInterest,
        autoMinPrincipal: baselineMinPrincipal,
      },
    };
  }

  // ----- 401k PHASE -----
  if (!ack401k) {
    return {
      phase: '401k',
      nextAction: {
        title: 'Capture 401(k) match',
        details: 'Contribute enough to capture your employer match, then move to the Invest plan.',
        cta: 'Next step',
      },
      timelines: {
        monthlyCash,
        monthlyExpenses,
        debtFreeMonthsExact: 0,
        debtFreeMonths: 0,
        efTarget,
        efCurrent,
        autoInterest: baselineInterest,
        autoMinPrincipal: baselineMinPrincipal,
      },
    };
  }

  // ----- INVEST PHASE -----
  return {
    phase: 'invest',
    nextAction: {
      title: 'Ready to invest',
      details: `You're ready to invest your spare ${fmtCurrency(monthlyCash)}/mo in an Individual Brokerage (see Invest tab).`,
      cta: 'Open Invest tab',
    },
    timelines: {
      monthlyCash,
      monthlyExpenses,
      debtFreeMonthsExact: 0,
      debtFreeMonths: 0,
      efTarget,
      efCurrent,
      autoInterest: baselineInterest,
      autoMinPrincipal: baselineMinPrincipal,
    },
  };
}

/* ========================
   Interest + Minimums
   ======================== */

export function monthlyInterest(balance: number, aprPct: number): number {
  return Math.max(0, num(balance) * (num(aprPct) / 100) * (1 / 12));
}

const MIN_PCT = 0.01;
const MIN_FLOOR = 25;

export function monthlyMinimum(balance: number, aprPct: number): number {
  const interest = monthlyInterest(balance, aprPct);
  const pctPart = Math.max(0, num(balance) * MIN_PCT);
  return Math.max(interest + pctPart, MIN_FLOOR, 0);
}

export function requiredPrincipal(balance: number, aprPct: number): number {
  const interest = monthlyInterest(balance, aprPct);
  return Math.max(0, Math.min(balance, monthlyMinimum(balance, aprPct) - interest));
}

function sumMonthlyInterest(debts: PlanDebtItem[]): number {
  return (debts || []).reduce((s, d) => s + monthlyInterest(d.balance, d.apr), 0);
}

function sumMonthlyRequiredPrincipal(debts: PlanDebtItem[]): number {
  return (debts || []).reduce((s, d) => s + requiredPrincipal(d.balance, d.apr), 0);
}

/* ========================
   Avalanche simulation
   ======================== */

/**
 * Simulate debt payoff with:
 * - Constant monthly payment budget
 * - Interest accrued monthly on all debts
 * - Remaining principal applied to highest-APR debt first
 * - Returns Infinity if budget can't beat total interest
 */
export function simulateAvalancheConstantPayment(
  debts: PlanDebtItem[],
  paymentBudget: number,
  capMonths = 1200,
): { monthsExact: number } {
  if (!debts.length || paymentBudget <= 0) return { monthsExact: Infinity };

  const ds = debts.map((d) => ({ ...d }));

  const order = (items: typeof ds) =>
    items
      .slice()
      .filter((d) => d.balance > 0)
      .sort((a, b) => num(b.apr) - num(a.apr) || num(b.balance) - num(a.balance));

  let months = 0;

  while (months < capMonths) {
    const active = order(ds);
    if (!active.length) break;

    let totalInterest = 0;
    for (const d of ds) {
      if (d.balance <= 0) continue;
      const mi = monthlyInterest(d.balance, d.apr);
      totalInterest += mi;
      d.balance += mi;
    }

    if (paymentBudget <= totalInterest + 1e-6) return { monthsExact: Infinity };

    let principalPayment = paymentBudget - totalInterest;
    const ordered = order(ds);
    for (const d of ordered) {
      if (principalPayment <= 0) break;
      const pay = Math.min(d.balance, principalPayment);
      d.balance -= pay;
      principalPayment -= pay;
    }

    months += 1;
    if (order(ds).length === 0) break;
  }

  const anyLeft = ds.some((d) => d.balance > 0);
  return { monthsExact: anyLeft ? Infinity : months };
}

/* ======= utils ======= */

export function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function fmtCurrency(n: unknown): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num(n));
  } catch {
    return `$${Math.round(num(n)).toLocaleString()}`;
  }
}

export function fmtCompact(n: number): string {
  const v = Math.round(n);
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return fmtCurrency(v);
}
