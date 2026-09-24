import { render, screen } from '@testing-library/react';
import { matchNote } from './SearchResultsPage';

const restaurant = {
  name: 'המבורגר בר',
  address: 'אבן גבירול 44',
  products: [
    { name: 'צ׳יפס בטטה', description: 'עם איולי שום' },
    { name: 'Pizza Margherita', description: '' },
  ],
};

function text(node) {
  return node ? render(<p>{node}</p>).container.textContent : null;
}

test('a restaurant that matched by name needs no note', () => {
  expect(matchNote(restaurant, 'המבורגר')).toBeNull();
});

test('a dish-name match names the dish and marks the searched text, ignoring case', () => {
  render(<p data-testid="note">{matchNote(restaurant, 'pizza')}</p>);

  expect(screen.getByTestId('note')).toHaveTextContent(/^נמצא בתפריט: Pizza Margherita$/);
  expect(screen.getByText('Pizza', { selector: 'mark' })).toBeInTheDocument();
});

test('a description match names the dish it belongs to', () => {
  expect(text(matchNote(restaurant, 'שום'))).toBe('נמצא בתפריט: צ׳יפס בטטה (עם איולי שום)');
});

test('an address match says so, and nothing matching gives no note', () => {
  expect(text(matchNote(restaurant, 'גבירול'))).toBe('בכתובת: אבן גבירול 44');
  expect(matchNote(restaurant, 'סושי')).toBeNull();
});
