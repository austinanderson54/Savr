// src/engine/invest.ts
// Investment benchmark data — ported from lib/benchmarks.ts (web).

export type BenchmarkFund = {
  ticker: string;
  name: string;
  er: string; // expense ratio, e.g. "0.03%"
};

export type Benchmark = {
  key: string;
  label: string;
  approxReturn: string;
  description: string;
  funds: BenchmarkFund[];
};

export const expenseRatioAsOf = 'As of Aug 2025';

export const benchmarks: Benchmark[] = [
  {
    key: 'sp500',
    label: 'S&P 500',
    approxReturn: '≈10%/yr',
    description:
      'Broad large-cap U.S. stocks. Simple, diversified core exposure most investors start with.',
    funds: [
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', er: '0.03%' },
      { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', er: '0.09%' },
      { ticker: 'IVV', name: 'iShares Core S&P 500 ETF', er: '0.03%' },
    ],
  },
  {
    key: 'total_us',
    label: 'Total U.S. Stock Market',
    approxReturn: '≈9–10%/yr',
    description:
      'Entire U.S. stock market in one fund — large, mid, and small caps. Great simple "own everything" core.',
    funds: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', er: '0.03%' },
      { ticker: 'FSKAX', name: 'Fidelity Total Market Index Fund', er: '0.02%' },
      { ticker: 'SWTSX', name: 'Schwab Total Stock Market Index Fund', er: '0.03%' },
    ],
  },
  {
    key: 'nasdaq100',
    label: 'Nasdaq 100 (Large Tech Tilt)',
    approxReturn: '≈11–13%/yr (historical, more volatile)',
    description:
      'Concentrated in large-cap tech and growth names. Historically higher returns but bigger drawdowns.',
    funds: [
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', er: '0.20%' },
      { ticker: 'QQQM', name: 'Invesco Nasdaq 100 ETF', er: '0.15%' },
      { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ (3x leveraged — very risky)', er: '0.86%' },
    ],
  },
  {
    key: 'total_international',
    label: 'Total International (ex-US)',
    approxReturn: '≈6–8%/yr',
    description:
      'Developed + emerging markets outside the U.S. Adds diversification beyond U.S. companies.',
    funds: [
      { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', er: '0.07%' },
      { ticker: 'IXUS', name: 'iShares Core MSCI Total Intl Stock ETF', er: '0.09%' },
      { ticker: 'FTIHX', name: 'Fidelity Total International Index Fund', er: '0.06%' },
    ],
  },
  {
    key: 'global',
    label: 'Global (U.S. + International)',
    approxReturn: '≈8–10%/yr',
    description:
      'Single-fund exposure to the entire global stock market. U.S. + the rest of the world combined.',
    funds: [
      { ticker: 'VT', name: 'Vanguard Total World Stock ETF', er: '0.07%' },
      { ticker: 'ACWI', name: 'iShares MSCI ACWI ETF (All Country World Index)', er: '0.32%' },
    ],
  },
  {
    key: 'us_bonds',
    label: 'U.S. Investment-Grade Bonds',
    approxReturn: '≈3–5%/yr (long-run)',
    description:
      'Broad, high-quality bond exposure. Historically lower volatility than stocks, used for ballast and income.',
    funds: [
      { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', er: '0.03%' },
      { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', er: '0.03%' },
      { ticker: 'FXNAX', name: 'Fidelity U.S. Bond Index Fund', er: '0.025%' },
    ],
  },
  {
    key: 'treasury_bills',
    label: 'U.S. Treasury Bills / Cash-like',
    approxReturn: 'Varies with short-term rates',
    description:
      'Very low-risk, short-duration U.S. government debt. Behaves more like cash with modest yield.',
    funds: [
      { ticker: 'BIL', name: 'SPDR Bloomberg 1–3 Month T-Bill ETF', er: '0.13%' },
      { ticker: 'SGOV', name: 'iShares 0–3 Month Treasury Bond ETF', er: '0.07%' },
      { ticker: 'SNVXX', name: 'Schwab U.S. Treasury Money Fund (Investor)', er: '0.35%' },
    ],
  },
  {
    key: 'dow',
    label: 'Dow Jones',
    approxReturn: '≈8%/yr',
    description:
      'Blend of established U.S. large-cap companies. Historically steadier but slower than the Nasdaq 100.',
    funds: [
      { ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', er: '0.16%' },
      { ticker: 'IYY', name: 'iShares Dow Jones U.S. ETF', er: '0.20%' },
      { ticker: 'DJD', name: 'Invesco Dow Jones Industrial Average Dividend ETF', er: '0.07%' },
    ],
  },
];

export const investSteps = [
  {
    n: 1,
    title: 'Open a brokerage account',
    body: 'Fidelity, Vanguard, or Schwab are all solid choices. Commission-free trades, low minimums.',
  },
  {
    n: 2,
    title: 'Fund it via bank transfer',
    body: 'Link your checking account and transfer your monthly spare. Takes 1–3 business days.',
  },
  {
    n: 3,
    title: 'Choose a benchmark',
    body: 'Pick one that matches your risk tolerance. The S&P 500 is a common starting point.',
  },
  {
    n: 4,
    title: 'Pick a low-cost fund',
    body: 'Find a fund that tracks your chosen benchmark with the lowest expense ratio.',
  },
  {
    n: 5,
    title: 'Invest regularly — and hold',
    body: 'Consistent monthly contributions matter more than timing the market. Stay the course.',
  },
];
