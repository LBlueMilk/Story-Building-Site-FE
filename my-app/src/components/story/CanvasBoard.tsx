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
    const containerRef = useRef<HTMLDivElement>(null);

    const [canvasData, setCanvasData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lastModified, setLastModified] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    const [scale, setScale] = useState(1);
    const [minScale, setMinScale] = useState(0.1);

    const color = '#000000';
    const lineWidth = 2;
    const hasInitScale = useRef(false);

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

    // 動態縮放與繪圖
    useEffect(() => {
        if (!canvasData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rawWidth = canvasData.canvasMeta?.width || 800;
        const rawHeight = canvasData.canvasMeta?.height || 600;

        canvas.width = rawWidth * scale;
        canvas.height = rawHeight * scale;

        canvas.style.width = `${rawWidth * scale}px`;
        canvas.style.height = `${rawHeight * scale}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.clearRect(0, 0, rawWidth, rawHeight);

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
    }, [canvasData, scale]);

    // 畫布滾動縮放
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            const delta = e.deltaY;
            const zoomIntensity = 0.001;
            const newScale = scale - delta * zoomIntensity;
            const clampedScale = Math.min(2, Math.max(minScale, newScale));

            if (clampedScale === scale) return;

            const containerRect = container.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;
            const mouseY = e.clientY - containerRect.top;

            const scrollX = container.scrollLeft;
            const scrollY = container.scrollTop;

            const offsetX = mouseX + scrollX;
            const offsetY = mouseY + scrollY;

            const zoomFactor = clampedScale / scale;

            container.scrollLeft = offsetX * zoomFactor - mouseX;
            container.scrollTop = offsetY * zoomFactor - mouseY;

            setScale(clampedScale);
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [scale, minScale]);

    // 計算最小縮放比例
    useEffect(() => {
        if (!canvasData || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const rawWidth = canvasData.canvasMeta?.width || 800;
        const rawHeight = canvasData.canvasMeta?.height || 600;

        const min = Math.min(1, containerWidth / rawWidth, containerHeight / rawHeight);
        setMinScale(min);
        if (!hasInitScale.current) {
            setScale(min); // 僅第一次設定
            hasInitScale.current = true;
        }
    }, [canvasData]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        setIsDrawing(true);

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const newStroke: Stroke = {
            points: [{ x, y }],
            color,
            width: lineWidth,
        };
        setCurrentStroke(newStroke);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStroke || !canvasRef.current) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const newPoint = { x, y };
        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, newPoint],
        };
        setCurrentStroke(updatedStroke);

        const ctx = canvasRef.current.getContext('2d');
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
        <div className="p-4 h-full overflow-y-scroll scrollbar-thin bg-slate-50 rounded-lg shadow-inner">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">🕒 最後修改：{lastModified || '無'}</span>
                <Button onClick={handleSave}>儲存畫布</Button>
            </div>

            {/* 工具列：放在畫布上方 */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">縮放：</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale((prev) => Math.max(minScale, Math.round((prev - 0.1) * 10) / 10))}
                >
                    –
                </Button>
                <span className="text-sm w-10 text-center">{Math.round(scale * 100)}%</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScale((prev) => Math.min(2, Math.round((prev + 0.1) * 10) / 10))}
                >
                    +
                </Button>
            </div>

            <div
                ref={containerRef}
                className="relative overflow-auto border rounded-lg bg-white p-2 scrollbar-hide"
            >
                <canvas
                    ref={canvasRef}
                    width={canvasData?.canvasMeta?.width}
                    height={canvasData?.canvasMeta?.height}
                    style={{
                        width: `${(canvasData?.canvasMeta?.width || 800) * scale}px`,
                        height: `${(canvasData?.canvasMeta?.height || 600) * scale}px`,
                    }}
                    className="block"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
        </div>
    );
}
