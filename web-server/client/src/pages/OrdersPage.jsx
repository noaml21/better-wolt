import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import {
  formatOrderNumber,
  getSecondsLeft,
  isActive,
  summariseItems,
} from '../services/orderStatus';
import {
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  SectionHeader,
  Skeleton,
  StatusPill,
  formatPrice,
} from '../components/ui';
import './OrdersPage.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      const data = await getUserOrders();

      setOrders(Array.isArray(data) ? [...data].reverse() : []);
      setStatus('ready');
    } catch (error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bw-page bw-page--narrow">
      <SectionHeader
        level={1}
        title="ההזמנות שלי"
        description={
          status === 'ready' && orders.length > 0
            ? `${orders.length} הזמנות בחשבון שלכם.`
            : undefined
        }
      />

      {status === 'loading' && (
        <div className="bw-orders" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="bw-order">
              <Skeleton width="40%" height={18} />
              <Skeleton width="70%" height={12} />
              <Skeleton width="30%" height={12} />
            </Card>
          ))}
        </div>
      )}

      {status === 'error' && (
        <ErrorState
          title="לא הצלחנו לטעון את ההזמנות"
          description="השרת לא הגיב. אפשר לנסות שוב."
          onRetry={load}
        />
      )}

      {status === 'ready' && orders.length === 0 && (
        <EmptyState
          icon="bag"
          title="עוד לא הזמנתם כלום"
          description="ההזמנה הראשונה מחכה. בחרו מסעדה והיא תופיע כאן."
          action={<LinkButton to="/restaurants">לכל המסעדות</LinkButton>}
        />
      )}

      {status === 'ready' && orders.length > 0 && (
        <ul className="bw-orders">
          {orders.map((order) => {
            const active = isActive(order);
            const items = summariseItems(order);

            return (
              <li key={order.id}>
                <Card className="bw-order">
                  <header className="bw-order__header">
                    <div className="bw-order__identity">
                      <h2 className="bw-order__restaurant">{order.restaurantName}</h2>
                      <p className="bw-order__number">
                        <span className="bw-order-number">{formatOrderNumber(order.id)}</span>
                        {' · '}
                        {order.date}
                      </p>
                    </div>
                    <StatusPill tone={active ? 'active' : 'done'}>
                      {active ? 'בדרך אליכם' : 'הושלמה'}
                    </StatusPill>
                  </header>

                  {items && <p className="bw-order__items">{items}</p>}

                  <footer className="bw-order__footer">
                    <p className="bw-order__total">
                      <span>{order.items} פריטים</span>
                      <strong>{formatPrice(order.total)}</strong>
                    </p>

                    {active && (
                      <Link to={`/tracking/${order.id}`} className="bw-order__track">
                        מעקב אחרי ההזמנה
                        <Icon name="back" size={16} />
                      </Link>
                    )}
                  </footer>

                  {active && (
                    <span className="bw-visually-hidden">
                      זמן משוער להגעה: {Math.ceil(getSecondsLeft(order) / 60)} דקות
                    </span>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
