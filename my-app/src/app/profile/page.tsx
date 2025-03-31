'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getProfile, updateProfile, getStories, deleteStory, getDeletedStories, DeletedStoryResponse, getSharedStories, restoreStory } from '@/services/auth';
import { useAuth } from '../../context/AuthContext';
import { useStory } from '../../context/StoryContext';
import ConfirmPasswordDialog from '@/components/dialogs/ConfirmPasswordDialog';
import { Trash2, Undo2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import Link from 'next/link'
import { deleteAccount } from '@/services/auth';
import { StoryResponse } from '@/types/story';

/// 判斷是更新個人資料還是刪除帳號
type PasswordPurpose = 'updateProfile' | 'deleteAccount' | null;


export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'stories' | 'shared' | 'deleted'>('profile');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user, token, setUser } = useAuth();
    const { stories, setStories, storyLoading, setStoryLoading } = useStory();
    const [deletedStories, setDeletedStories] = useState<DeletedStoryResponse[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [expandedStoryIds, setExpandedStoryIds] = useState<number[]>([]);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmDescription, setConfirmDescription] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => { });
    const [sharedStories, setSharedStories] = useState<StoryResponse[]>([]);
    const [confirmPurpose, setConfirmPurpose] = useState<PasswordPurpose>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    useEffect(() => {
        let isMounted = true;

        async function loadUserProfile() {
            if (!token) {
                setLoading(false);
                return; // ✅ 未登入就不呼叫 API
            }

            try {
                const { data } = await getProfile();

                if (isMounted) {
                    setEmail(data.email);
                    setName(data.name);

                    // 同步更新到 AuthContext（如果還沒設定）
                    if (!user || !user.email) {
                        setUser({
                            id: data.id,
                            name: data.name,
                            email: data.email,
                        });
                    }
                }
            } catch (err) {
                if (isMounted) {
                    // ✅ 僅在登入狀態才顯示錯誤
                    if (token) {
                        toast.error('無法取得個人資料，請重新登入或稍後再試');
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadUserProfile();

        return () => {
            isMounted = false;
        };
    }, [token, user, setUser]);


    // 密碼驗證成功後觸發
    const handleVerified = async () => {
        setIsDialogOpen(false);
        setIsVerified(true);
    };

    // 更新個人資料
    useEffect(() => {
        async function updateProfileData() {
            setIsSaving(true);
            try {
                const { data } = await updateProfile({ email, name });
                toast.success(data.message || '更新成功');
                setUser({
                    ...user!,
                    name,
                    email,
                });
            } catch (err) {
                toast.error('更新失敗，請稍後再試');
            } finally {
                setIsSaving(false);
                setIsVerified(false); // 重置
            }
        }

        if (isVerified) {
            updateProfileData();
        }
    }, [isVerified, email, name, setUser, user]);

    // 點擊更新資料按鈕
    const handleUpdateClick = () => {
        setConfirmPurpose('updateProfile');
    };

    // 取得故事
    useEffect(() => {
        if (activeTab !== 'stories') return;

        async function fetchStories() {
            setStoryLoading(true);
            try {
                const { data } = await getStories();
                const sortedStories = data.sort((a, b) => a.id - b.id);
                setStories(sortedStories);
                console.log('取得故事成功：', data);
            } catch (err: any) {
                const message = err.response?.data?.message || '取得故事失敗，請稍後再試';
                toast.error(message);
            } finally {
                setStoryLoading(false);
            }
        }

        fetchStories();
    }, [activeTab, setStories, setStoryLoading]);

    // 取得已分享故事
    useEffect(() => {
        if (activeTab !== 'shared') return;

        const fetchSharedStories = async () => {
            setStoryLoading(true);
            try {
                const shared = await getSharedStories();
                console.log('分享故事回傳：', shared);
                setSharedStories(shared);
            } catch (err) {
                toast.error("取得分享故事失敗");
            } finally {
                setStoryLoading(false);
            }
        };

        fetchSharedStories();
    }, [activeTab]);


    // 取得已刪除故事
    useEffect(() => {
        if (activeTab !== "deleted") return;

        async function fetchDeletedStories() {
            setDeletedLoading(true);
            try {
                const { data } = await getDeletedStories();
                const sorted = data.sort((a, b) => a.id - b.id);
                setDeletedStories(sorted);
            } catch (err: any) {
                if (err?.response?.status >= 400) {
                    const msg = err.response?.data?.message || "取得刪除故事失敗";
                    toast.error(msg);
                }
            } finally {
                setDeletedLoading(false);
            }
        }

        fetchDeletedStories();
    }, [activeTab]);

    return (
        <>
            <ConfirmPasswordDialog
                open={confirmPurpose !== null}
                setOpen={(open) => {
                    if (!open) setConfirmPurpose(null);
                }}
                onVerified={async () => {
                    if (confirmPurpose === 'updateProfile') {
                        try {
                            const { data } = await updateProfile({ email, name });
                            toast.success(data.message || '更新成功');
                            setUser({
                                ...user!,
                                name,
                                email,
                            });
                        } catch (err) {
                            toast.error('更新失敗，請稍後再試');
                        } finally {
                            setConfirmPurpose(null);
                        }
                    } else if (confirmPurpose === 'deleteAccount') {
                        try {
                            await deleteAccount();
                            toast.success('帳號已標記刪除，系統將在 30 天後永久刪除');
                            setIsLoggingOut(true);
                            // 延遲 3 秒後登出
                            setTimeout(() => {
                                setUser(null);
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                window.location.href = '/';
                            }, 3000); // 延遲 3 秒
                        } catch (err) {
                            toast.error('刪除帳號失敗，請稍後再試');
                        } finally {
                            setConfirmPurpose(null);
                        }
                    }
                }}
            />

            <ConfirmDialog
                open={confirmOpen}
                title={confirmTitle}
                description={confirmDescription}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={() => {
                    onConfirmAction();
                    setConfirmOpen(false);
                }}
            />
            <div className="flex flex-col items-center p-4 bg-muted/40 min-h-screen pb-24">
                <div className="flex flex-col lg:flex-row w-full max-w-6xl h-[calc(100vh-120px)] lg:h-[700px] shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                    {/* 左側選單：上半按鈕 + 底部刪除帳號 */}
                    <div className="w-full lg:w-1/4 bg-gray-100 dark:bg-gray-800 p-4 border-r flex flex-col justify-between">
                        {/* 上半選單按鈕 */}
                        <div className="space-y-4">
                            <Button
                                variant={activeTab === 'profile' ? 'default' : 'outline'}
                                className="w-full justify-center"
                                onClick={() => setActiveTab('profile')}
                            >
                                個人資料
                            </Button>
                            <Button
                                variant={activeTab === 'stories' ? 'default' : 'outline'}
                                className="w-full justify-center"
                                onClick={() => setActiveTab('stories')}
                            >
                                已建立故事
                            </Button>
                            <Button
                                variant={activeTab === 'shared' ? 'default' : 'outline'}
                                className="w-full justify-center"
                                onClick={() => setActiveTab('shared')}
                            >
                                已分享故事
                            </Button>

                        </div>
                    </div>


                    {/* 右側內容 */}
                    <div className="w-full lg:w-3/4 p-6 overflow-y-auto h-full">
                        <Card className="w-full shadow-none border-none flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {activeTab === 'profile' && '👤 個人資料'}
                                    {activeTab === 'stories' && '📚 已建立故事'}
                                    {activeTab === 'shared' && '🌍 已分享故事'}
                                    {activeTab === 'deleted' && '🗑️ 已刪除故事'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="mt-4 text-gray-700 dark:text-gray-300 flex flex-col h-full">
                                {/* 個人資料 */}
                                {activeTab === 'profile' && (
                                    <div className="flex flex-col h-full">
                                        {loading ? (
                                            <p>載入中...</p>
                                        ) : (
                                            <>
                                                {/* 表單欄位 */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block mb-2">Email</label>
                                                        <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} />
                                                    </div>
                                                    <div>
                                                        <label className="block mb-2">名稱</label>
                                                        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
                                                    </div>
                                                    <Button onClick={handleUpdateClick} className="mt-4" disabled={isSaving}>
                                                        {isSaving ? '儲存中...' : '更新資料'}
                                                    </Button>
                                                </div>

                                                {/* 資料操作區塊 */}
                                                <div className="space-y-2 mt-auto pt-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        ⚠️ 資料操作：查看刪除的故事或刪除整個帳號。
                                                    </p>
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        {/* 已刪除故事 */}
                                                        <Button
                                                            variant="outline"
                                                            className="w-full md:w-1/2 justify-center"
                                                            onClick={() => setActiveTab('deleted')}
                                                        >
                                                            已刪除故事
                                                        </Button>

                                                        {/* 刪除帳號 */}
                                                        <Button
                                                            variant="destructive"
                                                            className="w-full md:w-1/2 justify-center"
                                                            onClick={() => {
                                                                setConfirmTitle('確認刪除帳號');
                                                                setConfirmDescription('刪除帳號後將立即登出，30 天內可復原，確定要繼續嗎？');
                                                                setOnConfirmAction(() => () => {
                                                                    setConfirmOpen(false);
                                                                    setConfirmPurpose('deleteAccount');
                                                                });
                                                                setConfirmOpen(true);
                                                            }}
                                                        >
                                                            刪除帳號
                                                        </Button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* 已建立故事 */}
                                {activeTab === 'stories' && (
                                    <div className="space-y-4">
                                        {storyLoading ? (
                                            <p>載入中...</p>
                                        ) : stories.length === 0 ? (
                                            <p>尚未建立故事。</p>
                                        ) : (
                                            stories.map((story) => {
                                                const isExpanded = expandedStoryIds.includes(story.id);
                                                return (
                                                    <Card key={story.id} className="border p-4 relative">
                                                        <Button
                                                            variant="ghost"
                                                            className="absolute top-2 right-2 text-red-500"
                                                            size="sm"
                                                            onClick={async () => {
                                                                setConfirmTitle('確認刪除故事');
                                                                setConfirmDescription('確定要刪除這個故事嗎？刪除後 30 天內可還原');
                                                                setOnConfirmAction(() => async () => {
                                                                    try {
                                                                        await deleteStory(Number(story.id));
                                                                        setStories(stories.filter((s) => s.id !== story.id));
                                                                        toast.success('故事已刪除');
                                                                    } catch (err: any) {
                                                                        toast.error('刪除故事失敗');
                                                                    }
                                                                });
                                                                setConfirmOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                        <h3 className="font-bold">{story.title}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {isExpanded
                                                                ? story.description || '（無描述）'
                                                                : (story.description || '（無描述）').slice(0, 50) +
                                                                (story.description &&
                                                                    story.description.length > 50
                                                                    ? '...'
                                                                    : '')}
                                                        </p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <p className="text-xs">
                                                                {story.isPublic ? '🌐 公開故事' : '🔒 私人故事'} | 建立於{' '}
                                                                {new Date(story.createdAt).toLocaleString()}
                                                            </p>
                                                            <Button
                                                                variant="link"
                                                                className="p-0 text-blue-500"
                                                                onClick={() => {
                                                                    if (isExpanded) {
                                                                        setExpandedStoryIds(
                                                                            expandedStoryIds.filter((id) => id !== story.id)
                                                                        );
                                                                    } else {
                                                                        setExpandedStoryIds([
                                                                            ...expandedStoryIds,
                                                                            story.id,
                                                                        ]);
                                                                    }
                                                                }}
                                                            >
                                                                <Link
                                                                    href={`/story/${story.id}`}
                                                                    className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                                                                >
                                                                    詳細內容
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {/* 已分享故事 */}
                                {activeTab === 'shared' && (
                                    <div className="space-y-4">
                                        {storyLoading ? (
                                            <p>載入中...</p>
                                        ) : sharedStories.length === 0 ? (
                                            <p>尚未分享任何故事。</p>
                                        ) : (
                                            sharedStories.map((story) => (
                                                <Card key={story.id} className="border p-4 relative">
                                                    <h3 className="font-bold">{story.title}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {story.description || '（無描述）'}
                                                    </p>
                                                    <p className="text-xs mt-2">
                                                        建立時間：{new Date(story.createdAt).toLocaleString()}
                                                    </p>
                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        {story.creatorId === user?.id ? (
                                                            story.sharedUsers && story.sharedUsers.length > 0 ? (
                                                                <>
                                                                    您分享給以下使用者：
                                                                    <ul className="list-disc list-inside">
                                                                        {story.sharedUsers.map((u, index) => (
                                                                            <li key={index}>
                                                                                {u.name}（{u.email}）
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            ) : (
                                                                <p>尚未分享給任何人</p>
                                                            )
                                                        ) : (
                                                            <p>由 {story.creatorName || '（未知建立者）'}（{story.creatorEmail || '未知 Email'}） 分享給您</p>
                                                        )}
                                                    </div>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* 已刪除故事 */}
                                {activeTab === 'deleted' && (
                                    <div className="space-y-4">
                                        {deletedLoading ? (
                                            <p>載入中...</p>
                                        ) : deletedStories.length === 0 ? (
                                            <p>沒有刪除的故事。</p>
                                        ) : (
                                            deletedStories.map((story) => (
                                                <Card key={story.id} className="border p-4 relative">
                                                    <Button
                                                        variant="ghost"
                                                        className="absolute top-2 right-2 text-blue-500"
                                                        size="sm"
                                                        onClick={async () => {
                                                            setConfirmTitle('確認還原故事');
                                                            setConfirmDescription('確定要還原這個故事嗎？還原後若要刪除需再等 30 天');
                                                            setOnConfirmAction(() => async () => {
                                                                try {
                                                                    await restoreStory(Number(story.id));
                                                                    setDeletedStories(deletedStories.filter((s) => s.id !== story.id));
                                                                    toast.success('故事已還原');

                                                                } catch (err: any) {
                                                                    toast.error('還原故事失敗');
                                                                }
                                                            });
                                                            setConfirmOpen(true);

                                                        }}
                                                    >
                                                        <Undo2 size={16} />
                                                    </Button>
                                                    <h3 className="font-bold">{story.title}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {story.description || '（無描述）'}
                                                    </p>
                                                    <p className="text-xs mt-2">刪除時間：{story.deletedAt ? new Date(story.deletedAt).toLocaleString() : 'N/A'}</p>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {
                isLoggingOut && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-xl border dark:border-gray-600 text-center">
                            ⏳ 正在登出中，請稍候...
                        </div>
                    </div>
                )
            }
        </>
    );
}
