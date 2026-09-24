import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, space, useTheme } from '../theme';
import { deleteProduct, deleteRestaurant, getRestaurantById } from '../services/api';
import { dishCount, getRestaurantMeta } from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Media,
  MetaItem,
  Plate,
  Rating,
  Screen,
  Scrim,
  Skeleton,
  useToast,
} from '../ui';
import CartBar, { CART_BAR_SPACE } from '../components/CartBar';
import DishRow from '../components/DishRow';

/* One restaurant: the photo, the facts, the menu, and — for the owner —
   the same menu with edit controls, so it is managed where it is read. */

export default function RestaurantDetailsScreen({ navigation, route }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const cart = useCart();

  const restaurantId = route.params?.restaurantId;
  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [failedImage, setFailedImage] = useState(null);
  const shown = useRef(false);

  /* A silent load keeps what is on screen: a failed re-read leaves the
     menu as it was instead of replacing it with the error state. */
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setStatus('loading');
      }

      try {
        setRestaurant(await getRestaurantById(restaurantId));
        setStatus('ready');
        shown.current = true;
      } catch (error) {
        if (silent && error.status !== 404) {
          return;
        }

        setStatus(error.status === 404 ? 'missing' : 'error');
      }
    },
    [restaurantId]
  );

  /* Coming back from a dish form should show the change, so the menu is
     re-read on focus — quietly once it has been shown, so the list is not
     swapped for a skeleton and the owner keeps their place in it. */
  useFocusEffect(
    useCallback(() => {
      load({ silent: shown.current });
    }, [load])
  );

  const isOwner = Boolean(user?.username) && user.username === restaurant?.username;
  const products = restaurant?.products || [];
  const cartHasOtherRestaurant = cart.itemsCount > 0 && cart.restaurantId !== String(restaurantId);

  const addToCart = (product) => {
    if (cartHasOtherRestaurant) {
      Alert.alert(
        'להתחיל סל חדש?',
        `בסל יש כבר מנות מ${cart.restaurant?.name}. הוספת מנה מכאן תחליף אותן.`,
        [
          { text: 'ביטול', style: 'cancel' },
          {
            text: 'סל חדש',
            style: 'destructive',
            onPress: () => {
              cart.addItem(product, restaurant);
              showToast(`${product.name} נוספה לסל`);
            },
          },
        ]
      );

      return;
    }

    cart.addItem(product, restaurant);
  };

  const removeRestaurant = () => {
    Alert.alert(
      `לסגור את ${restaurant.name}?`,
      'המסעדה והתפריט שלה יימחקו. אי אפשר לבטל את הפעולה.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'סגירת המסעדה',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(token, restaurant.id);
              showToast('המסעדה נסגרה');
              navigation.navigate('Tabs', { screen: 'Home' }, { pop: true });
            } catch (error) {
              // Closed already, on another device: what was asked for.
              if (error.status === 404) {
                showToast('המסעדה כבר נסגרה');
                navigation.navigate('Tabs', { screen: 'Home' }, { pop: true });
                return;
              }

              showToast(error.message, { tone: 'error' });
            }
          },
        },
      ]
    );
  };

  const removeProduct = (product) => {
    Alert.alert(`למחוק את ${product.name}?`, 'המנה תוסר מהתפריט. הזמנות קודמות לא משתנות.', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחיקה',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(token, restaurant.id, product.id);
            await load({ silent: true });
            showToast(`${product.name} הוסרה מהתפריט`);
          } catch (error) {
            // Gone already: the menu on screen is what is stale.
            if (error.status === 404) {
              await load({ silent: true });
              showToast(`${product.name} כבר לא בתפריט`);
              return;
            }

            showToast(error.message, { tone: 'error' });
          }
        },
      },
    ]);
  };

  if (status === 'loading') {
    return (
      <Screen topInset={false}>
        <Skeleton height={230} radius="lg" style={styles.heroSkeleton} />

        <View style={styles.skeletonBody}>
          <Skeleton width="55%" height={26} />
          <Skeleton width="80%" height={14} />
          <Skeleton height={76} radius="md" />
          <Skeleton height={76} radius="md" />
        </View>
      </Screen>
    );
  }

  if (status !== 'ready') {
    return (
      <Screen>
        <View style={styles.backRow}>
          <IconButton icon="forward" label="חזרה" variant="outline" onPress={navigation.goBack} />
        </View>

        {status === 'missing' ? (
          <EmptyState
            icon="store"
            title="המסעדה הזו לא נמצאה"
            description="ייתכן שהיא נסגרה או שהקישור שגוי."
            actionLabel="לכל המסעדות"
            onAction={() => navigation.navigate('Tabs', { screen: 'Home' }, { pop: true })}
          />
        ) : (
          <ErrorState description="לא הצלחנו להביא את פרטי המסעדה." onRetry={() => load()} />
        )}
      </Screen>
    );
  }

  const meta = getRestaurantMeta(restaurant);
  const showCartBar = !isOwner && cart.itemsCount > 0 && cart.restaurantId === String(restaurant.id);

  const hasPhoto = Boolean(restaurant.image) && failedImage !== restaurant.image;

  const header = (
    <View>
      {/* The name is set on the food, over a scrim; without a photo the
          plate's tint takes the frame and the name sits on it in ink
          (V4 spec §4.4). */}
      <View style={styles.hero}>
        <Media
          uri={restaurant.image}
          style={styles.heroImage}
          onFail={setFailedImage}
          fallback={<Plate restaurant={restaurant} showWord={false} />}
        />
        {hasPhoto ? <Scrim id="restaurant-hero" /> : null}

        <Text style={[styles.heroName, !hasPhoto && styles.heroNamePlate]} accessibilityRole="header">
          {restaurant.name}
        </Text>

        <View style={[styles.heroBack, { top: insets.top + 8 }]}>
          <IconButton icon="forward" label="חזרה" variant="outline" onPress={navigation.goBack} />
        </View>
      </View>

      <View style={styles.facts}>
        <View style={styles.factsRow}>
          <Rating value={meta.rating} />
          <MetaItem icon="clock">{meta.eta} דק׳</MetaItem>
          <MetaItem icon="scooter" tone={meta.isFreeDelivery ? 'herb' : undefined}>
            {meta.deliveryLabel}
          </MetaItem>
        </View>
        {restaurant.address ? <MetaItem icon="location">{restaurant.address}</MetaItem> : null}
        {restaurant.phone ? <MetaItem icon="phone">{restaurant.phone}</MetaItem> : null}
      </View>

      {isOwner ? (
        <View style={styles.owner}>
          <View style={styles.ownerLabel}>
            <Icon name="store" size={18} color={colors.ink} />
            <Text style={styles.ownerTitle}>ניהול המסעדה</Text>
          </View>

          <View style={styles.ownerActions}>
            <Button
              size="sm"
              icon="plus"
              onPress={() => navigation.navigate('ProductForm', { restaurantId: restaurant.id })}
            >
              הוספת מנה
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon="edit"
              onPress={() => navigation.navigate('RestaurantForm', { restaurant })}
            >
              עריכת פרטים
            </Button>
            <Button size="sm" variant="danger" icon="trash" onPress={removeRestaurant}>
              סגירה
            </Button>
          </View>
        </View>
      ) : null}

      <View style={styles.menuHeader}>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>התפריט</Text>
          {products.length ? <Text style={styles.menuCount}>{dishCount(products.length)}</Text> : null}
        </View>
      </View>
    </View>
  );

  return (
    <Screen topInset={false}>
      <FlatList
        data={products}
        keyExtractor={(product) => String(product.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="bag"
            title="התפריט עוד ריק"
            description={
              isOwner
                ? 'הוסיפו את המנה הראשונה והיא תופיע כאן ללקוחות.'
                : 'המסעדה עוד לא פרסמה מנות. שווה לבדוק שוב מאוחר יותר.'
            }
            actionLabel={isOwner ? 'הוספת מנה' : undefined}
            onAction={() => navigation.navigate('ProductForm', { restaurantId: restaurant.id })}
          />
        }
        renderItem={({ item, index }) => (
          <DishRow
            first={index === 0}
            last={index === products.length - 1}
            product={item}
            quantity={cart.restaurantId === String(restaurant.id) ? cart.quantities[item.id] || 0 : 0}
            onAdd={addToCart}
            onRemove={(product) => cart.decreaseItem(product.id)}
            isOwner={isOwner}
            onEdit={(product) =>
              navigation.navigate('ProductForm', { restaurantId: restaurant.id, product })
            }
            onDelete={removeProduct}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (showCartBar ? CART_BAR_SPACE : space[4]) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {showCartBar ? (
        <CartBar
          itemsCount={cart.itemsCount}
          subtotal={cart.subtotal}
          onPress={() => navigation.navigate('Tabs', { screen: 'Cart' }, { pop: true })}
        />
      ) : null}
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  list: { paddingHorizontal: space[4] },
  heroSkeleton: { marginBottom: space[5] },
  skeletonBody: { gap: space[4], paddingHorizontal: space[4] },
  backRow: { ...rtl.row, paddingHorizontal: space[4] },

  hero: {
    height: 250,
    marginHorizontal: -space[4],
    backgroundColor: colors.sunken,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroName: {
    ...type.h1,
    ...rtl.text,
    position: 'absolute',
    right: space[4],
    left: space[4],
    bottom: space[4],
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroNamePlate: { color: colors.ink, fontSize: 36, lineHeight: 42 },
  heroBack: { position: 'absolute', right: space[4] },

  facts: { gap: space[2], marginTop: space[4], alignItems: 'flex-end' },
  factsRow: { ...rtl.row, flexWrap: 'wrap', alignItems: 'center', gap: space[4] },

  owner: {
    gap: space[3],
    marginTop: space[5],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  ownerLabel: { ...rtl.row, alignItems: 'center', gap: space[2] },
  ownerTitle: { ...type.bodyL, fontWeight: '700', color: colors.ink },
  ownerActions: { ...rtl.row, flexWrap: 'wrap', gap: space[2] },

  menuHeader: {
    ...rtl.row,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space[3],
    marginTop: space[7],
    marginBottom: space[4],
  },
  menuText: { flex: 1, gap: 2 },
  menuTitle: { ...type.h2, ...rtl.text, color: colors.ink },
  menuCount: { ...type.caption, ...rtl.text, color: colors.inkMuted },

}));
