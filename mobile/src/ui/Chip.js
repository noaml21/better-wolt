import React from 'react';
import { Pressable, Text } from 'react-native';
import { createStyles } from '../theme';

export default function Chip({ children, onPress, selected = false, style }) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
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

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  chip: {
    minHeight: 38,
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
