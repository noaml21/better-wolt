const bcrypt = require('bcryptjs');
const User = require('./user.model');
const config = require('../../config');
const { AppError } = require('../../http/errors');

async function hashPassword(password) {
    return await bcrypt.hash(String(password), config.bcryptRounds);
}

async function verifyPassword(password, passwordHash) {
    return await bcrypt.compare(String(password), passwordHash);
}

function isValidPassword(password) {
    const value = String(password || '');
    return value.length >= 8 &&
        /[A-Za-z]/.test(value) &&
        /\d/.test(value) &&
        !bcrypt.truncates(value);
}

function toSafeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        address: user.address,
        image: user.image || '',
        role: user.role || 'customer'
    };
}

async function findUserByUsername(username) {
    return await User.findOne({ username: String(username) });
}

async function getUser(id) {
    const user = await User.findById(id);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    return toSafeUser(user);
}

// `data` has been validated by users.schemas.createUserBody.
async function createUser(data) {
    const {
        username,
        password,
        displayName,
        address,
        email,
        image,
        role
    } = data;

    if (await findUserByUsername(username)) {
        throw new AppError(400, 'Username already taken');
    }

    const user = new User({
        username,
        password: await hashPassword(password),
        displayName,
        address,
        email,
        image: image || '',
        role: role || 'customer'
    });

    const savedUser = await user.save();
    return toSafeUser(savedUser);
}

module.exports = {
    createUser,
    getUser,
    findUserByUsername,
    verifyPassword,
    isValidPassword,
};
