// backend/controllers/flightController.js
const Flight = require('../models/Flight');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all flights (with optional filtering and round-trip search)
// @route   GET /api/flights
// @access  Public
exports.getFlights = async (req, res) => {
    const { departureAirport, arrivalAirport, departureDate, tripType, returnDate } = req.query;

    try {
        if (tripType === 'round-trip' && departureDate && returnDate) {
            // --- Round-Trip Search Logic ---

            // 1. Validate inputs for round trip
            if (!departureAirport || !arrivalAirport || !departureDate || !returnDate) {
                return res.status(400).json({ message: 'Please provide all details for round-trip search (origin, destination, departure date, return date).' });
            }

            const depTimeStart = new Date(departureDate);
            depTimeStart.setUTCHours(0, 0, 0, 0);
            const depTimeEnd = new Date(depTimeStart);
            depTimeEnd.setUTCDate(depTimeStart.getUTCDate() + 1);

            const retTimeStart = new Date(returnDate);
            retTimeStart.setUTCHours(0, 0, 0, 0);
            const retTimeEnd = new Date(retTimeStart);
            retTimeEnd.setUTCDate(retTimeStart.getUTCDate() + 1);

            if (depTimeStart >= retTimeStart) {
                return res.status(400).json({ message: 'Return date must be after departure date.' });
            }

            // 2. Find outbound flights
            const outboundFlights = await Flight.find({
                departureAirport: new RegExp(departureAirport, 'i'),
                arrivalAirport: new RegExp(arrivalAirport, 'i'),
                departureTime: { $gte: depTimeStart, $lt: depTimeEnd },
                availableSeats: { $gt: 0 } // Ensure seats are available
            }).sort({ price: 1, departureTime: 1 });

            // 3. Find return flights (reverse airports)
            const returnFlights = await Flight.find({
                departureAirport: new RegExp(arrivalAirport, 'i'), // Arrival becomes departure for return
                arrivalAirport: new RegExp(departureAirport, 'i'), // Departure becomes arrival for return
                departureTime: { $gte: retTimeStart, $lt: retTimeEnd },
                availableSeats: { $gt: 0 } // Ensure seats are available
            }).sort({ price: 1, departureTime: 1 });

            // 4. Combine outbound and return flights into combinations
            const roundTripCombinations = [];
            for (const outboundFlight of outboundFlights) {
                for (const returnFlight of returnFlights) {
                    // Optional: Add logic to ensure return flight time makes sense (e.g., no immediate return if dep+arr time is long)
                    // For now, just combine based on dates and airports
                    const totalPrice = outboundFlight.price + returnFlight.price;
                    roundTripCombinations.push({
                        outboundFlight,
                        returnFlight,
                        totalPrice
                    });
                }
            }

            return res.status(200).json(roundTripCombinations);

        } else {
            // --- One-Way Search Logic (Existing Logic) ---
            const query = {};

            if (departureAirport) {
                query.departureAirport = new RegExp(departureAirport, 'i');
            }
            if (arrivalAirport) {
                query.arrivalAirport = new RegExp(arrivalAirport, 'i');
            }
            if (departureDate) {
                const searchDate = new Date(departureDate);
                searchDate.setUTCHours(0, 0, 0, 0);
                const nextDay = new Date(searchDate);
                nextDay.setUTCDate(searchDate.getUTCDate() + 1);
                query.departureTime = { $gte: searchDate, $lt: nextDay };
            }
            query.availableSeats = { $gt: 0 }; // Only show flights with available seats

            const flights = await Flight.find(query).sort({ departureTime: 1 });
            return res.status(200).json(flights);
        }
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ message: 'Server error fetching flights.', error: error.message });
    }
};

// --- (Rest of the flightController.js file remains the same) ---
// @desc    Get single flight by ID
// @route   GET /api/flights/:id
// @access  Public
exports.getFlightById = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Flight ID format.' });
    }
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found.' });
        }
        res.status(200).json(flight);
    } catch (error) {
        console.error('Error fetching flight by ID:', error);
        res.status(500).json({ message: 'Server error fetching flight.' });
    }
};

