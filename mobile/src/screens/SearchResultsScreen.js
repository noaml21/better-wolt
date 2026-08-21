import React, { useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import RestaurantCard from '../components/RestaurantCard';
import { searchRestaurants } from '../services/api';

export default function SearchResultsScreen({
  navigation,
}) {
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] = useState('');

  const performSearch = async () => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setRestaurants([]);
      setSearched(false);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);

      const result =
        await searchRestaurants(
          normalizedQuery
        );

      if (!Array.isArray(result)) {
        throw new Error(
          'The server returned an invalid search response'
        );
      }

      setRestaurants(result);
    } catch (err) {
      console.error(
        'Search failed:',
        err
      );

      setRestaurants([]);

      setError(
        err.message ||
          'לא הצלחנו לבצע את החיפוש.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openRestaurant = (restaurant) => {
    if (!restaurant?.id) {
      setError(
        'למסעדה שנבחרה אין מזהה תקין.'
      );

      return;
    }

    navigation?.navigate(
      'RestaurantDetails',
      {
        restaurantId: restaurant.id,
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.title}>
          חיפוש
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="חפשי מסעדה או מנה"
          returnKeyType="search"
          onSubmitEditing={performSearch}
          style={styles.input}
          textAlign="right"
        />

        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed &&
              styles.searchButtonPressed,
          ]}
          onPress={performSearch}
        >
          <Text style={styles.searchButtonText}>
            חיפוש
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.message}>
            מחפש...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>
            החיפוש נכשל
          </Text>

          <Text style={styles.message}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={performSearch}
          >
            <Text style={styles.retryText}>
              נסי שוב
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() =>
                openRestaurant(item)
              }
            />
          )}
          contentContainerStyle={[
            styles.list,
            searched &&
              restaurants.length === 0 &&
              styles.emptyList,
          ]}
          showsVerticalScrollIndicator={
            false
          }
          ListEmptyComponent={
            searched ? (
              <View
                style={styles.emptyContainer}
              >
                <Text
                  style={styles.emptyTitle}
                >
                  לא נמצאו תוצאות
                </Text>

                <Text style={styles.message}>
                  נסי לחפש מסעדה, כתובת או
                  שם של מנה אחרת.
                </Text>
              </View>
            ) : (
              <View
                style={styles.emptyContainer}
              >
                <Text
                  style={styles.emptyTitle}
                >
                  התחילי לחפש
                </Text>

                <Text style={styles.message}>
                  הזיני טקסט בשדה החיפוש.
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4FA',
  },

  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },

  title: {
    marginBottom: 15,
    fontSize: 30,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  input: {
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D9CEDD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#351440',
  },

  searchButton: {
    marginTop: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  searchButtonPressed: {
    opacity: 0.8,
  },

  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
    color: '#351440',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  retryText: {
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