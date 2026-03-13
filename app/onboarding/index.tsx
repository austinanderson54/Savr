import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../src/constants/theme';

const ONBOARDED_KEY = 'savr-onboarded';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const steps: { iconName: IoniconsName; title: string; body: string }[] = [
  {
    iconName: 'compass-outline',
    title: 'One Next Action — every month',
    body: "SAVR looks at your income, expenses, debt, and emergency fund and tells you exactly where your spare money should go. No guessing.",
  },
  {
    iconName: 'shield-checkmark-outline',
    title: 'Completely private. No accounts.',
    body: 'All your data stays on your device. No login, no cloud, no bank connections. Just your numbers and the plan.',
  },
  {
    iconName: 'layers-outline',
    title: 'Order of operations built in',
    body: 'Starter emergency fund → High-APR debt → Full emergency fund → 401(k) match → Invest. SAVR sequences it for you.',
  },
  {
    iconName: 'analytics-outline',
    title: 'Real math. Not generic advice.',
    body: 'SAVR simulates month-by-month payoffs, calculates real interest, and gives you actual timelines — not ballpark estimates.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const isLast = current === steps.length - 1;

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
      router.replace('/(tabs)');
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const step = steps[current];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: SPACING.xl,
          paddingTop: SPACING.xxl * 2,
          paddingBottom: SPACING.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / title */}
        <View style={{ marginBottom: SPACING.xxl * 2 }}>
          <Text
            style={{
              color: COLORS.text,
              fontSize: 36,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}
          >
            SAVR
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.base, marginTop: SPACING.xs }}>
            Turn chaos into a clear plan.
          </Text>
        </View>

        {/* Step card */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.xl,
            borderWidth: 1,
            borderColor: COLORS.cardBorder,
            padding: SPACING.xl,
            minHeight: 200,
          }}
        >
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.pillBg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg }}>
            <Ionicons name={step.iconName} size={28} color={COLORS.text} />
          </View>
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONT_SIZE.lg,
              fontWeight: '700',
              marginBottom: SPACING.md,
              lineHeight: 28,
            }}
          >
            {step.title}
          </Text>
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONT_SIZE.base,
              lineHeight: 22,
            }}
          >
            {step.body}
          </Text>
        </View>

        {/* Step dots */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: SPACING.xl,
            gap: SPACING.sm,
          }}
        >
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === current ? COLORS.text : COLORS.tabBarInactive,
              }}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: SPACING.xxl * 2 }} />

        {/* CTA button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: COLORS.text,
            borderRadius: RADIUS.md,
            paddingVertical: SPACING.md + 2,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: COLORS.background,
              fontSize: FONT_SIZE.base,
              fontWeight: '700',
            }}
          >
            {isLast ? 'Get started' : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        {!isLast && (
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
              router.replace('/(tabs)');
            }}
            style={{ alignItems: 'center', marginTop: SPACING.lg }}
          >
            <Text style={{ color: COLORS.textDim, fontSize: FONT_SIZE.sm }}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Disclaimer */}
        <Text
          style={{
            color: COLORS.textDim,
            fontSize: FONT_SIZE.xs,
            textAlign: 'center',
            marginTop: SPACING.xl,
            lineHeight: 16,
          }}
        >
          SAVR is educational and informational. It is not financial advice, investment advisory, or tax advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
