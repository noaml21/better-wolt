import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import { itemCount, orderCount } from '../services/counts';
import {
  DELIVERY_SECONDS,
  formatClock,
  formatOrderDay,
  formatOrderNumber,
  getSecondsLeft,
  isActive,
  summariseItems,
} from '../services/orderStatus';
import {
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  SectionHeader,
  Skeleton,
  formatPrice,
} from '../components/ui';
import { getLine } from '../services/restaurantMeta';
import './OrdersPage.css';

/* Orders on their way first — as LED rows — then history by day, each day
   one ruled list of order rows with the restaurant's line badge (V5 spec
   §6). Every past order leads back somewhere useful: its receipt,
   or the restaurant to order again. */

function groupByDay(orders) {
  const groups = [];

  orders.forEach((order) => {
    const last = groups[groups.length - 1];

    if (last && last.key === order.date) {
      last.orders.push(order);
    } else {
      groups.push({ key: order.date, orders: [order] });
    }
  });

  return groups;
}

function lineOf(order) {
  return getLine({ id: order.restaurant, name: order.restaurantName });
}

function ActiveOrder({ order }) {
  const start = Number(order.startTime);
  const arrival = Number.isFinite(start) ? formatClock(start + DELIVERY_SECONDS * 1000) : null;
  const minutes = Math.ceil(getSecondsLeft(order) / 60);
  const line = lineOf(order);

  return (
    <li>
      <Link to={`/tracking/${order.id}`} className={`bw-active-order ${line.className}`}>
        <span className="bw-active-order__badge" aria-hidden="true">
          {line.number}
        </span>
        <span className="bw-active-order__name">
          <bdi>{order.restaurantName}</bdi>
        </span>
        {arrival && (
          <span className="bw-active-order__when">
            מגיעה ב־<span className="bw-num">{arrival}</span>
          </span>
        )}
        <span className="bw-active-order__left">
          עוד <span className="bw-num">{minutes}</span> דק׳
        </span>
        <span className="bw-active-order__cta">
          למעקב
          <Icon name="back" size={16} />
        </span>
      </Link>
    </li>
  );
}

function PastOrder({ order }) {
  const start = Number(order.startTime);
  const items = summariseItems(order);
  const line = lineOf(order);

  return (
    <li className={`bw-past-order ${line.className}`}>
      <span className="bw-past-order__badge" aria-hidden="true">
        {line.number}
      </span>

      <div className="bw-past-order__text">
        <h4 className="bw-past-order__name">{order.restaurantName}</h4>
        {items && <p className="bw-past-order__items">{items}</p>}
        <p className="bw-past-order__meta">
          {Number.isFinite(start) && <span className="bw-num">{formatClock(start)}</span>}
          <span className="bw-order-number">{formatOrderNumber(order.id)}</span>
          <span>{itemCount(order.items)}</span>
        </p>
      </div>

      <p className="bw-past-order__total bw-num">{formatPrice(order.total)}</p>

      <div className="bw-past-order__actions">
        <Link to={`/tracking/${order.id}`} className="bw-past-order__link">
          פרטים
          <span className="bw-visually-hidden"> של ההזמנה {formatOrderNumber(order.id)}</span>
        </Link>
        {order.restaurant && (
          <Link to={`/restaurant/${order.restaurant}`} className="bw-past-order__link bw-past-order__link--again">
            להזמין שוב
            <span className="bw-visually-hidden"> מ{order.restaurantName}</span>
          </Link>
        )}
      </div>
    </li>
  );
}

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

  const active = orders.filter(isActive);
  const past = orders.filter((order) => !isActive(order));

  return (
    <div className="bw-page bw-orders-page">
      <SectionHeader
        level={1}
        title="ההזמנות שלי"
        description={status === 'ready' && orders.length > 0 ? `${orderCount(orders.length)} בחשבון שלכם.` : undefined}
      />

      {status === 'loading' && (
        <div className="bw-order-day" aria-busy="true">
          <Skeleton width={90} height={14} />
          <div className="bw-order-list">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="bw-past-order">
                <div className="bw-past-order__text">
                  <Skeleton width="40%" height={18} />
                  <Skeleton width="70%" height={12} />
                </div>
                <Skeleton width={56} height={18} />
              </div>
            ))}
          </div>
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

      {status === 'ready' && active.length > 0 && (
        <section className="bw-orders-section" aria-labelledby="bw-orders-active">
          <h2 className="bw-orders-section__title" id="bw-orders-active">
            בדרך אליכם
          </h2>
          <ul className="bw-active-orders">
            {active.map((order) => (
              <ActiveOrder key={order.id} order={order} />
            ))}
          </ul>
        </section>
      )}

      {status === 'ready' && past.length > 0 && (
        <section className="bw-orders-section" aria-labelledby="bw-orders-past">
          <h2 className="bw-orders-section__title" id="bw-orders-past">
            הזמנות קודמות
          </h2>
          {groupByDay(past).map((group) => (
            <div key={group.key} className="bw-order-day">
              <h3 className="bw-order-day__title">{formatOrderDay(group.key)}</h3>
              <ul className="bw-order-list">
                {group.orders.map((order) => (
                  <PastOrder key={order.id} order={order} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
