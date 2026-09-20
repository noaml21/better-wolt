import React from 'react';
import { Pressable, View } from 'react-native';
import { createStyles } from '../theme';

export default function Card({ children, onPress, style, accessibilityLabel }) {
  const styles = useStyles();

  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, radius, shadow }) => ({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    ...shadow.e1,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
}));
