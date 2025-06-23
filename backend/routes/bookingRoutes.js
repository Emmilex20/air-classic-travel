// backend/routes/bookingRoutes.js
const express = require('express');
const {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getAllBookingsAdmin,
    updateBookingStatusAdmin,
    deleteBookingAdmin
} = require('../controllers/bookingController'); // Correctly import controller functions
const { protect, admin, airlineStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// Private routes for general users
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Admin/Airline Staff specific routes
router.get('/', protect, admin, getAllBookingsAdmin); // GET /api/bookings (Admin only)
router.put('/admin/:id/status', protect, admin, updateBookingStatusAdmin); // PUT /api/bookings/admin/:id/status
router.delete('/admin/:id', protect, admin, deleteBookingAdmin); // DELETE /api/bookings/admin/:id

// Ensure '/:id' route comes AFTER more specific routes
router.get('/:id', protect, getBookingById);


module.exports = router; // Export the router