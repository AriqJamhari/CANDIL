import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Set up socket connection based on user authentication
  useEffect(() => {
    if (user) {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const socketURL = apiURL.replace(/\/api$/, '');
      
      const newSocket = io(socketURL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
    }
  }, [user]);

  // Set up response interceptor to handle session expiration (401)
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await axiosInstance.post('/auth/logout');
    setUser(null);
  };

  const register = async (nama, email, password, role) => {
    const res = await axiosInstance.post('/auth/register', { nama, email, password, role });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, checkAuth, setUser, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
