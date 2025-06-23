// backend/routes/flightRoutes.js
const express = require('express');
const {
    getFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight
} = require('../controllers/flightController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import admin middleware

const router = express.Router();

// Public routes
router.get('/', getFlights);
router.get('/:id', getFlightById);

// Protected routes (require login and admin role for create/update/delete)
router.post('/', protect, admin, createFlight);
router.put('/:id', protect, admin, updateFlight);
router.delete('/:id', protect, admin, deleteFlight);

module.exports = router;