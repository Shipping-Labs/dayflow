import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Icon, IconName } from './ui/Icon';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme().theme;

  return (
    <View style={[styles.card, { borderColor: colors.borderStrong }]}>
      <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
        <Icon name={icon} size={22} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <AppText variant="headline" style={styles.center}>{title}</AppText>
        <AppText variant="callout" tone="secondary" style={styles.center}>{message}</AppText>
      </View>
      {actionLabel && onAction && <Button label={actionLabel} icon="plus" onPress={onAction} style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  icon: { width: 52, height: 52, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: spacing.xs + 2, maxWidth: 280 },
  center: { textAlign: 'center' },
  button: { alignSelf: 'stretch' },
});
