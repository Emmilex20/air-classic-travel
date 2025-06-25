// backend/routes/paymentRoutes.js
const express = require('express');
const {
    verifyPaystackPayment,
    handlePaystackWebhook,
    getAllPaymentsAdmin // <-- NEW: Import the admin function
} = require('../controllers/paymentController');
// CORRECTED: Import 'authorize' instead of 'admin'
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for frontend to verify payment after Paystack completes
router.post('/verify', protect, verifyPaystackPayment);

// Route for Paystack webhooks (no 'protect' middleware needed here, Paystack authenticates via HMAC)
router.post('/webhook', handlePaystackWebhook);

// NEW: Route for admin to get all payments
// This will be hit by the frontend's AllPayments.jsx at /api/payments/admin
router.get('/admin', protect, authorize(['admin']), getAllPaymentsAdmin); // Corrected to use authorize(['admin'])

module.exports = router;
