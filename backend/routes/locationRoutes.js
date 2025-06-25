// backend/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
// CORRECTED: Import 'autocompleteLocations' using its actual exported name
const { autocompleteLocations } = require('../controllers/locationController');

// This defines the route for /autocomplete-locations relative to where this router is mounted.
// Since it's mounted under /api/locations, the full path will be /api/locations/autocomplete-locations
router.get('/autocomplete-locations', autocompleteLocations); // Use the correctly imported name

module.exports = router;
