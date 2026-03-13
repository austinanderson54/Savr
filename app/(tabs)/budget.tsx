import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DoneToolbar } from '../../src/components/ui/DoneToolbar';
import useBudgetStore, { PAY_FREQS, PAY_FREQ_LABELS, PayFrequency, Expense } from '../../src/stores/budgetStore';
import { fmtCurrency } from '../../src/engine/planner';
import { Card } from '../../src/components/ui/Card';
import { CurrencyInput } from '../../src/components/ui/CurrencyInput';
import { Button } from '../../src/components/ui/Button';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

// Pay frequency picker
function FreqPicker({ value, onChange }: { value: PayFrequency; onChange: (f: PayFrequency) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
      {PAY_FREQS.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={async () => {
            await Haptics.selectionAsync();
            onChange(f);
          }}
          style={{
            backgroundColor: value === f ? COLORS.text : COLORS.inputBg,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            marginRight: SPACING.sm,
            borderWidth: 1,
            borderColor: value === f ? COLORS.text : COLORS.inputBorder,
          }}
          activeOpacity={0.75}
        >
          <Text
            style={{
              color: value === f ? COLORS.background : COLORS.text,
              fontSize: FONT_SIZE.sm,
              fontWeight: '600',
            }}
          >
            {PAY_FREQ_LABELS[f]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Expense row
function ExpenseRow({ expense, onUpdate, onRemove }: {
  expense: Expense;
  onUpdate: (data: Partial<{ name: string; amount: number }>) => void;
  onRemove: () => void;
}) {
  const [nameText, setNameText] = useState(expense.name);
  const [amountText, setAmountText] = useState(expense.amount > 0 ? String(expense.amount) : '');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
      }}
    >
      {/* Name */}
      <TextInput
        value={nameText}
        onChangeText={(t) => setNameText(t)}
        onBlur={() => onUpdate({ name: nameText })}
        placeholder="Expense name"
        placeholderTextColor={COLORS.textDim}
        returnKeyType="done"
        style={{
          flex: 1.2,
          backgroundColor: COLORS.inputBg,
          borderRadius: RADIUS.sm,
          borderWidth: 1,
          borderColor: COLORS.inputBorder,
          color: COLORS.text,
          fontSize: FONT_SIZE.sm,
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.sm,
          height: 40,
        }}
      />
      {/* Amount */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.inputBg,
          borderRadius: RADIUS.sm,
          borderWidth: 1,
          borderColor: COLORS.inputBorder,
          paddingHorizontal: SPACING.sm,
          height: 40,
        }}
      >
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginRight: 2 }}>$</Text>
        <TextInput
          value={amountText}
          onChangeText={(t) => {
            const cleaned = t.replace(/[^0-9.]/g, '');
            setAmountText(cleaned);
          }}
          onBlur={() => {
            const n = parseFloat(amountText);
            onUpdate({ amount: Number.isFinite(n) ? n : 0 });
          }}
          placeholder="0"
          placeholderTextColor={COLORS.textDim}
          keyboardType="decimal-pad"
          style={{ flex: 1, color: COLORS.text, fontSize: FONT_SIZE.sm }}
        />
      </View>
      {/* Remove */}
      <TouchableOpacity onPress={onRemove} style={{ padding: SPACING.xs }} activeOpacity={0.7}>
        <Ionicons name="close-circle" size={22} color={COLORS.textDim} />
      </TouchableOpacity>
    </View>
  );
}

export default function BudgetScreen() {
  const router = useRouter();
  const {
    payFrequency, takeHomePerPaycheck, setPayFrequency, setTakeHomePerPaycheck,
    hasSecondIncome, payFrequency2, takeHomePerPaycheck2,
    setHasSecondIncome, setPayFrequency2, setTakeHomePerPaycheck2,
    expenses, addExpense, updateExpense, removeExpense,
    monthlyIncome, monthlyExpenses, sparePerMonth,
  } = useBudgetStore();

  const income = monthlyIncome();
  const expTotal = monthlyExpenses();
  const spare = sparePerMonth();
  const isNegative = spare < 0;

  const handleAddExpense = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addExpense('', 0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <DoneToolbar />
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm }}>
          <View>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5 }}>Budget</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 }}>
              Income − Expenses = Spare per month
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
          {/* Primary Income Card */}
          <Card title="Primary Income">
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm }}>
              Pay frequency
            </Text>
            <FreqPicker value={payFrequency} onChange={setPayFrequency} />
            <CurrencyInput
              label="Take-home per paycheck"
              value={takeHomePerPaycheck}
              onChange={setTakeHomePerPaycheck}
              placeholder="0"
            />
            {income > 0 && (
              <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.sm }}>
                = {fmtCurrency(income)} / month
              </Text>
            )}
          </Card>

          {/* Second Income */}
          <Card>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.selectionAsync();
                setHasSecondIncome(!hasSecondIncome);
              }}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              activeOpacity={0.8}
            >
              <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                Second income
              </Text>
              <Ionicons
                name={hasSecondIncome ? 'toggle' : 'toggle-outline'}
                size={32}
                color={hasSecondIncome ? COLORS.green : COLORS.textMuted}
              />
            </TouchableOpacity>

            {hasSecondIncome && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm }}>
                  Pay frequency
                </Text>
                <FreqPicker value={payFrequency2} onChange={setPayFrequency2} />
                <CurrencyInput
                  label="Take-home per paycheck"
                  value={takeHomePerPaycheck2}
                  onChange={setTakeHomePerPaycheck2}
                  placeholder="0"
                />
              </View>
            )}
          </Card>

          {/* Expenses Card */}
          <Card title="Monthly Expenses">
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.md }}>
              Include all fixed monthly costs — rent, subscriptions, minimum payments for low-APR debts (&lt;10% APR), etc.
            </Text>

            {expenses.length === 0 && (
              <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md, fontStyle: 'italic' }}>
                No expenses yet.
              </Text>
            )}

            {expenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                onUpdate={(data) => updateExpense(e.id, data)}
                onRemove={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  removeExpense(e.id);
                }}
              />
            ))}

            <Button label="Add expense" onPress={handleAddExpense} variant="outline" style={{ marginTop: SPACING.xs }} />

            {expTotal > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.separator }}>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Total expenses</Text>
                <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                  {fmtCurrency(expTotal)} / mo
                </Text>
              </View>
            )}
          </Card>

          {/* Spare per month — big summary */}
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: isNegative ? COLORS.red : COLORS.cardBorder,
              padding: SPACING.lg,
              marginBottom: SPACING.md,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs }}>
              Spare per month
            </Text>
            <Text
              style={{
                color: isNegative ? COLORS.red : COLORS.green,
                fontSize: 34,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              {fmtCurrency(spare)}
            </Text>
            <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.xs, marginTop: SPACING.xs, lineHeight: 16 }}>
              This feeds your Dashboard, planner, and all timelines. When this changes, your Next Action updates automatically.
            </Text>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}
