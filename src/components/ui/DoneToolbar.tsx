// src/components/ui/DoneToolbar.tsx
// Renders a styled "Done" toolbar above the iOS keyboard for numeric inputs.
// Decimal-pad and number-pad keyboards have no built-in dismiss button —
// this provides one and also styles the accessory area to match the dark theme
// (avoiding the unstyled black/empty bar).
//
// Usage:
//   1. Render <DoneToolbar /> once in your screen (e.g. inside SafeAreaView).
//   2. Add inputAccessoryViewID={KEYBOARD_DONE_ID} to each numeric TextInput.
//   Does nothing on Android.

import React from 'react';
import {
  InputAccessoryView,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export const KEYBOARD_DONE_ID = 'savr-keyboard-done';

export function DoneToolbar() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.sm,
          backgroundColor: '#1c1c1e',
          borderTopWidth: 1,
          borderTopColor: COLORS.separator,
        }}
      >
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 8 }}
        >
          <Text style={{ color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}
