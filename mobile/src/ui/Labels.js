import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Icon from './Icon';

export function formatPrice(amount) {
  const value = Number(amount);
  const safe = Number.isFinite(value) ? value : 0;

  return `₪${safe % 1 === 0 ? safe : safe.toFixed(2)}`;
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

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[3],
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  tag_price: { backgroundColor: colors.amberTint },
  tag_promo: { backgroundColor: colors.herbTint },
  tag_hot: { backgroundColor: colors.flame },
  tagText: { ...type.caption, fontWeight: '800' },
  tagText_price: { color: colors.ink },
  tagText_promo: { color: colors.herb },
  tagText_hot: { color: colors.onFlame },

  pill: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[2],
    alignSelf: 'flex-start',
    paddingHorizontal: space[3],
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pill_active: { backgroundColor: colors.flameTint },
  pill_done: { backgroundColor: colors.herbTint },
  pill_neutral: { backgroundColor: colors.inkTint },
  pillText: { ...type.micro },
  pillText_active: { color: colors.flameDeep },
  pillText_done: { color: colors.herb },
  pillText_neutral: { color: colors.inkMuted },
  dot: { width: 7, height: 7, borderRadius: radius.pill },

  rating: { ...rtl.row, alignItems: 'center', gap: 4 },
  ratingText: { ...type.caption, color: colors.ink, fontWeight: '700' },
  star: { color: colors.amber },

  metaItem: { ...rtl.row, alignItems: 'center', gap: space[1] },
  meta: { ...type.caption, color: colors.inkMuted },
  metaHerb: { color: colors.herb },
}));
