//NEEDS TOUCHING
import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/AuthProvider";
import Swal from "sweetalert2";

const Signup = () => {
  const { createUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerErrors({});
    clearErrors();

    try {
      const result = await createUser(
        data.name,
        data.email,
        data.password,
        data.photoURL || ""
      );

      if (result.success) {
        Swal.fire("Success!", "New user signed up successfully.", "success");
        navigate(from, { replace: true });
      } else {
        if (result.error?.errors) {
          // Handle validation errors from server
          setServerErrors(result.error.errors);
          Object.keys(result.error.errors).forEach(key => {
            setError(key, {
              type: 'server',
              message: result.error.errors[key]
            });
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: result.error?.message || "An unknown error occurred",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message || "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-f3f1ed flex justify-center items-center">
      <div className="max-w-md bg-white shadow w-full mx-auto ">
        <Link to="/" className="bg-white text-5xl absolute left-4 top-4 text-gray-500"><FaHome /></Link>
        <div className="mb-5 p-0">
          <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-bold text-lg">Please Create An Account!</h3>
            {/* name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="name"
                placeholder="Your name"
                className={`input input-bordered ${(errors.name || serverErrors.name) ? 'input-error' : ''}`}
                {...register("name", { 
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                })}
              />
              {(errors.name || serverErrors.name) && (
                <p className="text-red-500 mt-1">
                  {errors.name?.message || serverErrors.name}
                </p>
              )}
            </div>

            {/* email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className={`input input-bordered ${(errors.email || serverErrors.email) ? 'input-error' : ''}`}
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {(errors.email || serverErrors.email) && (
                <p className="text-red-500 mt-1">
                  {errors.email?.message || serverErrors.email}
                </p>
              )}
            </div>

            {/* password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  className={`input input-bordered w-full ${(errors.password || serverErrors.password) ? 'input-error' : ''}`}
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {(errors.password || serverErrors.password) && (
                <p className="text-red-500 mt-1">
                  {errors.password?.message || serverErrors.password}
                </p>
              )}
            </div>

            {/* confirm password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="confirm password"
                  className={`input input-bordered w-full ${(errors.confirmPassword) ? 'input-error' : ''}`}
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* submit btn */}
            <div className="form-control mt-6">
              <input
                type="submit"
                className="btn bg-green text-white"
                value={isSubmitting ? "Signing up..." : "Sign up"}
                disabled={isSubmitting}
              />
            </div>

            <p className="text-center mt-3">
              Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
