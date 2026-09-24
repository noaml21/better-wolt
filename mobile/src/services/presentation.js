/* Presentation helpers, mirroring the web client's restaurantMeta.js and
   orderStatus.js. The two clients stay separate on purpose (V2_SPEC §2),
   so this logic is duplicated deliberately and the rules are documented
   in one place: docs/V3_DESIGN_SPEC.md. */

function hashId(id) {
  const text = String(id || '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

/* The API has no rating, ETA or delivery fee (ARCHITECTURE §4.1). These
   are derived from the id so they stay stable, and they never travel
   back to the server. */
export function getRestaurantMeta(restaurant) {
  const hash = hashId(restaurant?.id);
  const rating = (7.9 + ((hash >>> 3) % 21) / 10).toFixed(1);
  const minMinutes = 15 + ((hash >>> 7) % 5) * 5;
  const deliveryFee = [0, 0, 5, 9, 12][(hash >>> 11) % 5];
  const prices = (restaurant?.products || [])
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    rating,
    eta: `${minMinutes}-${minMinutes + 10}`,
    deliveryFee,
    deliveryLabel: deliveryFee === 0 ? 'משלוח חינם' : `₪${deliveryFee} משלוח`,
    isFreeDelivery: deliveryFee === 0,
    fromPrice: prices.length ? Math.min(...prices) : null,
  };
}

/* The tint a restaurant's plate uses when it has no photo (V4 spec §4.1);
   the web client derives the same tone from the same id. */
const PLATE_TONES = ['amber', 'flame', 'herb', 'ink'];

export function getPlateTone(restaurant) {
  return PLATE_TONES[(hashId(restaurant?.id) >>> 5) % PLATE_TONES.length];
}

export function getMenuHighlights(restaurant, limit = 3) {
  return (restaurant?.products || [])
    .slice(0, limit)
    .map((product) => product.name)
    .join(' · ');
}

/* Delivery timeline. The server never advances an order's status
   (ARCHITECTURE §6), so progress comes from startTime. */
export const DELIVERY_SECONDS = 1800;

export function getSecondsLeft(order, now = Date.now()) {
  if (!order?.startTime) {
    return DELIVERY_SECONDS;
  }

  return Math.max(0, DELIVERY_SECONDS - Math.floor((now - order.startTime) / 1000));
}

export function isActive(order) {
  return Boolean(order?.status?.includes('בדרך')) && getSecondsLeft(order) > 0;
}

export const stages = [
  { key: 'received', label: 'התקבלה', note: 'המסעדה קיבלה את ההזמנה' },
  { key: 'preparing', label: 'בהכנה', note: 'מכינים את המנות שלכם' },
  { key: 'onTheWay', label: 'בדרך', note: 'השליח יצא עם ההזמנה' },
  { key: 'delivered', label: 'הגיעה', note: 'בתיאבון' },
];

export function getStageIndex(secondsLeft) {
  if (secondsLeft <= 0) return 3;
  if (secondsLeft <= 900) return 2;
  if (secondsLeft <= 1740) return 1;

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

/* The web client isolates the order number with CSS (`unicode-bidi:
   isolate`). React Native has no such property, so the same job is done
   with the Unicode isolate characters: without them the '#' drifts to
   the wrong end of a Hebrew line. */
export function formatOrderNumber(orderId) {
  return `\u2066#${String(orderId || '').slice(-6).toUpperCase()}\u2069`;
}

export function summariseItems(order, limit = 3) {
  const items = order?.orderItems || [];
  // Each name is its own bidi isolate (FSI…PDI): a dish called "Pizza 30cm"
  // would otherwise pull the neighbouring count and separator into its run.
  const names = items.slice(0, limit).map((item) => `${item.quantity}× \u2068${item.name}\u2069`);
  const rest = items.length - names.length;

  return rest > 0 ? `${names.join(' · ')} ועוד ${rest}` : names.join(' · ');
}

/* The seeded campaign restaurant (ARCHITECTURE §6). Its name is contract. */
export const WORLD_CUP_RESTAURANT_NAME = 'חגיגת מונדיאל';

export function findWorldCupRestaurant(restaurants) {
  return (restaurants || []).find((restaurant) => restaurant?.name === WORLD_CUP_RESTAURANT_NAME) || null;
}

/* Hebrew has no "1 items". One dish is מנה אחת. */
export function dishCount(count) {
  return count === 1 ? 'מנה אחת' : `${count} מנות`;
}

export function itemCount(count) {
  return count === 1 ? 'פריט אחד' : `${count} פריטים`;
}

export function orderCount(count) {
  return count === 1 ? 'הזמנה אחת' : `${count} הזמנות`;
}

export function resultCount(count) {
  return count === 1 ? 'תוצאה אחת' : `${count} תוצאות`;
}

/* V4 tracking and history helpers — the web client's orderStatus.js has
   the same rules (docs/V4_DESIGN_SPEC.md §5, §6). */

/* When each stage begins, in seconds after the order was placed: the
   thresholds getStageIndex reads, stated the other way round. */
export const STAGE_STARTS = [0, DELIVERY_SECONDS - 1740, DELIVERY_SECONDS - 900, DELIVERY_SECONDS];

export function getSegmentFill(index, secondsLeft) {
  const elapsed = DELIVERY_SECONDS - secondsLeft;
  const from = STAGE_STARTS[index];
  const to = STAGE_STARTS[index + 1];

  if (to === undefined) {
    return 0;
  }

  return Math.min(1, Math.max(0, (elapsed - from) / (to - from)));
}

/* Hermes' Intl is enough for times; padded by hand so the clock reads
   the same on every engine. */
export function formatClock(epochMs) {
  const date = new Date(epochMs);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function getStageTimes(order) {
  const start = Number(order?.startTime);

  return Number.isFinite(start) ? STAGE_STARTS.map((offset) => formatClock(start + offset * 1000)) : [];
}

export function getArrivalTime(order) {
  const start = Number(order?.startTime);

  return Number.isFinite(start) ? formatClock(start + DELIVERY_SECONDS * 1000) : null;
}

const MONTHS = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'];

function localDateKey(date) {
  const pad = (value) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* An order's day in words: היום, אתמול, or "22 בספטמבר". */
export function formatOrderDay(dateKey, now = new Date()) {
  if (!dateKey) {
    return '';
  }

  if (dateKey === localDateKey(now)) {
    return 'היום';
  }

  if (dateKey === localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) {
    return 'אתמול';
  }

  const [, month, day] = dateKey.split('-').map(Number);

  return month && day ? `${day} ${MONTHS[month - 1]}` : dateKey;
}

/* Why a search result matched when its name does not say so (V4 audit
   B3): the dish, the dish's description, or the address. Returns the
   pieces so the screen can mark the searched text. */
export function getMatchNote(restaurant, query) {
  const term = String(query || '').trim().toLowerCase();

  if (!term || restaurant?.name?.toLowerCase().includes(term)) {
    return null;
  }

  const split = (text) => {
    const at = text.toLowerCase().indexOf(term);

    return at < 0 ? { before: text, match: '', after: '' } : { before: text.slice(0, at), match: text.slice(at, at + term.length), after: text.slice(at + term.length) };
  };
  const products = restaurant?.products || [];
  const byName = products.find((product) => product.name?.toLowerCase().includes(term));

  if (byName) {
    return { label: 'נמצא בתפריט: ', ...split(byName.name) };
  }

  const byDescription = products.find((product) => product.description?.toLowerCase().includes(term));

  if (byDescription) {
    return { label: `נמצא בתפריט: ${byDescription.name} · `, ...split(byDescription.description) };
  }

  if (restaurant?.address?.toLowerCase().includes(term)) {
    return { label: 'בכתובת: ', ...split(restaurant.address) };
  }

  return null;
}
