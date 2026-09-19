const express = require('express');
const restaurantsController = require('./restaurants.controller');
const productsController = require('./products.controller');
const { requireAuth } = require('../../http/auth');
const { objectIdParam } = require('../../http/validate');

const router = express.Router();

// Invalid ids get the message a missing document gets on the same route.
const restaurantId = objectIdParam('id', 'Restaurant not found');
const productId = objectIdParam('pId', 'Product not found');

router.get('/', restaurantsController.getAllRestaurants);
router.post('/', requireAuth, restaurantsController.createRestaurant);
router.get('/:id', restaurantId, restaurantsController.getRestaurant);
router.patch('/:id', requireAuth, restaurantId, restaurantsController.updateRestaurant);
router.delete('/:id', requireAuth, restaurantId, restaurantsController.deleteRestaurant);

router.get('/:id/products', restaurantId, productsController.getMenu);
router.post('/:id/products', requireAuth, restaurantId, productsController.addProduct);
router.get('/:id/products/:pId', objectIdParam('id', 'Product not found'), productId, productsController.getProduct);
router.patch('/:id/products/:pId', requireAuth, restaurantId, productId, productsController.updateProduct);
router.delete('/:id/products/:pId', requireAuth, restaurantId, productId, productsController.deleteProduct);

module.exports = router;
