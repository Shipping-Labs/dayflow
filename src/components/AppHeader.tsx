import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { IconButton } from './ui/IconButton';

export function AppHeader() {
  const { theme, toggleScheme } = useTheme();
  const { colors } = theme;
  const isDark = theme.scheme === 'dark';

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: colors.text }]}>
          <View style={[styles.markSun, { backgroundColor: colors.accent }]} />
          <View style={[styles.markHorizon, { backgroundColor: colors.background }]} />
        </View>
        <AppText variant="headline" style={styles.wordmark}>dayflow</AppText>
      </View>
      <IconButton
        icon={isDark ? 'sun' : 'moon'}
        onPress={toggleScheme}
        accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  mark: {
    width: 32,
    height: 32,
    borderRadius: radius.md - 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markSun: { width: 16, height: 16, borderRadius: 8, position: 'absolute', top: 7 },
  markHorizon: { width: 20, height: 2, borderRadius: 1, marginBottom: 8 },
  wordmark: { fontSize: 19, fontWeight: '800', letterSpacing: -0.7 },
});
