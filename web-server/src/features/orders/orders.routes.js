const express = require('express');
const ordersController = require('./orders.controller');
const { requireAuth } = require('../../http/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getUserOrders);
router.get('/:id', ordersController.getOrder);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
