'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TokenService } from '@/services/tokenService';
import { UserType } from '@/types/user';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserType | null;  
  setUser: (user: UserType | any | null) => void;
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

  const setUser = (user: any | null) => {
    if (user) {
      const formattedUser: UserType = {
        id: user.id,
        name: user.name,
        email: user.email,
        stories: user.stories || [],
      };
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setUserState(formattedUser);
    } else {
      localStorage.removeItem('user');
      setUserState(null);
    }
  };
  
  const router = useRouter();
  const logout = () => {
    TokenService.clearTokens();
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem('user');
    router.push('/'); 
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);