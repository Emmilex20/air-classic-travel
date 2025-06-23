// backend/routes/paymentRoutes.js
const express = require('express');
const {
    verifyPaystackPayment,
    handlePaystackWebhook,
    getAllPaymentsAdmin // <-- NEW: Import the admin function
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware'); // Your auth middleware, ensure 'admin' is available

const router = express.Router();

// Route for frontend to verify payment after Paystack completes
router.post('/verify', protect, verifyPaystackPayment);

// Route for Paystack webhooks (no 'protect' middleware needed here, Paystack authenticates via HMAC)
router.post('/webhook', handlePaystackWebhook);

// NEW: Route for admin to get all payments
// This will be hit by the frontend's AllPayments.jsx at /api/payments/admin
router.get('/admin', protect, admin, getAllPaymentsAdmin); // <-- NEW ROUTE ADDED

module.exports = router; 