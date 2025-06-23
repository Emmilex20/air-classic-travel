// backend/controllers/paymentController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose'); // Import mongoose for session

const Booking = require('../models/Booking'); // For Flight Bookings
const HotelBooking = require('../models/HotelBooking'); // For Hotel Bookings
const Payment = require('../models/Payment'); // Import your Payment model
const User = require('../models/User'); // Import your User model (needed for populate 'user')


const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper to handle booking status updates for both flight and hotel bookings
const updateBookingStatusAndPayment = async (Model, bookingId, paystackReference, amountPaidKobo, statusToSet, session = null) => {
    console.log(`[updateBookingStatusAndPayment] Attempting to update booking: ID=${bookingId}, Ref=${paystackReference}, StatusToSet=${statusToSet}`);

    const booking = await Model.findById(bookingId).session(session);

    if (!booking) {
        console.warn(`[updateBookingStatusAndPayment] Booking (ID: ${bookingId}, Ref: ${paystackReference}) not found for update.`);
        return null;
    }

    console.log(`[updateBookingStatusAndPayment] Found booking. Current status: ${booking.bookingStatus}, Payment status: ${booking.paymentStatus}`);

    if (booking.paystackReference !== paystackReference) {
        console.error(`[updateBookingStatusAndPayment] Reference mismatch for booking ${bookingId}. Stored: ${booking.paystackReference}, Paystack: ${paystackReference}`);
        return null;
    }

    const expectedAmountKobo = Math.round(booking.totalPrice * 100);
    console.log(`[updateBookingStatusAndPayment] Expected Amount (Kobo): ${expectedAmountKobo}, Received Amount (Kobo): ${amountPaidKobo}`);

    if (amountPaidKobo !== expectedAmountKobo) {
        console.error(`[updateBookingStatusAndPayment] Amount mismatch for booking ${bookingId} (ref: ${paystackReference}). Expected: ${expectedAmountKobo}, Received: ${amountPaidKobo}`);
        if (statusToSet === 'completed') {
            booking.paymentStatus = 'failed';
            booking.bookingStatus = 'pending';
        }
        await booking.save({ session });
        return null;
    }

    if (booking.paymentStatus !== 'completed' && statusToSet === 'completed') {
        booking.paymentStatus = 'completed';
        booking.bookingStatus = 'confirmed';
        console.log(`[updateBookingStatusAndPayment] Booking ${booking._id} updated to Confirmed/Completed.`);
    } else if (statusToSet === 'failed') {
        if (booking.paymentStatus !== 'completed') { // Only set to failed if not already completed
            booking.paymentStatus = 'failed';
            booking.bookingStatus = 'pending'; // Or 'cancelled' if you want to automatically cancel on failed payment
            console.log(`[updateBookingStatusAndPayment] Booking ${booking._id} updated to Failed.`);
        }
    } else {
        console.log(`[updateBookingStatusAndPayment] No status change needed for booking ${booking._id}.`);
    }

    await booking.save({ session });
    console.log(`[updateBookingStatusAndPayment] Booking ${booking._id} saved successfully.`);
    return booking;
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments/admin
// @access  Private/Admin
exports.getAllPaymentsAdmin = asyncHandler(async (req, res) => { // <-- CHANGED to exports.getAllPaymentsAdmin
    // You might want to sort, paginate here in a real app
    // .populate('user', 'username email') will fetch username and email from the User model
    // assuming your Payment model has a 'user' field that references the User model.
    const payments = await Payment.find({})
                                  .populate('user', 'username email') // Populate user details
                                  .sort({ createdAt: -1 }); // Latest first

    res.status(200).json(payments);
});


// @desc    Verify a Paystack payment (called by frontend after payment)
// @route   POST /api/payments/verify
// @access  Private (User who initiated payment)
exports.verifyPaystackPayment = asyncHandler(async (req, res) => {
    console.log('[verifyPaystackPayment] Received verification request.');
    const { reference, bookingId, bookingType } = req.body;

    if (!reference || !bookingId || !bookingType) {
        console.error('[verifyPaystackPayment] Missing data: reference, bookingId, or bookingType.');
        return res.status(400).json({ message: 'Missing transaction reference, booking ID, or booking type.' });
    }
    if (!['flight', 'hotel'].includes(bookingType)) {
        console.error(`[verifyPaystackPayment] Invalid booking type: ${bookingType}.`);
        return res.status(400).json({ message: 'Invalid booking type provided. Must be "flight" or "hotel".' });
    }

    console.log(`[verifyPaystackPayment] Verifying Ref: ${reference}, ID: ${bookingId}, Type: ${bookingType}`);

    try {
        // --- Access process.env.PAYSTACK_SECRET_KEY HERE ---
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        if (!PAYSTACK_SECRET_KEY) {
            console.error('[verifyPaystackPayment] FATAL ERROR: PAYSTACK_SECRET_KEY is undefined at function execution.');
            return res.status(500).json({ message: 'Server configuration error: Paystack secret key missing.' });
        }

        const paystackVerifyUrl = `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`;
        console.log(`[verifyPaystackPayment] Calling Paystack API: ${paystackVerifyUrl}`);

        const paystackResponse = await axios.get(paystackVerifyUrl, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const { data } = paystackResponse.data;
        console.log(`[verifyPaystackPayment] Paystack API Response Status: ${data.status}`);

        if (data.status === 'success') {
            const Model = bookingType === 'flight' ? Booking : HotelBooking;
            // The amount returned by Paystack 'data.amount' is in kobo (smallest currency unit),
            // so pass it directly to updateBookingStatusAndPayment
            const updatedBooking = await updateBookingStatusAndPayment(Model, bookingId, reference, data.amount, 'completed');

            // Optionally, create a Payment record in your DB if you don't already do it
            // This is good for the "All Payments" view
            try {
                await Payment.create({
                    user: req.user.id, // Assuming req.user is populated by protect middleware
                    amount: data.amount / 100, // Convert kobo to actual currency units
                    currency: data.currency,
                    paystackReference: reference,
                    status: 'succeeded',
                    paymentMethod: data.channel, // e.g., 'card', 'bank_transfer'
                    type: bookingType, // 'flight' or 'hotel'
                    relatedBooking: bookingId, // Link to the booking
                    paidAt: new Date(data.paid_at), // <-- NEW: Add paidAt from Paystack response
                });
                console.log(`[verifyPaystackPayment] Payment record created for reference: ${reference}`);
            } catch (paymentDbError) {
                console.error(`[verifyPaystackPayment] Error saving payment record to DB for ref ${reference}:`, paymentDbError);
                // Decide how to handle this: log, alert admin, but don't necessarily fail the user's booking
            }


            if (updatedBooking) {
                console.log(`[verifyPaystackPayment] Payment verified and booking ${updatedBooking._id} confirmed.`);
                res.status(200).json({
                    message: 'Payment verified and booking confirmed successfully.',
                    bookingId: updatedBooking._id,
                    paymentStatus: updatedBooking.paymentStatus,
                    bookingStatus: updatedBooking.bookingStatus,
                });
            } else {
                console.error('[verifyPaystackPayment] Payment successful on Paystack, but booking update failed or data mismatch.');
                res.status(400).json({ message: 'Payment verification failed due to data discrepancy or booking not found. Please contact support.' });
            }

        } else {
            console.warn(`[verifyPaystackPayment] Paystack reported transaction as NOT successful. Status: ${data.status}`);
            const Model = bookingType === 'flight' ? Booking : HotelBooking;
            // Pass data.amount (kobo) for comparison in updateBookingStatusAndPayment
            await updateBookingStatusAndPayment(Model, bookingId, reference, data.amount, 'failed');

            // Optionally, create a failed Payment record
            try {
                await Payment.create({
                    user: req.user.id,
                    amount: data.amount / 100,
                    currency: data.currency,
                    paystackReference: reference,
                    status: 'failed',
                    paymentMethod: data.channel,
                    type: bookingType,
                    relatedBooking: bookingId,
                    paidAt: new Date(data.paid_at), // <-- NEW: Add paidAt for failed payments too
                });
                console.log(`[verifyPaystackPayment] Failed payment record created for reference: ${reference}`);
            } catch (paymentDbError) {
                console.error(`[verifyPaystackPayment] Error saving failed payment record to DB for ref ${reference}:`, paymentDbError);
            }

            res.status(400).json({ message: data.gateway_response || 'Paystack verification failed.' });
        }
    } catch (error) {
        console.error('[verifyPaystackPayment] ERROR during payment verification:', error.message);
        if (error.response) {
            console.error('[verifyPaystackPayment] Paystack API Error Response Data:', error.response.data);
            console.error('[verifyPaystackPayment] Paystack API Error Response Status:', error.response.status);
            if (error.response.status === 401 || error.response.status === 403) {
                console.error('CRITICAL: Paystack Secret Key used in backend might be incorrect or has insufficient permissions!');
            }
        }
        res.status(500).json({ message: 'Server error during payment verification. Please check backend logs for details.' });
    }
});

// @desc    Handle Paystack Webhook
// @route   POST /api/payments/webhook
// @access  Public (Paystack servers) - Requires HMAC verification
exports.handlePaystackWebhook = asyncHandler(async (req, res) => {
    console.log('[handlePaystackWebhook] Received webhook.');

    // --- Access process.env.PAYSTACK_WEBHOOK_SECRET HERE ---
    const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!PAYSTACK_WEBHOOK_SECRET) {
        console.error('[handlePaystackWebhook] FATAL ERROR: PAYSTACK_WEBHOOK_SECRET is undefined at function execution.');
        return res.status(500).send('Server configuration error: Webhook secret missing.');
    }

    const hash = crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        console.warn('Webhook: Invalid signature received! Request rejected.');
        return res.status(400).send('Invalid webhook signature');
    }
    console.log('Webhook: Signature verified successfully.');

    const event = req.body;
    const { event: eventType, data } = event;

    console.log(`Webhook Event Type: ${eventType}, Reference: ${data.reference}`);

    if (eventType === 'charge.success') {
        const reference = data.reference;
        const amountPaidKobo = data.amount; // Amount is in kobo from Paystack webhook

        let booking = null;
        let Model = null;
        let bookingType = null;

        // Try to find the booking by reference in both FlightBooking and HotelBooking models
        booking = await Booking.findOne({ paystackReference: reference });
        if (booking) {
            Model = Booking;
            bookingType = 'flight';
        } else {
            booking = await HotelBooking.findOne({ paystackReference: reference });
            if (booking) {
                Model = HotelBooking;
                bookingType = 'hotel';
            }
        }

        if (booking && Model) {
            console.log(`Webhook: Found ${bookingType} booking: ${booking._id}`);
            // Use a transaction for critical updates triggered by webhook
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                const updatedBooking = await updateBookingStatusAndPayment(Model, booking._id, reference, amountPaidKobo, 'completed', session);

                // Create or update a Payment record via webhook
                let paymentRecord = await Payment.findOne({ paystackReference: reference }).session(session);
                if (paymentRecord) {
                    paymentRecord.status = 'succeeded';
                    paymentRecord.amount = amountPaidKobo / 100; // Update amount in case of discrepancy
                    paymentRecord.currency = data.currency;
                    paymentRecord.paymentMethod = data.channel;
                    paymentRecord.paidAt = new Date(data.paid_at);
                    await paymentRecord.save({ session });
                    console.log(`Webhook: Updated existing payment record for reference: ${reference}`);
                } else {
                    await Payment.create([{
                        user: booking.user, // Use user from the booking
                        amount: amountPaidKobo / 100, // Convert kobo to actual currency units
                        currency: data.currency,
                        paystackReference: reference,
                        status: 'succeeded',
                        paymentMethod: data.channel,
                        paidAt: new Date(data.paid_at),
                        type: bookingType,
                        relatedBooking: booking._id
                    }], { session });
                    console.log(`Webhook: Created new payment record for reference: ${reference}`);
                }

                await session.commitTransaction();
                console.log(`Webhook: Transaction committed for reference: ${reference}`);

            } catch (error) {
                await session.abortTransaction();
                console.error(`Webhook: Transaction aborted for reference: ${reference}. Error:`, error);
                // Optionally log to a separate error log or alert system
            } finally {
                session.endSession();
            }

        } else {
            console.warn(`Webhook: No booking found for Paystack reference ${reference}. This might indicate a missing record or incorrect reference.`);
            // If a payment succeeds but no booking is found, you might want to log this
            // for manual review or save a 'standalone' payment record.
            try {
                // Check if payment record already exists from frontend verify call (less likely but possible)
                let paymentRecord = await Payment.findOne({ paystackReference: reference });
                if (paymentRecord) {
                    paymentRecord.status = 'succeeded';
                    paymentRecord.amount = amountPaidKobo / 100;
                    paymentRecord.currency = data.currency;
                    paymentRecord.paymentMethod = data.channel;
                    paymentRecord.paidAt = new Date(data.paid_at);
                    await paymentRecord.save();
                    console.log(`Webhook: Updated existing standalone payment record for reference: ${reference}`);
                } else {
                    // Create a new Payment record even if booking not found
                    await Payment.create({
                        // user: null, // User is unknown here from webhook, can be resolved from metadata if passed
                        amount: amountPaidKobo / 100,
                        currency: data.currency,
                        paystackReference: reference,
                        status: 'succeeded',
                        paymentMethod: data.channel,
                        paidAt: new Date(data.paid_at),
                        // type: 'unknown', // Could derive from metadata or leave as null
                        // relatedBooking: null
                    });
                    console.log(`Webhook: Created standalone payment record for reference: ${reference} (no linked booking found)`);
                }
            } catch (err) {
                console.error(`Webhook: Error saving standalone payment record for ref ${reference}:`, err);
            }
        }
    } else {
        console.log(`Webhook: Received event type ${eventType}, not 'charge.success'. No action taken for status update.`);
    }

    res.status(200).send('Webhook Received');
});