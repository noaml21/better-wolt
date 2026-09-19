const express = require('express');
const tokensController = require('./auth.controller');
const { validate } = require('../../http/validate');
const { loginBody } = require('./auth.schemas');

const router = express.Router();

router.post('/', validate({ body: loginBody }), tokensController.login);

module.exports = router;
