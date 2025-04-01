// 允許訪客存取

{/*
export default async function PublicViewPage({ params }: { params: { id: string } }) {
    const storyId = Number(params.id);
    const story = await getStoryByIdWithoutToken(storyId); // 你需要設計這種不帶 Token 的 API
  
    if (!story || !story.isPublic) {
      return notFound();
    }
  
    return (
      <div className="prose mx-auto my-8">
        <h1>{story.title}</h1>
        <p>{story.description}</p>
      </div>
    );
  }
*/}
  