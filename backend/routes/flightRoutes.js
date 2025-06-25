// backend/routes/flightRoutes.js
const express = require('express');
const router = express.Router();
// Correctly import getRealFlights and getFlightById using destructuring
const { getRealFlights, getFlightById } = require('../controllers/realFlightController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming these are for protecting routes
const { getAmadeusAccessToken } = require('../controllers/realFlightController'); // Only needed if this route file directly used it, but typically locationController uses it. Keeping for completeness if it was there before.

// Route to get all flights (real flights from Amadeus or dummy)
// This is a public route, no protection needed.
router.get('/', getRealFlights);

// Route to get a single flight by ID (can be from DB or dummy-generated)
// This is also a public route.
router.get('/:id', getFlightById);

// Example of a protected route (e.g., for creating/managing flights by admin/airline_staff)
// This assumes 'protect' middleware handles authentication, and 'authorize' handles role-based access.
router.post('/', protect, authorize(['admin', 'airline_staff']), (req, res) => {
    // This part of the code would handle saving a flight to your database,
    // if you choose to implement saving custom flights.
    // For now, flight search is dynamic from Amadeus or dummy.
    res.status(201).json({ message: 'Flight creation not yet implemented for database. Flights are dynamically searched.' });
});

// Example update route (if you manage flights in your DB)
router.put('/:id', protect, authorize(['admin', 'airline_staff']), (req, res) => {
    res.status(200).json({ message: 'Flight update not yet implemented for database.' });
});

// Example delete route (if you manage flights in your DB)
router.delete('/:id', protect, authorize(['admin', 'airline_staff']), (req, res) => {
    res.status(200).json({ message: 'Flight deletion not yet implemented for database.' });
});


module.exports = router;
