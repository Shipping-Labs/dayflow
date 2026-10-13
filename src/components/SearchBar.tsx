import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import { Icon } from './ui/Icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { colors } = useTheme().theme;

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="search" size={17} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search tasks and projects"
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, typography.callout, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel="Clear search">
          <View style={[styles.clear, { backgroundColor: colors.surfaceMuted }]}>
            <Icon name="x" size={12} color={colors.textSecondary} />
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, paddingVertical: 0 },
  clear: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
