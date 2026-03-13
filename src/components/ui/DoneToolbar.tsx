// src/components/ui/DoneToolbar.tsx
// Floating "Done" bar above the keyboard — replaces InputAccessoryView.
//
// InputAccessoryView is unreliable in Expo managed workflow. This component
// instead listens to keyboard events and renders an absolutely-positioned
// toolbar at the exact top edge of the keyboard. It works on any screen where
// it's rendered as a direct child of SafeAreaView (absolute positioning is
// relative to the SafeAreaView frame = full screen, so bottom: kbHeight lands
// exactly at the keyboard's top edge).
//
// Usage: render <DoneToolbar /> inside your SafeAreaView. No inputAccessoryViewID
// needed on TextInputs.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';

export function DoneToolbar() {
  const [kbHeight, setKbHeight] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const show = Keyboard.addListener('keyboardWillShow', (e) => {
      setKbHeight(e.endCoordinates.height);
      setVisible(true);
    });
    const hide = Keyboard.addListener('keyboardWillHide', () => {
      setVisible(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible || Platform.OS !== 'ios') return null;

  return (
    <View style={[styles.bar, { bottom: kbHeight }]}>
      <TouchableOpacity
        onPress={() => Keyboard.dismiss()}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 10 }}
      >
        <Text style={styles.label}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#1c1c1e',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
    zIndex: 9999,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
});
