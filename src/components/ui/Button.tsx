import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  trailingIcon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', icon, trailingIcon, disabled, style }: ButtonProps) {
  const { colors } = useTheme().theme;

  const palette = disabled
    ? { bg: colors.surfaceMuted, pressed: colors.surfaceMuted, fg: colors.textTertiary, border: 'transparent' }
    : {
      primary: { bg: colors.accent, pressed: colors.accentPressed, fg: colors.onAccent, border: 'transparent' },
      secondary: { bg: colors.surface, pressed: colors.surfaceMuted, fg: colors.text, border: colors.border },
      ghost: { bg: 'transparent', pressed: colors.surfaceMuted, fg: colors.textSecondary, border: 'transparent' },
      danger: { bg: colors.dangerSoft, pressed: colors.dangerSoft, fg: colors.danger, border: 'transparent' },
    }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? palette.pressed : palette.bg, borderColor: palette.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <Icon name={icon} size={17} color={palette.fg} />}
        <AppText variant="bodyStrong" color={palette.fg}>{label}</AppText>
        {trailingIcon && <Icon name={trailingIcon} size={17} color={palette.fg} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { transform: [{ scale: 0.98 }] },
});
