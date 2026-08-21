import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';

function formatPrice(price) {
  const value = Number(price);

  return Number.isFinite(value)
    ? value.toFixed(2)
    : '0.00';
}

function getEntityId(entity) {
  return entity?.id || entity?._id || null;
}

export default function CartScreen({
  navigation,
}) {
  const {
    restaurant,
    items,
    itemsCount,
    total,
    removeFromCart,
    clearCart,
  } = useCart();

  const {
    token,
    isAuthenticated,
    logout,
  } = useAuth();

  const [submitting, setSubmitting] =
    useState(false);

  const submitOrder = async () => {
    if (items.length === 0) {
      Alert.alert(
        'הסל ריק',
        'יש להוסיף לפחות מוצר אחד לפני ביצוע הזמנה.'
      );

      return;
    }

    const restaurantId =
      getEntityId(restaurant);

    if (!restaurantId) {
      Alert.alert(
        'לא ניתן ליצור הזמנה',
        'למסעדה שנבחרה חסר מזהה.'
      );

      return;
    }

    if (!isAuthenticated || !token) {
      Alert.alert(
        'נדרשת התחברות',
        'יש להתחבר כדי לבצע הזמנה.',
        [
          {
            text: 'ביטול',
            style: 'cancel',
          },
          {
            text: 'להתחברות',
            onPress: () =>
              navigation?.navigate('Login'),
          },
        ]
      );

      return;
    }

    if (
      items.some(
        (item) => !getEntityId(item)
      )
    ) {
      Alert.alert(
        'לא ניתן ליצור הזמנה',
        'לאחד המוצרים בסל חסר מזהה.'
      );

      return;
    }

    const payload = {
      restaurant: String(restaurantId),
      products: items.map((item) => ({
        id: String(getEntityId(item)),
        quantity: Number(
          item.quantity || 0
        ),
      })),
    };

    try {
      setSubmitting(true);

      await createOrder(token, payload);

      clearCart();

      Alert.alert(
        'ההזמנה נוצרה',
        'ההזמנה נשלחה בהצלחה.',
        [
          {
            text: 'אישור',
            onPress: () =>
              navigation?.navigate(
                'Orders'
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        'Failed to create order:',
        error
      );

      if (
        error.status === 401 ||
        error.status === 403
      ) {
        await logout();
        
        Alert.alert(
          'ההתחברות אינה תקפה',
          'יש להתחבר מחדש.'
        );

        return;
      }

      Alert.alert(
        'יצירת ההזמנה נכשלה',
        error.message ||
          'לא הצלחנו ליצור את ההזמנה.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) =>
          String(
            getEntityId(item) || index
          )
        }
        contentContainerStyle={[
          styles.list,
          items.length === 0 &&
            styles.emptyList,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.title}>
                הסל שלי
              </Text>

              <Text
                style={styles.restaurant}
              >
                {restaurant?.name}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View
              style={styles.itemDetails}
            >
              <Text
                style={styles.itemName}
              >
                {item.name}
              </Text>

              <Text
                style={styles.quantity}
              >
                כמות: {item.quantity}
              </Text>

              <Text
                style={styles.itemPrice}
              >
                ₪
                {formatPrice(
                  Number(item.price) *
                    Number(item.quantity)
                )}
              </Text>
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={() =>
                removeFromCart(
                  getEntityId(item)
                )
              }
            >
              <Text
                style={styles.removeText}
              >
                הסרה
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
          >
            <Text
              style={styles.emptyTitle}
            >
              הסל שלך ריק
            </Text>

            <Text style={styles.message}>
              הוסיפי מנות ממסעדה כדי
              להתחיל הזמנה.
            </Text>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.summary}>
              <View
                style={styles.summaryRow}
              >
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  מספר פריטים
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {itemsCount}
                </Text>
              </View>

              <View
                style={styles.summaryRow}
              >
                <Text
                  style={styles.totalLabel}
                >
                  סך הכול
                </Text>

                <Text style={styles.total}>
                  ₪{formatPrice(total)}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.orderButton,
                  submitting &&
                    styles.disabledButton,
                ]}
                disabled={
                  submitting ||
                  items.length === 0
                }
                onPress={submitOrder}
              >
                {submitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.orderButtonText
                    }
                  >
                    ביצוע הזמנה
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.clearButton}
                onPress={clearCart}
              >
                <Text
                  style={styles.clearText}
                >
                  ניקוי הסל
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4FA',
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  restaurant: {
    marginTop: 5,
    fontSize: 16,
    color: '#666666',
    textAlign: 'right',
  },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  itemDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },

  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#351440',
  },

  quantity: {
    marginTop: 6,
    fontSize: 14,
    color: '#666666',
  },

  itemPrice: {
    marginTop: 7,
    fontSize: 16,
    fontWeight: '700',
    color: '#542163',
  },

  removeButton: {
    marginRight: 15,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#F1E7F4',
  },

  removeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#542163',
  },

  summary: {
    marginTop: 10,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 15,
    color: '#666666',
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#351440',
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#351440',
  },

  total: {
    fontSize: 20,
    fontWeight: '800',
    color: '#542163',
  },

  orderButton: {
    marginTop: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  disabledButton: {
    opacity: 0.6,
  },

  orderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  clearButton: {
    marginTop: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },

  clearText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A3C5D',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#351440',
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },
});
