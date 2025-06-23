const express = require('express');
const {
    registerUser,
    loginUser,
    getMe,
    forgotPassword,
    resetPassword,
    // NEW: Admin functions
    getUsers,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming 'admin' is your role-checking middleware

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);


// Private routes
router.get('/me', protect, getMe);

// NEW: Admin routes
// These routes will first go through 'protect' to ensure a token is provided,
// then 'admin' to ensure the user has the 'admin' role.
router.route('/').get(protect, admin, getUsers); // GET /api/users (get all users)
router.route('/:id')
    .put(protect, admin, updateUser) // PUT /api/users/:id (update a specific user)
    .delete(protect, admin, deleteUser); // DELETE /api/users/:id (delete a specific user)


module.exports = router;