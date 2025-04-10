import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 呼叫 ASP.NET Core 提供的公開故事 API
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL + '/api/story/public';

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('無法取得資料');
    }

    const result = await response.json();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://你的網站網址';

    const urls = result
      .map((story: { publicId: string; updatedAt: string }) => {
        const lastmod = story.updatedAt.split('T')[0];
        return `
          <url>
            <loc>${baseUrl}/story/${story.publicId}</loc>
            <lastmod>${lastmod}</lastmod>
          </url>
        `;
      })
      .join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
      </urlset>
    `;

    return new NextResponse(sitemap.trim(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache 一天
      },
    });
  } catch (err) {
    console.error('Sitemap 生成錯誤:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
