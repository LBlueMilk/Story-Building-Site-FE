import axios from 'axios';

// 建立 axios 實例：統一 API 請求設定
const instance = axios.create({
  // API 基本 URL（優先使用環境變數，預設為本地 /api）
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`  // 例如 https://api.example.com/api
    : "/api",                                   // Next.js 內部 API 時用相對路徑                               // Next.js 內部 API 時用相對路徑

  // 預設 HTTP 標頭，所有請求預設為 JSON
  headers: {
    'Content-Type': 'application/json',
  },

  // 啟用跨來源 Cookie（包含 refreshToken 等憑證傳遞）
  // 對應後端 ASP.NET Core 的 CORS 設定與 Cookie 驗證機制
  withCredentials: true,
});

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

// 錯誤攔截器，方便除錯
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('❌ API 錯誤：', err.response?.status, err.response?.data);
    return Promise.reject(err);
  }
);

export default instance;
