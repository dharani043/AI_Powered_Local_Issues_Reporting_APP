import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);
const API_BASE_URL = 'http://localhost:5000/api'; // change if needed

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('civic_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password, additionalData = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
      ...additionalData
    });
    console.log(login, response.data);
    const { token, user } = response.data;
    console.log("Logging in user:", token);
    const fullUser = { ...user, token };
    localStorage.setItem('token', token);
    localStorage.setItem('civic_user', JSON.stringify(fullUser));
    setUser(fullUser);

    // Trigger data refresh after login
    window.dispatchEvent(new Event('userLoggedIn'));

    return true;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return false;
  }
};


  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        role
      });

      const { token, user } = response.data;
  const fullUser = { ...user, token };
  console.log("Registering user:", fullUser);

      localStorage.setItem('token', token);
      localStorage.setItem('civic_user', JSON.stringify(fullUser));
      setUser(fullUser);
      return true;
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('civic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
