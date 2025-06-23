// backend/controllers/hotelController.js
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ message: 'Server error fetching hotels.' });
    }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res) => {
    try {
        const hotelId = req.params.id;

        if (!isValidObjectId(hotelId)) {
            return res.status(400).json({ message: 'Invalid Hotel ID format.' });
        }

        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }
        res.status(200).json(hotel);
    } catch (error) {
        console.error('Error fetching hotel by ID:', error);
        res.status(500).json({ message: 'Server error fetching hotel.' });
    }
};

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Private (Admin/Hotel_Staff)
exports.createHotel = async (req, res) => {
    const { name, location, address, description, amenities, starRating, pricePerNight, availableRooms, images } = req.body;

    // Basic validation
    if (!name || !location || !address || !starRating || !pricePerNight || !availableRooms) {
        return res.status(400).json({ message: 'Please enter all required fields: name, location, address, starRating, pricePerNight, availableRooms.' });
    }
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
        return res.status(400).json({ message: 'Star rating must be between 1 and 5.' });
    }
    if (isNaN(pricePerNight) || pricePerNight < 0) {
        return res.status(400).json({ message: 'Price per night must be a non-negative number.' });
    }
    if (isNaN(availableRooms) || availableRooms < 0) {
        return res.status(400).json({ message: 'Available rooms must be a non-negative number.' });
    }

    try {
        const newHotel = new Hotel({
            name,
            location,
            address,
            description,
            amenities,
            starRating,
            pricePerNight,
            availableRooms,
            images,
            addedBy: req.user._id, // Assign the user who created it (from middleware)
        });

        const createdHotel = await newHotel.save();
        res.status(201).json(createdHotel);
    } catch (error) {
        console.error('Error creating hotel:', error);
        // Handle duplicate name error specifically
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(400).json({ message: 'Hotel with this name already exists in this location.' });
        }
        res.status(500).json({ message: 'Server error creating hotel.' });
    }
};

// @desc    Update a hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin/Hotel_Staff)
exports.updateHotel = async (req, res) => {
    const { name, location, address, description, amenities, starRating, pricePerNight, availableRooms, images } = req.body;
    const hotelId = req.params.id;

    if (!isValidObjectId(hotelId)) {
        return res.status(400).json({ message: 'Invalid Hotel ID format.' });
    }

    // Basic validation for updates (only if provided)
    if (starRating !== undefined && (isNaN(starRating) || starRating < 1 || starRating > 5)) {
        return res.status(400).json({ message: 'Star rating must be between 1 and 5.' });
    }
    if (pricePerNight !== undefined && (isNaN(pricePerNight) || pricePerNight < 0)) {
        return res.status(400).json({ message: 'Price per night must be a non-negative number.' });
    }
    if (availableRooms !== undefined && (isNaN(availableRooms) || availableRooms < 0)) {
        return res.status(400).json({ message: 'Available rooms must be a non-negative number.' });
    }


    try {
        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }

        // Only update fields that are provided in the request body
        hotel.name = name || hotel.name;
        hotel.location = location || hotel.location;
        hotel.address = address || hotel.address;
        hotel.description = description !== undefined ? description : hotel.description; // Allow explicit null/empty string
        hotel.amenities = amenities || hotel.amenities;
        hotel.starRating = starRating !== undefined ? starRating : hotel.starRating;
        hotel.pricePerNight = pricePerNight !== undefined ? pricePerNight : hotel.pricePerNight;
        hotel.availableRooms = availableRooms !== undefined ? availableRooms : hotel.availableRooms;
        hotel.images = images || hotel.images;

        const updatedHotel = await hotel.save();
        res.status(200).json(updatedHotel);
    } catch (error) {
        console.error('Error updating hotel:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(400).json({ message: 'Hotel with this name already exists in this location.' });
        }
        res.status(500).json({ message: 'Server error updating hotel.' });
    }
};

// @desc    Delete a hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin/Hotel_Staff)
exports.deleteHotel = async (req, res) => {
    try {
        const hotelId = req.params.id;

        if (!isValidObjectId(hotelId)) {
            return res.status(400).json({ message: 'Invalid Hotel ID format.' });
        }

        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }

        await Hotel.deleteOne({ _id: hotelId });
        res.status(200).json({ message: 'Hotel deleted successfully.' });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        res.status(500).json({ message: 'Server error deleting hotel.' });
    }
};