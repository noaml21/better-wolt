import React from 'react';
import { Text, View } from 'react-native';
import { createStyles } from '../theme';
import { getPlateTone } from '../services/presentation';

/* A restaurant without a photograph: its first word on its own tint, the
   same plate the web client draws (V4 spec §4.4). Decorative — the name
   is always on screen beside it. */

const TONES = {
  amber: ['amberTint', 'ink'],
  flame: ['flameTint', 'flameDeep'],
  herb: ['herbTint', 'herb'],
  ink: ['inkTint', 'ink'],
};

export default function Plate({ restaurant, size = 30, showWord = true, style }) {
  const styles = useStyles();
  const [background, foreground] = TONES[getPlateTone(restaurant)];
  const word = restaurant?.name?.trim().split(/\s+/)[0] || '';

  return (
    <View
      style={[styles.plate, { backgroundColor: styles[background].color }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showWord ? (
        <Text
          style={[styles.word, { fontSize: size, lineHeight: size * 1.15, color: styles[foreground].color }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {word}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = createStyles(({ colors, space }) => ({
  plate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[3] },
  word: { fontWeight: '900', textAlign: 'center' },
  amberTint: { color: colors.amberTint },
  flameTint: { color: colors.flameTint },
  herbTint: { color: colors.herbTint },
  inkTint: { color: colors.inkTint },
  ink: { color: colors.ink },
  flameDeep: { color: colors.flameDeep },
  herb: { color: colors.herb },
}));
