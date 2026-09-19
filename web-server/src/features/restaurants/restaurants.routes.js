const express = require('express');
const restaurantsController = require('./restaurants.controller');
const productsController = require('./products.controller');
const { requireAuth } = require('../../http/auth');
const { validate, objectIdParam } = require('../../http/validate');
const {
    createRestaurantBody,
    updateRestaurantBody,
    createProductBody,
    updateProductBody,
} = require('./restaurants.schemas');

const router = express.Router();

// Invalid ids get the message a missing document gets on the same route.
const restaurantId = objectIdParam('id', 'Restaurant not found');
const productId = objectIdParam('pId', 'Product not found');

// Order on every route: auth (401) -> body (400) -> ids (404) -> ownership (403, in the controller).
router.get('/', restaurantsController.getAllRestaurants);
router.post('/', requireAuth, validate({ body: createRestaurantBody }), restaurantsController.createRestaurant);
router.get('/:id', restaurantId, restaurantsController.getRestaurant);
router.patch('/:id', requireAuth, validate({ body: updateRestaurantBody }), restaurantId, restaurantsController.updateRestaurant);
router.delete('/:id', requireAuth, restaurantId, restaurantsController.deleteRestaurant);

router.get('/:id/products', restaurantId, productsController.getMenu);
router.post('/:id/products', requireAuth, validate({ body: createProductBody }), restaurantId, productsController.addProduct);
router.get('/:id/products/:pId', objectIdParam('id', 'Product not found'), productId, productsController.getProduct);
router.patch('/:id/products/:pId', requireAuth, validate({ body: updateProductBody }), restaurantId, productId, productsController.updateProduct);
router.delete('/:id/products/:pId', requireAuth, restaurantId, productId, productsController.deleteProduct);

module.exports = router;
