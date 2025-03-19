'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StoryType {
  id: string;
  title: string;
}

interface UserType {
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
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setTokenState(storedToken);
    if (storedUser) setUserState(JSON.parse(storedUser));
  }, []);

  const setToken = (token: string | null) => {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
    setTokenState(token);
  };

  const setUser = (user: UserType | null) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    setUserState(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);