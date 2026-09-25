import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createStyles, rtl, useTheme } from '../theme';
import { getUserOrders } from '../services/api';
import {
  formatClock,
  formatOrderDay,
  formatOrderNumber,
  getArrivalTime,
  getSecondsLeft,
  isActive,
  itemCount,
  orderCount,
  summariseItems,
} from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Screen,
  ScreenHeader,
  Skeleton,
  formatPrice,
  LineBadge,
} from '../ui';

/* Order history. The newest order is the one you just placed, so the
   list is reversed. Orders on their way come first, on a night row with
   the time they should arrive; the rest are grouped by day, each day one
   hairline list, and every past order leads to its receipt or back to
   the restaurant (docs/V4_DESIGN_SPEC.md §6). The sections are flattened
   into one FlatList so the list stays virtualised. */

function toRows(orders) {
  const rows = [];
  const active = orders.filter(isActive);
  const past = orders.filter((order) => !isActive(order));

  if (active.length) {
    rows.push({ key: 'h-active', type: 'heading', title: 'בדרך אליכם' });
    active.forEach((order) => rows.push({ key: order.id, type: 'active', order }));
  }

  if (past.length) {
    rows.push({ key: 'h-past', type: 'heading', title: 'הזמנות קודמות' });

    past.forEach((order, index) => {
      const previous = past[index - 1];
      const next = past[index + 1];
      const first = !previous || previous.date !== order.date;
      const last = !next || next.date !== order.date;

      if (first) {
        rows.push({ key: `d-${order.date}-${index}`, type: 'day', title: formatOrderDay(order.date) });
      }

      rows.push({ key: order.id, type: 'past', order, first, last });
    });
  }

  return rows;
}

export default function OrdersScreen({ navigation }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const shown = useRef(false);

  /* Re-read on every visit to the tab; once a list is on screen, a failed
     re-read keeps it rather than swapping it for the error state (the
     same rule as Home and the restaurant screen). */
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setStatus('loading');
      }

      try {
        const data = await getUserOrders(token);

        setOrders(Array.isArray(data) ? [...data].reverse() : []);
        setStatus('ready');
        shown.current = true;
      } catch {
        if (!silent || !shown.current) {
          setStatus('error');
        }
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      load({ silent: true });
    }, [load])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  }, [load]);

  return (
    <Screen>
      <ScreenHeader
        title="ההזמנות שלי"
        subtitle={status === 'ready' && orders.length ? `${orderCount(orders.length)} בחשבון שלכם` : undefined}
        large
      />

      <FlatList
        data={status === 'ready' ? toRows(orders) : []}
        keyExtractor={(row) => String(row.key)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.ink} />
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <View style={styles.skeletons} accessibilityLabel="טוען הזמנות">
              {[0, 1, 2].map((key) => (
                <Card key={key} style={styles.skeletonCard}>
                  <Skeleton width="45%" height={20} />
                  <Skeleton width="70%" height={12} />
                  <Skeleton width="30%" height={12} />
                </Card>
              ))}
            </View>
          ) : status === 'error' ? (
            <ErrorState
              title="לא הצלחנו לטעון את ההזמנות"
              description="השרת לא הגיב. אפשר לנסות שוב."
              onRetry={load}
            />
          ) : (
            <EmptyState
              icon="bag"
              title="עוד לא הזמנתם כלום"
              description="ההזמנה הראשונה מחכה. בחרו מסעדה והיא תופיע כאן."
              actionLabel="לגלות מסעדות"
              onAction={() => navigation.navigate('Home')}
            />
          )
        }
        renderItem={({ item: row }) => {
          if (row.type === 'heading') {
            return <Text style={styles.heading}>{row.title}</Text>;
          }

          if (row.type === 'day') {
            return <Text style={styles.day}>{row.title}</Text>;
          }

          const { order } = row;

          if (row.type === 'active') {
            const arrival = getArrivalTime(order);
            const minutes = Math.ceil(getSecondsLeft(order) / 60);

            return (
              <Pressable
                onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
                accessibilityRole="button"
                accessibilityLabel={`מעקב אחרי ההזמנה מ${order.restaurantName}, עוד ${minutes} דקות`}
                style={({ pressed }) => [styles.active, pressed && styles.pressed]}
              >
                <LineBadge restaurant={{ id: order.restaurant, name: order.restaurantName }} size={48} />
                <View style={styles.activeText}>
                  <Text style={styles.activeName} numberOfLines={1}>
                    {order.restaurantName}
                  </Text>
                  <Text style={styles.activeMeta}>
                    {arrival ? `מגיעה ב־${arrival}   ` : ''}
                    {`עוד ${minutes} דק׳`}
                  </Text>
                </View>
                <Icon name="back" size={18} color={colors.onBoard} />
              </Pressable>
            );
          }

          const items = summariseItems(order);
          const start = Number(order.startTime);

          return (
            <View style={styles.past}>
              <View style={styles.pastTop}>
                <LineBadge restaurant={{ id: order.restaurant, name: order.restaurantName }} size={44} />
                <View style={styles.pastText}>
                  <Text style={styles.pastName} numberOfLines={1}>
                    {order.restaurantName}
                  </Text>
                  {items ? (
                    <Text style={styles.pastItems} numberOfLines={1}>
                      {items}
                    </Text>
                  ) : null}
                  <Text style={styles.pastMeta}>
                    {Number.isFinite(start) ? `${formatClock(start)} · ` : ''}
                    <Text style={styles.orderNumber}>{formatOrderNumber(order.id)}</Text>
                    {` · ${itemCount(order.items)}`}
                  </Text>
                </View>
                <Text style={styles.pastTotal}>{formatPrice(order.total)}</Text>
              </View>

              <View style={styles.pastActions}>
                <Pressable
                  onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`פרטי ההזמנה ${formatOrderNumber(order.id)}`}
                  hitSlop={6}
                  style={({ pressed }) => [styles.link, pressed && styles.pressed]}
                >
                  <Text style={styles.linkText}>פרטים</Text>
                </Pressable>
                {order.restaurant ? (
                  <Pressable
                    onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: order.restaurant })}
                    accessibilityRole="button"
                    accessibilityLabel={`להזמין שוב מ${order.restaurantName}`}
                    hitSlop={6}
                    style={({ pressed }) => [styles.link, styles.linkAgainBox, pressed && styles.pressed]}
                  >
                    <Text style={[styles.linkText, styles.linkAgain]}>להזמין שוב</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}

