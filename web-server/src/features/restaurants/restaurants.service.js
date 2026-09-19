const Restaurant = require('./restaurant.model');
const usersService = require('../users/users.service');
const { AppError } = require('../../http/errors');

function toApiProduct(product) {
    if (!product) {
        return null;
    }

    return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price
    };
}

function toApiRestaurant(restaurant) {
    if (!restaurant) {
        return null;
    }

    return {
        id: restaurant.id,
        username: restaurant.username,
        name: restaurant.name,
        phone: restaurant.phone || '',
        address: restaurant.address || '',
        image: restaurant.image || '',
        products: (restaurant.products || []).map(toApiProduct)
    };
}

async function getAllRestaurants() {
    const restaurants = await Restaurant.find({});
    return restaurants.map(toApiRestaurant);
}

const NAME_TAKEN = 'Restaurant with this name already exists';

async function findRestaurantDocument(id) {
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
        throw new AppError(404, 'Restaurant not found');
    }

    return restaurant;
}

async function getRestaurantById(id) {
    return toApiRestaurant(await findRestaurantDocument(id));
}

// `data` has been validated by restaurants.schemas.createRestaurantBody;
// `data.username` is the authenticated owner.
async function createRestaurant(data) {
    if (!await usersService.findUserByUsername(data.username)) {
        throw new AppError(400, 'Invalid username');
    }

    if (await Restaurant.findOne({ name: data.name })) {
        throw new AppError(400, NAME_TAKEN);
    }

    const restaurant = new Restaurant({
        username: data.username,
        name: data.name,
        phone: data.phone || '',
        address: data.address || '',
        image: data.image || '',
        products: []
    });

    const savedRestaurant = await restaurant.save();
    return toApiRestaurant(savedRestaurant);
}

// `data` has been validated by restaurants.schemas.updateRestaurantBody.
async function updateRestaurant(id, data) {
    const restaurant = await findRestaurantDocument(id);

    if (data.name !== undefined && data.name !== restaurant.name) {
        const existingRestaurant = await Restaurant.findOne({ name: data.name });

        if (existingRestaurant && String(existingRestaurant.id) !== String(id)) {
            throw new AppError(400, NAME_TAKEN);
        }

        restaurant.name = data.name;
    }

    if (data.phone !== undefined) {
        restaurant.phone = data.phone;
    }

    if (data.address !== undefined) {
        restaurant.address = data.address;
    }

    if (data.image !== undefined) {
        restaurant.image = data.image;
    }

    const savedRestaurant = await restaurant.save();
    return toApiRestaurant(savedRestaurant);
}

async function deleteRestaurant(id) {
    const restaurant = await findRestaurantDocument(id);
    await restaurant.deleteOne();
}

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

    return restaurants.map(toApiRestaurant);
}

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    searchRestaurants,
    toApiProduct
};
