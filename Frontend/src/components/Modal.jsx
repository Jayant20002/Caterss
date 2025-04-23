import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaFacebookF, FaGithub, FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import Swal from 'sweetalert2';

const Modal = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithGmail, login } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  // modal close button
  const [isModalOpen, setIsModalOpen] = useState(true); 
  const closeModal = () => {
    setIsModalOpen(false);
    document.getElementById("my_modal_5").close()
  };

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  //react hook form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const email = data.email;
      const password = data.password;
      const result = await login(email, password);
      
      if (result.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 1500
        });
        
        navigate(from, { replace: true });
        closeModal();
      } else {
        setErrorMessage(result.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  // login with google
  const handleRegister = async () => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await signUpWithGmail();
      
      if (result && result.user) {
        const userInfo = {
          email: result.user?.email,
          name: result.user?.displayName
        };
        
        await axiosPublic.post('/users', userInfo);
        
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Logged in with Google successfully!",
          showConfirmButton: false,
          timer: 1500
        });
        
        navigate(from, { replace: true });
        closeModal();
      }
    } catch (error) {
      console.error("Error signing up with Google:", error);
      setErrorMessage("Failed to login with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog id="my_modal_5" className={`modal ${isModalOpen ? 'modal-middle sm:modal-middle' : 'hidden'}`}>
      <div className="modal-box bg-white text-black">
        <div className="modal-action flex-col justify-center mt-0">
          <form
            className="card-body text-black"
            method="dialog"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h3 className="font-bold text-lg">Please Login!</h3>

            {/* email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black font-semibold">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered bg-white font-bold"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-black font-semibold">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered bg-white font-bold"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* show errors */}
            {errorMessage && (
              <p className="text-red-500 text-xs italic mt-2">
                {errorMessage}
              </p>
            )}

            {/* submit btn */}
            <div className="form-control mt-4">
              <button
                type="submit"
                className="btn bg-green text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>

            {/* close btn */}
            <div
              htmlFor="my_modal_5"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_5").close()}
            >
              ✕
            </div>

            <p className="text-center my-2">
              Don't have an account?
              <Link to="/signup" className="underline text-red ml-1" onClick={closeModal}>
                Signup Now
              </Link>
            </p>
          </form>
          <div className="text-center space-x-3 mb-5">
            
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
