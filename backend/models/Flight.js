// backend/models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    user: { // User who added or manages this flight (e.g., airline_staff or admin)
        type: mongoose.Schema.Types.ObjectId,
        required: true, // For now, let's make it required
        ref: 'User', // References the 'User' model
    },
    flightNumber: {
        type: String,
        required: [true, 'Flight number is required'],
        unique: true, // Flight numbers should be unique
        trim: true,
    },
    airline: {
        type: String,
        required: [true, 'Airline name is required'],
        trim: true,
    },
    departureAirport: {
        type: String,
        required: [true, 'Departure airport is required'],
        trim: true,
    },
    arrivalAirport: {
        type: String,
        required: [true, 'Arrival airport is required'],
        trim: true,
    },
    departureTime: {
        type: Date,
        required: [true, 'Departure time is required'],
    },
    arrivalTime: {
        type: Date,
        required: [true, 'Arrival time is required'],
    },
    capacity: {
        type: Number,
        required: [true, 'Flight capacity is required'],
        min: [0, 'Capacity cannot be negative'],
    },
    availableSeats: {
        type: Number,
        required: [true, 'Available seats is required'],
        min: [0, 'Available seats cannot be negative'],
        default: 0, // Will be set equal to capacity upon creation
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Before saving, ensure availableSeats equals capacity if it's a new flight
flightSchema.pre('save', function(next) {
    if (this.isNew && this.availableSeats === 0) {
        this.availableSeats = this.capacity;
    }
    next();
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;