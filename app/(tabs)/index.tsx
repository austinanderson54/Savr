import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useStore from '../../src/stores/store';
import useBudgetStore from '../../src/stores/budgetStore';
import { computePlan, fmtCurrency, num, simulateAvalancheConstantPayment } from '../../src/engine/planner';
import { Card } from '../../src/components/ui/Card';
import { MetricRow } from '../../src/components/ui/MetricRow';
import { Button } from '../../src/components/ui/Button';
import { SharePlanCard } from '../../src/components/share/SharePlanCard';
import { sharePlan } from '../../src/lib/sharePlan';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

const formatApr = (v: unknown) => `${num(v).toFixed(1)}%`;

function fmtMonths(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return '—';
  const m = Math.ceil(months);
  return `~${m} ${m === 1 ? 'month' : 'months'}`;
}

// ---- Financial Stability score ----
function computeStabilityScore({
  monthlyCash,
  income,
  totalDebt,
  efCurrent,
  efTarget,
  autoInterest,
}: {
  monthlyCash: number;
  income: number;
  totalDebt: number;
  efCurrent: number;
  efTarget: number;
  autoInterest: number;
}): number {
  if (income <= 0) return 0;
  if (monthlyCash <= 0) return 0;

  // EF Coverage: 0–40 pts
  const efScore = efTarget > 0 ? Math.min(40, (efCurrent / efTarget) * 40) : 0;

  // Debt Burden: 0–40 pts (interest as % of income drives penalty)
  const interestRatio = autoInterest / income;
  const debtScore = totalDebt === 0 ? 40 : Math.max(0, 40 - interestRatio * 400);

  // Surplus Quality: 0–20 pts (spare >= 20% of income = full score)
  const surplusScore = Math.min(20, (monthlyCash / income) * 100);

  return Math.round(Math.min(100, Math.max(0, efScore + debtScore + surplusScore)));
}

// ---- Stability Meter ----
function StabilityMeter({ score }: { score: number }) {
  const barColor = score >= 70 ? COLORS.green : score >= 40 ? COLORS.yellow : COLORS.red;
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACING.sm }}>
        <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700' }}>
          Financial Stability
        </Text>
        <Text style={{ color: barColor, fontSize: FONT_SIZE.lg, fontWeight: '800' }}>
          {score}
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '400' }}> / 100</Text>
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: COLORS.inputBg, borderRadius: 3, overflow: 'hidden' }}>
        <View
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 3,
          }}
        />
      </View>
      <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.sm, lineHeight: 16 }}>
        A directional indicator based on your emergency fund coverage, debt load, and monthly surplus.
      </Text>
    </View>
  );
}

// ---- Timeline row ----
function TimelineRow({
  label,
  value,
  status,
  isLast,
}: {
  label: string;
  value: string;
  status: 'complete' | 'active' | 'upcoming';
  isLast?: boolean;
}) {
  const dotColor =
    status === 'complete' ? COLORS.green : status === 'active' ? COLORS.text : COLORS.tabBarInactive;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.separator,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: dotColor,
          marginRight: SPACING.md,
        }}
      />
      <Text style={{ flex: 1, color: status === 'upcoming' ? COLORS.textMuted : COLORS.text, fontSize: FONT_SIZE.base }}>
        {label}
      </Text>
      <Text
        style={{
          color: status === 'complete' ? COLORS.green : status === 'active' ? COLORS.text : COLORS.textDim,
          fontSize: FONT_SIZE.sm,
          fontWeight: status === 'active' ? '700' : '400',
        }}
      >
        {status === 'complete' ? 'Complete ✓' : value}
      </Text>
    </View>
  );
}

// ---- Learn accordion ----
type LearnId = 'debts' | 'budget' | 'efund' | 'nextAction' | 'difference' | 'noTransactions';

