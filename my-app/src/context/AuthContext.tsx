'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TokenService } from '@/services/tokenService';
import { UserType } from '@/types/user';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth';


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
  setToken: () => { },
  setUser: () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<UserType | null>(null);
  const router = useRouter();

  // 初始化：從 localStorage 載入
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setTokenState(storedToken);
    if (storedUser) setUserState(JSON.parse(storedUser));
  }, []);

  // 設定 Token（並自動保存至 TokenService）
  const setToken = (token: string | null) => {
    if (token) {
      const refreshToken = TokenService.getRefreshToken() || '';
      TokenService.setTokens(token, refreshToken);
    } else {
      TokenService.clearTokens();
    }
    setTokenState(token);
  };

  // 設定使用者（含 getProfile 呼叫，補齊 email）
  const setUser = async (user: any | null) => {
    if (user) {
      try {
        const { data } = await getProfile();
        const formattedUser: UserType = {
          id: data.id,
          name: data.name,
          email: data.email,
          userCode: data.userCode,
          isVerified: data.isVerified,
          createdAt: data.createdAt,
          loginProviders: data.loginProviders,
          stories: user.stories || [],
        };
        localStorage.setItem('user', JSON.stringify(formattedUser));
        setUserState(formattedUser);
      } catch (error) {
        console.error('❌ 載入使用者資料失敗', error);
        // fallback，至少保住登入狀態
        const fallbackUser: UserType = {
          id: -1, //未知使用者
          name: user.name || '',
          email: '',
          stories: user.stories || [],
        };
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setUserState(fallbackUser);
      }
    } else {
      localStorage.removeItem('user');
      setUserState(null);
    }
  };

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