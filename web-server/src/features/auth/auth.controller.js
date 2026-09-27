const authService = require('./auth.service');

async function login(req, res) {
    const { username, password } = req.body;

    return res.status(200).json(await authService.login(username, password));
}

module.exports = {
    login,
};
