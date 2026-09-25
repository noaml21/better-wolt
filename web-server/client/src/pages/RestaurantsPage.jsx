import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRestaurants } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getRestaurantMeta } from '../services/restaurantMeta';
import { restaurantCount } from '../services/counts';
import { Chip, EmptyState, ErrorState, LinkButton, SectionHeader } from '../components/ui';
import BoardRow, { BoardRowSkeleton } from '../components/discovery/BoardRow';

/* The full listing. Sorting happens on the client: the API returns every
   restaurant in one response and has no sort parameter (ARCHITECTURE §4.2). */

const sorts = [
  { id: 'recommended', label: 'מומלצות' },
  { id: 'fastest', label: 'הכי מהיר' },
  { id: 'alphabetical', label: 'לפי שם' },
];

export default function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [allRestaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [sort, setSort] = useState('recommended');

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      const data = await getRestaurants();

      setRestaurants(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ?mine=1 is the owner's "המסעדות שלי": the same listing, narrowed to
     the restaurants whose `username` is theirs (ARCHITECTURE §4.1). */
  const mine = searchParams.get('mine') === '1' && isAuthenticated && user?.role === 'restaurant';
  const restaurants = useMemo(
    () => (mine ? allRestaurants.filter((restaurant) => restaurant.username === user.username) : allRestaurants),
    [allRestaurants, mine, user]
  );

  /* The whole sentence changes with the count, not just the number. */
  const restaurantLabel = mine
    ? `${restaurantCount(restaurants.length)} בחשבון שלכם.`
    : restaurants.length === 1
      ? 'מסעדה אחת משלוחה אליכם עכשיו.'
      : `${restaurantCount(restaurants.length)} משלוחות אליכם עכשיו.`;

  const sorted = useMemo(() => {
    const list = [...restaurants];

    if (sort === 'alphabetical') {
      return list.sort((a, b) => a.name.localeCompare(b.name, 'he'));
    }

    if (sort === 'fastest') {
      return list.sort(
        (a, b) =>
          Number.parseInt(getRestaurantMeta(a).eta, 10) - Number.parseInt(getRestaurantMeta(b).eta, 10)
      );
    }

    return list.sort((a, b) => Number(getRestaurantMeta(b).rating) - Number(getRestaurantMeta(a).rating));
  }, [restaurants, sort]);

  return (
    <div className="bw-page">
      <SectionHeader
        level={1}
        title={mine ? 'המסעדות שלי' : 'כל המסעדות'}
        description={
          /* Not a binary: on failure the error state below says what
             happened, and a header still promising "loading…" under it
             reads like the page is lying. */
          status === 'loading'
            ? 'טוענים את הרשימה…'
            : status === 'ready' && restaurants.length > 0
              ? restaurantLabel
              : undefined
        }
      />

      {/* Sorting is offered only when there is a list to sort. */}
      {(status === 'loading' || restaurants.length > 0) && status !== 'error' && (
        <div className="bw-filter-row" role="group" aria-label="סדר התצוגה">
          {sorts.map((option) => (
            <Chip key={option.id} selected={sort === option.id} onClick={() => setSort(option.id)}>
              {option.label}
            </Chip>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="לא הצלחנו לטעון את המסעדות"
          description="השרת לא הגיב. אפשר לנסות שוב בעוד רגע."
          onRetry={load}
        />
      )}

      {status === 'ready' && restaurants.length === 0 && (
        mine ? (
          <EmptyState
            icon="store"
            title="עוד לא פתחתם מסעדה"
            description="פותחים מסעדה מעמוד הבית, והיא תופיע כאן."
            action={<LinkButton to="/">לעמוד הבית</LinkButton>}
          />
        ) : (
          <EmptyState
            icon="store"
            title="אין עדיין מסעדות"
            description="ברגע שמסעדה תיפתח היא תופיע כאן."
            action={<LinkButton to="/register">פתיחת מסעדה</LinkButton>}
          />
        )
      )}

      {status !== 'error' && (restaurants.length > 0 || status === 'loading') && (
        <h2 className="bw-visually-hidden">רשימת המסעדות</h2>
      )}

      {status !== 'error' && (restaurants.length > 0 || status === 'loading') && (
        <ol className="bw-board" aria-busy={status === 'loading'} aria-label="רשימת המסעדות">
          {status === 'loading'
            ? Array.from({ length: 8 }, (_, index) => <BoardRowSkeleton key={index} />)
            : sorted.map((restaurant) => (
                <BoardRow key={restaurant.id} restaurant={restaurant} />
              ))}
        </ol>
      )}
    </div>
  );
}
