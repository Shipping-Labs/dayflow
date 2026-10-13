import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

interface TextFieldProps extends TextInputProps {
  label?: string;
  icon?: IconName;
  error?: string;
  multilineHeight?: number;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, error, multiline, multilineHeight = 150, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors } = useTheme().theme;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.text : colors.border;

  return (
    <View style={styles.wrap}>
      {label && <AppText variant="overline" tone="tertiary" style={styles.label}>{label}</AppText>}
      <View
        style={[
          styles.field,
          multiline && { minHeight: multilineHeight, alignItems: 'flex-start', paddingVertical: spacing.md },
          { backgroundColor: colors.surfaceSunken, borderColor },
        ]}
      >
        {icon && <Icon name={icon} size={17} color={colors.textTertiary} />}
        <TextInput
          ref={ref}
          multiline={multiline}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={e => { setFocused(true); onFocus?.(e); }}
          onBlur={e => { setFocused(false); onBlur?.(e); }}
          style={[
            styles.input,
            typography.body,
            { color: colors.text },
            multiline && { minHeight: multilineHeight - spacing.md * 2, maxHeight: 280 },
            style,
          ]}
          {...rest}
        />
      </View>
      {error && <AppText variant="caption" tone="danger" style={styles.error}>{error}</AppText>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, paddingVertical: spacing.sm },
  error: { marginLeft: 2 },
});
