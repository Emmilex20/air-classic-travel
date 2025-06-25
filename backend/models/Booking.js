const mongoose = require('mongoose');

// Define a sub-schema for passengers
const passengerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    passportNumber: { // Optional, but unique if provided
        type: String,
        unique: true,
        sparse: true, // Allows null values but enforces uniqueness for non-nulls
        trim: true,
    },
    // Optional: passenger type (ADULT, CHILD, INFANT) if needed
    type: { type: String, enum: ['ADULT', 'CHILD', 'INFANT'], default: 'ADULT' }
});

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        outboundFlight: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Flight',
        },
        returnFlight: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Optional for one-way trips
            ref: 'Flight',
            default: null,
        },
        bookingType: { // 'one-way' or 'round-trip'
            type: String,
            enum: ['one-way', 'round-trip'],
            required: true,
            default: 'one-way',
        },
        passengers: [passengerSchema], // Embed the passenger sub-documents
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Total price cannot be negative'],
        },
        bookingStatus: { // Overall booking status
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending', // Initial status before payment/confirmation
        },
        paymentStatus: { // Status of the payment transaction
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending', // Payment status will be pending initially
        },
        paystackReference: { // Unique reference from Paystack for the transaction
            type: String,
            unique: true,
            sparse: true, // Allows null values, but unique for non-nulls
            trim: true,
        },
        // Optional: Store the original Amadeus offer ID if this booking originated from an Amadeus search
        amadeusOfferId: {
            type: String,
            sparse: true,
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
