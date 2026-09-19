const BASE_URL = '/api';

// restaurants functions
// ------------------------------------------------------
//getRestaurants(),getRestaurantById(id),createRestaurant(restaurantData),
// client/src/services/api.js


async function request(endpoint, method = 'GET', data = null) {
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // 1. שולפים את הטוקן מאיפה שהוא נשמר (לרוב ב-localStorage תחת השם 'token')
    const token = localStorage.getItem('token');

    // 2. אם קיים טוקן, מוסיפים אותו ל-Headers בפורמט הסטנדרטי
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let message = `Error: ${response.status}`;

        try {
            const errorData = await response.json();
            if (errorData.error) {
                message = errorData.error;
            }
        } catch (error) {
            // response body is not JSON or is empty
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

    return JSON.parse(text);
}

//restaurants
export const getRestaurants = () => request('/restaurants');
export const getRestaurantById = (id) => request(`/restaurants/${id}`);
export const createRestaurant = (data) => request('/restaurants', 'POST', data);
export const updateRestaurant = (id, data) => request(`/restaurants/${id}`, 'PATCH', data);
export const deleteRestaurant = (id) => request(`/restaurants/${id}`, 'DELETE');
// products
export const getProducts = (id) => request(`/restaurants/${id}/products`);
export const addProduct = (id, productData) => request(`/restaurants/${id}/products`, 'POST', productData);
export const deleteProduct = (id, pId) => request(`/restaurants/${id}/products/${pId}`, 'DELETE');
export const updateProduct = (id, pId, productData) => request(`/restaurants/${id}/products/${pId}`, 'PATCH', productData);
// orders
export const createOrder = (orderData) => request('/orders', 'POST', orderData);
export const getUserOrders = () => request('/orders', 'GET');
export const deleteOrder = (id) => request(`/orders/${id}`, 'DELETE', null);
export const getOrderById = (id) => request(`/orders/${id}`,'GET');
// query
export const getQuery = (query) => request(`/search/${encodeURIComponent(query)}`, 'GET');
// auth
export const register = (userData) => request('/users', 'POST', userData);

export const login = (credentials) => request('/tokens', 'POST', credentials);
