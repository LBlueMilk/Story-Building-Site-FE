import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const instance = axios.create({
  baseURL: 'https://localhost:7276/api', // ✅ 改成你的 API URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 自動附加 Token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 統一錯誤處理
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'API 錯誤');
    return Promise.reject(error);
  }
);

export default instance;
