const express = require('express');
const usersController = require('../controllers/users');
const { requireAuth } = require('../http/auth');

const router = express.Router();

router.post('/', usersController.createUser);
router.get('/:id', requireAuth, usersController.getUser);

module.exports = router;
