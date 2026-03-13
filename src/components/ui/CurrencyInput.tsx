import React, { useState, useEffect } from 'react';
import { TextInput, Text, View, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../constants/theme';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  prefix?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  large?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = '0',
  prefix = '$',
  style,
  inputStyle,
  large = false,
}: CurrencyInputProps) {
  const [text, setText] = useState(value > 0 ? String(value) : '');

  // Sync external value changes (e.g. reset)
  useEffect(() => {
    if (value === 0) setText('');
  }, [value]);

  const handleChange = (raw: string) => {
    // Allow digits and one decimal point only
    const cleaned = raw.replace(/[^0-9.]/g, '');
    // Prevent multiple decimals
    const parts = cleaned.split('.');
    const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setText(normalized);
    const n = parseFloat(normalized);
    onChange(Number.isFinite(n) ? n : 0);
  };

  const handleBlur = () => {
    // Format nicely on blur if there's a value
    const n = parseFloat(text);
    if (Number.isFinite(n) && n > 0) {
      setText(String(n));
    } else {
      setText('');
    }
  };

  return (
    <View style={style}>
      {label ? (
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONT_SIZE.sm,
            marginBottom: SPACING.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.inputBg,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: COLORS.inputBorder,
          paddingHorizontal: SPACING.md,
          height: large ? 56 : 44,
        }}
      >
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: large ? FONT_SIZE.lg : FONT_SIZE.base,
            marginRight: 4,
          }}
        >
          {prefix}
        </Text>
        <TextInput
          value={text}
          onChangeText={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          keyboardType="decimal-pad"
          style={[
            {
              flex: 1,
              color: COLORS.text,
              fontSize: large ? FONT_SIZE.lg : FONT_SIZE.base,
              fontWeight: large ? '700' : '400',
            },
            inputStyle,
          ]}
        />
      </View>
    </View>
  );
}

interface PercentInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function PercentInput({ label, value, onChange, placeholder = '0', style }: PercentInputProps) {
  const [text, setText] = useState(value > 0 ? String(value) : '');

  useEffect(() => {
    if (value === 0) setText('');
  }, [value]);

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setText(normalized);
    const n = parseFloat(normalized);
    onChange(Number.isFinite(n) ? n : 0);
  };

  return (
    <View style={style}>
      {label ? (
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.xs }}>
          {label}
        </Text>
      ) : null}
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
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textDim}
          keyboardType="decimal-pad"
          style={{ flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base }}
        />
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.base }}>%</Text>
      </View>
    </View>
  );
}
