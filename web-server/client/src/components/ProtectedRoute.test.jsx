import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function base64Url(value) {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// AuthContext only decodes the payload (the server verifies the signature).
function fakeJwt(payload) {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;
}

function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div>my orders</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

afterEach(() => {
  localStorage.clear();
});

test('redirects to /login when not signed in', () => {
  renderAt('/orders');

  expect(screen.getByText('login page')).toBeInTheDocument();
  expect(screen.queryByText('my orders')).not.toBeInTheDocument();
});

test('renders the protected page with a stored, unexpired session', () => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem('token', fakeJwt({ username: 'dana', exp }));
  localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dana' }));

  renderAt('/orders');

  expect(screen.getByText('my orders')).toBeInTheDocument();
});

test('treats an expired stored token as signed out and clears it', () => {
  const exp = Math.floor(Date.now() / 1000) - 60;
  localStorage.setItem('token', fakeJwt({ username: 'dana', exp }));
  localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dana' }));

  renderAt('/orders');

  expect(screen.getByText('login page')).toBeInTheDocument();
  expect(localStorage.getItem('token')).toBeNull();
});
