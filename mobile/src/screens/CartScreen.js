import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { createOrder, getRestaurantById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { dishCount } from '../services/presentation';
import {
  Button,
  EmptyState,
  Icon,
  InlineMessage,
  QuantityStepper,
  Screen,
  ScreenHeader,
  formatPrice,
  useToast,
} from '../ui';

/* The cart is a summary, not a source of truth: the request carries only
   ids and quantities and the server prices the order (V2_SPEC §3.1), so
   the total here is labelled as the dishes alone. */

/* Contract string (ARCHITECTURE §4.3): the cart names a dish the menu no
   longer has — the owner removed it after it was added. */
const DISH_GONE = 'Product not found in restaurant menu';
const RESTAURANT_GONE = 'Restaurant not found';

export default function CartScreen({ navigation }) {
  const styles = useStyles();
  const { token } = useAuth();
  const { showToast } = useToast();
  const cart = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  /* The answer can come after the customer has moved on. Signing out (or
     switching account) unmounts the tabs, and then the order is not this
     screen's to report; moving to another tab keeps the cart mounted but
     unfocused, and then it must not be pulled onto the tracking screen. */
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const placeOrder = async () => {
    const shownTotal = Math.round(cart.subtotal * 100) / 100;

    setPlacing(true);
    setError('');

    try {
      const order = await createOrder(token, {
        restaurant: cart.restaurantId,
        products: cart.toOrderProducts(),
      });

      if (!mounted.current) {
        return;
      }

      cart.clear();

      /* The server prices the order from the menu as it is now (V2_SPEC
         §3.1). If a price changed after the dish was added, what was
         charged is not what the cart showed; the tracking screen explains
         it beside the receipt (V4 spec §3.5). If the customer has left
         this tab, the toast is the only place left to say it. */
      const charged = Number(order.total);
      const priceCorrection = charged !== shownTotal ? { shown: shownTotal, charged } : undefined;

      if (navigation.isFocused()) {
        showToast('ההזמנה נשלחה');
        navigation.navigate('Tracking', { orderId: order.id || order._id, priceCorrection });
      } else if (priceCorrection) {
        showToast(`המחירים בתפריט השתנו בינתיים. ההזמנה חויבה לפי המחיר העדכני: ${formatPrice(charged)}.`, {
          tone: 'error',
          duration: 7000,
        });
      } else {
        showToast('ההזמנה נשלחה');
      }
    } catch (requestError) {
      if (!mounted.current) {
        return;
      }

      if (requestError.status === 404 && requestError.message === RESTAURANT_GONE) {
        cart.clear();
        showToast('המסעדה נסגרה בינתיים, והסל התרוקן.', { tone: 'error' });
        return;
      }

      if (requestError.status === 404 && requestError.message === DISH_GONE) {
        await dropDishesNoLongerOnTheMenu(requestError);
        return;
      }

      setError(requestError.message);
    } finally {
      if (mounted.current) {
        setPlacing(false);
      }
    }
  };

  /* Nothing was ordered. Read the menu as it is now, take out the dishes
     that are gone and say which, so the next attempt can go through. */
  const dropDishesNoLongerOnTheMenu = async (requestError) => {
    try {
      const fresh = await getRestaurantById(cart.restaurantId);
      const onMenu = new Set((fresh?.products || []).map((product) => String(product.id)));
      const gone = cart.lines.filter((line) => !onMenu.has(line.id));

      gone.forEach((line) => cart.removeLine(line.id));

      const explanation =
        gone.length === 0
          ? 'התפריט השתנה. בדקו את הסל ונסו שוב.'
          : gone.length === 1
            ? `המנה "${gone[0].name}" כבר לא בתפריט והוסרה מהסל. בדקו את הסל ונסו שוב.`
            : `${gone.length} מנות כבר לא בתפריט והוסרו מהסל. בדקו את הסל ונסו שוב.`;

      // Beside the cart while it still has dishes (V4 spec §3.5). If every
      // line is gone the cart switches to its empty state, which would
      // take an inline message with it — then a toast is the only place.
      if (gone.length < cart.lines.length) {
        setError(explanation);
      } else {
        showToast(explanation, { tone: 'error' });
      }
    } catch {
      setError(requestError.message);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="הסל שלי" large />
        <EmptyState
          icon="cart"
          title="הסל ריק"
          description="בחרו מסעדה, הוסיפו מנות, והן יופיעו כאן."
          actionLabel="לגלות מסעדות"
          onAction={() => navigation.navigate('Home')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="הסל שלי" subtitle={dishCount(cart.itemsCount)} large />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() =>
            navigation.navigate('RestaurantDetails', { restaurantId: cart.restaurantId })
          }
          accessibilityRole="button"
          accessibilityLabel={`חזרה לתפריט של ${cart.restaurant?.name}`}
          style={({ pressed }) => [styles.restaurant, pressed && styles.pressed]}
        >
          <Icon name="store" size={18} color={styles.restaurantIcon.color} />
          <Text style={styles.restaurantName} numberOfLines={1}>
            {cart.restaurant?.name}
          </Text>
          <Text style={styles.restaurantLink}>לתפריט</Text>
        </Pressable>

        <View style={styles.lines}>
          {cart.lines.map((line, index) => (
            <View key={line.id} style={[styles.line, index === cart.lines.length - 1 && styles.lineLast]}>
              <View style={styles.lineText}>
                <Text style={styles.lineName}>{line.name}</Text>
                <Text style={styles.linePrice}>
                  {formatPrice(line.price * line.quantity)}
                  {line.quantity > 1 ? (
                    <Text style={styles.lineUnit}>{` · ${formatPrice(line.price)} ליחידה`}</Text>
                  ) : null}
                </Text>
              </View>

              <QuantityStepper
                value={line.quantity}
                label={line.name}
                onDecrease={() => cart.decreaseItem(line.id)}
                onIncrease={() => cart.addItem(line, cart.restaurant)}
              />
            </View>
          ))}
        </View>

        {/* Server strings are contract and shown as they come (ARCHITECTURE
            §4.3); the lead says what they mean. */}
        {error ? <InlineMessage>{`ההזמנה לא נשלחה. ${error}`}</InlineMessage> : null}
      </ScrollView>

      {/* The tab bar below already pays the bottom inset. */}
      <View style={styles.footer}>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>סך הכול</Text>
          <Text style={styles.totalValue}>{formatPrice(cart.subtotal)}</Text>
        </View>

        {/* True of every order: the client never sets a price (V2_SPEC
            §3.1). There is no payment step and no fee. */}
        <Text style={styles.note}>המחיר הסופי נקבע לפי התפריט ברגע ההזמנה.</Text>

        <Button size="lg" fullWidth loading={placing} onPress={placeOrder}>
          {`לביצוע ההזמנה · ${formatPrice(cart.subtotal)}`}
        </Button>
      </View>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  content: { padding: space[4], gap: space[4] },

  restaurant: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.sunken,
  },
  pressed: { opacity: 0.9 },
  restaurantIcon: { color: colors.inkMuted },
  restaurantName: { ...type.h3, ...rtl.text, flex: 1, color: colors.ink },
  restaurantLink: { ...type.caption, color: colors.flameDeep, fontWeight: '700' },

  lines: {
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  line: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    paddingVertical: space[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  lineLast: { borderBottomWidth: 0 },
  lineText: { flex: 1, gap: 2 },
  lineName: { ...type.body, ...rtl.text, color: colors.ink, fontWeight: '600' },
  linePrice: { ...type.caption, ...type.num, ...rtl.text, color: colors.ink, fontWeight: '700' },
  lineUnit: { color: colors.inkMuted, fontWeight: '500' },

  footer: {
    gap: space[2],
    padding: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    ...shadow.e2,
  },
  total: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { ...type.body, color: colors.ink, fontWeight: '600' },
  totalValue: { ...type.h2, ...type.num, color: colors.ink },
  note: { ...type.caption, ...rtl.text, marginBottom: space[2], color: colors.inkMuted },
}));
