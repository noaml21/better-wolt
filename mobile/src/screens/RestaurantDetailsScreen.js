import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
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

import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import {
  deleteProduct,
  deleteRestaurant,
  getRestaurantById,
} from '../services/api';

export default function RestaurantDetailsScreen({
  route,
  navigation,
}) {
  const restaurantId =
    route?.params?.restaurantId;

  const { user, token } = useAuth();

  const {
    addToCart,
    itemsCount,
  } = useCart();

  const [restaurant, setRestaurant] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadRestaurant = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        if (!restaurantId) {
          throw new Error(
            'Restaurant ID is missing'
          );
        }

        const result =
          await getRestaurantById(
            restaurantId
          );

        if (!result || !result.id) {
          throw new Error(
            'Restaurant not found'
          );
        }

        setRestaurant(result);
      } catch (err) {
        console.error(
          'Failed to load restaurant:',
          err
        );

        setError(
          err.message ||
            'לא הצלחנו לטעון את המסעדה.'
        );
      } finally {
        setLoading(false);
      }
    },
    [restaurantId]
  );

  useFocusEffect(
    useCallback(() => {
      loadRestaurant();
    }, [loadRestaurant])
  );

  function getOwnerUsername(restaurant) {
  if (!restaurant) {
    return null;
  }

  if (restaurant.username) {
    return restaurant.username;
  }

  if (restaurant.ownerUsername) {
    return restaurant.ownerUsername;
  }

  if (typeof restaurant.owner === 'string') {
    return restaurant.owner;
  }

  if (restaurant.owner?.username) {
    return restaurant.owner.username;
  }

  if (restaurant.user?.username) {
    return restaurant.user.username;
  }

  return null;
}

  const ownerUsername = getOwnerUsername(restaurant);

  const isOwner =
    user?.role === 'restaurant' &&
    user?.username &&
    ownerUsername &&
    user.username === ownerUsername;

  const handleAddToCart = (product) => {
    const added = addToCart(
      product,
      restaurant
    );

    if (!added) {
      Alert.alert(
        'לא ניתן להוסיף לסל',
        'הסל מכיל פריטים ממסעדה אחרת. יש לנקות אותו לפני הוספת פריטים ממסעדה חדשה.'
      );

      return;
    }

    Alert.alert(
      'נוסף לסל',
      `${product.name} נוסף לסל.`
    );
  };

  const openCart = () => {
    navigation?.navigate('Cart');
  };

  const openRestaurantEdit = () => {
    navigation?.navigate(
      'RestaurantForm',
      {
        restaurant,
      }
    );
  };

  const openCreateProduct = () => {
    navigation?.navigate(
      'ProductForm',
      {
        restaurantId: restaurant.id,
      }
    );
  };

  const openProductEdit = (product) => {
    navigation?.navigate(
      'ProductForm',
      {
        restaurantId: restaurant.id,
        product,
      }
    );
  };

  const handleDeleteRestaurant = () => {
    Alert.alert(
      'מחיקת מסעדה',
      'האם את בטוחה שברצונך למחוק את המסעדה?',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחיקה',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(
                token,
                restaurant.id
              );

              Alert.alert(
                'המסעדה נמחקה',
                'המסעדה נמחקה בהצלחה.'
              );

              navigation?.navigate('Home');
            } catch (err) {
              console.error(
                'Failed to delete restaurant:',
                err
              );

              Alert.alert(
                'המחיקה נכשלה',
                err.message ||
                  'לא הצלחנו למחוק את המסעדה.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteProduct = (
    product
  ) => {
    Alert.alert(
      'מחיקת מנה',
      `האם למחוק את ${product.name}?`,
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'מחיקה',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(
                token,
                restaurant.id,
                product.id
              );

              Alert.alert(
                'המנה נמחקה',
                'המנה הוסרה מהתפריט.'
              );

              await loadRestaurant();
            } catch (err) {
              console.error(
                'Failed to delete product:',
                err
              );

              Alert.alert(
                'המחיקה נכשלה',
                err.message ||
                  'לא הצלחנו למחוק את המנה.'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" />

        <Text style={styles.message}>
          טוען מסעדה...
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
          לא ניתן לטעון את המסעדה
        </Text>

        <Text style={styles.message}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadRestaurant}
        >
          <Text style={styles.retryText}>
            נסי שוב
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const products = Array.isArray(
    restaurant?.products
  )
    ? restaurant.products
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isOwner={isOwner}
            onAddToCart={
              handleAddToCart
            }
            onEdit={openProductEdit}
            onDelete={
              handleDeleteProduct
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          products.length === 0 &&
            styles.emptyList,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {restaurant.image ? (
              <Image
                source={{
                  uri: restaurant?.image,
                }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View
                style={
                  styles.imagePlaceholder
                }
              >
                <Text
                  style={
                    styles.placeholderText
                  }
                >
                  אין תמונה זמינה
                </Text>
              </View>
            )}

            <View
              style={styles.restaurantInfo}
            >
              <Text
                style={
                  styles.restaurantName
                }
              >
                {restaurant.name}
              </Text>

              {restaurant.address ? (
                <Text
                  style={
                    styles.restaurantDetail
                  }
                >
                  {restaurant.address}
                </Text>
              ) : null}

              {restaurant.phone ? (
                <Text
                  style={
                    styles.restaurantDetail
                  }
                >
                  {restaurant.phone}
                </Text>
              ) : null}
            </View>

            {isOwner ? (
              <View
                style={styles.ownerActions}
              >
                <Pressable
                  style={styles.editButton}
                  onPress={
                    openRestaurantEdit
                  }
                >
                  <Text
                    style={
                      styles.editButtonText
                    }
                  >
                    עריכת מסעדה
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.deleteButton
                  }
                  onPress={
                    handleDeleteRestaurant
                  }
                >
                  <Text
                    style={
                      styles.deleteButtonText
                    }
                  >
                    מחיקת מסעדה
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    styles.addProductButton
                  }
                  onPress={
                    openCreateProduct
                  }
                >
                  <Text
                    style={
                      styles.addProductText
                    }
                  >
                    הוספת מנה
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.cartButton}
                onPress={openCart}
              >
                <Text
                  style={
                    styles.cartButtonText
                  }
                >
                  מעבר לסל ({itemsCount})
                </Text>
              </Pressable>
            )}

            <Text style={styles.menuTitle}>
              תפריט
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
          >
            <Text style={styles.emptyTitle}>
              אין מנות במסעדה
            </Text>

            <Text style={styles.message}>
              המסעדה עדיין לא הוסיפה מנות
              לתפריט.
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
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
  },

  header: {
    marginBottom: 18,
  },

  image: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  imagePlaceholder: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#E7E2EA',
  },

  placeholderText: {
    fontSize: 14,
    color: '#777777',
  },

  restaurantInfo: {
    paddingTop: 20,
    alignItems: 'flex-end',
  },

  restaurantName: {
    fontSize: 28,
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

  cartButton: {
    marginTop: 18,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  cartButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  ownerActions: {
    marginTop: 18,
  },

  editButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#EFE4F2',
  },

  editButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#542163',
  },

  deleteButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FBE6EA',
  },

  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A02E49',
  },

  addProductButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  addProductText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  menuTitle: {
    marginTop: 25,
    fontSize: 23,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
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
    textAlign: 'center',
    color: '#666666',
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#351440',
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