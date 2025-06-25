// backend/routes/hotelRoutes.js
const express = require('express');
const {
    getHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');
// CORRECTED: Import 'authorize' instead of 'admin'
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for viewing hotels
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Protected routes (require authentication and appropriate roles)
// Using 'authorize' middleware for both 'admin' and 'hotel_staff' roles
router.post('/', protect, authorize(['admin', 'hotel_staff']), createHotel);
router.put('/:id', protect, authorize(['admin', 'hotel_staff']), updateHotel);
router.delete('/:id', protect, authorize(['admin', 'hotel_staff']), deleteHotel);

module.exports = router;
