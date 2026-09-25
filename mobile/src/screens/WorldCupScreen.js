import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, space, useTheme } from '../theme';
import { getWorldCupRestaurant } from '../services/api';
import { teamByDish } from '../services/worldCup';
import { dishCount } from '../services/presentation';
import { useCart } from '../context/CartContext';
import CartBar, { CART_BAR_SPACE } from '../components/CartBar';
import {
  AddButton,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  Media,
  QuantityStepper,
  Screen,
  Skeleton,
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

/* The flags come from a CDN, so one of them not arriving is a state this
   screen has to have: the row keeps its shape and falls back to the
   campaign's own mark rather than showing an empty grey box. The web
   client does the same (pages/WorldCupPage.jsx). */
function Flag({ team }) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.flag}>
      <Media
        uri={team?.flag}
        style={styles.flagImage}
        fallback={<Icon name="trophy" size={20} color={colors.inkMuted} />}
      />
    </View>
  );
}

export default function WorldCupScreen({ navigation }) {
  const styles = useStyles();
  const theme = useTheme();
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
    } catch {
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load({ silent: Boolean(restaurant) });
    }, [load]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const products = useMemo(() => restaurant?.products || [], [restaurant]);

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
            onAction={() => navigation.navigate('Tabs', { screen: 'Home' }, { pop: true })}
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
      </View>

      <Text style={styles.title}>{restaurant.name}</Text>
      <Text style={styles.lead}>
        מנה אחת מכל נבחרת
        {flatPrice !== null ? `, כל אחת ב־${formatPrice(flatPrice)}` : ''}. מזמינים כמו מכל מסעדה
        אחרת.
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
        renderItem={({ item, index }) => {
          const team = teamByDish.get(item.name);
          const quantity = isCampaignCart ? cart.quantities[item.id] || 0 : 0;
          const first = index === 0;
          const last = index === products.length - 1;

          /* One list like a menu (V4 spec §4.3). The campaign's one price
             is said in the hero; a price per row only if they differ. */
          return (
            <View style={[styles.dish, first && styles.dishFirst, last && styles.dishLast]}>
              <Flag team={team} />

              <View style={styles.dishText}>
                {team ? <Text style={styles.team}>{team.team}</Text> : null}
                <Text style={styles.dishName}>{item.name}</Text>
                {flatPrice === null ? <Text style={styles.price}>{formatPrice(item.price)}</Text> : null}
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
                  <AddButton name={item.name} onPress={() => addToCart(item)} />
                )}
              </View>
            </View>
          );
        }}
      />

      {showCartBar ? (
        <CartBar
          line={theme.cup}
          itemsCount={cart.itemsCount}
          subtotal={cart.subtotal}
          onPress={() => navigation.navigate('Tabs', { screen: 'Cart' }, { pop: true })}
        />
      ) : null}
    </Screen>
  );
}

/* The World Cup (V5 spec §6): the board's special line — the server's
   name in amber signage on black, the teams as ruled cells. */
const useStyles = createStyles(({ colors, space, type, font }) => ({
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
    backgroundColor: colors.board,
  },
  heroTop: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between' },
  heroBack: { marginStart: -space[2] },
  title: { fontFamily: font.display, fontSize: 64, lineHeight: 60, paddingTop: 8, ...rtl.text, marginTop: space[3], color: colors.led },
  lead: { ...type.bodyL, ...rtl.text, fontWeight: '700', color: colors.onBoard },
  count: { ...type.body, ...rtl.text, fontWeight: '700', color: colors.boardMuted },

  dish: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    minHeight: 72,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  dishFirst: { borderTopWidth: 2 },
  dishLast: {},
  /* A flag keeps its own 3:2 proportion; cropping it to a square
     mangles the ones with vertical bands. */
  flag: {
    width: 56,
    height: 38,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  flagImage: { width: '100%', height: '100%' },
  dishText: { flex: 1, gap: 2, alignItems: 'flex-end' },
  team: { ...type.caption, ...rtl.text, fontWeight: '800', color: colors.inkMuted },
  dishName: { ...type.h3, ...rtl.text, fontSize: 17, fontWeight: '800', color: colors.ink },
  price: { ...type.price, ...rtl.text, color: colors.ink },
  dishAction: {},
}));
