'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function StoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  if (!token) {
    router.push('/');
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">故事管理</h1>

      {user?.stories.length === 0 ? (
        <div className="mb-4">目前尚未建立任何故事。</div>
      ) : (
        <ul className="mb-4">
          {user?.stories.map((story) => (
            <li key={story.id} className="flex justify-between items-center mb-2">
              <span>{story.title}</span>
              <Button variant="outline" onClick={() => router.push(`/story/${story.id}`)}>
                進入故事
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => router.push('/story/create')}>新增故事</Button>
    </div>
  );
}
