import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { Icon, IconName } from './ui/Icon';

interface ActionProps {
  icon: IconName;
  title: string;
  subtitle: string;
  tint: string;
  tintSoft: string;
  onPress: () => void;
}

function ActionCard({ icon, title, subtitle, tint, tintSoft, onPress }: ActionProps) {
  const { colors } = useTheme().theme;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.surfaceMuted : colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: tintSoft }]}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <View style={styles.copy}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" tone="secondary">{subtitle}</AppText>
      </View>
    </Pressable>
  );
}

export function QuickActions({ onCapture, onBackup }: { onCapture: () => void; onBackup: () => void }) {
  const { colors } = useTheme().theme;
  return (
    <View style={styles.row}>
      <ActionCard
        icon="list"
        title="Quick capture"
        subtitle="Paste a list, get tasks"
        tint={colors.accent}
        tintSoft={colors.accentSoft}
        onPress={onCapture}
      />
      <ActionCard
        icon="shield"
        title="Backup & restore"
        subtitle="Keep your data safe"
        tint={colors.success}
        tintSoft={colors.successSoft}
        onPress={onBackup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  card: { flex: 1, borderRadius: radius.lg + 2, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  copy: { gap: spacing.xxs + 1 },
});
