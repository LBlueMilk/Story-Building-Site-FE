// src/services/story.client.ts
import type { StoryResponse } from '@/types/story';

export async function getStoryByIdClient(id: number, token: string): Promise<StoryResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/story/${id}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`取得故事失敗，狀態碼 ${res.status}`);
  }

  return res.json();
}
