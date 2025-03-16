'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../services/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register({ email, password });
      alert('註冊成功，請登入');
      router.push('/login');
    } catch (err) {
      // 已經透過 Interceptor 統一處理錯誤
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl mb-4">註冊</h1>
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
      <button onClick={handleRegister} className="bg-green-500 text-white px-4 py-2 mt-2">
        確認註冊
      </button>
      <button onClick={() => router.push('/login')} className="text-blue-700 mt-4">
        已有帳號？前往登入
        測試        
      </button>
    </div>
  );
}
