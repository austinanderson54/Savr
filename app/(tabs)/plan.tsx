import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DoneToolbar } from '../../src/components/ui/DoneToolbar';
import useStore, { DebtItem } from '../../src/stores/store';
import useBudgetStore from '../../src/stores/budgetStore';
import useProgressStore from '../../src/stores/progressStore';
import { monthlyInterest, monthlyMinimum, fmtCurrency, num } from '../../src/engine/planner';
import { Card } from '../../src/components/ui/Card';
import { MetricRow } from '../../src/components/ui/MetricRow';
import { CurrencyInput } from '../../src/components/ui/CurrencyInput';
import { Button } from '../../src/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

// ---- Debt row component ----
function DebtRow({ debt, idx, onUpdate, onRemove }: {
  debt: DebtItem;
  idx: number;
  onUpdate: (patch: Partial<DebtItem>) => void;
  onRemove: () => void;
}) {
  const [nameText, setNameText] = useState(debt.name);
  const [balanceText, setBalanceText] = useState(debt.balance > 0 ? String(debt.balance) : '');
  const [aprText, setAprText] = useState(debt.apr > 0 ? String(debt.apr) : '');

  const bal = num(debt.balance);
  const apr = num(debt.apr);
  const mi = monthlyInterest(bal, apr);
  const mmin = monthlyMinimum(bal, apr);

  return (
    <View style={debtRowStyles.card}>
      {/* Name row */}
      <View style={debtRowStyles.row}>
        <Text style={debtRowStyles.label}>Name</Text>
        <TextInput
          value={nameText}
          onChangeText={setNameText}
          onBlur={() => onUpdate({ name: nameText })}
          placeholder="Card / loan name"
          placeholderTextColor={COLORS.textDim}
          returnKeyType="done"
          style={debtRowStyles.input}
        />
        <TouchableOpacity onPress={onRemove} activeOpacity={0.7} style={debtRowStyles.trash}>
          <Ionicons name="trash-outline" size={15} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      {/* Balance row */}
      <View style={[debtRowStyles.row, debtRowStyles.separator]}>
        <Text style={debtRowStyles.label}>Balance</Text>
        <Text style={debtRowStyles.prefix}>$</Text>
        <TextInput
          value={balanceText}
          onChangeText={(t) => setBalanceText(t.replace(/[^0-9.]/g, ''))}
          onBlur={() => {
            const n = parseFloat(balanceText);
            onUpdate({ balance: Number.isFinite(n) ? n : 0 });
          }}
          placeholder="0"
          placeholderTextColor={COLORS.textDim}
          keyboardType="decimal-pad"
          style={[debtRowStyles.input, { textAlign: 'right' }]}
        />
      </View>

      {/* APR row */}
      <View style={[debtRowStyles.row, debtRowStyles.separator, !bal && debtRowStyles.lastRow]}>
        <Text style={debtRowStyles.label}>APR</Text>
        <TextInput
          value={aprText}
          onChangeText={(t) => setAprText(t.replace(/[^0-9.]/g, ''))}
          onBlur={() => {
            const n = parseFloat(aprText);
            onUpdate({ apr: Number.isFinite(n) ? n : 0 });
          }}
          placeholder="0"
          placeholderTextColor={COLORS.textDim}
          keyboardType="decimal-pad"
          style={[debtRowStyles.input, { textAlign: 'right' }]}
        />
        <Text style={debtRowStyles.suffix}>%</Text>
      </View>

      {/* Auto stats */}
      {bal > 0 && (
        <View style={debtRowStyles.statsRow}>
          <View style={debtRowStyles.stat}>
            <Text style={debtRowStyles.statLabel}>Interest / mo</Text>
            <Text style={debtRowStyles.statValue}>{fmtCurrency(mi)}</Text>
          </View>
          <View style={[debtRowStyles.stat, { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: COLORS.separator }]}>
            <Text style={debtRowStyles.statLabel}>Est. minimum</Text>
            <Text style={debtRowStyles.statValue}>{fmtCurrency(mmin)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const debtRowStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  lastRow: {
    // no extra style needed; used to conditionally skip bottom separator
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    width: 64,
  },
  prefix: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginRight: 2,
  },
  suffix: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
  },
  trash: {
    marginLeft: SPACING.sm,
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  stat: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZE.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginTop: 2,
  },
});

// ---- Progress bar ----
function ProgressBar({ pct }: { pct: number }) {
  return (
    <View style={{ marginVertical: SPACING.sm }}>
      <View
        style={{
          height: 6,
          backgroundColor: COLORS.inputBg,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            backgroundColor: pct >= 100 ? COLORS.green : COLORS.text,
            borderRadius: 3,
          }}
        />
      </View>
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 4 }}>
        {pct.toFixed(0)}% complete
      </Text>
    </View>
  );
}

