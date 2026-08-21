const jwt = require('jsonwebtoken');
const usersService = require('./users');

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

function createToken(payload) {
    return jwt.sign(payload, SECRET, {
        expiresIn: '24h'
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
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
