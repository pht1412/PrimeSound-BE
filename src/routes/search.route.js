const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// GET /api/v1/search?q=...
router.get('/', searchController.search);

module.exports = router;