import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

interface MetricRowProps {
  label: string;
  value: string;
  valueColor?: string;
  style?: ViewStyle;
}

export function MetricRow({ label, value, valueColor, style }: MetricRowProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: SPACING.sm,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.separator,
        },
        style,
      ]}
    >
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1, marginRight: SPACING.sm }}>
        {label}
      </Text>
      <Text style={{ color: valueColor ?? COLORS.text, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
        {value}
      </Text>
    </View>
  );
}
