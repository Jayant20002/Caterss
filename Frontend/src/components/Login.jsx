import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../contexts/AuthProvider';
import Swal from 'sweetalert2';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        Swal.fire('Success!', 'Logged in successfully.', 'success');
        navigate(from, { replace: true });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result.error || 'Invalid email or password',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'An unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-f3f1ed flex justify-center items-center">
      <div className="max-w-md bg-white shadow w-full mx-auto">
        <Link to="/" className="bg-white text-5xl absolute left-4 top-4 text-gray-500"><FaHome /></Link>
        <div className="mb-5 p-0">
          <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="font-bold text-lg">Please Login!</h3>

            {/* email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
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
                  className="input input-bordered w-full"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
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
              {errors.password && <p className="text-red-500">{errors.password.message}</p>}
              <label className="label">
                <a href="#" className="label-text-alt link link-hover mt-2">
                  Forgot password?
                </a>
              </label>
            </div>

            {/* submit btn */}
            <div className="form-control mt-6">
              <input
                type="submit"
                className="btn bg-green text-white"
                value={isSubmitting ? "Logging in..." : "Login"}
                disabled={isSubmitting}
              />
            </div>

            <p className="text-center mt-3">
              Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
