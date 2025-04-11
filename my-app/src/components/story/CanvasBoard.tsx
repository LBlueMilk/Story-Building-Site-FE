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
    const containerRef = useRef<HTMLDivElement>(null);

    const [canvasData, setCanvasData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lastModified, setLastModified] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [scale, setScale] = useState(1);

    const color = '#000000';
    const lineWidth = 2;
    const canvasWidth = 1920;
    const canvasHeight = 1080;

    // 偵測容器寬度，自動調整縮放
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newScale = containerWidth / canvasWidth;
                setScale(newScale);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // 載入資料
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
                        canvasMeta: { width: canvasWidth, height: canvasHeight },
                    });
                } else {
                    console.error('❌ 載入 Canvas 失敗', err);
                }
            });
    }, [storyId, token]);

    // 重繪畫布
    useEffect(() => {
        if (!canvasRef.current || !canvasData) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const { x, y } = getMousePos(e);
        setCurrentStroke({
            points: [{ x, y }],
            color,
            width: lineWidth,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStroke || !canvasRef.current) return;
        const { x, y } = getMousePos(e);
        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, { x, y }],
        };
        setCurrentStroke(updatedStroke);

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = updatedStroke.color;
            ctx.lineWidth = updatedStroke.width;
            ctx.beginPath();
            const pts = updatedStroke.points;
            if (pts.length >= 2) {
                ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
                ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
                ctx.stroke();
            }
        }
    };


    const handleMouseUp = () => {
        if (currentStroke && currentStroke.points.length > 1) {
            setCanvasData((prev: any) => ({
                ...prev,
                strokes: [...(prev?.strokes || []), currentStroke],
            }));
        }
        setIsDrawing(false);
        setCurrentStroke(null);
    };


    const handleSave = async () => {
        if (!canvasData) return;

        try {
            setLoading(true);
            await saveCanvas(storyId, canvasData);
            alert('✅ Canvas 儲存成功');
        } catch (err) {
            alert('❌ Canvas 儲存失敗');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-100px)] flex flex-col overflow-hidden" ref={containerRef}>
            <div className="flex items-center justify-between p-2 border-b bg-white z-10">
                <span className="text-sm text-gray-500">🕒 最後修改：{lastModified || '無'}</span>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? '儲存中...' : '儲存畫布'}
                </Button>
            </div>

            <div className="flex-1 bg-[#f9f9f9] relative">
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        width={canvasWidth}
                        height={canvasHeight}
                        className="bg-white cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>
            </div>
        </div>
    );
}
