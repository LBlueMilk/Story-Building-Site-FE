'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { TokenService } from '@/services/tokenService';
import { UserType } from '@/types/user';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth';
import { toast } from 'sonner';
import { refreshAccessToken } from '@/services/auth';



interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserType | null;
  setUser: (user: UserType | any | null) => void;
  logout: () => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setToken: () => { },
  setUser: () => { },
  logout: () => { },
  isReady: false,
});


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<UserType | null>(null);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  /* ----------- 將 token & refreshToken 寫入 / 清除 ----------- */
  const setToken = useCallback((accessToken: string | null) => {
    if (accessToken) {
      const refreshToken = TokenService.getRefreshToken() || '';
      TokenService.setTokens(accessToken, refreshToken);
    } else {
      TokenService.clearTokens();
    }
    setTokenState(accessToken);
  }, []);

  /* ----------- 設定 / 清除使用者資訊 ----------- */
  const setUser = useCallback((value: UserType | null) => {
    if (value) {
      localStorage.setItem('user', JSON.stringify(value));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(value);
  }, []);

  /* ----------- 登出 ----------- */
  const logout = useCallback(() => {
    TokenService.clearTokens();
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem('user');
    toast.success('已成功登出');
    router.push('/');
  }, [router]);

  /* ----------- App 載入時嘗試用 refreshToken 續登 ----------- */
  useEffect(() => {
    const bootstrap = async () => {
      const existingAccess = localStorage.getItem('accessToken');
      const existingUser = localStorage.getItem('user');
      if (existingAccess) setTokenState(existingAccess);
      if (existingUser) setUserState(JSON.parse(existingUser));

      /* 沒有 accessToken 才嘗試 silent refresh */
      if (!existingAccess) {
        const rt = TokenService.getRefreshToken();
        if (!rt) {
          setIsReady(true);
          return;
        }

        try {
          const { accessToken, refreshToken } = await refreshAccessToken(rt);
          setToken(accessToken);
          TokenService.setTokens(accessToken, refreshToken);

          const { data } = await getProfile();
          setUser(data);
          console.log('✅ 自動刷新 token 成功');
        } catch {
          console.warn('❌ 自動刷新 token 失敗，需重新登入');
          logout();
        }
      }
      setIsReady(true);
    };
    bootstrap();
  }, [logout, setToken]);

  /* ----------- 靜默續期：定時檢查 exp，剩 <60s 自動 refresh ----------- */
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const handler = setInterval(async () => {
      if (isRefreshingRef.current) return;
      const exp = TokenService.getAccessExp();
      if (!exp) return;

      const msLeft = exp * 1000 - Date.now();
      if (msLeft > 60_000) return; // 仍大於 60 秒，不動作

      const rt = TokenService.getRefreshToken();
      if (!rt) {
        logout();
        return;
      }

      try {
        isRefreshingRef.current = true;
        const { accessToken, refreshToken } = await refreshAccessToken(rt);
        setToken(accessToken);
        TokenService.setTokens(accessToken, refreshToken);
        console.log('🔄 Token 已靜默續期');
      } catch {
        console.warn('❌ 靜默續期失敗，登出');
        logout();
      } finally {
        isRefreshingRef.current = false;
      }
    }, 30_000); // 每 30 秒檢查一次

    return () => clearInterval(handler);
  }, [token, logout, setToken]);

  /* ---------------------------------------------------------- */
  return (
    <AuthContext.Provider
      value={{ token, user, setToken, setUser, logout, isReady }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);