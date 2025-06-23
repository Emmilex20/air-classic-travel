const mongoose = require('mongoose');

const hotelBookingSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // Reference to the User who made the booking
        },
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Hotel', // Reference to the booked Hotel
        },
        numberOfRooms: {
            type: Number,
            required: [true, 'Please specify the number of rooms.'],
            min: [1, 'At least one room must be booked.'],
        },
        checkInDate: {
            type: Date,
            required: [true, 'Please provide a check-in date.'],
        },
        checkOutDate: {
            type: Date,
            required: [true, 'Please provide a check-out date.'],
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required.'],
            min: [0, 'Total price cannot be negative.'],
        },
        bookingStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'], // Added 'completed' for hotel stay completion
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
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);