// @desc    Add a new flight
// @route   POST /api/flights
// @access  Private (Admin, Airline Staff)
exports.createFlight = async (req, res) => {
    // Correctly destructure 'capacity' from req.body
    const {
        airline, flightNumber, departureAirport, arrivalAirport,
        departureTime, arrivalTime, price, capacity // <-- CHANGED: Now expecting 'capacity'
    } = req.body;

    // Check if req.user exists (set by protect middleware)
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user data missing from request.' });
    }

    // Validate all required fields, including capacity
    if (!airline || !flightNumber || !departureAirport || !arrivalAirport ||
        !departureTime || !arrivalTime || price == null || capacity == null) { // <-- CHANGED: Check 'capacity'
        return res.status(400).json({ message: 'Please enter all flight fields.' });
    }

    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);

    if (isNaN(depTime.getTime()) || isNaN(arrTime.getTime())) {
        return res.status(400).json({ message: 'Invalid departure or arrival time format.' });
    }

    if (depTime >= arrTime) {
        return res.status(400).json({ message: 'Arrival time must be after departure time.' });
    }
    
    // Ensure price and capacity are positive
    if (price <= 0 || capacity <= 0) { // <-- CHANGED: Check 'capacity'
        return res.status(400).json({ message: 'Price must be positive and capacity must be positive.' });
    }

    try {
        const existingFlight = await Flight.findOne({ flightNumber });
        if (existingFlight) {
            return res.status(400).json({ message: 'Flight with this number already exists.' });
        }

        const newFlight = await Flight.create({
            user: req.user.id, // <-- ADDED: Associate the flight with the user who created it
            airline,
            flightNumber,
            departureAirport,
            arrivalAirport,
            departureTime: depTime,
            arrivalTime: arrTime,
            price,
            capacity, // <-- CHANGED: Pass 'capacity' to the model
            // availableSeats will be set by the pre-save hook based on capacity
        });
        res.status(201).json(newFlight);
    } catch (error) {
        console.error('Error adding flight:', error);
        // Provide more detailed error for validation issues
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Flight validation failed: ${messages.join(', ')}`, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error adding flight.', error: error.message });
    }
};

// @desc    Update a flight
// @route   PUT /api/flights/:id
// @access  Private (Admin, Airline Staff)
exports.updateFlight = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Flight ID format.' });
    }
    // Destructure all potential update fields, including capacity
    const {
        airline, flightNumber, departureAirport, arrivalAirport,
        departureTime, arrivalTime, price, capacity, availableSeats // <-- ADDED capacity here
    } = req.body;

    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found.' });
        }

        const updatedFields = { ...req.body };
        if (departureTime) updatedFields.departureTime = new Date(departureTime);
        if (arrivalTime) updatedFields.arrivalTime = new Date(arrivalTime);

        if (updatedFields.departureTime && updatedFields.arrivalTime && updatedFields.departureTime >= updatedFields.arrivalTime) {
            return res.status(400).json({ message: 'Updated arrival time must be after departure time.' });
        }
        if (updatedFields.price !== undefined && updatedFields.price < 0) { // Changed to < 0, price can be 0 (free flight)
            return res.status(400).json({ message: 'Price cannot be negative.' });
        }
        // Validate capacity and availableSeats if they are provided
        if (updatedFields.capacity !== undefined && updatedFields.capacity <= 0) { // <-- ADDED capacity validation
            return res.status(400).json({ message: 'Capacity must be positive.' });
        }
        if (updatedFields.availableSeats !== undefined && updatedFields.availableSeats < 0) {
            return res.status(400).json({ message: 'Available seats cannot be negative.' });
        }
        // Ensure availableSeats doesn't exceed new capacity if capacity is also being updated
        if (updatedFields.capacity !== undefined && updatedFields.availableSeats !== undefined && updatedFields.availableSeats > updatedFields.capacity) {
            return res.status(400).json({ message: 'Available seats cannot exceed total capacity.' });
        }
        // If capacity is updated, and availableSeats is not explicitly provided or is greater than new capacity,
        // you might want to adjust availableSeats here. The pre-save hook handles new flights.
        // For updates, it's often better to explicitly handle it if availableSeats is not also sent.
        if (updatedFields.capacity !== undefined && updatedFields.availableSeats === undefined) {
             // If capacity is changed, and availableSeats is not provided in the update,
             // we should ensure availableSeats doesn't exceed the new capacity.
             // Simplest approach: if new capacity is less than current available seats,
             // set available seats to new capacity.
            if (updatedFields.capacity < flight.availableSeats) {
                updatedFields.availableSeats = updatedFields.capacity;
            }
        }


        if (flightNumber && flightNumber !== flight.flightNumber) {
            const existingFlight = await Flight.findOne({ flightNumber });
            if (existingFlight && existingFlight._id.toString() !== req.params.id) {
                return res.status(400).json({ message: 'Flight with this new number already exists.' });
            }
        }
        
        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true, runValidators: true } // runValidators ensures schema validations run on update
        );

        res.status(200).json(updatedFlight);
    } catch (error) {
        console.error('Error updating flight:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Flight validation failed: ${messages.join(', ')}`, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating flight.', error: error.message });
    }
};

// @desc    Delete a flight
// @route   DELETE /api/flights/:id
// @access  Private (Admin, Airline Staff)
exports.deleteFlight = async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Flight ID format.' });
    }
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found.' });
        }
        
        await Flight.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Flight deleted successfully.' });
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ message: 'Server error deleting flight.' });
    }
};