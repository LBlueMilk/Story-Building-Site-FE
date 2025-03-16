'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { setToken } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      const { accessToken } = response.data;
      setToken(accessToken);
      router.push('/');
    } catch (err) {
      // 已經透過 Interceptor 統一處理錯誤
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl mb-4">登入</h1>
      <input
        className="border p-2 m-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 m-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 mt-2">
        確認登入
      </button>
      <button onClick={() => router.push('/register')} className="text-blue-700 mt-4">
        沒有帳號？前往註冊
      </button>
    </div>
  );
}