const learnItems: { id: LearnId; title: string; body: string }[] = [
  {
    id: 'debts',
    title: 'What debts should I enter? (Important)',
    body: 'On the Plan tab, only enter debts with APR above ~10%. This usually includes credit cards, store cards, some personal loans, and anything with aggressive interest.\n\nWhy >10%? Historically, long-term market returns average around 10%+ per year. If your debt costs more, paying it off is a guaranteed win.\n\nRule of thumb: APR > 10% → add it here. APR ≤ 10% → include its minimum payment as an expense in your Budget instead.',
  },
  {
    id: 'budget',
    title: 'Why does SAVR need my Budget?',
    body: 'Your Budget tab calculates your spare per month: Income − Expenses = Spare.\n\nThat spare drives your emergency-fund timeline, your debt-free timeline, and the monthly Next Move.\n\nInclude minimum payments for all low-APR debts as normal expenses. Do NOT include minimums for high-APR debts on the Plan tab — SAVR auto-estimates those.',
  },
  {
    id: 'efund',
    title: 'How the Emergency Fund works',
    body: 'SAVR targets an emergency fund of 3× your monthly expenses.\n\nThat cushion protects you from job loss, car and home repairs, unexpected medical bills, and random life curveballs.\n\nOnce your EF reaches its target, SAVR shifts your spare cash toward the next highest-impact move.',
  },
  {
    id: 'nextAction',
    title: 'How SAVR decides your Next Move',
    body: 'Every month, SAVR looks at your spare money and chooses the smartest place for it to go.\n\nIt considers: your highest-APR debt and its balance, your EF progress vs. target, interest saved vs. potential market returns, and how each move changes your payoff timelines.\n\nThe Next Move card is not a guess — it\'s the math-driven best move based on your current numbers.',
  },
  {
    id: 'difference',
    title: 'Why SAVR is different from traditional budgeting',
    body: "SAVR isn't a transaction tracker or a spreadsheet. It's a decision engine.\n\nOther tools ask you to micromanage every purchase. SAVR focuses on the big, monthly choices that actually move the needle.\n\nInstead of staring at charts wondering what to do, you get one clear instruction each month.",
  },
  {
    id: 'noTransactions',
    title: "Why SAVR doesn't track every transaction",
    body: 'Modern personal finance is about direction, not perfection.\n\nSAVR skips bank connections and auto-categorizing because those systems add complexity without guaranteeing better behavior.\n\nInstead, you set your budget, plug in key high-APR debts and your EF, and SAVR tells you what to do with the spare.',
  },
];

function LearnCard() {
  const [openId, setOpenId] = useState<LearnId | null>(null);

  return (
    <Card title="Learn how SAVR works" subtitle="Quick explanations of the assumptions and logic behind your planner.">
      {learnItems.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <View
            key={item.id}
            style={{
              borderTopWidth: 1,
              borderTopColor: COLORS.separator,
              paddingVertical: SPACING.sm,
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await Haptics.selectionAsync();
                setOpenId((prev) => (prev === item.id ? null : item.id));
              }}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}
              activeOpacity={0.7}
            >
              <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600', flex: 1, marginRight: SPACING.sm, lineHeight: 19 }}>
                {item.title}
              </Text>
              <Ionicons name={isOpen ? 'remove' : 'add'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {isOpen && (
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20, marginTop: SPACING.xs }}>
                {item.body}
              </Text>
            )}
          </View>
        );
      })}
    </Card>
  );
}

