import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRestaurants } from '../services/api';
import { getRestaurantMeta } from '../services/restaurantMeta';
import { Chip, EmptyState, ErrorState, LinkButton, SectionHeader } from '../components/ui';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/discovery/RestaurantCard';

/* The full listing. Sorting happens on the client: the API returns every
   restaurant in one response and has no sort parameter (ARCHITECTURE §4.2). */

const sorts = [
  { id: 'recommended', label: 'מומלצות' },
  { id: 'fastest', label: 'הכי מהיר' },
  { id: 'alphabetical', label: 'לפי שם' },
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
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
        title="כל המסעדות"
        description={
          status === 'ready' ? `${restaurants.length} מסעדות משלוחות אליכם עכשיו.` : 'טוענים את הרשימה…'
        }
      />

      <div className="bw-filter-row" role="group" aria-label="סדר התצוגה">
        {sorts.map((option) => (
          <Chip key={option.id} selected={sort === option.id} onClick={() => setSort(option.id)}>
            {option.label}
          </Chip>
        ))}
      </div>

      {status === 'error' && (
        <ErrorState
          title="לא הצלחנו לטעון את המסעדות"
          description="השרת לא הגיב. אפשר לנסות שוב בעוד רגע."
          onRetry={load}
        />
      )}

      {status === 'ready' && restaurants.length === 0 && (
        <EmptyState
          icon="store"
          title="אין עדיין מסעדות"
          description="ברגע שמסעדה תיפתח היא תופיע כאן."
          action={<LinkButton to="/register">פתיחת מסעדה</LinkButton>}
        />
      )}

      {status !== 'error' && (restaurants.length > 0 || status === 'loading') && (
        <ul className="bw-restaurant-grid" aria-busy={status === 'loading'} aria-label="רשימת המסעדות">
          {status === 'loading'
            ? Array.from({ length: 8 }, (_, index) => <RestaurantCardSkeleton key={index} />)
            : sorted.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
        </ul>
      )}
    </div>
  );
}
