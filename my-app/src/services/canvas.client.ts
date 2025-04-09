// src/services/canvas.client.ts
import axios from '@/services/api';

export interface CanvasResponse {
    json: any;
    lastModified: string;
}

export async function getCanvas(storyId: number): Promise<CanvasResponse> {
    const res = await axios.get<CanvasResponse>(`/canvas/${storyId}`);
    return res.data;
}

export async function saveCanvas(storyId: number, json: any): Promise<{ message: string }> {
    const res = await axios.post<{ message: string }>(`/canvas/${storyId}`, { json });
    return res.data;
}
