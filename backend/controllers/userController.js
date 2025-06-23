const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // NEW: Import asyncHandler
const crypto = require('crypto'); // NEW: For password reset token hashing


// Helper function to generate JWT token (keeping your existing structure)
const generateToken = (id, roles) => {
    return jwt.sign({ id, roles }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// This is a placeholder for sending emails. In a real app, you'd use Nodemailer or similar.
const sendEmail = async (options) => {
    console.log(`\n--- SIMULATED EMAIL SENT ---`);
    console.log(`TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE:\n${options.message}`);
    console.log(`---------------------------\n`);
    // In a real app, you would integrate a mail service like Nodemailer:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'Gmail', 'SendGrid'
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptions);
    */
};


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    const { username, email, password, firstName, lastName, phone, address } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        if (userExists.email === email) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }
        if (userExists.username === username) {
            return res.status(400).json({ message: 'Username already taken.' });
        }
    }

    // Create new user (password hashing done by pre('save') middleware in User model)
    const user = new User({
        username,
        email,
        password, // Plain password here, will be hashed by pre-save hook
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        address: address || {},
        roles: ['user'] // Default role for new registrations
    });

    await user.save(); // This triggers the pre('save') middleware for hashing

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            roles: user.roles,
            token: generateToken(user._id, user.roles),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data provided.' });
    }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    // Check for user email
    // .select('+password') is crucial here because we set select: false in the model
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) { // Using the matchPassword method from the User model
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            roles: user.roles,
            token: generateToken(user._id, user.roles),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// @desc    Get user profile (for the logged-in user)
// @route   GET /api/users/me
// @access  Private (requires token)
exports.getMe = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    // req.user is set by the protect middleware
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no user found in token.' });
    }
    const user = await User.findById(req.user._id).select('-password'); // Fetch user without password
    if (user) {
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            roles: user.roles,
        });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});

// NEW: @desc    Request Password Reset Token
// @route   POST /api/users/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // Send a generic success message even if user not found, to prevent email enumeration
        return res.status(200).json({ message: 'If a user with that email exists, a password reset email has been sent.' });
    }

    // Get reset token and save it to user document
    const resetToken = user.getResetPasswordToken(); // This method is defined in User model

    await user.save({ validateBeforeSave: false }); // Save without running validation (e.g., if password field is modified but empty)

    // Create reset URL (frontend path, assuming frontend runs on current host + specific route)
    // You might need to adjust 'process.env.FRONTEND_URL' if you deploy, or use a fixed URL
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // IMPORTANT: For production, replace req.get('host') with your actual frontend domain/URL, e.g., process.env.FRONTEND_URL

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please go to the following link to reset your password: \n\n ${resetURL} \n\n If you did not request this, please ignore this email. This token is valid for 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token (Air Classic Travel)',
            message,
        });

        res.status(200).json({ success: true, message: 'Password reset link sent to email.' });

    } catch (err) {
        // Clear tokens if email sending fails to prevent invalid token lingering
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Error sending reset email:', err);
        res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
});


// NEW: @desc    Reset User Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => { // Wrapped with asyncHandler
    // Get hashed token from URL parameter
    const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    // Find user by hashed token and ensure it's not expired
    // .select('+password') is crucial here because we set select: false in the model
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Token must not be expired
    }).select('+password'); // Select password field to update it

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Set new password
    if (!req.body.password || req.body.password.length < 6) { // Basic password length check
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    user.password = req.body.password; // Pre-save hook will hash this

    // Clear reset token fields after successful reset
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save(); // Save the updated user with new password and cleared tokens

    // Log user in automatically after password reset (optional, but good UX)
    res.status(200).json({
        success: true,
        message: 'Password reset successful.',
        token: generateToken(user._id, user.roles), // Generate a new token for auto-login
        user: { // Send back basic user info
            _id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles, // Include roles for frontend context
        }
    });
});


// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    // Only return non-sensitive data
    const users = await User.find({}).select('-password -passwordResetToken -passwordResetExpires');
    res.status(200).json(users);
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
    const userToUpdate = await User.findById(req.params.id).select('+password'); // Select password if you need to hash it on update, though typically roles/email are updated here.

    if (!userToUpdate) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent an admin from changing their own roles or deleting themselves via this route directly.
    // If you need to allow an admin to change their OWN roles, you'll need more granular checks.
    if (userToUpdate._id.toString() === req.user.id.toString() && req.body.roles) {
        // Check if the admin is trying to remove their own 'admin' role or make other critical changes
        // This is a basic safeguard. A more robust system might require a super-admin or self-admin settings page.
        if (!req.body.roles.includes('admin') && userToUpdate.roles.includes('admin')) {
             res.status(403);
             throw new Error('An administrator cannot remove their own admin role via this route.');
        }
    }


    // Update fields (ensure sensitive fields like password are not updated without proper hashing)
    userToUpdate.name = req.body.name || userToUpdate.name;
    userToUpdate.email = req.body.email || userToUpdate.email;
    userToUpdate.username = req.body.username || userToUpdate.username;
    userToUpdate.firstName = req.body.firstName || userToUpdate.firstName;
    userToUpdate.lastName = req.body.lastName || userToUpdate.lastName;
    userToUpdate.phone = req.body.phone || userToUpdate.phone;
    userToUpdate.address = req.body.address || userToUpdate.address;


    // Update roles only if provided and if the requesting user has permission (handled by middleware already)
    // Ensure roles are an array of strings
    if (req.body.roles && Array.isArray(req.body.roles)) {
        userToUpdate.roles = req.body.roles;
    } else if (req.body.roles && typeof req.body.roles === 'string') {
        // If frontend sends comma-separated string (as in UserManagement.jsx form)
        userToUpdate.roles = req.body.roles.split(',').map(s => s.trim()).filter(s => s);
    }
    
    // If password is sent, ensure it's hashed. This route isn't primarily for password resets.
    // If it's a password update, it should go through a dedicated password change flow.
    // For simplicity here, we'll assume password isn't updated via this admin route.
    // If it *was* to be updated, it would need hashing:
    /*
    if (req.body.password) {
        userToUpdate.password = req.body.password; // Mongoose pre-save hook handles hashing
    }
    */

    const updatedUser = await userToUpdate.save();

    res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        roles: updatedUser.roles,
    });
});


// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent an admin from deleting their own account
    if (userToDelete._id.toString() === req.user.id.toString()) { // req.user.id comes from the protect middleware
        res.status(400);
        throw new Error('You cannot delete your own account.');
    }

    await userToDelete.deleteOne(); // Or userToDelete.remove(); depending on Mongoose version

    res.status(200).json({ message: 'User removed successfully.' });
});