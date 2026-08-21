const ordersService = require('../services/orders');
const usersService = require('../services/users');

function getRequestUsername(req) {
    if (req.user && req.user.username) {
        return req.user.username;
    }

    return req.headers['x-user-id'] || req.header('username');
}

async function getUserOrders(req, res) {
    const username = getRequestUsername(req);

    try {
        const user = await usersService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                error: 'Invalid username'
            });
        }

        const orders = await ordersService.getUserOrders(username);
        return res.status(200).json(orders);

    } catch (error) {
        return res.status(500).json({
            error: 'Error processing request'
        });
    }
}

async function createOrder(req, res) {
    const username = req.user.username;

    if (!req.body || !req.body.restaurant || !Array.isArray(req.body.products)) {
        return res.status(400).json({
            error: 'Bad Request'
        });
    }

    try {
        const user = await usersService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                error: 'Invalid username'
            });
        }

        const order = await ordersService.createOrder({
            username: username,
            restaurant: req.body.restaurant,
            products: req.body.products
        });

        if (!order) {
            return res.status(400).json({
                error: 'Bad Request'
            });
        }

        return res
            .status(201)
            .location(`/api/orders/${order.id}`)
            .json(order);

    } catch (error) {
        return res.status(error.statusCode || 400).json({
            error: error.message
        });
    }
}

async function getOrder(req, res) {
    const username = getRequestUsername(req);

    try {
        const user = await usersService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                error: 'Invalid username'
            });
        }

        const order = await ordersService.getOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                error: 'Not Found'
            });
        }

        if (String(order.username) !== String(username)) {
            return res.status(404).json({
                error: 'Invalid username'
            });
        }

        return res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({
            error: 'Error processing request'
        });
    }
}

async function updateOrder(req, res) {
    const username = getRequestUsername(req);

    if (!req.body) {
        return res.status(400).json({
            error: 'Bad Request'
        });
    }

    try {
        const user = await usersService.findUserByUsername(username);

        if (!user) {
            return res.status(400).json({
                error: 'Invalid username'
            });
        }

        const order = await ordersService.getOrderById(req.params.id);

        if (!order || String(order.username) !== String(username)) {
            return res.status(404).json({
                error: 'Not Found'
            });
        }

        await ordersService.updateOrder(req.params.id, {
            restaurant: req.body.restaurant,
            restaurantName: req.body.restaurantName,
            products: req.body.products,
            items: req.body.items,
            total: req.body.total,
            status: req.body.status,
            date: req.body.date
        });

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({
            error: 'Error processing request'
        });
    }
}

async function deleteOrder(req, res) {
    const username = getRequestUsername(req);

    try {
        const user = await usersService.findUserByUsername(username);

        if (!user) {
            return res.status(404).json({
                error: 'Invalid username'
            });
        }

        const order = await ordersService.getOrderById(req.params.id);

        if (!order || String(order.username) !== String(username)) {
            return res.status(404).json({
                error: 'Not Found'
            });
        }

        await ordersService.deleteOrder(order.id);

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({
            error: 'Error processing request'
        });
    }
}

module.exports = {
    getUserOrders,
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder
};
