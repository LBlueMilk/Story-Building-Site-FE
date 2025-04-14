// /src/components/story/StoryWorkspace.tsx
"use client";

import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import CanvasBoard from './CanvasBoard';
import TimelinePanel from './TimelinePanel';
import CharacterSidebar from './CharacterSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getStoryByIdClient } from '@/services/story.client';
import { useMediaQuery } from 'usehooks-ts';
import { useRef } from 'react';


interface Props {
    storyId: number;
}

export default function StoryWorkspace({ storyId }: Props) {
    const { token } = useAuth();
    const [story, setStory] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    // 是否開啟角色側欄
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('character_sidebar_open') === 'true';
        }
        return false;
    });
    const isMobile = useMediaQuery('(max-width: 768px)');
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    // 設定側欄開啟狀態
    useEffect(() => {
        localStorage.setItem('character_sidebar_open', isSidebarOpen.toString());
    }, [isSidebarOpen]);

    // 取得故事資料
    useEffect(() => {
        if (!token) return;
        getStoryByIdClient(storyId, token)
            .then(setStory)
            .catch((err: Error) => {
                console.error('❌ 無法載入故事內容', err);
                setError('找不到故事或無存取權限');
            });
    }, [storyId, token]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isSidebarOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isSidebarOpen]);


    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!story) return <div className="p-4 text-center">載入中...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative ">
            {/* 上方內容（畫布 + 角色側欄） */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-auto relative">
                    {/* 畫布區域 */}
                    <CanvasBoard storyId={storyId} />

                    {/* 側欄浮出（根據裝置切換動畫位置） */}
                    <div
                        ref={sidebarRef} // ✅ 指定 ref
                        className={`fixed ${isMobile
                            ? 'bottom-0 left-0 w-full h-[70%]'
                            : 'top-16 right-0 w-[300px] h-[calc(100vh-4rem-25%)]'
                            } bg-white border shadow-lg z-50 overflow-auto transition-transform duration-300 ${isSidebarOpen
                                ? 'translate-x-0'
                                : isMobile
                                    ? 'translate-y-full'
                                    : 'translate-x-full'
                            }`}
                    >
                        <CharacterSidebar storyId={storyId} />
                    </div>
                </div>
            </div>

            {/* 分隔線 */}
            <Separator className="my-1" />

            {/* 下方時間軸 */}
            <div className="h-[25%] border-t overflow-auto">
                <TimelinePanel storyId={storyId} />
            </div>

            {/* 浮動按鈕 */}
            {!isSidebarOpen && (
                <Button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed bottom-4 right-4 z-50 w-12 h-12 p-0 rounded-full shadow-lg bg-white border hover:bg-slate-100"
                    aria-label="開啟角色側欄"
                >
                    <ChevronLeft size={24} />
                </Button>
            )}
        </div>
    );
}