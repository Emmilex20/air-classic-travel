// backend/controllers/paymentController.js
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const crypto = require('crypto');

const Booking = require('../models/Booking'); // For Flight Bookings
const HotelBooking = require('../models/HotelBooking'); // For Hotel Bookings

// REMOVED: const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
// REMOVED: const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET;
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
        if (booking.paymentStatus !== 'completed') {
            booking.paymentStatus = 'failed';
            booking.bookingStatus = 'pending';
            console.log(`[updateBookingStatusAndPayment] Booking ${booking._id} updated to Failed.`);
        }
    } else {
        console.log(`[updateBookingStatusAndPayment] No status change needed for booking ${booking._id}.`);
    }

    await booking.save({ session });
    console.log(`[updateBookingStatusAndPayment] Booking ${booking._id} saved successfully.`);
    return booking;
};


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
            const updatedBooking = await updateBookingStatusAndPayment(Model, bookingId, reference, data.amount, 'completed');

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
            await updateBookingStatusAndPayment(Model, bookingId, reference, data.amount, 'failed');
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
        const amountPaidKobo = data.amount;

        let booking = null;
        let Model = null;
        let bookingType = null;

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
            await updateBookingStatusAndPayment(Model, booking._id, reference, amountPaidKobo, 'completed');
        } else {
            console.warn(`Webhook: No booking found for Paystack reference ${reference}. This might indicate a missing record or incorrect reference.`);
        }
    } else {
        console.log(`Webhook: Received event type ${eventType}, not 'charge.success'. No action taken for status update.`);
    }

    res.status(200).send('Webhook Received');
});