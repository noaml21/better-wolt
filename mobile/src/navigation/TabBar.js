import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl, TOUCH_TARGET } from '../theme';
import Icon from '../ui/Icon';
import { useCart } from '../context/CartContext';

/* The product's navigation model. A custom bar rather than the default
   one so the tabs read right-to-left and the cart can carry a badge. */

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
            style={styles.item}
          >
            <View>
              <Icon
                name={icons[route.name]}
                size={23}
                color={focused ? styles.active.color : styles.inactive.color}
                strokeWidth={focused ? 2.1 : 1.75}
              />

              {badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
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

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  bar: {
    ...rtl.row,
    paddingTop: space[2],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  item: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: { ...type.micro },
  active: { color: colors.flameDeep },
  inactive: { color: colors.inkMuted },
  badge: {
    position: 'absolute',
    top: -6,
    left: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.flame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...type.micro, fontSize: 11, color: colors.onFlame },
}));
