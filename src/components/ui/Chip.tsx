import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  icon?: IconName;
  dotColor?: string;
  count?: number;
  /** Outlined, dashed style for "add" affordances. */
  dashed?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Colored selected state (readable label) instead of inverted black/white. */
  selectedTint?: { background: string; border: string; label: string };
}

export function Chip({
  label,
  selected,
  onPress,
  onLongPress,
  icon,
  dotColor,
  count,
  dashed,
  style,
  selectedTint,
}: ChipProps) {
  const { colors } = useTheme().theme;
  const tinted = selected && selectedTint;
  const fg = tinted ? selectedTint.label : selected ? colors.background : colors.textSecondary;
  const labelColor = tinted ? selectedTint.label : selected ? colors.background : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: tinted
            ? selectedTint.background
            : selected
              ? colors.text
              : pressed
                ? colors.surfaceMuted
                : dashed
                  ? 'transparent'
                  : colors.surface,
          borderColor: tinted ? selectedTint.border : selected ? colors.text : dashed ? colors.borderStrong : colors.border,
        },
        dashed && styles.dashed,
        style,
      ]}
    >
      {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      {icon && <Icon name={icon} size={14} color={fg} />}
      <AppText variant="label" color={labelColor}>{label}</AppText>
      {count !== undefined && count > 0 && (
        <View style={[styles.count, { backgroundColor: selected ? colors.accent : colors.surfaceMuted }]}>
          <AppText variant="caption" style={styles.countText} color={selected ? colors.onAccent : colors.textSecondary}>
            {count}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    height: 38,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dashed: { borderStyle: 'dashed' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  countText: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
