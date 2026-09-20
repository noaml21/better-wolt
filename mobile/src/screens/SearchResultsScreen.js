import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';
import { searchRestaurants } from '../services/api';
import { resultCount } from '../services/presentation';
import { EmptyState, ErrorState, Icon, IconButton, Screen, SkeletonCard } from '../ui';
import RestaurantCard from '../components/RestaurantCard';

/* Search is a tab, so it keeps its query between visits. Home can hand
   it a term (a chip, the search field) through route params. */

export default function SearchResultsScreen({ navigation, route }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const input = useRef(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');

  const run = useCallback(async (term) => {
    const trimmed = term.trim();

    if (!trimmed) {
      return;
    }

    setSubmitted(trimmed);
    setStatus('loading');

    try {
      const data = await searchRestaurants(trimmed);

      setResults(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  const incoming = route.params?.query;

  /* A term handed over by Home runs straight away; arriving at the tab
     with nothing to show opens the keyboard instead. Clearing the param
     afterwards must not re-trigger either. */
  const handled = useRef(false);

  useEffect(() => {
    if (incoming) {
      handled.current = true;
      setQuery(incoming);
      run(incoming);
      navigation.setParams({ query: undefined });

      return;
    }

    if (!handled.current) {
      handled.current = true;
      input.current?.focus();
    }
  }, [incoming, run, navigation]);

  const clear = () => {
    setQuery('');
    setSubmitted('');
    setResults([]);
    setStatus('idle');
    input.current?.focus();
  };

  return (
    <Screen>
      <View style={styles.bar}>
        <View style={[styles.field, focused && styles.fieldFocused]}>
          <Icon name="search" size={20} color={colors.inkMuted} />

          <TextInput
            ref={input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => run(query)}
            placeholder="מסעדה, מנה או מטבח"
            placeholderTextColor={colors.inkMuted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            accessibilityLabel="חיפוש מסעדה, מנה או מטבח"
            style={styles.input}
          />

          {query ? <IconButton icon="close" label="ניקוי החיפוש" onPress={clear} size={18} /> : null}
        </View>
      </View>

      <FlatList
        data={status === 'ready' ? results : []}
        keyExtractor={(restaurant) => String(restaurant.id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          status === 'ready' && results.length > 0 ? (
            <Text style={styles.count}>
              {resultCount(results.length)} עבור “{submitted}”
            </Text>
          ) : null
        }
        ListEmptyComponent={
          status === 'loading' ? (
            <View accessibilityLabel="מחפש">
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : status === 'error' ? (
            <ErrorState
              title="החיפוש נכשל"
              description="השרת לא הגיב. אפשר לנסות שוב."
              onRetry={() => run(submitted || query)}
            />
          ) : status === 'ready' ? (
            <EmptyState
              icon="search"
              title={`לא מצאנו כלום עבור “${submitted}”`}
              description="נסו שם של מסעדה, מנה או סוג מטבח."
            />
          ) : (
            <EmptyState
              icon="search"
              title="מה בא לכם לאכול?"
              description="חפשו מסעדה, מנה או מטבח והתוצאות יופיעו כאן."
            />
          )
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  bar: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[3] },
  field: {
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
  fieldFocused: { borderColor: colors.flameDeep, borderWidth: 2, paddingHorizontal: space[4] - 1 },
  input: { ...type.body, ...rtl.text, flex: 1, paddingVertical: space[3], color: colors.ink },
  list: { paddingHorizontal: space[4], paddingBottom: space[7] },
  count: { ...type.caption, ...rtl.text, marginBottom: space[3], color: colors.inkMuted },
}));
