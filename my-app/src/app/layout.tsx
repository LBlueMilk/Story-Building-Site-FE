import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "小說世界觀編輯平台｜角色設定・故事時間軸・手繪白板",
  description: "免費小說世界觀管理平台，提供角色設定、故事時間軸、手繪白板與多故事切換，讓創作者輕鬆打造奇幻世界。",
  keywords: ["小說世界觀", "角色設定", "故事編輯", "時間軸", "白板筆記", "創作工具"],
  authors: { name: "Story Building Site", url: "https://你的網站網址" },
  openGraph: {
    title: "小說世界觀編輯平台｜角色設定・故事時間軸・手繪白板",
    description: "輕鬆管理角色設定與世界觀，支援多故事、多時間線編輯，提供手繪白板筆記。",
    url: "https://你的網站網址",
    siteName: "Story Building Site",
    type: "website",
  },
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow", // 明確告訴搜尋引擎允許收錄
  themeColor: "#ffffff"
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-grow p-4 container mx-auto">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
