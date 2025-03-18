'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LoginDialog from '@/components/LoginDialog';
import RegisterDialog from '@/components/RegisterDialog';
import Image from 'next/image';
import AnnouncementButton from "@/components/AnnouncementButton";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();
  // 控制登入註冊 Dialog 狀態
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const handleOpenRegister = () => {
    setOpenLogin(false);
    setOpenRegister(true);
  };

  const handleOpenLogin = () => {
    setOpenRegister(false);
    setOpenLogin(true);
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-6">
        <Link href="/">
          <Image src="/logo.png" alt="網站LOGO" width={50} height={50} />
        </Link>
        <AnnouncementButton />
      </div>

      {/* 依登入狀態判斷 */}
      <div className="flex items-center space-x-4">
        {!token ? (
          <>
            <Button variant="default" onClick={() => setOpenLogin(true)}>
              登入
            </Button>
          </>
        ) : (
          // 已登入時可替換為用戶選單，暫留占位
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">帳戶</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push('/profile')}>個人資料</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Dialog 部分 */}
      <LoginDialog
        open={openLogin}
        setOpen={setOpenLogin}
        openRegister={handleOpenRegister}
      />
      <RegisterDialog
        open={openRegister}
        setOpen={setOpenRegister}
        openLogin={handleOpenLogin}
      />
    </header>
  );
}
