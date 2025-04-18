// src/services/story.server.ts
import { cookies } from 'next/headers';
import type { StoryResponse } from '@/types/story';

export async function getStoryById(id: number): Promise<StoryResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/story/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`取得故事失敗，狀態碼 ${res.status}`);
  }

  return res.json();
}
