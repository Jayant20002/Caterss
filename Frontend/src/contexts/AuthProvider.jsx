/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect } from 'react';
import useAxiosPublic from '../hooks/useAxiosPublic';

export const AuthContext = createContext();

// Function to generate a unique user ID
const generateUserId = () => {
  // Generate a random string of 10 characters
  const randomStr = Math.random().toString(36).substring(2, 12);
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  // Combine and return
  return `user_${randomStr}${timestamp}`;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosPublic = useAxiosPublic();

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5001);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Register new user
    const createUser = async (name, email, password, photoURL = "") => {
        setLoading(true);
        setError(null);
        try {
            // Generate a unique user ID
            const userId = generateUserId();
            
            const response = await axiosPublic.post('/auth/register', { 
                name, 
                email, 
                password,
                photoURL,
                uid: userId // Add the user ID to the registration request
            });
            
            if (response.data.token) {
                localStorage.setItem('access_token', response.data.token);
                
                // Ensure the user object has a uid property
                const userData = response.data.user;
                if (!userData.uid) {
                    userData.uid = userId;
                }
                
                setUser(userData);
                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, data: response.data };
            }
            
            setError('Registration failed');
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosPublic.post('/auth/login', { email, password });
            
            if (response.data.token) {
                localStorage.setItem('access_token', response.data.token);
                
                // Ensure the user object has a uid property
                const userData = response.data.user;
                if (!userData.uid) {
                    userData.uid = generateUserId();
                }
                
                setUser(userData);
                // Save user to localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, data: response.data };
            }
            
            setError('Login failed');
            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logOut = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    // Update user profile
    const updateUserProfile = async (name, photoURL, phone, address) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosPublic.patch('/auth/update-profile', { 
                name, 
                photoURL,
                phone,
                address
            });
            
            if (response.data && response.data.success) {
                // Ensure the user object has a uid property
                const userData = response.data.user;
                if (!userData.uid && user?.uid) {
                    userData.uid = user.uid;
                } else if (!userData.uid) {
                    userData.uid = generateUserId();
                }
                
                setUser(userData);
                // Update user in localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, data: response.data };
            }
            
            const errorMessage = response.data?.message || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Check auth status on initial load and when token changes
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                // Set a temporary user state while checking
                if (!user) {
                    // Try to get user from localStorage as fallback
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        try {
                            const parsedUser = JSON.parse(savedUser);
                            // Ensure the user has a uid property
                            if (!parsedUser.uid) {
                                parsedUser.uid = generateUserId();
                                localStorage.setItem('user', JSON.stringify(parsedUser));
                            }
                            setUser(parsedUser);
                        } catch (e) {
                            console.error('Error parsing saved user:', e);
                        }
                    }
                }
                
                const response = await axiosPublic.get('/auth/me');
                if (response.data.user) {
                    // Ensure the user object has a uid property
                    const userData = response.data.user;
                    if (!userData.uid && user?.uid) {
                        userData.uid = user.uid;
                    } else if (!userData.uid) {
                        userData.uid = generateUserId();
                    }
                    
                    setUser(userData);
                    // Save user to localStorage as backup
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } catch (error) {
                console.error('Auth status check error:', error);
                // If we get a 401, the token is invalid or expired
                if (error.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setError('Session expired. Please login again.');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, [axiosPublic, user]);

    const authInfo = {
        user,
        loading,
        error,
        createUser,
        login,
        logOut,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;