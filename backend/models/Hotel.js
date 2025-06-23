// backend/models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a hotel name'],
            trim: true,
            unique: true, // Hotel names should ideally be unique or unique per city/location
        },
        location: { // Could be city, state, country or more detailed sub-fields
            type: String,
            required: [true, 'Please add a location'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
            trim: true,
        },
        description: {
            type: String,
            required: false, // Description can be optional
        },
        amenities: {
            type: [String], // Array of strings, e.g., ['WiFi', 'Pool', 'Gym']
            default: [],
        },
        starRating: {
            type: Number,
            required: [true, 'Please add a star rating'],
            min: [1, 'Star rating must be at least 1'],
            max: [5, 'Star rating cannot exceed 5'],
        },
        pricePerNight: {
            type: Number,
            required: [true, 'Please add a price per night'],
            min: [0, 'Price cannot be negative'],
        },
        availableRooms: {
            type: Number,
            required: [true, 'Please add available rooms'],
            min: [0, 'Available rooms cannot be negative'],
            default: 0,
        },
        images: {
            type: [String], // Array of image URLs
            default: [],
        },
        // Optionally, track which staff/admin added/last modified this hotel
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Could be optional, or required if all hotels must be added by staff
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

module.exports = mongoose.model('Hotel', hotelSchema);