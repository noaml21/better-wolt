const express = require('express');
const tokensController = require('./auth.controller');

const router = express.Router();

router.post('/', tokensController.login);

module.exports = router;
