import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import { storage, secureStorage } from '../utils/storage';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  requestOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [token, user] = await Promise.all([
        secureStorage.getToken(),
        storage.getUser(),
      ]);

      if (token && user) {
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const requestOTP = useCallback(async (phoneNumber: string) => {
    try {
      const response = await api.requestOTP(phoneNumber);
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || 'Failed to send OTP' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const login = useCallback(async (phoneNumber: string, otp: string) => {
    try {
      const response = await api.verifyOTP(phoneNumber, otp);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store credentials
        await Promise.all([
          secureStorage.setToken(token),
          storage.setUser(user),
        ]);

        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      }
      
      return { success: false, error: response.error || 'Invalid OTP' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.clearAll();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return;

    try {
      const response = await api.updateProfile(state.user.id, updates);
      if (response.success && response.data) {
        const updatedUser = response.data;
        await storage.setUser(updatedUser);
        setState(prev => ({ ...prev, user: updatedUser }));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        requestOTP,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
