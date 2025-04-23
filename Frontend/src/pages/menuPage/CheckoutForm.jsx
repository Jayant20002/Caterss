import React, { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCreditCard, FaMoneyBillAlt } from "react-icons/fa";

const CheckoutForm = ({ price, cart, packageInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Add state for payment method selection
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  
  // Add state for customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.displayName || '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: ''
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to go back to the previous page
  const handleGoBack = () => {
    // If we have a previous page in the packageInfo, navigate to it
    if (packageInfo?.previousPage) {
      navigate(-1);
    } else {
      // Otherwise, just go back in history
      navigate(-1);
    }
  };

  // Function to create a new payment intent
  const createPaymentIntent = async () => {
    if (typeof price !== 'number' || price < 1) {
      console.error('Invalid price value. Must be a number greater than or equal to 1.');
      return;
    }

    try {
      const response = await axiosSecure.post('/create-payment-intent', { 
        price,
        ...customerInfo // Send customer info to backend
      });
      
      setClientSecret(response.data.clientSecret);
      return response.data.clientSecret;
    } catch (error) {
      console.error("Error fetching client secret:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to initialize payment. Please try again.'
      });
      return null;
    }
  };

  useEffect(() => {
    if (paymentMethod === 'online') {
      createPaymentIntent();
    }
  }, [price, axiosSecure, customerInfo, paymentMethod]);

  const validateCustomerInfo = () => {
    // Required fields for both payment methods
    if (!customerInfo.name || !customerInfo.address || !customerInfo.city || 
        !customerInfo.state || !customerInfo.postal_code) {
      setCardError("Please fill in all required shipping information fields");
      return false;
    }
    
    // Phone is required for COD
    if (paymentMethod === 'cod' && !customerInfo.phone) {
      setCardError("Phone number is required for Cash on Delivery");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous errors
    setCardError('');
    
    // Validate customer information
    if (!validateCustomerInfo()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      if (paymentMethod === 'online') {
        // Online payment process
        if (!stripe || !elements) {
          setProcessing(false);
          return;
        }
        
        const card = elements.getElement(CardElement);
        if (card == null) {
          setProcessing(false);
          return;
        }
        
        // Create billing details object with proper formatting
        const billingDetails = {
          name: customerInfo.name || user?.displayName || 'anonymous',
          email: user?.email || 'unknown',
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.postal_code,
            country: 'IN'
          }
        };

        // Process online payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: billingDetails
          },
        });

        if (error) {
          console.error("Stripe error:", error);
          setCardError(error.message);
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === "succeeded") {
          await processSuccessfulPayment(paymentIntent);
        }
      } else {
        // COD (Cash on Delivery) process
        await processCashOnDeliveryOrder();
      }
    } catch (error) {
      console.error("Payment error:", error);
      setCardError(error.message || "An error occurred during payment processing.");
    } finally {
      setProcessing(false);
    }
  };
  
  // Process COD order
  const processCashOnDeliveryOrder = async () => {
    try {
      console.log("Processing COD order");
      
      // Create a payment record with COD status
      const paymentInfo = {
        email: user.email,
        transitionId: `COD-${Date.now()}`, // Generate a unique ID for COD
        price,
        quantity: packageInfo ? 1 : (cart ? cart.length : 1),
        status: "order pending",
        paymentMethod: "cod",
        customerInfo,
        // Handle package vs cart differently
        ...(packageInfo ? {
          itemsName: [packageInfo.packageName],
          packageName: packageInfo.packageName,
          orderType: isBuffetOrder(packageInfo) ? "buffet" : "regular",
          cateringType: packageInfo.cateringType || null,
          eventType: packageInfo.eventType || null,
          numberOfGuests: packageInfo.numberOfGuests || null,
          eventDate: packageInfo.date || null,
          eventTime: packageInfo.time || null,
          selected: packageInfo.selected || []
        } : {
          itemsName: getCartItemNames(),
          cartItems: getValidCartIds(),
          menuItems: getValidMenuItemIds(),
          orderType: "regular"
        })
      };
      
      console.log("COD payment info:", paymentInfo);
      const response = await axiosSecure.post('/payments', paymentInfo);
      console.log("COD payment response full structure:", JSON.stringify(response.data, null, 2));
      
      // Extract the payment ID correctly
      let paymentId = null;
      if (response.data && response.data.paymentResult && response.data.paymentResult._id) {
        paymentId = response.data.paymentResult._id;
      } else if (response.data && response.data._id) {
        paymentId = response.data._id;
      }
      
      console.log("Extracted payment ID:", paymentId);
      
      // Create buffet record if needed
      if (packageInfo && isBuffetOrder(packageInfo) && paymentId) {
        try {
          const buffetResult = await createBuffetRecord(paymentId);
          console.log("Buffet record creation result:", buffetResult);
        } catch (error) {
          console.error('Error creating buffet record:', error);
        }
      } else if (packageInfo && isBuffetOrder(packageInfo)) {
        console.error("Could not create buffet record: Missing payment ID");
      }
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        text: 'Your cash on delivery order has been placed successfully!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to receipt page
          navigate('/receipt', { 
            state: { 
              paymentData: response.data,
              paymentId: paymentId,
              isCOD: true
            } 
          });
        }
      });
    } catch (error) {
      console.error("Error processing COD order:", error);
      throw error;
    }
  };
  
  // Helper functions to avoid code duplication
  const isBuffetOrder = (pkgInfo) => {
    return pkgInfo && pkgInfo.cateringType && 
      (pkgInfo.cateringType.includes('Catering') || 
       pkgInfo.eventType || 
       pkgInfo.numberOfGuests || 
       pkgInfo.date || 
       pkgInfo.time);
  };
  
  const getValidCartItems = () => {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return [];
    }
    return cart.filter(item => item && typeof item === 'object');
  };
  
  const getCartItemNames = () => {
    const validItems = getValidCartItems();
    return validItems.length > 0 
      ? validItems.map(item => `${item.name || 'Unknown Item'} * ${item.quantity || 1}`)
      : ["Cart Item"];
  };
  
  const getValidCartIds = () => {
    return getValidCartItems().map(item => item._id || 'unknown');
  };
  
  const getValidMenuItemIds = () => {
    return getValidCartItems().map(item => item.menuItemId || 'unknown');
  };
  
  const createBuffetRecord = async (paymentId) => {
    try {
      if (!paymentId) {
        console.error('Cannot create buffet record: Missing paymentId');
        return null;
      }
      
      if (!packageInfo) {
        console.error('Cannot create buffet record: Missing package info');
        return null;
      }
    
      const buffetData = {
        name: customerInfo.name || "Customer",
        email: user.email,
        phoneNumber: customerInfo.phone || customerInfo.postal_code || "0000000000",
        eventType: packageInfo.eventType || 'Not specified',
        numberOfGuests: packageInfo.numberOfGuests || 1,
        date: packageInfo.date || new Date().toISOString().split('T')[0],
        time: packageInfo.time || '12:00',
        packageName: packageInfo.packageName || "Catering Package",
        selected: packageInfo.selected || [],
        specialRequests: packageInfo.specialRequests || '',
        isVeg: packageInfo.isVeg || false,
        paymentId: paymentId,
        paid: paymentMethod === 'online', // True for online, false for COD
        paymentMethod: paymentMethod
      };
      
      console.log("Buffet data being sent:", JSON.stringify(buffetData, null, 2));
      const buffetResponse = await axiosSecure.post('/buffet', buffetData);
      console.log("Buffet record created:", buffetResponse.data);
      return buffetResponse.data;
    } catch (error) {
      console.error('Error creating buffet record:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show error notification
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Buffet Record',
        text: 'Your payment was processed but we encountered an error creating your buffet record. Please contact support with your payment ID.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
      });
      return null;
    }
  };
  
  // Function to process a successful payment
  const processSuccessfulPayment = async (paymentIntent) => {
    try {
      const transitionId = paymentIntent.id;
      console.log("Processing payment for:", packageInfo || "Cart items");
      
      // Handle package payment differently from cart payment
      if (packageInfo) {
        // Check if this is a buffet/catering order
        const isBuffetOrder = packageInfo.cateringType && 
          (packageInfo.cateringType.includes('Catering') || 
          packageInfo.eventType || 
          packageInfo.numberOfGuests || 
          packageInfo.date || 
          packageInfo.time);
        
        console.log("Is buffet order:", isBuffetOrder, packageInfo);
        
        const paymentInfo = {
          email: user.email,
          transitionId: paymentIntent.id,
          price,
          quantity: 1,
          status: "order pending",
          paymentMethod: "online",
          itemsName: [packageInfo.packageName],
          packageName: packageInfo.packageName,
          customerInfo,
          // Add fields to identify buffet/catering orders
          orderType: isBuffetOrder ? "buffet" : "regular",
          cateringType: packageInfo.cateringType || null,
          eventType: packageInfo.eventType || null,
          numberOfGuests: packageInfo.numberOfGuests || null,
          eventDate: packageInfo.date || null,
          eventTime: packageInfo.time || null,
          selected: packageInfo.selected || []
        };

        console.log("Payment info being sent:", JSON.stringify(paymentInfo, null, 2));
        const response = await axiosSecure.post('/payments', paymentInfo);
        console.log("Payment response full structure:", JSON.stringify(response.data, null, 2));
        
        // Extract the payment ID correctly
        let paymentId = null;
        if (response.data && response.data.paymentResult && response.data.paymentResult._id) {
          paymentId = response.data.paymentResult._id;
        } else if (response.data && response.data._id) {
          paymentId = response.data._id;
        }
        
        console.log("Extracted payment ID:", paymentId);
        
        // If this is a buffet order, also create an entry in the buffet collection
        if (isBuffetOrder && paymentId) {
          try {
            const buffetResult = await createBuffetRecord(paymentId);
            console.log("Buffet record creation result:", buffetResult);
          } catch (error) {
            console.error('Error creating buffet record:', error.response?.data || error.message || error);
            // Don't block the payment process if buffet record creation fails
          }
        } else if (isBuffetOrder) {
          console.error("Could not create buffet record: Missing payment ID");
        }
        
        if (response.data) {
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: isBuffetOrder ? 
              'Your catering service has been booked successfully!' : 
              'Your package has been booked successfully!'
          }).then((result) => {
            if (result.isConfirmed) {
              // Navigate to receipt page with payment data
              navigate('/receipt', { 
                state: { 
                  paymentData: response.data,
                  paymentId: paymentId
                } 
              });
            }
          });
        }
      } else {
        // Handle cart payment - ensure cart is defined and properly structured
        if (!cart || !Array.isArray(cart) || cart.length === 0) {
          console.error("Cart is empty or not properly structured:", cart);
          throw new Error("Your cart is empty or not valid. Please try again.");
        }

        // Make sure we have valid items before mapping
        const validCartItems = cart.filter(item => item && typeof item === 'object');
        const itemwithquantity = validCartItems.map(item => `${item.name || 'Unknown Item'} * ${item.quantity || 1}`);
        
        let total = 0;
        validCartItems.forEach(item => {
          total += item.quantity || 1;
        });

        const paymentInfo = {
          email: user.email,
          transitionId: paymentIntent.id,
          price,
          quantity: total || 1,
          status: "order pending",
          paymentMethod: "online",
          itemsName: itemwithquantity.length > 0 ? itemwithquantity : ["Cart Item"],
          cartItems: validCartItems.map(item => item._id || 'unknown'),
          menuItems: validCartItems.map(item => item.menuItemId || 'unknown'),
          customerInfo,
          orderType: "regular" // Standard menu order
        };

        console.log("Cart payment info being sent:", paymentInfo);
        const response = await axiosSecure.post('/payments', paymentInfo);
        console.log("Cart payment response:", response.data);
        
        if (response.data) {
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your order has been placed successfully!'
          }).then((result) => {
            if (result.isConfirmed) {
              // Navigate to receipt page with payment data
              navigate('/receipt', { 
                state: { 
                  paymentData: response.data,
                  paymentId: response.data.paymentResult._id
                } 
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error in payment processing:", error.response?.data || error.message || error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.message || 'There was an error processing your payment. Please try again.'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Order</h2>
      
      {/* Package summary if applicable */}
      {packageInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{packageInfo.packageName}</h3>
          {packageInfo.numberOfGuests && (
            <div className="flex justify-between text-sm">
              <span>Guests:</span>
              <span>{packageInfo.numberOfGuests}</span>
            </div>
          )}
          {packageInfo.basePrice && (
            <div className="flex justify-between text-sm">
              <span>Price per person:</span>
              <span>₹{packageInfo.basePrice}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold mt-2">
            <span>Total:</span>
            <span>₹{price}</span>
          </div>
        </div>
      )}
      
      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Payment Method</h3>
        <div className="flex space-x-4">
          <div 
            className={`flex-1 p-4 border rounded-lg cursor-pointer flex flex-col items-center ${paymentMethod === 'online' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
            onClick={() => setPaymentMethod('online')}
          >
            <FaCreditCard className="text-2xl mb-2 text-green" />
            <span>Pay Now</span>
          </div>
          <div 
            className={`flex-1 p-4 border rounded-lg cursor-pointer flex flex-col items-center ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
            onClick={() => setPaymentMethod('cod')}
          >
            <FaMoneyBillAlt className="text-2xl mb-2 text-green" />
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
      
      {/* Customer Information Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name*</label>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number{paymentMethod === 'cod' ? '*' : ''}</label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
              required={paymentMethod === 'cod'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address*</label>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City*</label>
              <input
                type="text"
                name="city"
                value={customerInfo.city}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State*</label>
              <input
                type="text"
                name="state"
                value={customerInfo.state}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code*</label>
            <input
              type="text"
              name="postal_code"
              value={customerInfo.postal_code}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green focus:ring-green"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Card Element - Only show for online payment */}
      {paymentMethod === 'online' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Card Details</h3>
          <div className="p-3 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
      )}
      
      {cardError && (
        <p className="text-red-500 mt-2 text-sm mb-4">{cardError}</p>
      )}
      
      {/* Submit and Back Buttons */}
      <div className="flex flex-col space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
          disabled={paymentMethod === 'online' && (!stripe || !clientSecret || processing) || processing}
        >
          {processing ? "Processing..." : paymentMethod === 'cod' ? `Place Order (₹${price})` : `Pay ₹${price}`}
        </button>
        
        <button
          type="button"
          onClick={handleGoBack}
          className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Selection
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;
