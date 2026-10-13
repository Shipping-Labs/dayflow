import React from 'react';
import { Text, TextProps } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { ThemeColors } from '../../theme/themes';
import { typography, TypographyVariant } from '../../theme/tokens';

type Tone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'danger' | 'success' | 'onAccent';

const TONE_TO_COLOR: Record<Tone, keyof ThemeColors> = {
  primary: 'text',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  accent: 'accent',
  danger: 'danger',
  success: 'success',
  onAccent: 'onAccent',
};

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  tone?: Tone;
  color?: string;
}

export function AppText({ variant = 'body', tone = 'primary', color, style, ...rest }: AppTextProps) {
  const { theme } = useTheme();
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: color ?? theme.colors[TONE_TO_COLOR[tone]] }, style]}
    />
  );
}
