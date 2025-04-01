import { notFound } from 'next/navigation'
import { getStoryById } from '@/services/story'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '故事詳細資訊',
  description: '顯示指定故事的詳細內容與公開狀態',
}

interface StoryPageProps {
  params: { id: string }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const storyId = Number(params.id)

  if (isNaN(storyId)) {
    return notFound()
  }

  try {
    const story = await getStoryById(storyId)

    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">{story.title}</h1>

        <p className="text-gray-700 whitespace-pre-line mb-6">{story.description}</p>

        <div className="text-sm text-muted-foreground">
          <p>建立時間：{new Date(story.createdAt).toLocaleString()}</p>
          <p>{story.isPublic ? '🌍 公開故事，任何人可閱讀' : '🔒 非公開，僅限分享對象可見'}</p>
          {story.deletedAt && (
            <p className="text-red-500 font-medium mt-2">
              ⚠️ 此故事已於 {new Date(story.deletedAt).toLocaleString()} 被刪除
            </p>
          )}
        </div>

        {story.isPublic && (
          <div className="mt-6 p-4 border rounded bg-muted text-sm">
            <p className="mb-1">🔗 分享連結：</p>
            <pre className="truncate">
              {`${process.env.NEXT_PUBLIC_BASE_URL}/story/${story.id}`}
            </pre>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('❌ 無法取得故事：', error?.response?.data || error?.message || error)
    return notFound()
  }
}
