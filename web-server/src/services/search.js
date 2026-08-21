const Restaurant = require('../models/Restaurant');
const restaurantsService = require('./restaurants');

async function searchRestaurants(query) {
    const normalizedQuery = String(query || '').trim();

    if (!normalizedQuery) {
        return [];
    }

    const regex = new RegExp(normalizedQuery, 'i');

    const restaurants = await Restaurant.find({
        $or: [
            { name: regex },
            { address: regex },
            { 'products.name': regex },
            { 'products.description': regex }
        ]
    });

    return restaurants.map(restaurantsService.toApiRestaurant);
}

module.exports = {
    searchRestaurants
};
