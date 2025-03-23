'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LoginDialog from '@/components/dialogs/LoginDialog';
import RegisterDialog from '@/components/dialogs/RegisterDialog';
import Image from 'next/image';
import AnnouncementButton from "@/components/AnnouncementButton";
import { useTheme } from '@/app/context/ThemeContext';
import CreateStoryDialog from '@/components/dialogs/CreateStoryDialog';

export default function Header() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleOpenRegister = () => {
    setOpenLogin(false);
    setOpenRegister(true);
  };

  const handleOpenLogin = () => {
    setOpenRegister(false);
    setOpenLogin(true);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  return (
    <nav className="flex justify-between items-center px-4 py-2 border-b shadow-sm bg-white dark:bg-gray-950">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image src="/logo.png" alt="網站LOGO" width={40} height={40} priority />
        </Link>
        <Button variant="outline" onClick={toggleTheme} className="h-8 px-3">
          {theme === 'light' ? '🌞' : '🌙'}
        </Button>
        <AnnouncementButton />
      </div>

      <div className="flex items-center gap-3">
        {!token ? (
          <Button variant="default" onClick={() => setOpenLogin(true)} className="h-8 px-3">
            登入
          </Button>
        ) : (
          <>
            <CreateStoryDialog open={openCreate} setOpen={setOpenCreate} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="px-3 h-8">
                  歡迎 {user?.name || ' '}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem] bg-white dark:bg-gray-900 rounded-md shadow-md text-center">
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="w-full justify-center text-center truncate hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
                >
                  個人資料
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 mx-2" />

                {user?.stories && user.stories.length > 0 ? (
                  user.stories.map((story) => (
                    <DropdownMenuItem
                      key={story.id}
                      onClick={() => router.push(`/story/${story.id}`)}
                      className="w-full justify-center text-center truncate hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
                    >
                      {story.title}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    onClick={() => setOpenCreate(true)}
                    className="w-full justify-center text-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
                  >
                    還沒故事呦，來建一個吧！
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1 mx-2" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="w-full justify-center text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md"
                >
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <LoginDialog open={openLogin} setOpen={setOpenLogin} openRegister={handleOpenRegister} />
      <RegisterDialog open={openRegister} setOpen={setOpenRegister} openLogin={handleOpenLogin} />
    </nav>
  );
}
