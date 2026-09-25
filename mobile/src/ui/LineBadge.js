import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, useTheme } from '../theme';
import { getLine, lineColours } from '../services/presentation';

/* A restaurant's line badge (V5 spec §5): a square in its line colour
   with its number. Decorative — the name is always beside it. `outline`
   draws the edge in the given colour (on a flooded surface). */

export default function LineBadge({ restaurant, size = 44, outline, style }) {
  const styles = useStyles();
  const theme = useTheme();
  const line = getLine(restaurant);
  const [fill, text] = lineColours(line, theme);

  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, backgroundColor: fill, borderColor: outline || theme.colors.ink },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.number, { color: text, fontSize: size * 0.72, lineHeight: size * 0.8 }]}>{line.number}</Text>
    </View>
  );
}

const useStyles = createStyles(({ font }) => ({
  badge: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  number: { fontFamily: font.display, paddingTop: 3 },
}));
