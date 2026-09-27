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

const useStyles = createStyles(({ colors, radius }) => ({
  base: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ghost: { backgroundColor: 'transparent' },
  onNight: { backgroundColor: 'transparent' },
  outline: { backgroundColor: colors.surface, borderColor: colors.line },
  solid: { backgroundColor: colors.flame },
  danger: { backgroundColor: colors.dangerTint },
  pressed: { opacity: 0.7 },
  icon_ghost: { color: colors.ink },
  icon_onNight: { color: colors.onNight },
  icon_outline: { color: colors.ink },
  icon_solid: { color: colors.onFlame },
  icon_danger: { color: colors.danger },
}));
