import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrder, deleteProduct, deleteRestaurant, getRestaurantById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useMenuCart from '../hooks/useMenuCart';
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
  const [placing, setPlacing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [productDialog, setProductDialog] = useState({ open: false, product: null });
  const [confirm, setConfirm] = useState(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      setRestaurant(await getRestaurantById(id));
      setStatus('ready');
    } catch (error) {
      setStatus(error.status === 404 ? 'missing' : 'error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = isAuthenticated && user?.username === restaurant?.username;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('צריך להתחבר כדי להזמין', { tone: 'error' });
      navigate('/login', { state: { from: `/restaurant/${id}` } });
      return;
    }

    setPlacing(true);

    try {
      const order = await createOrder({ restaurant: restaurant.id, products: cart.toOrderProducts() });

      cart.clear();
      setCartOpen(false);
      navigate(`/tracking/${order.id}`);
    } catch (error) {
      showToast(error.message, { tone: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    setRemoving(true);

    try {
      await deleteRestaurant(restaurant.id);
      showToast('המסעדה נסגרה');
      navigate('/');
    } catch (error) {
      showToast(error.message, { tone: 'error' });
      setRemoving(false);
      setConfirm(null);
    }
  };

  const handleDeleteProduct = async (product) => {
    setRemoving(true);

    try {
      await deleteProduct(restaurant.id, product.id);
      await load();
      showToast(`${product.name} הוסרה מהתפריט`);
    } catch (error) {
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
        <ErrorState description="לא הצלחנו להביא את פרטי המסעדה." onRetry={load} />
      </div>
    );
  }

  const products = restaurant.products || [];

  return (
    <div className="bw-page bw-restaurant-page">
      <RestaurantHero
        restaurant={restaurant}
        isOwner={isOwner}
        onEdit={() => setEditingRestaurant(true)}
        onDelete={() =>
          setConfirm({
            title: `לסגור את ${restaurant.name}?`,
            description: 'המסעדה והתפריט שלה יימחקו. אי אפשר לבטל את הפעולה.',
            confirmLabel: 'סגירת המסעדה',
            onConfirm: handleDeleteRestaurant,
          })
        }
      />

      <div className="bw-restaurant-page__layout">
        <section className="bw-restaurant-page__menu" aria-labelledby="bw-menu-title">
          <SectionHeader
            id="bw-menu-title"
            title="התפריט"
            description={products.length ? `${products.length} מנות` : undefined}
            action={
              isOwner && (
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={() => setProductDialog({ open: true, product: null })}
                >
                  הוספת מנה
                </Button>
              )
            }
          />

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
                isOwner && (
                  <Button onClick={() => setProductDialog({ open: true, product: null })}>
                    הוספת מנה
                  </Button>
                )
              }
            />
          ) : (
            <ul className="bw-menu-list">
              {products.map((product) => (
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
          <aside className="bw-restaurant-page__cart">
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
            />
          </Dialog>
        </>
      )}

      <RestaurantFormDialog
        open={editingRestaurant}
        restaurant={restaurant}
        onClose={() => setEditingRestaurant(false)}
        onSaved={load}
      />

      <ProductFormDialog
        open={productDialog.open}
        product={productDialog.product}
        restaurantId={restaurant.id}
        onClose={() => setProductDialog({ open: false, product: null })}
        onSaved={load}
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
