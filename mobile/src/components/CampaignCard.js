import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Icon } from '../ui';

/* The seeded World Cup restaurant, presented as what it is: a campaign.
   Its name comes from the server (ARCHITECTURE §6), never from here. */

export default function CampaignCard({ restaurant, onPress }) {
  const styles = useStyles();

  if (!restaurant) {
    return null;
  }

  const dishCount = restaurant.products?.length || 0;

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
          {dishCount} מנות נבחרת מכל העולם, במחיר אחיד של ₪30.
        </Text>
      </View>

      <Icon name="back" size={20} color={styles.onInk.color} />
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
    backgroundColor: colors.ink,
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
  onInk: { color: colors.onInk },
  text: { flex: 1, gap: 2 },
  eyebrow: { ...type.micro, ...rtl.text, color: colors.amber, letterSpacing: 0.4 },
  title: { ...type.h3, ...rtl.text, color: colors.onInk },
  description: { ...type.caption, ...rtl.text, color: colors.onInk, opacity: 0.75 },
}));