/* Orders (V5 spec §6, §11): what is on its way as LED rows, then the
   history by day, each order a ruled row with its line badge. */
const useStyles = createStyles(({ colors, space, type, font }) => ({
  list: { paddingHorizontal: space[4], paddingBottom: space[7] },
  skeletons: { gap: space[4] },
  skeletonCard: { gap: space[3], padding: space[4] },

  pressed: { opacity: 0.85 },
  heading: { ...type.body, ...rtl.text, fontWeight: '800', marginTop: space[5], marginBottom: space[2], color: colors.ink },
  day: {
    fontFamily: font.display,
    fontSize: 36,
    lineHeight: 36,
    paddingTop: 5,
    ...rtl.text,
    marginTop: space[3],
    paddingBottom: space[2],
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
    color: colors.ink,
  },

  active: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    marginBottom: space[2],
    backgroundColor: colors.board,
  },
  activeText: { flex: 1, gap: 2 },
  activeName: { fontFamily: font.display, fontSize: 32, lineHeight: 32, paddingTop: 5, ...rtl.text, color: colors.onBoard },
  activeMeta: { ...type.body, ...type.num, ...rtl.text, fontWeight: '800', color: colors.led },

  past: {
    gap: space[2],
    paddingVertical: space[3],
    borderBottomWidth: 2,
    borderBottomColor: colors.ink,
  },
  pastTop: { ...rtl.row, alignItems: 'flex-start', gap: space[3] },
  pastText: { flex: 1, gap: 2 },
  pastName: { fontFamily: font.display, fontSize: 32, lineHeight: 32, paddingTop: 5, ...rtl.text, color: colors.ink },
  pastItems: { ...type.body, ...rtl.text, fontWeight: '700', color: colors.ink },
  pastMeta: { ...type.caption, ...rtl.text, color: colors.inkMuted, fontWeight: '700' },
  orderNumber: { fontVariant: ['tabular-nums'] },
  pastTotal: { ...type.num, fontSize: 26, lineHeight: 30, fontWeight: '900', color: colors.ink },
  pastActions: { ...rtl.row, alignItems: 'center', gap: space[3], marginRight: 44 + space[3] },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space[2] },
  linkAgainBox: { borderWidth: 2, borderColor: colors.ink, paddingHorizontal: space[3] },
  linkText: { ...type.body, fontWeight: '800', color: colors.ink, textDecorationLine: 'underline' },
  linkAgain: { textDecorationLine: 'none' },
}));
