/* Order progress, derived on the client.

   The server never advances an order's status — it is created as the
   display string "בדרך 🛵" and stays there (ARCHITECTURE §5, §6). The
   clients have always derived the delivery timeline from `startTime`;
   V3 keeps exactly that arithmetic and only changes how it is shown. */

export const DELIVERY_SECONDS = 1800;

export function getSecondsLeft(order, now = Date.now()) {
  if (!order?.startTime) {
    return DELIVERY_SECONDS;
  }

  const elapsed = Math.floor((now - order.startTime) / 1000);

  return Math.max(0, DELIVERY_SECONDS - elapsed);
}

export function isActive(order) {
  return Boolean(order?.status?.includes('בדרך')) && getSecondsLeft(order) > 0;
}

export const stages = [
  { key: 'received', label: 'ההזמנה התקבלה', note: 'המסעדה קיבלה את ההזמנה' },
  { key: 'preparing', label: 'בהכנה', note: 'מכינים את המנות שלכם' },
  { key: 'onTheWay', label: 'בדרך אליכם', note: 'השליח יצא עם ההזמנה' },
  { key: 'delivered', label: 'הגיעה', note: 'בתיאבון' },
];

export function getStageIndex(secondsLeft) {
  if (secondsLeft <= 0) {
    return 3;
  }

  if (secondsLeft <= 900) {
    return 2;
  }

  if (secondsLeft <= 1740) {
    return 1;
  }

  return 0;
}

export function getProgress(secondsLeft) {
  return Math.min(100, Math.max(0, ((DELIVERY_SECONDS - secondsLeft) / DELIVERY_SECONDS) * 100));
}

export function formatCountdown(secondsLeft) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/* Mongo ids are 24 characters and unreadable. Orders are referred to by
   their last six, which is what a support conversation would use. */
export function formatOrderNumber(orderId) {
  return `#${String(orderId || '').slice(-6).toUpperCase()}`;
}

export function summariseItems(order, limit = 3) {
  const items = order?.orderItems || [];
  const names = items.slice(0, limit).map((item) => `${item.quantity}× ${item.name}`);
  const rest = items.length - names.length;

  return rest > 0 ? `${names.join(' · ')} ועוד ${rest}` : names.join(' · ');
}
