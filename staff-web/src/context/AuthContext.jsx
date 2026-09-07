import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [hospital, setHospital] = useState(() => {
    const saved = localStorage.getItem('staymeds_hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staymeds_staff_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setHospital(res.data);
          localStorage.setItem('staymeds_hospital_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, hospital: hospitalData } = res.data;
    setToken(access_token);
    setHospital(hospitalData);
    localStorage.setItem('staymeds_staff_token', access_token);
    localStorage.setItem('staymeds_hospital_user', JSON.stringify(hospitalData));
    return hospitalData;
  };

  const register = async (name, email, phone, password, confirm_password) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      phone,
      password,
      confirm_password
    });
    const { access_token, hospital: hospitalData } = res.data;
    setToken(access_token);
    setHospital(hospitalData);
    localStorage.setItem('staymeds_staff_token', access_token);
    localStorage.setItem('staymeds_hospital_user', JSON.stringify(hospitalData));
    return hospitalData;
  };

  const logout = () => {
    setToken(null);
    setHospital(null);
    localStorage.removeItem('staymeds_staff_token');
    localStorage.removeItem('staymeds_hospital_user');
  };

  return (
    <AuthContext.Provider value={{ hospital, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
