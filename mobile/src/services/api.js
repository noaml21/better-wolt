// Android Emulator: http://10.0.2.2:8080/api
const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api'
).replace(/\/+$/, '');

async function request(endpoint, options = {}, token = null) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),

      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();

      message =
        errorData.error ||
        errorData.message ||
        message;
    } catch {
      // The server did not return JSON.
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The server returned invalid JSON');
  }
}

export async function getRestaurants() {
  const result = await request('/restaurants');

  if (!Array.isArray(result)) {
    return result;
  }

  return result.map(normalizeRestaurant);
}

export async function getRestaurantById(restaurantId) {
  const result = await request(`/restaurants/${restaurantId}`);
  return normalizeRestaurant(result);
}

export async function searchRestaurants(query) {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    return [];
  }

  const result = await request(
    `/search/${encodeURIComponent(normalizedQuery)}`
  );

  if (Array.isArray(result)) {
    return result.map(normalizeRestaurant);
  }

  if (Array.isArray(result?.restaurants)) {
    return result.restaurants.map(normalizeRestaurant);
  }

  return [];
}

export async function getUserOrders(token) {
  const result = await request(
    '/orders',
    {
      method: 'GET',
    },
    token
  );

  if (!Array.isArray(result)) {
    return result;
  }

  return result.map(normalizeEntity);
}

export async function createRestaurant(token, restaurantData) {
  const result = await request(
    '/restaurants',
    {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    },
    token
  );

  return normalizeRestaurant(result);
}

export async function updateRestaurant(token, restaurantId, restaurantData) {
  const result = await request(
    `/restaurants/${restaurantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(restaurantData),
    },
    token
  );

  return normalizeRestaurant(result);
}

export function createOrder(token, payload) {
  return request(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  );
}

export function register(userData) {
  return request(
    '/users',
    {
      method: 'POST',
      body: JSON.stringify(userData),
    }
  );
}
export function login (credentials) {
  return request(
    '/tokens',
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    }
  );
}



export function deleteRestaurant(token, restaurantId) {
  return request(
    `/restaurants/${restaurantId}`,
    {
      method: 'DELETE',
    },
    token
  );
}

export function createProduct(
  token,
  restaurantId,
  productData
) {
  return request(
    `/restaurants/${restaurantId}/products`,
    {
      method: 'POST',
      body: JSON.stringify(productData),
    },
    token
  );
}

export function updateProduct(
  token,
  restaurantId,
  productId,
  productData
) {
  return request(
    `/restaurants/${restaurantId}/products/${productId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(productData),
    },
    token
  );
}

export function deleteProduct(
  token,
  restaurantId,
  productId
) {
  return request(
    `/restaurants/${restaurantId}/products/${productId}`,
    {
      method: 'DELETE',
    },
    token
  );
}

export async function getWorldCupRestaurant() {
  const results = await searchRestaurants(
    'חגיגת מונדיאל'
  );

  if (!Array.isArray(results)) {
    throw new Error(
      'The server returned an invalid World Cup response'
    );
  }

  return (
    results.find(
      (restaurant) =>
        restaurant?.name?.trim() ===
        'חגיגת מונדיאל'
    ) || null
  );
}

function normalizeEntity(entity) {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  return {
    ...entity,
    id: entity.id || entity._id,
  };
}

function normalizeRestaurant(restaurant) {
  const normalized = normalizeEntity(restaurant);

  if (!normalized || typeof normalized !== 'object') {
    return normalized;
  }

  const products = Array.isArray(normalized.products)
    ? normalized.products.map(normalizeEntity)
    : [];

  return {
    ...normalized,
    products,
  };
}
