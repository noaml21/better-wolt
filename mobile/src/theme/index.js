import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useColorScheme } from 'react-native';
import { motion, palettes, radius, rtl, shadow, space, type, TOUCH_TARGET } from './tokens';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();

  const theme = useMemo(() => {
    const colors = palettes[scheme === 'dark' ? 'dark' : 'light'];

    return { colors, space, radius, type, motion, rtl, shadow, isDark: colors.name === 'dark' };
  }, [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }

  return theme;
}

/* Styles are written once as a function of the theme and cached per
   palette, so a component reads `useStyles()` and dark mode costs it
   nothing. */
export function createStyles(factory) {
  const cache = new Map();

  return function useStyles() {
    const theme = useTheme();

    if (!cache.has(theme.colors.name)) {
      cache.set(theme.colors.name, StyleSheet.create(factory(theme)));
    }

    return cache.get(theme.colors.name);
  };
}

/* "Remove animations" in the OS settings means exactly that: every
   transform and keyframe becomes an instant state change
   (V3_DESIGN_SPEC §4.5). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setReduced(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  return reduced;
}

export { motion, radius, rtl, shadow, space, type, TOUCH_TARGET };