// ---- Main Dashboard ----
export default function HomeScreen() {
  const router = useRouter();
  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const { debtItems, emergencyFundCurrent, k401Acknowledged, noHighAprDebtAcknowledged, setNoHighAprDebtAcknowledged } = useStore();
  const { monthlyIncome, monthlyExpenses, sparePerMonth } = useBudgetStore();

  const income = monthlyIncome();
  const expenses = monthlyExpenses();
  const monthlyCash = sparePerMonth();

  const totalDebt = useMemo(
    () => (debtItems || []).reduce((s, d) => s + num(d.balance), 0),
    [debtItems],
  );

  const plan = useMemo(
    () =>
      computePlan({
        monthlyCash,
        monthlyExpenses: expenses,
        debtItems,
        emergencyFundCurrent,
        ack401k: k401Acknowledged,
      }),
    [monthlyCash, expenses, debtItems, emergencyFundCurrent, k401Acknowledged],
  );

  const { phase, nextAction, timelines } = plan;
  const { debtFreeMonthsExact, efTarget, efCurrent, autoInterest, autoMinPrincipal } = timelines;

  const hasDebt = totalDebt > 0;
  const minPayments = autoInterest + autoMinPrincipal;
  const efCurr = Math.max(0, efCurrent);

  // Starter EF calc
  const starterEfTarget = Math.max(0, 0.25 * expenses);
  const starterEfRemaining = Math.max(0, starterEfTarget - efCurr);
  const starterEfContrib = Math.max(0, monthlyCash - minPayments);
  const starterEfMonthsExact =
    starterEfContrib > 0 && starterEfRemaining > 0
      ? starterEfRemaining / starterEfContrib
      : Infinity;

  // Full EF calc
  const efRemaining = Math.max(0, efTarget - efCurr);
  const efMonthsExact = monthlyCash > 0 ? efRemaining / monthlyCash : Infinity;

  // Debt-free timeline for the expanded Timeline card.
  // The engine only runs the avalanche sim during the 'debt' phase, returning 0 in all
  // other phases. We run it ourselves so the Timeline card always shows a forward-looking
  // estimate whenever debt exists, regardless of the current phase.
  const debtFreeMonthsForTimeline = useMemo(() => {
    if (!hasDebt || monthlyCash <= 0) return 0;
    if (phase === 'debt' && Number.isFinite(debtFreeMonthsExact) && debtFreeMonthsExact > 0) {
      return debtFreeMonthsExact;
    }
    const { monthsExact } = simulateAvalancheConstantPayment(
      (debtItems || []).map((d) => ({ name: String(d.name), apr: num(d.apr), balance: Math.max(0, num(d.balance)) })).filter((d) => d.balance > 0),
      monthlyCash,
      1200,
    );
    return monthsExact;
  }, [hasDebt, monthlyCash, phase, debtFreeMonthsExact, debtItems]);

  const highestAprDebt = useMemo(
    () =>
      (debtItems || [])
        .filter((d) => num(d.balance) > 0)
        .sort((a, b) => num(b.apr) - num(a.apr) || num(b.balance) - num(a.balance))[0] || null,
    [debtItems],
  );

  // Build action title + details
  let actionTitle = nextAction.title;
  let actionDetails = nextAction.details;

  if (phase === 'debt' && hasDebt) {
    const extraForDebt = Math.max(0, monthlyCash - minPayments);
    if (!highestAprDebt) {
      actionTitle = 'Pay high-APR debt';
      actionDetails = 'Enter at least one debt on the Plan tab so we can tell you exactly where to attack first.';
    } else if (extraForDebt > 0) {
      actionTitle = 'Pay high-APR debt';
      actionDetails = `Pay ${fmtCurrency(extraForDebt)} extra to ${highestAprDebt.name} (${formatApr(highestAprDebt.apr)}) this month, on top of an estimated ${fmtCurrency(minPayments)} in interest + minimum payments across all cards.`;
    } else {
      actionTitle = 'Cover interest + minimums';
      actionDetails = `Your current spare (${fmtCurrency(monthlyCash)}/mo) is roughly consumed by an estimated ${fmtCurrency(minPayments)} in interest + minimum payments. Trim expenses or increase income in your Budget to free up extra.`;
    }
  }

  // Setup gate
  const budgetDone = income > 0;
  const efDebtDone =
    (debtItems || []).some((d) => num(d.balance) > 0) ||
    emergencyFundCurrent > 0 ||
    noHighAprDebtAcknowledged;
  const setupComplete = budgetDone && efDebtDone;

  // Phase nav
  const phaseNavLabel = phase === 'invest' || phase === '401k' ? 'Open Invest' : 'Open Plan';
  const phaseNavTo = phase === 'invest' || phase === '401k' ? '/(tabs)/invest' : '/(tabs)/plan';

  const phaseColor =
    phase === 'invest' ? COLORS.green :
    phase === '401k' ? COLORS.yellow :
    phase === 'debt' ? COLORS.red :
    COLORS.text;

  // Financial Stability score
  const stabilityScore = computeStabilityScore({
    monthlyCash,
    income,
    totalDebt,
    efCurrent: efCurr,
    efTarget,
    autoInterest,
  });

  // Timeline statuses
  const starterEfDone = starterEfRemaining <= 0;
  const debtDone = totalDebt === 0;
  const fullEfDone = efRemaining <= 0;

  // Cumulative (additive from today) timeline.
  // Each phase starts after the previous one ends, so values compound.
  // Note: efMonthsExact uses full monthlyCash because after debt payoff the high-APR
  // minimums are gone — the user's full spare is available for EF savings.
  const starterEfOffset = !starterEfDone && Number.isFinite(starterEfMonthsExact) ? starterEfMonthsExact : 0;

  const debtFreeFromToday: number = hasDebt
    ? (Number.isFinite(debtFreeMonthsForTimeline) && debtFreeMonthsForTimeline > 0
        ? starterEfOffset + debtFreeMonthsForTimeline
        : Infinity)
    : 0;

  const fullEfFromToday: number = fullEfDone
    ? 0
    : (() => {
        const afterDebt = hasDebt ? debtFreeFromToday : 0;
        if (!Number.isFinite(afterDebt)) return Infinity;
        return Number.isFinite(efMonthsExact) ? afterDebt + efMonthsExact : Infinity;
      })();

  // Share data — cumulative values
  const shareStarterEf = hasDebt && !starterEfDone && Number.isFinite(starterEfMonthsExact) ? starterEfMonthsExact : undefined;
  const shareDebtFree = hasDebt && Number.isFinite(debtFreeFromToday) && debtFreeFromToday > 0 ? debtFreeFromToday : undefined;
  const shareFullEf = !fullEfDone && Number.isFinite(fullEfFromToday) && fullEfFromToday > 0 ? fullEfFromToday : undefined;

  const handleShare = async () => {
    if (sharing) return;
    try {
      setSharing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sharePlan(shareCardRef);
    } catch {
      Alert.alert('Could not share', 'Build the app natively (expo run:ios) to enable sharing.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Off-screen share card — rendered but hidden from view */}
      <View style={{ position: 'absolute', top: -9999, left: 0 }} pointerEvents="none">
        <SharePlanCard
          ref={shareCardRef}
          nextMove={actionTitle}
          phase={phase}
          starterEfMonths={shareStarterEf}
          debtFreeMonths={shareDebtFree}
          fullEfMonths={shareFullEf}
        />
      </View>

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.sm,
        }}
      >
        <View>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5 }}>
            SAVR
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: SPACING.xs }}>
          <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl + SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {!setupComplete ? (
          /* ── Setup checklist ── */
          <>
            <Card title="Start here">
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20, marginBottom: SPACING.lg }}>
                Complete these two steps and your dashboard updates automatically.
              </Text>

              {/* Step 1 — Budget */}
              <View style={{ flexDirection: 'row' }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: budgetDone ? COLORS.green : COLORS.pillBg,
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: SPACING.sm, marginTop: 2, flexShrink: 0,
                }}>
                  {budgetDone
                    ? <Ionicons name="checkmark" size={15} color={COLORS.background} />
                    : <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: '700' }}>1</Text>
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: budgetDone ? COLORS.textMuted : COLORS.text,
                    fontSize: FONT_SIZE.base,
                    fontWeight: '700',
                    textDecorationLine: budgetDone ? 'line-through' : 'none',
                  }}>
                    Budget
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginTop: 2 }}>
                    Enter your income and fixed monthly expenses.
                  </Text>
                  {!budgetDone && (
                    <Button
                      label="Open Budget →"
                      onPress={() => router.push('/(tabs)/budget' as any)}
                      style={{ marginTop: SPACING.sm, alignSelf: 'flex-start' }}
                    />
                  )}
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: COLORS.separator, marginVertical: SPACING.md, marginLeft: 34 }} />

              {/* Step 2 — EF & Debt */}
              <View style={{ flexDirection: 'row', opacity: budgetDone ? 1 : 0.35 }}>
                <View style={{
                  width: 26, height: 26, borderRadius: 13,
                  backgroundColor: efDebtDone ? COLORS.green : COLORS.pillBg,
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: SPACING.sm, marginTop: 2, flexShrink: 0,
                }}>
                  {efDebtDone
                    ? <Ionicons name="checkmark" size={15} color={COLORS.background} />
                    : <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: '700' }}>2</Text>
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: efDebtDone ? COLORS.textMuted : COLORS.text,
                    fontSize: FONT_SIZE.base,
                    fontWeight: '700',
                    textDecorationLine: efDebtDone ? 'line-through' : 'none',
                  }}>
                    EF & Debt
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginTop: 2 }}>
                    Add any debts above ~10% APR and your emergency fund balance — or confirm you have none.
                  </Text>
                  {budgetDone && !efDebtDone && (
                    <>
                      <Button
                        label="Open EF & Debt →"
                        onPress={() => router.push('/(tabs)/plan' as any)}
                        style={{ marginTop: SPACING.sm, alignSelf: 'flex-start' }}
                      />
                      <TouchableOpacity
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setNoHighAprDebtAcknowledged(true);
                        }}
                        style={{ marginTop: SPACING.sm, paddingVertical: SPACING.xs }}
                        activeOpacity={0.6}
                      >
                        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textDecorationLine: 'underline' }}>
                          No current debt above 10% APR
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Card>
            <LearnCard />
          </>
        ) : (
          /* ── Full dashboard ── */
          <>
            {/* Next Move Card */}
            <Card
              title="Next Move"
              subtitle="Dynamic planner using your spare cash, debts, and emergency fund to decide what's most impactful this month."
            >
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: COLORS.pillBg,
                  borderRadius: 100,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 3,
                  marginBottom: SPACING.sm,
                }}
              >
                <Text style={{ color: phaseColor, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {phase === 'ef' ? 'Emergency Fund' : phase === '401k' ? '401(k)' : phase === 'invest' ? 'Invest' : 'Debt'}
                </Text>
              </View>

              <Text style={{ color: phaseColor, fontSize: FONT_SIZE.lg, fontWeight: '800', marginBottom: SPACING.sm, letterSpacing: -0.3, lineHeight: 26 }}>
                {actionTitle}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.base, lineHeight: 22 }}>
                {actionDetails}
              </Text>

              {phase === 'debt' && hasDebt && (
                <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, lineHeight: 17, marginTop: SPACING.sm }}>
                  Model assumes issuer-like minimums (interest + ~1% of balance) and treats freed-up interest as extra principal on your highest-APR debt.
                </Text>
              )}

              <Button
                label={phaseNavLabel}
                onPress={() => router.push(phaseNavTo as any)}
                style={{ marginTop: SPACING.md, alignSelf: 'flex-start' }}
              />
            </Card>

            {/* Financial Stability Meter */}
            <StabilityMeter score={stabilityScore} />

            {/* Snapshot Card */}
            <Card title="Snapshot" subtitle="Month-to-month picture based on your budget, debts, and emergency fund.">
              <MetricRow label="Monthly income" value={income ? fmtCurrency(income) : '—'} />
              <MetricRow label="Monthly expenses" value={expenses ? fmtCurrency(expenses) : '—'} />
              <MetricRow
                label="Spare per month"
                value={monthlyCash ? fmtCurrency(monthlyCash) : '—'}
                valueColor={monthlyCash < 0 ? COLORS.red : COLORS.text}
              />
              {hasDebt && (
                <MetricRow
                  label="After high-APR minimums"
                  value={fmtCurrency(monthlyCash - minPayments)}
                  valueColor={monthlyCash - minPayments < 0 ? COLORS.red : COLORS.green}
                />
              )}
              <MetricRow label="Total debt" value={hasDebt ? fmtCurrency(totalDebt) : '$0'} />
              <MetricRow
                label="Emergency fund"
                value={`${fmtCurrency(efCurr)} / ${efTarget ? fmtCurrency(efTarget) : '—'}`}
              />
              {hasDebt && (
                <>
                  <MetricRow
                    label="Monthly interest on debts"
                    value={autoInterest ? fmtCurrency(autoInterest) : '—'}
                  />
                  <MetricRow
                    label="Required principal (est. mins above interest)"
                    value={autoMinPrincipal ? fmtCurrency(autoMinPrincipal) : '—'}
                    style={{ borderBottomWidth: 0 }}
                  />
                </>
              )}
            </Card>

            {/* Timeline Card — expanded journey view */}
            <Card title="Timeline" subtitle="Rough milestones assuming today's spare per month stays constant.">
              {hasDebt && (
                <TimelineRow
                  label="Starter Emergency Fund"
                  value={fmtMonths(starterEfMonthsExact)}
                  status={starterEfDone ? 'complete' : phase === 'ef' && hasDebt ? 'active' : 'upcoming'}
                />
              )}
              {hasDebt && (
                <TimelineRow
                  label="Debt Freedom"
                  value={fmtMonths(debtFreeFromToday)}
                  status={debtDone ? 'complete' : phase === 'debt' ? 'active' : 'upcoming'}
                />
              )}
              <TimelineRow
                label="Full Emergency Fund"
                value={fmtMonths(fullEfFromToday)}
                status={fullEfDone ? 'complete' : phase === 'ef' && !hasDebt ? 'active' : 'upcoming'}
                isLast
              />
            </Card>

            {/* Share My Plan */}
            <TouchableOpacity
              onPress={handleShare}
              disabled={sharing}
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                paddingVertical: 14,
                paddingHorizontal: 22,
                marginBottom: SPACING.md,
                opacity: sharing ? 0.5 : 1,
              }}
            >
              <Ionicons name="share-outline" size={18} color={COLORS.text} />
              <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                Share My Plan
              </Text>
            </TouchableOpacity>

            {/* Learn accordion */}
            <LearnCard />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
