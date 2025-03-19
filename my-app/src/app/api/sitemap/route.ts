import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 查詢公開的故事資料
    const result = await pool.query(
      'SELECT public_id, updated_at FROM stories WHERE is_public = true'
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://你的網站網址';

    // 組成 XML
    const urls = result.rows
      .map((story: { public_id: string; updated_at: Date }) => {
        const lastmod = story.updated_at.toISOString().split('T')[0];
        return `
          <url>
            <loc>${baseUrl}/story/${story.public_id}</loc>
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
