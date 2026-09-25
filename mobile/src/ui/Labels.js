import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Icon from './Icon';

export function formatPrice(amount) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  const [whole, fraction] = (safe % 1 === 0 ? String(safe) : safe.toFixed(2)).split('.');
  // Grouped by hand rather than with Intl, so both clients (and every JS
  // engine they run on) write ₪1,000,000 the same way.
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `₪${grouped}${fraction ? `.${fraction}` : ''}`;
}

/* The price tag, the status pill and the rating — the mobile half of the
   shared component language (V3_DESIGN_SPEC §6). */

export function Tag({ children, tone = 'price', style }) {
  const styles = useStyles();

  return (
    <View style={[styles.tag, styles[`tag_${tone}`], style]}>
      <Text style={[styles.tagText, styles[`tagText_${tone}`]]}>{children}</Text>
    </View>
  );
}

export function StatusPill({ children, tone = 'active' }) {
  const styles = useStyles();

  return (
    <View style={[styles.pill, styles[`pill_${tone}`]]}>
      <View style={[styles.dot, { backgroundColor: styles[`pillText_${tone}`].color }]} />
      <Text style={[styles.pillText, styles[`pillText_${tone}`]]}>{children}</Text>
    </View>
  );
}

export function Rating({ value }) {
  const styles = useStyles();

  return (
    <View style={styles.rating} accessibilityLabel={`דירוג ${value}`}>
      <Icon name="star" size={14} color={styles.star.color} filled />
      <Text style={styles.ratingText}>{value}</Text>
    </View>
  );
}

export function MetaItem({ icon, children, tone }) {
  const styles = useStyles();
  const color = tone === 'herb' ? styles.metaHerb.color : styles.meta.color;

  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={14} color={color} />
      <Text style={[styles.meta, tone === 'herb' && styles.metaHerb]}>{children}</Text>
    </View>
  );
}

const useStyles = createStyles(({ colors, space, type }) => ({
  tag: {
    /* The layout is right-to-left, so the tag's own edge is the right
       one. The status label below keeps `flex-start` because its parent
       is a row, where `alignSelf` is vertical. */
    alignSelf: 'flex-end',
    paddingHorizontal: space[2],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  tag_price: {},
  tag_promo: { borderColor: colors.ok },
  tag_hot: { backgroundColor: colors.ink },
  tagText: { ...type.caption, ...type.num, fontWeight: '800' },
  tagText_price: { color: colors.ink },
  tagText_promo: { color: colors.ok },
  tagText_hot: { color: colors.onInk },

  pill: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[2],
    alignSelf: 'flex-start',
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderWidth: 1,
  },
  /* On its way is the LED; done is the ok colour; the rest is muted. */
  pill_active: { backgroundColor: colors.board, borderColor: colors.board },
  pill_done: { borderColor: colors.ok },
  pill_neutral: { borderColor: colors.inkMuted },
  pillText: { ...type.caption, fontWeight: '800' },
  pillText_active: { color: colors.led },
  pillText_done: { color: colors.ok },
  pillText_neutral: { color: colors.inkMuted },
  dot: { width: 8, height: 8 },

  rating: { ...rtl.row, alignItems: 'center', gap: 4 },
  ratingText: { ...type.caption, ...type.num, color: colors.ink, fontWeight: '800' },
  star: { color: colors.ink },

  metaItem: { ...rtl.row, alignItems: 'center', gap: space[1] },
  meta: { ...type.caption, color: colors.ink, fontWeight: '600' },
  metaHerb: { color: colors.ink },
}));
