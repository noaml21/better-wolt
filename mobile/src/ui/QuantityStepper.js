import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Icon from './Icon';

export default function QuantityStepper({ value, onIncrease, onDecrease, label, min = 0 }) {
  const styles = useStyles();
  const atMin = value <= min;

  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel={`${label}, ${value}`}>
      <Pressable
        onPress={onDecrease}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={atMin ? `הסרת ${label}` : `פחות ${label}`}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name={atMin ? 'trash' : 'minus'} size={16} color={styles.glyph.color} />
      </Pressable>

      <Text style={styles.value}>{value}</Text>

      <Pressable
        onPress={onIncrease}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`עוד ${label}`}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name="plus" size={16} color={styles.glyph.color} />
      </Pressable>
    </View>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  container: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[1],
    padding: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flameTint,
  },
  pressed: { opacity: 0.75 },
  value: { ...type.body, minWidth: 26, textAlign: 'center', fontWeight: '800', color: colors.ink },
  glyph: { color: colors.flameDeep },
}));
