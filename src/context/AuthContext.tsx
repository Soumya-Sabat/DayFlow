import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, UserRole, AuthState } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthContextType extends AuthState {
  login: (credentials: { loginIdOrEmail: string; password: string; rememberMe?: boolean }) => Promise<User>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null,
  });

  const refreshUser = useCallback(() => {
    const user = authService.getStoredUser();
    const isAuth = authService.isAuthenticated();

    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: isAuth,
      role: user?.role || null,
      isLoading: false,
    }));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { loginIdOrEmail: string; password: string; rememberMe?: boolean }) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await authService.login(credentials);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        role: response.user.role,
      });
      return response.user;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await authService.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
    });
  };

  const setRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, role }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setRole, refreshUser }}>
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



