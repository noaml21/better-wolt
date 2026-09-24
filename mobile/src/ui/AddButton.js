import React from 'react';
import { Pressable } from 'react-native';
import { createStyles } from '../theme';
import Icon from './Icon';

/* The quiet round add control (docs/V4_DESIGN_SPEC.md §5). It repeats on
   every row of a menu, so it must not outshout the dish; it has no word,
   and its accessible name carries the dish. */

export default function AddButton({ name, onPress }) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={`הוספה: ${name}`}
      style={({ pressed }) => [styles.add, pressed && styles.pressed]}
    >
      <Icon name="plus" size={20} color={styles.glyph.color} />
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, radius, isDark }) => ({
  add: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flameTint,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.94 }] },
  glyph: { color: isDark ? colors.flame : colors.flameDeep },
}));
