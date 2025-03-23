'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'stories' | 'shared'>('profile');

    return (
        <div className="flex flex-col items-center p-8 space-y-6 min-h-[600px] bg-muted/40">
            <div className="flex w-full max-w-6xl shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-900 min-h-[500px]">
                {/* 左側選單 */}
                <div className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 space-y-4 border-r h-auto flex-shrink-0 min-h-full">
                    <Button
                        variant={activeTab === 'profile' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('profile')}
                    >
                        個人資料
                    </Button>
                    <Button
                        variant={activeTab === 'stories' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('stories')}
                    >
                        已建立故事
                    </Button>
                    <Button
                        variant={activeTab === 'shared' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('shared')}
                    >
                        已分享故事
                    </Button>
                </div>

                {/* 右側內容 */}
                <div className="w-3/4 p-6 overflow-y-auto max-h-[80vh]">
                    <Card className="w-full shadow-none border-none">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {activeTab === 'profile' && '👤 個人資料'}
                                {activeTab === 'stories' && '📚 已建立故事'}
                                {activeTab === 'shared' && '🌍 已分享故事'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4 text-gray-700 dark:text-gray-300">
                            {activeTab === 'profile' && (
                                <p>這裡顯示使用者的個人資料內容。</p>
                            )}
                            {activeTab === 'stories' && (
                                <p>這裡顯示使用者已建立的故事清單。</p>
                            )}
                            {activeTab === 'shared' && (
                                <p>這裡顯示使用者已分享的故事列表。</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
