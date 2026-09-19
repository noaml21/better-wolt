const bcrypt = require('bcryptjs');
const User = require('../models/User');

const BCRYPT_SALT_ROUNDS = 12;

async function hashPassword(password) {
    return await bcrypt.hash(String(password), BCRYPT_SALT_ROUNDS);
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

async function getUserById(id) {
    return await User.findById(id);
}

async function createUser(data) {
    if (!data) {
        return null;
    }

    const {
        username,
        password,
        displayName,
        address,
        email,
        image,
        role
    } = data;

    if (!username || !password || !displayName || !address || !email) {
        return null;
    }

    if (!isValidPassword(password)) {
        return null;
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
        return null;
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
    getUserById,
    findUserByUsername,
    hashPassword,
    verifyPassword,
    isValidPassword,
    toSafeUser
};
