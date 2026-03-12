// src/constants/theme.ts
// Design tokens for SAVR native app.

export const COLORS = {
  background: '#0a0a0a',
  card: '#141414',
  cardBorder: 'rgba(255,255,255,0.07)',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textDim: 'rgba(255,255,255,0.45)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.12)',
  separator: 'rgba(255,255,255,0.07)',
  tabBar: '#0f0f0f',
  tabBarActive: '#ffffff',
  tabBarInactive: '#4b5563',
  green: '#4ade80',
  red: '#f87171',
  yellow: '#facc15',
  pillBg: 'rgba(255,255,255,0.1)',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 28,
} as const;
