import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser, RegisterPayload } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  register: (payload: RegisterPayload) => { success: boolean; error?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'LOGIN' | 'REGISTER';
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserState(user);
    }
  }, []);

  const login = (email: string, pass: string) => {
    const result = loginUser(email, pass);
    if (result.success && result.user) {
      setCurrentUserState(result.user);
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const register = (payload: RegisterPayload) => {
    const result = registerUser(payload);
    if (result.success && result.user) {
      setCurrentUserState(result.user);
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const logout = () => {
    logoutUser();
    setCurrentUserState(null);
  };

  const openLoginModal = () => {
    setAuthModalMode('LOGIN');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('REGISTER');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
