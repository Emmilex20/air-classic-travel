// backend/models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    // User who added or manages this flight (e.g., airline_staff or admin)
    // Making it optional if flights are primarily ingested from an external API
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Set to false if flights are primarily API-driven
    },
    
    // Core Flight Identifiers
    flightNumber: {
        type: String,
        required: [true, 'Flight number is required'],
        trim: true,
        // Removed `unique: true` for flightNumber as they can be reused across dates/routes
        // Consider a compound unique index if needed, e.g., { flightNumber, departureDate }
    },
    airline: {
        type: String,
        required: [true, 'Airline name is required'],
        trim: true,
    },
    airlineCode: { // NEW: Airline IATA code (e.g., BA for British Airways, AA for American Airlines)
        type: String,
        required: [true, 'Airline IATA code is required'],
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 3, // IATA is 2, ICAO is 3
    },
    externalApiId: { // NEW: Unique ID from the external flight API (important for updates/tracking)
        type: String,
        unique: true, // Ensures no duplicate external flight entries
        sparse: true, // Allows null values for flights not from external APIs
        trim: true,
    },

    // Airport Information (IATA codes)
    departureAirport: { // IATA code, e.g., LOS
        type: String,
        required: [true, 'Departure airport is required'],
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3, // IATA codes are 3 letters
    },
    arrivalAirport: { // IATA code, e.g., JFK
        type: String,
        required: [true, 'Arrival airport is required'],
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3, // IATA codes are 3 letters
    },

    // Time Information
    departureTime: {
        type: Date,
        required: [true, 'Departure time is required'],
    },
    arrivalTime: {
        type: Date,
        required: [true, 'Arrival time is required'],
    },
    estimatedDepartureTime: { type: Date }, // NEW
    actualDepartureTime: { type: Date },     // NEW
    estimatedArrivalTime: { type: Date },   // NEW
    actualArrivalTime: { type: Date },      // NEW
    durationMinutes: { // NEW: Flight duration (e.g., in minutes)
        type: Number,
        min: [0, 'Duration cannot be negative'],
        required: [true, 'Duration is required'], // Make this required as it's fundamental
    },

    // Flight Details
    capacity: {
        type: Number,
        required: [true, 'Flight capacity is required'],
        min: [0, 'Capacity cannot be negative'],
    },
    availableSeats: {
        type: Number,
        required: [true, 'Available seats is required'],
        min: [0, 'Available seats cannot be negative'],
        default: 0, // Should be explicitly set or derived from capacity
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    currency: { // New: Add currency for the price
        type: String,
        default: 'NGN',
        trim: true,
    },
    class: { // <--- ADDED: Flight class (e.g., ECONOMY, BUSINESS)
        type: String,
        enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
        default: 'ECONOMY',
        required: [true, 'Flight class is required'], // Typically, flights have a default class
    },

    // Operational Details from API / Segments for multi-leg flights
    segments: [ // <--- ADDED: Array of segments for multi-leg flights
        {
            flightNumber: String,
            airline: String,
            airlineCode: String,
            departureAirport: String,
            departureAirportCode: String,
            departureTime: Date,
            arrivalAirport: String,
            arrivalAirportCode: String,
            arrivalTime: Date,
            durationMinutes: Number,
            aircraftType: String,
            departureTerminal: String,
            arrivalTerminal: String,
            numberOfStops: { type: Number, default: 0 },
            // Add other segment-specific details if needed, e.g., layover info
        }
    ],
    status: { // e.g., 'On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived'
        type: String,
        enum: ['Scheduled', 'Active', 'Delayed', 'Cancelled', 'Diverted', 'Landed', 'Arrived', 'Unknown'],
        default: 'Scheduled',
    },
    departureGate: { type: String, trim: true },
    departureTerminal: { type: String, trim: true },
    arrivalGate: { type: String, trim: true },
    arrivalTerminal: { type: String, trim: true },

}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Pre-save hook to initialize availableSeats for new flights if not explicitly set
// This hook ensures that when a new flight is created (e.g., from admin panel)
// its availableSeats default to its capacity.
// For API-ingested flights, `availableSeats` should ideally come from the API payload.
flightSchema.pre('save', function(next) {
    // Only apply if it's a new document and availableSeats is either not set or 0
    // This allows API to provide `availableSeats` directly if it has accurate info.
    if (this.isNew && (this.availableSeats === 0 || this.availableSeats === undefined || this.availableSeats === null)) {
        this.availableSeats = this.capacity;
    }
    next();
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
