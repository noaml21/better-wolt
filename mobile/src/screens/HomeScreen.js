import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';
import { getRestaurants } from '../services/api';
import { findWorldCupRestaurant } from '../services/presentation';
import { useAuth } from '../context/AuthContext';
import { Button, Chip, ErrorState, Icon, IconButton, Logo, Screen, SkeletonCard } from '../ui';
import RestaurantCard from '../components/RestaurantCard';
import CampaignCard from '../components/CampaignCard';

/* Discovery. The list owns the scroll — the header rides along inside it
   so the whole screen pulls to refresh, which is what a phone expects. */

const quickSearches = ['פיצה', 'המבורגר', 'סושי', 'חומוס', 'פסטה', 'מתוק'];

export default function HomeScreen({ navigation }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const shown = useRef(false);

  /* A silent load keeps what is on screen: a failed re-read leaves the
     list as it was instead of replacing it with the error state. */
  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading');
    }

    try {
      const data = await getRestaurants();

      setRestaurants(Array.isArray(data) ? data : []);
      setStatus('ready');
      shown.current = true;
    } catch {
      if (!silent || !shown.current) {
        setStatus('error');
      }
    }
  }, []);

  /* Home is a tab, so it stays mounted: loading once would never show a
     restaurant the owner has just opened, or stop showing one they have
     just closed. It re-reads on every return, quietly once it has a list. */
  useFocusEffect(
    useCallback(() => {
      load({ silent: shown.current });
    }, [load])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  }, [load]);

  const campaign = findWorldCupRestaurant(restaurants);
  const everyday = restaurants.filter((restaurant) => restaurant !== campaign);
  const isOwnerAccount = user?.role === 'restaurant';

  const openSearch = (query) => navigation.navigate('Search', query ? { query } : undefined);

  const header = (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Logo size={30} />
        <IconButton icon="logout" label="התנתקות" variant="outline" onPress={logout} />
      </View>

      <View style={styles.greeting}>
        {/* The account the app knows about. The login response carries no
            address (ARCHITECTURE §4.3), so none is promised here. */}
        <Text style={styles.hello} numberOfLines={1}>
          שלום {user?.displayName || user?.username}
        </Text>
        <Text style={styles.title}>מה אוכלים הערב?</Text>
      </View>

      <Pressable
        onPress={() => openSearch()}
        accessibilityRole="search"
        accessibilityLabel="חיפוש מסעדה, מנה או מטבח"
        style={({ pressed }) => [styles.search, pressed && styles.searchPressed]}
      >
        <Icon name="search" size={20} color={colors.inkMuted} />
        <Text style={styles.searchText}>מסעדה, מנה או מטבח</Text>
      </Pressable>

      {/* `inverted` starts the row at the right edge and lays the chips
          out leading-to-trailing for Hebrew, which a plain horizontal
          list cannot do without forcing RTL natively. */}
      <FlatList
        data={quickSearches}
        horizontal
        inverted
        keyExtractor={(term) => term}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => <Chip onPress={() => openSearch(item)}>{item}</Chip>}
      />

      {campaign ? (
        <CampaignCard
          restaurant={campaign}
          onPress={() => navigation.navigate('WorldCup')}
        />
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>כל המסעדות</Text>
        <Text style={styles.sectionDescription}>נבחרת המסעדות שמשלוחות אליכם עכשיו.</Text>

        {/* The owner's action gets its own row: at phone width it has
            nowhere to sit beside the heading without squeezing it. */}
        {isOwnerAccount ? (
          <View style={styles.sectionAction}>
            <Button
              size="sm"
              variant="secondary"
              icon="store"
              onPress={() => navigation.navigate('RestaurantForm', {})}
            >
              פתיחת מסעדה חדשה
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (status === 'error') {
    return (
      <Screen>
        {header}
        <ErrorState
          title="לא הצלחנו לטעון את המסעדות"
          description="השרת לא הגיב. אפשר לנסות שוב בעוד רגע."
          onRetry={load}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={status === 'loading' ? [] : everyday}
        keyExtractor={(restaurant) => String(restaurant.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          status === 'loading' ? (
            <View accessibilityLabel="טוען מסעדות">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>אין כאן מסעדות עדיין</Text>
              <Text style={styles.emptyText}>
                {isOwnerAccount
                  ? 'פתחו את המסעדה הראשונה והיא תופיע כאן.'
                  : 'שווה לבדוק שוב בעוד רגע.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.flame} />
        }
      />
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  list: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[7] },
  header: { gap: space[4], paddingBottom: space[5] },
  identity: { ...rtl.row, alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  greeting: { gap: 2 },
  hello: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  title: { ...type.h1, ...rtl.text, color: colors.ink },
  search: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    minHeight: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  searchPressed: { opacity: 0.9 },
  searchText: { ...type.body, color: colors.inkMuted },
  chips: { gap: space[2], paddingVertical: space[1] },
  sectionHeader: { gap: 2, marginTop: space[2] },
  sectionAction: { ...rtl.row, marginTop: space[3] },
  sectionTitle: { ...type.h2, ...rtl.text, color: colors.ink },
  sectionDescription: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  empty: { gap: space[2], paddingVertical: space[8] },
  emptyTitle: { ...type.h3, textAlign: 'center', color: colors.ink },
  emptyText: { ...type.body, textAlign: 'center', color: colors.inkMuted },
}));
