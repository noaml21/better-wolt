const express = require('express');
const tokensController = require('./auth.controller');
const { validate } = require('../../http/validate');
const { authRateLimit } = require('../../http/rateLimit');
const { loginBody } = require('./auth.schemas');

const router = express.Router();

// Failed logins count against the budget; successful ones do not.
router.post('/', authRateLimit({ skipSuccessfulRequests: true }), validate({ body: loginBody }), tokensController.login);

module.exports = router;
