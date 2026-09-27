import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import ProtectedRoute from '../ProtectedRoute';
import TopBar from './TopBar';

function base64Url(value) {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function LoginProbe() {
  const location = useLocation();

  return <div>login page → {location.state?.from || 'nowhere'}</div>;
}

afterEach(() => localStorage.clear());

/* Signing out on a protected page must not leave that page behind as the
   place the next sign-in returns to: on a shared browser the next person
   would be sent to the previous account's order. */
test('signing out on a protected page goes home, not to a login that returns there', async () => {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  localStorage.setItem('token', `${base64Url({ alg: 'HS256' })}.${base64Url({ username: 'dana', exp })}.sig`);
  localStorage.setItem('user', JSON.stringify({ id: '1', username: 'dana', displayName: 'דנה' }));

  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/tracking/o1']}>
          <TopBar />
          <Routes>
            <Route path="/" element={<div>home page</div>} />
            <Route path="/login" element={<LoginProbe />} />
            <Route
              path="/tracking/:id"
              element={
                <ProtectedRoute>
                  <div>tracking page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  );

  fireEvent.click(screen.getByRole('button', { name: /דנה/ }));
  fireEvent.click(screen.getByRole('button', { name: 'התנתקות' }));

  expect(await screen.findByText('home page')).toBeInTheDocument();
  expect(screen.queryByText(/login page/)).not.toBeInTheDocument();
});
