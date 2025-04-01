// 這個頁面會顯示故事的畫布和時間軸功能。
// /src/app/story/[id]/page.tsx

// 匯入 StoryWorkspace 元件，這是你顯示故事內容的主要畫面，包括畫布和時間軸
import StoryWorkspace from '@/components/story/StoryWorkspace';

// 這段是 Next.js App Router 的 SEO 功能：
// 當使用者進入 /story/[id] 頁面時，會自動設定該頁面的 HTML <title> 標籤。
// ✅ 注意：params 現在是 Promise，需要用 await 解包。
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `正在載入故事 #${id}`, 
  };
}

// 這是故事頁面的主入口，會根據網址中的 id 載入對應的故事內容。
// ✅ 注意：params 也是 Promise，需要 await 解包。
export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const storyId = Number(id);
  return <StoryWorkspace storyId={storyId} />;
}
