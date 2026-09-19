const { z } = require('zod');
const { requestBody, requiredString, optionalString } = require('../../http/validate');

const MISSING_BODY = 'Missing required field: body';
const MISSING_PRODUCT_FIELDS = 'Missing required fields: name, price';
const INVALID_PRICE = 'Price must be a non-negative number';

// Prices arrive as numbers or numeric strings (both clients have sent "18");
// the service stores Number(price), so accept both and check the number.
function price(missingMessage) {
    return z
        .union([z.number(), z.string()], {
            error: (issue) => (issue.input === undefined ? missingMessage : INVALID_PRICE),
        })
        .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, INVALID_PRICE);
}

const restaurantFields = {
    phone: optionalString('phone'),
    address: optionalString('address'),
    image: optionalString('image'),
};

const createRestaurantBody = requestBody({
    name: requiredString('name', 'Name is required'),
    ...restaurantFields,
}, 'Name is required');

const updateRestaurantBody = requestBody({
    name: requiredString('name', 'Name is required').optional(),
    ...restaurantFields,
}, MISSING_BODY);

const createProductBody = requestBody({
    name: requiredString('name', MISSING_PRODUCT_FIELDS),
    description: optionalString('description'),
    price: price(MISSING_PRODUCT_FIELDS),
}, MISSING_PRODUCT_FIELDS);

const updateProductBody = requestBody({
    name: requiredString('name', 'Name is required').optional(),
    description: optionalString('description'),
    price: price(INVALID_PRICE).optional(),
}, MISSING_BODY);

module.exports = {
    createRestaurantBody,
    updateRestaurantBody,
    createProductBody,
    updateProductBody,
};
