const { AppError } = require('./errors');

// Registered last in app.js. Every error response is { error: message }.
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }

    return next(err);
}

// For /api paths that no router handled.
function apiNotFound(req, res, next) {
    next(new AppError(404, 'Not found'));
}

module.exports = {
    errorHandler,
    apiNotFound,
};
