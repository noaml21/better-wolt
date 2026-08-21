import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function formatPrice(price) {
  const numericPrice = Number(price);

  return Number.isFinite(numericPrice)
    ? numericPrice.toFixed(2)
    : '0.00';
}

export default function ProductCard({
  product,
  onAddToCart,
  isOwner = false,
  onEdit,
  onDelete,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.details}>
        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {product.name || 'מנה ללא שם'}
        </Text>

        {product.description ? (
          <Text style={styles.description}>
            {product.description}
          </Text>
        ) : null}

        <Text style={styles.price}>
          ₪{formatPrice(product.price)}
        </Text>
      </View>

      {isOwner ? (
        <View style={styles.ownerActions}>
          <Pressable
            style={[
              styles.ownerButton,
              styles.editButton,
            ]}
            onPress={() => onEdit?.(product)}
          >
            <Text style={styles.editButtonText}>
              עריכה
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.ownerButton,
              styles.deleteButton,
            ]}
            onPress={() => onDelete?.(product)}
          >
            <Text style={styles.deleteButtonText}>
              מחיקה
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            onAddToCart?.(product)
          }
        >
          <Text style={styles.addButtonText}>
            הוספה לסל
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
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

  details: {
    alignItems: 'flex-end',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#30123B',
    textAlign: 'right',
  },

  description: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    textAlign: 'right',
  },

  price: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#542163',
  },

  addButton: {
    marginTop: 14,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#542163',
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.8,
  },

  ownerActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  ownerButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
  },

  editButton: {
    backgroundColor: '#EFE4F2',
  },

  deleteButton: {
    backgroundColor: '#FBE6EA',
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#542163',
  },

  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A02E49',
  },
});