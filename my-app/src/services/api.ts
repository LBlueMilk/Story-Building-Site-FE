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

export default instance;
