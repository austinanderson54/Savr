import React from 'react';
import { TouchableOpacity, Text, ViewStyle, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants/theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

const variants: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: COLORS.text, text: COLORS.background },
  outline: { bg: 'transparent', text: COLORS.text, border: COLORS.cardBorder },
  ghost: { bg: 'transparent', text: COLORS.textMuted },
  danger: { bg: 'transparent', text: COLORS.red, border: COLORS.red },
};

export function Button({ label, onPress, variant = 'primary', style, disabled, loading }: ButtonProps) {
  const v = variants[variant];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: v.bg,
          borderRadius: RADIUS.md,
          paddingVertical: SPACING.sm + 2,
          paddingHorizontal: SPACING.lg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={{ color: v.text, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
