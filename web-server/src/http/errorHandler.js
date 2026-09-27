const { AppError } = require('./errors');

// Registered last in app.js. Every error response is { error: message };
// internal details (stack traces, driver messages) never reach the client.
// Express recognizes error middleware by its four parameters, so `next` stays.
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }

    // Errors raised by express.json() while reading the body.
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large' });
    }

    // Other client errors from the body parser (e.g. unsupported charset)
    // carry a safe message and keep their status.
    if (err.expose && err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({ error: 'Error processing request' });
}

// For /api paths that no router handled.
function apiNotFound(req, res, next) {
    next(new AppError(404, 'Not found'));
}

module.exports = {
    errorHandler,
    apiNotFound,
};
