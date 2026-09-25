import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Icon, Media, formatPrice } from '../ui';
import { dishCount } from '../services/presentation';
import { worldCupTeams } from '../services/worldCup';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here.
   V5: the board's special line — a black band, the name in amber
   signage, the teams as stations on an amber line (V5 spec §6); a flag
   that fails to load drops out of the line. */

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
            {flatPrice !== null ? `, כל אחת ב־${formatPrice(flatPrice)}` : ''}.
          </Text>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>לתפריט</Text>
          <Icon name="back" size={16} color={styles.ctaText.color} />
        </View>
      </View>

      {flags.length ? (
        <View style={styles.line}>
          <View style={styles.track} />
          {flags.map((dish) => (
            <View key={dish.dishName} style={styles.station}>
              <Media uri={dish.flag} style={styles.flag} onFail={markBroken} />
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, font }) => ({
  card: { gap: space[5], padding: space[5], marginHorizontal: -space[4], backgroundColor: colors.board },
  pressed: { opacity: 0.94 },
  top: { ...rtl.row, alignItems: 'flex-end', gap: space[3] },
  text: { flex: 1, gap: 4 },
  title: { fontFamily: font.display, fontSize: 52, lineHeight: 50, paddingTop: 6, color: colors.led, ...rtl.text },
  description: { ...type.body, ...rtl.text, fontWeight: '700', color: colors.onBoard },
  cta: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[1],
    minHeight: 44,
    paddingHorizontal: space[3],
    borderWidth: 2,
    borderColor: colors.onBoard,
  },
  ctaText: { ...type.body, fontWeight: '800', color: colors.onBoard },
  line: { ...rtl.row, justifyContent: 'space-between', alignItems: 'center' },
  track: { position: 'absolute', left: 0, right: 0, top: 17, height: 6, backgroundColor: colors.led },
  station: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    borderWidth: 4,
    borderColor: colors.led,
    overflow: 'hidden',
    backgroundColor: colors.board,
  },
  flag: { width: '100%', height: '100%' },
}));
