// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all bookings for the authenticated user
// @route   GET /api/bookings/my
// @access  Private (User)
exports.getUserBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
        .populate('outboundFlight')
        .populate('returnFlight');

    res.status(200).json(bookings);
});

// @desc    Get a single booking by ID for the authenticated user
// @route   GET /api/bookings/:id
// @access  Private (User)
exports.getBookingById = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400); // Use res.status() and throw for asyncHandler
        throw new Error('Invalid Booking ID format.');
    }

    const booking = await Booking.findById(req.params.id)
        .populate('outboundFlight')
        .populate('returnFlight');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found.');
    }
    if (booking.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this booking.');
    }

    res.status(200).json(booking);
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = asyncHandler(async (req, res) => {
    const {
        outboundFlightId,
        returnFlightId,
        passengers,
        bookingType
    } = req.body;

    // --- Input Validation ---
    if (!outboundFlightId || !isValidObjectId(outboundFlightId)) {
        res.status(400);
        throw new Error('Valid outbound flight ID is required.');
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
        res.status(400);
        throw new Error('At least one passenger is required.');
    }
    for (const p of passengers) {
        if (!p.firstName || !p.lastName || !p.gender || !p.dateOfBirth || !p.nationality) {
            res.status(400);
            throw new Error('All passenger fields (firstName, lastName, gender, dateOfBirth, nationality) are required.');
        }
        if (isNaN(new Date(p.dateOfBirth).getTime())) {
            res.status(400);
            throw new Error('Invalid date of birth for one or more passengers.');
        }
    }

    const isRoundTrip = returnFlightId && isValidObjectId(returnFlightId);

    if (isRoundTrip && outboundFlightId === returnFlightId) {
        res.status(400);
        throw new Error('Outbound and return flights cannot be the same for a round-trip booking.');
    }
    // No need for `if (isRoundTrip && !returnFlightId)` because `isRoundTrip` already checks `returnFlightId`'s validity.

    const numberOfSeatsToBook = passengers.length;
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        let outboundFlight = await Flight.findById(outboundFlightId).session(session);
        if (!outboundFlight) {
            res.status(404);
            throw new Error('Outbound flight not found.');
        }
        if (outboundFlight.availableSeats < numberOfSeatsToBook) {
            res.status(400);
            throw new Error(`Not enough available seats on outbound flight ${outboundFlight.flightNumber}. Available: ${outboundFlight.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
        }

        let totalBookingPrice = outboundFlight.price * numberOfSeatsToBook;
        let returnFlightDoc = null;

        if (isRoundTrip) {
            returnFlightDoc = await Flight.findById(returnFlightId).session(session);
            if (!returnFlightDoc) {
                res.status(404);
                throw new Error('Return flight not found.');
            }
            if (returnFlightDoc.availableSeats < numberOfSeatsToBook) {
                res.status(400);
                throw new Error(`Not enough available seats on return flight ${returnFlightDoc.flightNumber}. Available: ${returnFlightDoc.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
            }
            if (returnFlightDoc.departureTime <= outboundFlight.arrivalTime) {
                res.status(400);
                throw new Error('Return flight departure time must be after outbound flight arrival time.');
            }
            if (returnFlightDoc.departureAirport !== outboundFlight.arrivalAirport || returnFlightDoc.arrivalAirport !== outboundFlight.departureAirport) {
                res.status(400);
                throw new Error('Return flight route does not match the outbound flight route. It must be a reverse route.');
            }
            totalBookingPrice += returnFlightDoc.price * numberOfSeatsToBook;
        }

        outboundFlight.availableSeats -= numberOfSeatsToBook;
        await outboundFlight.save({ session });

        if (isRoundTrip) {
            returnFlightDoc.availableSeats -= numberOfSeatsToBook;
            await returnFlightDoc.save({ session });
        }

        const paystackRef = `FLT-${uuidv4().substring(0, 8)}-${Date.now()}`;

        const newBooking = new Booking({
            user: req.user.id,
            outboundFlight: outboundFlightId,
            returnFlight: isRoundTrip ? returnFlightId : null,
            bookingType: isRoundTrip ? 'round-trip' : 'one-way',
            passengers,
            totalPrice: totalBookingPrice,
            bookingStatus: 'pending',
            paymentStatus: 'pending',
            paystackReference: paystackRef,
        });

        await newBooking.save({ session });

        await session.commitTransaction();
        session.endSession();

        await newBooking.populate('outboundFlight');
        if (isRoundTrip) {
            await newBooking.populate('returnFlight');
        }

        res.status(201).json({
            message: 'Booking created. Proceed to payment.',
            booking: newBooking,
            paystackReference: paystackRef,
            totalAmount: totalBookingPrice,
            userEmail: req.user.email
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating flight booking:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400);
            throw new Error(`Booking validation failed: ${messages.join(', ')}`);
        }
        throw error;
    }
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
exports.cancelBooking = asyncHandler(async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const bookingId = req.params.id;
        if (!isValidObjectId(bookingId)) {
            res.status(400);
            throw new Error('Invalid Booking ID format.');
        }

        const booking = await Booking.findById(bookingId).session(session);

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found.');
        }

        if (booking.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to cancel this booking.');
        }

        if (booking.bookingStatus === 'cancelled') {
            res.status(400);
            throw new Error('Booking is already cancelled.');
        }

        const numberOfSeatsToRefund = booking.passengers.length;

        const outboundFlight = await Flight.findById(booking.outboundFlight).session(session);
        if (outboundFlight) {
            outboundFlight.availableSeats += numberOfSeatsToRefund;
            await outboundFlight.save({ session });
        } else {
            console.warn(`Outbound flight ${booking.outboundFlight} not found for booking ${booking._id} during cancellation.`);
        }

        if (booking.returnFlight) {
            const returnFlight = await Flight.findById(booking.returnFlight).session(session);
            if (returnFlight) {
                returnFlight.availableSeats += numberOfSeatsToRefund;
                await returnFlight.save({ session });
            } else {
                console.warn(`Return flight ${booking.returnFlight} not found for booking ${booking._id} during cancellation.`);
            }
        }

        booking.bookingStatus = 'cancelled';
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking cancelled successfully.', booking });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error cancelling booking:', error);
        throw error; // Re-throw for asyncHandler
    }
});

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings (Frontend hits this path directly, matching root route in router)
// @access  Private (Admin)
exports.getAllBookingsAdmin = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({})
        .populate('user', 'name email')
        .populate('outboundFlight')
        .populate('returnFlight');
    res.status(200).json(bookings);
});

