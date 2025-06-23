// backend/controllers/hotelBookingController.js
const HotelBooking = require('../models/HotelBooking');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new hotel booking
// @route   POST /api/hotel-bookings
// @access  Private (User)
exports.createHotelBooking = async (req, res) => {
    const { hotelId, numberOfRooms, checkInDate, checkOutDate } = req.body;
    const userId = req.user._id; // Get user ID from authenticated request

    if (!hotelId || !numberOfRooms || !checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Please provide hotelId, numberOfRooms, checkInDate, and checkOutDate.' });
    }

    if (!isValidObjectId(hotelId)) {
        return res.status(400).json({ message: 'Invalid Hotel ID format.' });
    }

    const numRooms = parseInt(numberOfRooms, 10);
    if (isNaN(numRooms) || numRooms <= 0) {
        return res.status(400).json({ message: 'Number of rooms must be a positive integer.' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return res.status(400).json({ message: 'Invalid check-in or check-out date format.' });
    }

    if (checkIn >= checkOut) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    // Optional: Prevent booking in the past
    if (checkIn < new Date()) {
        return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
    }

    try {
        // 1. Find the hotel
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }

        // 2. Check room availability
        if (hotel.availableRooms < numRooms) {
            return res.status(400).json({ message: `Not enough rooms available. Only ${hotel.availableRooms} rooms left.` });
        }

        // 3. Calculate total price
        // Calculate number of nights
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return res.status(400).json({ message: 'Booking must be for at least one night.' });
        }

        const totalPrice = hotel.pricePerNight * numRooms * diffDays;

        // 4. Create the booking
        const newBooking = new HotelBooking({
            user: userId,
            hotel: hotelId,
            numberOfRooms: numRooms,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice: totalPrice,
            bookingStatus: 'confirmed', // Or 'pending' if you want a confirmation step
        });

        const createdBooking = await newBooking.save();

        // 5. Update hotel's available rooms
        hotel.availableRooms -= numRooms;
        await hotel.save();

        res.status(201).json(createdBooking);

    } catch (error) {
        console.error('Error creating hotel booking:', error);
        res.status(500).json({ message: 'Server error creating hotel booking.', error: error.message });
    }
};

// @desc    Get all hotel bookings for the authenticated user
// @route   GET /api/hotel-bookings/my-bookings
// @access  Private (User)
exports.getMyHotelBookings = async (req, res) => {
    try {
        const bookings = await HotelBooking.find({ user: req.user._id })
                                            .populate('hotel', 'name location images'); // Populate hotel name, location, and images
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching user hotel bookings:', error);
        res.status(500).json({ message: 'Server error fetching your hotel bookings.' });
    }
};

// @desc    Get all hotel bookings (Admin only)
// @route   GET /api/hotel-bookings
// @access  Private (Admin)
exports.getAllHotelBookings = async (req, res) => {
    try {
        // The `admin` middleware should already handle the authorization check,
        // so no explicit `if (!req.user || !req.user.roles.includes('admin'))` is strictly needed here
        // if this controller function is only ever called via the protected route.
        const bookings = await HotelBooking.find()
                                            .populate('user', 'username email') // Populate user details
                                            .populate('hotel', 'name location'); // Populate hotel details
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all hotel bookings:', error);
        res.status(500).json({ message: 'Server error fetching all hotel bookings.' });
    }
};


// @desc    Cancel a hotel booking
// @route   PUT /api/hotel-bookings/:id/cancel
// @access  Private (User/Admin)
exports.cancelHotelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ message: 'Invalid Booking ID format.' });
        }

        const booking = await HotelBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Only the user who made the booking OR an admin can cancel
        if (booking.user.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
        }

        if (booking.bookingStatus === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled.' });
        }

        // Update booking status
        booking.bookingStatus = 'cancelled';
        await booking.save();

        // Increase available rooms for the hotel
        const hotel = await Hotel.findById(booking.hotel);
        if (hotel) {
            hotel.availableRooms += booking.numberOfRooms;
            await hotel.save();
        }

        res.status(200).json({ message: 'Booking cancelled successfully.', booking });
    } catch (error) {
        console.error('Error cancelling hotel booking:', error);
        res.status(500).json({ message: 'Server error cancelling booking.' });
    }
};