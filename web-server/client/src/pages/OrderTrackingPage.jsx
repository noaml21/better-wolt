import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getOrderById } from '../services/api';
import {
  formatCountdown,
  formatOrderNumber,
  getProgress,
  getSecondsLeft,
  getStageIndex,
  stages,
} from '../services/orderStatus';
import {
  Card,
  EmptyState,
  ErrorState,
  Icon,
  InlineMessage,
  LinkButton,
  Skeleton,
  formatPrice,
} from '../components/ui';
import './OrderTrackingPage.css';

/* The showpiece. Progress is derived from the order's startTime, which is
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
      <div className="bw-page bw-page--narrow" aria-busy="true">
        <Skeleton height={260} radius="lg" />
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
  const progress = getProgress(secondsLeft);
  const arrived = secondsLeft <= 0;
  const stage = stages[stageIndex];

  return (
    <div className="bw-page bw-page--narrow bw-tracking">
      <header className="bw-tracking__intro">
        <h1>{arrived ? 'ההזמנה הגיעה' : 'ההזמנה בדרך'}</h1>
        <p className="bw-meta">
          {order.restaurantName}
          {' · '}
          <span className="bw-order-number">{formatOrderNumber(order.id)}</span>
        </p>
      </header>

      <section className={`bw-tracking__stage ${arrived ? 'bw-tracking__stage--arrived' : ''}`}>
        <p className="bw-tracking__countdown-label">{arrived ? 'ההזמנה הגיעה' : 'זמן משוער להגעה'}</p>

        <p className="bw-tracking__countdown bw-display" aria-live="off">
          {arrived ? <Icon name="check" size={64} strokeWidth={2.2} /> : formatCountdown(secondsLeft)}
        </p>

        <p className="bw-tracking__status" role="status">
          {stage.note}
        </p>

        <div className="bw-tracking__rail">
          <div className="bw-tracking__track" aria-hidden="true">
            <span className="bw-tracking__fill" style={{ width: `${progress}%` }} />
            <span className="bw-tracking__rider" style={{ insetInlineStart: `${progress}%` }}>
              <Icon name={arrived ? 'check' : 'scooter'} size={20} />
            </span>
          </div>

          <ol className="bw-tracking__stops">
            {stages.map((item, index) => (
              <li
                key={item.key}
                className={`bw-tracking__stop ${index <= stageIndex ? 'bw-tracking__stop--done' : ''}`}
                aria-current={index === stageIndex ? 'step' : undefined}
              >
                {item.label}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Card className="bw-tracking__summary">
        <h2>מה בהזמנה</h2>

        <ul className="bw-tracking__items">
          {(order.orderItems || []).map((item) => (
            <li key={item.productId}>
              <span className="bw-tracking__item-name">
                <span className="bw-tracking__item-quantity" dir="ltr">
                  {item.quantity}×
                </span>
                {item.name}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <p className="bw-tracking__total">
          <span>סך הכול</span>
          <strong>{formatPrice(order.total)}</strong>
        </p>

        {priceCorrection && (
          <InlineMessage tone="info" className="bw-tracking__correction">
            מחיר של מנה השתנה בתפריט אחרי שהוספתם אותה. הסל הראה{' '}
            <span className="bw-num">{formatPrice(priceCorrection.shown)}</span>, וההזמנה חויבה לפי המחיר
            העדכני: <span className="bw-num">{formatPrice(priceCorrection.charged)}</span>.
          </InlineMessage>
        )}
      </Card>

      <div className="bw-actions">
        <LinkButton to="/orders" variant="secondary">
          לכל ההזמנות
        </LinkButton>
        <LinkButton to="/restaurants" variant="ghost">
          להזמין עוד משהו
        </LinkButton>
      </div>
    </div>
  );
}
