const { z } = require('zod');
const { requestBody, requiredString, optionalString } = require('../../http/validate');
const { isValidPassword } = require('./users.service');

const MISSING_FIELDS = 'Missing required fields: username, password, displayName, address, email';

const createUserBody = requestBody({
    username: requiredString('username', MISSING_FIELDS),
    password: requiredString('password', MISSING_FIELDS).refine(
        isValidPassword,
        'Password must be 8-72 UTF-8 bytes and contain at least one letter and one digit'
    ),
    displayName: requiredString('displayName', MISSING_FIELDS),
    address: requiredString('address', MISSING_FIELDS),
    email: requiredString('email', MISSING_FIELDS),
    image: optionalString('image'),
    role: z.enum(['customer', 'restaurant'], { error: 'Role must be customer or restaurant' }).nullish(),
}, 'Missing required field: body');

module.exports = {
    createUserBody,
};
