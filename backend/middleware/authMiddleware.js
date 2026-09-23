const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes by ensuring correct JWT is provided
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the database
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Assign user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('[AuthMiddleware] Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
