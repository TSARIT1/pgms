import React, { createContext, useState, useEffect } from 'react';
import { loginAdmin, registerAdmin } from '../services/adminService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);

  // Check if subscription has expired
  const checkSubscriptionExpiry = (adminData) => {
    if (!adminData) {
      setIsSubscriptionExpired(false);
      return false;
    }

    // If no subscription end date, treat as NOT expired (new user or no subscription yet)
    // This allows newly registered users to use the app without immediately seeing expired modal
    if (!adminData.subscriptionEndDate) {
      setIsSubscriptionExpired(false);
      return false;
    }

    // Parse the date from backend (LocalDateTime format: "2026-01-15T10:30:00")
    let endDate;
    if (typeof adminData.subscriptionEndDate === 'string') {
      endDate = new Date(adminData.subscriptionEndDate);
    } else {
      endDate = new Date(adminData.subscriptionEndDate);
    }

    // Validate the parsed date
    if (isNaN(endDate.getTime())) {
      console.error('[AuthContext] Invalid subscription end date:', adminData.subscriptionEndDate);
      setIsSubscriptionExpired(false);
      return false;
    }

    const now = new Date();
    const expired = now > endDate;
    
    setIsSubscriptionExpired(expired);
    return expired;
  };

  // Check if admin is logged in (from localStorage)
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    const storedRole = localStorage.getItem('role');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin(parsedAdmin);
        setRole(storedRole || 'ADMIN');
        // Check subscription expiry on mount
        checkSubscriptionExpiry(parsedAdmin);
      } catch (err) {
        console.error('Failed to parse stored admin:', err);
        localStorage.removeItem('admin');
        localStorage.removeItem('role');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await loginAdmin(email, password);
      
      if (response.status === 'success') {
        const { token, data, role: userRole } = response;
        setAdmin(data);
        setRole(userRole || 'ADMIN');
        localStorage.setItem('admin', JSON.stringify(data));
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole || 'ADMIN');
        
        // Check subscription expiry after login
        checkSubscriptionExpiry(data);
        
        return { data, role: userRole };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (adminData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any existing session before registration
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      setAdmin(null);
      
      const response = await registerAdmin(adminData);
      
      if (response.status === 'success') {
        // backend might return token on register or just data
        // If it doesn't return token, maybe we should auto-login or redirect to login
        // But for now let's assume it returns data and we might not get a token yet
        // Wait, implementation plan said "Auto-login after register (optional)". 
        // Let's check AdminController.register. It returns "data": registeredAdmin. No token.
        // So we will just return response.data. The user will be redirected to Login.
        // Or we can just setAdmin(response.data) but they won't have a token so subsequent requests will fail.
        // So better to NOT setAdmin here, just return, and let UI redirect to login.
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh admin data (e.g., after subscription purchase)
  const refreshAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          setAdmin(result.data);
          localStorage.setItem('admin', JSON.stringify(result.data));
          // Recheck subscription expiry
          checkSubscriptionExpiry(result.data);
        }
      }
    } catch (err) {
      console.error('Failed to refresh admin data:', err);
    }
  };

  // Logout function
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
    setError(null);
    setIsSubscriptionExpired(false);
  };

  // Check if user is authenticated - requires BOTH admin data AND valid token
  const isAuthenticated = !!admin && !!localStorage.getItem('token');

  const value = {
    admin,
    role,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    setError,
    isSubscriptionExpired,
    refreshAdminData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
