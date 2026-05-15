const jwt = require('jsonwebtoken');
const pool = require('../config/db');

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
            const [users] = await pool.execute('SELECT id, name, email, created_at FROM Users WHERE id = ?', [decoded.id]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Assign user to request object
            req.user = users[0];
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
