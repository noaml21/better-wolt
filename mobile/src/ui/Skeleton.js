import React, { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { createStyles, useReducedMotion, useTheme } from '../theme';

/* Shape-matched placeholders. The pulse is a single opacity animation on
   the native driver, so a long list stays cheap. */

export default function Skeleton({ width, height = 16, radius: r = 'sm', style }) {
  const styles = useStyles();
  const { radius } = useTheme();
  const reducedMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    if (reducedMotion) {
      pulse.setValue(0.8);

      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [pulse, reducedMotion]);

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: radius[r], opacity: pulse }, style]}
    />
  );
}

export function SkeletonCard() {
  const styles = useStyles();

  return (
    <View style={styles.card}>
      <Skeleton height={160} radius="md" />
      <Skeleton width="60%" height={18} />
      <Skeleton width="85%" height={12} />
    </View>
  );
}

const useStyles = createStyles(({ colors, space }) => ({
  block: { backgroundColor: colors.sunken },
  card: { gap: space[3], marginBottom: space[5] },
}));
