const Restaurant = require('../models/Restaurant');
const restaurantsService = require('./restaurants');

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

async function getMenu(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return null;
    }

    return (restaurant.products || []).map(toApiProduct);
}

async function getProduct(restaurantId, productId) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return null;
    }

    const product = restaurant.products.id(productId);

    if (!product) {
        return null;
    }

    return toApiProduct(product);
}

async function addProduct(restaurantId, data) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return null;
    }

    if (!data || !data.name || data.price === undefined) {
        return null;
    }

    restaurant.products.push({
        name: data.name,
        description: data.description || '',
        price: Number(data.price)
    });

    await restaurant.save();

    const createdProduct = restaurant.products[restaurant.products.length - 1];
    return toApiProduct(createdProduct);
}

async function updateProduct(restaurantId, productId, data) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return null;
    }

    const product = restaurant.products.id(productId);

    if (!product) {
        return null;
    }

    if (data.name !== undefined) {
        product.name = data.name;
    }

    if (data.description !== undefined) {
        product.description = data.description;
    }

    if (data.price !== undefined) {
        product.price = Number(data.price);
    }

    await restaurant.save();

    return toApiProduct(product);
}

async function deleteProduct(restaurantId, productId) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return false;
    }

    const product = restaurant.products.id(productId);

    if (!product) {
        return false;
    }

    product.deleteOne();
    await restaurant.save();

    return true;
}

async function userOwnsRestaurant(restaurantId, username) {
    const restaurant = await restaurantsService.getRestaurantById(restaurantId);

    if (!restaurant) {
        return false;
    }

    return restaurant.username === username;
}

module.exports = {
    getMenu,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    userOwnsRestaurant,
    toApiProduct
};
