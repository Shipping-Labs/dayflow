import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { dateKeyToDate, formatDueLong, isValidDateKey, toDateKey, todayKey } from '../../lib/date';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface DateCalendarPickerProps {
  value: string;
  onChange: (due: string) => void;
}

export function DateCalendarPicker({ value, onChange }: DateCalendarPickerProps) {
  const { theme } = useTheme();
  const { colors, scheme } = theme;
  const hasDate = !!value.trim() && isValidDateKey(value.trim());
  const pickerDate = useMemo(
    () => (hasDate ? dateKeyToDate(value.trim()) : dateKeyToDate(todayKey())),
    [hasDate, value],
  );
  const onPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(toDateKey(date));
  };

  const startPicking = () => {
    if (!hasDate) onChange(todayKey());
  };

  if (!hasDate) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={startPicking}
        style={({ pressed }) => [
          styles.empty,
          {
            backgroundColor: pressed ? colors.surfaceMuted : colors.surfaceSunken,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <Icon name="calendar" size={20} color={colors.accent} />
        </View>
        <View style={styles.emptyText}>
          <AppText variant="bodyStrong">Choose on calendar</AppText>
          <AppText variant="caption" tone="tertiary">Tap to open a date picker — no typing needed.</AppText>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      </Pressable>
    );
  }

  const shortcutNote = formatDueLong(value.trim());

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <Icon name="calendar" size={20} color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="bodyStrong">{shortcutNote}</AppText>
          <AppText variant="caption" tone="tertiary">Swipe the calendar or use a shortcut above</AppText>
        </View>
      </View>

      {Platform.OS === 'ios' && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="inline"
          themeVariant={scheme}
          accentColor={colors.accent}
          onChange={onPickerChange}
          style={styles.iosPicker}
        />
      )}

      {Platform.OS === 'android' && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="calendar"
          onChange={onPickerChange}
          style={styles.androidPicker}
        />
      )}

      {Platform.OS === 'web' && (
        <AppText variant="caption" tone="tertiary" style={styles.webNote}>
          Use the shortcuts above on web, or run the iOS/Android app for the full calendar.
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerText: { flex: 1, gap: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosPicker: {
    alignSelf: 'stretch',
    marginHorizontal: -spacing.sm,
  },
  androidPicker: {
    alignSelf: 'center',
  },
  webNote: { marginTop: spacing.xs },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyText: { flex: 1, gap: 2 },
});
