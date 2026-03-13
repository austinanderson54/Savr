import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useStore from '../../src/stores/store';
import useBudgetStore from '../../src/stores/budgetStore';
import { computePlan, fmtCurrency, num } from '../../src/engine/planner';
import { Card } from '../../src/components/ui/Card';
import { MetricRow } from '../../src/components/ui/MetricRow';
import { Button } from '../../src/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

const formatApr = (v: unknown) => `${num(v).toFixed(1)}%`;

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
    body: 'Your Budget tab calculates your spare per month: Income − Expenses = Spare.\n\nThat spare drives your emergency-fund timeline, your debt-free timeline, and the monthly Next Action.\n\nInclude minimum payments for all low-APR debts as normal expenses. Do NOT include minimums for high-APR debts on the Plan tab — SAVR auto-estimates those.',
  },
  {
    id: 'efund',
    title: 'How the Emergency Fund works',
    body: 'SAVR targets an emergency fund of 3× your monthly expenses.\n\nThat cushion protects you from job loss, car and home repairs, unexpected medical bills, and random life curveballs.\n\nOnce your EF reaches its target, SAVR shifts your spare cash toward the next highest-impact move.',
  },
  {
    id: 'nextAction',
    title: 'How SAVR decides your Next Action',
    body: 'Every month, SAVR looks at your spare money and chooses the smartest place for it to go.\n\nIt considers: your highest-APR debt and its balance, your EF progress vs. target, interest saved vs. potential market returns, and how each move changes your payoff timelines.\n\nThe Next Action card is not a guess — it\'s the math-driven best move based on your current numbers.',
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
        const isLast = i === learnItems.length - 1;
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

// ---- Main Home screen ----
export default function HomeScreen() {
  const router = useRouter();
  const { debtItems, emergencyFundCurrent, k401Acknowledged } = useStore();
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
  const { debtFreeMonthsExact, debtFreeMonths, efTarget, efCurrent, autoInterest, autoMinPrincipal } = timelines;

  const hasDebt = totalDebt > 0;
  const minPayments = autoInterest + autoMinPrincipal;
  const extraForDebt = Math.max(0, monthlyCash - minPayments);

  const starterEfTarget = Math.max(0, 0.25 * expenses);
  const starterEfRemaining = Math.max(0, starterEfTarget - efCurrent);
  const starterEfContribution = Math.max(0, monthlyCash - minPayments);
  const starterEfMonthsExact =
    starterEfContribution > 0 && starterEfRemaining > 0
      ? starterEfRemaining / starterEfContribution
      : Infinity;

  const efRemaining = Math.max(0, efTarget - efCurrent);
  const efMonthsExact = monthlyCash > 0 ? efRemaining / monthlyCash : Infinity;

  const highestAprDebt = useMemo(
    () =>
      (debtItems || [])
        .filter((d) => num(d.balance) > 0)
        .sort((a, b) => num(b.apr) - num(a.apr) || num(b.balance) - num(a.balance))[0] || null,
    [debtItems],
  );

  // Build action title + details for debt phase
  let actionTitle = nextAction.title;
  let actionDetails = nextAction.details;

  if (phase === 'debt' && hasDebt) {
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

  // Phase → tab navigation
  const phaseNavLabel =
    phase === 'invest' ? 'Open Invest' : phase === '401k' ? 'Open Invest' : 'Open Plan';

  const phaseNavTo = phase === 'invest' || phase === '401k' ? '/(tabs)/invest' : '/(tabs)/plan';

  const phaseColor =
    phase === 'invest' ? COLORS.green :
    phase === '401k' ? COLORS.yellow :
    phase === 'debt' ? COLORS.red :
    COLORS.text;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
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
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>
            Dashboard
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={{ padding: SPACING.xs }}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl + SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {income === 0 ? (
          /* ── Empty state: user hasn't set up budget yet ── */
          <>
            <Card title="Start here">
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20, marginBottom: SPACING.lg }}>
                Your dashboard and plan are generated automatically. Set up three things and everything updates in real time:
              </Text>
              {[
                { n: '1', label: 'Budget', body: 'Enter your income and monthly expenses.' },
                { n: '2', label: 'EF & Debt', body: 'Add any debts above ~10% APR and your emergency fund balance.' },
                { n: '3', label: 'Dashboard', body: 'Your Next Action, timelines, and snapshot appear here.' },
              ].map(({ n, label, body }) => (
                <View key={n} style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.pillBg, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm, marginTop: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: '700' }}>{n}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>{label}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginTop: 2 }}>{body}</Text>
                  </View>
                </View>
              ))}
              <Button
                label="Open Budget →"
                onPress={() => router.push('/(tabs)/budget' as any)}
                style={{ marginTop: SPACING.xs }}
              />
              <Button
                label="Open EF & Debt →"
                onPress={() => router.push('/(tabs)/plan' as any)}
                variant="outline"
                style={{ marginTop: SPACING.sm }}
              />
            </Card>
            <LearnCard />
          </>
        ) : (
          /* ── Normal dashboard: budget is set up ── */
          <>
            {/* Next Action Card */}
            <Card
              title="Next Action"
              subtitle="Dynamic planner using your spare cash, debts, and emergency fund to decide what's most impactful this month."
            >
              {/* Phase badge */}
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
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20 }}>
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
                value={`${fmtCurrency(efCurrent)} / ${efTarget ? fmtCurrency(efTarget) : '—'}`}
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

            {/* Timeline Card */}
            <Card title="Timeline" subtitle="Rough timelines assuming today's spare per month.">
              {phase === 'debt' && hasDebt ? (
                <>
                  <MetricRow label="Debt phase" value="Active" />
                  <MetricRow
                    label="Debt free in"
                    value={
                      Number.isFinite(debtFreeMonthsExact) && debtFreeMonthsExact > 0
                        ? `~${debtFreeMonthsExact.toFixed(1)} months`
                        : '—'
                    }
                    style={{ borderBottomWidth: 0 }}
                  />
                </>
              ) : phase === 'ef' && hasDebt ? (
                <>
                  <MetricRow label="Debt phase" value="Not started (high-APR next)" />
                  <MetricRow
                    label="Starter EF reached in"
                    value={
                      Number.isFinite(starterEfMonthsExact) && starterEfMonthsExact > 0
                        ? `~${starterEfMonthsExact.toFixed(1)} months`
                        : starterEfRemaining <= 0
                        ? '0 months'
                        : '—'
                    }
                    style={{ borderBottomWidth: 0 }}
                  />
                </>
              ) : phase === 'ef' ? (
                <>
                  <MetricRow label="Debt phase" value="Completed" />
                  <MetricRow
                    label="Target EF reached in"
                    value={
                      Number.isFinite(efMonthsExact) && efMonthsExact > 0
                        ? `~${efMonthsExact.toFixed(1)} months`
                        : efRemaining <= 0
                        ? '0 months'
                        : '—'
                    }
                    style={{ borderBottomWidth: 0 }}
                  />
                </>
              ) : (
                <>
                  <MetricRow label="Debt phase" value={hasDebt ? 'Active' : 'Completed'} />
                  <MetricRow
                    label="EF phase"
                    value={efRemaining <= 0 ? 'Completed' : 'In progress'}
                    style={{ borderBottomWidth: 0 }}
                  />
                </>
              )}
            </Card>

            {/* Learn accordion */}
            <LearnCard />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
