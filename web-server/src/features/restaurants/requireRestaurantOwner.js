const { AppError } = require('../../http/errors');
const restaurantsService = require('./restaurants.service');

// Loads the restaurant once (404 if missing) and allows only its owner.
// Sets req.restaurant for the handler.
async function requireRestaurantOwner(req, res, next) {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id);

    if (restaurant.username !== req.user.username) {
        throw new AppError(403, 'Forbidden');
    }

    req.restaurant = restaurant;
    return next();
}

module.exports = requireRestaurantOwner;
