const express = require('express');
const searchController = require('./search.controller');

const router = express.Router();

router.get('/:query', searchController.search);

module.exports = router;
