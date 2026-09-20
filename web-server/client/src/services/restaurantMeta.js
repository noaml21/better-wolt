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
