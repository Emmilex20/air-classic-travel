// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler'); // Import asyncHandler

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all bookings for the authenticated user
// @route   GET /api/bookings/my
// @access  Private (User)
exports.getUserBookings = asyncHandler(async (req, res) => {
    // Populate both outboundFlight and returnFlight for user bookings
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
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    // Populate both outboundFlight and returnFlight for a single booking
    const booking = await Booking.findById(req.params.id)
        .populate('outboundFlight')
        .populate('returnFlight');

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
    }
    // Ensure the booking belongs to the authenticated user
    if (booking.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this booking.' });
    }

    res.status(200).json(booking);
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (User)
exports.createBooking = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware (contains authenticated user's ID)
    const {
        outboundFlightId,
        returnFlightId, // This will be optional for one-way, required for round-trip
        passengers, // Array of passenger objects
        bookingType // 'one-way' or 'round-trip'
    } = req.body;

    // --- Input Validation ---
    if (!outboundFlightId || !isValidObjectId(outboundFlightId)) {
        return res.status(400).json({ message: 'Valid outbound flight ID is required.' });
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
        return res.status(400).json({ message: 'At least one passenger is required.' });
    }
    // Basic passenger data validation
    for (const p of passengers) {
        if (!p.firstName || !p.lastName || !p.gender || !p.dateOfBirth || !p.nationality) {
            return res.status(400).json({ message: 'All passenger fields (firstName, lastName, gender, dateOfBirth, nationality) are required.' });
        }
        if (isNaN(new Date(p.dateOfBirth).getTime())) {
            return res.status(400).json({ message: 'Invalid date of birth for one or more passengers.' });
        }
    }

    // Determine booking type based on presence of returnFlightId
    const isRoundTrip = returnFlightId && isValidObjectId(returnFlightId);

    if (isRoundTrip && outboundFlightId === returnFlightId) {
        return res.status(400).json({ message: 'Outbound and return flights cannot be the same for a round-trip booking.' });
    }
    if (isRoundTrip && !returnFlightId) {
          return res.status(400).json({ message: 'Return flight ID is required for a round-trip booking.' });
    }
    // If !isRoundTrip and returnFlightId is present but invalid, it would have been caught by isValidObjectId above.

    const numberOfSeatsToBook = passengers.length;
    let session; // Declare session variable outside try-catch to ensure it's accessible in finally

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        let outboundFlight = await Flight.findById(outboundFlightId).session(session);
        if (!outboundFlight) {
            throw new Error('Outbound flight not found.');
        }
        if (outboundFlight.availableSeats < numberOfSeatsToBook) {
            throw new Error(`Not enough available seats on outbound flight ${outboundFlight.flightNumber}. Available: ${outboundFlight.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
        }

        let totalBookingPrice = outboundFlight.price * numberOfSeatsToBook;
        let returnFlightDoc = null; // Renamed to avoid conflict with `returnFlightId`

        if (isRoundTrip) {
            returnFlightDoc = await Flight.findById(returnFlightId).session(session);
            if (!returnFlightDoc) {
                throw new Error('Return flight not found.');
            }
            if (returnFlightDoc.availableSeats < numberOfSeatsToBook) {
                throw new Error(`Not enough available seats on return flight ${returnFlightDoc.flightNumber}. Available: ${returnFlightDoc.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
            }
            // Additional logical checks for round-trip:
            if (returnFlightDoc.departureTime <= outboundFlight.arrivalTime) {
                throw new Error('Return flight departure time must be after outbound flight arrival time.');
            }
            if (returnFlightDoc.departureAirport !== outboundFlight.arrivalAirport || returnFlightDoc.arrivalAirport !== outboundFlight.departureAirport) {
                throw new Error('Return flight route does not match the outbound flight route. It must be a reverse route.');
            }
            totalBookingPrice += returnFlightDoc.price * numberOfSeatsToBook;
        }

        // Decrement available seats for outbound flight
        outboundFlight.availableSeats -= numberOfSeatsToBook;
        await outboundFlight.save({ session });

        // Decrement available seats for return flight if round-trip
        if (isRoundTrip) {
            returnFlightDoc.availableSeats -= numberOfSeatsToBook;
            await returnFlightDoc.save({ session });
        }

        // Create the booking document
        const newBooking = new Booking({
            user: req.user.id, // User ID from authenticated token
            outboundFlight: outboundFlightId,
            returnFlight: isRoundTrip ? returnFlightId : null, // Set null if one-way
            bookingType: isRoundTrip ? 'round-trip' : 'one-way',
            passengers,
            totalPrice: totalBookingPrice, // Total price for all passengers combined
            bookingStatus: 'confirmed',
            paymentStatus: 'pending',
        });

        await newBooking.save({ session }); // Save the new booking within the transaction

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Populate flights for the response to the client
        await newBooking.populate('outboundFlight');
        if (isRoundTrip) {
            await newBooking.populate('returnFlight');
        }

        res.status(201).json(newBooking);

    } catch (error) {
        // --- Abort transaction if any error occurs ---
        if (session) { // Ensure session exists before trying to abort
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating booking:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Booking validation failed: ${messages.join(', ')}`, errors: error.errors });
        }
        res.status(400).json({ message: error.message || 'Failed to create booking. Please try again.' });
    }
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User)
exports.cancelBooking = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Booking.findById(req.params.id).session(session);

        if (!booking) {
            throw new Error('Booking not found.');
        }

        // Ensure the booking belongs to the authenticated user
        if (booking.user.toString() !== req.user.id) {
            throw new Error('Not authorized to cancel this booking.');
        }

        if (booking.bookingStatus === 'cancelled') {
            throw new Error('Booking is already cancelled.');
        }

        const numberOfSeatsToRefund = booking.passengers.length;

        // Increment available seats for outbound flight
        const outboundFlight = await Flight.findById(booking.outboundFlight).session(session);
        if (outboundFlight) {
            outboundFlight.availableSeats += numberOfSeatsToRefund;
            await outboundFlight.save({ session });
        } else {
            console.warn(`Outbound flight ${booking.outboundFlight} not found for booking ${booking._id} during cancellation.`);
        }

        // If it's a round-trip, increment seats for return flight as well
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
        // Optional: Set paymentStatus to 'refunded' if your payment logic allows
        // booking.paymentStatus = 'refunded';
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
        res.status(400).json({ message: error.message || 'Failed to cancel booking. Please try again.' });
    }
});

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings  (Frontend hits this path directly, matching root route in router)
// @access  Private (Admin)
exports.getAllBookingsAdmin = asyncHandler(async (req, res) => {
    // Populate user, outboundFlight, and returnFlight for admin view
    const bookings = await Booking.find({})
        .populate('user', 'name email') // Populate user with name and email
        .populate('outboundFlight')
        .populate('returnFlight');
    res.status(200).json(bookings);
});

// @desc    Update booking status (Admin only)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatusAdmin = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }
    const { bookingStatus, paymentStatus } = req.body;

    if (!bookingStatus && !paymentStatus) {
        return res.status(400).json({ message: 'No status provided for update.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
    }

    const previousStatus = booking.bookingStatus; // Store for seat adjustment logic

    if (bookingStatus) {
        booking.bookingStatus = bookingStatus;
    }
    if (paymentStatus) {
        booking.paymentStatus = paymentStatus;
    }

    const updatedBooking = await booking.save();

    // Handle seat adjustments if status changes relevantly (e.g., from confirmed to cancelled)
    if (previousStatus !== 'cancelled' && bookingStatus === 'cancelled') {
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();

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
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            console.error(`Error adjusting seats for booking ${updatedBooking._id} during admin status update to cancelled:`, error);
        }
    } else if (previousStatus === 'cancelled' && bookingStatus !== 'cancelled') {
        // Warning: Changing from cancelled back to confirmed/completed does NOT re-deduct seats here.
        // This logic is more complex and depends on whether re-booking seats is intended.
        console.warn(`Admin changed booking ${updatedBooking._id} status from cancelled to ${bookingStatus}. Seat count was not automatically adjusted.`);
    }

    res.status(200).json(updatedBooking);
});

// @desc    Delete a booking (Admin only)
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
exports.deleteBookingAdmin = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Booking.findById(req.params.id).session(session);
        if (!booking) {
            throw new Error('Booking not found.');
        }

        // Re-add seats to flights before deleting the booking if it was confirmed
        if (booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'pending') { // Also for pending if seats were reduced
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
        res.status(400).json({ message: error.message || 'Failed to delete booking. Please try again.' });
    }
});