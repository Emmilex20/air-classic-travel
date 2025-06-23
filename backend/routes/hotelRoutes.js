// backend/routes/hotelRoutes.js
const express = require('express');
const {
    getHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import protect and admin middleware

const router = express.Router();

// Public routes for viewing hotels
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Protected routes (require authentication and admin role)
// You might create a new middleware for 'hotel_staff' if that role becomes distinct.
router.post('/', protect, admin, createHotel);
router.put('/:id', protect, admin, updateHotel);
router.delete('/:id', protect, admin, deleteHotel);

module.exports = router;