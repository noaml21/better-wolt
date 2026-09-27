import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProduct, deleteRestaurant, getRestaurantById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useMenuCart from '../hooks/useMenuCart';
import usePlaceOrder from '../hooks/usePlaceOrder';
import { dishCount } from '../services/counts';
import {
  Button,
  ConfirmDialog,
  Dialog,
  EmptyState,
  ErrorState,
  SectionHeader,
  useToast,
} from '../components/ui';
import RestaurantHero, { RestaurantHeroSkeleton } from '../components/restaurant/RestaurantHero';
import DishRow from '../components/restaurant/DishRow';
import MenuFilter, { MENU_FILTER_THRESHOLD, matchesDish } from '../components/restaurant/MenuFilter';
import OwnerPanel from '../components/owner/OwnerPanel';
import CartPanel, { CartBar } from '../components/restaurant/CartPanel';
import RestaurantFormDialog from '../components/owner/RestaurantFormDialog';
import ProductFormDialog from '../components/owner/ProductFormDialog';
import './RestaurantPage.css';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const cart = useMenuCart();

  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [cartOpen, setCartOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [productDialog, setProductDialog] = useState({ open: false, product: null });
  const [confirm, setConfirm] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');

  /* Moving between restaurants without a reload means two requests can
     be in flight; only the newest one may write, or a slow answer for
     the restaurant you just left replaces the one you are reading. */
  const latestRequest = useRef(0);

  /* `refresh` re-reads the restaurant after the owner changed it. The
     page stays on screen while it does: dropping to the skeleton would
     unmount the menu, throw away the scroll position halfway down a long
     menu, and lose the element keyboard focus returns to. A failed
     refresh leaves the page as it was and says so; the change itself
     has already been saved. */
  const load = useCallback(
    async ({ refresh = false, failureMessage = 'השינוי נשמר, אבל לא הצלחנו לרענן את העמוד.' } = {}) => {
      const request = latestRequest.current + 1;

      latestRequest.current = request;

      if (!refresh) {
        setStatus('loading');
      }

      try {
        const data = await getRestaurantById(id);

        if (latestRequest.current !== request) {
          return;
        }

        setRestaurant(data);
        setStatus('ready');

        return data;
      } catch (error) {
        if (latestRequest.current !== request) {
          return;
        }

        if (refresh && error.status !== 404) {
          if (failureMessage) {
            showToast(failureMessage, { tone: 'error' });
          }

          return;
        }

        setStatus(error.status === 404 ? 'missing' : 'error');
      }
    },
    [id, showToast]
  );

  const refresh = useCallback(() => load({ refresh: true }), [load]);

  useEffect(() => {
    load();
    setMenuQuery('');
  }, [load]);

  const isOwner = isAuthenticated && user?.username === restaurant?.username;

  /* Owner dialogs belong to the owner. If the account changes while one is
     open (signing out, or in, from another tab), it closes: left open it
     would send the next account's token with the owner's edit. */
  useEffect(() => {
    if (!isOwner) {
      setEditingRestaurant(false);
      setProductDialog((current) => (current.open ? { open: false, product: null } : current));
      setConfirm(null);
    }
  }, [isOwner]);

  const {
    placing,
    placeOrder: handlePlaceOrder,
    problem: orderProblem,
    dismissProblem,
  } = usePlaceOrder({
    restaurantId: restaurant?.id,
    cart,
    from: `/restaurant/${id}`,
    onPlaced: () => setCartOpen(false),
    /* The order named a dish that is gone, or the restaurant is. Nothing
       was ordered; show the menu as it is now (a closed restaurant turns
       the page into its "not found" state), take the missing dishes out
       of the cart and say which, so the next attempt can succeed. The
       explanation is returned, and the cart shows it beside itself. */
    onMenuChanged: async () => {
      const fresh = await load({ refresh: true, failureMessage: null });

      if (!fresh) {
        return 'התפריט השתנה ולא הצלחנו לטעון אותו מחדש. רעננו את העמוד ונסו שוב.';
      }

      const onMenu = new Set((fresh.products || []).map((product) => product.id));
      const gone = cart.lines.filter((line) => !onMenu.has(line.id));

      cart.keepOnly(onMenu);

      return gone.length === 0
        ? 'התפריט השתנה. בדקו את הסל ונסו שוב.'
        : gone.length === 1
          ? `המנה "${gone[0].name}" כבר לא בתפריט והוסרה מהסל. בדקו את הסל ונסו שוב.`
          : `${gone.length} מנות כבר לא בתפריט והוסרו מהסל. בדקו את הסל ונסו שוב.`;
    },
  });

  const handleDeleteRestaurant = async () => {
    setRemoving(true);

    try {
      await deleteRestaurant(restaurant.id);
      showToast('המסעדה נסגרה');
      navigate('/');
    } catch (error) {
      // Closed already (another tab, another device): what was asked for.
      if (error.status === 404) {
        showToast('המסעדה כבר נסגרה');
        navigate('/');
        return;
      }

      showToast(error.message, { tone: 'error' });
      setRemoving(false);
      setConfirm(null);
    }
  };

  const handleDeleteProduct = async (product) => {
    setRemoving(true);

    try {
      await deleteProduct(restaurant.id, product.id);
      await refresh();
      showToast(`${product.name} הוסרה מהתפריט`);
    } catch (error) {
      /* Gone already — removed in another tab or with its restaurant. The
         menu on screen is what is stale, not the request: re-read it. */
      if (error.status === 404) {
        await refresh();
        showToast(`${product.name} כבר לא בתפריט`);
        return;
      }

      showToast(error.message, { tone: 'error' });
    } finally {
      setRemoving(false);
      setConfirm(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="bw-page">
        <RestaurantHeroSkeleton />
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="bw-page bw-page--narrow">
        <EmptyState
          level={1}
          icon="store"
          title="המסעדה הזו לא נמצאה"
          description="ייתכן שהיא נסגרה או שהקישור שגוי."
          action={<Button onClick={() => navigate('/restaurants')}>לכל המסעדות</Button>}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bw-page bw-page--narrow">
        <ErrorState level={1} description="לא הצלחנו להביא את פרטי המסעדה." onRetry={() => load()} />
      </div>
    );
  }

  const products = restaurant.products || [];
  const filterable = products.length > MENU_FILTER_THRESHOLD;
  const shownProducts = filterable ? products.filter((product) => matchesDish(product, menuQuery)) : products;
  const openAddDish = () => setProductDialog({ open: true, product: null });
  const confirmClose = () =>
    setConfirm({
      title: `לסגור את ${restaurant.name}?`,
      description: 'המסעדה והתפריט שלה יימחקו. אי אפשר לבטל את הפעולה.',
      confirmLabel: 'סגירת המסעדה',
      onConfirm: handleDeleteRestaurant,
    });

  return (
    <div className="bw-page bw-restaurant-page">
      <RestaurantHero restaurant={restaurant} />

      <div className={`bw-restaurant-page__layout ${isOwner ? 'bw-restaurant-page__layout--owner' : ''}`}>
        {/* First in the DOM for the owner: the tools come before the menu
            they act on, in reading order and in tab order. */}
        {isOwner && (
          <aside className="bw-restaurant-page__side">
            <OwnerPanel
              products={products}
              onAddDish={openAddDish}
              onEdit={() => setEditingRestaurant(true)}
              onDelete={confirmClose}
            />
          </aside>
        )}

        <section className="bw-restaurant-page__menu" aria-labelledby="bw-menu-title">
          <SectionHeader
            id="bw-menu-title"
            title="התפריט"
            description={products.length ? dishCount(products.length) : undefined}
          />

          {filterable && (
            <MenuFilter
              value={menuQuery}
              onChange={setMenuQuery}
              resultLabel={shownProducts.length ? `${dishCount(shownProducts.length)} מתאימות` : 'אין מנה מתאימה'}
            />
          )}

          {products.length === 0 ? (
            <EmptyState
              icon="bag"
              title="התפריט עוד ריק"
              description={
                isOwner
                  ? 'הוסיפו את המנה הראשונה והיא תופיע כאן ללקוחות.'
                  : 'המסעדה עוד לא פרסמה מנות. שווה לבדוק שוב מאוחר יותר.'
              }
              action={
                isOwner && <Button onClick={openAddDish}>הוספת מנה</Button>
              }
            />
          ) : shownProducts.length === 0 ? (
            <EmptyState
              icon="search"
              title={`אין בתפריט מנה שמתאימה ל"${menuQuery.trim()}"`}
              description="נסו מילה אחרת, או חזרו לתפריט המלא."
              action={
                <Button variant="secondary" onClick={() => setMenuQuery('')}>
                  לתפריט המלא
                </Button>
              }
            />
          ) : (
            <ul className="bw-menu-list">
              {shownProducts.map((product) => (
                <DishRow
                  key={product.id}
                  product={product}
                  quantity={cart.quantities[product.id] || 0}
                  onAdd={cart.addItem}
                  onRemove={cart.removeItem}
                  isOwner={isOwner}
                  onEdit={(selected) => setProductDialog({ open: true, product: selected })}
                  onDelete={(selected) =>
                    setConfirm({
                      title: `למחוק את ${selected.name}?`,
                      description: 'המנה תוסר מהתפריט. הזמנות קודמות לא משתנות.',
                      onConfirm: () => handleDeleteProduct(selected),
                    })
                  }
                />
              ))}
            </ul>
          )}
        </section>

        {!isOwner && (
          <aside className="bw-restaurant-page__side bw-restaurant-page__cart">
            <CartPanel
              lines={cart.lines}
              itemCount={cart.itemCount}
              subtotal={cart.subtotal}
              onAdd={cart.addItem}
              onRemove={cart.removeItem}
              onPlaceOrder={handlePlaceOrder}
              placing={placing}
              restaurantName={restaurant.name}
              problem={orderProblem}
              onDismissProblem={dismissProblem}
            />
          </aside>
        )}
      </div>

      {!isOwner && (
        <>
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
              restaurantName={restaurant.name}
              problem={orderProblem}
              onDismissProblem={dismissProblem}
            />
          </Dialog>
        </>
      )}

      <RestaurantFormDialog
        open={editingRestaurant}
        restaurant={restaurant}
        onClose={() => setEditingRestaurant(false)}
        onSaved={refresh}
      />

      <ProductFormDialog
        open={productDialog.open}
        product={productDialog.product}
        restaurantId={restaurant.id}
        onClose={() => setProductDialog({ open: false, product: null })}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel}
        loading={removing}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </div>
  );
}
