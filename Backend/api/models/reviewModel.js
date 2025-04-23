const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['BoxGenie', 'CorporateGenie', 'FamilyFiesta']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sentiment: {
    score: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true
    },
    confidence: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent multiple reviews from same user for same order
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 