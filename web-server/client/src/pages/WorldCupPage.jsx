import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, getRestaurants } from '../services/api';
import { findWorldCupRestaurant } from '../services/restaurantMeta';
import { worldCupDishes } from '../services/worldCup';
import { dishCount } from '../services/counts';
import { useAuth } from '../context/AuthContext';
import useMenuCart from '../hooks/useMenuCart';
import {
  Button,
  Dialog,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Media,
  Skeleton,
  Tag,
  formatPrice,
  useToast,
} from '../components/ui';
import CartPanel, { CartBar } from '../components/restaurant/CartPanel';
import CartControl from '../components/restaurant/CartControl';
import './WorldCupPage.css';

/* The campaign as a page instead of an overlay.

   The restaurant and its dishes come from the server — the name and the
   dish names are contract (ARCHITECTURE §6) and nothing here renames
   them. The flags are presentation, matched to a dish by name; a dish
   the seed adds later still shows, just without a flag. Ordering goes
   through the normal cart, and the music never plays until it is asked
   for. */

const flagByDish = new Map(worldCupDishes.map((dish) => [dish.dishName, dish]));

/* The flags come from a CDN, so one of them not arriving is a state this
   page has to have: `Media` falls back to the campaign's own mark instead
   of leaving an empty slot. They are ~1 KB each and part of the layout,
   so they are not lazy — loading them late only buys a row of empty
   boxes while the page settles. */
function Flag({ team, fallback = null }) {
  return <Media src={team?.flag} width="52" height="35" fallback={fallback} />;
}

export default function WorldCupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const cart = useMenuCart();
  const audio = useRef(null);

  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [placing, setPlacing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      const data = await getRestaurants();
      const campaign = findWorldCupRestaurant(Array.isArray(data) ? data : []);

      setRestaurant(campaign);
      setStatus(campaign ? 'ready' : 'missing');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Nothing should keep playing after the page is left. */
  useEffect(() => () => audio.current?.pause(), []);

  /* The campaign's flat price is whatever the seed priced the dishes at,
     read back from the server rather than written here. */
  const flatPrice = useMemo(() => {
    const prices = new Set((restaurant?.products || []).map((product) => Number(product.price)));

    return prices.size === 1 ? [...prices][0] : null;
  }, [restaurant]);

  const dishes = useMemo(
    () =>
      (restaurant?.products || []).map((product) => ({
        product,
        team: flagByDish.get(product.name),
      })),
    [restaurant]
  );

  const toggleSound = () => {
    const element = audio.current;

    if (!element) {
      return;
    }

    if (playing) {
      element.pause();
      setPlaying(false);

      return;
    }

    element.volume = 0.35;
    element
      .play()
      .then(() => setPlaying(true))
      /* NotAllowedError is the browser's autoplay policy; anything else
         (NotSupportedError, a network failure) means the file never
         arrived, and blaming the browser for that sends people to the
         wrong settings. */
      .catch((error) =>
        showToast(
          error?.name === 'NotAllowedError' ? 'הדפדפן חסם את הנגינה' : 'לא הצלחנו לטעון את המוזיקה',
          { tone: 'error' }
        )
      );
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('צריך להתחבר כדי להזמין', { tone: 'error' });
      navigate('/login', { state: { from: '/world-cup' } });

      return;
    }

    setPlacing(true);

    try {
      const order = await createOrder({
        restaurant: restaurant.id,
        products: cart.toOrderProducts(),
      });

      cart.clear();
      setCartOpen(false);
      audio.current?.pause();
      navigate(`/tracking/${order.id}`);
    } catch (error) {
      showToast(error.message, { tone: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="bw-page" aria-busy="true">
        <Skeleton height={220} radius="lg" />
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="bw-page bw-page--narrow">
        <EmptyState
          level={1}
          icon="trophy"
          title="חגיגת המונדיאל לא זמינה כרגע"
          description="הקולקציה מגיעה מהשרת, והוא לא מחזיק אותה עכשיו."
          action={<LinkButton to="/restaurants">לכל המסעדות</LinkButton>}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bw-page bw-page--narrow">
        <ErrorState level={1} description="לא הצלחנו להביא את הקולקציה." onRetry={load} />
      </div>
    );
  }

  return (
    <div className="bw-page bw-worldcup">
      <header className="bw-worldcup__hero">
        <p className="bw-worldcup__eyebrow">קולקציה מיוחדת</p>
        <h1 className="bw-worldcup__title bw-display">{restaurant.name}</h1>
        <p className="bw-worldcup__lead">
          מנה אחת מכל נבחרת
          {flatPrice !== null ? `, במחיר אחיד של ${formatPrice(flatPrice)}` : ''}. מזמינים כמו מכל
          מסעדה אחרת.
        </p>

        <div className="bw-worldcup__hero-actions">
          <Button variant="secondary" icon={playing ? 'close' : 'trophy'} onClick={toggleSound}>
            {playing ? 'עצירת המוזיקה' : 'הפעלת מוזיקת רקע'}
          </Button>
          <span className="bw-worldcup__count">{dishCount(dishes.length)}</span>
        </div>

        <audio ref={audio} src="/music.mp3" loop preload="none" aria-hidden="true" />

        {/* The nations, as themselves. Decorative: every flag here also
            appears next to the dish it belongs to. */}
        <div className="bw-worldcup__flags" aria-hidden="true">
          {dishes
            .filter(({ team }) => team)
            .slice(0, 12)
            .map(({ team }) => (
              <Flag key={team.key} team={team} />
            ))}
        </div>
      </header>

      <div className="bw-worldcup__layout">
        <section className="bw-worldcup__menu" aria-label="מנות הנבחרות">
          <ul className="bw-worldcup__grid">
            {dishes.map(({ product, team }) => {
              const quantity = cart.quantities[product.id] || 0;

              return (
                <li key={product.id} className="bw-worldcup-dish">
                  <span className="bw-worldcup-dish__flag">
                    <Flag team={team} fallback={<Icon name="trophy" size={22} />} />
                  </span>

                  <span className="bw-worldcup-dish__text">
                    {team && <span className="bw-worldcup-dish__team">{team.team}</span>}
                    <h2 className="bw-worldcup-dish__name">{product.name}</h2>
                    <Tag>{formatPrice(product.price)}</Tag>
                  </span>

                  <span className="bw-worldcup-dish__action">
                    <CartControl
                      name={product.name}
                      quantity={quantity}
                      stepperSize="sm"
                      onAdd={() => cart.addItem(product)}
                      onRemove={() => cart.removeItem(product.id)}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="bw-worldcup__cart">
          <CartPanel
            lines={cart.lines}
            itemCount={cart.itemCount}
            subtotal={cart.subtotal}
            onAdd={cart.addItem}
            onRemove={cart.removeItem}
            onPlaceOrder={handlePlaceOrder}
            placing={placing}
          />
        </aside>
      </div>

      <CartBar itemCount={cart.itemCount} subtotal={cart.subtotal} onOpen={() => setCartOpen(true)} />

      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} title="הסל שלי">
        <CartPanel
          variant="sheet"
          lines={cart.lines}
          itemCount={cart.itemCount}
          subtotal={cart.subtotal}
          onAdd={cart.addItem}
          onRemove={cart.removeItem}
          onPlaceOrder={handlePlaceOrder}
          placing={placing}
        />
      </Dialog>
    </div>
  );
}
