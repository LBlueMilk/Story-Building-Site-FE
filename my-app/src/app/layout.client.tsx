'use client';

import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { StoryProvider } from '@/context/StoryContext';


export default function RootClient({ children }: { children: React.ReactNode }) {

    // 檢查是否需要顯示系統公告
    // 如果使用者尚未看到公告，則顯示一次
    // 使用 localStorage 儲存使用者是否已經看到公告的狀態
    // 當版本號變更時，會顯示新的公告
    // 這裡的版本號可以根據實際情況調整
    const CURRENT_ANNOUNCEMENT_VERSION = '1.0.0'; // 當前公告版本號
    
    useEffect(() => {
        const seenVersion = localStorage.getItem('seen_announcement_version');
        if (seenVersion !== CURRENT_ANNOUNCEMENT_VERSION) {
            toast.info(
                <div className="text-sm leading-relaxed">
                    <p className="font-semibold text-blue-800 flex items-center">
                        <span className="mr-2">📢</span>
                        <span>系統公告</span>
                    </p>
                    <p className="mt-1 text-gray-800">
                        資料庫將在{' '}
                        <span className="font-bold text-red-600">2025/6/15</span> 失效！
                        <br />
                        感謝您的到來與諒解。
                    </p>
                </div>,
                {
                    action: {
                        label: '知道了',
                        onClick: () => {
                            localStorage.setItem('seen_announcement_version', CURRENT_ANNOUNCEMENT_VERSION);
                        },
                    },
                    duration: Infinity,
                }
            );
        }
    }, []);
    return (
        <ThemeProvider>
            <AuthProvider>
                <StoryProvider>
                    <Header />
                    <main className="flex-grow p-4 container mx-auto">{children}</main>
                    <Footer />
                    <Toaster richColors position="top-center" />
                </StoryProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
