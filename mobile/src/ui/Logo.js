import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { createStyles, useTheme } from '../theme';

/* The same drawn mark as the web client (components/brand/Logo.jsx): the
   price tag from the design language, so the two apps sign themselves
   the same way. The wordmark uses the platform font — mobile ships no
   display face (V3_DESIGN_SPEC §4.2). */

export default function Logo({ size = 36, tone = 'ink', word = true }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const onDark = tone === 'onInk';

  return (
    <View style={styles.logo} accessibilityRole="image" accessibilityLabel="Better Wolt">
      <Svg width={size} height={size} viewBox="0 0 36 36">
        <Path
          d="M31.6 14.3 22.4 4.6A5.2 5.2 0 0 0 18.6 3H8.2A5.2 5.2 0 0 0 3 8.2v19.6A5.2 5.2 0 0 0 8.2 33h10.4a5.2 5.2 0 0 0 3.8-1.6l9.2-9.7a5.4 5.4 0 0 0 0-7.4z"
          fill={colors.flame}
        />
        <Circle cx="25.6" cy="18" r="2.6" fill={onDark ? colors.ink : colors.paper} />
        <Path
          d="M9.4 24.6V11.4h5.2c2.6 0 4 1.2 4 3.2 0 1.4-.7 2.4-2 2.9 1.6.4 2.5 1.5 2.5 3.1 0 2.4-1.7 4-4.6 4zm2.9-7.9h1.9c1 0 1.6-.5 1.6-1.4s-.6-1.3-1.6-1.3h-1.9zm0 5.5h2.2c1.1 0 1.8-.5 1.8-1.5s-.7-1.5-1.8-1.5h-2.2z"
          fill={colors.onFlame}
        />
      </Svg>

      {word ? (
        <Text style={[styles.word, onDark && styles.wordOnInk, { fontSize: size * 0.62 }]}>
          Better Wolt
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = createStyles(({ colors, space }) => ({
  logo: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  word: { color: colors.ink, fontWeight: '800', letterSpacing: -0.4 },
  wordOnInk: { color: colors.onInk },
}));
