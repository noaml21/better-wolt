import { LINE_COLOURS, getLine, getRestaurantMeta } from './restaurantMeta';

describe('getLine', () => {
  it('gives a restaurant the same line every time', () => {
    const restaurant = { id: '66f1a2b3c4d5e6f708192a3b', name: 'המבורגר בר' };

    expect(getLine(restaurant)).toEqual(getLine({ ...restaurant }));
  });

  it('keeps colours and numbers in range', () => {
    for (let index = 0; index < 200; index += 1) {
      const line = getLine({ id: `66f1a2b3c4d5e6f7081${index.toString(16).padStart(5, '0')}`, name: 'x' });

      expect(line.colour).toBeGreaterThanOrEqual(0);
      expect(line.colour).toBeLessThan(LINE_COLOURS);
      expect(line.number).toBeGreaterThanOrEqual(10);
      expect(line.number).toBeLessThanOrEqual(99);
      expect(line.className).toBe(`bw-line-${line.colour}`);
    }
  });

  it('spreads restaurants across more than one colour', () => {
    const colours = new Set(
      Array.from({ length: 30 }, (_, index) => getLine({ id: `restaurant-${index}`, name: 'x' }).colour)
    );

    expect(colours.size).toBeGreaterThan(5);
  });

  it('puts the World Cup restaurant on the board line', () => {
    expect(getLine({ id: 'anything', name: 'חגיגת מונדיאל' }).className).toBe('bw-line-cup');
  });
});

describe('getRestaurantMeta', () => {
  it('reports the cheapest dish and ignores bad prices', () => {
    const meta = getRestaurantMeta({ id: 'a', products: [{ price: 62 }, { price: 24 }, { price: 'x' }, { price: 0 }] });

    expect(meta.fromPrice).toBe(24);
  });
});
