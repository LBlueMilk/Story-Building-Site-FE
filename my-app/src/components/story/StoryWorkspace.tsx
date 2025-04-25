// /src/components/story/StoryWorkspace.tsx
"use client";

import { useEffect, useState, useRef } from 'react';

import CanvasBoard from './CanvasBoard';
import TimelinePanel from './TimelinePanel';
import CharacterSidebar from './CharacterSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getStoryByIdClient } from '@/services/story.client';
import { useMediaQuery } from 'usehooks-ts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";



interface Props {
    storyId: number;
}

export default function StoryWorkspace({ storyId }: Props) {
    const { token, isReady } = useAuth();
    const [story, setStory] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);


    // 角色側欄開關狀態
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('character_sidebar_open') === 'true';
        }
        return false;
    });

    const isMobile = useMediaQuery('(max-width: 768px)');
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    // 拖曳分隔線狀態
    const [canvasHeight, setCanvasHeight] = useState(() => {
        if (typeof window !== 'undefined') {
            return parseInt(localStorage.getItem('splitter_position') || '70');
        }
        return 70;
    });
    const [isPinned, setIsPinned] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('is_pinned') === 'true';
        }
        return false;
    });
    const [isDragging, setIsDragging] = useState(false);

    const [startY, setStartY] = useState<number | null>(null);
    const [startHeight, setStartHeight] = useState<number>(canvasHeight);

    // 設定側欄開啟狀態
    useEffect(() => {
        localStorage.setItem('character_sidebar_open', isSidebarOpen.toString());
    }, [isSidebarOpen]);

    // 取得故事資料
    useEffect(() => {
        if (!isReady || !token) return;
        getStoryByIdClient(storyId, token)
            .then(setStory)
            .catch((err: Error) => {
                console.error('❌ 無法載入故事內容', err);
                setError('找不到故事或無存取權限');
            });
    }, [storyId, token, isReady]);

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


    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => {
                if (startY === null) return;
                const deltaY = e.clientY - startY;
                const deltaPercent = (deltaY / window.innerHeight) * 100;
                const newHeight = startHeight + deltaPercent;

                if (newHeight < 30 || newHeight > 80) return;
                setCanvasHeight(newHeight);
            };
            const handleMouseUp = () => {
                setIsDragging(false);
                localStorage.setItem('splitter_position', String(canvasHeight));
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, canvasHeight]);

    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!story) return <div className="p-4 text-center">載入中...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative select-none">
            {/* 故事標題區塊 */}
            <div className="border-b bg-background px-6 py-3">
                <h1 className="text-xl font-bold text-foreground truncate">{story.title || '未命名故事'}</h1>
                {story.description && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground mt-1 truncate cursor-default">
                                    {story.description}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[90vw] sm:max-w-[600px] max-h-[500px] overflow-auto break-words text-base leading-relaxed tracking-wide p-4 rounded-lg">
                                {story.description}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* 畫布區塊 */}
            <div style={{ height: `${canvasHeight}%` }} className="relative overflow-auto border-b border-gray-300">
                <CanvasBoard storyId={storyId} />

                {/* 側欄浮出 */}
                <div
                    ref={sidebarRef}
                    className={`fixed ${isMobile ? 'bottom-0 left-0 w-full h-[70%]' : 'top-16 right-0 w-[300px] h-[calc(100vh-4rem-25%)]'}
            bg-white border shadow-lg z-50 overflow-auto transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : isMobile ? 'translate-y-full' : 'translate-x-full'}`}
                >
                    {isMobile && (
                        <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mt-2" />
                    )}
                    <CharacterSidebar storyId={storyId} />
                </div>
            </div>

            {/* 拖曳分隔線 */}
            <div
                className="h-1 bg-red-400 hover:shadow-inner transition cursor-row-resize relative group"
                onMouseDown={(e) => {
                    if (!isPinned) {
                        setStartY(e.clientY); // 記錄起點
                        setStartHeight(canvasHeight); // 原始高度
                        setIsDragging(true);
                    }
                }}
            >
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full border bg-white/80 hover:bg-white text-xs px-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            const next = !isPinned;
                            setIsPinned(next);
                            localStorage.setItem('is_pinned', String(next));
                        }}
                    >{isPinned ? '📌 已釘選' : '📍 解開中'}</Button>
                </div>
            </div>

            {/* 時間軸區塊 */}
            <div style={{ height: `${100 - canvasHeight}%` }} className="overflow-auto">
                <TimelinePanel storyId={storyId} />
            </div>

            {/* 浮動開啟角色按鈕 */}
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