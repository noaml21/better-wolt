import React from 'react';
import { Pressable } from 'react-native';
import { createStyles, TOUCH_TARGET } from '../theme';
import Icon from './Icon';

export default function IconButton({ icon, label, onPress, variant = 'ghost', size = 20, style }) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
    >
      <Icon name={icon} size={size} color={styles[`icon_${variant}`].color} />
    </Pressable>
  );
}

const useStyles = createStyles(({ colors }) => ({
  base: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ghost: { backgroundColor: 'transparent' },
  onNight: { backgroundColor: 'transparent', borderColor: colors.onBoard },
  outline: { backgroundColor: 'transparent', borderColor: colors.ink },
  solid: { backgroundColor: colors.ink, borderColor: colors.ink },
  /* Delete repeats on every owner row: neutral at rest (spec §5). */
  danger: { backgroundColor: 'transparent', borderColor: colors.rule },
  pressed: { transform: [{ scale: 0.94 }] },
  icon_ghost: { color: colors.ink },
  icon_onNight: { color: colors.onBoard },
  icon_outline: { color: colors.ink },
  icon_solid: { color: colors.onInk },
  icon_danger: { color: colors.ink },
}));
