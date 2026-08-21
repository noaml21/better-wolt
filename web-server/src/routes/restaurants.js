const express = require('express');
const restaurantsController = require('../controllers/restaurants');
const productsController = require('../controllers/products');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', restaurantsController.getAllRestaurants);
router.post('/', requireAuth, restaurantsController.createRestaurant);
router.get('/:id', restaurantsController.getRestaurant);
router.patch('/:id', requireAuth, restaurantsController.updateRestaurant);
router.delete('/:id', requireAuth, restaurantsController.deleteRestaurant);

router.get('/:id/products', productsController.getMenu);
router.post('/:id/products', requireAuth, productsController.addProduct);
router.get('/:id/products/:pId', productsController.getProduct);
router.patch('/:id/products/:pId', requireAuth, productsController.updateProduct);
router.delete('/:id/products/:pId', requireAuth, productsController.deleteProduct);

module.exports = router;
