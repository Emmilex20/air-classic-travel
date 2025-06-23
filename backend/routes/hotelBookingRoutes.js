// backend/routes/hotelBookingRoutes.js
const express = require('express');
const {
    createHotelBooking,
    getMyHotelBookings,
    getAllHotelBookings,
    cancelHotelBooking,
    // Add the delete function here
    deleteHotelBookingAdmin // <-- NEW: Import the admin delete function
} = require('../controllers/hotelBookingController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import protect and admin middleware

const router = express.Router();

// Route for users to create a booking
router.post('/', protect, createHotelBooking);

// Route for users to get their own hotel bookings
// IMPORTANT: This must come before the general GET '/' route to avoid conflict
router.get('/my-bookings', protect, getMyHotelBookings);

// Route for admin to get all hotel bookings
// Frontend's AllBookings.jsx expects GET /api/hotel-bookings for all hotel bookings (admin-protected)
router.get('/', protect, admin, getAllHotelBookings); // This route handles GET /api/hotel-bookings

// Route to cancel a booking (accessible by user who made it or admin)
router.put('/:id/cancel', protect, cancelHotelBooking);

// NEW: Route for admin to delete a hotel booking
// Frontend expects DELETE /api/hotel-bookings/admin/:id
router.delete('/admin/:id', protect, admin, deleteHotelBookingAdmin); // <-- NEW: Route for deleting by admin

module.exports = router;