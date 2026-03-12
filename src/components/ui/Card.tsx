import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants/theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, subtitle, children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.cardBorder,
          padding: SPACING.lg,
          marginBottom: SPACING.md,
        },
        style,
      ]}
    >
      {title ? (
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONT_SIZE.md,
            fontWeight: '700',
            marginBottom: subtitle ? SPACING.xs : SPACING.sm,
          }}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONT_SIZE.sm,
            lineHeight: 19,
            marginBottom: SPACING.md,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
