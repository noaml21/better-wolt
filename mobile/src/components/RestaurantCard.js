import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';
import { LineBadge, Media, Plate, formatPrice } from '../ui';
import { getLine, getMenuHighlights, getRestaurantMeta, lineColours } from '../services/presentation';

/* One line on the departures board (V5 spec §5, §11): badge on the food,
   the name in signage type with three dishes as its stops, rating and
   price-from, and the delivery time as the row's big number. Pressing
   floods the row with the line colour — the phone's version of the web
   hover. `note` replaces the dishes when the screen has something more
   specific to say (search: what matched). */

export default function RestaurantCard({ restaurant, onPress, note, ordered = false }) {
  const styles = useStyles();
  const theme = useTheme();
  const meta = getRestaurantMeta(restaurant);
  const [fill, onFill] = lineColours(getLine(restaurant), theme);
  const highlights = getMenuHighlights(restaurant).replace(/ · /g, '  /  ');
  const eta = `⁦${meta.eta.replace('-', '–')}⁩`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${meta.eta} דקות`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: fill }]}
    >
      {({ pressed }) => {
        const ink = pressed ? { color: onFill } : null;

        return (
          <>
            <View style={styles.media}>
              <Media uri={restaurant.image} style={styles.image} fallback={<Plate restaurant={restaurant} size={22} />} />
              <LineBadge restaurant={restaurant} size={30} style={styles.badge} outline={pressed ? onFill : undefined} />
            </View>

            <View style={styles.main}>
              <Text style={[styles.name, ink]} numberOfLines={2}>
                {restaurant.name}
              </Text>
              {note ? (
                <View style={styles.noteRow}>{note}</View>
              ) : highlights ? (
                <Text style={[styles.stops, ink]} numberOfLines={1}>
                  {highlights}
                </Text>
              ) : null}
              <View style={styles.meta}>
                {ordered ? (
                  <Text style={[styles.mark, ink, pressed && { borderColor: onFill }]}>הזמנתם כאן</Text>
                ) : null}
                <Text style={[styles.metaText, ink]}>דירוג {meta.rating}</Text>
                {meta.fromPrice !== null ? (
                  <Text style={[styles.metaText, ink]}>מנות מ־{formatPrice(meta.fromPrice)}</Text>
                ) : null}
                <Text style={[styles.metaText, ink]}>{meta.deliveryLabel}</Text>
              </View>
            </View>

            <View style={styles.time}>
              <Text style={[styles.big, ink]}>{eta}</Text>
              <Text style={[styles.unit, ink]}>דקות</Text>
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

const useStyles = createStyles(({ colors, space, type, font }) => ({
  row: {
    ...rtl.row,
    alignItems: 'flex-start',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[2],
    marginHorizontal: -space[2],
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  media: { width: 76, height: 76, backgroundColor: colors.hairline },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 0, right: 0 },
  main: { flex: 1, gap: 2 },
  name: { fontFamily: font.display, fontSize: 36, lineHeight: 36, paddingTop: 4, color: colors.ink, ...rtl.text },
  stops: { ...type.caption, fontWeight: '700', color: colors.ink, ...rtl.text },
  noteRow: { alignItems: 'flex-end' },
  meta: { ...rtl.row, flexWrap: 'wrap', alignItems: 'center', gap: space[3], marginTop: 2 },
  metaText: { ...type.caption, color: colors.ink },
  mark: { ...type.caption, fontWeight: '800', color: colors.ink, borderWidth: 1, borderColor: colors.ink, paddingHorizontal: space[1] },
  time: { alignItems: 'flex-start', minWidth: 64 },
  big: { fontSize: 26, lineHeight: 30, fontWeight: '900', fontVariant: ['tabular-nums'], color: colors.ink },
  unit: { ...type.caption, fontWeight: '700', color: colors.ink },
}));
