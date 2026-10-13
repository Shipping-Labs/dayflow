import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DateCalendarPicker } from '../../components/ui/DateCalendarPicker';
import { AppText } from '../../components/ui/AppText';
import { Chip } from '../../components/ui/Chip';
import { dueShortcutOptions, formatDue } from '../../lib/date';
import { spacing } from '../../theme/tokens';

interface DueDateFieldProps {
  value: string;
  onChange: (due: string) => void;
  error?: string;
  onError: (message?: string) => void;
}

export function DueDateField({ value, onChange, error, onError }: DueDateFieldProps) {
  const shortcuts = useMemo(() => dueShortcutOptions(), []);
  const showHint = !!value.trim();

  const applyShortcut = (due: string) => {
    onChange(due);
    onError(undefined);
  };

  const onCalendarChange = (due: string) => {
    onChange(due);
    onError(undefined);
  };

  return (
    <View style={styles.wrap}>
      <AppText variant="overline" tone="tertiary" style={styles.label}>Due date</AppText>
      <View style={styles.chips}>
        {shortcuts.map(s => (
          <Chip key={s.id} label={s.label} selected={value === s.value} onPress={() => applyShortcut(s.value)} />
        ))}
      </View>

      <DateCalendarPicker value={value} onChange={onCalendarChange} />

      {showHint && !error && (
        <AppText variant="caption" tone="secondary" style={styles.hint}>
          Due {formatDue(value.trim())}
        </AppText>
      )}
      {error && (
        <AppText variant="caption" tone="danger" style={styles.hint}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { marginLeft: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { marginLeft: 2, marginTop: -spacing.xs },
});
