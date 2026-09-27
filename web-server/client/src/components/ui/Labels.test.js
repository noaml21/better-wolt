import { formatPrice } from './Labels';

test('prices are shekels first, grouped by thousands, with agorot only when there are any', () => {
  expect(formatPrice(62)).toBe('₪62');
  expect(formatPrice(64.5)).toBe('₪64.50');
  expect(formatPrice(0)).toBe('₪0');
  expect(formatPrice(1000)).toBe('₪1,000');
  expect(formatPrice(1000000)).toBe('₪1,000,000');
  expect(formatPrice(1234567.891)).toBe('₪1,234,567.89');
  expect(formatPrice('not a number')).toBe('₪0');
});
