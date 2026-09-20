import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl } from '../theme';
import { dishCount } from '../services/presentation';
import { formatPrice } from '../ui';

/* Docked above the gesture bar while a menu is open: how much is in the
   cart, what it costs, and one tap to it. It floats over the list, so
   the list pays for its height in paddingBottom. */

export const CART_BAR_SPACE = 96;

export default function CartBar({ itemsCount, subtotal, onPress }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`צפייה בסל, ${dishCount(itemsCount)}, ${formatPrice(subtotal)}`}
      style={({ pressed }) => [styles.bar, { bottom: insets.bottom + 12 }, pressed && styles.pressed]}
    >
      <View style={styles.count}>
        <Text style={styles.countText}>{itemsCount}</Text>
      </View>

      <Text style={styles.label}>צפייה בסל</Text>
      <Text style={styles.total}>{formatPrice(subtotal)}</Text>
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  bar: {
    ...rtl.row,
    position: 'absolute',
    left: space[4],
    right: space[4],
    alignItems: 'center',
    gap: space[3],
    minHeight: 56,
    paddingHorizontal: space[4],
    borderRadius: radius.sm,
    backgroundColor: colors.flame,
    ...shadow.e3,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  count: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: space[1],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  countText: { ...type.caption, color: colors.onFlame, fontWeight: '800' },
  label: { ...type.body, flex: 1, color: colors.onFlame, fontWeight: '700' },
  total: { ...type.body, color: colors.onFlame, fontWeight: '800' },
}));
