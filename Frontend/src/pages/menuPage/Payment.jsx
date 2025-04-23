import { Elements } from "@stripe/react-stripe-js";
import React, { useState, useEffect } from "react";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import useCart from "../../hooks/useCart";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

// outside of a component's render to avoid
const stripePromise = loadStripe(import.meta.env.VITE_Stripe_PK);

const Payment = () => {
  const [cart] = useCart();
  const [totalPrice, setTotalPrice] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const calculateTotalPrice = () => {
      // Check if price is passed from Packages component
      if (location.state && location.state.price) {
        const price = parseFloat(location.state.price);
        if (isNaN(price) || price <= 0) {
          console.error("Invalid price from package:", location.state.price);
          Swal.fire({
            icon: 'error',
            title: 'Invalid Price',
            text: 'The package price is invalid. Please try again.',
          });
          return;
        }
        setTotalPrice(price);
        return;
      }
      
      // Otherwise calculate from cart
      const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const formattedPrice = parseFloat(cartTotal.toFixed(2));
      
      if (isNaN(formattedPrice) || formattedPrice <= 0) {
        console.error("Invalid cart total:", cartTotal);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Cart',
          text: 'Your cart total is invalid. Please add items to your cart.',
        });
        return;
      }
      
      setTotalPrice(formattedPrice);
    };

    calculateTotalPrice();
  }, [cart, location.state]);

  // If price is invalid, show error message
  if (totalPrice <= 0) {
    return (
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-28 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid Price</h2>
        <p className="mb-4">The price for your order is invalid. Please go back and try again.</p>
        <button 
          onClick={() => window.history.back()} 
          className="bg-green text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show order summary
  const PackageSummary = () => {
    if (!location.state || !location.state.packageName) return null;
    
    return (
      <div className="mb-8 p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Package Summary</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Package:</span> {location.state.packageName}</p>
          {location.state.eventType && (
            <p><span className="font-medium">Event Type:</span> {location.state.eventType}</p>
          )}
          {location.state.numberOfGuests && (
            <p><span className="font-medium">Guests:</span> {location.state.numberOfGuests}</p>
          )}
          {location.state.date && (
            <p><span className="font-medium">Date:</span> {location.state.date}</p>
          )}
          {location.state.selected && location.state.selected.length > 0 && (
            <div>
              <p className="font-medium">Selected Items:</p>
              <ul className="ml-4 list-disc">
                {location.state.selected.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-lg font-bold mt-2">Total: ₹{totalPrice}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
    
    <div className="page-header mb-0">
    <div className="container">
      <div className="row mx-auto text-center justify-center">
        <div className="col-12">
          <h2 className="font-extrabold  text-6xl text-green ">CHECKOUT</h2>
        </div>

        {/* <!-- <div className="col-12">
          <a href="">Home</a>
          <a href="">Menu</a>
        </div> --> */}
      </div>
    </div>
  </div>
    <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4 py-28">
      {/* Package Summary */}
      <PackageSummary />
      
      <Elements stripe={stripePromise}>
        <CheckoutForm price={totalPrice} cart={cart} packageInfo={location.state}/>
      </Elements>
    </div>
    </div>
  );
};

export default Payment;
