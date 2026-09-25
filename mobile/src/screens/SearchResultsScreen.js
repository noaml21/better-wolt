import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';
import { searchRestaurants } from '../services/api';
import { getMatchNote, resultCount } from '../services/presentation';
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

  /* Searches can overtake each other: a slow answer for an earlier term
     would otherwise land last and fill the list with results that do not
     match the term shown above them. Only the newest request may write. */
  const latestRequest = useRef(0);

  const run = useCallback(async (term) => {
    const trimmed = term.trim();

    if (!trimmed) {
      return;
    }

    const request = latestRequest.current + 1;

    latestRequest.current = request;
    setSubmitted(trimmed);
    setStatus('loading');

    try {
      const data = await searchRestaurants(trimmed);

      if (latestRequest.current !== request) {
        return;
      }

      setResults(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch {
      if (latestRequest.current === request) {
        setStatus('error');
      }
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
              {`${resultCount(results.length)} עבור "${submitted}"`}
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
              title={`לא מצאנו כלום עבור "${submitted}"`}
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
        renderItem={({ item }) => {
          const note = getMatchNote(item, submitted);

          return (
            <RestaurantCard
              restaurant={item}
              note={note ? <MatchNote note={note} /> : null}
              onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.id })}
            />
          );
        }}
      />
    </Screen>
  );
}

/* Why a result matched when its name does not say so (V4 audit B3), with
   the searched text marked — the same note the web client shows. The
   results are always for `submitted`, the query that produced them. */
function MatchNote({ note }) {
  const styles = useStyles();

  return (
    <Text style={styles.note} numberOfLines={1}>
      {note.label}
      {note.before}
      {note.match ? <Text style={styles.noteMark}>{note.match}</Text> : null}
      {note.after}
    </Text>
  );
}

const useStyles = createStyles(({ colors, space, type }) => ({
  note: { ...type.caption, ...rtl.text, fontWeight: '700', color: colors.ink },
  noteMark: { fontWeight: '900', backgroundColor: colors.ink, color: colors.onInk },
  bar: { paddingHorizontal: space[4], paddingTop: space[3], paddingBottom: space[3], borderBottomWidth: 3, borderBottomColor: colors.ink },
  field: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    minHeight: 56,
    paddingHorizontal: space[4],
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.panel,
  },
  fieldFocused: { backgroundColor: colors.raised },
  /* The field's 3pt border is the focus ring; web would draw a second. */
  input: { ...type.bodyL, ...rtl.text, fontWeight: '700', flex: 1, paddingVertical: space[3], color: colors.ink, outlineStyle: 'none' },
  list: { paddingHorizontal: space[4], paddingBottom: space[7] },
  count: { ...type.body, ...rtl.text, fontWeight: '800', marginTop: space[3], marginBottom: space[2], color: colors.inkMuted },
}));
