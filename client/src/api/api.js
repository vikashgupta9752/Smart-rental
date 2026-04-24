import axios from 'axios';

// Get API URL from environment variables
// In Vite, environment variables must start with VITE_
const API_URL = import.meta.env.VITE_API_URL || 'https://smart-rental-1-dy1z.onrender.com';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
