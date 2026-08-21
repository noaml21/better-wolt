import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

function getProductName(product) {
  if (typeof product === 'string') {
    return product;
  }

  return product?.name || 'מוצר ללא שם';
}

function formatPrice(price) {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? numericPrice.toFixed(2)
    : '0.00';
}

export default function OrderCard({ order }) {
  const products = Array.isArray(order.products)
    ? order.products
    : [];

  const itemsCount =
    Number(order.items) || products.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.status}>
          {order.status || 'ההזמנה התקבלה'}
        </Text>

        <Text style={styles.restaurantName}>
          {order.restaurantName || 'מסעדה'}
        </Text>
      </View>

      {order.date ? (
        <Text style={styles.date}>
          {order.date}
        </Text>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>
        פריטים בהזמנה
      </Text>

      {products.map((product, index) => (
        <Text
          key={`${order.id || 'order'}-product-${index}`}
          style={styles.product}
        >
          • {getProductName(product)}
        </Text>
      ))}

      {products.length === 0 ? (
        <Text style={styles.noProducts}>
          אין פירוט מוצרים להזמנה זו
        </Text>
      ) : null}

      <View style={styles.summary}>
        <Text style={styles.items}>
          {itemsCount} פריטים
        </Text>

        <Text style={styles.total}>
          סה״כ: ₪{formatPrice(order.total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 17,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  restaurantName: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  status: {
    marginRight: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#542163',
  },

  date: {
    marginTop: 7,
    fontSize: 13,
    color: '#777777',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#E8E2EB',
  },

  sectionTitle: {
    marginBottom: 7,
    fontSize: 15,
    fontWeight: '700',
    color: '#351440',
    textAlign: 'right',
  },

  product: {
    marginTop: 5,
    fontSize: 14,
    color: '#555555',
    textAlign: 'right',
  },

  noProducts: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'right',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  items: {
    fontSize: 14,
    color: '#777777',
  },

  total: {
    fontSize: 17,
    fontWeight: '800',
    color: '#542163',
  },
});