// /src/components/story/TimelinePanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { getTimelineByStoryId } from '@/services/timeline.client';
import { TimelineJson } from '@/types/story';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TimelinePanelProps {
    storyId: number;
}

export default function TimelinePanel({ storyId }: TimelinePanelProps) {
    const [timeline, setTimeline] = useState<TimelineJson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [popoverYear, setPopoverYear] = useState<number | null>(null);

    const [newEvent, setNewEvent] = useState({
        title: '',
        content: '',
        month: 1,
        day: 1,
    });

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const data = await getTimelineByStoryId(storyId);
                setTimeline(data.json);
            } catch (err) {
                setError('載入時間軸失敗');
            } finally {
                setLoading(false);
            }
        };

        fetchTimeline();
    }, [storyId]);

    if (loading) return <p className="text-gray-500 p-4">載入中...</p>;
    if (error) return <p className="text-red-500 p-4">{error}</p>;
    if (!timeline) return null;

    const MIN_YEAR = 1000;
    const MAX_YEAR = 2000;
    const TOTAL_SEGMENTS = 10;
    const segmentWidth = (MAX_YEAR - MIN_YEAR) / TOTAL_SEGMENTS;

    const years = Array.from({ length: TOTAL_SEGMENTS + 1 }, (_, i) =>
        Math.round(MIN_YEAR + i * segmentWidth)
    );

    const handleAddEvent = () => {
        if (!timeline || popoverYear === null) return;
        const updated: TimelineJson = {
            ...timeline,
            events: [
                ...timeline.events,
                {
                    year: popoverYear,
                    month: newEvent.month,
                    day: newEvent.day,
                    title: newEvent.title,
                    content: newEvent.content,
                    eraName: '',
                    tags: [],
                },
            ],
        };
        setTimeline(updated);
        setPopoverYear(null);
        setNewEvent({ title: '', content: '', month: 1, day: 1 });
    };

    return (
        <div className="w-full h-full overflow-x-auto bg-white rounded shadow">
            <div className="min-w-fit px-4 py-2">
                {/* 年號背景區段 */}
                <div className="relative mb-4 h-8">
                    {timeline.eras.map((era, index) => {
                        const left = ((era.start.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
                        const width = ((era.end.year - era.start.year + 1) / (MAX_YEAR - MIN_YEAR)) * 100;
                        return (
                            <div
                                key={index}
                                className="absolute top-0 h-8 bg-yellow-100 border border-yellow-400 text-xs flex items-center justify-center"
                                style={{ left: `${left}%`, width: `${width}%` }}
                            >
                                {era.name}
                            </div>
                        );
                    })}
                </div>

                {/* 年度刻度 */}
                <div className="flex space-x-4 border-b pb-1 mb-2">
                    {years.map((year, idx) => (
                        <div key={idx} className="w-[120px] text-center text-sm font-semibold">
                            {year} 年
                        </div>
                    ))}
                </div>

                {/* 事件標記區 + 點擊新增 */}
                <div className="flex space-x-4">
                    {years.slice(0, -1).map((year, idx) => {
                        const nextYear = years[idx + 1];
                        const events = timeline.events.filter(e => e.year >= year && e.year < nextYear);
                        return (
                            <Popover key={idx} open={popoverYear === year} onOpenChange={(open) => setPopoverYear(open ? year : null)}>
                                <PopoverTrigger asChild>
                                    <div className="w-[120px] space-y-2 cursor-pointer">
                                        {events.map((event, i) => (
                                            <details key={i} className="bg-blue-50 border rounded p-1">
                                                <summary className="text-sm font-medium truncate">
                                                    {event.month}月{event.day}日 - {event.title}
                                                </summary>
                                                <div className="text-xs text-gray-600 whitespace-pre-line">
                                                    {event.content}
                                                </div>
                                            </details>
                                        ))}
                                        <div className="text-xs text-center text-gray-400 hover:text-blue-600">＋新增</div>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-700">新增事件：{year} 年</p>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                max={12}
                                                value={newEvent.month}
                                                onChange={(e) => setNewEvent({ ...newEvent, month: Number(e.target.value) })}
                                                placeholder="月"
                                            />
                                            <Input
                                                type="number"
                                                min={1}
                                                max={31}
                                                value={newEvent.day}
                                                onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                                                placeholder="日"
                                            />
                                        </div>
                                        <Input
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            placeholder="標題"
                                        />
                                        <Textarea
                                            value={newEvent.content}
                                            onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                                            placeholder="事件內容"
                                        />
                                        <Button onClick={handleAddEvent} className="w-full">新增事件</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

