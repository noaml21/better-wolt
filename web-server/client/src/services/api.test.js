import { NETWORK_ERROR, createOrder, deleteOrder, getQuery, getRestaurants, login } from './api';

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

test('throws the server error message and status on failure', async () => {
  global.fetch.mockResolvedValue(mockResponse(404, { error: 'Restaurant not found' }));

  await expect(getRestaurants()).rejects.toThrow('Restaurant not found');
  await expect(getRestaurants()).rejects.toMatchObject({ status: 404 });
});

test('surfaces rate limiting (429) with the server message', async () => {
  global.fetch.mockResolvedValue(mockResponse(429, { error: 'Too many requests' }));

  await expect(login({ username: 'a', password: 'b' })).rejects.toMatchObject({
    message: 'Too many requests',
    status: 429,
  });
});

test('encodes the search query as one path segment', async () => {
  global.fetch.mockResolvedValue(mockResponse(200, []));

  await getQuery('fish & chips/#1?');

  expect(global.fetch.mock.calls[0][0]).toBe('/api/search/fish%20%26%20chips%2F%231%3F');
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

test('a request that never got an answer fails with a readable message', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

  await expect(createOrder({ restaurant: 'r1', products: [] })).rejects.toMatchObject({
    message: NETWORK_ERROR,
    status: 0,
  });
});
