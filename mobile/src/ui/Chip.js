import React from 'react';
import { Pressable, Text } from 'react-native';
import { createStyles, TOUCH_TARGET } from '../theme';

export default function Chip({ children, onPress, selected = false, style }) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      /* A chip reads best at 38pt, so the extra 6pt of target comes from
         hitSlop rather than from the shape (V3_DESIGN_SPEC §4.4). */
      hitSlop={(TOUCH_TARGET - CHIP_HEIGHT) / 2}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{children}</Text>
    </Pressable>
  );
}

const CHIP_HEIGHT = 38;

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  chip: {
    minHeight: CHIP_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  label: { ...type.caption, color: colors.ink, fontWeight: '700' },
  labelSelected: { color: colors.onInk },
}));
