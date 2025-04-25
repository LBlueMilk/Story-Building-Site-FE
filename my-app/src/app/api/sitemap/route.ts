/**
 * 動態 Sitemap 產生器
 * - force-dynamic：禁止 Next.js build 時靜態化
 * - runtime = 'edge'：部署為 Edge Function，加速全球存取
 */
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 透過 next.config.js 的 rewrites → 自動轉向 Render API
    const res = await fetch('/api/story/public', { next: { revalidate: 60 } });

    if (!res.ok) throw new Error(`API status ${res.status}`);

    const stories: { publicId: string; updatedAt: string }[] = await res.json();

    const site = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://example.com';

    const urls = stories
      .map(({ publicId, updatedAt }) => {
        const lastmod = updatedAt.split('T')[0];
        return `<url><loc>${site}/story/${publicId}</loc><lastmod>${lastmod}</lastmod></url>`;
      })
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, s-maxage=86400', // Edge Cache 1 天
      },
    });
  } catch (err) {
    console.error('❌ Sitemap 生成失敗：', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
