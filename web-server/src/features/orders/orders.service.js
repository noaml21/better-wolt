const mongoose = require('mongoose');
const Order = require('./order.model');
const restaurantsService = require('../restaurants/restaurants.service');
const usersService = require('../users/users.service');
const { AppError } = require('../../http/errors');

const INITIAL_ORDER_STATUS = 'בדרך 🛵';

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

// Every order route answers 404 'Invalid username' when the token's user no
// longer exists.
async function findCaller(username) {
    const user = await usersService.findUserByUsername(username);

    if (!user) {
        throw new AppError(404, 'Invalid username');
    }

    return user;
}

async function findOrder(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Order.findById(id);
}

async function getUserOrders(username) {
    await findCaller(username);

    const orders = await Order.find({
        username: String(username)
    });

    return orders.map(toApiOrder);
}

async function getOrder(username, id) {
    await findCaller(username);

    const order = await findOrder(id);

    if (!order) {
        throw new AppError(404, 'Not Found');
    }

    if (String(order.username) !== String(username)) {
        throw new AppError(404, 'Invalid username');
    }

    return toApiOrder(order);
}

async function deleteOrder(username, id) {
    await findCaller(username);

    const order = await findOrder(id);

    if (!order || String(order.username) !== String(username)) {
        throw new AppError(404, 'Not Found');
    }

    await order.deleteOne();
}

// Order input is validated here rather than with Zod (spec §4): the checks
// below are complete and their order and messages are part of the contract.
// Prices, totals, status and dates are always computed server-side.
async function createOrder(username, data) {
    if (!data || !data.restaurant || !Array.isArray(data.products)) {
        throw new AppError(400, 'Bad Request');
    }

    const user = await findCaller(username);

    if (data.products.length === 0) {
        throw new AppError(400, 'Order must contain at least one product');
    }

    if (!mongoose.isValidObjectId(data.restaurant)) {
        throw new AppError(404, 'Restaurant not found');
    }

    const restaurant = await restaurantsService.getRestaurantById(data.restaurant);

    const menuProducts = new Map(
        (restaurant.products || []).map(product => [String(product.id), product])
    );
    const requestedQuantities = new Map();

    for (const requestedProduct of data.products) {
        if (!requestedProduct || typeof requestedProduct !== 'object') {
            throw new AppError(400, 'Each product must include an id and quantity');
        }

        const productId = String(requestedProduct.id || '');
        const quantity = requestedProduct.quantity;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new AppError(400, 'Quantity must be a positive integer');
        }

        const menuProduct = menuProducts.get(productId);

        if (!menuProduct) {
            throw new AppError(404, 'Product not found in restaurant menu');
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

module.exports = {
    getUserOrders,
    getOrder,
    createOrder,
    deleteOrder
};
