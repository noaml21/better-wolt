const { AppError } = require('../../http/errors');
const restaurantsService = require('../restaurants/restaurants.service');

async function search(req, res) {
    const query = String(req.params.query || '').trim();

    if (!query) {
        throw new AppError(400, 'Missing search query');
    }

    return res.status(200).json(await restaurantsService.searchRestaurants(query));
}

module.exports = {
    search
};
