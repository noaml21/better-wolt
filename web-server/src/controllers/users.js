const usersService = require('../services/users');

async function createUser(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing required field: body' });
    }

    const {
        username,
        password,
        displayName,
        address,
        email
    } = req.body;

    if (!username || !password || !displayName || !address || !email) {
        return res.status(400).json({
            error: 'Missing required fields: username, password, displayName, address, email'
        });
    }

    if (!usersService.isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be 8-72 UTF-8 bytes and contain at least one letter and one digit'
        });
    }

    try {
        const existingUser = await usersService.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const user = await usersService.createUser(req.body);
        if (!user) {
            return res.status(400).json({ error: 'Missing or invalid required fields for user creation' });
        }

        return res.status(201)
            .location(`/api/users/${user.id}`)
            .json({ id: user.id });

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

async function getUser(req, res) {
    if (String(req.user.id) !== String(req.params.id)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const user = await usersService.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const safeUser = usersService.toSafeUser(user);

        return res.status(200).json(safeUser);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

module.exports = {
    createUser,
    getUser,
};
