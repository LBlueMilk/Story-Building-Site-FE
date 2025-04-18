// /src/components/story/TimelinePanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { getTimelineByStoryId, saveTimelineByStoryId } from '@/services/timeline.client';
import { TimelineJson, TimelineEvent } from '@/types/story';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
    AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';


interface TimelinePanelProps {
    storyId: number;
}

export default function TimelinePanel({ storyId }: TimelinePanelProps) {
    const [timeline, setTimeline] = useState<TimelineJson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [popoverYear, setPopoverYear] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [editingDialogOpen, setEditingDialogOpen] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editedEvent, setEditedEvent] = useState<TimelineEvent | null>(null);

    const [newEvent, setNewEvent] = useState({ title: '', content: '', month: '', day: '', eraName: '', tags: [] as string[], });

    const [eraDialogOpen, setEraDialogOpen] = useState(false);
    const [newEra, setNewEra] = useState({ name: '', startYear: '', startMonth: '', endYear: '', endMonth: '' });

    const [editingEraIndex, setEditingEraIndex] = useState<number | null>(null);
    const [editingEra, setEditingEra] = useState(newEra);
    const [editingEraDialogOpen, setEditingEraDialogOpen] = useState(false);


    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const data = await getTimelineByStoryId(storyId);
                setTimeline(data.json);
            } catch {
                setError('載入時間軸失敗');
            } finally {
                setLoading(false);
            }
        };
        fetchTimeline();
    }, [storyId]);

    const MIN_YEAR = 1000;
    const MAX_YEAR = 2000;
    const TOTAL_SEGMENTS = 10;
    const segmentWidth = (MAX_YEAR - MIN_YEAR) / TOTAL_SEGMENTS;
    const years = Array.from({ length: TOTAL_SEGMENTS + 1 }, (_, i) => Math.round(MIN_YEAR + i * segmentWidth));

    const handleAddEvent = async () => {
        if (!timeline || popoverYear === null) return;
        const updated: TimelineJson = {
            ...timeline,
            events: [...timeline.events, {
                id: uuidv4(),
                year: popoverYear,
                month: newEvent.month,
                day: newEvent.day,
                title: newEvent.title,
                content: newEvent.content,
                eraName: newEvent.eraName,
                tags: [],
            }],
        };
        setSaving(true);
        try {
            await saveTimelineByStoryId(storyId, updated);
            setTimeline(updated);
            toast.success('事件已儲存');
        } catch {
            toast.error('儲存失敗');
        } finally {
            setSaving(false);
            setPopoverYear(null);
            setNewEvent({ title: '', content: '', month: '', day: '', eraName: '', tags: [] as string[] });
        }
    };

    const handleAddEra = async () => {
        if (!timeline) return;

        const startY = parseInt(newEra.startYear);
        const startM = parseInt(newEra.startMonth);
        const endY = parseInt(newEra.endYear);
        const endM = parseInt(newEra.endMonth);

        if (!newEra.name || isNaN(startY) || isNaN(startM) || isNaN(endY) || isNaN(endM)) {
            toast.error('請輸入完整資料');
            return;
        }

        if (endY < startY || (endY === startY && endM < startM)) {
            toast.error('結束時間不可早於開始時間');
            return;
        }

        const conflict = timeline.eras?.some(e =>
            !(endY < e.start.year || startY > e.end.year)
        );
        if (conflict) {
            toast.error('與現有年號區段重疊');
            return;
        }

        const newEraObj = {
            name: newEra.name,
            start: { year: startY, month: startM },
            end: { year: endY, month: endM }
        };

        const updated: TimelineJson = {
            ...timeline,
            eras: [...(timeline.eras || []), newEraObj],
        };

        setSaving(true);
        try {
            await saveTimelineByStoryId(storyId, updated);
            setTimeline(updated);
            toast.success('年號區段已新增');
            setEraDialogOpen(false);
            setNewEra({ name: '', startYear: '', startMonth: '', endYear: '', endMonth: '' });
        } catch {
            toast.error('新增失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!timeline || !editingEventId || !editedEvent) return;
        const updatedEvents = timeline.events.map(e =>
            e.id === editingEventId ? editedEvent : e
        );
        const updated: TimelineJson = { ...timeline, events: updatedEvents };
        setSaving(true);
        try {
            await saveTimelineByStoryId(storyId, updated);
            setTimeline(updated);
            toast.success('事件已更新');
        } catch {
            toast.error('更新失敗');
        } finally {
            setSaving(false);
            setIsEditingMode(false);
            setEditingDialogOpen(true);
            setEditedEvent({ ...editedEvent });
        }
    };

    const handleSaveEditedEra = async () => {
        if (editingEraIndex === null || !timeline) return;
        const updatedEras = [...(timeline.eras || [])];
        updatedEras[editingEraIndex] = {
            name: editingEra.name,
            start: { year: parseInt(editingEra.startYear), month: parseInt(editingEra.startMonth) },
            end: { year: parseInt(editingEra.endYear), month: parseInt(editingEra.endMonth) },
        };
        const updated: TimelineJson = { ...timeline, eras: updatedEras };
        setSaving(true);
        try {
            await saveTimelineByStoryId(storyId, updated);
            setTimeline(updated);
            toast.success('年號已更新');
            setEditingEraDialogOpen(false);
        } catch {
            toast.error('更新失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEra = async () => {
        if (editingEraIndex === null || !timeline) return;
        const updated: TimelineJson = {
            ...timeline,
            eras: timeline.eras?.filter((_, i) => i !== editingEraIndex) || [],
        };
        setSaving(true);
        try {
            await saveTimelineByStoryId(storyId, updated);
            setTimeline(updated);
            toast.success('年號已刪除');
            setEditingEraDialogOpen(false);
        } catch {
            toast.error('刪除失敗');
        } finally {
            setSaving(false);
        }
    };


    if (loading) return <p className="text-gray-500 p-4">載入中...</p>;
    if (error) return <p className="text-red-500 p-4">{error}</p>;
    if (!timeline) return null;

    return (
        <div className="w-full h-full overflow-x-auto bg-white rounded shadow">
            {/* 年號編輯 Dialog */}
            <Dialog open={editingEraDialogOpen} onOpenChange={setEditingEraDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>編輯年號區段</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input value={editingEra.name} onChange={e => setEditingEra({ ...editingEra, name: e.target.value })} placeholder="年號名稱" />
                        <div className="flex gap-2">
                            <Input value={editingEra.startYear} onChange={e => setEditingEra({ ...editingEra, startYear: e.target.value })} placeholder="起始年" />
                            <Input value={editingEra.startMonth} onChange={e => setEditingEra({ ...editingEra, startMonth: e.target.value })} placeholder="起始月" />
                        </div>
                        <div className="flex gap-2">
                            <Input value={editingEra.endYear} onChange={e => setEditingEra({ ...editingEra, endYear: e.target.value })} placeholder="結束年" />
                            <Input value={editingEra.endMonth} onChange={e => setEditingEra({ ...editingEra, endMonth: e.target.value })} placeholder="結束月" />
                        </div>
                        <div className="flex justify-between">
                            <Button variant="destructive" onClick={handleDeleteEra} disabled={saving}>刪除</Button>
                            <Button onClick={handleSaveEditedEra} disabled={saving}>{saving ? '儲存中...' : '儲存'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 年號新增 Dialog */}
            <Dialog open={eraDialogOpen} onOpenChange={setEraDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>新增年號區段</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input value={newEra.name} onChange={e => setNewEra({ ...newEra, name: e.target.value })} placeholder="年號名稱" />
                        <div className="flex gap-2">
                            <Input value={newEra.startYear} onChange={e => setNewEra({ ...newEra, startYear: e.target.value })} placeholder="起始年" />
                            <Input value={newEra.startMonth} onChange={e => setNewEra({ ...newEra, startMonth: e.target.value })} placeholder="起始月" />
                        </div>
                        <div className="flex gap-2">
                            <Input value={newEra.endYear} onChange={e => setNewEra({ ...newEra, endYear: e.target.value })} placeholder="結束年" />
                            <Input value={newEra.endMonth} onChange={e => setNewEra({ ...newEra, endMonth: e.target.value })} placeholder="結束月" />
                        </div>
                        <Button onClick={handleAddEra} disabled={saving}>
                            {saving ? '儲存中...' : '新增年號'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 事件編輯 Dialog */}
            <Dialog open={editingDialogOpen} onOpenChange={(open) => {
                setEditingDialogOpen(open);
                if (!open) {
                    setEditingEventId(null);
                    setEditedEvent(null);
                    setIsEditingMode(false);
                }
            }}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditingMode ? '編輯事件' : '事件詳情'}</DialogTitle>
                        <DialogDescription>
                            {isEditingMode ? '請修改事件資訊，並按下儲存' : '查看事件內容，點擊下方按鈕開始編輯'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input disabled={!isEditingMode} value={editedEvent?.title || ''} onChange={(e) => setEditedEvent({ ...editedEvent!, title: e.target.value })} placeholder="標題" />
                        <Input
                            disabled={!isEditingMode}
                            value={editedEvent?.eraName || ''}
                            onChange={(e) => setEditedEvent({ ...editedEvent!, eraName: e.target.value })}
                            placeholder="年號"
                        />
                        <Textarea disabled={!isEditingMode} value={editedEvent?.content || ''} onChange={(e) => setEditedEvent({ ...editedEvent!, content: e.target.value })} placeholder="內容" />
                        <div className="flex gap-2">
                            <Input
                                disabled={!isEditingMode}
                                value={editedEvent?.month || ''}
                                onChange={(e) => setEditedEvent({ ...editedEvent!, month: e.target.value })}
                                placeholder="月"
                            />
                            <Input
                                disabled={!isEditingMode}
                                value={editedEvent?.day || ''}
                                onChange={(e) => setEditedEvent({ ...editedEvent!, day: e.target.value })}
                                placeholder="日"
                            />
                        </div>
                        <Input disabled={!isEditingMode} value={editedEvent?.tags?.join(',') || ''} onChange={(e) => setEditedEvent({ ...editedEvent!, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="標籤（用頓號分隔）" />
                    </div>
                    <DialogFooter className="mt-4 flex items-center justify-between">
                        {isEditingMode ? (
                            <>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">🗑 刪除</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>確定要刪除這個事件嗎？</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                此操作無法還原，事件刪除後將永久消失。
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>取消</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                                onClick={async () => {
                                                    if (!timeline || !editingEventId) return;
                                                    const updated: TimelineJson = {
                                                        ...timeline,
                                                        events: timeline.events.filter(e => e.id !== editingEventId),
                                                    };
                                                    setSaving(true);
                                                    try {
                                                        await saveTimelineByStoryId(storyId, updated);
                                                        setTimeline(updated);
                                                        toast.success('事件已刪除');
                                                        setEditingDialogOpen(false);
                                                    } catch {
                                                        toast.error('刪除失敗');
                                                    } finally {
                                                        setSaving(false);
                                                    }
                                                }}
                                            >
                                                確認刪除
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <div className="flex gap-2 ml-auto">
                                    <Button onClick={handleSaveEdit} disabled={saving}>
                                        {saving ? '儲存中...' : '儲存'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setEditingDialogOpen(false)}>關閉</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div />
                                <div className="flex gap-2">
                                    <Button onClick={() => setIsEditingMode(true)}>✏ 編輯</Button>
                                    <Button variant="ghost" onClick={() => setEditingDialogOpen(false)}>關閉</Button>
                                </div>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 新增年號按鈕 */}
            <div className="flex my-2 px-2">
                <Button size="sm" variant="outline" onClick={() => setEraDialogOpen(true)}>
                    ➕ 新增年號區段
                </Button>
            </div>

            <div className="min-w-fit px-4 py-2">
                {/* 年號區段列 */}
                <div className="relative mb-4 h-8 border-b">
                    {timeline.eras.map((era, index) => {
                        const left = ((era.start.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
                        const width = ((era.end.year - era.start.year + 1) / (MAX_YEAR - MIN_YEAR)) * 100;
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    setEditingEraIndex(index);
                                    setEditingEra({
                                        name: era.name,
                                        startYear: era.start.year.toString(),
                                        startMonth: era.start.month.toString(),
                                        endYear: era.end.year.toString(),
                                        endMonth: era.end.month.toString(),
                                    });
                                    setEditingEraDialogOpen(true);
                                }}
                                className="absolute top-0 h-8 bg-yellow-100 border border-yellow-400 text-xs flex items-center justify-center px-2 cursor-pointer hover:bg-yellow-200 transition"
                                style={{ left: `${left}%`, width: `${width}%` }}
                            >
                                {era.name}
                            </div>
                        );
                    })}
                </div>



                {/* 年度分隔列 */}
                <div className="flex space-x-4 border-b pb-1 mb-2 px-2">
                    {years.map((year, idx) => (
                        <div key={idx} className="w-[120px] text-center text-sm font-semibold">{year} 年</div>
                    ))}
                </div>


                {/* 每年對應事件列表 */}
                <div className="flex space-x-4 px-2">
                    {years.slice(0, -1).map((year, idx) => {
                        const nextYear = years[idx + 1];
                        const events = timeline.events.filter(e => e.year >= year && e.year < nextYear);
                        return (
                            <div key={idx} className="w-[120px] space-y-2">
                                {events.map(event => (
                                    <details key={event.id} className="bg-blue-50 border rounded p-2">
                                        <summary className="text-sm font-medium truncate cursor-pointer">
                                            {event.month && event.day ? `${event.month}月${event.day}日 - ` : ''}
                                            {event.title || '（無標題）'}
                                            {event.eraName ? `（${event.eraName}）` : ''}
                                        </summary>
                                        <div className="text-xs text-gray-600 whitespace-pre-line cursor-pointer mt-2"
                                            onClick={() => {
                                                setEditingEventId(event.id);
                                                setEditedEvent({ ...event });
                                                setEditingDialogOpen(true);
                                                setIsEditingMode(false);
                                            }}>
                                            {event.content || '（無內容）'}
                                            {Array.isArray(event.tags) && event.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {event.tags.map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                ))}
                                <Popover open={popoverYear === year} onOpenChange={(open) => setPopoverYear(open ? year : null)}>
                                    <PopoverTrigger asChild>
                                        <div className="text-xs text-center text-gray-400 hover:text-blue-600 cursor-pointer">＋新增</div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">新增事件：{year} 年</p>
                                            <div className="flex gap-2">
                                                <Input value={newEvent.month} onChange={e => setNewEvent({ ...newEvent, month: e.target.value })} placeholder="月" />
                                                <Input value={newEvent.day} onChange={e => setNewEvent({ ...newEvent, day: e.target.value })} placeholder="日" />
                                            </div>
                                            <Input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="標題" />
                                            <Input value={newEvent.eraName} onChange={e => setNewEvent({ ...newEvent, eraName: e.target.value })} placeholder="年號" />
                                            <Textarea value={newEvent.content} onChange={e => setNewEvent({ ...newEvent, content: e.target.value })} placeholder="事件內容" />
                                            <Button onClick={handleAddEvent} className="w-full" disabled={saving}>
                                                {saving ? '儲存中...' : '新增事件'}
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
