// backend/routes/paymentRoutes.js
const express = require('express');
const { verifyPaystackPayment, handlePaystackWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Your auth middleware

const router = express.Router();

// Route for frontend to verify payment after Paystack completes
router.post('/verify', protect, verifyPaystackPayment);

// Route for Paystack webhooks (no 'protect' middleware needed here, Paystack authenticates via HMAC)
router.post('/webhook', handlePaystackWebhook);

module.exports = router;