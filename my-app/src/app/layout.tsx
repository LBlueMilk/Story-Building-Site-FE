import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Story Building Site",
  description: "建立小說世界觀的前端平台",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* ✅ 包裹全站 */}
          <Header /> {/* 🔽 放到全站最上方 */}
          <main>{children}</main> {/* 確保 children 在 header 下 */}
          <Footer /> {/* Footer 放到底部 */}
        </AuthProvider>
      </body>
    </html>
  );
}
