import { useCallback, useEffect, useState } from 'react';
import { getRestaurants } from '../services/api';
import { findWorldCupRestaurant } from '../services/restaurantMeta';
import { restaurantCount } from '../services/counts';
import { useAuth } from '../context/AuthContext';
import useMyOrders from '../hooks/useMyOrders';
import { Button, EmptyState, ErrorState } from '../components/ui';
import HomeHeader from '../components/discovery/HomeHeader';
import CampaignCard from '../components/discovery/CampaignCard';
import OrderAgain from '../components/discovery/OrderAgain';
import SponsoredCard from '../components/discovery/SponsoredCard';
import BoardRow, { BoardRowSkeleton } from '../components/discovery/BoardRow';
import RestaurantFormDialog from '../components/owner/RestaurantFormDialog';
import './HomePage.css';

const SPONSORED_POSITION = 3;

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const myOrders = useMyOrders();
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [createOpen, setCreateOpen] = useState(false);

  const loadRestaurants = useCallback(async () => {
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
    loadRestaurants();
  }, [loadRestaurants]);

  const campaign = findWorldCupRestaurant(restaurants);
  const everyday = restaurants.filter((restaurant) => restaurant !== campaign);
  const canCreateRestaurant = isAuthenticated && user?.role === 'restaurant';
  const isEmpty = status === 'ready' && everyday.length === 0;

  // Only an owner account may have this dialog open (see RestaurantPage).
  useEffect(() => {
    if (!canCreateRestaurant) {
      setCreateOpen(false);
    }
  }, [canCreateRestaurant]);

  const orderedFrom = new Set(myOrders.map((order) => order.restaurant));

  return (
    <>
      <div className="bw-page bw-home">
        <HomeHeader />

        {status === 'error' ? (
          <ErrorState
            title="לא הצלחנו לטעון את המסעדות"
            description="השרת לא הגיב. אפשר לנסות שוב בעוד רגע."
            onRetry={loadRestaurants}
          />
        ) : (
          <>
            {status === 'ready' && <OrderAgain restaurants={restaurants} orders={myOrders} />}

            <section className="bw-home__board" aria-labelledby="bw-home-restaurants">
              <header className="bw-board-head">
                <div className="bw-board-head__text">
                  <h2 className="bw-board-head__title bw-display" id="bw-home-restaurants">
                    כל המסעדות
                  </h2>
                  {status === 'ready' && !isEmpty && (
                    <p className="bw-board-head__count">{restaurantCount(everyday.length)} משלוחות אליכם עכשיו.</p>
                  )}
                </div>
                {canCreateRestaurant && (
                  <Button icon="store" variant="secondary" onClick={() => setCreateOpen(true)}>
                    פתיחת מסעדה חדשה
                  </Button>
                )}
                {!isEmpty && (
                  <span className="bw-board-head__cols" aria-hidden="true">
                    <span>זמן</span>
                    <span>משלוח</span>
                  </span>
                )}
              </header>

              {/* The heading promises a selection; with nothing to show,
                  say so instead of leaving an empty board under it. */}
              {isEmpty ? (
                <EmptyState
                  icon="store"
                  title="אין עדיין מסעדות"
                  description="ברגע שמסעדה תיפתח היא תופיע כאן."
                />
              ) : (
                <ol className="bw-board" aria-busy={status === 'loading'} aria-label="רשימת המסעדות">
                  {status === 'loading'
                    ? Array.from({ length: 6 }, (_, index) => <BoardRowSkeleton key={index} />)
                    : everyday.flatMap((restaurant, index) => {
                        const row = (
                          <BoardRow
                            key={restaurant.id}
                            restaurant={restaurant}
                            ordered={orderedFrom.has(restaurant.id)}
                          />
                        );

                        return index === SPONSORED_POSITION ? [<SponsoredCard key="sponsored" />, row] : [row];
                      })}
                </ol>
              )}
            </section>

            {campaign && <CampaignCard restaurant={campaign} to="/world-cup" />}
          </>
        )}
      </div>

      <RestaurantFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={loadRestaurants}
      />
    </>
  );
}
