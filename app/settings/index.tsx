import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useStore from '../../src/stores/store';
import useBudgetStore from '../../src/stores/budgetStore';
import useProgressStore from '../../src/stores/progressStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';
import { Card } from '../../src/components/ui/Card';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const router = useRouter();
  const resetAll = useStore((s) => s.resetAll);
  const resetBudget = useBudgetStore((s) => s.resetBudget);
  const resetProgress = useProgressStore((s) => s.resetAllProgress);

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reset all data',
      'This will permanently clear all your budget, debt, emergency fund, and progress data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: () => {
            resetAll();
            resetBudget();
            resetProgress();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.separator,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: '700' }}>
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
      >
        {/* App info */}
        <Card title="About SAVR">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Version</Text>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm }}>{APP_VERSION}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>Data storage</Text>
            <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.sm }}>On device only</Text>
          </View>
        </Card>

        {/* Reset */}
        <Card title="Data">
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19, marginBottom: SPACING.md }}>
            Clear all your financial data and start fresh. This action cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              borderWidth: 1,
              borderColor: COLORS.red,
              borderRadius: RADIUS.md,
              paddingVertical: SPACING.sm + 2,
              paddingHorizontal: SPACING.lg,
              alignItems: 'center',
            }}
            activeOpacity={0.75}
          >
            <Text style={{ color: COLORS.red, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
              Reset all data
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Disclaimer */}
        <Card title="Disclaimer">
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19 }}>
            SAVR is an educational and informational planning tool. It is not financial advice, investment advisory, or tax advice.
            {'\n\n'}
            All calculations are estimates based on simplified models. Actual results will vary. Always consult a licensed financial professional for personalized advice.
          </Text>
        </Card>

        {/* Privacy */}
        <Card title="Privacy">
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 19 }}>
            All data you enter in SAVR stays on your device. Nothing is transmitted to any server. There are no accounts, no cloud sync, and no analytics.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
