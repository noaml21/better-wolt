import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Icon, Media, formatPrice } from '../ui';
import { dishCount } from '../services/presentation';
import { worldCupTeams } from '../services/worldCup';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here.
   V4: an amber strip with the flags as its picture, the same card the
   web client shows (docs/V4_DESIGN_SPEC.md §6); a flag that fails to load
   drops out of the row. */

const STRIP_FLAGS = 6;

export default function CampaignCard({ restaurant, onPress }) {
  const styles = useStyles();
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = useCallback((uri) => {
    setBroken((current) => (current.has(uri) ? current : new Set(current).add(uri)));
  }, []);

  if (!restaurant) {
    return null;
  }

  const products = restaurant.products || [];
  /* The campaign's flat price is whatever the seed priced the dishes at,
     read back from the server rather than written here — the same rule
     the campaign screen follows. */
  const prices = new Set(products.map((product) => Number(product.price)));
  const flatPrice = prices.size === 1 ? [...prices][0] : null;
  const flags = worldCupTeams.filter((dish) => dish.flag && !broken.has(dish.flag)).slice(0, STRIP_FLAGS);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${dishCount(products.length)} מכל העולם`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={styles.text}>
          <Text style={styles.title}>{restaurant.name}</Text>
          <Text style={styles.description}>
            {dishCount(products.length)} מכל העולם
            {flatPrice !== null ? `, כל אחת ב-${formatPrice(flatPrice)}` : ''}.
          </Text>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>לתפריט</Text>
          <Icon name="back" size={16} color={styles.ctaText.color} />
        </View>
      </View>

      {flags.length ? (
        <View style={styles.flags}>
          {flags.map((dish) => (
            <Media key={dish.dishName} uri={dish.flag} style={styles.flag} onFail={markBroken} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  card: {
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.amberTint,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  top: { ...rtl.row, alignItems: 'center', gap: space[3] },
  text: { flex: 1, gap: 2 },
  title: { ...type.h2, ...rtl.text, fontWeight: '900', color: colors.ink },
  description: { ...type.caption, ...rtl.text, fontWeight: '400', color: colors.inkMuted },
  cta: {
    ...rtl.row,
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  ctaText: { ...type.caption, fontWeight: '800', color: colors.paper },
  flags: { ...rtl.row, gap: space[2] },
  flag: { width: 40, height: 27, borderRadius: 4 },
}));
