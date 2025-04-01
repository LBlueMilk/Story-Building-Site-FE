import axios from 'axios';
import { toast } from 'sonner';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : "/api",
  headers: {
    'Content-Type': 'application/json',
  },
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


// Response Interceptor - 統一錯誤處理
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const resData = typeof error.response?.data === 'object' ? error.response.data : null;
    const message = resData?.message || resData?.error || resData?.detail || 'API 錯誤';

    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', message);
    }


    // 僅在瀏覽器端才觸發 toast
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => {
        switch (status) {
          case 400:
            toast.error(message || '請求錯誤');
            break;
          case 401:
            toast.error('未授權，請重新登入');
            break;
          case 403:
            toast.error('您沒有權限進行此操作');
            break;
          case 404:
            toast.error('找不到資源');
            break;
          case 422:
            toast.error('帳號或密碼錯誤');
            break;
          case 500:
            toast.error('伺服器錯誤，請稍後再試');
            break;
          default:
            toast.error(message);
            break;
        }
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
