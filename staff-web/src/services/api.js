import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000/api'
    : 'https://staymeds-api.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staymeds_staff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('staymeds_staff_token');
      localStorage.removeItem('staymeds_hospital_user');
    }
    return Promise.reject(error);
  }
);

export default api;
