import axios from "axios";

// Use environment variable or default to port 5001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const axiosPublic = axios.create({
    baseURL: API_URL,
    timeout: 15001, // Increase timeout to 15 seconds
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for logging and auth token
axiosPublic.interceptors.request.use(
    config => {
        // Add auth token to request headers if it exists
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging and error handling
axiosPublic.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;
        
        // Log the error details
        console.error('Response Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: originalRequest.url
        });
        
        // Handle backend connection issues more gracefully
        if (!error.response && error.message === 'Network Error') {
            console.error('Backend server may not be running. Please check server status.');
        }
        
        // If the error was due to a timeout or network issue and we haven't tried to retry yet
        if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error')) &&
            !originalRequest._retry) {
            originalRequest._retry = true;
            
            console.log('Network error, retrying request...');
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(axiosPublic(originalRequest));
                }, 3000); // Wait 3 seconds before retry
            });
        }
        
        return Promise.reject(error);
    }
);

// Display a user-friendly message to the console about the current API endpoint
console.log(`🚀 API client configured to use: ${API_URL}`);

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;
