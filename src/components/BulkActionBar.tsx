import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onCancel: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onCancel,
  onSelectAll,
  onClearSelection,
  onDelete,
}: BulkActionBarProps) {
  const { colors } = useTheme().theme;
  const insets = useSafeAreaInsets();
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.top}>
        <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button" style={styles.cancel}>
          <Icon name="x" size={18} color={colors.textSecondary} />
          <AppText variant="label" tone="secondary">Cancel</AppText>
        </Pressable>
        <AppText variant="bodyStrong">
          {selectedCount} selected
        </AppText>
        <Pressable
          onPress={allSelected ? onClearSelection : onSelectAll}
          hitSlop={8}
          accessibilityRole="button"
          disabled={totalCount === 0}
        >
          <AppText variant="label" tone="accent">{allSelected ? 'Clear' : 'Select all'}</AppText>
        </Pressable>
      </View>
      <Button
        label={selectedCount ? `Delete ${selectedCount} ${selectedCount === 1 ? 'task' : 'tasks'}` : 'Delete selected'}
        icon="trash-2"
        variant="danger"
        onPress={onDelete}
        disabled={selectedCount === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cancel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
