import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, TOUCH_TARGET } from '../theme';
import Icon from '../ui/Icon';
import { useCart } from '../context/CartContext';

/* The product's navigation model: the line bar (V5 spec §11) — board
   black under the screen, the current tab an inverted cell like the web's
   current page, the cart's count in a square. A custom bar so the tabs
   read right-to-left. */

const icons = { Home: 'home', Search: 'search', Orders: 'bag', Cart: 'cart' };

export default function TabBar({ state, descriptors, navigation }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { itemsCount } = useCart();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const focused = state.index === index;
        const badge = route.name === 'Cart' ? itemsCount : 0;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={[styles.item, focused && styles.itemActive]}
          >
            <View>
              <Icon
                name={icons[route.name]}
                size={23}
                color={focused ? styles.active.color : styles.inactive.color}
                strokeWidth={2.2}
              />

              {badge > 0 ? (
                <View style={[styles.badge, focused && styles.badgeActive]}>
                  <Text style={[styles.badgeText, focused && styles.badgeTextActive]}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.label, focused ? styles.active : styles.inactive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = createStyles(({ colors, space, type }) => ({
  bar: {
    ...rtl.row,
    gap: 2,
    paddingTop: space[2],
    paddingHorizontal: space[2],
    backgroundColor: colors.board,
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  itemActive: { backgroundColor: colors.onBoard },
  label: { ...type.caption, fontWeight: '800' },
  active: { color: colors.board },
  inactive: { color: colors.boardMuted },
  badge: {
    position: 'absolute',
    top: -6,
    left: -12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    backgroundColor: colors.onBoard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: { backgroundColor: colors.board },
  badgeText: { ...type.caption, ...type.num, fontSize: 12, lineHeight: 16, fontWeight: '900', color: colors.board },
  badgeTextActive: { color: colors.onBoard },
}));
