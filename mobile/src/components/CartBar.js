import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, useReducedMotion } from '../theme';
import { dishCount } from '../services/presentation';
import { formatPrice } from '../ui';

/* Docked above the gesture bar while a menu is open: how much is in the
   cart, what it costs, and one tap to it. It floats over the list, so
   the list pays for its height in paddingBottom. */

export const CART_BAR_SPACE = 96;

/* Motion (docs/V4_DESIGN_SPEC.md §7): the bar rises from the bottom edge
   when it first appears, and its count bumps when a dish is added — on a
   phone that is the one sign the add landed. Both on the native driver,
   both skipped when the OS asks for reduced motion. */
export default function CartBar({ itemsCount, subtotal, onPress }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [rise] = useState(() => new Animated.Value(1));
  const [bump] = useState(() => new Animated.Value(1));
  const lastCount = useRef(itemsCount);

  useEffect(() => {
    if (reduced) {
      rise.setValue(0);
      return;
    }

    Animated.timing(rise, {
      toValue: 0,
      duration: 260,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: true,
    }).start();
  }, [reduced, rise]);

  useEffect(() => {
    if (itemsCount === lastCount.current) {
      return;
    }

    lastCount.current = itemsCount;

    if (reduced) {
      return;
    }

    bump.setValue(1);
    Animated.sequence([
      Animated.timing(bump, { toValue: 1.18, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(bump, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [itemsCount, reduced, bump]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, 96] });

  return (
    <Animated.View style={[styles.dock, { bottom: insets.bottom + 12, transform: [{ translateY }] }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`צפייה בסל, ${dishCount(itemsCount)}, ${formatPrice(subtotal)}`}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <Animated.View style={[styles.count, { transform: [{ scale: bump }] }]}>
          <Text style={styles.countText}>{itemsCount}</Text>
        </Animated.View>

        <Text style={styles.label}>צפייה בסל</Text>
        <Text style={styles.total}>{formatPrice(subtotal)}</Text>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  dock: { position: 'absolute', left: space[4], right: space[4] },
  bar: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    minHeight: 56,
    paddingHorizontal: space[4],
    borderRadius: radius.sm,
    backgroundColor: colors.flame,
    ...shadow.e3,
  },
  pressed: { opacity: 0.94 },
  count: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: space[1],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  countText: { ...type.caption, ...type.num, color: colors.onFlame, fontWeight: '800' },
  label: { ...type.body, flex: 1, color: colors.onFlame, fontWeight: '700' },
  total: { ...type.body, ...type.num, color: colors.onFlame, fontWeight: '800' },
}));
