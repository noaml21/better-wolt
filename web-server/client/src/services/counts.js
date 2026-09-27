/* Hebrew counting.

   Hebrew has no "1 items": one dish is מנה אחת, not 1 מנות. Every count
   the interface writes out goes through here, so a list of one never
   reads like a bug. The mobile client keeps the same four helpers in
   mobile/src/services/presentation.js — the two clients stay separate on
   purpose (V2_SPEC §2), so this pair is duplicated deliberately. */

export function dishCount(count) {
  return count === 1 ? 'מנה אחת' : `${count} מנות`;
}

export function itemCount(count) {
  return count === 1 ? 'פריט אחד' : `${count} פריטים`;
}

export function orderCount(count) {
  return count === 1 ? 'הזמנה אחת' : `${count} הזמנות`;
}

export function restaurantCount(count) {
  return count === 1 ? 'מסעדה אחת' : `${count} מסעדות`;
}
