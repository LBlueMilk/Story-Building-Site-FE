'use client';

import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { token, setToken } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 清除本地 Token
    setToken(null); // 清空 Context 中的 Token
  };

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Story Building Site</h1>
      <p>這裡是首頁</p>
      <p>可以用網站功能介紹等等</p>
      {token ? (
        <p className="text-green-600 mt-4">有登入的畫面</p>
      ) : (
        <p className="text-red-600 mt-4">未登入時的頁面</p>
      )}
    </div>
  );
}
