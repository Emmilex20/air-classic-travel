// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

// Middleware to protect routes (authenticate user via token)
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request object (without password)
            req.user = await User.findById(decoded.id).select('-password');
            
            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to authorize users based on roles
// Takes an array of allowed roles (e.g., ['admin', 'airline_staff'])
const authorize = (roles = []) => {
    // roles can be a single role string or an array of role strings
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // If no roles are specified, allow access to any authenticated user
        if (roles.length === 0) {
            return next();
        }

        // Check if user is authenticated (protect middleware should run before this)
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found after token verification.' });
        }

        // Check if user's roles include any of the allowed roles
        const hasPermission = roles.some(role => req.user.roles.includes(role));

        if (hasPermission) {
            next(); // User has permission, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have permission to access this route.' });
        }
    };
};

module.exports = {
    protect,
    authorize
};
