// middlewares 
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Unauthorized access',
                error: 'No token provided'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Unauthorized access',
                error: 'Invalid token format'
            });
        }
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        message: 'Unauthorized access',
                        error: 'Token has expired'
                    });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({ 
                        message: 'Unauthorized access',
                        error: 'Invalid token'
                    });
                }
                return res.status(401).json({ 
                    message: 'Unauthorized access',
                    error: err.message
                });
            }
            
            if (!decoded.id || !decoded.email) {
                return res.status(401).json({ 
                    message: 'Unauthorized access',
                    error: 'Invalid token payload'
                });
            }
            
            req.userId = decoded.id;
            req.userEmail = decoded.email;
            req.userRole = decoded.role;
            req.decoded = decoded; // For backward compatibility
            
            next();
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error verifying token'
        });
    }
};

module.exports = verifyToken;