import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';
import { getOrderById } from '../services/api';
import {
  formatOrderNumber,
  getArrivalTime,
  getLine,
  getSecondsLeft,
  getSegmentFill,
  getStageIndex,
  getStageTimes,
  itemCount,
  lineColours,
  stages,
} from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  EmptyState,
  ErrorState,
  InlineMessage,
  Screen,
  ScreenHeader,
  Skeleton,
  formatPrice,
} from '../ui';

/* The showpiece (V5 spec §6, §11): the LED board with the arrival time,
   the restaurant's line map, the receipt as a ticket. Nothing pulses.
   The server never advances an order's status
   (ARCHITECTURE §6), so progress is derived from startTime — recomputed
   from the timestamp on every tick rather than decremented, so a
   backgrounded app comes back correct. */

const DOT = 28;

export default function TrackingScreen({ navigation, route }) {
  const styles = useStyles();
  const theme = useTheme();
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
  /* The order carries its restaurant's id and name: the same line the
     restaurant has everywhere else. */
  const [lineFill, lineText] = lineColours(getLine({ id: order.restaurant, name: order.restaurantName }), theme);

  return (
    <Screen>
      <ScreenHeader
        title={arrived ? 'ההזמנה הגיעה' : 'ההזמנה בדרך'}
        subtitle={`${order.restaurantName} · ${formatOrderNumber(order.id)}`}
        onBack={navigation.goBack}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.board}>
          {arrived ? (
            <View style={styles.eta}>
              <Text style={styles.arrivedWord}>בתיאבון</Text>
              {arrivalTime ? <Text style={styles.arrivedAt}>{`הגיעה ב־${arrivalTime}`}</Text> : null}
            </View>
          ) : (
            <View style={styles.eta} accessible accessibilityLabel={`מגיעה ב-${arrivalTime}, עוד ${minutesLeft} דקות`}>
              {/* The clock time is what a person plans around; the minutes
                  are the reassurance. Both are labelled. */}
              <Text style={styles.label}>מגיעה ב־</Text>
              <Text style={styles.big}>{arrivalTime}</Text>
              <Text style={styles.left}>{`עוד ${minutesLeft} דק׳`}</Text>
            </View>
          )}

          {!arrived ? (
            <Text style={styles.note} accessibilityLiveRegion="polite">
              {stage.note}
            </Text>
          ) : null}
        </View>

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
                  <View style={styles.segment}>
                    <View style={[styles.segmentFill, { backgroundColor: lineFill, height: `${fill * 100}%` }]} />
                  </View>
                ) : null}

                <View
                  style={[
                    styles.dot,
                    (done || current) && { borderColor: lineFill },
                    done && { backgroundColor: lineFill },
                    current && styles.dotCurrent,
                    current && { borderColor: lineFill },
                  ]}
                />

                <View style={styles.stopText}>
                  <Text style={[styles.stopLabel, current && styles.stopLabelOn]}>{item.label}</Text>
                  {stageTimes[index] ? <Text style={styles.stopTime}>{stageTimes[index]}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <View style={[styles.summaryHead, { backgroundColor: lineFill }]}>
            <Text style={[styles.summaryTitle, { color: lineText }]}>מה בהזמנה</Text>
            <Text style={[styles.summaryCount, { color: lineText }]}>{itemCount(units)}</Text>
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

const useStyles = createStyles(({ colors, space, type, font }) => ({
  skeleton: { gap: space[4], padding: space[4] },
  content: { padding: space[4], gap: space[5], paddingBottom: space[8] },

  /* The LED board: amber is the live order and nothing else. */
  board: { gap: space[3], padding: space[5], marginHorizontal: -space[4], marginTop: -space[4], backgroundColor: colors.board },
  eta: { alignItems: 'flex-end' },
  label: { ...type.bodyL, fontWeight: '800', color: colors.led },
  big: { ...type.num, fontSize: 84, lineHeight: 88, fontWeight: '900', color: colors.led },
  left: { ...type.bodyL, fontSize: 22, lineHeight: 28, fontWeight: '800', color: colors.led },
  arrivedWord: { fontFamily: font.display, fontSize: 72, lineHeight: 68, paddingTop: 8, color: colors.led },
  arrivedAt: { ...type.bodyL, ...type.num, fontWeight: '800', color: colors.onBoard },
  note: { ...type.bodyL, ...rtl.text, fontWeight: '700', color: colors.onBoard },

  /* The line map: the restaurant's line, one station per stage. */
  track: { paddingTop: space[1] },
  stop: { ...rtl.row, alignItems: 'flex-start', gap: space[4], minHeight: 64 },
  stopLast: { minHeight: 0 },
  segment: {
    position: 'absolute',
    right: DOT / 2 - 5,
    top: DOT / 2,
    height: 64,
    width: 10,
    overflow: 'hidden',
    backgroundColor: colors.hairline,
  },
  segmentFill: { width: 10 },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 6,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
  },
  dotCurrent: { borderWidth: 9 },
  stopText: { flex: 1, alignItems: 'flex-end', paddingTop: 2 },
  stopLabel: { ...type.bodyL, ...rtl.text, fontWeight: '800', color: colors.ink },
  stopLabelOn: { textDecorationLine: 'underline' },
  stopTime: { ...type.body, ...type.num, fontWeight: '800', color: colors.inkMuted },

  summary: { borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.panel },
  summaryHead: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space[3],
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
  },
  summaryTitle: { fontFamily: font.display, fontSize: 32, lineHeight: 32, paddingTop: 5 },
  summaryCount: { ...type.body, fontWeight: '800' },
  item: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    marginHorizontal: space[4],
    paddingVertical: space[3],
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderBottomColor: colors.hairline,
  },
  itemName: { ...type.body, ...rtl.text, flex: 1, fontWeight: '700', color: colors.ink },
  itemQuantity: { ...type.num, fontWeight: '900' },
  itemPrice: { ...type.body, ...type.num, fontWeight: '800', color: colors.ink },
  totalRow: { ...rtl.row, alignItems: 'baseline', justifyContent: 'space-between', padding: space[4] },
  totalLabel: { ...type.bodyL, fontWeight: '800', color: colors.ink },
  totalValue: { ...type.num, fontSize: 32, lineHeight: 36, fontWeight: '900', color: colors.ink },

  actions: { gap: space[2] },
}));
