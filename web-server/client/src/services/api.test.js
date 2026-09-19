import { createOrder, deleteOrder, getRestaurants } from './api';

function mockResponse(status, body) {
  const text = body === undefined ? '' : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(JSON.parse(text)),
    text: () => Promise.resolve(text),
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  localStorage.clear();
  delete global.fetch;
});

test('calls the relative /api path and parses JSON', async () => {
  global.fetch.mockResolvedValue(mockResponse(200, [{ id: 'r1' }]));

  await expect(getRestaurants()).resolves.toEqual([{ id: 'r1' }]);
  expect(global.fetch).toHaveBeenCalledWith('/api/restaurants', expect.objectContaining({ method: 'GET' }));
});

test('sends the stored token as a Bearer header', async () => {
  localStorage.setItem('token', 'abc.def.ghi');
  global.fetch.mockResolvedValue(mockResponse(201, { id: 'o1' }));

  await createOrder({ restaurant: 'r1', products: [{ id: 'p1', quantity: 1 }] });

  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer abc.def.ghi');
  expect(JSON.parse(options.body)).toEqual({ restaurant: 'r1', products: [{ id: 'p1', quantity: 1 }] });
});

test('omits the Authorization header without a token', async () => {
  global.fetch.mockResolvedValue(mockResponse(200, []));

  await getRestaurants();

  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBeUndefined();
});

test('throws the server error message on failure', async () => {
  global.fetch.mockResolvedValue(mockResponse(404, { error: 'Restaurant not found' }));

  await expect(getRestaurants()).rejects.toThrow('Restaurant not found');
});

test('falls back to the status code when the error body is not JSON', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 500,
    json: () => Promise.reject(new SyntaxError('not json')),
    text: () => Promise.resolve('<html>'),
  });

  await expect(getRestaurants()).rejects.toThrow('Error: 500');
});

test('204 No Content resolves to null', async () => {
  global.fetch.mockResolvedValue(mockResponse(204));

  await expect(deleteOrder('o1')).resolves.toBeNull();
});
