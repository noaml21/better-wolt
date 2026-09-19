const mongoose = require('mongoose');
const Order = require('../models/Order');
const Restaurant = require('../features/restaurants/restaurant.model');
const usersService = require('../features/users/users.service');

const INITIAL_ORDER_STATUS = 'בדרך 🛵';

function orderError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function toApiOrder(order) {
    if (!order) {
        return null;
    }

    return {
        id: order.id,
        username: order.username,
        restaurant: order.restaurant,
        restaurantName: order.restaurantName || '',
        products: order.products || [],
        orderItems: (order.orderItems || []).map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        items: order.items || 0,
        total: order.total || 0,
        status: order.status || INITIAL_ORDER_STATUS,
        date: order.date || '',
        startTime: order.startTime
    };
}

async function getUserOrders(username) {
    const orders = await Order.find({
        username: String(username)
    });

    return orders.map(toApiOrder);
}

async function getOrderById(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    const order = await Order.findById(id);
    return toApiOrder(order);
}

async function createOrder(data) {
    if (!data || !data.username || !data.restaurant) {
        throw orderError('Missing required order fields', 400);
    }

    if (!Array.isArray(data.products) || data.products.length === 0) {
        throw orderError('Order must contain at least one product', 400);
    }

    const user = await usersService.findUserByUsername(data.username);

    if (!user) {
        throw orderError('Invalid username', 404);
    }

    if (!mongoose.isValidObjectId(data.restaurant)) {
        throw orderError('Restaurant not found', 404);
    }

    const restaurant = await Restaurant.findById(data.restaurant);

    if (!restaurant) {
        throw orderError('Restaurant not found', 404);
    }

    const menuProducts = new Map(
        (restaurant.products || []).map(product => [String(product.id), product])
    );
    const requestedQuantities = new Map();

    for (const requestedProduct of data.products) {
        if (!requestedProduct || typeof requestedProduct !== 'object') {
            throw orderError('Each product must include an id and quantity', 400);
        }

        const productId = String(requestedProduct.id || '');
        const quantity = requestedProduct.quantity;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw orderError('Quantity must be a positive integer', 400);
        }

        const menuProduct = menuProducts.get(productId);

        if (!menuProduct) {
            throw orderError('Product not found in restaurant menu', 404);
        }

        requestedQuantities.set(
            productId,
            (requestedQuantities.get(productId) || 0) + quantity
        );
    }

    const orderItems = Array.from(requestedQuantities, ([productId, quantity]) => {
        const menuProduct = menuProducts.get(productId);

        return {
            productId,
            name: menuProduct.name,
            price: menuProduct.price,
            quantity
        };
    });
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = Math.round(
        orderItems.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
        ) * 100
    ) / 100;
    const productIds = orderItems.flatMap(item =>
        Array.from({ length: item.quantity }, () => item.productId)
    );

    const order = new Order({
        username: user.username,
        restaurant: String(restaurant.id),
        restaurantName: restaurant.name,
        products: productIds,
        orderItems,
        items: itemCount,
        total,
        status: INITIAL_ORDER_STATUS,
        date: new Date().toISOString().split('T')[0],
        startTime: Date.now()
    });

    const savedOrder = await order.save();
    return toApiOrder(savedOrder);
}

async function deleteOrder(id) {
    if (!mongoose.isValidObjectId(id)) {
        return false;
    }

    const order = await Order.findById(id);

    if (!order) {
        return false;
    }

    await order.deleteOne();
    return true;
}

module.exports = {
    getUserOrders,
    getOrderById,
    createOrder,
    deleteOrder,
    toApiOrder
};
