import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, rememberMe: boolean, role?: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user') ?? sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token') ?? sessionStorage.getItem('token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token') ?? sessionStorage.getItem('token');
      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }
      // Keep token state in sync with storage (handles rememberMe=false case)
      setToken(storedToken);
      try {
        const res = await api.get<User>('/auth/me');
        if (res.data) {
          setUser(res.data);
          // Persist refreshed user profile to whichever storage has the token
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            sessionStorage.setItem('user', JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.warn('Auth verification failed — clearing session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const establishSession = (result: { user: User; token: string }, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem('token');
    otherStorage.removeItem('user');
    storage.setItem('token', result.token);
    storage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    console.log('Login response:', res);
    if (!res.data?.token || !res.data?.user) {
      console.error('Invalid response structure:', res);
      throw new Error('Login response was incomplete. Please contact support.');
    }
    establishSession(res.data, rememberMe);
  };

  const register = async (name: string, email: string, password: string, rememberMe: boolean, role?: UserRole) => {
    const res = await api.post<{ user: User; token: string }>('/auth/register', { name, email, password, role });
    if (!res.data?.token || !res.data?.user) {
      throw new Error('Registration response was incomplete. Please contact support.');
    }
    establishSession(res.data, rememberMe);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
