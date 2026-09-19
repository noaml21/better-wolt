const express = require('express');
const usersController = require('./users.controller');
const { requireAuth } = require('../../http/auth');
const { validate } = require('../../http/validate');
const { createUserBody } = require('./users.schemas');

const router = express.Router();

router.post('/', validate({ body: createUserBody }), usersController.createUser);
router.get('/:id', requireAuth, usersController.getUser);

module.exports = router;
