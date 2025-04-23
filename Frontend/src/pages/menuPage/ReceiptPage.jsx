import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Receipt from '../../components/Receipt';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { AuthContext } from '../../contexts/AuthProvider';
import { useContext } from 'react';

const ReceiptPage = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        
        // Check if we have payment data in location state
        if (location.state?.paymentData) {
          setPaymentData(location.state.paymentData);
          setLoading(false);
          return;
        }
        
        // If we have a payment ID in the URL, fetch the payment data
        const paymentId = location.state?.paymentId;
        if (paymentId) {
          const response = await axiosSecure.get(`/payments/${paymentId}`);
          if (response.data) {
            setPaymentData(response.data);
          } else {
            setError('Payment data not found');
          }
        } else {
          // If no payment ID, try to fetch the latest payment for the user
          const response = await axiosSecure.get(`/payments/latest?email=${user?.email}`);
          if (response.data) {
            setPaymentData(response.data);
          } else {
            setError('No recent payment found');
          }
        }
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPaymentData();
    } else {
      setError('Please log in to view your receipt');
      setLoading(false);
    }
  }, [location.state, axiosSecure, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
          <p className="mt-4">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate('/order')}
            className="btn btn-primary"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  return <Receipt paymentData={paymentData} />;
};

export default ReceiptPage; 