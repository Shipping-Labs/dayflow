import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { radius } from '../../theme/tokens';
import { Icon, IconName } from './Icon';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'surface' | 'plain';
  size?: number;
  color?: string;
}

export function IconButton({ icon, onPress, accessibilityLabel, variant = 'surface', size = 42, color }: IconButtonProps) {
  const { colors } = useTheme().theme;
  const surface = variant === 'surface';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? colors.surfaceMuted : surface ? colors.surface : 'transparent',
          borderColor: surface ? colors.border : 'transparent',
        },
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.43)} color={color ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
