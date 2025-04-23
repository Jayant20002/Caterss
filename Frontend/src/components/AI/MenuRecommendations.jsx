import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import Cards from '../Cards';

const MenuRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access-token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/menu/recommendations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecommendations(response.data.recommendations);
      setError(null);
    } catch (error) {
      setError('Failed to load recommendations');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-2 bg-green text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Please login to see personalized recommendations</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Recommended for You
        </h2>
        <p className="mt-2 text-gray-600">
          Based on your preferences and order history
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No recommendations available yet.</p>
          <p className="mt-2">Try ordering some items to get personalized recommendations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item) => (
            <Cards key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuRecommendations; 