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
export default function CartBar({ itemsCount, subtotal, onPress, line }) {
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
        <Animated.View style={[styles.count, line && { backgroundColor: line[0] }, { transform: [{ scale: bump }] }]}>
          <Text style={[styles.countText, line && { color: line[1] }]}>{itemsCount}</Text>
        </Animated.View>

        <Text style={styles.label}>לסל</Text>
        <Text style={styles.total}>{formatPrice(subtotal)}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* The cart bar (V5 spec §5): an ink bar, the count in a square of the
   restaurant's line colour, "לסל", and the total. */
const useStyles = createStyles(({ colors, space, type, shadow }) => ({
  dock: { position: 'absolute', left: space[3], right: space[3] },
  bar: {
    ...rtl.row,
    alignItems: 'stretch',
    gap: space[3],
    minHeight: 60,
    paddingLeft: space[4],
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.ink,
    ...shadow.e3,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  count: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onInk,
  },
  countText: { ...type.bodyL, ...type.num, fontSize: 22, lineHeight: 28, color: colors.ink, fontWeight: '900' },
  label: { ...type.bodyL, flex: 1, alignSelf: 'center', color: colors.onInk, fontWeight: '800', ...rtl.text },
  total: { ...type.bodyL, ...type.num, alignSelf: 'center', fontSize: 22, lineHeight: 28, color: colors.onInk, fontWeight: '900' },
}));
