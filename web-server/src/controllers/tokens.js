const tokensService = require('../services/tokens');

async function login(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing required field: body' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Missing required fields: username, password'
        });
    }

    try {
        const result = await tokensService.login(username, password);

        if (!result) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

module.exports = {
    login,
};
