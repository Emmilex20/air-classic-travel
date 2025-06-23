// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // References the User model (assuming your User model is named 'User')
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'NGN', // Assuming Nigerian Naira as default currency for Paystack
        },
        paystackReference: {
            type: String,
            required: true,
            unique: true, // Paystack references should be unique
        },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'refunded'], // Common payment statuses
            default: 'pending',
            required: true,
        },
        paymentMethod: { // e.g., 'card', 'bank_transfer', 'ussd'
            type: String,
            required: false, // Not always available immediately or might be 'null'
        },
        paidAt: {
            type: Date,
            required: false, // Will be set upon successful payment/webhook
        },
        type: { // To distinguish between flight and hotel payments if needed
            type: String,
            enum: ['flight', 'hotel', 'unknown'],
            required: false,
        },
        relatedBooking: { // Optional: Link to the booking ID (either FlightBooking or HotelBooking)
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;