import { Platform, TextStyle } from 'react-native';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

const family = Platform.select({ ios: 'System', default: undefined });

export const typography = {
  display: { fontFamily: family, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1.2 },
  title: { fontFamily: family, fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5 },
  headline: { fontFamily: family, fontSize: 17, lineHeight: 22, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontFamily: family, fontSize: 15, lineHeight: 21, fontWeight: '500', letterSpacing: -0.1 },
  bodyStrong: { fontFamily: family, fontSize: 15, lineHeight: 21, fontWeight: '600', letterSpacing: -0.2 },
  callout: { fontFamily: family, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontFamily: family, fontSize: 12.5, lineHeight: 17, fontWeight: '500' },
  label: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  overline: { fontFamily: family, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
