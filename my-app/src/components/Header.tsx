'use client';

import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        <span className="font-bold">網站LOGO</span>
        <Button variant="secondary" onClick={() => router.push('/announcement')}>
          公告 + EMAIL
        </Button>
      </div>

      <div>
        {!token ? (
          <Button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white"
          >
            登入
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-500 text-white">已登入</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="text-red-500">
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
