import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createStyles, rtl } from '../theme';
import { getUserOrders } from '../services/api';
import { formatOrderDay } from '../services/presentation';
import { LineBadge } from '../ui';

/* The restaurants this account ordered from most recently, still open —
   the web client's row of the same name (docs/V4_DESIGN_SPEC.md §6).
   Real data from GET /orders, re-read whenever Home comes back into view
   (a new order should appear here). Hidden until there is something to
   show, and silent on failure: nothing else on Home depends on it. The
   tabs remount when the account changes, so an answer cannot land in
   the next account's Home. */

const LIMIT = 4;

export default function OrderAgain({ restaurants, token, onOpen, onOrders }) {
  const styles = useStyles();
  const [orders, setOrders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let current = true;

      if (token) {
        getUserOrders(token)
          .then((data) => {
            if (current && Array.isArray(data)) {
              setOrders(data);
              onOrders?.(data);
            }
          })
          .catch(() => {});
      }

      return () => {
        current = false;
      };
    }, [token, onOrders])
  );

  const byId = new Map(restaurants.map((restaurant) => [String(restaurant.id), restaurant]));
  const picks = [];
  const seen = new Set();

  for (let index = orders.length - 1; index >= 0 && picks.length < LIMIT; index -= 1) {
    const restaurant = byId.get(String(orders[index].restaurant));

    if (restaurant && !seen.has(restaurant.id)) {
      seen.add(restaurant.id);
      picks.push({ restaurant, day: formatOrderDay(orders[index].date) });
    }
  }

  if (!picks.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>להזמין שוב</Text>
      <FlatList
        horizontal
        inverted
        data={picks}
        keyExtractor={({ restaurant }) => String(restaurant.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        renderItem={({ item: { restaurant, day } }) => (
          <Pressable
            onPress={() => onOpen(restaurant)}
            accessibilityRole="button"
            accessibilityLabel={`${restaurant.name}, הזמנתם ${day}`}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <LineBadge restaurant={restaurant} size={52} style={styles.badge} />
            <View style={styles.text}>
              <Text style={styles.name} numberOfLines={1}>
                {restaurant.name}
              </Text>
              {day ? (
                <Text style={styles.day}>
                  {day === 'היום' || day === 'אתמול' ? `הזמנתם ${day}` : `הזמנתם ב־${day}`}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = createStyles(({ colors, space, type }) => ({
  section: { gap: space[2] },
  title: { ...type.body, ...rtl.text, fontWeight: '800', paddingHorizontal: space[4], color: colors.ink },
  row: { gap: space[2], paddingHorizontal: space[4] },
  item: {
    ...rtl.row,
    alignItems: 'stretch',
    minHeight: 56,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  pressed: { backgroundColor: colors.ink },
  badge: { borderWidth: 0, height: 52 },
  text: { justifyContent: 'center', paddingHorizontal: space[3], gap: 0 },
  name: { ...type.body, ...rtl.text, fontWeight: '800', color: colors.ink },
  day: { ...type.caption, ...rtl.text, color: colors.ink },
}));
