const jwt = require('jsonwebtoken');
const config = require('../../config');
const { AppError } = require('../../http/errors');
const usersService = require('../users/users.service');

function createToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: '24h'
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        return null;
    }
}

function toAuthUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        image: user.image || '',
        role: user.role || 'customer'
    };
}

const INVALID_CREDENTIALS = 'Invalid username or password';

async function login(username, password) {
    const user = await usersService.findUserByUsername(username);

    if (!user) {
        throw new AppError(401, INVALID_CREDENTIALS);
    }

    if (!await usersService.verifyPassword(password, user.password)) {
        throw new AppError(401, INVALID_CREDENTIALS);
    }

    const token = createToken({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        role: user.role || 'customer'
    });

    return {
        token,
        user: toAuthUser(user)
    };
}

module.exports = {
    login,
    verifyToken
};
