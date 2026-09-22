import { dishCount, itemCount, orderCount, restaurantCount } from './counts';

/* Hebrew has no "1 items". These four helpers exist because the V3 pass
   found "1 מנות" and "1 פריטים" shipped in the interface, so the rule is
   worth a test: one of anything reads as a word, not as a digit. */

describe('Hebrew counting', () => {
  it('writes one of each kind as a word, not a number', () => {
    expect(dishCount(1)).toBe('מנה אחת');
    expect(itemCount(1)).toBe('פריט אחד');
    expect(orderCount(1)).toBe('הזמנה אחת');
    expect(restaurantCount(1)).toBe('מסעדה אחת');
  });

  it('counts anything else with the plural', () => {
    expect(dishCount(0)).toBe('0 מנות');
    expect(dishCount(2)).toBe('2 מנות');
    expect(itemCount(3)).toBe('3 פריטים');
    expect(orderCount(6)).toBe('6 הזמנות');
    expect(restaurantCount(14)).toBe('14 מסעדות');
  });
});
