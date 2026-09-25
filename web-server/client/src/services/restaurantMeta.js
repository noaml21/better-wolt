/* Presentation-only metadata.

   The API models a restaurant as { id, username, name, phone, address,
   image, products } — there is no rating, delivery time or delivery fee
   (ARCHITECTURE §4.1), and V3 does not change the contract to add one.
   Discovery still needs those cues to be readable, so they are derived
   from the restaurant id: stable across renders and reloads, never sent
   back to the server, and labelled as illustrative in the footer. */

function hashId(id) {
  const text = String(id || '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getRestaurantMeta(restaurant) {
  const hash = hashId(restaurant?.id);
  const rating = (7.9 + ((hash >>> 3) % 21) / 10).toFixed(1);
  const minMinutes = 15 + ((hash >>> 7) % 5) * 5;
  const deliveryFee = [0, 0, 5, 9, 12][(hash >>> 11) % 5];
  const isFree = deliveryFee === 0;
  const prices = (restaurant?.products || [])
    .map((product) => Number(product.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    rating,
    eta: `${minMinutes}-${minMinutes + 10}`,
    deliveryFee,
    deliveryLabel: isFree ? 'משלוח חינם' : `₪${deliveryFee} משלוח`,
    fromPrice: prices.length ? Math.min(...prices) : null,
  };
}

/* The restaurant's line (V5 spec §4.1): one of ten colours and a
   two-digit number, derived from the id like the rest of this file, so a
   restaurant keeps its line everywhere it appears. Presentation only; two
   restaurants may rarely share a number, and nothing depends on it being
   unique. The World Cup restaurant rides the board's own line. */
export const LINE_COLOURS = 10;

/* Any constant works; this one happens to give the seven demo restaurants
   seven different colours (docs/dev/demo-data.mjs). */
const LINE_SALT = 28;

/* Ids made one after another (MongoDB's are) differ only in their last
   characters, which barely moves the running hash; mixing its bits
   (murmur3's finaliser) spreads neighbours across the palette. */
function mix(hash) {
  let value = hash;

  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2b2ae35);
  value ^= value >>> 16;

  return value >>> 0;
}

export function getLine(restaurant) {
  if (restaurant?.name === WORLD_CUP_RESTAURANT_NAME) {
    return { colour: 'cup', number: 26, className: 'bw-line-cup' };
  }

  const hash = mix((hashId(restaurant?.id) + LINE_SALT) >>> 0);
  const colour = hash % LINE_COLOURS;
  const number = 10 + ((hash >>> 8) % 90);

  return { colour, number, className: `bw-line-${colour}` };
}

/* The seeded campaign restaurant (ARCHITECTURE §6). Its name is contract. */
export const WORLD_CUP_RESTAURANT_NAME = 'חגיגת מונדיאל';

export function findWorldCupRestaurant(restaurants) {
  return restaurants.find((restaurant) => restaurant.name === WORLD_CUP_RESTAURANT_NAME) || null;
}

export function getMenuHighlights(restaurant, limit = 3) {
  return (restaurant?.products || [])
    .slice(0, limit)
    .map((product) => product.name)
    .join(' · ');
}
