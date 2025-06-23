// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // Reference to the outbound flight (always required for any booking).
    outboundFlight: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Flight',
    },
    // Reference to the return flight (optional, only for round-trip bookings)
    returnFlight: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Not required for one-way bookings
        ref: 'Flight',
    },
    bookingType: {
        type: String,
        enum: ['one-way', 'round-trip'], // Define allowed types
        required: true,
        default: 'one-way', // Default to one-way for simplicity in case it's not provided
    },
    passengers: [ // Array of passenger details
        {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
            dateOfBirth: { type: Date, required: true },
            nationality: { type: String, required: true },
            passportNumber: { type: String, unique: true, sparse: true }, // Sparse allows nulls but enforces uniqueness for non-nulls
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;