import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, space, useTheme } from '../theme';
import { getWorldCupRestaurant } from '../services/api';
import { teamByDish } from '../services/worldCup';
import { dishCount } from '../services/presentation';
import { useCart } from '../context/CartContext';
import CartBar, { CART_BAR_SPACE } from '../components/CartBar';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  QuantityStepper,
  Screen,
  Skeleton,
  Tag,
  formatPrice,
  useToast,
} from '../ui';

/* The campaign, as a screen of its own.

   The restaurant and the dish names come from the server and are
   contract (ARCHITECTURE §6); the flags are presentation, matched by
   dish name, and a dish the seed adds later still shows without one.
   Ordering goes through the same cart as everywhere else — V2 ordered
   with one tap straight past it.

   There is no music here. The web client plays the campaign track on
   request; shipping an audio engine and a 3.7 MB file inside the app to
   match it is not worth it (V3_DESIGN_SPEC §8). */

export default function WorldCupScreen({ navigation }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const cart = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading');
    }

    try {
      const data = await getWorldCupRestaurant();

      setRestaurant(data);
      setStatus(data ? 'ready' : 'missing');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load({ silent: Boolean(restaurant) });
    }, [load]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const products = restaurant?.products || [];

  /* The flat price is whatever the seed priced the dishes at, read back
     from the server rather than written here. */
  const flatPrice = useMemo(() => {
    const prices = new Set(products.map((product) => Number(product.price)));

    return prices.size === 1 ? [...prices][0] : null;
  }, [products]);

  const isCampaignCart = cart.restaurantId === String(restaurant?.id);
  const cartHasOtherRestaurant = cart.itemsCount > 0 && !isCampaignCart;

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

  if (status === 'loading') {
    return (
      <Screen>
        <View style={styles.skeleton}>
          <Skeleton height={170} radius="lg" />
          <Skeleton height={72} radius="md" />
          <Skeleton height={72} radius="md" />
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
            icon="trophy"
            title="חגיגת המונדיאל לא זמינה כרגע"
            description="הקולקציה מגיעה מהשרת, והוא לא מחזיק אותה עכשיו."
            actionLabel="לכל המסעדות"
            onAction={() => navigation.navigate('Tabs', { screen: 'Home' })}
          />
        ) : (
          <ErrorState description="לא הצלחנו להביא את הקולקציה." onRetry={load} />
        )}
      </Screen>
    );
  }

  const showCartBar = isCampaignCart && cart.itemsCount > 0;

  const header = (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <IconButton
          icon="forward"
          label="חזרה"
          variant="onNight"
          onPress={navigation.goBack}
          style={styles.heroBack}
        />
        <View style={styles.trophy}>
          <Icon name="trophy" size={24} color={colors.onAmber} />
        </View>
      </View>

      <Text style={styles.eyebrow}>קולקציה מיוחדת</Text>
      <Text style={styles.title}>{restaurant.name}</Text>
      <Text style={styles.lead}>
        מנה אחת מכל נבחרת
        {flatPrice !== null ? `, במחיר אחיד של ${formatPrice(flatPrice)}` : ''}. מזמינים כמו מכל
        מסעדה אחרת.
      </Text>
      <Text style={styles.count}>{dishCount(products.length)}</Text>
    </View>
  );

  return (
    <Screen topInset={false}>
      <FlatList
        data={products}
        keyExtractor={(product) => String(product.id)}
        ListHeaderComponent={header}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (showCartBar ? CART_BAR_SPACE : space[4]) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const team = teamByDish.get(item.name);
          const quantity = isCampaignCart ? cart.quantities[item.id] || 0 : 0;

          return (
            <View style={styles.dish}>
              <View style={styles.flag}>
                {team ? (
                  <Image source={{ uri: team.flag }} style={styles.flagImage} resizeMode="cover" />
                ) : (
                  <Icon name="trophy" size={20} color={colors.inkMuted} />
                )}
              </View>

              <View style={styles.dishText}>
                {team ? <Text style={styles.team}>{team.team}</Text> : null}
                <Text style={styles.dishName}>{item.name}</Text>
                <Tag style={styles.price}>{formatPrice(item.price)}</Tag>
              </View>

              <View style={styles.dishAction}>
                {quantity > 0 ? (
                  <QuantityStepper
                    value={quantity}
                    label={item.name}
                    onDecrease={() => cart.decreaseItem(item.id)}
                    onIncrease={() => addToCart(item)}
                  />
                ) : (
                  <Button size="sm" icon="plus" onPress={() => addToCart(item)}>
                    הוספה
                  </Button>
                )}
              </View>
            </View>
          );
        }}
      />

      {showCartBar ? (
        <CartBar
          itemsCount={cart.itemsCount}
          subtotal={cart.subtotal}
          onPress={() => navigation.navigate('Tabs', { screen: 'Cart' })}
        />
      ) : null}
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type, shadow }) => ({
  skeleton: { gap: space[4], padding: space[4] },
  backRow: { ...rtl.row, paddingHorizontal: space[4] },
  list: { paddingHorizontal: space[4] },

  hero: {
    gap: space[2],
    marginHorizontal: -space[4],
    marginBottom: space[5],
    paddingHorizontal: space[4],
    paddingTop: space[9],
    paddingBottom: space[6],
    backgroundColor: colors.night,
  },
  heroTop: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between' },
  heroBack: { marginStart: -space[2] },
  trophy: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber,
  },
  eyebrow: { ...type.micro, ...rtl.text, marginTop: space[3], color: colors.amber, letterSpacing: 0.4 },
  title: { ...type.h1, ...rtl.text, color: colors.onNight },
  lead: { ...type.body, ...rtl.text, color: colors.onNight, opacity: 0.78 },
  count: { ...type.caption, ...rtl.text, color: colors.onNight, opacity: 0.6 },

  dish: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    marginBottom: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    ...shadow.e1,
  },
  /* A flag keeps its own 3:2 proportion; cropping it to a square
     mangles the ones with vertical bands. */
  flag: {
    width: 52,
    height: 35,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sunken,
    overflow: 'hidden',
  },
  flagImage: { width: '100%', height: '100%' },
  dishText: { flex: 1, gap: 2, alignItems: 'flex-end' },
  team: { ...type.micro, ...rtl.text, color: colors.inkMuted },
  dishName: { ...type.h3, ...rtl.text, color: colors.ink },
  price: { marginTop: space[1] },
  dishAction: {},

}));
