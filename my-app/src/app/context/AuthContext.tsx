'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TokenService } from '../services/tokenService';

export interface StoryType {
  id: string;
  title: string;
}

export interface UserType {
  name?: string;
  stories: StoryType[];
}

interface AuthContextType {
  token: string | null;
  user: UserType | null;
  setToken: (token: string | null) => void;
  setUser: (user: UserType | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setToken: () => {},
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<UserType | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setTokenState(storedToken);
    if (storedUser) setUserState(JSON.parse(storedUser));
  }, []);

  const setToken = (token: string | null) => {
    if (token) {
      const refreshToken = TokenService.getRefreshToken() || '';
      TokenService.setTokens(token, refreshToken); // 只更新 accessToken
    } else {
      TokenService.clearTokens();
    }
    setTokenState(token);
  };

  const setUser = (user: UserType | null) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    setUserState(user);
  };

  const logout = () => {
    TokenService.clearTokens();
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);