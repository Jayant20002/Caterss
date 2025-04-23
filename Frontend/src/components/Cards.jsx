import React from "react";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";

const Cards = ({ item }) => {
  const { name, image, price, description, _id } = item;
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  const handleAddToCart = async () => {
    if (!user) {
      Swal.fire({
        title: "Please Login",
        text: "You need to login to add items to cart",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    try {
      const cartItem = {
        menuItemId: _id,
        name,
        image,
        price,
        email: user.email,
        quantity: 1
      };

      const response = await axiosPublic.post('/carts', cartItem);
      
      if (response.data) {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: `${name} added to cart.`,
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'Item already in cart',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Failed to add to cart',
          showConfirmButton: false,
          timer: 1500
        });
      }
    }
  };

  return (
    <div className="card shadow-xl relative mr-5 md:my-5 bg-white">
      <figure>
        <img 
          src={image} 
          alt={name} 
          className="hover:scale-105 rounded-lg transition-all w-auto np duration-200 md:h-60" 
        />
      </figure>
    
      <div className="card-body text-black">
        <h2 className="card-title text-lg">{name}</h2>
        <p className="text-md text-Green">{description}</p>
        <div className="card-actions justify-between items-center mt-2">
          <h5 className="font-semibold">
            <span className="text-sm text-red">Rs </span> {price}
          </h5>
          <button 
            onClick={handleAddToCart} 
            className="btn bg-green text-white border-none"
          >
            Add to Cart 
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cards;
