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



export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'stories' | 'shared' | 'deleted'>('profile');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { user, setUser } = useAuth();
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



    // 取得個人資料
    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setName(user.name || '');
            setLoading(false);
        } else {
            async function fetchProfile() {
                try {
                    const { data } = await getProfile();
                    setEmail(data.email);
                    setName(data.name);
                    setUser({
                        id: data.id,
                        name: data.name,
                        email: data.email,
                    });
                } catch (err) {
                    toast.error('無法取得個人資料，請重新登入或稍後再試');
                } finally {
                    setLoading(false);
                }
            }
            fetchProfile();
        }
    }, [user, setUser]);

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
        setIsDialogOpen(true);
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
                setStories(shared);
            } catch (err) { }
            finally {
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
                open={isDialogOpen}
                setOpen={setIsDialogOpen}
                onVerified={handleVerified}
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
                        <Button
                            variant={activeTab === 'deleted' ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => setActiveTab('deleted')}>
                            已刪除故事
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
                                    {activeTab === 'deleted' && '🗑️ 已刪除故事'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="mt-4 text-gray-700 dark:text-gray-300">
                                {/* 個人資料 */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-4">
                                        {loading ? (
                                            <p>載入中...</p>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block mb-2">Email</label>
                                                    <Input
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-2">名稱</label>
                                                    <Input
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleUpdateClick}
                                                    className="mt-4"
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? '儲存中...' : '更新資料'}
                                                </Button>
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
                                        ) : stories.length === 0 ? (
                                            <p>尚未分享任何故事。</p>
                                        ) : (
                                            stories.map((story) => (
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
        </>
    );
}
