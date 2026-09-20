import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl, useReducedMotion, useTheme } from '../theme';
import { getOrderById } from '../services/api';
import {
  formatCountdown,
  formatOrderNumber,
  getProgress,
  getSecondsLeft,
  getStageIndex,
  stages,
} from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Screen,
  ScreenHeader,
  Skeleton,
  formatPrice,
} from '../ui';

/* The showpiece. The server never advances an order's status
   (ARCHITECTURE §6), so progress is derived from startTime — recomputed
   from the timestamp on every tick rather than decremented, so a
   backgrounded app comes back correct. */

const RAIL_HEIGHT = 6;

export default function TrackingScreen({ navigation, route }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const { token } = useAuth();
  const orderId = route.params?.orderId;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [railWidth, setRailWidth] = useState(0);

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

  const progress = order ? getProgress(secondsLeft) : 0;
  const ride = useRef(new Animated.Value(0)).current;

  /* One movement: the scooter slides to where the order actually is.
     Under reduced motion it is simply placed there. */
  useEffect(() => {
    if (reducedMotion) {
      ride.setValue(progress);

      return;
    }

    Animated.timing(ride, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, reducedMotion, ride]);

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
            onAction={() => navigation.navigate('Tabs', { screen: 'Orders' })}
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
  const riderOffset = ride.interpolate({
    inputRange: [0, 100],
    /* The rail runs right-to-left, so 0 % is the right edge. */
    outputRange: [0, -Math.max(railWidth - 36, 0)],
  });
  const fillWidth = ride.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <Screen>
      <ScreenHeader
        title={arrived ? 'ההזמנה הגיעה' : 'ההזמנה בדרך'}
        subtitle={`${order.restaurantName} · ${formatOrderNumber(order.id)}`}
        onBack={navigation.goBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.stage, arrived && styles.stageArrived]}>
          <Text style={styles.countdownLabel}>
            {arrived ? 'ההזמנה הגיעה' : 'זמן משוער להגעה'}
          </Text>

          {arrived ? (
            <View style={styles.arrivedMark}>
              <Icon name="check" size={44} color={colors.onInk} strokeWidth={2.2} />
            </View>
          ) : (
            <Text style={styles.countdown} accessibilityLabel={`${Math.ceil(secondsLeft / 60)} דקות`}>
              {formatCountdown(secondsLeft)}
            </Text>
          )}

          <Text style={styles.note} accessibilityLiveRegion="polite">
            {stage.note}
          </Text>

          <View style={styles.rail} onLayout={(event) => setRailWidth(event.nativeEvent.layout.width)}>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, { width: fillWidth }]} />
            </View>

            <Animated.View style={[styles.rider, { transform: [{ translateX: riderOffset }] }]}>
              <Icon name={arrived ? 'check' : 'scooter'} size={18} color={colors.onFlame} />
            </Animated.View>
          </View>

          <View style={styles.stops}>
            {stages.map((item, index) => (
              <Text
                key={item.key}
                style={[styles.stop, index <= stageIndex && styles.stopDone]}
                accessibilityState={{ selected: index === stageIndex }}
              >
                {item.label}
              </Text>
            ))}
          </View>
        </View>

        <Card style={styles.summary}>
          <Text style={styles.summaryTitle}>מה בהזמנה</Text>

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
        </Card>

        <View style={styles.actions}>
          <Button
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate('Tabs', { screen: 'Orders' })}
          >
            לכל ההזמנות
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          >
            להזמין עוד משהו
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
    gap: space[3],
    padding: space[5],
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    ...shadow.e2,
  },
  stageArrived: { backgroundColor: colors.herb },
  countdownLabel: { ...type.caption, textAlign: 'center', color: colors.onInk, opacity: 0.75 },
  countdown: {
    ...type.displayL,
    textAlign: 'center',
    color: colors.onInk,
    fontVariant: ['tabular-nums'],
  },
  arrivedMark: { alignItems: 'center', paddingVertical: space[2] },
  note: { ...type.body, textAlign: 'center', color: colors.onInk, fontWeight: '600' },

  rail: { height: 36, justifyContent: 'center', marginTop: space[4] },
  track: {
    height: RAIL_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    /* Filling right-to-left: the delivery starts at the restaurant. */
    alignItems: 'flex-end',
  },
  fill: { height: RAIL_HEIGHT, borderRadius: radius.pill, backgroundColor: colors.amber },
  rider: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flame,
  },

  stops: { ...rtl.row, justifyContent: 'space-between', marginTop: space[2] },
  stop: { ...type.micro, color: colors.onInk, opacity: 0.5 },
  stopDone: { opacity: 1, fontWeight: '800' },

  summary: { gap: space[3], padding: space[4] },
  summaryTitle: { ...type.h3, ...rtl.text, color: colors.ink },
  item: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  itemName: { ...type.body, ...rtl.text, flex: 1, color: colors.ink },
  itemQuantity: { color: colors.inkMuted, fontVariant: ['tabular-nums'] },
  itemPrice: { ...type.body, color: colors.ink, fontWeight: '600' },
  totalRow: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space[3],
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  totalLabel: { ...type.body, color: colors.inkMuted },
  totalValue: { ...type.h2, color: colors.ink },

  actions: { gap: space[2] },
}));
