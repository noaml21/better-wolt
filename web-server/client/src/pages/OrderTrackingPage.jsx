import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrderById } from '../services/api';
import {
  formatClock,
  formatOrderNumber,
  getSecondsLeft,
  getSegmentFill,
  getStageIndex,
  getStageTimes,
  stages,
  DELIVERY_SECONDS,
} from '../services/orderStatus';
import { itemCount } from '../services/counts';
import { getLine } from '../services/restaurantMeta';
import {
  EmptyState,
  ErrorState,
  InlineMessage,
  LinkButton,
  Skeleton,
  formatPrice,
} from '../components/ui';
import './OrderTrackingPage.css';

/* The showpiece (V5 spec §6): the LED board with the arrival time, the
   restaurant's line map filling with elapsed time, and the receipt as a
   ticket. Progress is derived from the order's startTime, which is
   what the clients have always done — the server does not advance status
   (ARCHITECTURE §6). The countdown recomputes from the timestamp on every
   tick rather than decrementing, so a backgrounded tab stays correct. */

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  /* Set by usePlaceOrder when the server charged a different total from
     the one the cart showed (a price changed after the dish was added). */
  const priceCorrection = useLocation().state?.priceCorrection;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [secondsLeft, setSecondsLeft] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');

    try {
      const data = await getOrderById(orderId);

      setOrder(data);
      setSecondsLeft(getSecondsLeft(data));
      setStatus('ready');
    } catch (error) {
      setStatus(error.status === 404 ? 'missing' : 'error');
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const timer = window.setInterval(() => setSecondsLeft(getSecondsLeft(order)), 1000);

    return () => window.clearInterval(timer);
  }, [order]);

  if (status === 'loading') {
    return (
      <div className="bw-page bw-tracking" aria-busy="true">
        <Skeleton className="bw-tracking__board" height={null} />
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <div className="bw-page bw-page--narrow">
        <EmptyState
          level={1}
          icon="bag"
          title="ההזמנה הזו לא נמצאה"
          description="ייתכן שהיא נמחקה, או ששייכת לחשבון אחר."
          action={<LinkButton to="/orders">להזמנות שלי</LinkButton>}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bw-page bw-page--narrow">
        <ErrorState level={1} description="לא הצלחנו להביא את פרטי ההזמנה." onRetry={load} />
      </div>
    );
  }

  const stageIndex = getStageIndex(secondsLeft);
  const arrived = secondsLeft <= 0;
  const stage = stages[stageIndex];
  const stageTimes = getStageTimes(order);
  const arrivalTime = Number.isFinite(Number(order.startTime))
    ? formatClock(Number(order.startTime) + DELIVERY_SECONDS * 1000)
    : null;
  const minutesLeft = Math.ceil(secondsLeft / 60);
  const units = (order.orderItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  /* The order carries its restaurant's id and name, which is all the
     line needs — the same line the restaurant has on the board. */
  const line = getLine({ id: order.restaurant, name: order.restaurantName });

  return (
    <div className={`bw-page bw-tracking ${line.className}`}>
      <section className={`bw-tracking__board ${arrived ? 'bw-tracking__board--arrived' : ''}`} aria-label="מצב ההזמנה">
        <header className="bw-tracking__intro">
          <h1 className="bw-tracking__title">{arrived ? 'ההזמנה הגיעה' : 'ההזמנה בדרך'}</h1>
          <p className="bw-tracking__meta">
            {order.restaurant ? (
              <Link className="bw-tracking__restaurant" to={`/restaurant/${order.restaurant}`}>
                <bdi>{order.restaurantName}</bdi>
              </Link>
            ) : (
              <bdi>{order.restaurantName}</bdi>
            )}
            <span className="bw-order-number">{formatOrderNumber(order.id)}</span>
          </p>
        </header>

        <div className="bw-tracking__eta">
          {arrived ? (
            <>
              <p className="bw-tracking__label">בתיאבון</p>
              {arrivalTime && (
                <p className="bw-tracking__big bw-num" aria-label={`הגיעה ב-${arrivalTime}`}>
                  {arrivalTime}
                </p>
              )}
            </>
          ) : (
            <>
              {/* The clock time is what a person plans around; the
                  minutes are the reassurance. Neither is announced every
                  tick — the stage note below is the live region. */}
              <p className="bw-tracking__label">מגיעה ב־</p>
              <p className="bw-tracking__big bw-num" aria-live="off">
                {arrivalTime}
              </p>
              <p className="bw-tracking__left">
                עוד{' '}
                <span key={minutesLeft} className="bw-num bw-tracking__minutes">
                  {minutesLeft}
                </span>{' '}
                דק׳
              </p>
            </>
          )}
        </div>

        {/* The live region. Once delivered the big word already says it,
            so the note is kept for screen readers only. */}
        <p className={`bw-tracking__status ${arrived ? 'bw-visually-hidden' : ''}`} role="status">
          {stage.note}
        </p>
      </section>

      <ol className="bw-track" aria-label="שלבי ההזמנה">
        {stages.map((item, index) => {
          const done = index < stageIndex || arrived;
          const current = index === stageIndex && !arrived;

          return (
            <li
              key={item.key}
              className={`bw-track__stop ${done ? 'bw-track__stop--done' : ''} ${current ? 'bw-track__stop--current' : ''}`}
              aria-current={index === stageIndex ? 'step' : undefined}
            >
              <span className="bw-track__dot" aria-hidden="true" />
              {index < stages.length - 1 && (
                <span className="bw-track__segment" aria-hidden="true">
                  <span
                    className="bw-track__fill"
                    style={{ '--fill': arrived ? 1 : getSegmentFill(index, secondsLeft) }}
                  />
                </span>
              )}
              <span className="bw-track__label">{item.label}</span>
              {stageTimes[index] && <span className="bw-track__time bw-num">{stageTimes[index]}</span>}
            </li>
          );
        })}
      </ol>

      <div className="bw-tracking__bottom">
        <section className="bw-tracking__receipt" aria-labelledby="bw-receipt-title">
          <header className="bw-tracking__receipt-head">
            <span className="bw-tracking__badge" aria-hidden="true">
              {line.number}
            </span>
            <h2 id="bw-receipt-title">מה בהזמנה</h2>
            <span className="bw-tracking__units">{itemCount(units)}</span>
          </header>

          <ul className="bw-tracking__items">
            {(order.orderItems || []).map((item) => (
              <li key={item.productId}>
                <span className="bw-tracking__item-name">
                  <span className="bw-tracking__item-quantity bw-num" dir="ltr">
                    {item.quantity}×
                  </span>
                  <span className="bw-tracking__item-label">{item.name}</span>
                </span>
                <span className="bw-num">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <p className="bw-tracking__total">
            <span>סך הכול</span>
            <strong className="bw-num">{formatPrice(order.total)}</strong>
          </p>

          {priceCorrection && (
            <InlineMessage tone="info" className="bw-tracking__correction">
              מחיר של מנה השתנה בתפריט אחרי שהוספתם אותה. הסל הראה{' '}
              <span className="bw-num">{formatPrice(priceCorrection.shown)}</span>, וההזמנה חויבה לפי המחיר
              העדכני: <span className="bw-num">{formatPrice(priceCorrection.charged)}</span>.
            </InlineMessage>
          )}
        </section>

        <div className="bw-tracking__actions">
          {order.restaurant && (
            <LinkButton to={`/restaurant/${order.restaurant}`} variant="secondary" icon="store">
              להזמין שוב
            </LinkButton>
          )}
          <LinkButton to="/orders" variant="ghost">
            לכל ההזמנות
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
