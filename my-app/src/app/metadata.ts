import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小說世界觀編輯平台｜角色設定・故事時間軸・手繪白板",
  description: "免費小說世界觀管理平台，提供角色設定、故事時間軸、手繪白板與多故事切換，讓創作者輕鬆打造奇幻世界。",
  keywords: ["小說世界觀", "角色設定", "故事編輯", "時間軸", "白板筆記", "創作工具"],
  authors: { name: "Story Building Site", url: "https://story-building-site-fe.vercel.app" },
  openGraph: {
    title: "小說世界觀編輯平台｜角色設定・故事時間軸・手繪白板",
    description: "輕鬆管理角色設定與世界觀，支援多故事、多時間線編輯，提供手繪白板筆記。",
    url: "https://story-building-site-fe.vercel.app",
    siteName: "Story Building Site",
    type: "website",
    images: [
      {
        url: "https://story-building-site-fe.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Story Building Site 預覽圖"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "小說世界觀編輯平台｜角色設定・故事時間軸・白板",
    description: "免費世界觀創作平台，讓你輕鬆打造角色與冒險地圖。",
    images: ["https://story-building-site-fe.vercel.app/og-image.png"]
  },
  robots: "index, follow"
};
