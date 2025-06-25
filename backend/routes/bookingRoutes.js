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
// CORRECTED: Import 'authorize' instead of 'admin' and 'airlineStaff' directly
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Private routes for general users
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Admin/Airline Staff specific routes
// Use 'authorize' middleware with the specific roles
router.route('/')
    // This GET route for /api/bookings should typically be for admin to get ALL bookings
    .get(protect, authorize(['admin']), getAllBookingsAdmin);

router.route('/admin/:id/status')
    // Update booking status - typically admin or possibly airline_staff for their own flights
    .put(protect, authorize(['admin']), updateBookingStatusAdmin); // Updated to use authorize

router.route('/admin/:id')
    // Delete booking - typically admin only
    .delete(protect, authorize(['admin']), deleteBookingAdmin); // Updated to use authorize

// Ensure '/:id' route comes AFTER more specific routes (like /admin/:id/status or /my-bookings)
// This applies to getting a single booking by ID, accessible to the booking owner or admin/staff
router.get('/:id', protect, getBookingById);


module.exports = router;
