const express = require('express');
const tokensController = require('../controllers/tokens');

const router = express.Router();

router.post('/', tokensController.login);

module.exports = router;
