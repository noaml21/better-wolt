import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function RestaurantCard({ restaurant, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {restaurant.image ? (
        <Image
          source={{ uri: restaurant.image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>
            No image available
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>

        {restaurant.address ? (
          <Text style={styles.details} numberOfLines={1}>
            {restaurant.address}
          </Text>
        ) : null}

        {restaurant.phone ? (
          <Text style={styles.details}>
            {restaurant.phone}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  pressed: {
    opacity: 0.8,
  },

  image: {
    width: '100%',
    height: 180,
  },

  imagePlaceholder: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7E2EA',
  },

  placeholderText: {
    fontSize: 14,
    color: '#777777',
  },

  content: {
    padding: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#30123B',
    textAlign: 'right',
  },

  details: {
    marginTop: 7,
    fontSize: 15,
    color: '#666666',
    textAlign: 'right',
  },
});