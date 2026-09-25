import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, useTheme } from '../theme';
import { getLine, lineColours } from '../services/presentation';

/* A restaurant without a photograph: its line plate (V5 spec §4.4) — the
   line colour with the name's first word in signage type, as on the web.
   Decorative: the name is always on screen beside it. */

export default function Plate({ restaurant, size = 30, showWord = true, style }) {
  const styles = useStyles();
  const theme = useTheme();
  const [fill, text] = lineColours(getLine(restaurant), theme);
  const word = restaurant?.name?.trim().split(/\s+/)[0] || '';

  return (
    <View
      style={[styles.plate, { backgroundColor: fill }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showWord ? (
        <Text
          style={[styles.word, { fontSize: size, lineHeight: size, color: text }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {word}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = createStyles(({ space, font }) => ({
  plate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[2] },
  word: { fontFamily: font.display, textAlign: 'center' },
}));
