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

/* A card is rare in the Line system (spec §3.4): a ruled box, no shadow. */
const useStyles = createStyles(({ colors }) => ({
  card: {
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  pressed: { backgroundColor: colors.ground },
}));
