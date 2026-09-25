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
        style={({ pressed }) => [styles.button, styles.less, pressed && styles.pressed]}
      >
        <Icon name={atMin ? 'trash' : 'minus'} size={16} color={styles.lessGlyph.color} />
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

/* Three outlined square cells on one 2pt ink frame (V5 spec §5): the
   stepper repeats on every chosen dish, so nothing in it is filled. */
const useStyles = createStyles(({ colors, type }) => ({
  container: {
    ...rtl.row,
    alignItems: 'stretch',
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  less: {},
  lessGlyph: { color: colors.ink },
  pressed: { backgroundColor: colors.hairline, transform: [{ scale: 0.92 }] },
  value: {
    ...type.bodyL,
    ...type.num,
    minWidth: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 36,
    fontWeight: '800',
    color: colors.ink,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.ink,
  },
  glyph: { color: colors.ink },
}));
