const ordersService = require('./orders.service');

async function getUserOrders(req, res) {
    return res.status(200).json(await ordersService.getUserOrders(req.user.username));
}

async function createOrder(req, res) {
    const order = await ordersService.createOrder(req.user.username, req.body);

    return res
        .status(201)
        .location(`/api/orders/${order.id}`)
        .json(order);
}

async function getOrder(req, res) {
    return res.status(200).json(await ordersService.getOrder(req.user.username, req.params.id));
}

async function deleteOrder(req, res) {
    await ordersService.deleteOrder(req.user.username, req.params.id);
    return res.status(204).send();
}

module.exports = {
    getUserOrders,
    createOrder,
    getOrder,
    deleteOrder
};
