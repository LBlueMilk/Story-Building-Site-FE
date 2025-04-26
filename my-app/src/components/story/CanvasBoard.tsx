'use client';

import { useEffect, useRef, useState } from 'react';
import { getCanvas, saveCanvas } from '@/services/canvas.client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
type Tool = 'pen' | 'eraser';

interface Props {
    storyId: number;
}

interface Stroke {
    points: { x: number; y: number }[];
    color: string;
    width: number;
    tool: 'pen' | 'eraser';
}

export default function CanvasBoard({ storyId }: Props) {
    const { token, isReady } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [canvasData, setCanvasData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lastModified, setLastModified] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [scale, setScale] = useState(1);

    const color = '#000000';
    const canvasWidth = 1920;
    const canvasHeight = 1080;

    const [tool, setTool] = useState<Tool>('pen');
    const [brushWidth, setBrushWidth] = useState(2);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);


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
        if (!isReady || !token) return;
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
    }, [storyId, token, isReady]);

    // 重繪畫布
    useEffect(() => {
        if (!canvasRef.current || !canvasData) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        (canvasData.strokes || []).forEach((stroke: Stroke) => {
            if (stroke.points.length < 2) return;
            if (stroke.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.color;
            }
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
            width: brushWidth,
            tool: tool,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // 避免在畫布外移動時觸發
        setMousePos(getMousePos(e));

        if (!isDrawing || !currentStroke || !canvasRef.current) return;
        const { x, y } = getMousePos(e);
        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, { x, y }],
        };
        setCurrentStroke(updatedStroke);

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            if (tool === 'pen') {
                ctx.globalCompositeOperation = 'source-over'; // 正常畫筆
                ctx.strokeStyle = updatedStroke.color;
            } else if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out'; // 擦除效果
                ctx.strokeStyle = 'rgba(0,0,0,1)'; // 可配合透明
            }
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

    // 清除畫布
    const handleClearCanvas = () => {
        const confirmClear = window.confirm('⚠️ 確定要清除整個畫布內容嗎？此操作無法還原。');
        if (!confirmClear) return;

        setCanvasData((prev: any) => ({
            ...prev,
            strokes: [],
        }));

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        }
    };


    /* 以下範圍是手機觸控事件處理 */
    const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) / scale;
        const y = (touch.clientY - rect.top) / scale;
        return { x, y };
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { x, y } = getTouchPos(e);
        setIsDrawing(true);
        setCurrentStroke({
            points: [{ x, y }],
            color,
            width: brushWidth,
            tool: tool,
        });
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing || !currentStroke || !canvasRef.current) return;
        const { x, y } = getTouchPos(e);
        const updatedStroke = {
            ...currentStroke,
            points: [...currentStroke.points, { x, y }],
        };
        setCurrentStroke(updatedStroke);

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            if (tool === 'pen') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = updatedStroke.color;
            } else {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            }
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

    const handleTouchEnd = () => {
        if (currentStroke && currentStroke.points.length > 1) {
            setCanvasData((prev: any) => ({
                ...prev,
                strokes: [...(prev?.strokes || []), currentStroke],
            }));
        }
        setIsDrawing(false);
        setCurrentStroke(null);
    };
    /* 以上範圍是手機觸控事件處理 */

    return (
        <div className="w-full h-[calc(100vh-100px)] flex flex-col overflow-hidden" ref={containerRef}>
            <div className="flex items-center justify-between p-2 border-b bg-white z-10 gap-4">
                {/* 左側：最後修改 */}
                <div className="text-sm text-gray-500 whitespace-nowrap">
                    🕒 最後修改：{lastModified || '無'}
                </div>

                {/* 中間：筆刷選擇 + 工具 + 清空 */}
                <div className="flex items-center gap-2 flex-wrap">
                    {tool === 'pen' || tool === 'eraser' ? (
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 whitespace-nowrap">
                                {tool === 'pen' ? '畫筆粗細' : '橡皮擦大小'}：
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={brushWidth}
                                onChange={(e) => setBrushWidth(Number(e.target.value))}
                            />
                            <span className="text-sm w-[32px] text-center">{brushWidth}</span>
                        </div>
                    ) : null}

                    <Button
                        variant={tool === 'pen' ? 'default' : 'outline'}
                        onClick={() => setTool('pen')}
                    >
                        ✏️ 畫筆
                    </Button>
                    <Button
                        variant={tool === 'eraser' ? 'default' : 'outline'}
                        onClick={() => setTool('eraser')}
                    >
                        🧽 橡皮擦
                    </Button>

                    <Button variant="destructive" onClick={handleClearCanvas}>
                        清空畫布
                    </Button>
                </div>

                {/* 右側：儲存 */}
                <div>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? '儲存中...' : '儲存畫布'}
                    </Button>
                </div>
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
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                        onMouseLeave={(e) => {
                            handleMouseUp();
                            setMousePos(null);
                        }}
                    />
                    {mousePos && (
                        <div
                            style={{
                                position: 'absolute',
                                top: mousePos.y - brushWidth / 2,
                                left: mousePos.x - brushWidth / 2,
                                width: brushWidth,
                                height: brushWidth,
                                borderRadius: '50%',
                                border: tool === 'eraser' ? '2px dashed #888' : '1px solid #333',
                                backgroundColor: tool === 'eraser' ? 'transparent' : 'rgba(0,0,0,0.1)',
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
