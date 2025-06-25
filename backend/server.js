const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const hotelRoutes = require('./routes/hotelRoutes'); // Assuming this is your hotel routes file
const hotelBookingRoutes = require('./routes/hotelBookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // NEW: Import payment routes
const locationRoutes = require('./routes/locationRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // To parse URL-encoded data if needed

// Enable CORS for all routes (important for frontend communication)
app.use(cors());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// routes
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes); // Make sure this matches your hotel routes file name
app.use('/api/hotel-bookings', hotelBookingRoutes);
app.use('/api/payments', paymentRoutes); // NEW: Use payment routes
app.use('/api/locations', locationRoutes); 

// Error handling middleware (if you have one, place it after all routes)
// Example: app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});