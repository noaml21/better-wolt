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

/* When each stage begins, in seconds after the order was placed — the
   same thresholds getStageIndex reads, stated the other way round. */
export const STAGE_STARTS = [0, DELIVERY_SECONDS - 1740, DELIVERY_SECONDS - 900, DELIVERY_SECONDS];

/* How far along the segment after stage `index` the order is, 0…1. The
   tracking rail draws stages evenly spaced, so each segment fills at its
   own pace rather than the first one taking 3% of the width. */
export function getSegmentFill(index, secondsLeft) {
  const elapsed = DELIVERY_SECONDS - secondsLeft;
  const from = STAGE_STARTS[index];
  const to = STAGE_STARTS[index + 1];

  if (to === undefined) {
    return 0;
  }

  return Math.min(1, Math.max(0, (elapsed - from) / (to - from)));
}

const clockFormat = new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export function formatClock(epochMs) {
  return clockFormat.format(new Date(epochMs));
}

/* The clock time each stage starts, for an order with a startTime. */
export function getStageTimes(order) {
  const start = Number(order?.startTime);

  return Number.isFinite(start) ? STAGE_STARTS.map((offset) => formatClock(start + offset * 1000)) : [];
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
  // Each name is its own bidi isolate (FSI…PDI): a dish called "Pizza 30cm"
  // would otherwise pull the neighbouring count and separator into its run.
  const names = items.slice(0, limit).map((item) => `${item.quantity}× \u2068${item.name}\u2069`);
  const rest = items.length - names.length;

  return rest > 0 ? `${names.join(' · ')} ועוד ${rest}` : names.join(' · ');
}
