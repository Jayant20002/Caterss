import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { MdSentimentVerySatisfied, MdSentimentDissatisfied, MdSentimentNeutral } from 'react-icons/md';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const ReviewSection = ({ serviceType, orderId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    avgSentiment: 0,
    totalReviews: 0,
    positiveReviews: 0,
    negativeReviews: 0
  });
  const [hover, setHover] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [serviceType]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/service/${serviceType}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to submit a review',
        icon: 'info',
        confirmButtonText: 'Login',
        showCancelButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    if (rating === 0) {
      Swal.fire('Error', 'Please select a rating', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('access-token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews`,
        {
          rating,
          review,
          serviceType,
          orderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire('Success', 'Review submitted successfully', 'success');
      setRating(0);
      setReview('');
      fetchReviews();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Error submitting review', 'error');
    }
  };

  const getSentimentIcon = (label) => {
    switch (label) {
      case 'positive':
        return <MdSentimentVerySatisfied className="h-6 w-6 text-green-500" />;
      case 'negative':
        return <MdSentimentDissatisfied className="h-6 w-6 text-red-500" />;
      default:
        return <MdSentimentNeutral className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`h-6 w-6 ${
                  index < Math.round(stats.avgRating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-lg">
            {stats.avgRating.toFixed(1)} out of 5
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{stats.totalReviews} reviews</span>
          <span>•</span>
          <span className="flex items-center">
            <MdSentimentVerySatisfied className="h-4 w-4 text-green-500 mr-1" />
            {stats.positiveReviews} positive
          </span>
          <span>•</span>
          <span className="flex items-center">
            <MdSentimentDissatisfied className="h-4 w-4 text-red-500 mr-1" />
            {stats.negativeReviews} negative
          </span>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Rating</label>
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`h-8 w-8 cursor-pointer ${
                  index < (hover || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                onClick={() => setRating(index + 1)}
                onMouseEnter={() => setHover(index + 1)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-2 border rounded-lg"
            rows="4"
            placeholder="Share your experience..."
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`h-4 w-4 ${
                        index < review.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 font-semibold">{review.userName}</span>
              </div>
              <div className="flex items-center">
                {getSentimentIcon(review.sentiment.label)}
                <span className="ml-2 text-sm text-gray-500">
                  {review.sentiment.label}
                </span>
              </div>
            </div>
            <p className="text-gray-700">{review.review}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection; 