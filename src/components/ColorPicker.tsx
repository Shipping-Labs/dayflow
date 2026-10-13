import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { hexToHsv, hsvToHex, normalizeHexColor } from '../lib/color';
import { haptics } from '../lib/haptics';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';
import { AppText } from './ui/AppText';

const PANEL_HEIGHT = 168;
const HUE_STOPS = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'] as const;

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { colors } = useTheme().theme;
  const [panelWidth, setPanelWidth] = useState(0);
  const [hsv, setHsv] = useState(() => hexToHsv(value));

  useEffect(() => {
    const normalized = normalizeHexColor(value);
    if (normalized) setHsv(hexToHsv(normalized));
  }, [value]);

  const hueBase = useMemo(() => hsvToHex(hsv.h, 1, 1), [hsv.h]);

  const emit = (next: typeof hsv) => {
    setHsv(next);
    onChange(hsvToHex(next.h, next.s, next.v));
  };

  const onPanelLayout = (e: LayoutChangeEvent) => {
    setPanelWidth(e.nativeEvent.layout.width);
  };

  const pickSv = (locationX: number, locationY: number) => {
    if (!panelWidth) return;
    const s = Math.min(1, Math.max(0, locationX / panelWidth));
    const v = Math.min(1, Math.max(0, 1 - locationY / PANEL_HEIGHT));
    haptics.selection();
    emit({ ...hsv, s, v });
  };

  const knobX = panelWidth ? hsv.s * panelWidth : 0;
  const knobY = (1 - hsv.v) * PANEL_HEIGHT;

  return (
    <View style={styles.wrap}>
      <Pressable
        onLayout={onPanelLayout}
        onPress={e => pickSv(e.nativeEvent.locationX, e.nativeEvent.locationY)}
        accessibilityRole="adjustable"
        accessibilityLabel="Saturation and brightness"
        style={[styles.panel, { borderColor: colors.border }]}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: hueBase }]} />
        <LinearGradient colors={['#FFFFFF', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['transparent', '#000000']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
        {panelWidth > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.knob,
              {
                left: Math.min(panelWidth - 12, Math.max(0, knobX - 12)),
                top: Math.min(PANEL_HEIGHT - 12, Math.max(0, knobY - 12)),
                borderColor: colors.surface,
                backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v),
              },
            ]}
          />
        )}
      </Pressable>

      <View style={styles.hueRow}>
        <AppText variant="caption" tone="tertiary" style={styles.hueLabel}>Hue</AppText>
        <View style={styles.hueTrackWrap}>
          <LinearGradient colors={HUE_STOPS} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.hueTrack} />
          <Slider
            style={styles.hueSlider}
            minimumValue={0}
            maximumValue={360}
            step={1}
            value={hsv.h}
            onValueChange={h => emit({ ...hsv, h })}
            onSlidingComplete={() => haptics.selection()}
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            thumbTintColor={colors.surface}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  panel: {
    height: PANEL_HEIGHT,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  knob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  hueRow: { gap: spacing.xs },
  hueLabel: { marginLeft: 2 },
  hueTrackWrap: { height: 36, justifyContent: 'center' },
  hueTrack: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.pill,
    marginVertical: 10,
  },
  hueSlider: { width: '100%', height: 40 },
});
