// /src/components/story/CanvasBoard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { getCanvas, saveCanvas } from '@/services/canvas.client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface Props {
    storyId: number;
}

interface Stroke {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export default function CanvasBoard({ storyId }: Props) {
    const { token } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasData, setCanvasData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lastModified, setLastModified] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const color = '#000000';
    const lineWidth = 2;

    useEffect(() => {
        if (!token) return;
        getCanvas(storyId)
            .then((res) => {
                setCanvasData(res.json);
                setLastModified(res.lastModified);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    console.warn('⚠️ Canvas 資料不存在，初始化空畫布');
                    setCanvasData({
                        strokes: [],
                        images: [],
                        markers: [],
                        canvasMeta: { width: 1920, height: 1080, scrollX: 0, scrollY: 0 },
                    });
                    setLastModified(null);
                } else {
                    console.error('❌ 載入 Canvas 失敗', err);
                }
            });
    }, [storyId, token]);

    useEffect(() => {
        if (!canvasData || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // 重畫所有 stroke
        (canvasData.strokes || []).forEach((stroke: Stroke) => {
            if (stroke.points.length < 2) return;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        });
    }, [canvasData]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const rect = canvasRef.current!.getBoundingClientRect();
        const newStroke: Stroke = {
            points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
            color,
            width: lineWidth,
        };
        setCurrentStroke(newStroke);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentStroke) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const newPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, newPoint],
        };
        setCurrentStroke(updatedStroke);

        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = currentStroke.color;
            ctx.lineWidth = currentStroke.width;
            ctx.beginPath();
            const pts = updatedStroke.points;
            ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.stroke();
        }
    };

    const handleMouseUp = () => {
        if (currentStroke) {
            setCanvasData((prev: any) => ({
                ...prev,
                strokes: [...(prev?.strokes || []), currentStroke],
            }));
        }
        setIsDrawing(false);
        setCurrentStroke(null);
    };

    const handleSave = async () => {
        try {
            await saveCanvas(storyId, canvasData);
            alert('✅ Canvas 儲存成功');
        } catch (err) {
            alert('❌ Canvas 儲存失敗');
            console.error(err);
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">🕒 最後修改：{lastModified || '無'}</span>
                <Button onClick={handleSave}>儲存畫布</Button>
            </div>
            <canvas
                ref={canvasRef}
                width={canvasData?.canvasMeta?.width || 800}
                height={canvasData?.canvasMeta?.height || 600}
                className="border rounded bg-white"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
}
