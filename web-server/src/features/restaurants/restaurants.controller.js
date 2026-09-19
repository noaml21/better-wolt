const { AppError } = require('../../http/errors');
const restaurantsService = require('./restaurants.service');

async function getAllRestaurants(req, res) {
    return res.status(200).json(await restaurantsService.getAllRestaurants());
}

async function createRestaurant(req, res) {
    if (req.user.role !== 'restaurant') {
        throw new AppError(403, 'Only restaurant owners can create restaurants');
    }

    const restaurant = await restaurantsService.createRestaurant({
        ...req.body,
        username: req.user.username,
    });

    return res
        .status(201)
        .location(`/api/restaurants/${restaurant.id}`)
        .json(restaurant);
}

async function getRestaurant(req, res) {
    return res.status(200).json(await restaurantsService.getRestaurantById(req.params.id));
}

async function updateRestaurant(req, res) {
    await restaurantsService.updateRestaurant(req.params.id, req.body);
    return res.status(204).send();
}

async function deleteRestaurant(req, res) {
    await restaurantsService.deleteRestaurant(req.params.id);
    return res.status(204).send();
}

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurant,
    updateRestaurant,
    deleteRestaurant,
};
