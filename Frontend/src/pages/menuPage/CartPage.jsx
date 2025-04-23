import React, { useContext, useEffect, useState } from "react";
import useCart from "../../hooks/useCart";
import { AuthContext } from "../../contexts/AuthProvider";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import { useTheme } from "../../hooks/ThemeContext";

const CartPage = () => {
  const { isDarkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, refetch, isLoading, error] = useCart();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Calculate the total price for each item in the cart
  const calculateTotalPrice = (item) => {
    return item.price * item.quantity;
  };

  // Handle quantity increase
  const handleIncrease = async (item) => {
    try {
      const response = await fetch(`http://localhost:5001/carts/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });
  
      if (response.ok) {
        await refetch();
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to update quantity",
        icon: "error"
      });
    }
  };
  
  const handleDecrease = async (item) => {
    if (item.quantity > 1) {
      try {
        const response = await fetch(
          `http://localhost:5001/carts/${item._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ quantity: item.quantity - 1 }),
          }
        );
  
        if (response.ok) {
          await refetch();
        } else {
          throw new Error("Failed to update quantity");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to update quantity",
          icon: "error"
        });
      }
    }
  };

  // Calculate the cart subtotal
  const cartSubtotal = cart.reduce((total, item) => {
    return total + calculateTotalPrice(item);
  }, 0);

  // Calculate the order total
  const orderTotal = cartSubtotal;

  // delete an item
  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5001/carts/${item._id}`, {
          headers: {
            "authorization": `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        .then(response => {
          if (response) {
            refetch();
            Swal.fire("Deleted!", "Item has been removed from cart.", "success");
          }
        })
        .catch(error => {
          console.error(error);
          Swal.fire({
            title: "Error",
            text: "Failed to delete item",
            icon: "error"
          });
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500">Error loading cart: {error.message}</p>
        <Link to="/boxgenie">
          <button className="btn bg-green text-white mt-3">Back to Box - Genie</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-0">
        <div className="container">
          <div className="row mx-auto text-center justify-center">
            <div className="col-12">
              <h2 className="font-extrabold text-6xl text-green">CHECKOUT</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl container mx-auto xl:px-24 px-4">
        {cart.length > 0 ? (
          <div>
            <div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-green text-white rounded-sm">
                    <tr>
                      <th>#</th>
                      <th>Food</th>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="avatar">
                            <div className="mask mask-squircle w-12 h-12">
                              <img src={item.image} alt={item.name} />
                            </div>
                          </div>
                        </td>
                        <td className="font-medium">{item.name}</td>
                        <td className="flex">
                          <button
                            className="btn btn-xs"
                            onClick={() => handleDecrease(item)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className={`w-10 mx-2 text-center overflow-hidden appearance-none ${isDarkMode ? "dark" : ""}`}
                          />
                          <button
                            className="btn btn-xs"
                            onClick={() => handleIncrease(item)}
                          >
                            +
                          </button>
                        </td>
                        <td>₹{calculateTotalPrice(item).toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-sm border-none text-red bg-transparent"
                            onClick={() => handleDelete(item)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <hr />
            <div className="flex flex-col md:flex-row justify-between items-start my-12 gap-8">
              <div className="md:w-1/2 space-y-3">
                <h3 className="text-lg font-semibold">Customer Details</h3>
                <p>Name: {user?.displayName || "None"}</p>
                <p>Email: {user?.email}</p>
                <p>
                  User_id: <span className="text-sm">{user?.uid}</span>
                </p>
              </div>
              <div className="md:w-1/2 space-y-3">
                <h3 className="text-lg font-semibold">Shopping Details</h3>
                <p>Total Items: {cart.length}</p>
                <p>
                  Total Price:{" "}
                  <span id="total-price">₹{orderTotal.toFixed(2)}</span>
                </p>
                <Link to="/process-checkout" className="btn btn-md bg-green text-white px-8 py-1">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt-20">
            <p>Cart is empty. Please add products.</p>
            <Link to="/boxgenie">
              <button className="btn bg-green text-white mt-3">Back to Box - Genie</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;