import React, { ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Focused once the sheet has finished sliding in, so the keyboard doesn't race the open animation. */
  initialFocusRef?: RefObject<TextInput | null>;
}

const FOCUS_DELAY_MS = 320;

function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const animateTo = (value: number, duration?: number) => {
      Animated.timing(offset, {
        toValue: value,
        duration: ios ? duration || 250 : 0,
        easing: Easing.bezier(0.17, 0.59, 0.4, 0.77),
        useNativeDriver: true,
      }).start();
    };
    const show = (e: KeyboardEvent) => {
      setHeight(e.endCoordinates.height);
      animateTo(e.endCoordinates.height, e.duration);
    };
    const hide = (e: KeyboardEvent) => {
      setHeight(0);
      animateTo(0, e?.duration);
    };
    const subs = [
      Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', show),
      Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', hide),
    ];
    return () => subs.forEach(s => s.remove());
  }, [offset]);

  return { height, offset };
}

export function BottomSheet({ visible, title, subtitle, onClose, children, footer, initialFocusRef }: BottomSheetProps) {
  const { colors } = useTheme().theme;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboard = useKeyboardHeight();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, damping: 22, stiffness: 220, mass: 0.9 }).start();
      if (initialFocusRef) {
        const timer = setTimeout(() => initialFocusRef.current?.focus(), FOCUS_DELAY_MS);
        return () => clearTimeout(timer);
      }
    } else if (mounted) {
      Keyboard.dismiss();
      Animated.timing(progress, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true })
        .start(() => setMounted(false));
    }
  }, [visible, mounted, progress, initialFocusRef]);

  const keyboardOpen = keyboard.height > 0;
  const slide = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight * 0.6, 0] });
  const translateY = Animated.subtract(slide, keyboard.offset);
  const maxHeight = windowHeight - insets.top - spacing.md - keyboard.height;
  const paddingBottom = keyboardOpen ? spacing.md : Math.max(insets.bottom, spacing.lg) + spacing.sm;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop, opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom,
              maxHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText variant="title">{title}</AppText>
              {subtitle && <AppText variant="callout" tone="secondary">{subtitle}</AppText>}
            </View>
            <IconButton icon="x" onPress={onClose} accessibilityLabel="Close" size={36} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer && <View style={styles.footer}>{footer}</View>}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xl },
  headerText: { flex: 1, gap: spacing.xs },
  scroll: { flexGrow: 0, flexShrink: 1 },
  body: { gap: spacing.xl, paddingBottom: spacing.xs },
  footer: { paddingTop: spacing.lg },
});
