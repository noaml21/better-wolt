const jwt = require('jsonwebtoken');
const config = require('../../config');
const usersService = require('../../services/users');

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

async function login(username, password) {
    if (!username || !password) {
        return null;
    }

    const user = await usersService.findUserByUsername(username);

    if (!user) {
        return null;
    }

    if (!await usersService.verifyPassword(password, user.password)) {
        return null;
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
    createToken,
    verifyToken
};
