import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const TodaysSpecial = () => {
  const [specialItem, setSpecialItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const DISCOUNT_PERCENTAGE = 20; // 20% discount

  useEffect(() => {
    fetchTodaysSpecial();
  }, []);

  const fetchTodaysSpecial = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
      const menuItems = response.data;
      // Randomly select one item
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      setSpecialItem(randomItem);
    } catch (error) {
      console.error('Error fetching today\'s special:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price) => {
    return Math.round(price * (1 - DISCOUNT_PERCENTAGE / 100));
  };

  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to cart',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    try {
      const token = localStorage.getItem('access-token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/carts`,
        {
          name: specialItem.name,
          recipe: specialItem.description,
          image: specialItem.image,
          price: calculateDiscountedPrice(specialItem.price), // Use discounted price
          email: user.email,
          quantity: 1,
          menuItemId: specialItem._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Added to Cart!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: 'warning',
          title: 'Already in Cart',
          text: 'This item is already in your cart'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add item to cart'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green"></div>
      </div>
    );
  }

  if (!specialItem) {
    return null;
  }

  const originalPrice = specialItem.price;
  const discountedPrice = calculateDiscountedPrice(originalPrice);
  const savings = originalPrice - discountedPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Today's Special</h2>
        <p className="mt-2 text-lg text-gray-600">Don't miss out on our special offer!</p>
        <div className="mt-2">
          <span className="inline-block bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
            {DISCOUNT_PERCENTAGE}% OFF
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:w-48"
              src={specialItem.image}
              alt={specialItem.name}
            />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{specialItem.name}</h3>
                <p className="mt-2 text-gray-600">{specialItem.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green">₹{discountedPrice}</div>
                <div className="text-sm text-gray-500 line-through">₹{originalPrice}</div>
                <div className="text-sm text-green-600 font-semibold">
                  Save ₹{savings}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-full px-4 py-2 bg-green text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
              >
                <FaShoppingCart className="mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaysSpecial; 