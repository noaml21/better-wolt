import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import OrderCard from '../components/OrderCard';
import { useAuth } from '../context/AuthContext';

import {
  getRestaurantById,
  getUserOrders,
} from '../services/api';

function getRestaurantId(order) {
  const restaurant = order?.restaurant;

  if (
    restaurant &&
    typeof restaurant === 'object'
  ) {
    const id =
      restaurant.id || restaurant._id;

    return id ? String(id) : null;
  }

  if (
    restaurant === undefined ||
    restaurant === null ||
    restaurant === ''
  ) {
    return null;
  }

  return String(restaurant);
}

function isMongoId(value) {
  return /^[a-f0-9]{24}$/i.test(
    String(value || '')
  );
}

function buildProductNameMap(restaurant) {
  const productNameById = new Map();

  const products = Array.isArray(
    restaurant?.products
  )
    ? restaurant.products
    : [];

  products.forEach((product) => {
    const productId =
      product?.id || product?._id;

    if (productId && product?.name) {
      productNameById.set(
        String(productId),
        product.name
      );
    }
  });

  return productNameById;
}

function getProductDisplayName(
  product,
  productNameById
) {
  if (
    product &&
    typeof product === 'object'
  ) {
    if (product.name) {
      return product.name;
    }

    const productId =
      product.id || product._id;

    if (
      productId &&
      productNameById.has(
        String(productId)
      )
    ) {
      return productNameById.get(
        String(productId)
      );
    }

    return 'מוצר לא זמין';
  }

  const value = String(
    product || ''
  ).trim();

  if (!value) {
    return 'מוצר ללא שם';
  }

  if (productNameById.has(value)) {
    return productNameById.get(value);
  }

  if (isMongoId(value)) {
    return 'מוצר לא זמין';
  }

  return value;
}

function mapOrderProducts(
  order,
  productNameById
) {
  const products = Array.isArray(
    order?.products
  )
    ? order.products
    : [];

  return {
    ...order,
    products: products.map((product) =>
      getProductDisplayName(
        product,
        productNameById
      )
    ),
  };
}

async function addProductNamesToOrders(
  orders
) {
  const restaurantIds = [
    ...new Set(
      orders
        .map(getRestaurantId)
        .filter(Boolean)
    ),
  ];

  const restaurantEntries =
    await Promise.all(
      restaurantIds.map(
        async (restaurantId) => {
          try {
            const restaurant =
              await getRestaurantById(
                restaurantId
              );

            return [
              restaurantId,
              buildProductNameMap(
                restaurant
              ),
            ];
          } catch (error) {
            console.warn(
              `Failed to load restaurant ${restaurantId}:`,
              error
            );

            return [
              restaurantId,
              new Map(),
            ];
          }
        }
      )
    );

  const productMapsByRestaurant =
    new Map(restaurantEntries);

  return orders.map((order) => {
    const restaurantId =
      getRestaurantId(order);

    const productNameById =
      productMapsByRestaurant.get(
        restaurantId
      ) || new Map();

    return mapOrderProducts(
      order,
      productNameById
    );
  });
}

export default function OrdersScreen({
  navigation,
}) {
  const {
    token,
    isAuthenticated,
    logout,
  } = useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      try {
        if (
          !isAuthenticated ||
          !token
        ) {
          setOrders([]);
          setError(
            'יש להתחבר כדי לצפות בהזמנות.'
          );

          return;
        }

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const result =
          await getUserOrders(token);

        if (!Array.isArray(result)) {
          throw new Error(
            'The server returned an invalid orders response'
          );
        }

        const ordersWithProductNames =
          await addProductNamesToOrders(
            result
          );

        const sortedOrders = [
          ...ordersWithProductNames,
        ].sort(
          (
            firstOrder,
            secondOrder
          ) =>
            Number(
              secondOrder.startTime || 0
            ) -
            Number(
              firstOrder.startTime || 0
            )
        );

        setOrders(sortedOrders);
      } catch (err) {
        console.error(
          'Failed to load orders:',
          err
        );

        if (
          err.status === 401 ||
          err.status === 403
        ) {
          await logout();

          setError(
            'פג תוקף ההתחברות. יש להתחבר מחדש.'
          );
        } else {
          setError(
            err.message ||
              'לא הצלחנו לטעון את ההזמנות.'
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, token, logout]
  );

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const openLogin = () => {
    navigation?.navigate('Login');
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.message}>
          טוען הזמנות...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    const authenticationError =
      !isAuthenticated ||
      error.includes('להתחבר');

    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <Text
          style={styles.errorTitle}
        >
          לא ניתן להציג הזמנות
        </Text>

        <Text style={styles.message}>
          {error}
        </Text>

        {authenticationError ? (
          <Pressable
            style={styles.button}
            onPress={openLogin}
          >
            <Text
              style={styles.buttonText}
            >
              מעבר להתחברות
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() =>
              loadOrders()
            }
          >
            <Text
              style={styles.buttonText}
            >
              נסי שוב
            </Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item, index) =>
          String(
            item.id ||
              item._id ||
              index
          )
        }
        renderItem={({ item }) => (
          <OrderCard order={item} />
        )}
        contentContainerStyle={[
          styles.list,
          orders.length === 0 &&
            styles.emptyList,
        ]}
        refreshing={refreshing}
        onRefresh={() =>
          loadOrders(true)
        }
        showsVerticalScrollIndicator={
          false
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              ההזמנות שלי
            </Text>

            <Text
              style={styles.subtitle}
            >
              כאן ניתן לראות את כל
              ההזמנות שלך
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
          >
            <Text
              style={styles.emptyTitle}
            >
              עדיין אין הזמנות
            </Text>

            <Text style={styles.message}>
              לאחר ביצוע הזמנה היא
              תופיע כאן.
            </Text>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
  },

  header: {
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#666666',
    textAlign: 'right',
  },

  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F4FA',
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#351440',
    textAlign: 'center',
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },

  button: {
    marginTop: 22,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptyContainer: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#351440',
  },
});