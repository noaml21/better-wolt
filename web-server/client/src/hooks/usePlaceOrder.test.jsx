import { act, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/ui';
import { createOrder } from '../services/api';
import usePlaceOrder from './usePlaceOrder';

jest.mock('../services/api', () => ({
  ...jest.requireActual('../services/api'),
  createOrder: jest.fn(),
}));

function base64Url(value) {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const cart = { toOrderProducts: () => [{ id: 'p1', quantity: 1 }], clear: jest.fn(), subtotal: 20 };

function Menu() {
  const { placeOrder, problem, dismissProblem } = usePlaceOrder({ restaurantId: 'r1', cart, from: '/menu' });

  return (
    <>
      <button type="button" onClick={placeOrder}>order</button>
      <Link to="/elsewhere">leave</Link>
      {problem && <p data-testid="problem">{problem}</p>}
      <button type="button" onClick={dismissProblem}>dismiss</button>
    </>
  );
}

function Tracking() {
  const correction = useLocation().state?.priceCorrection;

  return <div>tracking page{correction ? ` ${correction.shown}→${correction.charged}` : ''}</div>;
}

function renderApp() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/menu']}>
          <Routes>
            <Route path="/menu" element={<Menu />} />
            <Route path="/elsewhere" element={<div>somewhere else</div>} />
            <Route path="/tracking/:id" element={<Tracking />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem('token', `${base64Url({ alg: 'HS256' })}.${base64Url({ username: 'dana', exp })}.sig`);
  localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dana' }));
});

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('an order goes to tracking when the menu page is still open', async () => {
  createOrder.mockResolvedValue({ id: 'o1', total: 20 });
  renderApp();

  fireEvent.click(screen.getByText('order'));

  expect(await screen.findByText('tracking page')).toBeInTheDocument();
  expect(createOrder).toHaveBeenCalledWith({ restaurant: 'r1', products: [{ id: 'p1', quantity: 1 }] });
});

test('an order that lands after the customer left does not pull them back', async () => {
  let answer;
  createOrder.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
  renderApp();

  fireEvent.click(screen.getByText('order'));
  fireEvent.click(screen.getByText('leave'));

  await act(async () => {
    answer({ id: 'o1' });
  });

  expect(screen.getByText('somewhere else')).toBeInTheDocument();
  expect(screen.queryByText('tracking page')).not.toBeInTheDocument();
  expect(screen.getByText(/ההזמנה נשלחה/)).toBeInTheDocument();
});

test('an order that lands after another tab switched account is not acted on', async () => {
  let answer;
  createOrder.mockReturnValue(new Promise((resolve) => { answer = resolve; }));
  renderApp();

  fireEvent.click(screen.getByText('order'));

  // Another tab signs in as someone else: storage changes, this tab hears it.
  const exp = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem('token', `${base64Url({ alg: 'HS256' })}.${base64Url({ username: 'noa', exp })}.sig`);
  localStorage.setItem('user', JSON.stringify({ id: '2', username: 'noa' }));
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
  });

  await act(async () => {
    answer({ id: 'o1' });
  });

  expect(screen.getByText('order')).toBeInTheDocument();
  expect(screen.queryByText('tracking page')).not.toBeInTheDocument();
  expect(screen.queryByText(/ההזמנה נשלחה/)).not.toBeInTheDocument();
});

test('a refused order is written beside the cart and stays until the next attempt', async () => {
  createOrder.mockRejectedValueOnce(Object.assign(new Error('Error processing request'), { status: 500 }));
  renderApp();

  fireEvent.click(screen.getByText('order'));

  expect(await screen.findByTestId('problem')).toHaveTextContent('Error processing request');
  expect(screen.queryByText('tracking page')).not.toBeInTheDocument();

  createOrder.mockResolvedValueOnce({ id: 'o1', total: 20 });
  fireEvent.click(screen.getByText('order'));

  expect(await screen.findByText('tracking page')).toBeInTheDocument();
});

test('a refused order can be dismissed', async () => {
  createOrder.mockRejectedValueOnce(Object.assign(new Error('Error processing request'), { status: 500 }));
  renderApp();

  fireEvent.click(screen.getByText('order'));
  await screen.findByTestId('problem');
  fireEvent.click(screen.getByText('dismiss'));

  expect(screen.queryByTestId('problem')).not.toBeInTheDocument();
});

test('a total the server corrected is handed to the tracking page', async () => {
  createOrder.mockResolvedValue({ id: 'o1', total: 27 });
  renderApp();

  fireEvent.click(screen.getByText('order'));

  expect(await screen.findByText('tracking page 20→27')).toBeInTheDocument();
});

test('an unchanged total hands nothing to the tracking page', async () => {
  createOrder.mockResolvedValue({ id: 'o1', total: 20 });
  renderApp();

  fireEvent.click(screen.getByText('order'));

  expect(await screen.findByText('tracking page')).toHaveTextContent(/^tracking page$/);
});
