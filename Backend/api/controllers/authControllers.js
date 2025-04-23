const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!email) return res.status(400).json({ error: 'Email is required' });
        if (!password) return res.status(400).json({ error: 'Password is required' });

        // Validate name length
        if (name.length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters long' });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create new user with trimmed name and lowercase email
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: 'user' // Default role is user
        });

        await newUser.save();

        // Generate token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info (excluding password) and token
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        res.status(201).json({
            user: userWithoutPassword,
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // If validation error, return specific validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: validationErrors.join(', ') });
        }
        
        // Generic error for production
        res.status(500).json({ error: 'An error occurred during registration' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide both email and password',
                fields: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '24h' } // Increased token expiry to 24 hours
        );

        // Return user info (without password) and token
        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            message: 'Failed to get user information',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, photoURL, phone, address } = req.body;
        
        // Validate name if provided
        if (name && name.trim().length < 2) {
            return res.status(400).json({ 
                message: 'Name must be at least 2 characters long'
            });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                name: name?.trim(), 
                photoURL: photoURL || undefined,
                phone: phone || undefined,
                address: address || undefined
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateProfile
}; 