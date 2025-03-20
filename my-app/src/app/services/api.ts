import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', //交給 Proxy 處理
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 自動附加 Token
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('accessToken');
    console.log('附加 Token:', token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
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
