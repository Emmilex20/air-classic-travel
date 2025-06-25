// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Payment = require('../models/Payment'); // Make sure your Payment model is imported
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// FIXED EXCHANGE RATE FOR DEMONSTRATION PURPOSES ONLY
// In a real application, fetch this from a reliable currency exchange API.
const EUR_TO_NGN_EXCHANGE_RATE = 1600; // Example: 1 EUR = 1600 NGN

// Helper function to convert price to NGN if necessary
const convertToNaira = (amount, currency) => {
    // Ensure amount is a valid number before conversion
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        console.warn(`[convertToNaira] Invalid amount provided: ${amount}. Returning 0.`);
        return 0; // Return 0 or handle as an error case
    }

    if (currency && currency.toUpperCase() === 'EUR') {
        return numericAmount * EUR_TO_NGN_EXCHANGE_RATE;
    }
    return numericAmount; // Assume it's already NGN or another acceptable currency, return as is.
};


// Helper function to find or create a Flight document based on provided details
const findOrCreateFlight = async (flightDetails) => {
    if (!flightDetails) {
        console.error("[findOrCreateFlight] flightDetails is null or undefined.");
        return null;
    }

    console.log(`[findOrCreateFlight] Received flightDetails for processing:`);
    console.log(JSON.stringify(flightDetails, null, 2)); // Log the full incoming object

    let flightDoc = null;

    // Define the update/create payload from the incoming flightDetails
    // ENSURE THESE MAPPING MATCH YOUR FLIGHT MODEL'S SCHEMA FIELD NAMES EXACTLY
    const updatePayload = {
        // Price: Map from totalPrice or price in flightDetails, default to 0 if neither are valid numbers
        price: parseFloat(flightDetails.totalPrice !== undefined && flightDetails.totalPrice !== null ? flightDetails.totalPrice : flightDetails.price || '0'),
        currency: flightDetails.currency || 'NGN',
        availableSeats: flightDetails.availableSeats,
        class: flightDetails.class || 'ECONOMY', // Ensure default for class
        status: flightDetails.status || 'Scheduled',
        departureGate: flightDetails.departureGate || null,
        arrivalGate: flightDetails.arrivalGate || null,
        segments: flightDetails.segments || [],
        // Duration: Map from totalDurationMinutes or durationMinutes, default to 0 if neither are valid numbers
        durationMinutes: flightDetails.totalDurationMinutes !== undefined && flightDetails.totalDurationMinutes !== null ? flightDetails.totalDurationMinutes : flightDetails.durationMinutes || 0,
        flightNumber: flightDetails.flightNumber,
        airline: flightDetails.airline,
        airlineCode: flightDetails.airlineCode,
        departureAirport: flightDetails.departureAirport,
        departureAirportCode: flightDetails.departureAirportCode,
        arrivalAirport: flightDetails.arrivalAirport,
        arrivalAirportCode: flightDetails.arrivalAirportCode,
        departureTime: new Date(flightDetails.departureTime),
        arrivalTime: new Date(flightDetails.arrivalTime),
        aircraftType: flightDetails.aircraftType || null,
        // Capacity: Use provided capacity or a reasonable default (e.g., 180)
        capacity: flightDetails.capacity || 180, 
    };

    // 1. Try to find by externalApiId first (for Amadeus offers)
    // If found, UPDATE it with the latest details from the incoming request.
    if (flightDetails.externalApiId) {
        console.log(`[findOrCreateFlight] Attempting to find/update by externalApiId: ${flightDetails.externalApiId}`);
        flightDoc = await Flight.findOneAndUpdate(
            { externalApiId: flightDetails.externalApiId },
            { $set: updatePayload }, // Use the prepared updatePayload
            { new: true, upsert: false } // new: true returns the updated doc, upsert: false means don't create if not found here
        );
        if (flightDoc) {
            console.log(`[findOrCreateFlight] Found and updated existing flight by externalApiId: ${flightDetails.externalApiId} (ID: ${flightDoc._id}).`);
            return flightDoc;
        }
    }

    // 2. If not found by externalApiId (or externalApiId was null/undefined or not found),
    // try to find by _id (for dummy flights that are already in DB)
    if (!flightDoc && flightDetails._id && isValidObjectId(flightDetails._id)) {
        console.log(`[findOrCreateFlight] Attempting to find/update by _id: ${flightDetails._id}`);
        flightDoc = await Flight.findOneAndUpdate(
            { _id: flightDetails._id },
            { $set: updatePayload }, // Use the prepared updatePayload
            { new: true, upsert: false }
        );
        if (flightDoc) {
            console.log(`[findOrCreateFlight] Found and updated existing flight by _id: ${flightDoc._id}.`);
            return flightDoc;
        }
    }

    // 3. If still not found, try by a composite key (flight number, airline, departure/arrival times, airports)
    // This is a fallback to catch flights that might not have externalApiId or _id that was found,
    // but match existing data by other unique identifiers.
    console.log('[findOrCreateFlight] No existing flight found by direct externalApiId or _id. Attempting to find/update by composite key.');
    const compositeQuery = {
        flightNumber: flightDetails.flightNumber,
        airlineCode: flightDetails.airlineCode,
        departureTime: new Date(flightDetails.departureTime),
        arrivalTime: new Date(flightDetails.arrivalTime),
        departureAirportCode: flightDetails.departureAirportCode,
        arrivalAirportCode: flightDetails.arrivalAirportCode,
    };
    
    flightDoc = await Flight.findOneAndUpdate(
        compositeQuery,
        { $set: { ...updatePayload, externalApiId: flightDetails.externalApiId || null } }, // Also set externalApiId if it wasn't there
        { new: true, upsert: false }
    );

    if (flightDoc) {
        console.log(`[findOrCreateFlight] Found and updated existing flight by composite key (ID: ${flightDoc._id}).`);
        return flightDoc;
    }


    // 4. If still not found by any means, create a new flight document
    console.log('[findOrCreateFlight] No existing flight found by any criteria. Creating a new Flight document.');
    try {
        const newFlight = new Flight({
            externalApiId: flightDetails.externalApiId || null,
            ...updatePayload // Use the same payload for creation
        });
        const savedFlight = await newFlight.save();
        console.log(`[findOrCreateFlight] Successfully created new Flight document (ID: ${savedFlight._id}) with externalApiId: ${savedFlight.externalApiId}, flightNumber: ${savedFlight.flightNumber}, price: ${savedFlight.totalPrice} ${savedFlight.currency}.`);
        return savedFlight;
    } catch (createErr) {
        console.error('[findOrCreateFlight] Error saving new Flight document during creation attempt:', createErr);
        if (createErr.code === 11000) {
            console.error(`[findOrCreateFlight] Duplicate key error for flight: ${JSON.stringify(createErr.keyValue)}. This indicates a potential issue with unique indexing or data consistency.`);
            throw new Error(`Duplicate flight entry detected during creation: ${JSON.stringify(createErr.keyValue)}`);
        }
        throw createErr; // Re-throw to propagate the error
    }
};

