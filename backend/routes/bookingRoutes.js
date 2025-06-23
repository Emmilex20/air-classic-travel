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
} = require('../controllers/bookingController');
const { protect, admin, airlineStaff } = require('../middleware/authMiddleware');

const router = express.Router();

// Private routes for general users
router.post('/', protect, createBooking); // Create a new booking

// ✅ IMPORTANT: '/my-bookings' should be placed BEFORE the '/:id' route to avoid conflicts
router.get('/my-bookings', protect, getUserBookings); // Get bookings for the authenticated user

// Route for a user to cancel their own booking (PUT request)
router.put('/:id/cancel', protect, cancelBooking); // Use the dedicated cancelBooking function

// ✅ Ensure '/:id' route comes AFTER '/my-bookings' and '/:id/cancel' to prevent conflicts
router.get('/:id', protect, getBookingById); // Get a specific booking by ID (user can only see their own unless admin/staff)


// Admin/Airline Staff specific routes
// Frontend's AllBookings.jsx expects GET /api/bookings for all flight bookings (admin-protected)
// We'll use the root path '/' for this admin-specific "get all" to match frontend's axios call
router.get('/', protect, admin, getAllBookingsAdmin); // Get all bookings (Admin only)
router.put('/admin/:id/status', protect, admin, updateBookingStatusAdmin); // Admin updates booking status
// router.delete('/admin/:id', protect, admin, deleteBookingAdmin); // Uncomment if using deleteBookingAdmin for admin

module.exports = router;