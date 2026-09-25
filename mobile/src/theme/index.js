import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useColorScheme } from 'react-native';
import { font, lines, motion, palettes, radius, rtl, shadow, space, type, TOUCH_TARGET } from './tokens';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();

  const theme = useMemo(() => {
    const colors = palettes[scheme === 'dark' ? 'dark' : 'light'];

    const isDark = colors.name === 'dark';

    return { colors, space, radius, type, motion, rtl, shadow, font, lines: isDark ? lines.dark : lines.light, cup: isDark ? lines.cup.dark : lines.cup.light, isDark };
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

/* Text styles name a weight; the face is chosen here (V5 spec §11). A
   style with a fontSize or fontWeight and no fontFamily gets the Noto Sans
   Hebrew face of that weight, and the weight itself is dropped, because
   Android would otherwise synthesise it on top of the chosen face. */
const WEIGHTS = { normal: 400, bold: 700 };

function withFonts(styles) {
  const out = {};

  Object.keys(styles).forEach((key) => {
    const style = styles[key];

    if (style && typeof style === 'object' && !style.fontFamily && (style.fontSize || style.fontWeight)) {
      const { fontWeight, ...rest } = style;
      const weight = WEIGHTS[fontWeight] || Number(fontWeight) || 400;
      const nearest = [400, 500, 600, 700, 800, 900].reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), 400);

      out[key] = { ...rest, fontFamily: font[nearest] };
    } else {
      out[key] = style;
    }
  });

  return out;
}

/* Styles are written once as a function of the theme and cached per
   palette, so a component reads `useStyles()` and dark mode costs it
   nothing. */
export function createStyles(factory) {
  const cache = new Map();

  return function useStyles() {
    const theme = useTheme();

    if (!cache.has(theme.colors.name)) {
      cache.set(theme.colors.name, StyleSheet.create(withFonts(factory(theme))));
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

export { font, lines, motion, radius, rtl, shadow, space, type, TOUCH_TARGET };
