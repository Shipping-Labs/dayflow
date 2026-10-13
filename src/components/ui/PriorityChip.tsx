import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PRIORITY_LABEL } from '../../constants/projects';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { Priority } from '../../types/task';
import { AppText } from './AppText';

interface PriorityChipProps {
  priority: Priority;
  selected: boolean;
  onPress: () => void;
  style?: object;
}

export function PriorityChip({ priority, selected, onPress, style }: PriorityChipProps) {
  const { colors } = useTheme().theme;

  const accent =
    priority === 'high' ? colors.danger : priority === 'medium' ? colors.warning : colors.textSecondary;

  const palette = selected
    ? priority === 'high'
      ? { bg: colors.dangerSoft, border: colors.danger, label: colors.danger, dot: colors.danger }
      : priority === 'medium'
        ? { bg: colors.warningSoft, border: colors.warning, label: colors.warning, dot: colors.warning }
        : { bg: colors.surfaceMuted, border: colors.borderStrong, label: colors.text, dot: colors.textSecondary }
    : { bg: colors.surface, border: colors.border, label: colors.textSecondary, dot: colors.textTertiary };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: pressed ? colors.surfaceMuted : palette.bg,
          borderColor: palette.border,
        },
        selected && styles.selected,
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <AppText variant="label" color={palette.label} style={styles.label}>{PRIORITY_LABEL[priority]}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  selected: {
    borderWidth: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontWeight: '700' },
});
