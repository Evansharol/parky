/**
 * routes/ai.js – AI feature routes
 */
const express = require('express');
const router = express.Router();
const { predictAvailability, suggestPrice, smartSearch } = require('../controllers/aiController');

router.get('/predict-availability', predictAvailability);  // Public
router.get('/suggest-price', suggestPrice);                // Public
router.get('/smart-search', smartSearch);                  // Public

module.exports = router;
