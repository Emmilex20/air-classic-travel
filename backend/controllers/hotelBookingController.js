// backend/controllers/hotelBookingController.js
const HotelBooking = require('../models/HotelBooking');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new hotel booking
// @route   POST /api/hotel-bookings
// @access  Private (User)
exports.createHotelBooking = asyncHandler(async (req, res) => {
    const { hotelId, numberOfRooms, checkInDate, checkOutDate } = req.body;
    const userId = req.user._id;

    if (!hotelId || !numberOfRooms || !checkInDate || !checkOutDate) {
        res.status(400);
        throw new Error('Please provide hotelId, numberOfRooms, checkInDate, and checkOutDate.');
    }

    if (!isValidObjectId(hotelId)) {
        res.status(400);
        throw new Error('Invalid Hotel ID format.');
    }

    const numRooms = parseInt(numberOfRooms, 10);
    if (isNaN(numRooms) || numRooms <= 0) {
        res.status(400);
        throw new Error('Number of rooms must be a positive integer.');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        res.status(400);
        throw new Error('Invalid check-in or check-out date format.');
    }

    if (checkIn >= checkOut) {
        res.status(400);
        throw new Error('Check-out date must be after check-in date.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
        res.status(400);
        throw new Error('Check-in date cannot be in the past.');
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const hotel = await Hotel.findById(hotelId).session(session);
        if (!hotel) {
            res.status(404);
            throw new Error('Hotel not found.');
        }

        if (hotel.availableRooms < numRooms) {
            res.status(400);
            throw new Error(`Not enough rooms available. Only ${hotel.availableRooms} rooms left.`);
        }

        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            res.status(400);
            throw new Error('Booking must be for at least one night.');
        }

        const totalPrice = hotel.pricePerNight * numRooms * diffDays;

        const paystackRef = `HTL-${uuidv4().substring(0, 8)}-${Date.now()}`;

        const newBooking = new HotelBooking({
            user: userId,
            hotel: hotelId,
            numberOfRooms: numRooms,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice: totalPrice,
            bookingStatus: 'pending',
            paymentStatus: 'pending',
            paystackReference: paystackRef,
        });

        const createdBooking = await newBooking.save({ session });

        hotel.availableRooms -= numRooms;
        await hotel.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Booking created. Proceed to payment.',
            booking: createdBooking,
            paystackReference: paystackRef,
            totalAmount: totalPrice,
            userEmail: req.user.email
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating hotel booking:', error);
        throw error;
    }
});

// @desc    Get all hotel bookings for the authenticated user
// @route   GET /api/hotel-bookings/my-bookings
// @access  Private (User)
exports.getMyHotelBookings = asyncHandler(async (req, res) => {
    const bookings = await HotelBooking.find({ user: req.user._id })
        .populate('hotel', 'name location images');
    res.status(200).json(bookings);
});

// @desc    Get all hotel bookings (Admin only)
// @route   GET /api/hotel-bookings
// @access  Private (Admin)
exports.getAllHotelBookings = asyncHandler(async (req, res) => {
    const bookings = await HotelBooking.find()
        .populate('user', 'username email')
        .populate('hotel', 'name location');
    res.status(200).json(bookings);
});

// @desc    Cancel a hotel booking
// @route   PUT /api/hotel-bookings/:id/cancel
// @access  Private (User/Admin)
exports.cancelHotelBooking = asyncHandler(async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const bookingId = req.params.id;
        if (!isValidObjectId(bookingId)) {
            res.status(400);
            throw new Error('Invalid Booking ID format.');
        }

        const booking = await HotelBooking.findById(bookingId).session(session);
        if (!booking) {
            res.status(404);
            throw new Error('Booking not found.');
        }

        if (booking.user.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
            res.status(403);
            throw new Error('Not authorized to cancel this booking.');
        }

        if (booking.bookingStatus === 'cancelled') {
            res.status(400);
            throw new Error('Booking is already cancelled.');
        }

        if (booking.bookingStatus !== 'cancelled') {
            const hotel = await Hotel.findById(booking.hotel).session(session);
            if (hotel) {
                hotel.availableRooms += booking.numberOfRooms;
                await hotel.save({ session });
            } else {
                console.warn(`Hotel ${booking.hotel} not found for booking ${booking._id} during cancellation.`);
            }
        }

        booking.bookingStatus = 'cancelled';
        booking.paymentStatus = 'failed';
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking cancelled successfully.', booking });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error cancelling hotel booking:', error);
        throw error;
    }
});

// @desc    Delete a hotel booking (Admin only)
// @route   DELETE /api/hotel-bookings/admin/:id
// @access  Private/Admin
exports.deleteHotelBookingAdmin = asyncHandler(async (req, res) => {
    const bookingId = req.params.id;

    if (!isValidObjectId(bookingId)) {
        res.status(400);
        throw new Error('Invalid Booking ID format.');
    }

    const booking = await HotelBooking.findById(bookingId);

    if (!booking) {
        res.status(404);
        throw new Error('Hotel booking not found.');
    }

    // The 'admin' middleware already ensures only admins can reach this route.
    // No need for explicit req.user.roles.includes('admin') check here unless
    // you have more granular admin roles (e.g., 'superAdmin' vs 'editorAdmin').

    await HotelBooking.deleteOne({ _id: bookingId });

    res.status(200).json({ message: 'Hotel booking deleted successfully!', id: bookingId });
});

// Removed the redundant module.exports block at the end.
// All functions are already exported via `exports.functionName = ...`