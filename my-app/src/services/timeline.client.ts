// src/services/timeline.client.ts
import api from './api'; //

export interface TimelineResponse {
    json: any;
    lastModified: string;
}

export async function getTimelineByStoryId(storyId: number): Promise<TimelineResponse> {
    const res = await api.get(`/timeline/${storyId}`);
    return res.data as TimelineResponse;
}

export async function saveTimelineByStoryId(storyId: number, json: any): Promise<void> {
    await api.post(`/timeline/${storyId}`, { json });
}
