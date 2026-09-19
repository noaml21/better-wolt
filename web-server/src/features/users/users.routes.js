const express = require('express');
const usersController = require('./users.controller');
const { requireAuth } = require('../../http/auth');
const { validate } = require('../../http/validate');
const { authRateLimit } = require('../../http/rateLimit');
const { createUserBody } = require('./users.schemas');

const router = express.Router();

router.post('/', authRateLimit(), validate({ body: createUserBody }), usersController.createUser);
router.get('/:id', requireAuth, usersController.getUser);

module.exports = router;
