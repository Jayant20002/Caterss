import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { useContext } from 'react';

const Receipt = ({ paymentData }) => {
  const receiptRef = useRef();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Format date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate a random receipt number
  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${timestamp}${random}`;
  };

  // Handle printing the receipt
  const handlePrint = () => {
    window.print();
  };

  // Handle downloading the receipt as PDF
  const handleDownload = () => {
    // This is a simple implementation that opens the print dialog
    // For a more advanced solution, you could use a library like html2pdf.js
    window.print();
  };

  // Handle returning to the order page
  const handleReturnToOrders = () => {
    navigate('/order');
  };

  // Generate receipt number on component mount
  useEffect(() => {
    if (receiptRef.current) {
      // Add any additional setup if needed
    }
  }, []);

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Receipt Not Found</h2>
          <p className="mb-4">No payment data available to generate a receipt.</p>
          <button 
            onClick={handleReturnToOrders}
            className="btn btn-primary"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  const receiptNumber = generateReceiptNumber();
  const formattedDate = formatDate(paymentData.createdAt || new Date());

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8" ref={receiptRef}>
        {/* Receipt Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">CATER HOUSE</h1>
          <p className="text-gray-600">Your Trusted Catering Partner</p>
          <div className="border-t border-b border-gray-300 my-4 py-2">
            <p className="font-semibold">PAYMENT RECEIPT</p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Receipt Number:</p>
            <p className="font-semibold">{receiptNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">{formattedDate}</p>
          </div>
          <div>
            <p className="text-gray-600">Transaction ID:</p>
            <p className="font-semibold">{paymentData.transitionId}</p>
          </div>
          <div>
            <p className="text-gray-600">Status:</p>
            <p className="font-semibold text-green-600">{paymentData.status}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-semibold">{paymentData.customerInfo?.name || user?.displayName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold">{paymentData.email || user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone:</p>
              <p className="font-semibold">{paymentData.customerInfo?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Address:</p>
              <p className="font-semibold">{paymentData.customerInfo?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Order Details</h3>
          <div className="border-t border-gray-300 pt-2">
            {paymentData.packageName ? (
              <div className="mb-4">
                <p className="font-semibold">Package: {paymentData.packageName}</p>
                <p className="text-gray-600">Quantity: {paymentData.quantity}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-2">Items:</p>
                <ul className="list-disc pl-5">
                  {paymentData.itemsName?.map((item, index) => (
                    <li key={index} className="mb-1">{item}</li>
                  ))}
                </ul>
                <p className="text-gray-600 mt-2">Total Items: {paymentData.quantity}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border-t border-gray-300 pt-4 mb-8">
          <div className="flex justify-between mb-2">
            <p className="font-semibold">Subtotal:</p>
            <p>₹{paymentData.price}</p>
          </div>
          <div className="flex justify-between mb-2">
            <p className="font-semibold">Tax (5%):</p>
            <p>₹{(paymentData.price * 0.05).toFixed(2)}</p>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
            <p>Total:</p>
            <p>₹{(paymentData.price * 1.05).toFixed(2)}</p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mb-8">
          <p className="text-gray-600">Thank you for choosing CATER HOUSE!</p>
          <p className="text-gray-600">We appreciate your business.</p>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex justify-center gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="btn btn-primary"
          >
            Print Receipt
          </button>
          <button 
            onClick={handleDownload}
            className="btn btn-secondary"
          >
            Download PDF
          </button>
          <button 
            onClick={handleReturnToOrders}
            className="btn btn-outline"
          >
            Return to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt; 