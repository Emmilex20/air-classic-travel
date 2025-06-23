// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // NEW: For generating password reset tokens

const addressSchema = new mongoose.Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true }, // Consistent with your provided code
    country: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // NEW: Do not return password by default in queries
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number']
    },
    address: addressSchema,
    roles: {
        type: [String],
        enum: ['user', 'admin', 'airline_staff', 'hotel_staff'],
        default: ['user']
    },
    // NEW: Fields for password reset functionality
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash if password is new or modified
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Need to explicitly select password if 'select: false' is used in schema
    return await bcrypt.compare(enteredPassword, this.password);
};

// NEW: Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to passwordResetToken field
    // It's crucial to store the HASHED token, not the plain one, for security.
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire (10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    return resetToken; 
};

const User = mongoose.model('User', userSchema);

module.exports = User;