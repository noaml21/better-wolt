import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { createOrder } from '../services/api';
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

export default function CartScreen({ navigation }) {
  const styles = useStyles();
  const { token } = useAuth();
  const { showToast } = useToast();
  const cart = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async () => {
    setPlacing(true);
    setError('');

    try {
      const order = await createOrder(token, {
        restaurant: cart.restaurantId,
        products: cart.toOrderProducts(),
      });

      cart.clear();
      showToast('ההזמנה נשלחה');
      navigation.navigate('Tracking', { orderId: order.id || order._id });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPlacing(false);
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
          {cart.lines.map((line) => (
            <View key={line.id} style={styles.line}>
              <View style={styles.lineText}>
                <Text style={styles.lineName}>{line.name}</Text>
                <Text style={styles.linePrice}>{formatPrice(line.price * line.quantity)}</Text>
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

        {error ? <InlineMessage>{error}</InlineMessage> : null}
      </ScrollView>

      {/* The tab bar below already pays the bottom inset. */}
      <View style={styles.footer}>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>סך המנות</Text>
          <Text style={styles.totalValue}>{formatPrice(cart.subtotal)}</Text>
        </View>

        <Text style={styles.note}>דמי המשלוח מחושבים בשלב התשלום.</Text>

        <Button size="lg" fullWidth loading={placing} onPress={placeOrder}>
          לביצוע ההזמנה
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

  lines: { gap: space[3] },
  line: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    paddingBottom: space[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  lineText: { flex: 1, gap: 2 },
  lineName: { ...type.body, ...rtl.text, color: colors.ink, fontWeight: '600' },
  linePrice: { ...type.caption, ...rtl.text, color: colors.inkMuted },

  footer: {
    gap: space[2],
    padding: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    ...shadow.e2,
  },
  total: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { ...type.body, color: colors.ink },
  totalValue: { ...type.h2, color: colors.ink },
  note: { ...type.caption, ...rtl.text, marginBottom: space[2], color: colors.inkMuted },
}));