// --- Paystack Reference Generation Utility ---
const generatePaystackReference = () => `FLT-${uuidv4().substring(0, 8)}-${Date.now()}`;


// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = asyncHandler(async (req, res) => {
    const {
        outboundFlightDetails,
        returnFlightDetails,
        passengers,
        bookingType
    } = req.body;
    const userId = req.user._id;

    console.log('[createBooking] Request received for booking.');
    console.log(`[createBooking] Booking Type: ${bookingType}, Passengers: ${passengers.length}`);
    console.log('[createBooking] Outbound Flight Details:', outboundFlightDetails ? outboundFlightDetails._id || outboundFlightDetails.externalApiId || 'N/A' : 'Missing');
    if (bookingType === 'round-trip') {
        console.log('[createBooking] Return Flight Details:', returnFlightDetails ? returnFlightDetails._id || returnFlightDetails.externalApiId || 'N/A' : 'Missing');
    }

    // --- Input Validation ---
    if (!outboundFlightDetails) {
        res.status(400);
        throw new Error('Outbound flight details are required.');
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
        res.status(400);
        throw new Error('At least one passenger is required.');
    }
    // Basic passenger data validation
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

    const isRoundTripRequest = bookingType === 'round-trip';

    if (isRoundTripRequest && !returnFlightDetails) {
        res.status(400);
        throw new Error('Return flight details are required for a round-trip booking.');
    }
    if (!isRoundTripRequest && returnFlightDetails) {
         res.status(400);
         throw new Error('Return flight details provided for a one-way booking.');
    }

    const numberOfSeatsToBook = passengers.length;
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        console.log('[createBooking] Transaction started.');

        // Step 1: Find or Create Outbound Flight document in your DB
        console.log('[createBooking] Processing outbound flight...');
        const outboundFlightDoc = await findOrCreateFlight(outboundFlightDetails);
        if (!outboundFlightDoc) {
            res.status(500);
            throw new Error('Failed to process outbound flight information. Document not found or created.');
        }
        // Log the actual price and currency from the found/updated DB document
        console.log(`[createBooking] Outbound flight doc found/created: ${outboundFlightDoc._id}, Available Seats: ${outboundFlightDoc.availableSeats}, Price: ${outboundFlightDoc.totalPrice || outboundFlightDoc.price} ${outboundFlightDoc.currency}`);

        if (outboundFlightDoc.availableSeats < numberOfSeatsToBook) {
            res.status(400);
            throw new Error(`Not enough available seats on outbound flight ${outboundFlightDoc.flightNumber}. Available: ${outboundFlightDoc.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
        }

        // Calculate outbound price in NGN per person, then total
        // Use totalPrice from the updated flightDoc
        let outboundPricePerPersonNaira = convertToNaira(outboundFlightDoc.totalPrice || outboundFlightDoc.price, outboundFlightDoc.currency);
        console.log(`[createBooking] Outbound price per person (NGN): ${outboundPricePerPersonNaira}`);
        let totalBookingPrice = outboundPricePerPersonNaira * numberOfSeatsToBook;
        console.log(`[createBooking] Initial total booking price (outbound only): ${totalBookingPrice}`);
        
        let returnFlightDoc = null;
        let returnPricePerPersonNaira = 0;

        // Step 2: Find or Create Return Flight document (if round trip)
        if (isRoundTripRequest) {
            console.log('[createBooking] Processing return flight...');
            returnFlightDoc = await findOrCreateFlight(returnFlightDetails);
            if (!returnFlightDoc) {
                res.status(500);
                throw new Error('Failed to process return flight information. Document not found or created.');
            }
            // Log the actual price and currency from the found/updated DB document
            console.log(`[createBooking] Return flight doc found/created: ${returnFlightDoc._id}, Available Seats: ${returnFlightDoc.availableSeats}, Price: ${returnFlightDoc.totalPrice || returnFlightDoc.price} ${returnFlightDoc.currency}`);

            if (returnFlightDoc.availableSeats < numberOfSeatsToBook) {
                res.status(400);
                throw new Error(`Not enough available seats on return flight ${returnFlightDoc.flightNumber}. Available: ${returnFlightDoc.availableSeats}, Requested: ${numberOfSeatsToBook}.`);
            }
            
            // Additional round-trip validation
            // This comparison should now be accurate because findOrCreateFlight has updated the flightDoc with current times
            if (new Date(returnFlightDoc.departureTime) <= new Date(outboundFlightDoc.arrivalTime)) {
                res.status(400);
                throw new Error('Return flight departure time must be after outbound flight arrival time.');
            }
            if (outboundFlightDoc.departureAirportCode !== returnFlightDoc.arrivalAirportCode ||
                outboundFlightDoc.arrivalAirportCode !== returnFlightDoc.departureAirportCode) {
                res.status(400);
                throw new Error('Return flight route must be the reverse of the outbound flight route.');
            }

            // Calculate return price in NGN per person, then add to total
            returnPricePerPersonNaira = convertToNaira(returnFlightDoc.totalPrice || returnFlightDoc.price, returnFlightDoc.currency);
            console.log(`[createBooking] Return price per person (NGN): ${returnPricePerPersonNaira}`);
            totalBookingPrice += returnPricePerPersonNaira * numberOfSeatsToBook;
            console.log(`[createBooking] Final total booking price (outbound + return): ${totalBookingPrice}`);
        }

        // Step 3: Decrement available seats (within transaction)
        console.log(`[createBooking] Decrementing seats for outbound flight ${outboundFlightDoc.flightNumber}...`);
        outboundFlightDoc.availableSeats = Math.max(0, outboundFlightDoc.availableSeats - numberOfSeatsToBook);
        await outboundFlightDoc.save({ session });

        if (returnFlightDoc) {
            console.log(`[createBooking] Decrementing seats for return flight ${returnFlightDoc.flightNumber}...`);
            returnFlightDoc.availableSeats = Math.max(0, returnFlightDoc.availableSeats - numberOfSeatsToBook);
            await returnFlightDoc.save({ session });
        }

        // Step 4: Create the booking document
        const paystackRef = generatePaystackReference();
        console.log(`[createBooking] Generated Paystack reference: ${paystackRef}`);

        const newBooking = new Booking({
            user: userId,
            outboundFlight: outboundFlightDoc._id,
            returnFlight: returnFlightDoc ? returnFlightDoc._id : null,
            bookingType: bookingType,
            passengers,
            totalPrice: totalBookingPrice, // This is the final calculated total in NGN for all passengers
            bookingStatus: 'pending', // Initial status before payment
            paymentStatus: 'pending', // Initial payment status
            paystackReference: paystackRef, // Set the generated Paystack reference on the Booking
            // Store the externalApiId of the overall Amadeus offer if it was available on the main object
            amadeusOfferId: (outboundFlightDetails.externalApiId && !outboundFlightDetails.externalApiId.startsWith('dummy-')) ? outboundFlightDetails.externalApiId : null,
        });

        console.log(`[createBooking] Attempting to save new booking with total price: ${newBooking.totalPrice} NGN`);
        await newBooking.save({ session });

        // Create a Payment record
        console.log(`[createBooking] Creating Payment record with booking ID: ${newBooking._id} and paystackRef: ${paystackRef}`);
        const newPayment = new Payment({
            booking: newBooking._id,
            user: userId,
            amount: totalBookingPrice,
            currency: 'NGN',
            paymentMethod: 'Paystack',
            status: 'pending', // Will be updated to 'completed' or 'failed' by verification endpoint
            // Explicitly set paystackReference here to ensure it's not missed by Mongoose
            paystackReference: paystackRef, 
        });
        // Log the Payment object after explicitly setting the reference
        console.log(`[createBooking] Payment object prepared (VERIFYING REFERENCE): ${JSON.stringify(newPayment)}`); 
        await newPayment.save({ session }); // <-- Ensure this save operation exists

        await session.commitTransaction();
        session.endSession();
        console.log('[createBooking] Transaction committed successfully.');

        // Populate flights for the response
        await newBooking.populate('outboundFlight');
        if (newBooking.returnFlight) { // Check if returnFlight exists before populating
            await newBooking.populate('returnFlight');
        }

        res.status(201).json({
            message: 'Booking created. Proceed to payment.',
            booking: newBooking,
            paystackReference: paystackRef,
            totalAmount: totalBookingPrice, // Send the final NGN amount to frontend
            userEmail: req.user.email // Assuming req.user.email is available from auth middleware
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating flight booking:', error);
        // If the error has a status code set by a previous throw, use it
        if (res.statusCode === 200) { // If status code hasn't been set yet (default 200)
            res.status(500); // Default to 500 for unhandled errors
        }
        // Send a more controlled error response
        res.status(res.statusCode || 500).json({ message: error.message || 'An unexpected error occurred during booking.' });
    }
});


// @desc    Get all bookings for the authenticated user
// @route   GET /api/bookings/my-bookings
// @access  Private (User)
const getUserBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
        .populate('outboundFlight')
        .populate('returnFlight')
        .sort({ createdAt: -1 }); // Sort by creation date, most recent first

    res.status(200).json(bookings);
});

// @desc    Get a single booking by ID for the authenticated user (or admin/staff)
// @route   GET /api/bookings/:id
// @access  Private (User, Admin, Airline Staff)
const getBookingById = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('Invalid Booking ID format.');
    }

    const booking = await Booking.findById(req.params.id)
        .populate('outboundFlight')
        .populate('returnFlight');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found.');
    }

    // Allow user to view their own booking, or admin/airline_staff to view any booking
    const isOwner = booking.user.toString() === req.user.id.toString();
    const isAdminOrStaff = req.user.roles.includes('admin') || req.user.roles.includes('airline_staff');

    if (!isOwner && !isAdminOrStaff) {
        res.status(403);
        throw new Error('Not authorized to view this booking.');
    }

    res.status(200).json(booking);
});


// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User, Admin, Airline Staff)
const cancelBooking = asyncHandler(async (req, res) => {
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

        // Allow owner or admin/airline_staff to cancel
        const isOwner = booking.user.toString() === req.user.id.toString();
        const isAdminOrStaff = req.user.roles.includes('admin') || req.user.roles.includes('airline_staff');

        if (!isOwner && !isAdminOrStaff) {
            res.status(403);
            throw new Error('Not authorized to cancel this booking.');
        }

        if (booking.bookingStatus === 'cancelled') {
            res.status(400);
            throw new Error('Booking is already cancelled.');
        }

        const numberOfSeatsToRefund = booking.passengers.length;

        // Increment available seats on associated flights
        const outboundFlight = await Flight.findById(booking.outboundFlight).session(session);
        if (outboundFlight) {
            outboundFlight.availableSeats += numberOfSeatsToRefund;
            await outboundFlight.save({ session });
        } else {
            console.warn(`Outbound flight ${booking.outboundFlight} not found for booking ${booking._id} during cancellation. Seats not re-added.`);
        }

        if (booking.returnFlight) {
            const returnFlight = await Flight.findById(booking.returnFlight).session(session);
            if (returnFlight) {
                returnFlight.availableSeats += numberOfSeatsToRefund;
                await returnFlight.save({ session });
            } else {
                console.warn(`Return flight ${booking.returnFlight} not found for booking ${booking._id} during cancellation. Seats not re-added.`);
            }
        }

        booking.bookingStatus = 'cancelled';
        booking.paymentStatus = 'refunded'; // Or 'refund_pending' depending on your flow
        await booking.save({ session });

        // Update associated Payment record status
        const payment = await Payment.findOne({ booking: booking._id, paystackReference: booking.paystackReference }).session(session);
        if (payment) {
            payment.status = 'refunded';
            await payment.save({ session });
        } else {
            console.warn(`Payment record not found for booking ${booking._id} during cancellation. Cannot update payment status.`);
        }


        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking cancelled successfully.', booking });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error cancelling booking:', error);
        if (res.statusCode === 200) {
            res.status(500);
        }
        throw error; // Re-throw for asyncHandler
    }
});


// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings (Frontend hits this path directly, matching root route in router)
// @access  Private (Admin)
const getAllBookingsAdmin = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({})
        .populate('user', 'name email')
        .populate('outboundFlight')
        .populate('returnFlight')
        .sort({ createdAt: -1 }); // Sort by creation date, most recent first
    res.status(200).json(bookings);
});

// @desc    Update booking status (Admin only)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatusAdmin = asyncHandler(async (req, res) => {
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
    // const previousPaymentStatus = booking.paymentStatus; // Keep track of previous payment status (not used directly in logic below)

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        if (bookingStatus && bookingStatus !== booking.bookingStatus) {
            // Validate the new booking status against allowed enum values
            const validBookingStatuses = Booking.schema.path('bookingStatus').enumValues;
            if (!validBookingStatuses.includes(bookingStatus)) {
                res.status(400);
                throw new Error(`Invalid bookingStatus: ${bookingStatus}. Must be one of: ${validBookingStatuses.join(', ')}`);
            }
            booking.bookingStatus = bookingStatus;
        }
        if (paymentStatus && paymentStatus !== booking.paymentStatus) {
            // Validate the new payment status against allowed enum values
            const validPaymentStatuses = Booking.schema.path('paymentStatus').enumValues;
            if (!validPaymentStatuses.includes(paymentStatus)) {
                res.status(400);
                throw new Error(`Invalid paymentStatus: ${paymentStatus}. Must be one of: ${validPaymentStatuses.join(', ')}`);
            }
            booking.paymentStatus = paymentStatus;

            // Also update the associated Payment record if paymentStatus changes
            const payment = await Payment.findOne({ booking: booking._id, paystackReference: booking.paystackReference }).session(session);
            if (payment) {
                payment.status = paymentStatus; // Update payment status based on booking's new paymentStatus
                await payment.save({ session });
            } else {
                console.warn(`Payment record not found for booking ${booking._id} during status update. Cannot update payment status.`);
            }
        }

        const updatedBooking = await booking.save({ session });

        // Logic to re-add seats if booking status changes to 'cancelled'
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
        // Add logic for other status changes if needed (e.g., handling payment status changes)

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(updatedBooking);
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error(`Error updating booking status for ${req.params.id}:`, error);
        if (res.statusCode === 200) {
            res.status(500);
        }
        throw error; // Re-throw for asyncHandler
    }
});


// @desc    Delete a booking (Admin only)
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
const deleteBookingAdmin = asyncHandler(async (req, res) => {
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

        // Re-add seats if the booking was not already cancelled (important for data integrity)
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

        // Also delete the associated Payment record
        await Payment.deleteOne({ booking: booking._id }).session(session);


        await Booking.deleteOne({ _id: req.params.id }, { session }); // Use deleteOne with filter and session

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking deleted successfully.' });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error deleting booking (Admin):', error);
        if (res.statusCode === 200) {
            res.status(500);
        }
        throw error; // Re-throw for asyncHandler
    }
});


module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    cancelBooking,
    getAllBookingsAdmin,
    updateBookingStatusAdmin,
    deleteBookingAdmin
};
