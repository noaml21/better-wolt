const { AppError } = require('../../http/errors');
const usersService = require('./users.service');

async function createUser(req, res) {
    const user = await usersService.createUser(req.body);

    return res.status(201)
        .location(`/api/users/${user.id}`)
        .json({ id: user.id });
}

async function getUser(req, res) {
    if (String(req.user.id) !== String(req.params.id)) {
        throw new AppError(403, 'Forbidden');
    }

    return res.status(200).json(await usersService.getUser(req.params.id));
}

module.exports = {
    createUser,
    getUser,
};
