// src/engine/calculators.ts
// Compound growth calculator — ported from calculators/page.tsx (web).

export type SeriesPoint = { x: number; y: number };

export type CalcInput = {
  start: number;
  monthly: number;
  annualReturnPct: number;
  years: number;
  adjustForInflation: boolean;
};

export type CalcTotals = {
  total: number;
  contributed: number;
  earnings: number;
};

export function calcSeries(input: CalcInput): SeriesPoint[] {
  const { start, monthly, annualReturnPct, years, adjustForInflation } = input;
  const r = annualReturnPct / 100;
  const months = years * 12;
  const monthlyRate = Math.pow(1 + r, 1 / 12) - 1;

  let balance = start;
  const points: SeriesPoint[] = [{ x: 0, y: Math.round(balance) }];

  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (m % 12 === 0) points.push({ x: m / 12, y: Math.round(balance) });
  }

  if (adjustForInflation) {
    const i = 0.03;
    return points.map((p) => ({
      x: p.x,
      y: Math.round(p.y / Math.pow(1 + i, p.x)),
    }));
  }
  return points;
}

export function calcTotals(series: SeriesPoint[], start: number, monthly: number): CalcTotals {
  const years = series[series.length - 1]?.x ?? 0;
  const contributed = start + monthly * (years * 12);
  const total = series[series.length - 1]?.y ?? 0;
  return { total, contributed, earnings: Math.max(0, total - contributed) };
}
