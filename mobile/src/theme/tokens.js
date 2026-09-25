/* Better Wolt V5 design tokens for the mobile client — "Line"
   (docs/v5/V5_DESIGN_SPEC.md §4, §11).

   The same values as the web client's styles/tokens.css. The two lists are
   kept in step by hand: there is deliberately no shared package (V2_SPEC
   §2), so a token change is made in both files in one commit. */

const lightCore = {
  name: 'light',
  ground: '#E4E6E1',
  panel: '#F3F4F1',
  raised: '#FFFFFF',
  ink: '#101214',
  inkMuted: '#4D535A',
  rule: '#6E746C',
  hairline: '#C3C7BF',
  onInk: '#F3F4F1',
  board: '#0A0A0A',
  led: '#FFB000',
  onBoard: '#F3F4F1',
  boardMuted: '#A5ABB0',
  error: '#B3261E',
  errorTint: '#F6E3E1',
  onError: '#FFFFFF',
  ok: '#0B7A3E',
  scrim: 'rgba(16, 18, 20, 0.55)',
};

const darkCore = {
  name: 'dark',
  ground: '#121416',
  panel: '#1B1E21',
  raised: '#24282C',
  ink: '#ECEDE9',
  inkMuted: '#A5ABB0',
  rule: '#7A8187',
  hairline: '#2E3337',
  onInk: '#121416',
  board: '#000000',
  led: '#FFB000',
  onBoard: '#ECEDE9',
  boardMuted: '#A5ABB0',
  error: '#FF8A80',
  errorTint: '#3A1F1E',
  onError: '#121416',
  ok: '#4CC38A',
  scrim: 'rgba(0, 0, 0, 0.7)',
};

const light = lightCore;
const dark = darkCore;

export const palettes = { light, dark };

/* One colour per restaurant, the same ten as the web (tokens.css), with
   the text colour that reads on each. The World Cup rides the board. */
export const lines = {
  light: [
    ['#0B7A3E', '#FFFFFF'], ['#1D4ED8', '#FFFFFF'], ['#7B2D9B', '#FFFFFF'], ['#4D7C0F', '#FFFFFF'],
    ['#00747A', '#FFFFFF'], ['#B0165A', '#FFFFFF'], ['#1B2A6B', '#FFFFFF'], ['#0369A1', '#FFFFFF'],
    ['#6B5B00', '#FFFFFF'], ['#7C4A1E', '#FFFFFF'],
  ],
  dark: [
    ['#4CC38A', '#121416'], ['#7AA2FF', '#121416'], ['#C48BE0', '#121416'], ['#A3E635', '#121416'],
    ['#3CC2C9', '#121416'], ['#F07AA8', '#121416'], ['#9FB0FF', '#121416'], ['#56B8F0', '#121416'],
    ['#C9B64A', '#121416'], ['#D49A6A', '#121416'],
  ],
  cup: { light: ['#0A0A0A', '#FFB000'], dark: ['#000000', '#FFB000'] },
};

/* Faces (V5 spec §4.2): Karantina for signage, Noto Sans Hebrew for
   everything else, one family per weight — Android does not pick a
   weight of a custom font from `fontWeight`. */
export const font = {
  display: 'Karantina_700Bold',
  400: 'NotoSansHebrew_400Regular',
  500: 'NotoSansHebrew_500Medium',
  600: 'NotoSansHebrew_600SemiBold',
  700: 'NotoSansHebrew_700Bold',
  800: 'NotoSansHebrew_800ExtraBold',
  900: 'NotoSansHebrew_900Black',
};

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

/* Square (V5 spec §4.3). `circle` is for route stops and stations only. */
export const radius = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  pill: 0,
  circle: 999,
};

export const type = {
  display: { fontFamily: font.display, fontSize: 64, lineHeight: 58 },
  displayM: { fontFamily: font.display, fontSize: 44, lineHeight: 42 },
  displayS: { fontFamily: font.display, fontSize: 32, lineHeight: 32 },
  displayL: { fontSize: 40, lineHeight: 44, fontWeight: '800' },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  h2: { fontSize: 23, lineHeight: 29, fontWeight: '800' },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  bodyL: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  micro: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
  /* Numbers are timetable-exact: tabular figures, heavy weight. */
  num: { fontVariant: ['tabular-nums'] },
  price: { fontSize: 17, lineHeight: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  big: { fontSize: 72, lineHeight: 72, fontWeight: '900', fontVariant: ['tabular-nums'] },
};

export const motion = {
  fast: 140,
  base: 180,
  slow: 260,
  story: 800,
};

/* Hebrew layout without I18nManager.forceRTL, which needs a native
   restart to take effect and would leave the first launch mirrored
   wrongly (V3_DESIGN_SPEC §5.2). */
export const rtl = {
  row: { flexDirection: 'row-reverse' },
  text: { textAlign: 'right', writingDirection: 'rtl' },
};

/* Only sheets, dialogs and toasts cast a shadow (spec §4.3). */
export const shadow = {
  e1: {},
  e2: {},
  e3: {
    shadowColor: '#101214',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
};

/* Minimum touch target on both clients (V3_DESIGN_SPEC §4.4). */
export const TOUCH_TARGET = 44;
