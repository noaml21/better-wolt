import React, { useCallback, useEffect, useState } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl, useReducedMotion, useTheme } from '../theme';
import { getOrderById } from '../services/api';
import {
  formatOrderNumber,
  getArrivalTime,
  getSecondsLeft,
  getSegmentFill,
  getStageIndex,
  getStageTimes,
  itemCount,
  stages,
} from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  InlineMessage,
  Screen,
  ScreenHeader,
  Skeleton,
  formatPrice,
} from '../ui';

/* The showpiece. The server never advances an order's status
   (ARCHITECTURE §6), so progress is derived from startTime — recomputed
   from the timestamp on every tick rather than decremented, so a
   backgrounded app comes back correct. */

const DOT = 28;

export default function TrackingScreen({ navigation, route }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const { token } = useAuth();
  const orderId = route.params?.orderId;
  /* Set by the cart when the server charged a different total from the
     one the cart showed (a price changed after the dish was added). */
  const priceCorrection = route.params?.priceCorrection;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      const data = await getOrderById(token, orderId);

      setOrder(data);
      setSecondsLeft(getSecondsLeft(data));
      setStatus('ready');
    } catch (error) {
      setStatus(error.status === 404 ? 'missing' : 'error');
    }
  }, [orderId, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const timer = setInterval(() => setSecondsLeft(getSecondsLeft(order)), 1000);

    return () => clearInterval(timer);
  }, [order]);

  const [halo] = useState(() => new Animated.Value(0));
  const arrivedNow = order ? secondsLeft <= 0 : false;

  /* The stop the order is at breathes, slowly. Decorative — the stage
     note says the same in words — so it simply does not run under
     reduced motion, or once the order has arrived. */
  useEffect(() => {
    if (!order || reducedMotion || arrivedNow) {
      halo.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.timing(halo, { toValue: 1, duration: 2400, useNativeDriver: true })
    );

    loop.start();

    return () => loop.stop();
  }, [order, reducedMotion, arrivedNow, halo]);

  if (status === 'loading') {
    return (
      <Screen>
        <ScreenHeader title="מעקב הזמנה" onBack={navigation.goBack} />
        <View style={styles.skeleton}>
          <Skeleton height={230} radius="lg" />
          <Skeleton height={160} radius="md" />
        </View>
      </Screen>
    );
  }

  if (status !== 'ready') {
    return (
      <Screen>
        <ScreenHeader title="מעקב הזמנה" onBack={navigation.goBack} />

        {status === 'missing' ? (
          <EmptyState
            icon="bag"
            title="ההזמנה הזו לא נמצאה"
            description="ייתכן שהיא נמחקה, או ששייכת לחשבון אחר."
            actionLabel="להזמנות שלי"
            onAction={() => navigation.navigate('Tabs', { screen: 'Orders' }, { pop: true })}
          />
        ) : (
          <ErrorState description="לא הצלחנו להביא את פרטי ההזמנה." onRetry={load} />
        )}
      </Screen>
    );
  }

  const stageIndex = getStageIndex(secondsLeft);
  const arrived = secondsLeft <= 0;
  const stage = stages[stageIndex];
  const stageTimes = getStageTimes(order);
  const arrivalTime = getArrivalTime(order);
  const minutesLeft = Math.ceil(secondsLeft / 60);
  const units = (order.orderItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0, 0] });

  return (
    <Screen>
      <ScreenHeader
        title={arrived ? 'ההזמנה הגיעה' : 'ההזמנה בדרך'}
        subtitle={`${order.restaurantName} · ${formatOrderNumber(order.id)}`}
        onBack={navigation.goBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.stage, arrived && styles.stageArrived]}>
          {arrived ? (
            <View style={styles.eta}>
              <View style={styles.doneMark}>
                <Icon name="check" size={30} color={colors.onHerb} strokeWidth={2.4} />
              </View>
              <Text style={[styles.big, styles.onArrived]}>בתיאבון</Text>
              {arrivalTime ? <Text style={[styles.sub, styles.onArrived]}>{`הגיעה ב-${arrivalTime}`}</Text> : null}
            </View>
          ) : (
            <View style={styles.eta} accessible accessibilityLabel={`הגעה משוערת ב-${arrivalTime}, עוד ${minutesLeft} דקות`}>
              {/* The clock time is what a person plans around; the minutes
                  are the reassurance (V4 spec §5). */}
              <Text style={styles.big}>{arrivalTime}</Text>
              <Text style={styles.sub}>{`הגעה משוערת · עוד ${minutesLeft} דק׳`}</Text>
            </View>
          )}

          {!arrived ? (
            <Text style={styles.note} accessibilityLiveRegion="polite">
              {stage.note}
            </Text>
          ) : null}

          <View style={styles.track}>
            {stages.map((item, index) => {
              const done = index < stageIndex || arrived;
              const current = index === stageIndex && !arrived;
              const fill = arrived ? 1 : getSegmentFill(index, secondsLeft);

              return (
                <View
                  key={item.key}
                  style={[styles.stop, index === stages.length - 1 && styles.stopLast]}
                  accessible
                  accessibilityLabel={`${item.label}${stageTimes[index] ? `, ${stageTimes[index]}` : ''}`}
                  accessibilityState={{ selected: index === stageIndex }}
                >
                  {index < stages.length - 1 ? (
                    <View style={[styles.segment, arrived && styles.segmentArrived]}>
                      <View style={[styles.segmentFill, arrived && styles.segmentFillArrived, { height: `${fill * 100}%` }]} />
                    </View>
                  ) : null}

                  <View style={styles.dotWrap}>
                    {current ? (
                      <Animated.View
                        style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
                      />
                    ) : null}
                    <View style={[styles.dot, (done || current) && styles.dotOn, arrived && styles.dotArrived]}>
                      {done ? (
                        <Icon name="check" size={14} color={arrived ? colors.herb : colors.onAmber} strokeWidth={2.6} />
                      ) : current ? (
                        <Icon name="scooter" size={15} color={colors.onAmber} />
                      ) : null}
                    </View>
                  </View>

                  <Text style={[styles.stopLabel, (done || current) && styles.stopLabelOn, arrived && styles.onArrived]}>
                    {item.label}
                  </Text>
                  {stageTimes[index] ? (
                    <Text style={[styles.stopTime, arrived && styles.onArrived]}>{stageTimes[index]}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle}>מה בהזמנה</Text>
            <Text style={styles.summaryCount}>{itemCount(units)}</Text>
          </View>

          {(order.orderItems || []).map((item) => (
            <View key={item.productId} style={styles.item}>
              <Text style={styles.itemName} numberOfLines={1}>
                <Text style={styles.itemQuantity}>{item.quantity}× </Text>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>סך הכול</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>

          {priceCorrection ? (
            <InlineMessage tone="info">
              {`מחיר של מנה השתנה בתפריט אחרי שהוספתם אותה. הסל הראה ${formatPrice(priceCorrection.shown)}, וההזמנה חויבה לפי המחיר העדכני: ${formatPrice(priceCorrection.charged)}.`}
            </InlineMessage>
          ) : null}
        </View>

        <View style={styles.actions}>
          {order.restaurant ? (
            <Button
              variant="secondary"
              icon="store"
              fullWidth
              onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: order.restaurant })}
            >
              להזמין שוב
            </Button>
          ) : null}
          <Button
            variant="ghost"
            fullWidth
            onPress={() => navigation.navigate('Tabs', { screen: 'Orders' }, { pop: true })}
          >
            לכל ההזמנות
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  skeleton: { gap: space[4], padding: space[4] },
  content: { padding: space[4], gap: space[5], paddingBottom: space[8] },

  stage: {
    gap: space[4],
    padding: space[5],
    borderRadius: radius.lg,
    backgroundColor: colors.night,
  },
  stageArrived: { backgroundColor: colors.herb },
  /* The delivered card is herb, and herb wants its own text colour —
     the night text would drop under AA on it. */
  onArrived: { color: colors.onHerb },
  eta: { alignItems: 'flex-end', gap: 2 },
  big: {
    ...type.num,
    ...rtl.text,
    fontSize: 56,
    lineHeight: 62,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.onNight,
  },
  sub: { ...type.body, ...rtl.text, fontWeight: '700', color: colors.amber },
  doneMark: {
    width: 52,
    height: 52,
    marginBottom: space[2],
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  note: { ...type.bodyL, ...rtl.text, color: colors.onNight, opacity: 0.88 },

  track: { marginTop: space[1] },
  stop: { ...rtl.row, alignItems: 'center', gap: space[3], minHeight: 52, paddingBottom: space[4] },
  stopLast: { minHeight: 0, paddingBottom: 0 },
  segment: {
    position: 'absolute',
    right: DOT / 2 - 1,
    top: DOT + 2,
    bottom: 2,
    width: 2,
    borderRadius: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  segmentArrived: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
  segmentFill: { width: 2, backgroundColor: colors.amber },
  segmentFillArrived: { backgroundColor: colors.onHerb },
  dotWrap: { width: DOT, height: DOT, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: colors.amber,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { borderColor: colors.amber, backgroundColor: colors.amber },
  dotArrived: { borderColor: colors.onHerb, backgroundColor: colors.onHerb },
  stopLabel: { ...type.body, ...rtl.text, flex: 1, fontWeight: '700', color: colors.onNight, opacity: 0.6 },
  stopLabelOn: { opacity: 1 },
  stopTime: { ...type.caption, ...type.num, color: colors.onNight, opacity: 0.7 },

  summary: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  summaryHead: { ...rtl.row, alignItems: 'baseline', justifyContent: 'space-between' },
  summaryTitle: { ...type.h3, ...rtl.text, color: colors.ink },
  summaryCount: { ...type.caption, color: colors.inkMuted },
  item: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  itemName: { ...type.body, ...rtl.text, flex: 1, color: colors.ink },
  itemQuantity: { color: colors.inkMuted, fontVariant: ['tabular-nums'] },
  itemPrice: { ...type.body, ...type.num, color: colors.ink, fontWeight: '600' },
  totalRow: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: { ...type.body, color: colors.inkMuted },
  totalValue: { ...type.h2, ...type.num, color: colors.ink },

  actions: { gap: space[2] },
}));
