import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

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

export const getUploadUrl = (filename) => {
  if (!filename) return '';
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseURL = apiURL.replace(/\/api$/, '');
  return `${baseURL}/uploads/${filename}`;
};

export default axiosInstance;
