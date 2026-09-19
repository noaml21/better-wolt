const tokens = require('../services/tokens');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ error: 'Invalid authorization header' });
    }

    const token = parts[1];
    const payload = tokens.verifyToken(token);

    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;

    // Compatibility with old controllers that read these headers.
    req.headers['x-user-id'] = payload.username;
    req.headers.username = payload.username;

    return next();
}

module.exports = {
    requireAuth,
};
