import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuthService } from '../services/customerAuth';
import { registerServiceWorker, subscribeToPush, unsubscribeFromPush } from '../lib/webPush';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerServiceWorker();
    const token = localStorage.getItem('customer_token');
    if (!token) { setLoading(false); return; }
    customerAuthService.me()
      .then(res => {
        setUser(res.customer);
        subscribeToPush();
      })
      .catch(() => {
        localStorage.removeItem('customer_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await customerAuthService.login(email, password);
    localStorage.setItem('customer_token', res.token);
    setUser(res.customer);
    subscribeToPush();
  };

  const sendOtp = async (phone) => {
    const res = await customerAuthService.sendOtp(phone);
    return res.verificationId;
  };

  const verifyOtp = async (phone, verificationId, code, name) => {
    const res = await customerAuthService.verifyOtp(phone, verificationId, code, name);
    localStorage.setItem('customer_token', res.token);
    setUser(res.customer);
    subscribeToPush();
    return { isNew: res.isNew };
  };

  const register = async (data) => {
    const res = await customerAuthService.register(data);
    localStorage.setItem('customer_token', res.token);
    setUser(res.customer);
    subscribeToPush();
  };

  const updateProfile = async (data) => {
    const res = await customerAuthService.updateProfile(data);
    setUser(res.customer);
  };

  const logout = () => {
    unsubscribeFromPush();
    localStorage.removeItem('customer_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, sendOtp, verifyOtp, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
