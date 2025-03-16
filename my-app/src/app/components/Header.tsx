'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        <span className="font-bold">網站LOGO</span>
        {/* 合併公告與EMAIL按鈕 */}
        <Button variant="secondary">公告 + EMAIL</Button>
      </div>

      {/* 登入狀態按鈕 */}
      <div>
        {!token ? (
          <Button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white"
          >
            登入
          </Button>
        ) : (
          <div className="relative group">
            <Button className="px-4 py-2 bg-green-500 text-white">已登入</Button>
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded hidden group-hover:block">
              <Button
                onClick={logout}
                className="block w-full px-4 py-2 text-left text-red-500"
                variant="ghost"
              >
                登出
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
