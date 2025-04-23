const express = require('express');
const router = express.Router();
const { createReview, getServiceReviews, getUserReviews } = require('../controllers/reviewController');
const verifyToken = require('../middlewares/verifyToken');

// Create a new review (protected route)
router.post('/', verifyToken, createReview);

// Get reviews for a specific service (public route)
router.get('/service/:serviceType', getServiceReviews);

// Get user's reviews (protected route)
router.get('/user', verifyToken, getUserReviews);

module.exports = router; 