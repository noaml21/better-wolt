const Restaurant = require('./restaurant.model');
const { AppError } = require('../../http/errors');
const { toApiProduct } = require('./restaurants.service');

// Products are embedded in their restaurant document.
async function findRestaurant(restaurantId, notFoundMessage) {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new AppError(404, notFoundMessage);
    }

    return restaurant;
}

function findProduct(restaurant, productId) {
    const product = restaurant.products.id(productId);

    if (!product) {
        throw new AppError(404, 'Product not found');
    }

    return product;
}

async function getMenu(restaurantId) {
    const restaurant = await findRestaurant(restaurantId, 'Restaurant not found');
    return (restaurant.products || []).map(toApiProduct);
}

async function getProduct(restaurantId, productId) {
    const restaurant = await findRestaurant(restaurantId, 'Product not found');
    return toApiProduct(findProduct(restaurant, productId));
}

// `data` has been validated by restaurants.schemas.createProductBody.
async function addProduct(restaurantId, data) {
    const restaurant = await findRestaurant(restaurantId, 'Restaurant not found');

    restaurant.products.push({
        name: data.name,
        description: data.description || '',
        price: Number(data.price)
    });

    await restaurant.save();

    const createdProduct = restaurant.products[restaurant.products.length - 1];
    return toApiProduct(createdProduct);
}

// `data` has been validated by restaurants.schemas.updateProductBody.
async function updateProduct(restaurantId, productId, data) {
    const restaurant = await findRestaurant(restaurantId, 'Product not found');
    const product = findProduct(restaurant, productId);

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
    const restaurant = await findRestaurant(restaurantId, 'Product not found');

    findProduct(restaurant, productId).deleteOne();
    await restaurant.save();
}

module.exports = {
    getMenu,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct
};
