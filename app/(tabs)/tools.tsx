import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DoneToolbar } from '../../src/components/ui/DoneToolbar';
import { calcSeries, calcTotals } from '../../src/engine/calculators';
import { fmtCurrency, fmtCompact } from '../../src/engine/planner';
import { Card } from '../../src/components/ui/Card';
import { CurrencyInput, PercentInput } from '../../src/components/ui/CurrencyInput';
import { BarChart } from '../../src/components/charts/BarChart';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

function YearsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs }}>
        Years
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.inputBg,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: COLORS.inputBorder,
          paddingHorizontal: SPACING.md,
          height: 44,
        }}
      >
        <TextInput
          value={text}
          onChangeText={(t) => {
            const cleaned = t.replace(/[^0-9]/g, '');
            setText(cleaned);
            const n = parseInt(cleaned, 10);
            if (Number.isFinite(n) && n > 0) onChange(n);
          }}
          onBlur={() => {
            const n = parseInt(text, 10);
            const safe = Number.isFinite(n) && n > 0 ? n : 25;
            setText(String(safe));
            onChange(safe);
          }}
          placeholder="25"
          placeholderTextColor={COLORS.textDim}
          keyboardType="number-pad"
          style={{ flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base }}
        />
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>yrs</Text>
      </View>
    </View>
  );
}

export default function ToolsScreen() {
  const router = useRouter();
  const [start, setStart] = useState(0);
  const [monthly, setMonthly] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(10);
  const [years, setYears] = useState(25);
  const [inflAdj, setInflAdj] = useState(false);

  const series = useMemo(
    () => calcSeries({ start, monthly, annualReturnPct: annualReturn, years, adjustForInflation: inflAdj }),
    [start, monthly, annualReturn, years, inflAdj],
  );

  const totals = useMemo(() => calcTotals(series, start, monthly), [series, start, monthly]);

  const quickGlance = useMemo(
    () =>
      [10, 20, 30].map((y) => {
        const s = calcSeries({
          start,
          monthly,
          annualReturnPct: annualReturn,
          years: y,
          adjustForInflation: inflAdj,
        });
        return { years: y, ...calcTotals(s, start, monthly) };
      }),
    [start, monthly, annualReturn, inflAdj],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <DoneToolbar />
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
          <View>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5 }}>
              Tools
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 }}>
              Compound growth — contributions, returns, and inflation
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: SPACING.xs, marginTop: 2 }}>
            <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl + SPACING.lg }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* Inputs */}
          <Card title="Compound Growth Calculator">
            <CurrencyInput
              label="Starting balance"
              value={start}
              onChange={setStart}
              placeholder="0"
              style={{ marginBottom: SPACING.md }}
            />
            <CurrencyInput
              label="Monthly contribution"
              value={monthly}
              onChange={setMonthly}
              placeholder="500"
              style={{ marginBottom: SPACING.md }}
            />
            <PercentInput
              label="Annual return (%)"
              value={annualReturn}
              onChange={setAnnualReturn}
              placeholder="10"
              style={{ marginBottom: SPACING.md }}
            />
            <YearsInput value={years} onChange={setYears} />

            {/* Inflation toggle */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm }}>
                Adjust for inflation (3%)
              </Text>
              <Switch
                value={inflAdj}
                onValueChange={setInflAdj}
                trackColor={{ false: COLORS.inputBg, true: COLORS.green }}
                thumbColor={COLORS.text}
              />
            </View>
          </Card>

          {/* Results row */}
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
            {[
              { label: 'Total', value: totals.total, compact: false },
              { label: 'Contributed', value: totals.contributed, compact: true },
              { label: 'Earnings', value: totals.earnings, compact: true },
            ].map((r) => (
              <View
                key={r.label}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.card,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.cardBorder,
                  padding: SPACING.md,
                }}
              >
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs }}>
                  {r.label}
                </Text>
                <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: '800' }}>
                  {r.compact ? fmtCompact(r.value) : fmtCurrency(r.value)}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick glance */}
          <Card title="Quick Glance">
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {quickGlance.map((g) => (
                <View
                  key={g.years}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.inputBg,
                    borderRadius: RADIUS.md,
                    padding: SPACING.sm,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginBottom: 4 }}>
                    {g.years} yrs
                  </Text>
                  <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '800' }}>
                    {fmtCompact(g.total)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Chart */}
          <Card title="Growth Over Time">
            <BarChart data={series} height={220} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
              <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs }}>Year →</Text>
              <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs }}>← Value ($)</Text>
            </View>
          </Card>

          <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, textAlign: 'center', lineHeight: 16 }}>
            For illustrative purposes only. Assumes constant returns — actual returns vary. Not financial advice.
          </Text>
        </ScrollView>
    </SafeAreaView>
  );
}
