import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ThemeProvider } from "../context/ThemeContext";
import { metadata } from "./metadata";
import { Toaster } from "sonner";
import { StoryProvider } from '../context/StoryContext';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export { metadata }; // 確保 metadata 正確匯出

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* ✅ Google Analytics 追蹤碼 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-60G40RSS3T"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-60G40RSS3T');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen bg-white text-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <StoryProvider>
              <Header />
              <main className="flex-grow p-4 container mx-auto">{children}</main>
              <Footer />
              <Toaster richColors />
            </StoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
