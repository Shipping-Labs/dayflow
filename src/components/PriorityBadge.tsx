import React from 'react';
import { StyleSheet, View } from 'react-native';

import { priorityVisual } from '../lib/priority';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { Priority } from '../types/task';
import { AppText } from './ui/AppText';
import { Icon } from './ui/Icon';

export function PriorityBadge({ priority, done }: { priority: Priority; done: boolean }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const visual = priorityVisual(priority, colors, done);
  if (!visual) return null;

  const onDark = theme.scheme === 'dark';
  const bg = onDark ? `${visual.accent}22` : visual.soft;
  const border = visual.accent;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Icon name="flag" size={11} color={visual.accent} />
      <AppText variant="caption" color={visual.accent} style={styles.text}>{visual.label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  text: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 0.3 },
});
