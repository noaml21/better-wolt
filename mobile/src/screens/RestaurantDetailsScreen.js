import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, space, useTheme } from '../theme';
import { deleteProduct, deleteRestaurant, getRestaurantById } from '../services/api';
import { dishCount, getLine, getRestaurantMeta, lineColours } from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  LineBadge,
  Media,
  Screen,
  Skeleton,
  formatPrice,
  useToast,
} from '../ui';
import CartBar, { CART_BAR_SPACE } from '../components/CartBar';
import DishRow from '../components/DishRow';

/* One restaurant as a line (V5 spec §6, §11): the food, the line block
   with its facts, the menu as a route, and — for the owner — the same
   route with edit controls, so it is managed where it is read. */

export default function RestaurantDetailsScreen({ navigation, route }) {
  const styles = useStyles();
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const cart = useCart();

  const restaurantId = route.params?.restaurantId;
  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [failedImage, setFailedImage] = useState(null);
  const [menuQuery, setMenuQuery] = useState('');
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
  /* Finding one dish in a long menu (V4 audit A3): the API has no
     categories, so the menu can be narrowed by what is typed instead.
     Same threshold and matching as the web client. */
  const filterable = products.length > 8;
  const term = menuQuery.trim().toLowerCase();
  const shownProducts =
    filterable && term
      ? products.filter((product) => `${product.name} ${product.description || ''}`.toLowerCase().includes(term))
      : products;

  const [lineFill, lineText] = lineColours(getLine(restaurant), theme);
  const eta = `\u2066${meta.eta.replace('-', '–')}\u2069`;
  const blockFill = isOwner ? colors.panel : lineFill;
  const blockText = isOwner ? colors.ink : lineText;

  const header = (
    <View>
      {/* The food leads, full-bleed; the name never sits on it (V5 spec
          §6). Without a photo the line block is the whole header. */}
      {hasPhoto ? (
        <View style={styles.hero}>
          <Media uri={restaurant.image} style={styles.heroImage} onFail={setFailedImage} />
        </View>
      ) : null}
      <View style={[styles.heroBack, { top: insets.top + 8 }]}>
        <IconButton icon="forward" label="חזרה" variant="outline" onPress={navigation.goBack} style={styles.heroBackButton} />
      </View>

      <View style={[styles.block, { backgroundColor: blockFill }, !hasPhoto && { paddingTop: insets.top + 64 }]}>
        <LineBadge restaurant={restaurant} size={56} outline={isOwner ? colors.ink : lineText} />
        <Text style={[styles.name, { color: blockText }]} accessibilityRole="header">
          {restaurant.name}
        </Text>
        <View style={styles.facts}>
          <View style={styles.fact}>
            <Text style={[styles.factLabel, { color: blockText }]}>זמן משלוח</Text>
            <Text style={[styles.factValue, { color: blockText }]}>{eta} דק׳</Text>
          </View>
          <View style={styles.fact}>
            <Text style={[styles.factLabel, { color: blockText }]}>משלוח</Text>
            <Text style={[styles.factValue, { color: blockText }]}>
              {meta.isFreeDelivery ? 'חינם' : formatPrice(meta.deliveryFee)}
            </Text>
          </View>
          <View style={styles.fact}>
            <Text style={[styles.factLabel, { color: blockText }]}>דירוג</Text>
            <Text style={[styles.factValue, { color: blockText }]}>{meta.rating}</Text>
          </View>
          {restaurant.address ? (
            <View style={styles.fact}>
              <Text style={[styles.factLabel, { color: blockText }]}>כתובת</Text>
              <Text style={[styles.factValue, { color: blockText }]}>{`\u2068${restaurant.address}\u2069`}</Text>
            </View>
          ) : null}
          {restaurant.phone ? (
            <View style={styles.fact}>
              <Text style={[styles.factLabel, { color: blockText }]}>טלפון</Text>
              <Text style={[styles.factValue, { color: blockText }]}>{`\u2066${restaurant.phone}\u2069`}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {isOwner ? (
        <View style={styles.owner}>
          <Text style={styles.ownerTitle}>ניהול המסעדה</Text>

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
            <Button size="sm" variant="ghost" icon="trash" onPress={removeRestaurant}>
              סגירת המסעדה
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

      {filterable ? (
        <View style={styles.filter}>
          <Icon name="search" size={18} color={colors.ink} />
          <TextInput
            value={menuQuery}
            onChangeText={setMenuQuery}
            placeholder="חיפוש בתפריט"
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel="חיפוש בתפריט"
            returnKeyType="search"
            style={styles.filterInput}
          />
          {menuQuery ? (
            <IconButton icon="close" label="ניקוי החיפוש" size={16} onPress={() => setMenuQuery('')} />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen topInset={false}>
      <FlatList
        data={shownProducts}
        keyExtractor={(product) => String(product.id)}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          products.length > 0 ? (
            <EmptyState
              icon="search"
              title={`אין בתפריט מנה שמתאימה ל"${menuQuery.trim()}"`}
              description="נסו מילה אחרת, או חזרו לתפריט המלא."
              actionLabel="לתפריט המלא"
              onAction={() => setMenuQuery('')}
            />
          ) : (
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
          )
        }
        renderItem={({ item, index }) => (
          <DishRow
            first={index === 0}
            last={index === shownProducts.length - 1}
            product={item}
            quantity={cart.restaurantId === String(restaurant.id) ? cart.quantities[item.id] || 0 : 0}
            onAdd={addToCart}
            onRemove={(product) => cart.decreaseItem(product.id)}
            isOwner={isOwner}
            onEdit={(product) =>
              navigation.navigate('ProductForm', { restaurantId: restaurant.id, product })
            }
            onDelete={removeProduct}
            line={[lineFill, lineText]}
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
          line={[lineFill, lineText]}
          itemsCount={cart.itemsCount}
          subtotal={cart.subtotal}
          onPress={() => navigation.navigate('Tabs', { screen: 'Cart' }, { pop: true })}
        />
      ) : null}
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, type, font }) => ({
  list: { paddingHorizontal: space[4] },
  heroSkeleton: { marginBottom: space[5] },
  skeletonBody: { gap: space[4], paddingHorizontal: space[4] },
  backRow: { ...rtl.row, paddingHorizontal: space[4] },

  hero: {
    aspectRatio: 16 / 9,
    marginHorizontal: -space[4],
    backgroundColor: colors.hairline,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroBack: { position: 'absolute', right: 0, zIndex: 2 },
  heroBackButton: { backgroundColor: colors.panel },

  block: {
    gap: space[3],
    marginHorizontal: -space[4],
    paddingHorizontal: space[4],
    paddingTop: space[5],
    paddingBottom: space[5],
    alignItems: 'flex-end',
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
  },
  name: { fontFamily: font.display, fontSize: 60, lineHeight: 56, paddingTop: 8, ...rtl.text, alignSelf: 'stretch' },
  facts: { ...rtl.row, flexWrap: 'wrap', gap: space[3], columnGap: space[5] },
  fact: { alignItems: 'flex-end' },
  factLabel: { ...type.caption, fontWeight: '700' },
  factValue: { ...type.bodyL, ...type.num, fontWeight: '800' },

  owner: {
    gap: space[3],
    marginTop: space[5],
    padding: space[4],
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  ownerTitle: { fontFamily: font.display, fontSize: 34, lineHeight: 34, paddingTop: 5, ...rtl.text, color: colors.ink },
  ownerActions: { ...rtl.row, flexWrap: 'wrap', gap: space[2] },

  filter: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[2],
    minHeight: 48,
    marginBottom: space[2],
    paddingHorizontal: space[4],
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.panel,
  },
  filterInput: { ...type.body, ...rtl.text, fontWeight: '600', flex: 1, minHeight: 44, color: colors.ink },
  menuHeader: {
    ...rtl.row,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space[3],
    marginTop: space[6],
    marginBottom: space[3],
    paddingBottom: space[2],
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
  },
  menuText: { flex: 1, gap: 2 },
  menuTitle: { fontFamily: font.display, fontSize: 44, lineHeight: 44, paddingTop: 6, ...rtl.text, color: colors.ink },
  menuCount: { ...type.caption, ...rtl.text, fontWeight: '700', color: colors.inkMuted },
}));
