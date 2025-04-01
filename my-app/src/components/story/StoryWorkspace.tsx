// /src/components/story/StoryWorkspace.tsx
"use client";

import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import CanvasBoard from './CanvasBoard';
import TimelinePanel from './TimelinePanel';
import CharacterSidebar from './CharacterSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; 
import { getStoryByIdClient } from '@/services/story.client';

interface Props {
    storyId: number;
}

export default function StoryWorkspace({ storyId }: Props) {
    const { token } = useAuth();
    const [story, setStory] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!token) return;
        getStoryByIdClient(storyId, token)
            .then(setStory)
            .catch((err: Error) => {
                console.error('❌ 無法載入故事內容', err);
                setError('找不到故事或無存取權限');
            });
    }, [storyId, token]);

    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!story) return <div className="p-4 text-center">載入中...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-hidden relative">
                    <CanvasBoard />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="absolute top-4 right-2 z-10"
                    >
                        {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </Button>
                </div>
                {isSidebarOpen && <CharacterSidebar />}
            </div>
            <Separator className="my-1" />
            <div className="h-[25%] border-t">
                <TimelinePanel />
            </div>
        </div>
    );
}