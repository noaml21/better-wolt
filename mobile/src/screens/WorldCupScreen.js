import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getWorldCupRestaurant,
} from '../services/api';

export default function WorldCupScreen({
  navigation,
}) {
  const [restaurant, setRestaurant] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadWorldCupRestaurant =
    useCallback(async () => {
      try {
        setLoading(true);
        setError('');

        const result =
          await getWorldCupRestaurant();

        setRestaurant(result);
      } catch (err) {
        console.error(
          'Failed to load World Cup restaurant:',
          err
        );

        setError(
          err.message ||
            'לא הצלחנו לטעון את מסעדת המונדיאל.'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorldCupRestaurant();
    }, [loadWorldCupRestaurant])
  );

  const openRestaurant = () => {
    if (!restaurant?.id) {
      return;
    }

    navigation?.navigate(
      'RestaurantDetails',
      {
        restaurantId: restaurant.id,
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" />

        <Text style={styles.message}>
          טוען את חגיגת המונדיאל...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <Text style={styles.errorTitle}>
          משהו השתבש
        </Text>

        <Text style={styles.message}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={
            loadWorldCupRestaurant
          }
        >
          <Text style={styles.retryText}>
            נסי שוב
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <Text style={styles.errorTitle}>
          מסעדת המונדיאל לא נמצאה
        </Text>

        <Text style={styles.message}>
          מסעדת ״חגיגת מונדיאל״ עדיין לא
          קיימת בשרת.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={
            loadWorldCupRestaurant
          }
        >
          <Text style={styles.retryText}>
            בדיקה מחדש
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.badge}>
          WORLD CUP
        </Text>

        <Text style={styles.title}>
          חגיגת מונדיאל
        </Text>

        <Text style={styles.subtitle}>
          מנות מיוחדות לצפייה במשחקים
        </Text>

        {restaurant.image ? (
          <Image
            source={{
              uri: restaurant.image,
            }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text
              style={styles.placeholderText}
            >
              ⚽
            </Text>

            <Text
              style={
                styles.placeholderLabel
              }
            >
              חגיגת המונדיאל
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text
            style={styles.restaurantName}
          >
            {restaurant.name}
          </Text>

          {restaurant.address ? (
            <Text
              style={styles.restaurantDetail}
            >
              {restaurant.address}
            </Text>
          ) : null}

          {restaurant.phone ? (
            <Text
              style={styles.restaurantDetail}
            >
              {restaurant.phone}
            </Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.orderButton,
              pressed &&
                styles.pressedButton,
            ]}
            onPress={openRestaurant}
          >
            <Text
              style={styles.orderButtonText}
            >
              צפייה בתפריט והזמנה
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4FA',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#542163',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    marginTop: 16,
    fontSize: 31,
    fontWeight: '900',
    color: '#351440',
    textAlign: 'right',
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 16,
    color: '#666666',
    textAlign: 'right',
  },

  image: {
    width: '100%',
    height: 230,
    borderRadius: 20,
  },

  placeholder: {
    width: '100%',
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#E7E2EA',
  },

  placeholderText: {
    fontSize: 65,
  },

  placeholderLabel: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '800',
    color: '#351440',
  },

  card: {
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },

  restaurantName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  restaurantDetail: {
    marginTop: 7,
    fontSize: 15,
    color: '#666666',
    textAlign: 'right',
  },

  orderButton: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  pressedButton: {
    opacity: 0.8,
  },

  orderButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F4FA',
  },

  message: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 22,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});