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
import { benchmarks, investSteps, expenseRatioAsOf, Benchmark } from '../../src/engine/invest';
import { Card } from '../../src/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

function StepRow({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: SPACING.md,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: COLORS.pillBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: SPACING.md,
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 3 }}>
          {title}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19 }}>{body}</Text>
      </View>
    </View>
  );
}

function BenchmarkCard({ b, expanded, onToggle }: {
  b: Benchmark;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={onToggle}
        style={{
          padding: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1, marginRight: SPACING.sm }}>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>
            {b.label}
          </Text>
          <Text style={{ color: COLORS.green, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
            {b.approxReturn}
          </Text>
        </View>
        <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>{expanded ? '−' : '+'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.separator }}>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19, marginTop: SPACING.sm, marginBottom: SPACING.md }}>
            {b.description}
          </Text>
          {b.funds.map((f) => (
            <View
              key={f.ticker}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SPACING.xs,
                gap: SPACING.sm,
                flexWrap: 'wrap',
              }}
            >
              {/* Ticker pill */}
              <View
                style={{
                  backgroundColor: COLORS.pillBg,
                  borderRadius: RADIUS.sm,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xs, fontWeight: '700' }}>
                  {f.ticker}
                </Text>
              </View>
              <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, flex: 1 }}>{f.name}</Text>
              {/* ER pill */}
              <View
                style={{
                  backgroundColor: COLORS.inputBg,
                  borderRadius: RADIUS.sm,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>{f.er}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function InvestScreen() {
  const router = useRouter();
  const { debtItems, emergencyFundCurrent, k401Acknowledged, setK401Acknowledged } = useStore();
  const { monthlyExpenses, sparePerMonth } = useBudgetStore();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const expenses = monthlyExpenses();
  const monthlyCash = sparePerMonth();

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

  const { phase } = plan;
  const isReady = phase === 'invest';
  const is401k = phase === '401k';

  const totalDebt = (debtItems || []).reduce((s, d) => s + num(d.balance), 0);
  const efTarget = Math.max(0, 3 * expenses);
  const efCurrent = Math.max(0, emergencyFundCurrent);

  // Build readiness blockers
  const blockers: string[] = [];
  if (monthlyCash <= 0) blockers.push('Your Budget shows zero or negative spare per month');
  if (totalDebt > 0) blockers.push(`${fmtCurrency(totalDebt)} in high-APR debt remains`);
  if (efCurrent < efTarget && efTarget > 0) blockers.push(`Emergency fund at ${fmtCurrency(efCurrent)} of ${fmtCurrency(efTarget)} target`);
  if (!k401Acknowledged) blockers.push('401(k) match not yet acknowledged');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
        <View>
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5 }}>Invest</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 }}>
            Benchmarks, funds, and how to get started
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: SPACING.xs, marginTop: 2 }}>
          <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl + SPACING.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Readiness card */}
        <Card
          style={{
            borderColor: isReady ? COLORS.green : is401k ? COLORS.yellow : COLORS.cardBorder,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.pillBg, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm }}>
              <Ionicons
                name={isReady ? 'checkmark-circle' : is401k ? 'flag' : 'time-outline'}
                size={20}
                color={isReady ? COLORS.green : is401k ? COLORS.yellow : COLORS.textMuted}
              />
            </View>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700', flex: 1 }}>
              {isReady
                ? 'Ready to invest'
                : is401k
                ? 'Almost there — one step left'
                : 'Complete your plan first'}
            </Text>
          </View>

          {isReady ? (
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19 }}>
              Your emergency fund is built, high-APR debt is cleared, and 401(k) match is captured.
              You're ready to invest your spare {fmtCurrency(monthlyCash)}/mo in an individual brokerage.
            </Text>
          ) : is401k ? (
            <>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19, marginBottom: SPACING.md }}>
                Contribute enough to your 401(k) to capture your employer match — that's a 100% instant return on those dollars.
                Once confirmed, SAVR will move you to the invest phase.
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setK401Acknowledged(true);
                }}
                style={{
                  backgroundColor: COLORS.yellow,
                  borderRadius: RADIUS.md,
                  paddingVertical: SPACING.sm + 2,
                  paddingHorizontal: SPACING.lg,
                  alignSelf: 'flex-start',
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#000', fontSize: FONT_SIZE.sm, fontWeight: '700' }}>
                  ✓ I've captured my 401(k) match
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19, marginBottom: SPACING.sm }}>
                Complete the following on your Dashboard plan before investing in a brokerage:
              </Text>
              {blockers.map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                  <Text style={{ color: COLORS.red, fontSize: FONT_SIZE.sm, marginRight: SPACING.xs }}>•</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19, flex: 1 }}>{b}</Text>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* Getting started guide */}
        <Card title="How to get started" subtitle="A simple 5-step path to investing.">
          {investSteps.map((s) => (
            <StepRow key={s.n} {...s} />
          ))}
          <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, lineHeight: 16, marginTop: SPACING.xs }}>
            Note: Always capture your full 401(k) employer match before opening an individual brokerage — employer match is a 100% instant return.
          </Text>
        </Card>

        {/* Benchmark cards */}
        <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.md }}>
          Benchmarks &amp; Funds
        </Text>

        {benchmarks.map((b) => (
          <BenchmarkCard
            key={b.key}
            b={b}
            expanded={expandedKey === b.key}
            onToggle={async () => {
              await Haptics.selectionAsync();
              setExpandedKey((prev) => (prev === b.key ? null : b.key));
            }}
          />
        ))}

        <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, textAlign: 'center', marginTop: SPACING.md, lineHeight: 16 }}>
          {expenseRatioAsOf}. Expense ratios may change; verify on the fund provider's site.
          Investing involves risk. Past performance does not guarantee future results.
          This is educational information, not financial advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
