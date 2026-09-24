/* Better Wolt V3 design tokens for the mobile client.

   These are the same values as the web client's styles/tokens.css
   (docs/V3_DESIGN_SPEC.md §4). The two lists are kept in step by hand:
   there is deliberately no shared package (V2_SPEC §2), so a token change
   is made in both files in one commit. */

const light = {
  name: 'light',
  paper: '#FBF7F3',
  surface: '#FFFFFF',
  sunken: '#F3EDE6',
  ink: '#1F1330',
  inkMuted: '#655B72',
  line: '#E7DFD7',
  flame: '#D93A1E',
  flameDeep: '#B82F17',
  amber: '#F0A215',
  herb: '#0E7A57',
  danger: '#A61B2B',
  flameTint: '#FDECE8',
  amberTint: '#FDF1DA',
  herbTint: '#E2F2EC',
  dangerTint: '#F9E6E8',
  inkTint: '#EFEBF2',
  onFlame: '#FFFFFF',
  onAmber: '#1F1330',
  onHerb: '#FFFFFF',
  onInk: '#FBF7F3',
  onDanger: '#FFFFFF',
  /* The one surface that does not flip with the theme: the night band
     the campaign and the tracking screen are built on. Inverting it in
     dark mode would put a bright slab through a dark screen. */
  night: '#1F1330',
  onNight: '#FBF7F3',
  scrim: 'rgba(31, 19, 48, 0.55)',
};

const dark = {
  name: 'dark',
  paper: '#14101E',
  surface: '#1E1830',
  sunken: '#171223',
  ink: '#F6F1EC',
  inkMuted: '#ABA2B6',
  line: '#2E2742',
  flame: '#FF6A4D',
  flameDeep: '#FF8A73',
  amber: '#FFC24D',
  herb: '#3BC694',
  danger: '#FF7A80',
  flameTint: '#35202B',
  amberTint: '#362B1C',
  herbTint: '#17302B',
  dangerTint: '#35202A',
  inkTint: '#272038',
  onFlame: '#14101E',
  onAmber: '#14101E',
  onHerb: '#14101E',
  onInk: '#14101E',
  /* Dark `danger` is a light red; white on it fails AA. */
  onDanger: '#14101E',
  night: '#241A38',
  onNight: '#F6F1EC',
  scrim: 'rgba(6, 4, 12, 0.7)',
};

export const palettes = { light, dark };

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 56,
  10: 72,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
};

/* The web client loads Suez One and Rubik. Mobile stays on the platform
   UI font at the same scale: no font assets to ship, no first-paint
   flash, and Hebrew renders the way the rest of the phone does
   (V3_DESIGN_SPEC §4.2). */
export const type = {
  displayL: { fontSize: 40, lineHeight: 44, fontWeight: '800' },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  h2: { fontSize: 23, lineHeight: 29, fontWeight: '700' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  bodyL: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  micro: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  /* V4: numbers are exact. Prices, totals and times use tabular figures
     so columns of amounts line up (docs/V4_DESIGN_SPEC.md §4.2). */
  num: { fontVariant: ['tabular-nums'] },
  price: { fontSize: 15, lineHeight: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
};

export const motion = {
  fast: 120,
  base: 180,
  slow: 320,
  story: 600,
};

/* Hebrew layout without I18nManager.forceRTL, which needs a native
   restart to take effect and would leave the first launch mirrored
   wrongly (V3_DESIGN_SPEC §5.2). */
export const rtl = {
  row: { flexDirection: 'row-reverse' },
  text: { textAlign: 'right', writingDirection: 'rtl' },
};

export const shadow = {
  e1: {
    shadowColor: '#1F1330',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  e2: {
    shadowColor: '#1F1330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  e3: {
    shadowColor: '#1F1330',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
};

/* Minimum touch target on both clients (V3_DESIGN_SPEC §4.4). */
export const TOUCH_TARGET = 44;
