import axios from 'axios';

const axiosInstance = axios.create({
    // Development mein localhost, production mein backend URL
    // baseURL: 'http://localhost:5000/api', 
    baseURL: 'https://surjeetbackend-6iif.onrender.com/api', 
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;