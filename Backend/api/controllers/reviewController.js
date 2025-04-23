const Review = require('../models/reviewModel');
const { analyzeReviewSentiment } = require('../services/aiService');
const mongoose = require('mongoose');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { rating, review, serviceType, orderId } = req.body;
    const userId = req.userId; // From auth middleware
    const userEmail = req.userEmail; // From auth middleware

    // Convert orderId to ObjectId
    let orderObjectId;
    try {
      orderObjectId = new mongoose.Types.ObjectId(orderId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Perform sentiment analysis
    const sentiment = analyzeReviewSentiment(review);

    const newReview = new Review({
      userId: new mongoose.Types.ObjectId(userId),
      userName: userEmail,
      rating: parseInt(rating),
      review,
      serviceType,
      orderId: orderObjectId,
      sentiment: {
        score: sentiment.score,
        label: sentiment.label,
        confidence: sentiment.confidence
      }
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get reviews for a specific service
exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const reviews = await Review.find({ serviceType })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate average rating and sentiment
    const stats = await Review.aggregate([
      { $match: { serviceType } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' },
          avgSentiment: { $avg: '$sentiment.score' },
          totalReviews: { $sum: 1 },
          positiveReviews: {
            $sum: { $cond: [{ $eq: ['$sentiment.label', 'positive'] }, 1, 0] }
          },
          negativeReviews: {
            $sum: { $cond: [{ $eq: ['$sentiment.label', 'negative'] }, 1, 0] }
          }
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      reviews,
      stats: stats[0] || {
        avgRating: 0,
        avgSentiment: 0,
        totalReviews: 0,
        positiveReviews: 0,
        negativeReviews: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: error.message
    });
  }
}; 