// ---- Main Plan screen ----
export default function PlanScreen() {
  const router = useRouter();
  const {
    debtItems,
    updateDebt,
    addDebt,
    removeDebt,
    emergencyFundCurrent,
    setEmergencyFundCurrent,
    noHighAprDebtAcknowledged,
    setNoHighAprDebtAcknowledged,
  } = useStore();
  const { monthlyExpenses } = useBudgetStore();
  const { updateDebtPeak, debtProgressPct } = useProgressStore();

  const expenses = monthlyExpenses();

  const totalDebt = useMemo(
    () => (debtItems || []).reduce((sum, d) => sum + num(d.balance), 0),
    [debtItems],
  );

  const efTarget = Math.max(0, 3 * expenses);
  const efCurrent = Math.max(0, emergencyFundCurrent);
  const efProgress = efTarget > 0 ? Math.min(100, (efCurrent / efTarget) * 100) : 0;
  const debtProgress = debtProgressPct(totalDebt);

  // Auto-rebaseline: whenever totalDebt increases, record it as the new peak.
  // Progress is then automatically shown as balances drop below that peak.
  useEffect(() => {
    if (totalDebt > 0) updateDebtPeak(totalDebt);
  }, [totalDebt]);

  const handleAddDebt = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addDebt();
  };

  const handleRemoveDebt = async (idx: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove debt', 'Remove this debt from your plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeDebt(idx),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <DoneToolbar />
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
          <View>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5 }}>EF & Debt</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 }}>
              Emergency Fund & High-APR Debts
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
          {/* Emergency Fund Card */}
          <Card title="Emergency Fund">
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.md }}>
              Set your current balance. SAVR targets 3× your monthly expenses as a full emergency fund.
            </Text>

            <CurrencyInput
              label="Current balance"
              value={efCurrent}
              onChange={setEmergencyFundCurrent}
              placeholder="0"
              large
            />

            <View style={{ marginTop: SPACING.md }}>
              <MetricRow
                label="Target fund (3× expenses)"
                value={efTarget ? fmtCurrency(efTarget) : expenses ? fmtCurrency(efTarget) : '—'}
                style={{ borderBottomWidth: 0 }}
              />
            </View>

            {efTarget > 0 && (
              <View style={{ marginTop: SPACING.sm }}>
                <ProgressBar pct={efProgress} />
              </View>
            )}

            <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.xs, lineHeight: 16 }}>
              Monthly cash comes from your Budget tab (spare per month). When that changes, your timelines update automatically.
            </Text>
          </Card>

          {/* High-APR Debts Card */}
          <Card title="High-APR Debts">
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.md }}>
              Track debts with APR above ~10% (credit cards, store cards, high-rate personal loans).
            </Text>

            {debtItems.length === 0 && (
              <View style={{ marginBottom: SPACING.md }}>
                {noHighAprDebtAcknowledged ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                    <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1 }}>
                      No high-APR debt confirmed. Add a debt above if your situation changes.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md, lineHeight: 18 }}>
                      Only add debts with APR above ~10% (credit cards, store cards, high-rate loans).
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNoHighAprDebtAcknowledged(true);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: SPACING.sm,
                        paddingVertical: SPACING.sm,
                        paddingHorizontal: SPACING.md,
                        borderRadius: RADIUS.md,
                        borderWidth: 1,
                        borderColor: COLORS.inputBorder,
                        backgroundColor: COLORS.inputBg,
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.textMuted} />
                      <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                        No current debt above 10% APR
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {debtItems.map((d, idx) => (
              <DebtRow
                key={idx}
                debt={d}
                idx={idx}
                onUpdate={(patch) => updateDebt(idx, patch)}
                onRemove={() => handleRemoveDebt(idx)}
              />
            ))}

            <Button
              label="Add debt"
              onPress={handleAddDebt}
              variant="outline"
              style={{ marginTop: SPACING.xs }}
            />

            {debtItems.length > 0 && (
              <>
                <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.md, lineHeight: 16 }}>
                  Est. minimum = interest + 1% of balance (or $25, whichever is higher). Avalanche method — highest APR paid first.
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.separator }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Total debt</Text>
                  <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>
                    {totalDebt ? fmtCurrency(totalDebt) : '$0'}
                  </Text>
                </View>
              </>
            )}
          </Card>

          {/* Debt Progress Card */}
          {debtProgress > 0 || totalDebt > 0 ? (
            <Card title="Debt payoff progress">
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.sm }}>
                Automatically tracks how much you've paid down since your highest recorded total.
              </Text>
              <ProgressBar pct={debtProgress} />
              <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.sm, lineHeight: 16 }}>
                {debtProgress > 0
                  ? `${debtProgress.toFixed(0)}% paid down from your recorded peak`
                  : 'Progress will appear once a balance drops below its peak.'}
              </Text>
            </Card>
          ) : null}
        </ScrollView>
    </SafeAreaView>
  );
}
