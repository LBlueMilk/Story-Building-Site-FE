'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import Image from 'next/image';
import LoginDialog from '@/components/dialogs/LoginDialog';
import RegisterDialog from '@/components/dialogs/RegisterDialog';
import StoryDialog from '@/components/dialogs/StoryDialog';
import AnnouncementButton from '@/components/AnnouncementButton';
import { useTheme } from '@/context/ThemeContext';
import { customButton } from '@/lib/buttonVariants';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { getStories } from '@/services/auth';
import { useStory } from "@/context/StoryContext";

export default function Header() {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { stories: myStories, storyLoading: isStoriesLoading, setStories } = useStory();

  const handleOpenRegister = () => {
    setOpenLogin(false);
    setOpenRegister(true);
  };

  const handleOpenLogin = () => {
    setOpenRegister(false);
    setOpenLogin(true);
  };

  const handleLogout = () => {
    setStories([]);
    logout();
    router.push('/');
  };

  useEffect(() => {
    const handler = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsMobileMenuOpen(!isDesktop ? isMobileMenuOpen : false);
      setDropdownOpen(isDesktop ? false : dropdownOpen);
    };

    window.addEventListener('resize', handler);

    // 初始化強制關閉選單
    if (window.innerWidth >= 768) {
      setIsMobileMenuOpen(false);
      setDropdownOpen(false);
    }

    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);





  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-950 shadow-sm">
      {/* 左側區塊 */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image src="/logo.png" alt="網站LOGO" width={40} height={40} />
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className={customButton({ intent: 'ghost', size: 'sm' })}
            onClick={toggleTheme}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </Button>
          <AnnouncementButton />
        </div>
      </div>

      {/* 右側登入區（桌面） */}
      <div className="hidden md:flex items-center gap-3">
        {!token ? (
          <Button
            variant="default"
            className={customButton({ intent: 'primary', size: 'sm' })}
            onClick={() => setOpenLogin(true)}
          >
            登入
          </Button>
        ) : (
          <>
            <StoryDialog
              open={openCreate}
              setOpen={setOpenCreate}
              initialStory={null}
              onUpdate={async () => {
                const { data } = await getStories();
                setStories(data.sort((a, b) => a.id - b.id));
              }}
            />

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenCreate(true)}
              >
                建立新故事
              </Button>

              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className={customButton({ intent: 'secondary', size: 'sm' })}
                >
                  歡迎 {user?.name || ''}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="justify-center text-center"
                >
                  個人資料
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {isStoriesLoading ? (
                  <DropdownMenuItem disabled className="justify-center text-center text-gray-500">
                    載入中...
                  </DropdownMenuItem>
                ) : myStories.length > 0 ? (
                  myStories.map((story) => (
                    <DropdownMenuItem
                      key={story.id}
                      onClick={() => router.push(`/story/${story.id}`)}
                      className="justify-center text-center"
                    >
                      {story.title}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    onClick={() => setOpenCreate(true)}
                    className="justify-center text-center"
                  >
                    還沒故事呦，來建一個吧！
                  </DropdownMenuItem>
                )}


                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="justify-center text-center"
                >
                  登出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* 手機版選單 */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white dark:bg-gray-950 w-[240px]">
            <SheetHeader>
              <VisuallyHidden>
                <SheetTitle>主選單</SheetTitle>
              </VisuallyHidden>
            </SheetHeader>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                className={customButton({ intent: 'ghost', size: 'default' })}
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
              >
                {theme === 'light' ? '🌞' : '🌙'}
              </Button>

              <AnnouncementButton onClick={() => setIsMobileMenuOpen(false)} />

              {!token ? (
                <Button
                  className={customButton({ intent: 'primary', size: 'default' })}
                  onClick={() => {
                    setOpenLogin(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  登入
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    className={customButton({ intent: 'ghost' })}
                    onClick={() => {
                      router.push('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    個人資料
                  </Button>

                  {isStoriesLoading ? (
                    <Button disabled className={customButton({ intent: 'ghost' })}>
                      載入中...
                    </Button>
                  ) : myStories.length > 0 ? (
                    myStories.map((story) => (
                      <Button
                        key={story.id}
                        className={customButton({ intent: 'ghost' })}
                        onClick={() => {
                          router.push(`/story/${story.id}`);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {story.title}
                      </Button>
                    ))
                  ) : (
                    <Button
                      className={customButton({ intent: 'ghost' })}
                      onClick={() => {
                        setOpenCreate(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      還沒故事呦，來建一個吧！
                    </Button>
                  )}


                  <Button
                    className={customButton({ intent: 'outline' })}
                    onClick={() => {
                      setOpenCreate(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    建立故事
                  </Button>

                  <Button
                    className={customButton({ intent: 'destructive' })}
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    登出
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialogs */}
      <LoginDialog open={openLogin} setOpen={setOpenLogin} openRegister={handleOpenRegister} />
      <RegisterDialog open={openRegister} setOpen={setOpenRegister} openLogin={handleOpenLogin} />
    </nav>
  );
}