// @desc    Update booking status (Admin only)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatusAdmin = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Booking ID format.');
    }
    const { bookingStatus, paymentStatus } = req.body;

    if (!bookingStatus && !paymentStatus) {
        res.status(400);
        throw new Error('No status provided for update.');
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found.');
    }

    const previousBookingStatus = booking.bookingStatus;
    const previousPaymentStatus = booking.paymentStatus;

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        if (bookingStatus && bookingStatus !== booking.bookingStatus) {
            booking.bookingStatus = bookingStatus;
        }
        if (paymentStatus && paymentStatus !== booking.paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }

        const updatedBooking = await booking.save({ session });

        if (previousBookingStatus !== 'cancelled' && updatedBooking.bookingStatus === 'cancelled') {
            const numberOfSeatsToRefund = updatedBooking.passengers.length;
            const outboundFlight = await Flight.findById(updatedBooking.outboundFlight).session(session);
            if (outboundFlight) {
                outboundFlight.availableSeats += numberOfSeatsToRefund;
                await outboundFlight.save({ session });
            }
            if (updatedBooking.returnFlight) {
                const returnFlight = await Flight.findById(updatedBooking.returnFlight).session(session);
                if (returnFlight) {
                    returnFlight.availableSeats += numberOfSeatsToRefund;
                    await returnFlight.save({ session });
                }
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(updatedBooking);
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error(`Error updating booking status for ${req.params.id}:`, error);
        throw error; // Re-throw for asyncHandler
    }
});


// @desc    Delete a booking (Admin only)
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
exports.deleteBookingAdmin = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Booking ID format.');
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Booking.findById(req.params.id).session(session);
        if (!booking) {
            res.status(404);
            throw new Error('Booking not found.');
        }

        if (booking.bookingStatus !== 'cancelled') {
            const numberOfSeatsToRefund = booking.passengers.length;
            const outboundFlight = await Flight.findById(booking.outboundFlight).session(session);
            if (outboundFlight) {
                outboundFlight.availableSeats += numberOfSeatsToRefund;
                await outboundFlight.save({ session });
            }
            if (booking.returnFlight) {
                const returnFlight = await Flight.findById(booking.returnFlight).session(session);
                if (returnFlight) {
                    returnFlight.availableSeats += numberOfSeatsToRefund;
                    await returnFlight.save({ session });
                }
            }
        }

        await Booking.deleteOne({ _id: req.params.id }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking deleted successfully.' });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error deleting booking (Admin):', error);
        throw error; // Re-throw for asyncHandler
    }
});