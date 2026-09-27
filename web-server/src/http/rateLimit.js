const { rateLimit } = require('express-rate-limit');
const config = require('../config');
const { AppError } = require('./errors');

// Throttles password guessing and account spam per client IP (in memory, so
// per process). Each call creates a separate budget for one route.
function authRateLimit({ skipSuccessfulRequests = false } = {}) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: config.authRateLimitMax,
        skipSuccessfulRequests,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        handler: (req, res, next) => next(new AppError(429, 'Too many requests')),
    });
}

module.exports = {
    authRateLimit,
};
