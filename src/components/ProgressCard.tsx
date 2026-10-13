import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { Icon } from './ui/Icon';

interface ProgressCardProps {
  done: number;
  total: number;
  remaining: number;
  overdue: number;
  progress: number;
}

export function ProgressCard({ done, total, remaining, overdue, progress }: ProgressCardProps) {
  const { colors } = useTheme().theme;
  const fill = useRef(new Animated.Value(progress)).current;
  const percent = Math.round(progress * 100);

  useEffect(() => {
    Animated.timing(fill, { toValue: progress, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress, fill]);

  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const message =
    total === 0 ? 'Nothing scheduled for today yet'
      : remaining === 0 ? 'All clear. Enjoy the rest of your day'
        : `${remaining} left to go`;

  return (
    <View style={[styles.card, { backgroundColor: colors.hero, borderColor: colors.heroBorder }]}>
      <View style={styles.top}>
        <View style={styles.headline}>
          <AppText variant="overline" color={colors.onHeroMuted}>Daily momentum</AppText>
          <View style={styles.countRow}>
            <AppText variant="display" color={colors.onHero} style={styles.count}>{done}</AppText>
            <AppText variant="bodyStrong" color={colors.onHeroMuted}>
              {total > 0 ? `of ${total} done today` : 'done today'}
            </AppText>
          </View>
        </View>
        {total > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <AppText variant="label" color={colors.onAccent}>{percent}%</AppText>
          </View>
        )}
      </View>

      <View style={[styles.track, { backgroundColor: colors.heroTrack }]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: colors.accent }]} />
      </View>

      <View style={styles.bottom}>
        <AppText variant="caption" color={colors.onHeroMuted}>{message}</AppText>
        {overdue > 0 && (
          <View style={styles.overdue}>
            <Icon name="alert-circle" size={13} color={colors.danger} />
            <AppText variant="caption" color={colors.danger}>{overdue} overdue</AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.xl, gap: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headline: { gap: spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  count: { fontSize: 40, lineHeight: 44 },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overdue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
