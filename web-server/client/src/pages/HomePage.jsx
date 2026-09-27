import { useCallback, useEffect, useState } from 'react';
import { getRestaurants } from '../services/api';
import { findWorldCupRestaurant } from '../services/restaurantMeta';
import { restaurantCount } from '../services/counts';
import { useAuth } from '../context/AuthContext';
import { Button, EmptyState, ErrorState, SectionHeader } from '../components/ui';
import HeroBand from '../components/discovery/HeroBand';
import CampaignCard from '../components/discovery/CampaignCard';
import OrderAgain from '../components/discovery/OrderAgain';
import SponsoredCard from '../components/discovery/SponsoredCard';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/discovery/RestaurantCard';
import RestaurantFormDialog from '../components/owner/RestaurantFormDialog';
import './HomePage.css';

const SPONSORED_POSITION = 3;

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
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

  return (
    <>
      <HeroBand restaurants={everyday} />

      <div className="bw-page">
        {status === 'error' ? (
          <ErrorState
            title="לא הצלחנו לטעון את המסעדות"
            description="השרת לא הגיב. אפשר לנסות שוב בעוד רגע."
            onRetry={loadRestaurants}
          />
      ) : (
          <div className="bw-home">
            {status === 'ready' && <OrderAgain restaurants={restaurants} />}

            {campaign && <CampaignCard restaurant={campaign} to="/world-cup" />}

            <section aria-labelledby="bw-home-restaurants">
              <SectionHeader
                id="bw-home-restaurants"
                title="כל המסעדות"
                description={
                  status === 'ready' && !isEmpty
                    ? `${restaurantCount(everyday.length)} שמשלוחות אליכם עכשיו.`
                    : undefined
                }
                action={
                  canCreateRestaurant && (
                    <Button icon="store" variant="secondary" onClick={() => setCreateOpen(true)}>
                      פתיחת מסעדה חדשה
                    </Button>
                  )
                }
              />

              {/* The heading promises a selection; with nothing to show,
                  say so instead of leaving an empty grid under it. */}
              {isEmpty ? (
                <EmptyState
                  icon="store"
                  title="אין עדיין מסעדות"
                  description="ברגע שמסעדה תיפתח היא תופיע כאן."
                />
              ) : (
                <ul
                  className="bw-restaurant-grid"
                  aria-busy={status === 'loading'}
                  aria-label="רשימת המסעדות"
                >
                  {status === 'loading'
                    ? Array.from({ length: 6 }, (_, index) => <RestaurantCardSkeleton key={index} />)
                    : everyday.flatMap((restaurant, index) =>
                        index === SPONSORED_POSITION
                          ? [
                              <SponsoredCard key="sponsored" />,
                              <RestaurantCard key={restaurant.id} restaurant={restaurant} />,
                            ]
                          : [<RestaurantCard key={restaurant.id} restaurant={restaurant} />]
                      )}
                </ul>
              )}
            </section>
          </div>
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
