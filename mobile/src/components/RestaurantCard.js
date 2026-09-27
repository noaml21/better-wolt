import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Card, Media, MetaItem, Plate, Rating, formatPrice } from '../ui';
import { getMenuHighlights, getRestaurantMeta } from '../services/presentation';

/* Photo first, then the three things that decide an order. Mirrors the
   web card so the two clients read as one product. */

/* `note` replaces the menu highlights when the screen has something more
   specific to say (search: what matched). */
export default function RestaurantCard({ restaurant, onPress, note }) {
  const styles = useStyles();
  const meta = getRestaurantMeta(restaurant);
  const highlights = getMenuHighlights(restaurant);

  return (
    <Card onPress={onPress} accessibilityLabel={restaurant.name} style={styles.card}>
      <View style={styles.media}>
        <Media
          uri={restaurant.image}
          style={styles.image}
          fallback={<Plate restaurant={restaurant} size={40} />}
        />

        {meta.fromPrice !== null ? (
          <View style={styles.from}>
            <Text style={styles.fromText}>מנות מ-{formatPrice(meta.fromPrice)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.heading}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Rating value={meta.rating} />
        </View>

        {note ? (
          <View style={styles.noteRow}>{note}</View>
        ) : highlights ? (
          <Text style={styles.highlights} numberOfLines={1}>
            {highlights}
          </Text>
        ) : null}

        <View style={styles.meta}>
          <MetaItem icon="clock">{meta.eta} דק׳</MetaItem>
          <MetaItem icon="scooter" tone={meta.isFreeDelivery ? 'herb' : undefined}>
            {meta.deliveryLabel}
          </MetaItem>
        </View>
      </View>
    </Card>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  card: { marginBottom: space[5], overflow: 'hidden' },
  media: { height: 170, backgroundColor: colors.sunken, justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  from: {
    position: 'absolute',
    bottom: space[3],
    right: space[3],
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
  },
  fromText: { ...type.micro, ...type.num, color: colors.ink },
  noteRow: { alignItems: 'flex-end' },
  body: { padding: space[4], gap: space[2] },
  heading: { ...rtl.row, alignItems: 'center', gap: space[3] },
  name: { ...type.h3, ...rtl.text, flexShrink: 1, color: colors.ink },
  highlights: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  meta: { ...rtl.row, gap: space[4], marginTop: space[1] },
}));
