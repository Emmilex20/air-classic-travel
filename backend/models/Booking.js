const mongoose = require('mongoose');

const passengerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    passportNumber: { type: String, unique: true, sparse: true }, // Sparse allows nulls but enforces uniqueness for non-nulls
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
            required: false,
            ref: 'Flight',
        },
        bookingType: {
            type: String,
            enum: ['one-way', 'round-trip'],
            required: true,
            default: 'one-way',
        },
        passengers: [passengerSchema], // Using the defined passengerSchema
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        bookingStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'], // Added 'completed' for flight completion
            default: 'pending', // Initial status before payment
        },
        paymentStatus: { // Updated enum values
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending', // Payment status will be pending initially
        },
        paystackReference: { // NEW: Add Paystack reference
            type: String,
            unique: true,
            sparse: true, // Allows null values, but unique for non-nulls
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;