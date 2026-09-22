import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Icon, formatPrice } from '../ui';
import { dishCount } from '../services/presentation';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here. */

export default function CampaignCard({ restaurant, onPress }) {
  const styles = useStyles();

  if (!restaurant) {
    return null;
  }

  const products = restaurant.products || [];
  /* The campaign's flat price is whatever the seed priced the dishes at,
     read back from the server rather than written here — the same rule
     the campaign screen follows. */
  const prices = new Set(products.map((product) => Number(product.price)));
  const flatPrice = prices.size === 1 ? [...prices][0] : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, קולקציה מיוחדת`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Icon name="trophy" size={26} color={styles.onAmber.color} />
      </View>

      <View style={styles.text}>
        <Text style={styles.eyebrow}>קולקציה מיוחדת</Text>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.description}>
          {dishCount(products.length)} נבחרת מכל העולם
          {flatPrice !== null ? `, במחיר אחיד של ${formatPrice(flatPrice)}` : ''}.
        </Text>
      </View>

      <Icon name="back" size={20} color={styles.onNight.color} />
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  card: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.night,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber,
  },
  onAmber: { color: colors.onAmber },
  onNight: { color: colors.onNight },
  text: { flex: 1, gap: 2 },
  eyebrow: { ...type.micro, ...rtl.text, color: colors.amber, letterSpacing: 0.4 },
  title: { ...type.h3, ...rtl.text, color: colors.onNight },
  description: { ...type.caption, ...rtl.text, color: colors.onNight, opacity: 0.75 },
}));
