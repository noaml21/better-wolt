import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, useTheme } from '../theme';

/* The same mark as the web client (components/brand/Logo.jsx): a line
   badge — a black square with the B — beside the wordmark in signage
   type (V5 spec §5). */

export default function Logo({ size = 36, tone = 'ink', word = true }) {
  const styles = useStyles();
  const { colors } = useTheme();
  /* 'onBoard' is for the black board (same in both themes); 'onInk' for
     an ink surface, which flips with the theme. */
  const fg = tone === 'onBoard' ? colors.onBoard : tone === 'onInk' ? colors.onInk : colors.ink;
  const bg = tone === 'onBoard' ? colors.board : tone === 'onInk' ? colors.ink : colors.onInk;

  return (
    <View style={styles.logo} accessibilityRole="image" accessibilityLabel="Better Wolt">
      {word ? <Text style={[styles.word, { color: fg, fontSize: size * 0.95, lineHeight: size }]}>Better Wolt</Text> : null}
      <View style={[styles.mark, { width: size, height: size, backgroundColor: fg }]}>
        <Text style={[styles.letter, { color: bg, fontSize: size * 0.82, lineHeight: size }]}>B</Text>
      </View>
    </View>
  );
}

const useStyles = createStyles(({ space, font }) => ({
  logo: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  mark: { alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: font.display, paddingTop: 4 },
  word: { fontFamily: font.display, paddingTop: 4 },
}));
