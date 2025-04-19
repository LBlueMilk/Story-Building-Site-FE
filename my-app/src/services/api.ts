import axios from 'axios';
import { toast } from 'sonner';
import { TokenService } from '@/services/tokenService';
import { refreshAccessToken } from '@/services/auth';

let isRefreshing = false;
let failedQueue: any[] = [];

// 建立 axios 實例：統一 API 請求設定
const instance = axios.create({
  // API 基本 URL（優先使用環境變數，預設為本地 /api）
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`  // 例如 https://api.example.com/api
    : "/api",                                   // Next.js 內部 API 時用相對路徑

  // 預設 HTTP 標頭，所有請求預設為 JSON
  headers: {
    'Content-Type': 'application/json',
  },

  // 啟用跨來源 Cookie（包含 refreshToken 等憑證傳遞）
  // 對應後端 ASP.NET Core 的 CORS 設定與 Cookie 驗證機制
  withCredentials: true,
});


// 重新整理 Token 的請求
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor - 自動附加 Token
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('accessToken');
    console.log('🚀 發送請求，accessToken =', token)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor：處理 Access Token 過期情境（HTTP 401）
// - 若 accessToken 過期，會自動使用 refreshToken 向後端請求新 token
// - 成功後會：
//   1. 更新 accessToken / refreshToken（TokenService）
//   2. 補上 Authorization header 並重送原始請求
// - 若 refreshToken 也過期，則清除登入狀態並導向首頁
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 僅處理首次出現的 401（避免無限循環）
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 若已有其他請求正在刷新，加入等待佇列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        // ✅ 使用 refreshToken 換取新 accessToken
        const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);
        TokenService.setTokens(accessToken, newRefreshToken);

        // 更新全域 Authorization header
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

        // 通知佇列所有待處理的請求，繼續發送
        processQueue(null, accessToken);

        // 重送原始失敗請求
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return instance(originalRequest);
      } catch (err) {
        // Refresh 失敗：登出並導向首頁
        toast.error('登入狀態已過期，請重新登入');
        processQueue(err, null);
        TokenService.clearTokens();
        window.location.href = '/'; // 強制導回登入或首頁
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export default instance;
