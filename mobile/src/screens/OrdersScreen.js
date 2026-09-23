import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createStyles, rtl, useTheme } from '../theme';
import { getUserOrders } from '../services/api';
import {
  formatOrderNumber,
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
  StatusPill,
  formatPrice,
} from '../ui';

/* Order history. The newest order is the one you just placed, so the
   list is reversed and an order still on its way leads to tracking. */

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
        data={status === 'ready' ? orders : []}
        keyExtractor={(order) => String(order.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.flame} />
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
        renderItem={({ item }) => {
          const active = isActive(item);
          const items = summariseItems(item);

          return (
            <Card style={styles.order}>
              <View style={styles.orderHeader}>
                <View style={styles.identity}>
                  <Text style={styles.restaurant} numberOfLines={1}>
                    {item.restaurantName}
                  </Text>
                  <Text style={styles.number}>
                    <Text style={styles.orderNumber}>{formatOrderNumber(item.id)}</Text>
                    {` · ${item.date}`}
                  </Text>
                </View>

                <StatusPill tone={active ? 'active' : 'done'}>
                  {active ? 'בדרך אליכם' : 'הושלמה'}
                </StatusPill>
              </View>

              {items ? (
                <Text style={styles.items} numberOfLines={2}>
                  {items}
                </Text>
              ) : null}

              <View style={styles.orderFooter}>
                <Text style={styles.count}>{itemCount(item.items)}</Text>
                <Text style={styles.total}>{formatPrice(item.total)}</Text>
              </View>

              {active ? (
                <Pressable
                  onPress={() => navigation.navigate('Tracking', { orderId: item.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`מעקב אחרי ההזמנה מ${item.restaurantName}`}
                  style={({ pressed }) => [styles.track, pressed && styles.trackPressed]}
                >
                  <Text style={styles.trackLabel}>מעקב אחרי ההזמנה</Text>
                  <Icon name="back" size={16} color={styles.trackLabel.color} />
                </Pressable>
              ) : null}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  list: { paddingHorizontal: space[4], paddingBottom: space[7] },
  skeletons: { gap: space[4] },
  skeletonCard: { gap: space[3], padding: space[4] },

  order: { gap: space[3], padding: space[4], marginBottom: space[4] },
  orderHeader: { ...rtl.row, alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  identity: { flex: 1, gap: 2 },
  restaurant: { ...type.h3, ...rtl.text, color: colors.ink },
  number: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  orderNumber: { fontVariant: ['tabular-nums'] },
  items: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  orderFooter: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  count: { ...type.caption, color: colors.inkMuted },
  total: { ...type.h3, color: colors.ink },
  track: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.flameTint,
  },
  trackPressed: { opacity: 0.85 },
  trackLabel: { ...type.caption, color: colors.flameDeep, fontWeight: '700' },
}));
